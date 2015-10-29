LayoutMode.registerPlugin({

	create: function() {

	},

	activate: function() {

	},

	deactivate: function() {

	},

	isVisible: function(node, rects) {

		var offsetTop = rects.top + document.body.scrollTop;
		var offsetLeft = rects.top + document.body.scrollTop;

		if(offsetTop > window.innerHeight ||
			offsetLeft > window.innerWidth ||
			offsetTop + rects.height < 0 ||
			offsetLeft + rects.width < 0) {
			return false;
		}

		return true;

	},

	calculateSnapAreas: function() {

		var that = this;
		var start = document.body;
		var candidates = [];

		var isEligible = function(node, rects) {

			var width = rects.width;
			var height = rects.height;

			if(width < 100 && height < 100) {
				return false;
			}

			if(node.id === 'overlay' ||
				node.className === 'overlay-title' ||
				node === that.currentElement) {
				return false;
			}

			if(!that.isVisible(node, rects)) {
				return false;
			}

			return true;

		};

		var recurse = function(node) {

			// no children? exit
			if(!node.children) {
				return;
			}

			var candidate, rects;
			for (var i = 0; i < node.children.length; i++) {
				candidate = node.children[i];
				rects = candidate.getBoundingClientRect();
				if(isEligible(candidate, rects)) {
					candidates.push([candidate, rects]);
					recurse(candidate);
				}
			}
		};


		recurse(start);
		this.currentSnapTargets = candidates;

	},

	calculateSnap: function(currentValue, axis, add) {

		var offset = this.currentOffset;
		offset.left = parseInt(offset.left);
		var targets = this.currentSnapTargets;
		var target, i;

		if(axis === 'y') {

			for (i = 0; i < targets.length; i++) {
				target = targets[i];

				if(Math.abs(target[1].bottom - (offset.top + add + currentValue)) < 10) {
					currentValue = parseInt(target[1].bottom) - offset.top - add - 3;
					break;
				}

				if(Math.abs(target[1].top - (offset.top + add + currentValue)) < 10) {
					currentValue = parseInt(target[1].top) - offset.top - add - 3;
					break;
				}
			}

		} else {

			for (i = 0; i < targets.length; i++) {
				target = targets[i];

				if(Math.abs(target[1].right - (offset.left + add + currentValue)) < 10) {
					currentValue = parseInt(target[1].right) - offset.left - add - 3;
					break;
				}

				if(Math.abs(target[1].left - (offset.left + add + currentValue)) < 10) {
					currentValue = parseInt(target[1].left) - offset.left - add - 3;
					break;
				}
			}

		}

		return currentValue;

	}

});



