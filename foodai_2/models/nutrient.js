var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Nutrient = new Schema({
    name: String,
    threshold: Number
});

Nutrient.plugin(passportLocalMongoose);

module.exports = mongoose.model('Nutrient', Nutrient);
