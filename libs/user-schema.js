(function () {
    
    let mongoose = require('mongoose');
    let Schema = mongoose.Schema;

    module.exports = new Schema({
        id: { type: Number, required: false},
        reputation: { type: Number, required: false },
        creationDate: { type: String, required: false },
        displayName: { type: String, required: false },
        lastAccessDate: { type: String, required: false },
        websiteUrl: { type: String, required: false },
        location: { type: String, required: false },
        aboutMe: { type: String, required: false },
        views: { type: Number, required: false },
        upVotes: { type: Number, required: false },
        downVotes: { type: Number, required: false },
        profileImageUrl: { type: String, required: false },
        emailHash: { type: String, required: false },
        accountId: { type: Number, required: false },
        age: { type: Number, required: false }
    });
})();