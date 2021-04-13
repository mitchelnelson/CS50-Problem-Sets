const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
const habitSchema = new Schema({
	name: String,
	startDate: String,
	daysSinceStart: Number,
	currentStreak: Number,
	checkedInToday: Boolean
});

// Define Model
const Habit = mongoose.model('Habit', habitSchema);

// Export Model
module.exports = { Habit };
