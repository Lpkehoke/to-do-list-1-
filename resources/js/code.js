'use strict'
window.onload = function () {
	class BackUp {
		static getObj () {
			if (window.localStorage.getItem('backUp')) return JSON.parse(window.localStorage.getItem('backUp'));
			else return null;
		};

		static makeAllData () {
			let backUp = [];
			for (let i = 0; i < WRAPPER.children.length - 1; i++) {
				backUp[i] = {};
				backUp[i].title = WRAPPER.children[i].children[0].lastElementChild.innerHTML;
				backUp[i].notes = [];
				for (let j = 0; j < WRAPPER.children[i].children[1].children.length; j++)
					backUp[i].notes.push(WRAPPER.children[i].children[1].children[j].lastElementChild.innerHTML);
			};
			window.localStorage.setItem('backUp', JSON.stringify(backUp));
		};

		static restoring () {
			let obj = BackUp.getObj();
			if (!obj) return false;
			for (let i = 0; i < obj.length; i++) {
				let newColumn = new Block ('column' , obj[i].title, false, true);
				WRAPPER.insertBefore(newColumn, WRAPPER.lastElementChild);
				for (let j = 0; j < obj[i].notes.length; j++) {
					let newNote = new Block ('note', obj[i].notes[j], false, true, i);
					newColumn.children[1].appendChild(newNote);
				};
			};
		};

		static delite () {
			window.localStorage.setItem('backUp', '');
		};
	};

	let WRAPPER = document.querySelector('.wrapper');
	let BIN_DIV = null; //need to delite trash
	let COUNTER = 0; // num of column
	let WIDTH_COLUMN = 15 * 16; // without margin
	let MARGIN_NOTE = 16; // only top or only bottom

	let firstGenerator = Block('column', 'Creating generator', true);

	WRAPPER.appendChild(firstGenerator);
	BackUp.restoring();
	// BackUp.delite();

	function Block (type, content, first = false, restoring, count) {
		let mainObj = {};
		let parent = {};

		if (type === 'column') {
			let columnDiv = document.createElement('div');
			columnDiv.className = 'column';
			columnDiv.style.backgroundColor = getColor();

			let titleDiv = document.createElement('div');
			let deleteBtnColumn = createBtn ('delete');
			let titleHeight;
			let titleText = document.createElement('textarea');
			titleDiv.className = 'title';
			titleText.className = 'title-text';
			if(!first) {
				titleHeight = WRAPPER.lastElementChild.querySelector('.textarea-create').offsetHeight;
 				titleText.style.height = (titleHeight)/0.5 + "px";
 			};
			titleText.innerHTML = content;
			titleText.onkeyup = autoResize;

			let listDiv = document.createElement('div');
			listDiv.className = 'list';

			let blockCreateDiv = new BlockCreate (first, listDiv, COUNTER); // если первый - то генератор колонок

			if (!first) {
				columnDiv.dataset.idInRelativs = COUNTER++;
				titleDiv.appendChild(deleteBtnColumn);
			};

			titleDiv.appendChild(titleText);
			columnDiv.appendChild(titleDiv);
			if (!first) columnDiv.appendChild(listDiv);
			columnDiv.appendChild(blockCreateDiv);

			mainObj = columnDiv;

			parent = WRAPPER;
		} else if (type === 'note') {
			let noteWrapper = document.createElement('div');
			let note = document.createElement('div');
			let deleteBtnNote = createBtn('delete');
			let expandBtnNote = createBtn('expand');

			noteWrapper.className = 'noteWrapper';
			note.className = 'note';
			note.innerHTML = content;

			noteWrapper.appendChild(expandBtnNote);
			noteWrapper.appendChild(deleteBtnNote);
			noteWrapper.appendChild(note);

			noteWrapper.dataset.parent = count;
			mainObj = noteWrapper;

			parent = document.querySelector(`[data-id-in-relativs="${noteWrapper.dataset.parent}"]`).querySelector('.list');
		};

	if (!first) {
			mainObj.ondragstart = function () {
				return false;
			};

			mainObj.onclick = function () {
				return false;
			};

			mainObj.onmousedown = function (e) {
				if (e.target !== mainObj && e.target !== mainObj.lastElementChild ) return;

				let shiftX = e.pageX - mainObj.getBoundingClientRect().left + (type === 'note' ? 0 : 8);
				let shiftY;
				if (type === 'column') shiftY = e.pageY;
				else if (type === 'note') shiftY = e.pageY - mainObj.getBoundingClientRect().top - window.pageYOffset + 16;

				if (BIN_DIV) BIN_DIV.remove();
				let emptyDiv = document.createElement('div');
				BIN_DIV = emptyDiv;
				let scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,document.body.offsetHeight, document.documentElement.offsetHeight,document.body.clientHeight, document.documentElement.clientHeight);
				let heightNote = mainObj.offsetHeight;

				emptyDiv.style.minHeight = heightNote + 'px';

				let startLeft = mainObj.getBoundingClientRect().left;
				let middleToSwap = mainObj.getBoundingClientRect().top + heightNote / 2 + window.pageYOffset;

				emptyDiv.className = (type === 'column') ? 'emptyColumn' : 'emptyNote';

				parent.insertBefore(emptyDiv , mainObj);

				mainObj.style.position = 'absolute';
				if (type === 'column') {
					mainObj.style.minHeight = scrollHeight + 'px';
					mainObj.style.zIndex = 1000;
				} else if (type === 'note') mainObj.style.zIndex = 1000;
				moving(e);

				parent.appendChild(mainObj);

				document.onmousemove = moving;

				mainObj.onmouseup = drop;
				return false;

				function drop () {
					document.onmousemove = null;
					mainObj.onmouseup = null;
					mainObj.style.zIndex = 1;
					mainObj.parentElement.style.zIndex = 1;
					mainObj.style.left = 0;
					mainObj.style.top = 0;
					if (type === 'note') mainObj.style.position = 'relative';
					else if (type === 'column') mainObj.style.position = 'static';
					parent.insertBefore(mainObj , emptyDiv);
					emptyDiv.remove();
					BackUp.makeAllData();
				};


				function moving (e) {
					xControle(e);
					if (type === 'note') yControle(e , parent);
					mainObj.style.left = e.pageX - shiftX  + 'px';
					mainObj.style.top = e.pageY - shiftY + 'px';
				};

				function xControle (e) {

					if (e.pageX < startLeft && ((type === 'note' && emptyDiv.parentElement.parentElement.previousElementSibling)||(type === 'column' && emptyDiv.previousElementSibling))) {
						let previous = emptyDiv.previousElementSibling;

						emptyDiv.remove();
						if (type === 'column') parent.insertBefore(emptyDiv, previous);
						else if (type === 'note') {
							let previousList = parent.parentElement.previousElementSibling.querySelector('.list');
							previousList.appendChild(mainObj);
							yControle (e, previousList, true);
						};

						startLeft -= WIDTH_COLUMN;
					} else if (	e.pageX > startLeft + WIDTH_COLUMN && ((type === 'note' && emptyDiv.parentElement.parentElement.nextElementSibling.nextElementSibling)||(type === 'column' && emptyDiv.nextElementSibling.nextElementSibling.nextElementSibling) )){
						if (type === 'column') {
							let post = emptyDiv.nextElementSibling.nextElementSibling;
							emptyDiv.remove();
							parent.insertBefore(emptyDiv, post);
						} else if (type === 'note') {
							emptyDiv.remove();
							let postList = parent.parentElement.nextElementSibling.querySelector('.list');
							postList.appendChild(mainObj);
							yControle (e, postList, true);
						};

						startLeft += WIDTH_COLUMN;
					};
				};

				function yControle (e, newList = null, fromX = false) {
					if (fromX) {
						parent = newList;
						let find = false;
						for (let i = 0; i < parent.children.length; i++) {
							if (e.pageY < parent.children[i].getBoundingClientRect().top) {
								parent.insertBefore(emptyDiv , parent.children[i]);
								find = true;
								break;
							};
						};
						if (!find) parent.insertBefore(emptyDiv , mainObj);
						mainObj.dataset.parent = parent.parentElement.dataset.idInRelativs;
						middleToSwap = emptyDiv.getBoundingClientRect().top + heightNote / 2;
					};

					if (emptyDiv.previousElementSibling && e.pageY < middleToSwap - emptyDiv.previousElementSibling.offsetHeight / 2 - MARGIN_NOTE - heightNote / 2) {

						let previous = emptyDiv.previousElementSibling;

						emptyDiv.remove();
						parent.insertBefore(emptyDiv, previous);

						middleToSwap -= (previous.offsetHeight + MARGIN_NOTE);
					} else if (emptyDiv.nextElementSibling && emptyDiv.nextElementSibling.nextElementSibling &&e.pageY > middleToSwap + heightNote / 2 + MARGIN_NOTE + emptyDiv.nextElementSibling.offsetHeight / 2) {

						let post = emptyDiv.nextElementSibling.nextElementSibling;

						emptyDiv.remove();
						parent.insertBefore(emptyDiv, post);

						middleToSwap += (emptyDiv.previousElementSibling.offsetHeight + MARGIN_NOTE);
					};
				};
			};
		};
		return mainObj;

		function BlockCreate (first, parent, count) {
			let textarea = document.createElement('textarea');
			let btn = document.createElement('button');
			let blockCreateDiv = document.createElement('div');

			btn.className = 'btn-create';
			textarea.className = 'textarea-create';

			btn.innerHTML = "Create";

			textarea.onkeyup = autoResize;

			btn.onclick = function () {
				let content = (textarea.value || 'New element');
				let newBlock = new Block((first ? 'column' : 'note'), content, false, false, count);
				if (first) WRAPPER.insertBefore(newBlock, WRAPPER.lastElementChild);
				else parent.appendChild(newBlock);
				textarea.value = '';
				textarea.style.height = 45.31 + 'px';
				BackUp.makeAllData();
			};

			blockCreateDiv.appendChild(textarea);
			blockCreateDiv.appendChild(btn);
			return blockCreateDiv;
		};

		function getColor () {
			let red	= Math.round(Math.random() * 257 - 0.5);
			let	green = Math.round(Math.random() * 257 - 0.5);
			let	blue = Math.round(Math.random() * 257 - 0.5);
			let	color = '#' +
							(red = (red > 16) ? red.toString(16) : '0' + red.toString(16)) +
							(green = (green > 16) ? green.toString(16) : '0' + green.toString(16)) +
							(blue = (blue > 16) ? blue.toString(16) : '0' + blue.toString(16));
			return color;
		};

		function createBtn (type) {
			let newBtn = document.createElement('button');

			if (type === 'delete') {
				newBtn.className = 'btn-delete';
				newBtn.innerHTML = '&#10008';

				newBtn.onclick = function() {
					mainObj.remove();
					BackUp.makeAllData();
				};
			} else if (type === 'expand') {
				newBtn.className = 'btn-expand';
				newBtn.innerHTML = '...';
				let openingNoteFlag = false;

				newBtn.onclick = function () {
					if (openingNoteFlag) {
						mainObj.lastElementChild.style.height = 32 + 'px';
						openingNoteFlag = false;
					} else {
						mainObj.lastElementChild.style.height = 'auto';
						openingNoteFlag = true;
					};
				};
			};

			return newBtn;
		};

		function autoResize () {
			this.style.height = "";
			this.style.height = ( 3 + this.scrollHeight ) + "px";
		};
	};
};