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

//////////////////////////////////////////////////////////////////////////////////

// Variable declarations
const questions = [
	'Create a new habit.',
	'View existing habits.',
	'Edit a habit.',
	'Delete a habit.'
];

qPrompt = `Enter a number to get started:\n
1. ${questions[0]}
2. ${questions[1]}
3. ${questions[2]}
4. ${questions[3]}\n
Answer: `;

// Clear the console to start the application on a blank canvas.
console.clear();

// Prompt user to make a decision:

function greet () {
	let answer = rl.question(qPrompt);

	switch (parseInt(answer)) {
		case 1:
			return displayAnswer(0);
		case 2:
			return displayAnswer(1);
		case 3:
			return displayAnswer(2);
		case 4:
			return displayAnswer(3);
		default:
			// Remove the previous printed output, so only the error message shows.
			console.clear();
			console.log('\x1b[91m%s\x1b[0m', 'You must enter a valid number!');
			greet();
	}
}

function displayAnswer (index) {
	console.clear();
	stdout.write(qPrompt);
	console.log('\x1b[36m%s\x1b[0m', `${questions[index]}`);
}

greet();
