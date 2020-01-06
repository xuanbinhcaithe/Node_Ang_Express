var mongoose = require('mongoose');

var bookShcema = mongoose.Schema({
    name:String,
    image: String,
    file: String
});
module.exports = mongoose.model('Book',bookShcema);