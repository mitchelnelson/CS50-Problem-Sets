a = document.querySelector('.incorrectA');
b = document.querySelector('.incorrectB');
c = document.querySelector('.incorrectC');
d = document.querySelector('.correct');

a.addEventListener('click', event => {
	turnRed(a);
});

b.addEventListener('click', event => {
	turnRed(b);
});

c.addEventListener('click', event => {
	turnRed(c);
});

d.addEventListener('click', event => {
	turnGreen(d);
});

const turnRed = btn => {
	btn.style.backgroundColor = 'red';
	document.querySelector('.hideIncorrect').classList.add('show');
	document.querySelector('.hideCorrect').classList.remove('show');
};

const turnGreen = btn => {
	btn.style.backgroundColor = 'green';
	document.querySelector('.hideCorrect').classList.add('show');
	document.querySelector('.hideIncorrect').classList.remove('show');
};

///////////////////////////////////////////////////////////////////////////

const candy = document.querySelector('.candy');
const confirm = document.querySelector('.confirm');

confirm.addEventListener('click', event => {
	if (candy.value == 'rainbow bacon') {
		candy.style.backgroundColor = 'green';
		document.querySelector('.hideCorrect2').classList.add('show');
		document.querySelector('.hideIncorrect2').classList.remove('show');
	}
	else if (candy.value != '') {
		candy.style.backgroundColor = 'red';
		document.querySelector('.hideIncorrect2').classList.add('show');
		document.querySelector('.hideCorrect2').classList.remove('show');
	}
});
