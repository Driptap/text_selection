var editor = function (_selectedTexts, _textInputArea) {

	var that = {},

		// Returns a hex code for a random pastel colour
		getRandomColor = function() {
		    var letters = 'CDE';
		    var color = '#';
		    for (var i = 0; i < 6; i++ ) {
		        color += letters[Math.floor(Math.random() * 3)];
		    }
		    return color;
		};

	// Temp text selection storeage variable
	that.selection = '';

	// Empty saved texts object
	that.savedTexts = {};

	// Updates the browser localstorage with the current state of the editor
	that.updateLocalStore = function () {
		if (typeof window.localStorage === 'undefined')
			return false;

		// Places a stringifies object containing the main text and saved selections to local storage
		window.localStorage.setItem('savedTexts', JSON.stringify({
				'selections': that.savedTexts,
				'mainText': _textInputArea.html()
			})
		);
	};

	// Loads text and selection from JSON
	that.loadTextsFromJson = function (json) {

		var _confirmedSoLoad = function () {

			// Removes existing selection boxes
			that.removeAllSelectionBoxes(false, true);

			// Populates main text area
			if (json.mainText)
				_textInputArea.html(json.mainText);

			// If there are saved selection
			if (Object.keys(json.selections).length > 0) {

				// They are loaded one by one
				for (var i in json.selections) {
					that.selectionText = json.selections[i].selectedText;
					that.addTextToSelection(false, false);
				}
			}
		};

		// If there is existing text or selections
		if (Object.keys(that.savedTexts).length > 0 ||
				_textInputArea.text().trim().length > 0) {

			// Confirmation modal is shown
			$('#confirmOverwriteSelectionsModal').modal('show');
			$('#yesOverwriteAll', '#confirmOverwriteSelectionsModal').click(_confirmedSoLoad);

		// Else it is automatically overwritter
		} else _confirmedSoLoad();

	};

	// Called on instantiation, checks local storage for previous sessions
	that.checkSavedTexts = function () {
		if (typeof window.localStorage === 'undefined')
			return false;

		var _storedTexts = window.localStorage.getItem('savedTexts');

		// Stops function if there are no stored texts
		if (!_storedTexts) return false;
		try {
			_storedTexts = JSON.parse(_storedTexts);
		}
		catch (exc) {
			_storedTexts = _storedTexts;
		}

		// Called load from json method with loaded json
		that.loadTextsFromJson(_storedTexts);
	};

	// Called when the hidden file input changes
	that.uploadFile = function (e) {
		var _uploadEl = e.target,
			_fileReader = new FileReader();

		// Adds onload listener to filereader object
		_fileReader.onload = that.loadFromUploadedFile;
		_fileReader.readAsText(_uploadEl.files[0]);
	};

	// Once the file is loaded, json is parsed and sent to load from json method
	that.loadFromUploadedFile = function (e) {
		var _storedTexts = JSON.parse(e.target.result);
		that.loadTextsFromJson(_storedTexts);
	};

	// Export the state of the editor to a json file
	that.exportToJson = function () {

		// Stringifies text and selections
		var _json = JSON.stringify({
				'selections': that.savedTexts,
				'mainText': _textInputArea.html()
			}),

			// Create an anchor with a link containing a json blob
			_blob = new Blob([_json], {type: "application/json"}),
			_url  = URL.createObjectURL(_blob),
			_a = document.createElement('a');

		// Sets anchor properties
		_a.download    = "text_selection_export.json";
		_a.href        = _url;

		// Appends anchor element, clicks to invoke download
		document.body.appendChild(_a);
		_a.click();

		// Removes url from location and removes anchor element
        window.URL.revokeObjectURL(_url);
        document.body.removeChild(_a);
	};

	// Listener for mouse up on the text input div
	that.getText = function (e) {

		// Gets the input div element
		var _el = e.target,
			_text = '';

		// Gets selection by slicing value from start point to end point
		if (typeof _el.selectionStart == 'number')
			_text = _el.value.slice(_el.selectionStart, _el.selectionEnd).trim();

		// Or using window selection object if no selectionStart is defined
		else if (window.getSelection)
			_text = window.getSelection().toString();

		// If the selection is not nothing, show the confirm selection box
		if (_text !== "") {
			that.selection = window.getSelection();
			that.selectionText = _text;
			that.spawnConfirmBox(e);
		}
	};


	// Renders and displats the confirmation tooltip for saving text
	that.spawnConfirmBox = function (e) {

		// Cancels action is no text is selected
		if (that.selection === '')
			return false;

		// Acquires the mouse pointers X & Y position
		var x = e.pageX + 'px',
	        y = e.pageY + 'px',

	        // Acquires mustache template from dom
	        template = $('#confirmBoxTemplate').html(),

	        // Renders template into jquery element
	        renderedTemplate = $(Mustache.render(template, {}));

	    // Removes confirmation tooltip if it already existing
	    if (that.confirmationBox)
	    	that.confirmationBox.remove();

	    // Applies CSS rules to position the tooltip to where the mouse event occuered
        renderedTemplate.css({
    	    "position": "absolute",
            "left": x,
            "top": y
	    });

        // Appends html element to the dom
        $(document.body).append(renderedTemplate);

        // Adds event listener to tooltips buttons
        $('#yes').click(that.addTextToSelection);
        $('#no').click(that.resetSelection);

        // Places tooltip element into class instance variable
        that.confirmationBox = $(renderedTemplate);
	};

	// Listener for the confirm button in the add text confirmation window
	that.addTextToSelection = function (e, dontHighlight) {

		var _range = (dontHighlight === false) ? null : that.selection.getRangeAt(0),
			_span = document.createElement('span'),

			// Parses and renders the mustache template with the selected texts
			_template = $('#savedTextBox').html(),
			_selectedTextRenderObject = {
				'title': 'Selection ' + parseInt(parseInt(Object.keys(that.savedTexts).length) + 1),
				'selectedText': that.selectionText,
				'id': 'selection_' + parseInt(Object.keys(that.savedTexts).length + 1),
				'buttonId': 'selection_' + parseInt(Object.keys(that.savedTexts).length + 1) + '_button'
			},
			_el = $(Mustache.render(_template, _selectedTextRenderObject));

		// Removes the no texts message if existing
		$('.noSelectedTexts').remove();

		// Appends newly selected text el to dom
		_selectedTexts.append(_el);

		// Saves text into selected textd object
		that.savedTexts[_selectedTextRenderObject.id] = {
			'selectedText':	that.selectionText
		};

		if (dontHighlight !== false) {
			// Highlights the text in the editable div
			_range.deleteContents();
			_span.innerText = that.selectionText;
			_span.id = _selectedTextRenderObject.id + '_span';
			_span.style.background = getRandomColor();
			_range.insertNode(_span);
		}
		// Adds listener to remove button
		$('#' + _selectedTextRenderObject.buttonId).click(that.removeSelectionBox);

		// Hides the confirmation box
		if (that.confirmationBox)
			that.confirmationBox.remove();

		// Reset temp selection text storage
		that.selectionText = '';

		// Triggers update for local storage
		that.updateLocalStore();
	};

	// Removes all selection boxes
	that.removeAllSelectionBoxes = function (e, silent) {

		// Shows confirmation modal
		var _modal = $('#removeAllSelectionsModal'),
			_confirmedSoDelete = function () {

				// Removes all the snippets from the right hand side
				_selectedTexts.empty();

				// Removes all highlights from the text
				$('span', _textInputArea).each(function() {
					var _text = $(this).text();
					$(this).replaceWith(_text);
				});

				// Removes records from the local storage
				that.savedTexts = {};
				that.updateLocalStore();
			};

		if (silent === true) _confirmedSoDelete();

		else {
			_modal.modal('show');
			$('#yesDeleteAll', _modal).click(_confirmedSoDelete);
		}
	};

	// Listener on remove button for the saved text snippets
	that.removeSelectionBox = function (e) {
		var _id = e.target.id.replace('_button', ''),
			_highlightSpan = $('#' + _id + '_span'),
			_text = _highlightSpan.text();

		// Removes highlight
		_highlightSpan.replaceWith(_text);

		// Removes list elemsn
		$('#' + _id + '_span').remove();
		$(e.target).parents('li').remove();

		// Deletes stored record
		delete that.savedTexts[_id];
		that.updateLocalStore();
	};

	// Resets the selection and hides the confirmation box
	that.resetSelection = function () {

		if (that.confirmationBox)
			that.confirmationBox.remove();

		if (document.selection)
        	document.selection.empty();

    	else if (window.getSelection)
        	window.getSelection().removeAllRanges();

	};

	that.checkSavedTexts();

	return that;
};


// Closure places ready listener on document
(function(){
	$(document).ready(function() {

		// Gets interactive elements
		var _textInputArea = $('#textInput'),
			_selectedTexts = $('#selectedTexts'),
			_removeAllButton = $('#removeAll'),
			_exportButton = $('#export'),
			_importButton = $('#import'),
			_importInput = $('#upload');

		// Instantiates editor class
		var _editor = editor(_selectedTexts, _textInputArea);

		// Adds event listeners to interactive elements
		_textInputArea.on('mouseup', _editor.getText);
		_textInputArea.on('keyup', _editor.handleKeyup);
		_removeAllButton.click(_editor.removeAllSelectionBoxes);
		_exportButton.click(_editor.exportToJson);
		_importButton.click(function() {
			_importInput.click();
		});
		_importInput.change(_editor.uploadFile);

	});
})();