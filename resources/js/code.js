window.onload = function () {

	WRAPPER = document.querySelector('.wrapper');

	let firstGenerator = Block('column', 'Creating generator', true);
	WRAPPER.appendChild(firstGenerator);

	function Block (type, content, first = false) {
		if (type === 'column') {
			let columnDiv = document.createElement('div');
			columnDiv.className = 'column';

			let titleDiv = document.createElement('div');
			titleDiv.className = 'title';
			titleDiv.innerHTML = content;
			
			let listDiv = document.createElement('div');
			listDiv.className = 'list';

			let blockCreateDiv = new BlockCreate (first, listDiv);// если первый - то генератор колонок


			columnDiv.appendChild(titleDiv);
			if (!first) columnDiv.appendChild(listDiv);
			columnDiv.appendChild(blockCreateDiv);

			return columnDiv;
		} else if (type === 'note') {
			let note = document.createElement('div');
			note.className = 'note';
			note.innerHTML = content;
			return note;
		};
	};

	function BlockCreate (first, parent) {
		let textarea = document.createElement('textarea');
		let btn = document.createElement('button');
		let blockCreateDiv = document.createElement('div');

		btn.className = 'btn-create';
		textarea.className = 'textarea-create';

		btn.onclick = function () {
			let content = (textarea.value || 'New element');
			let newBlock = new Block((first ? 'column' : 'note') , content);
			if (first) WRAPPER.insertBefore(newBlock, WRAPPER.lastElementChild);
			else parent.appendChild(newBlock);
		};

		blockCreateDiv.appendChild(textarea);
		blockCreateDiv.appendChild(btn);
		return blockCreateDiv;
	};
};