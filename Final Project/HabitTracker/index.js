// Libraries
const stdin = process.stdin;
const stdout = process.stdout;
const stderr = process.stderr;
const rl = require('readline-sync');

const { Habit } = require('./model');
const mongoose = require('mongoose');

// Connect to local mongoDB database
mongoose.connect('mongodb://localhost:27017/HabitTracker', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});

// Establish a database connection using Mongoose.
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('');
});

// Prompt user for what they would like to do:
// Create a new habit
// Read a habit
// Update a habit
// Delete a habit

// Prompt user:

const questions = [
	'Create a new habit.',
	'View existing habits.',
	'Edit a habit.',
	'Delete a habit.'
];

const greet = rl.question(`Select an option to get started:\n
1. ${questions[0]}
2. ${questions[1]}
3. ${questions[2]}
4. ${questions[3]}\n
Answer: `);
