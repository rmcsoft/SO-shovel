(function () {
    let mongoose = require('mongoose'),
    log = require('../log')(module),
    config = require('../config');

    let userSchema = require('./schemas/user-schema'),
    postSchema = require('./schemas/post-schema'),
    localPostSchema = require('./schemas/local-post-schema'),
    LocalPostModel = mongoose.model('LocalPost', localPostSchema),
    UserModel = mongoose.model('User', userSchema),
    PostModel = mongoose.model('Post', postSchema);

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
    module.exports.UserModel = UserModel;
})();