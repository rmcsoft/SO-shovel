(function () {
    let PostModel = require('./database/mongoose').PostModel,
        UserModel = require('./database/mongoose').UserModel,
        archiver = require('archiver'),
        fs = require('fs'),
        log = require('./log')(module),
        config = require('./config'),
        path = require('path');

    const SEPARATOR = config.get('separator') ? config.get('separator') : ';';

    let answersScoreThreshold = config.get('filters:answers:scoreThreshold'),
        answersFavoriteCount = config.get('filters:answers:favoriteCount'),
        answersUserReputation = config.get('filters:answers:userReputation'),
        questionsUserReputation = config.get('filters:questions:userReputation'),
        fields = config.get('fields');

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

            let userEnricher = function (document) {
                return new Promise((resolve, reject) => {
                    UserModel.findOne({
                        'id': document.ownerUserId
                    }, function (err, user) {
                        if (err) {
                            reject(err);
                        }
                        if (user && user.reputation) {
                            document.ownerUserReputation = user.reputation;
                        }
                        resolve(user._doc);
                    });
                });
            }

            let filterQuestionByOwnerUserReputation = function (question) {
                return question.ownerUserReputation > questionsUserReputation;
            }

            let questionEnricher = function (document) {
                return new Promise((resolve, reject) => {
                    let answerQuery = PostModel
                        .find({ 'parentId': { '$eq': document.id } })
                        .find({ 'postTypeId': { '$eq': 2 } });

                    if (answersScoreThreshold) {
                        let scoreSearch = {
                            'score': { $gt: answersScoreThreshold }
                        };
                        answerQuery.find(scoreSearch);
                    }

                    if (answersFavoriteCount) {
                        let answersFavoriteCountSearch = {
                            'favoriteCount': { $gt: answersFavoriteCount }
                        };
                        answerQuery.find(answersFavoriteCountSearch);
                    }

                    let cursor = answerQuery
                            .select({ '_id': 0, 'id': 1, 'body': 1, 'tags': 1 })
                            .cursor();
                    let idx = 0;
                    cursor.on('data', function (answer) {
                        idx++;
                        document['answer' + idx] = answer._doc.body;
                    });
                    cursor.on('close', function () {
                        resolve(cursor);
                    });
                });
            }

            let writeStreamIntoCsvFile = function (stream, valuePreprocessor, enrichers, filters) {
                return new Promise((resolve, reject) => {

                    stream.on('data', function (item) {

                        let document = item._doc;

                        // apply all the enrichers
                        // each of the encrichers returns promise
                        // on all promises completed the document can be written to the file
                        Promise.all(enrichers.map(callback => callback(document))).then(function (results) {

                            let isAdded = true;

                            filters.map(filter => isAdded = filter(document));

                            if (isAdded) {

                                let appendHandler = function () {

                                    let theRestOfTheFields = Object.keys(document).filter(property => fields.indexOf(property) == -1 && property.startsWith('answer'));

                                    fields.concat(theRestOfTheFields.sort()).forEach(function (key, index) {
                                        let value = document[key];
    
                                        if (!value) {
                                            value = '';
                                        }
    
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

                                let row = '';
                                appendHandler();
                            }

                        }).catch(function () {

                        });

                    }).on('error', function (err) {
                        reject(err);
                    }).on('close', function () {
                        resolve('Normalized dump was successfully written to ' + filepath + '.\r\n' + 'Written ' + rowCount + ' lines');
                    });
                });
            }
            return Promise.all([writeStreamIntoCsvFile(streamItems, soValuePreprocessor, [userEnricher, questionEnricher], [filterQuestionByOwnerUserReputation]),       writeStreamIntoCsvFile(localStreamItems)])
                .then(function (result) {
                    return new Promise((resolve, reject) => {

                        let output = fs.createWriteStream(filepath.replace('.csv', '.zip'));
                        let archive = archiver('zip', {
                            'zlib': { level: 9 }
                        });
                        archive.pipe(output);
                        archive.append(fs.createReadStream(filepath), { name: path.basename(filepath) });
                        archive.finalize();

                        resolve('CSV file with SO normalized data successfully written in ' + filepath);
                    });
                })
                .catch(function (err) {
                    return new Promise((resolve, reject) => { reject(err) });
                });
        }
    }
})();