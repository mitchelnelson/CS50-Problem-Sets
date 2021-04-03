const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
const habitSchema = new Schema({
	name: String,
	startDate: Date,
	currentStreak: Number
});

// Define Model
const Habit = mongoose.model('Habit', habitSchema);

// Export Model
module.exports = { Habit };
