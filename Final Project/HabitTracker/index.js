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

const underliner = '\033[1;4mType a selection from below to get started:\033[m';

// Greeting prompt
qPrompt = `${underliner}\n
1. ${questions[0]}
2. ${questions[1]}
3. ${questions[2]}
4. ${questions[3]}
q. Exit app.\n`;

// Prompt user to make a decision:

function greet () {
	clearConsoleAndScrollBuffer();
	let answer = rl.keyIn(qPrompt, { limit: ['1', '2', '3', '4', 'q'] });

	switch (answer) {
		case '1':
			clearConsoleAndScrollBuffer();
			return createHabits(answer);
		case '2':
			clearConsoleAndScrollBuffer();
			return readHabits(answer);
		case '3':
			clearConsoleAndScrollBuffer();
			return updateHabits(answer);
		// case '4':
		case 'q':
			return goodbye();
	}
}

async function createHabits (option) {
	displayAnswer(option);

	let confirm = rl.keyIn(
		' (Press \u001b[1my\033[m to create a habit, or \u001b[1;4mspacebar\033[m to go back.)\n',
		{
			defaultInput: '',
			limit: ['y', 'Y', ' '],
			hideEchoBack: true,
			mask: ''
		}
	);

	if (confirm === 'y') {
		let entry = rl.question('Enter habit: ');
		const newHabit = new Habit({
			name: entry,
			startDate: Date.now(),
			currentStreak: 0
		});
		await newHabit.save().then(() => {
			stdout.write(`Habit added!`);
			return spacebarMainMenu();
		});
	}
	else return greet();
}

async function readHabits (option) {
	displayAnswer(option);
	stdout.write(' (Hit \u001b[1;4mspacebar\033[m to go back)\n');

	let results = await Habit.find();

	logHabitData(results);
	return spacebarMainMenu();
}

async function updateHabits (option) {}

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
	stdout.write('\033[0;31m' + questions[a - 1] + '\033[m');
	return;
}

function spacebarMainMenu () {
	let mainMenu = rl.keyIn('', { limit: ' ' });
	if (mainMenu) return greet();
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
