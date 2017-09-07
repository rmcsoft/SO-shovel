(function () {
    let expat = require('node-expat'),
    fs = require('fs'),
    UserModel = require('../database/mongoose').UserModel,    
    log = require('../log')(module);

    let parser = new expat.Parser('UTF-8');

    let userToUserModel = function (user) {
        let userModel = new UserModel({
            id: user.Id,
            reputation: user.Reputation,
            creationDate: user.CreationDate,
            displayName: user.DisplayName,
            lastAccessDate: user.LastAccessDate,
            websiteUrl: user.WebsiteUrl,
            location: user.Location,
            aboutMe: user.AboutMe,
            views: user.Views,
            upVotes: user.UpVotes,
            downVotes: user.DownVotes,
            profileImageUrl: user.profileImageUrl,
            emailHash: user.EmailHash,
            accountId: user.AccountId,
            age: user.Age
        });
        return userModel;
    };

    parser.on('startElement', function (name, attrs) {

        let user = attrs;

        if (user) {
            let userModel = userToUserModel(user);

            UserModel.count({ 'id': userModel.id }, function (err, count) {
                if (!count) {
                    userModel.save(function (err) {
                        if (!err) {
                        } else {
                            log.error(err);
                        }
                    });
                }
            });
        }
    })

    module.exports = {
        load: function (filename) {
            log.info('Dump file will be loaded from ' + filename);
            return fs.createReadStream(filename).pipe(parser);
        }
    };
})();