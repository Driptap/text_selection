var editor = function (_selectedTexts, _textInputArea) {

	var that = {};

	var getRandomColor = function() {
	    var letters = 'CDE';
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 3)];
	    }
	    return color;
	};

	that.selection = '';
	that.savedTexts = {};

	that.updateLocalStore = function () {
		if (typeof window.localStorage === 'undefined')
			return false;

		window.localStorage.set('savedTexts', JSON.stringify(that.savedTexts));
	};

	// that.checkSavedTexts = function () {
	// 	if (typeof window.localStorage === 'undefined')
	// 		return false;

	// 	var _storedTexts = window.localStorage.get('savedTexts');

	// 	if (!_storedTexts) return false;

	// 	try {
	// 		_storedTexts = JSON.parse(_storedTexts);
	// 	}
	// 	catch (exc) {
	// 		_storedTexts = _storedTexts;
	// 	}

	// 	that.loadTextsFromJson(_storedTexts);
	// };

	// that.loadTextsFromJson = function (json) {

	// };

	that.getText = function (e) {

		var _el = e.target,
			_text = '';

		// Gets selection by slicing value from start point to end point
		if (typeof _el.selectionStart == 'number')
			_text = _el.value.slice(_el.selectionStart, _el.selectionEnd).trim();

		else if (window.getSelection)
			_text = window.getSelection().toString();

		// If the selection is not nothing, log it
		if (_text !== "") {
			that.selection = window.getSelection();
			that.selectionText = _text;
			that.spawnConfirmBox(e);
		}
	};


	that.spawnConfirmBox = function (e) {

		if (that.selection === '')
			return false;

		var x = e.pageX + 'px',
	        y = e.pageY + 'px',
	        template = $('#confirmBoxTemplate').html(),
	        renderedTemplate = $(Mustache.render(template, {}));
	        // message = ('<span>Do you want to save this selection?</span>'),
	        // yes = $('<button class="btn btn-success btn-xs" id="yes">Yes</button>'),
	        // no = $('<button class="btn btn-danger btn-xs" id="no">No</button>'),


	        // div = $('<div>').css({
	        //     "position": "absolute",
	        //     "left": x,
	        //     "top": y
	        // });

	    // div.addClass("selectionConfirmBox");

	    if (that.confirmationBox)
	    	that.confirmationBox.remove();

        // div.append(message);
        // div.append(yes);
        // div.append(no);

        renderedTemplate.css({
    	    "position": "absolute",
            "left": x,
            "top": y
	    });

        $(document.body).append(renderedTemplate);
        $('#yes').click(that.addTextToSelection);
        $('#no').click(that.resetSelection);
        that.confirmationBox = $(renderedTemplate);

	};

	that.addTextToSelection = function () {
		var _li = $('<li>'),
			_button = $('<button class="btn btn-danger">Remove</button>'),
			_range = that.selection.getRangeAt(0),
			_span = document.createElement('span'),
			_liTitle = document.createElement('h5');


		_liTitle.innerText = 'Selection ' + parseInt(parseInt(Object.keys(that.savedTexts).length) + 1);
		_li.text(that.selectionText);
		_li.id = 'selection_' + parseInt(Object.keys(that.savedTexts).length + 1);
		_li.append(_liTitle);
		_button.id = _li.id + '_button';

		_li.append(_button);
		_selectedTexts.append(_li);

		that.savedTexts[_li.id] = {
			'selectedText':	that.selectionText,
			'range': _range
		};

		_range.deleteContents();
		_span = document.createElement('span');
		_span.innerText = that.selectionText;
		_span.id = _li.id + '_span';
		_span.style.background = getRandomColor();
		_range.insertNode( _span );

		$(_button).click(that.removeSelectionBox);

		if (that.confirmationBox)
			that.confirmationBox.remove();

		that.selectionText = '';

	};

	that.removeAllSelectionBoxes = function (e) {

		var _modal = $('#removeAllSelectionsModal');

		_modal.modal('show');

		$('#yesDeleteAll', _modal).click(function() {
			_selectedTexts.empty();
		});

		that.savedTexts = {};
	};

	that.removeSelectionBox = function (e) {
		var _id = e.target.id.replace('_button', '');
		$(e.target).parents('li').remove();
		delete that.savedTexts[_id];
	};

	that.resetSelection = function () {

		if (that.confirmationBox)
			that.confirmationBox.remove();

		if (document.selection)
        	document.selection.empty();

    	else if (window.getSelection)
        	window.getSelection().removeAllRanges();

	};

	return that;
};




(function(){
	$(document).ready(function() {

		var _textInputArea = $('#textInput'),
			_selectedTexts = $('#selectedTexts'),
			_editor = editor(_selectedTexts, _textInputArea),
			_removeAllButton = $('#removeAll');

		_textInputArea.on('mouseup', _editor.getText);
		_removeAllButton.click(_editor.removeAllSelectionBoxes);

	});
})();



//  if (
//   (activeElTagName == "textarea") || (activeElTagName == "input" &&
//   /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
//   (typeof activeEl.selectionStart == "number")
// ) {
//     text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
// } else if (window.getSelection) {
//     text = window.getSelection().toString();
// }
// return text;

// // var t = '';
// // function gText(e) {
// //     t = (document.all) ? document.selection.createRange().text : document.getSelection();

// //     document.getElementById('input').value = t;
// // }

// // document.onmouseup = gText;
// // if (!document.all) document.captureEvents(Event.MOUSEUP);
