var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Nutrient = new Schema({
    name: String,
    threshold: Number
});

module.exports = mongoose.model('Nutrient', Nutrient);
