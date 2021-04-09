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

const underliner =
	'\033[1;4;93mType a selection from below to get started:\033[m';

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

// MAIN FUNCTIONS

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

	if (confirm === 'y' || confirm === 'Y') {
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

async function updateHabits (option) {
	displayAnswer(option);

	let confirm = rl.keyIn(
		' (Press \u001b[1me\033[m to edit a habit, or \u001b[1;4mspacebar\033[m to go back.)',
		{
			defaultInput: '',
			limit: ['e', 'E', ' '],
			hideEchoBack: true,
			mask: ''
		}
	);

	const habitArray = [];
	const indexArray = [];

	if (confirm === 'e' || confirm === 'E') {
		clearConsoleAndScrollBuffer();
		displayAnswer(3);
		console.log('');
		let data = await Habit.find();
		addToArray(data, habitArray, indexArray);

		console.log('\u001b[1mWhich habit?\033[m');
		let chosenHabit = rl.keyInSelect(habitArray, '', {
			hideEchoBack: true,
			mask: ''
		});

		if (chosenHabit === -1) {
			return greet();
		}
		else {
			return openHabitEditor(habitArray[chosenHabit]);
		}
	}
	if (confirm === ' ') return greet();
}

async function deleteHabits () {
	// TODO
}

// R

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

// U

function addToArray (data, arr, iArr) {
	for (let i = 0; i < data.length; i++) {
		arr.push(data[i]['name']);
		iArr.push(i + 1);
	}
	return;
}

async function openHabitEditor (habit) {
	clearConsoleAndScrollBuffer();
	console.log('\033[0;92m%s\n', questions[2]);
	let results = await Habit.find({ name: `${habit}` });

	console.log('\033[34mHabit: \033[m' + results[0]['name']);
	console.log('\033[33mStart Date: \033[m' + results[0]['startDate']);

	let editField = rl.keyInSelect(
		['Edit Habit', 'Edit Start Date', 'Edit All'],
		''
	);
	console.log(editField);

	switch (editField) {
		case -1:
			return returnToEdit();
		case 0:
			habitNameChanger(results);
			break;
		case 1:
			habitDateChanger(results);
			break;
		// Do regex
	}
}

async function habitNameChanger (data) {
	clearConsoleAndScrollBuffer();
	console.log('\033[0;92m' + questions[2] + '\n');

	let escapedQuery =
		'\033[34mHabit\033[m ' +
		'(previously was: \u001b[1m' +
		data[0]['name'] +
		'\033[m): ';
	let editedHabit = rl.question(escapedQuery);

	await Habit.findOneAndUpdate(
		{ name: data[0]['name'] },
		{ name: editedHabit }
	);

	console.log('Habit name edited!');
	setTimeout(() => {
		return returnToEdit();
	}, 1000);
}

async function habitDateChanger (data) {
	clearConsoleAndScrollBuffer();
	console.log('\033[0;92m' + questions[2] + '\n');
	console.log('\033[34mHabit: \033[m' + data[0]['name']);

	let editedHabit = rl.question('\033[33mStart Date (MM/DD/YYYY): \033[m');

	if (validateDate(editedHabit)) {
	}
	else {
		console.log('\033[91mInvalid format. Try again.\033[m');
		setTimeout(() => {
			return habitDateChanger(data);
		}, 1000);
	}
}

function returnToEdit () {
	clearConsoleAndScrollBuffer();
	return updateHabits(3);
}

function validateDate (testdate) {
	const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
	return dateRegex.test(testdate);
}

// ...

function displayAnswer (a) {
	stdout.write('\033[0;92m' + questions[a - 1] + '\033[m');
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

// Invoke

greet();
