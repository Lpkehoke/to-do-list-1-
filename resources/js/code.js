'use strict'
window.onload = function () {

	let WRAPPER = document.querySelector('.wrapper');
	let ALL_DATA = {};
	let COUNTER = 0;
	let WIDTH_COLUMN = 15 * 16;
	let MARGIN_NOTE = 16;

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

			let blockCreateDiv = new BlockCreate (first, listDiv , COUNTER);// если первый - то генератор колонок

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
		/***/
		if (!first) { // to do
			mainObj.onmousedown = function(e) {
				if (e.target !== mainObj) return;

				let emptyDiv = document.createElement('div');
				let startLeft = mainObj.getBoundingClientRect().left;

				let startTop = mainObj.getBoundingClientRect().top;

				emptyDiv.className = (type === 'column') ? 'emptyColumn' : 'emptyNote';

				parent.insertBefore(emptyDiv , mainObj);

				mainObj.style.position = 'absolute';
				mainObj.style.zIndex = 1000;

				xControle(e);
				if (type === 'note') yControle(e);
				parent.appendChild(mainObj);

				document.onmousemove = function(e) {
					xControle(e);
					if (type === 'note') yControle(e , parent);
				};

				mainObj.onmouseup = function() {
					document.onmousemove = null;
					mainObj.onmouseup = null;
					mainObj.style.position = 'relative';
					mainObj.style.zIndex = 1;
					mainObj.style.left = 0;
					mainObj.style.top = 0;
					parent.insertBefore(mainObj , emptyDiv);
					emptyDiv.remove();
				};

				function xControle(e) {

					if (e.pageX < startLeft && e.pageX > 16) {
						let previous = emptyDiv.previousElementSibling;

						emptyDiv.remove();
						if (type === 'column') parent.insertBefore(emptyDiv, previous);
						else if (type === 'note') {
							let previousList = parent.parentElement.previousElementSibling.querySelector('.list');
							previousList.appendChild(mainObj);
							yControle (e, previousList, true);
						};

						startLeft -= WIDTH_COLUMN;
					} else if (e.pageX > startLeft + WIDTH_COLUMN && ( type === 'note' || emptyDiv.nextElementSibling.nextElementSibling.nextElementSibling)) {
						let post = emptyDiv.nextElementSibling.nextElementSibling;

						emptyDiv.remove();
						if (type === 'column') parent.insertBefore(emptyDiv, post);
						else if (type === 'note') {
							let postList = parent.parentElement.nextElementSibling.querySelector('.list');
							postList.appendChild(mainObj);
							yControle (e, postList, true);
						};

						startLeft += WIDTH_COLUMN;
					};

					mainObj.style.left = e.pageX - mainObj.offsetWidth / 2 + 'px';
					mainObj.style.top = e.pageY - mainObj.offsetHeight / 2 + 'px';
				};
				function yControle (e, list, fromX = false) {
					if (fromX) {
						parent = list;
						let find = false;
						for (let i = 0; i < parent.children.length; i++) {
							console.log(parent.children[i].getBoundingClientRect().top);
							if (e.pageY < parent.children[i].getBoundingClientRect().top) {
								parent.insertBefore(emptyDiv , parent.children[i - 1]);
								break;
								find = true;
							};
						};
						if (!find) parent.appendChild(emptyDiv);
						mainObj.dataset.parent = parent.parentElement.dataset.idInRelativs;
					};

					if (e.pageY < startTop && emptyDiv.previousElementSibling) {
						let previous = emptyDiv.previousElementSibling;

						emptyDiv.remove();
						parent.insertBefore(emptyDiv, previous);

						startTop -= (previous.offsetHeight + MARGIN_NOTE / 2);
					} else if (e.pageY > startTop + mainObj.offsetHeight + MARGIN_NOTE / 2 && emptyDiv.nextElementSibling.nextElementSibling) {
						let post = emptyDiv.nextElementSibling.nextElementSibling;

						emptyDiv.remove();
						parent.insertBefore(emptyDiv, post);

						startTop += (post.offsetHeight + MARGIN_NOTE / 2);
					};
				};
			};
		};

		return mainObj;

		function BlockCreate (first, parent , count) {
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