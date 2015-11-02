LayoutMode.registerPlugin({

	priority: 1,

	create: function() {

		this.handlePaddingBottom = $('<div class="handle bottom handle-padding"></div>').appendTo(LayoutMode.overlayElement);
		this.handlePaddingRight = $('<div class="handle right handle-padding"></div>').appendTo(LayoutMode.overlayElement);
		this.handlePaddingTop = $('<div class="handle top handle-padding"></div>').appendTo(LayoutMode.overlayElement);
		this.handlePaddingLeft = $('<div class="handle left handle-padding"></div>').appendTo(LayoutMode.overlayElement);

		var that = this;
		this.handlePaddingTop.hover(function() {
			that.overTopHandle = true;
		}, function() {
			that.overTopHandle = false;
		});
		this.handlePaddingBottom.hover(function() {
			that.overBottomHandle = true;
		}, function() {
			that.overBottomHandle = false;
		});
		this.handlePaddingLeft.hover(function() {
			that.overLeftHandle = true;
		}, function() {
			that.overLeftHandle = false;
		});
		this.handlePaddingRight.hover(function() {
			that.overRightHandle = true;
		}, function() {
			that.overRightHandle = false;
		});

		this.captionPaddingLeft = $('<div class="caption caption-padding left"></div>').appendTo(LayoutMode.overlayElement)[0];
		this.captionPaddingRight = $('<div class="caption caption-padding right"></div>').appendTo(LayoutMode.overlayElement)[0];
		this.captionPaddingTop = $('<div class="caption caption-padding top"></div>').appendTo(LayoutMode.overlayElement)[0];
		this.captionPaddingBottom = $('<div class="caption caption-padding bottom"></div>').appendTo(LayoutMode.overlayElement)[0];

		this.initDraggers();

	},

	deactivate: function() {
		this.overPadding = false;
		LayoutMode.overPadding = false;
		LayoutMode.overlayElement.classList.remove('hover-padding');
	},

	show: function() {
		if(this.overPadding) LayoutMode.overlayElement.classList.add('hover-padding');
	},

	hide: function() {
		LayoutMode.overlayElement.classList.remove('hover-padding');
	},

	mousemove: function(e) {

		var offset = LayoutMode.currentOffset;
		var wiggle = 5;

		var overLineTop = (
			e.pageY > offset.top - 5 &&
			e.pageY < offset.top + 5
		);

		var overLineBottom = (
			e.pageY > offset.top + LayoutMode.outerHeight - wiggle &&
			e.pageY < offset.top + LayoutMode.outerHeight + wiggle
		);

		var overLineLeft = (
			e.pageX > offset.left - wiggle &&
			e.pageX < offset.left + wiggle
		);

		var overLineRight = (
			e.pageX > offset.left + LayoutMode.outerWidth - wiggle &&
			e.pageX < offset.left + LayoutMode.outerWidth + wiggle
		);

		// top padding box
		var overPaddingTop = (
			e.pageX > offset.left + LayoutMode.paddingLeft && //left side
			e.pageX < offset.left + LayoutMode.paddingLeft + LayoutMode.innerWidth && // right side
			e.pageY > offset.top && // top side
			e.pageY < offset.top + LayoutMode.paddingTop // bottom side
		) || this.overTopHandle || overLineTop;

		// bottom padding box
		var overPaddingBottom = (
			e.pageX > offset.left + LayoutMode.paddingLeft && //left side
			e.pageX < offset.left + LayoutMode.paddingLeft + LayoutMode.innerWidth && // right side
			e.pageY > offset.top + LayoutMode.outerHeight - LayoutMode.paddingBottom && // top side
			e.pageY < offset.top + LayoutMode.outerHeight // bottom side
		) || this.overBottomHandle || overLineBottom;

		// left padding box
		var overPaddingLeft = (
			e.pageY > offset.top + LayoutMode.paddingTop && //left side
			e.pageY < offset.top + LayoutMode.paddingTop + LayoutMode.innerHeight && // right side
			e.pageX > offset.left && // top side
			e.pageX < offset.left + LayoutMode.paddingLeft // bottom side
		) || this.overLeftHandle || overLineLeft;

		// right padding box
		var overPaddingRight = (
			e.pageY > offset.top + LayoutMode.paddingTop && //left side
			e.pageY < offset.top + LayoutMode.paddingTop + LayoutMode.innerHeight && // right side
			e.pageX > offset.left + LayoutMode.outerWidth - LayoutMode.paddingRight && // top side
			e.pageX < offset.left + LayoutMode.outerWidth // bottom side
		) || this.overRightHandle || overLineRight;

		var notOverCompetingHandle = !LayoutMode.overSize && !e.target.classList.contains('handle-margin');

		// if over any padding area, show padding handles
		if(
			(overPaddingTop ||
			overPaddingBottom ||
			overPaddingLeft ||
			overPaddingRight) && notOverCompetingHandle
		) {
			if(!this.overPadding) {
				LayoutMode.overlayElement.classList.add('hover-padding');
				this.overPadding = true;
				LayoutMode.overPadding = true;
			}
		} else {
			if(this.overPadding) {
				this.overPadding = false;
				LayoutMode.overPadding = false;
				LayoutMode.overlayElement.classList.remove('hover-padding');		
			}
		}

		var cursorAdded = false;
		var cursorRemoved = false;

		if(overPaddingTop && notOverCompetingHandle) {
			if(!this.overPaddingTop) {
				this.overPaddingTop = true;
				this.captionPaddingTop.classList.add('over');
				document.body.classList.add('resize-padding-top');
				LayoutMode.selectRule('paddingTop');
				cursorAdded = true;
			}
		} else {
			if(this.overPaddingTop) {
				this.overPaddingTop = false;
				this.captionPaddingTop.classList.remove('over');
				LayoutMode.deselectRule('paddingTop');
				cursorRemoved = true;
			}
		}

		if(overPaddingBottom && notOverCompetingHandle) {
			if(!this.overPaddingBottom) {
				this.overPaddingBottom = true;
				this.captionPaddingBottom.classList.add('over');
				document.body.classList.add('resize-padding-bottom');
				LayoutMode.selectRule('paddingBottom');
				cursorAdded = true;
			}
		} else {
			if(this.overPaddingBottom) {
				this.overPaddingBottom = false;
				this.captionPaddingBottom.classList.remove('over');
				LayoutMode.deselectRule('paddingBottom');
				cursorRemoved = true;
			}
		}

		if(overPaddingLeft && notOverCompetingHandle) {
			if(!this.overPaddingLeft) {
				this.overPaddingLeft = true;
				this.captionPaddingLeft.classList.add('over');
				document.body.classList.add('resize-padding-left');
				LayoutMode.selectRule('paddingLeft');
				cursorAdded = true;
			}
		} else {
			if(this.overPaddingLeft) {
				this.overPaddingLeft = false;
				this.captionPaddingLeft.classList.remove('over');
				LayoutMode.deselectRule('paddingLeft');
				cursorRemoved = true;
			}
		}

		if(overPaddingRight && notOverCompetingHandle) {
			if(!this.overPaddingRight) {
				this.overPaddingRight = true;
				this.captionPaddingRight.classList.add('over');
				document.body.classList.add('resize-padding-right');
				LayoutMode.selectRule('paddingRight');
				cursorAdded = true;
			}
		} else {
			if(this.overPaddingRight) {
				this.overPaddingRight = false;
				this.captionPaddingRight.classList.remove('over');
				LayoutMode.deselectRule('paddingRight');
				cursorRemoved = true;
			}
		}

		if(!cursorAdded && cursorRemoved) {
			document.body.classList.remove('resize-padding-top', 'resize-padding-bottom', 'resize-padding-left', 'resize-padding-right');
		}

	},

	relayout: function(props, handleSize) {

		this.handlePaddingLeft[0].style.height = handleSize.y + 'px';
		this.handlePaddingRight[0].style.height = handleSize.y + 'px';
		this.handlePaddingTop[0].style.width = handleSize.x + 'px';
		this.handlePaddingBottom[0].style.width = handleSize.x + 'px';

		this.handlePaddingLeft[0].style.transform = 'translate(' + -props.paddingLeft + 'px, 0px)';
		this.handlePaddingRight[0].style.marginRight = -props.paddingRight + 'px';
		this.handlePaddingTop[0].style.transform = 'translate(0px, ' + -props.paddingTop + 'px)';
		this.handlePaddingBottom[0].style.marginBottom =  -props.paddingBottom + 'px';

		this.handlePaddingLeft[0].style.marginTop = -(handleSize.y / 2) + 'px';
		this.handlePaddingRight[0].style.marginTop = -(handleSize.y / 2) + 'px';
		this.handlePaddingTop[0].style.marginLeft = -(handleSize.x / 2) + 'px';
		this.handlePaddingBottom[0].style.marginLeft = -(handleSize.x / 2) + 'px';

		this.refreshCaptions();

	},

	/* member functions */

	refreshCaptions: function() {

		var offset = LayoutMode.currentOffset;

		// captions
		var hitsRightEdge, hitsLeftEdge;

		this.captionPaddingLeft.innerHTML = '<span>padding-left: </span>' + LayoutMode.getCaptionProperty('paddingLeft');
		this.captionPaddingRight.innerHTML = '<span>padding-right: </span>' + LayoutMode.getCaptionProperty('paddingRight');
		this.captionPaddingTop.innerHTML = '<span>padding-top: </span>' + LayoutMode.getCaptionProperty('paddingTop');
		this.captionPaddingBottom.innerHTML = '<span>padding-bottom: </span>' + LayoutMode.getCaptionProperty('paddingBottom');

		hitsLeftEdge = (offset.left - 80 < 0);
		this.captionPaddingLeft.classList[hitsLeftEdge ? 'add' : 'remove']('edge');
		this.captionPaddingLeft.style.marginRight = (hitsLeftEdge ? LayoutMode.paddingLeft - this.captionPaddingLeft.offsetWidth-16 : LayoutMode.paddingLeft + 14) + 'px';

		hitsRightEdge = (offset.left + LayoutMode.outerWidth + 80 > window.innerWidth);
		this.captionPaddingRight.classList[hitsRightEdge ? 'add' : 'remove']('edge');
		this.captionPaddingRight.style.marginLeft = (hitsRightEdge ? LayoutMode.paddingRight - this.captionPaddingRight.offsetWidth-16 : LayoutMode.paddingRight + 14) + 'px';

		this.captionPaddingBottom.style.bottom = -(LayoutMode.paddingBottom  + 24) + 'px';
		this.captionPaddingTop.style.top = -(LayoutMode.paddingTop  + 24) + 'px';

	},

	initDraggers: function() {

		var that = this;
		var isTouch = 'ontouchstart' in document;

		// padding bottom
		$(document).on(isTouch ? 'touchstart' : 'mousedown', function(event) {

			var startPaddingBottom,
				startPaddingTop,
				startPaddingRight,
				startPaddingLeft;

			if(that.overPaddingBottom) {

				startPaddingBottom = LayoutMode.paddingBottom;
				startPaddingTop = LayoutMode.paddingTop;

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.paddingBottom = Math.round(Math.max(0, startPaddingBottom - delta)) + 'px';
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.paddingTop = LayoutMode.altPressed ? Math.round(Math.max(0, startPaddingBottom - delta)) + 'px' : startPaddingTop + 'px';
						LayoutMode.relayout();
					}
				});

			}

			if(that.overPaddingTop) {

				startPaddingTop = LayoutMode.paddingTop;
				startPaddingBottom = LayoutMode.paddingBottom;

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.paddingTop = Math.round(Math.max(0, startPaddingTop + delta)) + 'px';
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.paddingBottom = LayoutMode.altPressed ? Math.round(Math.max(0, startPaddingTop + delta)) + 'px' : startPaddingBottom + 'px';
						LayoutMode.relayout();
					}
				});

			}

			if(that.overPaddingRight) {

				startPaddingRight = LayoutMode.paddingRight;
				startPaddingLeft = LayoutMode.paddingLeft;

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.paddingRight = Math.round(Math.max(0, startPaddingRight - delta)) + 'px';
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.paddingLeft = LayoutMode.altPressed ? Math.round(Math.max(0, startPaddingRight - delta)) + 'px' : startPaddingLeft + 'px';
						LayoutMode.relayout();
					}
				});

			}

			if(that.overPaddingLeft) {

				startPaddingLeft = LayoutMode.paddingLeft;
				startPaddingRight = LayoutMode.paddingRight;

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.paddingLeft = Math.round(Math.max(0, startPaddingLeft + delta)) + 'px';
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.paddingRight = LayoutMode.altPressed ? Math.round(Math.max(0, startPaddingLeft + delta)) + 'px' : startPaddingRight + 'px';
						LayoutMode.relayout();
					}
				});

			}

		});

	}

});