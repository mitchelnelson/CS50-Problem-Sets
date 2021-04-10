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
const months = {
	0: 'January',
	1: 'February',
	2: 'March',
	3: 'April',
	4: 'May',
	5: 'June',
	6: 'July',
	7: 'August',
	8: 'September',
	9: 'October',
	10: 'November',
	11: 'December'
};

const questions = [
	'Daily check-in',
	'Create a habit',
	'View existing habits.',
	'Edit/Delete habits.'
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
			return greet();
		case '2':
			clearConsoleAndScrollBuffer();
			return createHabits(answer);
		case '3':
			clearConsoleAndScrollBuffer();
			return readHabits(answer);
		case '4':
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
			startDate: customDate(Date.now()),
			daysSinceStart: 0,
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

	if (confirm === 'e' || confirm === 'E') {
		const habitArray = [];
		const indexArray = [];
		clearConsoleAndScrollBuffer();
		displayAnswer(4);
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

// Read-specific functions

function logHabitData (results) {
	for (let i = 0; i < results.length; i++) {
		console.log('\033[34mHabit: \033[m' + results[i]['name']);
		console.log('\033[33mStart Date: \033[m' + results[i]['startDate']);
		console.log(
			'\u001b[38;5;30mDays Since Start Date: \033[m' +
				results[i]['daysSinceStart']
		);
		console.log(
			'\033[35mCurrent Streak: \033[m' +
				results[i]['currentStreak'] +
				'\n'
		);
	}
	return;
}

// Update-specific functions

function addToArray (data, arr, iArr) {
	for (let i = 0; i < data.length; i++) {
		arr.push(data[i]['name']);
		iArr.push(i + 1);
	}
	return;
}

async function openHabitEditor (habit) {
	clearConsoleAndScrollBuffer();
	console.log('\033[0;92m%s\n', questions[3]);
	let results = await Habit.find({ name: `${habit}` });

	logHabitData(results);

	let editField = rl.keyInSelect(
		['Edit Habit', 'Edit Start Date', 'Edit Current Streak'],
		''
	);

	switch (editField) {
		case -1:
			return returnToEdit();
		case 0:
			habitNameChanger(results);
			break;
		case 1:
			habitDateChanger(results);
			break;
		case 2:
			habitStreakChanger(results);
			break;
	}
}

async function habitNameChanger (data) {
	clearConsoleAndScrollBuffer();
	console.log('\033[0;92m' + questions[3] + '\n');

	let escapedQuery =
		'\033[34mHabit\033[m ' +
		'(previously was: \u001b[1m' +
		data[0]['name'] +
		'\033[m): ';
	let editedHabit = rl.question(escapedQuery);

	return await Habit.findOneAndUpdate(
		{ name: data[0]['name'] },
		{ name: editedHabit }
	).then(() => {
		console.log('Success! Press \u001b[1;4mspacebar\033[m to exit.');
		return spacebarMainMenu();
	});
}

async function habitDateChanger (data) {
	clearConsoleAndScrollBuffer();
	console.log('\033[0;92m' + questions[3] + '\n');
	console.log('\033[34mHabit: \033[m' + data[0]['name']);

	let editedHabit = rl.question('\033[33mStart Date (MM/DD/YYYY): \033[m');

	if (validateDate(editedHabit)) {
		let newStartDate = customDate(editedHabit);
		await Habit.findOneAndUpdate(
			{ name: data[0]['name'] },
			{
				$set: {
					startDate: newStartDate,
					daysSinceStart: calculateDaysSinceStart(
						new Date(editedHabit)
					)
				}
			}
		).then(() => {
			console.log('Success! Press \u001b[1;4mspacebar\033[m to exit.');
			return spacebarMainMenu();
		});
	}
	else {
		console.log('\033[91mInvalid format. Try again.\033[m');
		setTimeout(() => {
			return habitDateChanger(data);
		}, 1000);
	}
}

async function habitStreakChanger (data) {
	clearConsoleAndScrollBuffer();
	console.log('\033[0;92m' + questions[3] + '\n');
	console.log('\033[34mHabit: \033[m' + data[0]['name']);
	console.log('\033[33mStart Date: \033[m' + data[0]['startDate']);
	console.log(
		'\u001b[38;5;30mDays since start date: \033[m' +
			data[0]['daysSinceStart']
	);

	let editedHabit = parseInt(rl.question('\033[35mCurrent Streak: \033[m'));
	let validateChecker = validateStreak(editedHabit, data[0]['startDate']);

	if (validateChecker) {
		await Habit.findOneAndUpdate(
			{ name: data[0]['name'] },
			{
				$set: {
					currentStreak: editedHabit
				}
			}
		).then(() => {
			console.log('Success! Press \u001b[1;4mspacebar\033[m to exit.');
			return spacebarMainMenu();
		});
	}
	else {
		console.log(
			'\033[91mStreak must be shorter than ' +
				`${data[0]['daysSinceStart']}.` +
				' Try again.\033[m'
		);
		setTimeout(() => {
			return habitStreakChanger(data);
		}, 2000);
	}
}

function returnToEdit () {
	clearConsoleAndScrollBuffer();
	return updateHabits(3);
}

function validateDate (testDate) {
	const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
	return dateRegex.test(testDate);
}

function validateStreak (testStreak, originDate) {
	const streakRegex = /^[1-9]\d*$/;
	let isSyntaticStreak = streakRegex.test(testStreak);

	let maxDays = calculateDaysSinceStart(canonizeDate(originDate));

	if (isSyntaticStreak && testStreak <= maxDays) {
		return true;
	}
	return false;
}

function customDate (enteredDate) {
	let customDate = new Date(enteredDate);
	let year = customDate.getFullYear();
	let month = months[customDate.getMonth()];
	let day = customDate.getDate();
	return `${month} ${day}, ${year}`;
}

function canonizeDate (customDate) {
	let reverseParseRegex = /^([a-zA-Z]+)\s([1-9]|1[0-9]|2[0-9]|3[0-1]),\s(19\d{2}|20\d{2})$/;
	let arr = reverseParseRegex.exec(customDate);

	let canonizedDate = new Date(
		parseInt(arr[3]),
		parseInt(Object.keys(months)[Object.values(months).indexOf(arr[1])]),
		parseInt(arr[2])
	);
	return canonizedDate;
}

async function dailyIncrement () {
	let reverseParseRegex = /^([a-zA-Z]+)\s([1-9]|1[0-9]|2[0-9]|3[0-1]),\s(19\d{2}|20\d{2})$/;

	let results = await Habit.find({});
	for (habit of results) {
		let canonizedDate = canonizeDate(habit['startDate']);
		let configuredDate = calculateDaysSinceStart(canonizedDate);

		await Habit.updateOne(
			{},
			{
				$set: {
					daysSinceStart: configuredDate
				}
			}
		);
	}
}

function calculateDaysSinceStart (startDate) {
	const now = Date.now(); // current date
	const difference = now - startDate;
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.floor(difference / msPerDay);
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

// Start the application.

dailyIncrement();
greet();
