LayoutMode.registerPlugin({

	create: function() {

	},

	activate: function() {


	},

	deactivate: function() {

	},

	enterRule: function() {
		this.createGhosts();
	},

	changeRule: function() {
		this.destroyGhosts();
		this.createGhosts();
	},

	exitRule: function() {
		this.destroyGhosts();
	},

	relayout: function() {
		this.updateGhosts();
	},

	/* member functions */

	ghosts: [],

	createGhosts: function() {
		var ghosts = this.ghosts;
		$(LayoutMode.selectedRule.selectorText).not(LayoutMode.currentElement).not('.overlay, .overlay *').each(function() {
			var ghost = new Ghost(this);
			ghost.relayout();
			ghosts.push(ghost);
		});
	},

	destroyGhosts: function() {
		for (var i = 0; i < this.ghosts.length; i++) {
			this.ghosts[i].destroy();
		}
		this.ghosts = [];
	},

	updateGhosts: function() {
		if(!this.ghosts) return;
		for (var i = 0; i < this.ghosts.length; i++) {
			this.ghosts[i].relayout();
		}		
	}

});