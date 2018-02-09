'use strict'
window.onload = function () {

	let WRAPPER = document.querySelector('.wrapper');
	let ALL_DATA = {};
	let COUNTER = 0; // num of column
	let WIDTH_COLUMN = 15 * 16; // without margin
	let MARGIN_NOTE = 8; // only top or only bottom

	let firstGenerator = Block('column', 'Creating generator', true);
	WRAPPER.appendChild(firstGenerator);

	function Block (type, content, first = false, count) {
		let mainObj = {};
		let parent = {};

		if (type === 'column') {
			let columnDiv = document.createElement('div');
			columnDiv.className = 'column';

			let titleDiv = document.createElement('div');
			titleDiv.className = 'title';
			titleDiv.innerHTML = content;

			let listDiv = document.createElement('div');
			listDiv.className = 'list';

			let blockCreateDiv = new BlockCreate (first, listDiv , COUNTER); // если первый - то генератор колонок

			if (!first) columnDiv.dataset.idInRelativs = COUNTER++;

			columnDiv.appendChild(titleDiv);
			if (!first) columnDiv.appendChild(listDiv);
			columnDiv.appendChild(blockCreateDiv);

			mainObj = columnDiv;

			ALL_DATA[COUNTER] = [];

			parent = WRAPPER;
		} else if (type === 'note') {
			let note = document.createElement('div');
			note.className = 'note';
			note.innerHTML = content;
			note.dataset.parent = count;

			mainObj = note;

			parent = document.querySelector(`[data-id-in-relativs="${note.dataset.parent}"]`).querySelector('.list');
		};

		if (!first) { // to do
			mainObj.ondragstart = function () {
				return false;
			};

			mainObj.onclick = function () {
				return false;
			};

			mainObj.onmousedown = function (e) {
				if (e.target !== mainObj) return;

				let shiftX = e.pageX - mainObj.getBoundingClientRect().left + (type === 'note' ? 0 : 8);
				let shiftY = e.pageY - mainObj.getBoundingClientRect().top + (type === 'note' ? 8 : 0);

				if (ALL_DATA.empty) ALL_DATA.empty.remove();
				let emptyDiv = document.createElement('div');
				ALL_DATA.empty = emptyDiv;

				let heightNote = mainObj.offsetHeight;
				emptyDiv.style.height = heightNote + 'px';

				let startLeft = mainObj.getBoundingClientRect().left;

				let middleToSwap = mainObj.getBoundingClientRect().top + heightNote / 2;


				emptyDiv.className = (type === 'column') ? 'emptyColumn' : 'emptyNote';

				parent.insertBefore(emptyDiv , mainObj);

				mainObj.style.position = 'absolute';
				mainObj.style.zIndex = 1000;

				moving(e);

				parent.appendChild(mainObj);

				document.onmousemove = moving;

				mainObj.onmouseup = function () {
					document.onmousemove = null;
					mainObj.onmouseup = null;
					mainObj.style.position = 'static';
					mainObj.style.zIndex = 1;
					parent.insertBefore(mainObj , emptyDiv);
					emptyDiv.remove();
				};

				return false;

				function moving (e) {
					xControle(e);
					if (type === 'note') yControle(e , parent);
					mainObj.style.left = e.pageX - shiftX + 'px';
					mainObj.style.top = e.pageY - shiftY + 'px';
					console.log('top: ' + middleToSwap);
					console.log('y: ' + e.pageY);
					console.log('height: ' +heightNote);
				};

				function xControle (e) {

					if (e.pageX < startLeft && (
							(type === 'note' && emptyDiv.parentElement.parentElement.previousElementSibling)||
							(type === 'column' && emptyDiv.previousElementSibling)
							)) {
						let previous = emptyDiv.previousElementSibling;

						emptyDiv.remove();
						if (type === 'column') parent.insertBefore(emptyDiv, previous);
						else if (type === 'note') {
							let previousList = parent.parentElement.previousElementSibling.querySelector('.list');
							previousList.appendChild(mainObj);
							yControle (e, previousList, true);
						};

						startLeft -= WIDTH_COLUMN;
					} else if (	e.pageX > startLeft + WIDTH_COLUMN && (
								(type === 'note' && emptyDiv.parentElement.parentElement.nextElementSibling.nextElementSibling)||
								(type === 'column' && emptyDiv.nextElementSibling.nextElementSibling.nextElementSibling)
							  )){
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
								parent.insertBefore(emptyDiv , parent.children[i - 1]);
								find = true;
								break;
							};
						};
						if (!find) parent.insertBefore(emptyDiv , mainObj);
						mainObj.dataset.parent = parent.parentElement.dataset.idInRelativs;
						middleToSwap = emptyDiv.getBoundingClientRect().top + heightNote / 2;
					};

					if (emptyDiv.previousElementSibling &&
						e.pageY < middleToSwap - emptyDiv.previousElementSibling.offsetHeight / 2 - MARGIN_NOTE - heightNote / 2) {

						let previous = emptyDiv.previousElementSibling;

						emptyDiv.remove();
						parent.insertBefore(emptyDiv, previous);

						middleToSwap -= (previous.offsetHeight + MARGIN_NOTE);
					} else if (emptyDiv.nextElementSibling && emptyDiv.nextElementSibling.nextElementSibling &&
						e.pageY > middleToSwap + heightNote / 2 + MARGIN_NOTE + emptyDiv.nextElementSibling.offsetHeight / 2) {

						let post = emptyDiv.nextElementSibling.nextElementSibling;

						emptyDiv.remove();
						parent.insertBefore(emptyDiv, post);

						middleToSwap += (emptyDiv.previousElementSibling.offsetHeight + MARGIN_NOTE);
					};
				};
			};
		};

		if (type === 'note') mainObj.style.height = Math.random() * 150 + 'px';

		return mainObj;

		function BlockCreate (first, parent, count) {
			let textarea = document.createElement('textarea');
			let btn = document.createElement('button');
			let blockCreateDiv = document.createElement('div');

			btn.className = 'btn-create';
			textarea.className = 'textarea-create';

			btn.innerHTML = "Create";

			btn.onclick = function () {
				let content = (textarea.value || 'New element');
				let newBlock = new Block((first ? 'column' : 'note'), content, false, count);
				if (first) WRAPPER.insertBefore(newBlock, WRAPPER.lastElementChild);
				else {
					parent.appendChild(newBlock);
					ALL_DATA[count].push(newBlock);
					textarea.value = '';
				};
			};

			blockCreateDiv.appendChild(textarea);
			blockCreateDiv.appendChild(btn);
			return blockCreateDiv;
		};
	};
};