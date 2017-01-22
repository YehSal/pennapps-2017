var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Disease = new Schema({
    name: String,
    nutrients_to_avoid: [{type: mongoose.Schema.Types.ObjectId, ref: 'Nutrient'}]
});

Disease.plugin(passportLocalMongoose);

module.exports = mongoose.model('Disease', Disease);
