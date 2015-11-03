LayoutMode.registerPlugin({

	create: function() {

	},

	activate: function() {

		this.calculateSnapAreas();

	},

	changeValue: function(property, value, precision) {

		// precision is set if we do keyboard, for instance.
		// don't apply snap there.
		if(precision) {
			return;
		}
		
		var axis = /(width|paddingLeft|paddingRight|marginLeft|marginRight)/.test(property) ? 'x' : 'y';
		return parseInt(this.calculateSnap(property, value, axis));

	},

	/* member functions */
	__previousTargets: [],

	flash: function(target, edge) {

		// don't flash a target twice in a row
		if(this.__previousTargets.indexOf(target) > -1) {
			return;
		}

		this.__previousTargets.push(target);

		// delay execution of the flash, or the value isn't applied yet
		// and the corrected offsets are wrong.

		var that = this;
		setTimeout(function() {

			// refresh rect or the offsets might be wrong
			target[1] = target[0].getBoundingClientRect();

			if(edge === 'width') {

				var vLineX = document.createElement('div');
				vLineX.className = 'vline-x';
				document.body.appendChild(vLineX);

				var vLineXCaption = document.createElement('div');
				vLineXCaption.className = 'caption';
				vLineX.appendChild(vLineXCaption);

				var vLineXCrossBar = document.createElement('div');
				vLineXCrossBar.className = 'crossbar';
				vLineX.appendChild(vLineXCrossBar);

				vLineX.style.top = (target[1].top + (target[1].height / 2)) + 'px';
				vLineX.style.left = target[1].left + 'px';
				vLineX.style.width = target[1][edge] + 'px';
				vLineXCaption.innerHTML = target[1][edge] + ' <span>px</span>';

				// to a hide animation, then remove the DOM element and allow it
				// to appear again.
				setTimeout(function() {  vLineX.classList.add('hide'); }, 600);
				setTimeout(function() {
					document.body.removeChild(vLineX);
					var index = that.__previousTargets.indexOf(target);
					if (index > -1) {
						that.__previousTargets.splice(index, 1);
					}
				}, 800);

			}

			if(edge === 'height') {

				var vLineY = document.createElement('div');
				vLineY.className = 'vline-y';
				document.body.appendChild(vLineY);

				var vLineYCaption = document.createElement('div');
				vLineYCaption.className = 'caption';
				vLineY.appendChild(vLineYCaption);

				var vLineYCrossBar = document.createElement('div');
				vLineYCrossBar.className = 'crossbar';
				vLineY.appendChild(vLineYCrossBar);

				vLineY.style.left = (target[1].left + (target[1].width / 2)) + 'px';
				vLineY.style.top = target[1].top + 'px';
				vLineY.style.height = target[1][edge] + 'px';
				vLineYCaption.innerHTML = target[1][edge] + ' <span>px</span>';

				// to a hide animation, then remove the DOM element and allow it
				// to appear again.
				setTimeout(function() {  vLineY.classList.add('hide'); }, 600);
				setTimeout(function() {
					document.body.removeChild(vLineY);
					var index = that.__previousTargets.indexOf(target);
					if (index > -1) {
						that.__previousTargets.splice(index, 1);
					}
				}, 800);

			}

		}, 0);




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
				node === LayoutMode.currentElement) {
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

	calculateSnap: function(property, currentValue, axis) {

		var threshold = 5;
		var targets = this.currentSnapTargets;
		var target, i;

		if(axis === 'y') {

			for (i = 0; i < targets.length; i++) {
				target = targets[i];

				if(property === 'height') {
					if(Math.abs(target[1].height - (currentValue)) <= threshold) {
						currentValue = target[1].height;
						this.flash(target, 'height');
					}
				}

				if(property === 'paddingTop') {
					if(Math.abs(target[1].height - (LayoutMode.paddingTop + LayoutMode.innerHeight + currentValue)) <= threshold) {
						currentValue = target[1].height - (LayoutMode.paddingTop + LayoutMode.innerHeight);
						this.flash(target, 'height');
					}
				}

				if(property === 'paddingBottom') {
					if(Math.abs(target[1].height - (LayoutMode.paddingBottom + LayoutMode.innerHeight + currentValue)) <= threshold) {
						currentValue = target[1].height - (LayoutMode.paddingBottom + LayoutMode.innerHeight);
						this.flash(target, 'height');
					}
				}

			}

		} else {

			for (i = 0; i < targets.length; i++) {
				target = targets[i];

				if(property === 'width') {
					if(Math.abs(target[1].width - (currentValue)) <= threshold) {
						currentValue = target[1].width;
						this.flash(target, 'width');
					}
				}

				if(property === 'paddingLeft') {
					if(Math.abs(target[1].width - (LayoutMode.paddingRight + LayoutMode.innerWidth + currentValue)) <= threshold) {
						currentValue = target[1].width - (LayoutMode.paddingRight + LayoutMode.innerWidth);
						this.flash(target, 'width');
					}
				}

				if(property === 'paddingRight') {
					if(Math.abs(target[1].width - (LayoutMode.paddingLeft + LayoutMode.innerWidth + currentValue)) <= threshold) {
						currentValue = target[1].width - (LayoutMode.paddingLeft + LayoutMode.innerWidth);
						this.flash(target, 'width');
					}
				}

			}

		}

		return currentValue;

	}

});



