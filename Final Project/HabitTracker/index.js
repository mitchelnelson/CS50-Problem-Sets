// Libraries
const stdin = process.stdin;
const stdout = process.stdout;
const stderr = process.stderr;
const util = require('util');

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

const underliner = '\033[1;4mType a selection from below to get started:\033[m';

// Greeting prompt
qPrompt = `${underliner}\n
1. ${questions[0]}
2. ${questions[1]}
3. ${questions[2]}
4. ${questions[3]}
q. Exit app.\n`;

// Toggler for if user has viewed habits already to prevent duplication
let isViewed = false;

// Prompt user to make a decision:

function greet () {
	clearConsoleAndScrollBuffer();
	let answer = rl.keyIn(qPrompt);

	if (answer.toLowerCase() === 'q') {
		answer = '5';
	}

	switch (parseInt(answer)) {
		case 1:
			clearConsoleAndScrollBuffer();
			return createHabit(answer);
		case 2:
			clearConsoleAndScrollBuffer();
			return readHabits(answer);
		// case 3:
		// case 4:
		case 5:
			return goodbye();
		default:
			// Remove the previous printed output, so only the error message shows.
			console.clear();
			console.log('\x1b[91mYou must enter a valid number!\x1b[0m');
			greet();
	}
	return;
}

async function createHabit (option) {
	displayAnswer(option);

	let entry = rl.question('Enter habit: ');

	if (entry == '') {
		console.clear();
		return greet();
	}
	else if (entry) {
		const newHabit = new Habit({
			name: entry,
			startDate: Date.now(),
			currentStreak: 0
		});
		await newHabit.save().then(() => {
			console.clear();
			console.log(`Habit added! (${newHabit.name})`);
			// console.log('Click \033[1;33mbackspace\033[m to go to main menu.');
		});
	}
	return mainMenu();
}

async function readHabits (option) {
	displayAnswer(option);
	let results = await Habit.find();

	logHabitData(results);

	return mainMenu();
}

function logHabitData (results) {
	for (let i = 0; i < results.length; i++) {
		console.log('\033[34mHabit: \033[m' + results[i]['name']);
		console.log('\033[33mStart Date: \033[m' + results[i]['startDate']);
		console.log(
			'\033[35mCurrent Streak: \033[m' +
				results[i]['currentStreak'] +
				'\n'
		);
	}
	return;
}

function displayAnswer (a) {
	console.clear();
	console.log('\033[0;34m' + questions[a - 1] + '\033[m');
	return;
}

function mainMenu () {
	let backButton = rl.keyIn('Hit b to go back', { limit: 'b' });

	if (backButton) {
		console.clear();
		return greet();
	}
}

function goodbye () {
	console.clear();
	console.log(qPrompt);
	stdout.write('Goodbye!');
	setTimeout(() => {
		return process.exit();
	}, 1000);
}

function clearConsoleAndScrollBuffer () {
	process.stdout.write('\u001b[3J\u001b[1J');
	console.clear();
}

greet();
