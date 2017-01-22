var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Disease = new Schema({
    name: String,
    nutrients_to_avoid: [{type: mongoose.Schema.Types.ObjectId, ref: 'Nutrient'}]
});

module.exports = mongoose.model('Disease', Disease);
