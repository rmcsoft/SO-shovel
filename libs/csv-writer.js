(function () {
    let PostModel = require('./mongoose').PostModel,
        fs = require('fs'),
        log = require('./log')(module),
        config = require('./config');

    const SEPARATOR = config.get('separator') ? config.get('separator') : ';';

    let soValuePreprocessor = function (property, value) {
        if (property === 'tags') {
            value = value.replace(new RegExp('><', 'g'), ',')
                .replace(new RegExp('<', 'g'), '')
                .replace(new RegExp('>', 'g'), '');
        }
        return value;
    }

    module.exports = {
        write: function (filepath, streamItems, localStreamItems) {

            if (fs.existsSync(filepath)) {
                log.warn(filepath + ' is going to be deleted to create new dump file');
                fs.unlinkSync(filepath);
            }

            let normalizedDumpFile = fs.createWriteStream(filepath, { flags: 'a' }), rowCount = 0, isFirstItem = true;

            log.info('Stackoverflow dump will be written in ' + filepath);

            let appendCsvRow = function (row) {
                normalizedDumpFile.write(row + '\r\n');
            }

            let questionEnricher = function (document) {
                let cursor = PostModel
                    .find({ 'parentId': { '$eq': document.id } })
                    .find({ 'postTypeId': { '$eq': 2 } })
                    .select({ '_id': 0, 'id': 1, 'body': 1, 'tags': 1 })
                    .cursor();
                let idx = 0;
                cursor.on('data', function (answer) {
                    idx++;
                    document['answer' + idx] = answer._doc.body;
                });
                return cursor;
            }

            let writeStreamIntoCsvFile = function (stream, valuePreprocessor, rowEnricher) {
                stream.on('data', function (item) {

                    let document = item._doc;
                    let csvHeader = '';
                    if (isFirstItem) {
                        let properies = Object.keys(item._doc);
                        for (let i = 0; i < properies.length; i++) {
                            if (i) {
                                csvHeader = csvHeader + SEPARATOR;
                            }
                            let property = properies[i];
                            csvHeader = csvHeader + property;
                        }
                        appendCsvRow(csvHeader);
                    }
                    isFirstItem = false;

                    let row = '';

                    let appendHandler = function () {
                        Object.keys(document).forEach(function (key, index) {
                            let value = document[key];
                            if (valuePreprocessor) {
                                value = valuePreprocessor(key, value);
                            }
                            // escape double quotes
                            if (typeof value === 'string') {
                                value = value.replace(new RegExp('"', 'g'), '""');
                            }
    
                            if (index) {
                                row = row + SEPARATOR;
                            }
                            // wrap value in double quotes
                            row = row + '"' + value + '"';
                        });
                        appendCsvRow(row);
                        rowCount++; 
                    }

                    if (rowEnricher) {
                        rowEnricher(document).on('close', function () {
                            appendHandler();
                        });
                    }
                    else {
                        appendHandler();
                    }
                }).on('error', function (err) {
                    log.info(err);
                }).on('close', function () {
                    log.info('Normalized dump was successfully written to ' + filepath);
                    log.info('Written ' + rowCount + ' lines');
                });
            }
            writeStreamIntoCsvFile(streamItems, soValuePreprocessor, questionEnricher);
            writeStreamIntoCsvFile(localStreamItems);
        }
    }
})();