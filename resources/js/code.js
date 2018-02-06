'use strict'
window.onload = function () {

	let WRAPPER = document.querySelector('.wrapper');
	let ALL_DATA = {};
	let COUNTER = 0;

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

			parent = document.querySelector(`[data-id-in-relativs="${note.dataset.parent}"]`);
		};
		/***/
		if (!first) {
			mainObj.onmousedown = function(e) {

				if (e.target !== mainObj) return;

				mainObj.style.position = 'absolute';
				mainObj.style.zIndex = 1000;
				moveAt(e);

				parent.appendChild(mainObj);

				document.onmousemove = function(e) {
					moveAt(e);
				};
				mainObj.onmouseup = function() {
					document.onmousemove = null;
					mainObj.onmouseup = null;
					mainObj.position = 'relative';
					mainObj.style.zIndex = 1;
				};
				function moveAt(e) {
					mainObj.style.left = e.pageX - mainObj.offsetWidth / 2 + 'px';
					mainObj.style.top = e.pageY - mainObj.offsetHeight / 2 + 'px';
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
				};
			};

			blockCreateDiv.appendChild(textarea);
			blockCreateDiv.appendChild(btn);
			return blockCreateDiv;
		};
	};
};