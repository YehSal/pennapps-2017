var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Nutrient = new Schema({
    name: String,
    threshold: Number
});

var Disease = new Schema({
    name: String,
    //nutrients_to_avoid: [{type: mongoose.Schema.Types.ObjectId, ref: 'Nutrient'}]
    nutrients_to_avoid: [Nutrient]
});


module.exports = mongoose.model('Disease', Disease);
