// Libraries
const rl = require('readline-sync');
const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;

// Models
const { Habit } = require('./model');

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
	'\033[1;4;93mPress a corresponding key from below to get started:\033[m';

// Greeting prompt
const qPrompt = `${underliner}\n
1. ${questions[0]}
2. ${questions[1]}
3. ${questions[2]}
4. ${questions[3]}
q. Exit app.\n\n`;

// MAIN FUNCTION

function greet () {
	clearConsoleAndScrollBuffer();

	let answer = rl.keyIn(qPrompt, { limit: ['1', '2', '3', '4', 'q'] });

	switch (answer) {
		case '1':
			clearConsoleAndScrollBuffer();
			return checkIn();
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

// CHECK IN

async function checkIn () {
	displayAnswer(1);

	let array = [];
	let results = await Habit.find({});
	await addToArray(results, array, [], true);

	console.log('\n\u001b[1mMake a selection.\033[m');
	let chosenHabit = rl.keyInSelect(array, '', {
		hideEchoBack: true,
		mask: ''
	});

	if (chosenHabit === array.indexOf('CANCEL')) {
		return greet();
	}
	else if (chosenHabit === array.indexOf('Toggle All')) {
		return ToggleAll(results);
	}
	else {
		return habitToggle(results, chosenHabit);
	}
	// failsafe
	return spacebarMainMenu();
}

async function habitToggle (data, specificHabit) {
	if (data[specificHabit]['checkedInToday'] === false) {
		await Habit.findOneAndUpdate(
			{ name: data[specificHabit]['name'] },
			{ $set: { checkedInToday: true } }
		);
	}
	else {
		await Habit.findOneAndUpdate(
			{ name: data[specificHabit]['name'] },
			{ $set: { checkedInToday: false } }
		);
	}
	clearConsoleAndScrollBuffer();
	return checkIn();
}

async function ToggleAll (data) {
	for (let i = 0; i < data.length; i++) {
		if (data[i]['checkedInToday'] === false) {
			await Habit.findOneAndUpdate(
				{ name: data[i]['name'] },
				{ checkedInToday: true }
			);
		}
		else {
			await Habit.findOneAndUpdate(
				{ name: data[i]['name'] },
				{ checkedInToday: false }
			);
		}
	}
	clearConsoleAndScrollBuffer();
	return checkIn();
}

// CRU(D)

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
			currentStreak: 0,
			checkedInToday: false
		});
		await newHabit.save().then(() => {
			process.stdout.write(
				'\033[1;31mHabit added!\033[m (Returning to main menu)'
			);
			setTimeout(() => {
				return greet();
			}, 2500);
		});
	}
	else return greet();
}

async function readHabits (option) {
	displayAnswer(option);
	console.log(' (Hit \u001b[1;4mspacebar\033[m to go back)');
	let results = await Habit.find();

	logHabitData(results);
	return spacebarMainMenu();
}

async function updateHabits (option) {
	displayAnswer(option);

	const habitArray = [];
	const indexArray = [];
	clearConsoleAndScrollBuffer();
	displayAnswer(4);
	console.log('');
	let data = await Habit.find();
	addToArray(data, habitArray, indexArray, false);

	console.log('\u001b[1mWhich habit do you want to edit?\033[m');
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

// Read-specific functions

function logHabitData (data) {
	for (let i = 0; i < data.length; i++) {
		console.log('\033[34mHabit: \033[m' + data[i]['name']);
		console.log(
			'\033[33mStart Date: \033[m' +
				`${data[i]['startDate']} (${data[i][
					'daysSinceStart'
				]} days ago)`
		);
		console.log('\033[36mChecked In?: \033[m' + data[i]['checkedInToday']);
		console.log(
			'\033[35mCurrent Streak: \033[m' + data[i]['currentStreak'] + '\n'
		);
	}
	return;
}

function logEditHabitData (promptQty, results, initialVal) {
	let editPrompts = [
		'\033[0;92m' + questions[3] + '\n',
		'\033[34mHabit: \033[m' + results[0]['name'],
		'\033[33mStart Date: \033[m' +
			`${results[0]['startDate']} (${results[0][
				'daysSinceStart'
			]} days ago)`,
		'\033[35mCurrent Streak: \033[m' + results[0]['currentStreak'] + '\n'
	];

	if (promptQty === 0) {
		return;
	}

	console.log(editPrompts[initialVal]);
	logEditHabitData(promptQty - 1, results, initialVal + 1);
}

// Update-specific functions

function addToArray (data, arr, iArr, isCheckIn) {
	let isEditArray = false;

	for (let i = 0; i < data.length; i++) {
		if (isCheckIn && data[i]['checkedInToday'] === false) {
			arr.push(`${data[i]['name']} ☐`);
		}
		else if (isCheckIn && data[i]['checkedInToday'] === true) {
			arr.push(`${data[i]['name']} ☑`);
		}
		else {
			arr.push(data[i]['name']);
			isEditArray = true;
		}
		iArr.push(i + 1);
	}
	if (isCheckIn) {
		return arr.push('Toggle All');
	}
	return arr;
}

async function openHabitEditor (habit) {
	clearConsoleAndScrollBuffer();
	console.log('\033[0;92m%s\n', questions[3]);
	let nameResults = await Habit.find({ name: `${habit}` });

	logHabitData(nameResults);

	let editField = rl.keyInSelect(
		[
			'Edit Habit',
			'Edit Start Date',
			'Edit Current Streak',
			'Delete Habit'
		],
		''
	);

	switch (editField) {
		case -1:
			return returnToEdit();
		case 0:
			habitNameChanger(nameResults);
			break;
		case 1:
			habitDateChanger(nameResults);
			break;
		case 2:
			habitStreakChanger(nameResults);
			break;
		case 3:
			habitDestroyer(nameResults);
			break;
	}
}

async function habitNameChanger (data) {
	clearConsoleAndScrollBuffer();
	logEditHabitData(1, data, 0);

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
		success('Habit successfully updated!');
	});
}

async function habitDateChanger (data) {
	clearConsoleAndScrollBuffer();
	logEditHabitData(2, data, 0);

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
			success('Habit successfully updated!');
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
	logEditHabitData(3, data, 0);

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
			success('Habit successfully updated!');
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

async function habitDestroyer (data) {
	clearConsoleAndScrollBuffer();
	logEditHabitData(4, data, 0);

	let yesNo = rl.keyIn(
		'\033[91mAre you sure you want to delete this habit?\033[m (y/n)\n',
		{ limit: ['y', 'Y', 'n', 'N'], hideEchoBack: true, mask: '' }
	);

	if (yesNo === 'y' || yesNo === 'Y') {
		await Habit.deleteOne({ name: data[0]['name'] }).then(() => {
			success('Habit successfully deleted!');
		});
	}
	else {
		returnToEdit();
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

function calculateDaysSinceStart (startDate) {
	const now = Date.now(); // current date
	const difference = now - startDate;
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.floor(difference / msPerDay);
}

// ...

function displayAnswer (a) {
	process.stdout.write('\033[0;92m' + questions[a - 1] + '\033[m');
}

function spacebarMainMenu () {
	let mainMenu = rl.keyIn('', { limit: ' ' });
	if (mainMenu) return greet();
}

function success (type) {
	console.log(
		'\033[1;31m%s\033[m Press \u001b[1;4mspacebar\033[m to exit.',
		type
	);
	return spacebarMainMenu();
}

function goodbye () {
	console.clear();
	console.log(qPrompt);
	process.stdout.write('Goodbye!');
	setTimeout(() => {
		return process.exit();
	}, 1000);
}

function clearConsoleAndScrollBuffer () {
	process.stdout.write('\u001b[3J\u001b[1J');
	console.clear();
}

async function dailyIncrement () {
	let results = await Habit.find();
	for (habit of results) {
		let canonizedDate = canonizeDate(habit['startDate']);
		let configuredDate = calculateDaysSinceStart(canonizedDate);

		await Habit.updateOne(
			{ name: habit['name'] },
			{
				$set: {
					daysSinceStart: configuredDate,
					checkedInToday: false
				}
			}
		);
	}
}

const job = new CronJob(
	'0 0 * * * *',
	dailyIncrement(),
	null,
	true,
	'America/Edmonton'
);
job.start();

// Start the application.
greet();
