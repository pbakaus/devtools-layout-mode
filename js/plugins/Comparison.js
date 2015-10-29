LayoutMode.registerPlugin({

	create: function() {

		var that = this;

		$(document).on('keydown', function(e) {
			if(e.which === 91) {
				that.enterDimensionMode();
			}
		});

		$(document).on('keyup', function(e) {
			if(e.which === 91) {
				that.exitDimensionMode();
			}
		});

	},

	inspect: function() {

		// if we're holding shift and hover another element, show guides
		if(LayoutMode.commandPressed &&
			LayoutMode.currentElement &&
			this !== LayoutMode.currentElement &&
			!$.contains(this, LayoutMode.currentElement) &&
			!$.contains(LayoutMode.currentElement, this)
		) {
			LayoutMode.visualizeRelationTo(this);
			return false;
		}

	},

	activate: function() {

	},

	deactivate: function() {

	},

	enterDimensionMode: function() {

		this.commandPressed = true;
		this.commandOver = false;

		this.overlayElement.classList.remove('hover', 'hover-inner', 'hover-margin', 'hover-padding');
		this.overlayElement.classList.add('in-command');
		this.hoverGhost.overlayElement.style.visibility = 'hidden';
		this.titleBox.style.opacity = 0;

		if(this.__lastMouseMoveEvent)
			this.processCommandOverLogic(this.__lastMouseMoveEvent);

		if(this.hoverElement !== this.currentElement &&
			!$.contains(this.hoverElement, this.currentElement) &&
			!$.contains(this.currentElement, this.hoverElement)
		) {
			this.visualizeRelationTo(this.hoverElement);
		}

	},

	exitDimensionMode: function() {

		this.commandPressed = false;

		if(this.over) this.overlayElement.classList.add('hover');
		if(this.overInner) this.overlayElement.classList.add('hover-inner');
		if(this.overPadding) this.overlayElement.classList.add('hover-padding');
		if(this.overMargin) this.overlayElement.classList.add('hover-margin');

		this.overlayElement.classList.remove('in-command');

		// edge case: user holds command, moves out, releases command
		if(this.__lastMouseMoveEvent)
			this.processOverLogic(this.__lastMouseMoveEvent);

		this.hoverGhost.overlayElement.style.visibility = '';
		this.titleBox.style.opacity = 1;

		if(this.vLineX) this.vLineX.style.opacity = 0;
		if(this.vLineY) this.vLineY.style.opacity = 0;

	},

	createVisualizationLines: function() {

		if(!this.vLineX) {
			this.vLineX = document.createElement('div');
			this.vLineX.className = 'vline-x';
			document.body.appendChild(this.vLineX);

			this.vLineXCaption = document.createElement('div');
			this.vLineXCaption.className = 'caption';
			this.vLineX.appendChild(this.vLineXCaption);

			this.vLineXCrossBar = document.createElement('div');
			this.vLineXCrossBar.className = 'crossbar';
			this.vLineX.appendChild(this.vLineXCrossBar);
		}

		if(!this.vLineY) {
			this.vLineY = document.createElement('div');
			this.vLineY.className = 'vline-y';
			document.body.appendChild(this.vLineY);

			this.vLineYCaption = document.createElement('div');
			this.vLineYCaption.className = 'caption';
			this.vLineY.appendChild(this.vLineYCaption);

			this.vLineYCrossBar = document.createElement('div');
			this.vLineYCrossBar.className = 'crossbar';
			this.vLineY.appendChild(this.vLineYCrossBar);
		}

	},

	visualizeRelationToWindow: function() {

		var currentElement = this.currentElement;

		this.createVisualizationLines();

		this.vLineX.style.opacity = 1;
		this.vLineX.style.top = (currentElement.offsetTop + (currentElement.offsetHeight / 2)) + 'px';
		this.vLineX.style.left = 0 + 'px';
		this.vLineX.style.width = currentElement.offsetLeft + 'px';
		this.vLineXCaption.innerHTML = currentElement.offsetLeft + ' <span>px</span>';

		this.vLineY.style.opacity = 1;
		this.vLineY.style.left = (currentElement.offsetLeft + (currentElement.offsetWidth / 2)) + 'px';
		this.vLineY.style.top = 0 + 'px';
		this.vLineY.style.height = currentElement.offsetTop + 'px';
		this.vLineYCaption.innerHTML = currentElement.offsetTop + ' <span>px</span>';

	},

	visualizeRelationTo: function(relatedElement) {

		var currentElement = this.currentElement, top, left;

		this.createVisualizationLines();

		var reRightEdge = relatedElement.offsetLeft + relatedElement.offsetWidth;
		var ceRightEdge = currentElement.offsetLeft + currentElement.offsetWidth;
		var reLeftEdge = relatedElement.offsetLeft;
		var ceLeftEdge = currentElement.offsetLeft;

		var reBottomEdge = relatedElement.offsetTop + relatedElement.offsetHeight;
		var ceBottomEdge = currentElement.offsetTop + currentElement.offsetHeight;
		var reTopEdge = relatedElement.offsetTop;
		var ceTopEdge = currentElement.offsetTop;
		
		// horizontal connection
		if(reRightEdge < ceLeftEdge) {

			top = currentElement.offsetTop + (currentElement.offsetHeight / 2);
			this.vLineX.style.opacity = 1;
			this.vLineX.style.top = top + 'px';
			this.vLineX.style.left = reRightEdge + 'px';
			this.vLineX.style.width = ceLeftEdge - reRightEdge + 'px';
			this.vLineXCaption.innerHTML = ceLeftEdge - reRightEdge + ' <span>px</span>';

			if(reBottomEdge < top) {
				this.vLineXCrossBar.style.display = 'block';
				this.vLineXCrossBar.style.left = '0px';
				this.vLineXCrossBar.style.bottom = '0px';
				this.vLineXCrossBar.style.top = 'auto';
				this.vLineXCrossBar.style.height = (currentElement.offsetHeight / 2) + (ceTopEdge - reBottomEdge) + 'px';
			} else if(top < reTopEdge) {
				this.vLineXCrossBar.style.display = 'block';
				this.vLineXCrossBar.style.left = '0px';
				this.vLineXCrossBar.style.top = '0px';
				this.vLineXCrossBar.style.bottom = 'auto';
				this.vLineXCrossBar.style.height = (currentElement.offsetHeight / 2) + (reTopEdge - ceBottomEdge) + 'px';
			} else {
				this.vLineXCrossBar.style.display = 'none';
			}

		} else if(ceRightEdge < reLeftEdge) {

			top = currentElement.offsetTop + (currentElement.offsetHeight / 2);
			this.vLineX.style.opacity = 1;
			this.vLineX.style.top = top + 'px';
			this.vLineX.style.left = ceRightEdge + 'px';
			this.vLineX.style.width = reLeftEdge - ceRightEdge + 'px';
			this.vLineXCaption.innerHTML = reLeftEdge - ceRightEdge + ' <span>px</span>';

			if(reBottomEdge < top) {
				this.vLineXCrossBar.style.display = 'block';
				this.vLineXCrossBar.style.left = '100%';
				this.vLineXCrossBar.style.bottom = '0px';
				this.vLineXCrossBar.style.top = 'auto';
				this.vLineXCrossBar.style.height = (currentElement.offsetHeight / 2) + (ceTopEdge - reBottomEdge) + 'px';
			} else if(top < reTopEdge) {
				this.vLineXCrossBar.style.display = 'block';
				this.vLineXCrossBar.style.left = '100%';
				this.vLineXCrossBar.style.top = '0px';
				this.vLineXCrossBar.style.bottom = 'auto';
				this.vLineXCrossBar.style.height = (currentElement.offsetHeight / 2) + (reTopEdge - ceBottomEdge) + 'px';
			} else {
				this.vLineXCrossBar.style.display = 'none';
			}

		} else {
			this.vLineX.style.opacity = 0;
		}

		// vertical connection
		if(reBottomEdge < ceTopEdge) {

			left = currentElement.offsetLeft + (currentElement.offsetWidth / 2);
			this.vLineY.style.opacity = 1;
			this.vLineY.style.left = left + 'px';
			this.vLineY.style.top = reBottomEdge + 'px';
			this.vLineY.style.height = ceTopEdge - reBottomEdge + 'px';
			this.vLineYCaption.innerHTML = ceTopEdge - reBottomEdge + ' <span>px</span>';

			if(reRightEdge < left) {
				this.vLineYCrossBar.style.display = 'block';
				this.vLineYCrossBar.style.top = '0px';
				this.vLineYCrossBar.style.right = '0px';
				this.vLineYCrossBar.style.left = 'auto';
				this.vLineYCrossBar.style.width = (currentElement.offsetWidth / 2) + (ceLeftEdge - reRightEdge) + 'px';
			} else if(left < reLeftEdge) {
				this.vLineYCrossBar.style.display = 'block';
				this.vLineYCrossBar.style.top = '0px';
				this.vLineYCrossBar.style.left = '0px';
				this.vLineYCrossBar.style.right = 'auto';
				this.vLineYCrossBar.style.width = (currentElement.offsetWidth / 2) + (reLeftEdge - ceRightEdge) + 'px';
			} else {
				this.vLineYCrossBar.style.display = 'none';
			}

		} else if(ceBottomEdge < reTopEdge) {

			left = currentElement.offsetLeft + (currentElement.offsetWidth / 2);
			this.vLineY.style.opacity = 1;
			this.vLineY.style.left = left + 'px';
			this.vLineY.style.top = ceBottomEdge + 'px';
			this.vLineY.style.height = reTopEdge - ceBottomEdge + 'px';
			this.vLineYCaption.innerHTML = reTopEdge - ceBottomEdge + ' <span>px</span>';

			if(reRightEdge < left) {
				this.vLineYCrossBar.style.display = 'block';
				this.vLineYCrossBar.style.top = '100%';
				this.vLineYCrossBar.style.right = '0px';
				this.vLineYCrossBar.style.left = 'auto';
				this.vLineYCrossBar.style.width = (currentElement.offsetWidth / 2) + (ceLeftEdge - reRightEdge) + 'px';
			} else if(left < reLeftEdge) {
				this.vLineYCrossBar.style.display = 'block';
				this.vLineYCrossBar.style.top = '100%';
				this.vLineYCrossBar.style.left = '0px';
				this.vLineYCrossBar.style.right = 'auto';
				this.vLineYCrossBar.style.width = (currentElement.offsetWidth / 2) + (reLeftEdge - ceRightEdge) + 'px';
			} else {
				this.vLineYCrossBar.style.display = 'none';
			}

		} else {
			this.vLineY.style.opacity = 0;
		}

	},

	processCommandOverLogic: function(e) {

		var extraMargin = 10;
		var offset = this.currentOffset;

		// command over/out

		if(
			e.pageX > offset.left - this.marginLeft - extraMargin &&
			e.pageY > offset.top - this.marginTop - extraMargin &&
			e.pageX < (offset.left + this.outerWidth + this.marginRight + extraMargin) &&
			e.pageY < (offset.top + this.outerHeight + this.marginBottom + extraMargin)
		) {

			if(!this.commandOver) {
				this.commandOver = true;
				this.visualizeRelationToWindow();
			}

		} else {

			if(this.commandOver) {
				this.commandOver = false;
			}

		}

	}

});