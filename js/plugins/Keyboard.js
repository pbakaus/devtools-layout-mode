LayoutMode.registerPlugin({

	create: function() {

	},

	activate: function() {

		LayoutMode.handleSizeBottom[0].onmousedown = function() { that.setActiveHandle('height', this); };
		LayoutMode.handleSizeRight[0].onmousedown = function() { that.setActiveHandle('width', this); };

	},

	deactivate: function() {
		LayoutMode.handleSizeBottom[0].onmousedown = null;
		LayoutMode.handleSizeRight[0].onmousedown = null;
	},

	/* member functions */

	setActiveHandle: function(type, handleElement) {

		// clear previous
		this.clearActiveHandle();

		this.activeHandle = {
			node: handleElement,
			type: type
		};

		handleElement.classList.add('active');

	},

	clearActiveHandle: function() {
		if(this.activeHandle) {
			this.activeHandle.node.classList.remove('active');
			this.activeHandle = null;
		}
	}

});