let dropdown = document.querySelector('select');
let entryButton = document.querySelector('#math-button');

dropdown.addEventListener('change', e => {
	dropdown.style.backgroundColor = 'transparent';
});

entryButton.addEventListener('click', e => {
	if (dropdown.value == 4) {
		dropdown.style.backgroundColor = 'green';
	}
	else {
		dropdown.style.backgroundColor = 'red';
	}
});

let twitter = document.querySelector('#twitter');
let github = document.querySelector('.github');
