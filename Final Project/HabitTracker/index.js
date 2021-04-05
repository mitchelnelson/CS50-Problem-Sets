// Libraries
const stdin = process.stdin;
const stdout = process.stdout;
const stderr = process.stderr;

const rl = require('readline-sync');

const keypress = require('keypress');
keypress(stdin);

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

// Greeting prompt
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
	answer = rl.keyIn(qPrompt);

	switch (parseInt(answer)) {
		case 1:
		case 2:
		case 3:
		case 4:
			return newMenu(answer);
		default:
			// Remove the previous printed output, so only the error message shows.
			console.clear();
			console.log('\x1b[91mYou must enter a valid number!\x1b[0m');
			greet();
	}
}

function newMenu (answer) {
	console.clear();
	displayAnswer(answer);
	executeOption(answer);
}

function displayAnswer (a) {
	stdout.write('\033[0;34m' + questions[a - 1] + '\033[m\n');
}

function executeOption (opt) {
	switch (parseInt(opt)) {
		case 1:
			createHabit();
	}
}

async function createHabit () {
	let entry = rl.question('Enter habit: ');

	if (entry) {
		const newHabit = new Habit({
			name: entry,
			startDate: Date.now(),
			currentStreak: 0
		});
		await newHabit.save().then(() => {
			console.clear();
			console.log(`Habit added! (${newHabit.name})`);
			console.log('Click \033[1;33mbackspace\033[m to go to main menu.');
		});
		process.stdin.on('keypress', function (ch, key) {
			if (key && key.name == 'backspace') {
				console.clear();
				greet();
			}
		});

		process.stdin.setRawMode(true);
		process.stdin.resume();
	}
	return;
}
greet();
