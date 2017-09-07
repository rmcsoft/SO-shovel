(function () {
    let config = require('./components/config'),
        express = require('express'),
        path = require('path'),
        morgan = require('morgan'),
        fs = require('fs'),
        bodyParser = require('body-parser'),

        PostModel = require('./components/database/mongoose').PostModel,
        LocalPostModel = require('./components/database/mongoose').LocalPostModel,
        log = require('./components/log')(module),
        postLoader = require('./components/loaders/post-loader'),
        usersLoader = require('./components/loaders/user-loader'),
        csvWriter = require('./components/csv-writer');

    let IMPORT_INFO_PATH = './import-info.properties';

    let app = express();

    let questionsScoreThreshold = config.get('filters:questions:scoreThreshold'),
        questionsFavoriteCount = config.get('filters:questions:favoriteCount'),
        questionsUserReputation = config.get('filters:questions:userReputation');
        questionsTags = config.get('filters:questions:tags'),
        dumpFilename = config.get('dumpFilepath'),
        usersDumpFilepath = config.get('usersDumpFilepath'),
        normalizedDumpFilepath = config.get('normalizedDumpFilepath'),
        answersScoreThreshold = config.get('filters:answers:scoreThreshold'),
        answersFavoriteCount = config.get('filters:answers:favoriteCount'),
        answersUserReputation = config.get('filters:answers:userReputation');

    let getNormalizedDump = function () {

        let searchByTags = {},
            searchTags = '';

        for (let i = 0; i < questionsTags.length; i++) {
            if (i) {
                searchTags = searchTags + '|';
            }
            searchTags = searchTags + questionsTags[i];
        }

        if (searchTags) {
            searchByTags = { 'tags': { '$regex': '.*' + searchTags + '.*' } };
        };

        let scoreSearch = {
            'score': { $gt: questionsScoreThreshold }
        };

        return PostModel
            .find({ 'score': { '$gt': 0 } })
            .find({ 'postTypeId': { '$eq': 1 } })
            .find(scoreSearch)
            .find(searchByTags)
            .select({ '_id': 0, 'id': 1, 'body': 1, 'tags': 1, 'ownerUserId': 1 })
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
        return stats;
    }

    let saveDumpFileInfo = function () {
        let fileStats = getDumpFileInfo();
        let importInfoFile = fs.createWriteStream(IMPORT_INFO_PATH, { flags: 'w' });
        importInfoFile.write(JSON.stringify(fileStats));
    }

    let getDumpFileStats = function () {
        let fileStats = JSON.parse(fs.readFileSync(IMPORT_INFO_PATH, 'utf8'));
        fileStats.mtime = new Date(fileStats.mtime);
        return fileStats;
    }

    let isDumpStatsEqual = function (oldFileStats, newFileStats) {
        return oldFileStats.mtime.getTime() === newFileStats.mtime.getTime() &&
            oldFileStats.size === newFileStats.size;
    }

    let isDumpNeedToBeUpdated = function () {
        if (fs.existsSync(IMPORT_INFO_PATH)) {
            let oldFileStats = getDumpFileStats();
            let newFileStats = getDumpFileInfo();
            let isNeedToBeUpdated = !isDumpStatsEqual(oldFileStats, newFileStats);
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
        return csvWriter.write(normalizedDumpFilepath, soDumpStream, localStream);
    }

    let updateDump = function () {
        if (dumpFilename && fs.existsSync(dumpFilename) && isDumpNeedToBeUpdated()) {
            stream = postLoader.load(dumpFilename);
            stream.on('end', function () {
                saveDumpFileInfo();
            });
        }
    }

    let updateUsersDump = function () {
        return new Promise((resolve, reject) => {
            if (usersDumpFilepath && fs.existsSync(usersDumpFilepath)) {
                let stream = usersLoader.load(usersDumpFilepath);
                stream.on('end', function () {
                    resolve('Users were successfully updated');
                });
            }
            else {
                resolve('Users will not be updated');
            }
        })
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

    app.get('/api/users/update', function (req, res) {
        updateUsersDump().then(function (response) {
            res.send('Users dump successfully updated');
        });
    });

    app.get('/api/dump/installed', function (req, res) {
        res.send(getDumpFileStats());
    });

    app.get('/api/config', function (req, res) {
        let conf = config.get();
        delete conf['$0'];
        delete conf['_'];
        res.send(conf);
    });

    app.get('/api/write-csv', function (req, res) {
        writeCsvFile().then(result => {
            res.send(result);
        })
        .catch(err => {
            res.statusCode = 500;
            res.send(err);
        });
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