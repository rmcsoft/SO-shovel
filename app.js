(function () {
    let config = require('./libs/config'),
        express = require('express'),
        path = require('path'),
        morgan = require('morgan'),
        fs = require('fs'),
        bodyParser = require('body-parser'),

        PostModel = require('./libs/mongoose').PostModel,
        LocalPostModel = require('./libs/mongoose').LocalPostModel,
        log = require('./libs/log')(module),
        postLoader = require('./libs/post-loader'),
        csvWriter = require('./libs/csv-writer');

    let IMPORT_INFO_PATH = './import-info.properties';

    let app = express();

    let scoreThreshold = config.get('scoreThreshold'),
        dumpFilename = config.get('dumpFilepath'),
        normalizedDumpFilepath = config.get('normalizedDumpFilepath'),
        tags = config.get('tags');

    let getNormalizedDump = function () {

        let searchByTags = {},
            searchTags = '';

        for (let i = 0; i < tags.length; i++) {
            if (i) {
                searchTags = searchTags + '|';
            }
            searchTags = searchTags + tags[i];
        }

        if (searchTags) {
            searchByTags = { 'tags': { '$regex': '.*' + searchTags + '.*' } };
        };

        let scoreSearch = {
            'score': { $gt: scoreThreshold }
        };

        return PostModel
            .find({ 'score': { '$gt': 0 } })
            .find({ 'postTypeId': { '$eq': 1 } })
            .find(scoreSearch)
            .find(searchByTags)
            .select({ '_id': 0, 'id': 1, 'body': 1, 'tags': 1 })
            .cursor();
    }

    let getLocalPosts = function () {
        return LocalPostModel
            .find()
            .select({ '_id': 0, 'id': 1, 'body': 1, 'tags': 1 })
            .cursor();
    }

    let getDumpFileInfo = function () {
        let stats = fs.statSync(dumpFilename);

        let fileStats = {
            'mtime': stats.mtime,
            'size': stats.size
        };
        return fileStats.mtime + fileStats.size;
    }

    let saveDumpFileInfo = function () {
        let fileStats = getDumpFileInfo();
        let importInfoFile = fs.createWriteStream(IMPORT_INFO_PATH, { flags: 'w' });
        importInfoFile.write(fileStats);
    }

    let isDumpNeedToBeUpdated = function () {
        if (fs.existsSync(IMPORT_INFO_PATH)) {
            let oldFileStats = fs.readFileSync(IMPORT_INFO_PATH, 'utf8');
            let newFileStats = getDumpFileInfo();
            let isNeedToBeUpdated = oldFileStats !== newFileStats;
            if (isNeedToBeUpdated) {
                log.info('Dump file will be loaded and database will be updated.');
            }
            else {
                log.info('Dump file and database are up-to-date.');
            }
            return isNeedToBeUpdated;
        }
        else {
            return true;
        }
    }

    let normalizedDump;

    let writeCsvFile = function () {
        let soDumpStream = getNormalizedDump();
        let localStream = getLocalPosts();
        csvWriter.write(normalizedDumpFilepath, soDumpStream, localStream);
    }

    let updateDump = function () {
        if (dumpFilename && fs.existsSync(dumpFilename) && isDumpNeedToBeUpdated()) {
            stream = postLoader.load(dumpFilename);
            stream.on('end', function () {
                saveDumpFileInfo();       
            });
        }
    }

    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, "public")));
    app.use('/bower_components',  express.static(__dirname + '/bower_components'));

    app.get('/api', function (req, res) {
        res.send('API is running');
    });

    app.get('/api/update-dump', function (req, res) {
        updateDump();
        res.send('Dump will be written');
    });

    app.get('/api/write-csv', function (req, res) {
        writeCsvFile();
        res.send('Csv will be written');
    });

    app.post('/api/posts', function (req, res) {

        let post = new LocalPostModel({
            id: req.body.id,
            body: req.body.body,
            tags: req.body.tags
        });

        post.save(function (err) {
            if (!err) {
                log.info('Post created');
                return res.send({ status: 'OK', post: post });
            } else {
                if (err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
                log.error('Internal error(%d): %s', res.statusCode, err.message);
            }
        });

    });

    app.use(function (req, res, next) {
        res.status(404);
        log.debug('Not found URL: %s', req.url);
        res.send({ error: 'Not found' });
        return;
    });

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        log.error('Internal error(%d): %s', res.statusCode, err.message);
        res.send({ error: err.message });
        return;
    });


    app.listen(config.get('port'), function () {
        log.info('Express server listening on port 1337');
    });
})();