(function () {
    
    let mongoose = require('mongoose');
    let Schema = mongoose.Schema;

    module.exports = new Schema({
        id: { type: Number, required: true, unique: true },
        postTypeId: { type: Number, required: true },
        acceptedAnswerId: { type: Number, required: false },
        parentId: { type: Number, required: false },
        creationDate: { type: String, required: true },
        score: { type: Number, required: false },
        viewCount: { type: Number, required: false },
        body: { type: String, required: false },
        ownerUserId: { type: Number, required: false },
        ownerDisplayName: { type: String, required: false },
        lastEditorUserId: { type: Number, required: false },
        lastEditorDisplayName: { type: String, required: false },
        lastEditDate: { type: String, required: false },
        lastActivityDate: { type: String, required: false },
        title: { type: String, required: false },
        tags: { type: String, required: false },
        answerCount: { type: Number, required: false },
        commentCount: { type: Number, required: false },
        favoriteCount: { type: Number, required: false },
        closedDate: { type: String, required: false },
        communityOwnedDate: { type: String, required: false },

        postType: { type: String, required: false }
    });
})();