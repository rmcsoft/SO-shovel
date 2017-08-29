(function () {
    let mongoose = require('mongoose'),
    log = require('./log')(module),
    config = require('./config');

    let postSchema = require('./post-schema'),
    localPostSchema = require('./local-post-model'),
    PostModel = mongoose.model('Post', postSchema),
    LocalPostModel = mongoose.model('LocalPost', localPostSchema);

    // mongoose.set('debug', true);
    mongoose.Promise = global.Promise;

    let dbPromise = mongoose.connect(config.get('mongoose:uri'), {
        useMongoClient: true
    });

    dbPromise.then(function (db) {
        db.on('error', function (err) {
            log.error('connection error:', err.message);
        });

        db.once('open', function callback() {
            log.info('Connected to DB');
        });
    });

    module.exports.LocalPostModel = LocalPostModel;
    module.exports.PostModel = PostModel;
})();