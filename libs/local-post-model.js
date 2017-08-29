(function () {
    let mongoose = require('mongoose');
    let Schema = mongoose.Schema;

    module.exports = new Schema({
        id: { type: Number, required: true, unique: true },
        body: { type: String, required: false },
        tags: { type: String, required: false }
    });
})();