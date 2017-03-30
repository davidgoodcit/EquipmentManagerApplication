var mongoose = require('mongoose');  

//outlining the schema for the equips db
var EquipSchema = mongoose.Schema({
	name: {
		type: String,
	},
	department: {
		type: String
	},
	prevInspect: {
		type: String
	},
	nextInspect: {
		type: String
	},
	currentLoc: {
		type: String
	},
	img_url: {
		type: String
	},
		code: {
		type: String
	}
});

//exporting the model
var Equip = module.exports = mongoose.model('Equip', EquipSchema);
