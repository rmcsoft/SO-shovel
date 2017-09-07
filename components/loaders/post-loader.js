(function () {
    let expat = require('node-expat'),
    fs = require('fs'),
    PostModel = require('../database/mongoose').PostModel,    
    log = require('../log')(module);

    let parser = new expat.Parser('UTF-8');

    let POST_TYPES = require('../post-types');

    let postToPostModel = function (post) {
        let postModel = new PostModel({
            id: post.Id,
            postTypeId: post.PostTypeId,
            acceptedAnswerId: post.AcceptedAnswerId,
            parentId: post.ParentId,
            creationDate: post.CreationDate,
            score: post.Score,
            viewCount: post.ViewCount,
            body: post.Body,
            ownerUserId: post.OwnerUserId,
            ownerDisplayName: post.OwnerDisplayName,
            lastEditorUserId: post.LastEditorUserId,
            lastEditorDisplayName: post.LastEditorDisplayName,
            lastEditDate: post.LastEditDate,
            lastActivityDate: post.LastActivityDate,
            title: post.Title,
            tags: post.Tags,
            answerCount: post.AnswerCount,
            commentCount: post.CommentCount,
            favoriteCount: post.FavoriteCount,
            closedDate: post.ClosedDate,
            communityOwnedDate: post.CommunityOwnedDate,
            postType: post.type
        });
        return postModel;
    };

    parser.on('startElement', function (name, attrs) {

        let post = attrs;

        if (post && post.PostTypeId) {
            post.type = POST_TYPES[post.PostTypeId];
            let postModel = postToPostModel(post);

            PostModel.count({ 'id': postModel.id }, function (err, count) {
                if (!count) {
                    postModel.save(function (err) {
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