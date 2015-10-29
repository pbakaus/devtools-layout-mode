(function() {

	// make all elements on page inspectable
	$('body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)').on('mouseover', function() {

		LayoutMode.hoverElement = this;

		// in normal mode, don't activate the hover ghost when interacting or over the current el
		if(LayoutMode.hoverGhost.currentElement === this || LayoutMode.interacting || LayoutMode.over)
			return;

		LayoutMode.hoverGhost.relayout(this);

		return false;

	});

	// make all elements on page inspectable
	$('body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)').on('click', function() {

		if(LayoutMode.currentElement === this)
			return false;

		if(LayoutMode.currentElement) {
			LayoutMode.deactivate();
		}

		// sync on the element
		LayoutMode.activate(this);

		return false;

	});

	//$('ul').sortable();
	$('#testbox').click();


})();


