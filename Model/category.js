const mongoose = require('mongoose');
var categoryShema = mongoose.Schema({
    name: String,
    books_id: [{type: mongoose.Types.ObjectId}]
})
module.exports = mongoose.model('Category',categoryShema);