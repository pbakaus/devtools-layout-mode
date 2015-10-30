LayoutMode.registerPlugin({

	activate: function() {

		LayoutMode.currentElement.setAttribute('contentEditable', true);
		LayoutMode.currentElement.style.outline = 'none';

		LayoutMode.currentElement.focus();

		$(document).on('keyup', this.keyup);

	},

	deactivate: function() {

		LayoutMode.currentElement.removeAttribute('contentEditable');
		LayoutMode.currentElement.style.outline = '';

		$(document).off('keyup', this.keyup);

	},

	/* member functions */

	keyup: function() {
		LayoutMode.relayout();
	}

});