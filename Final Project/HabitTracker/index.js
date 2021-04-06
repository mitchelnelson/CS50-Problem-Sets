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

// const blinker = '\033[31;1;4mOption\033[m';
const underliner = '\033[1;4mType a selection from below to get started:\033[m';

// Greeting prompt
qPrompt = `${underliner}\n
1. ${questions[0]}
2. ${questions[1]}
3. ${questions[2]}
4. ${questions[3]}
q. Exit app.\n`;

// Clear the console to start the application on a blank canvas.
console.clear();

// Prompt user to make a decision:

function greet () {
	let answer = rl.keyIn(qPrompt);

	if (answer.toLowerCase() === 'q') {
		answer = '5';
	}

	switch (parseInt(answer)) {
		case 1:
		case 2:
		case 3:
		case 4:
			return newMenu(answer);
		case 5:
			return goodbye();
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
		case 2:
			readHabits();
	}
}

async function createHabit () {
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

async function readHabits () {
	let results = await Habit.find();
	for (let i = 0; i < results.length; i++) {
		console.log(results[i]['name']);
	}
}

function goodbye () {
	console.clear();
	console.log(qPrompt);
	stdout.write('Goodbye!');
	setTimeout(() => {
		process.exit();
	}, 1000);
}

greet();
