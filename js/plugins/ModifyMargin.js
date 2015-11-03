LayoutMode.registerPlugin({

	priority: 2,

	create: function() {

		this.handleMarginBottom = $('<div class="handle bottom handle-margin"></div>').appendTo(LayoutMode.overlayElement);
		this.handleMarginRight = $('<div class="handle right handle-margin"></div>').appendTo(LayoutMode.overlayElement);
		this.handleMarginTop = $('<div class="handle top handle-margin"></div>').appendTo(LayoutMode.overlayElement);
		this.handleMarginLeft = $('<div class="handle left handle-margin"></div>').appendTo(LayoutMode.overlayElement);

		var that = this;
		this.handleMarginTop.hover(function() {
			that.overTopHandle = true;
		}, function() {
			that.overTopHandle = false;
		});
		this.handleMarginBottom.hover(function() {
			that.overBottomHandle = true;
		}, function() {
			that.overBottomHandle = false;
		});
		this.handleMarginLeft.hover(function() {
			that.overLeftHandle = true;
		}, function() {
			that.overLeftHandle = false;
		});
		this.handleMarginRight.hover(function() {
			that.overRightHandle = true;
		}, function() {
			that.overRightHandle = false;
		});

		this.captionMarginLeft = $('<div class="caption caption-margin left"></div>').appendTo(LayoutMode.overlayElement)[0];
		this.captionMarginRight = $('<div class="caption caption-margin right"></div>').appendTo(LayoutMode.overlayElement)[0];
		this.captionMarginTop = $('<div class="caption caption-margin top"></div>').appendTo(LayoutMode.overlayElement)[0];
		this.captionMarginBottom = $('<div class="caption caption-margin bottom"></div>').appendTo(LayoutMode.overlayElement)[0];

		this.initDraggers();

	},

	deactivate: function() {
		this.overMargin = false;
		LayoutMode.overlayElement.classList.remove('hover-margin');
	},

	show: function() {
		if(this.overMargin) LayoutMode.overlayElement.classList.add('hover-margin');
	},

	hide: function() {
		LayoutMode.overlayElement.classList.remove('hover-margin');
	},

	mousemove: function(e) {

		var offset = LayoutMode.currentOffset;
		var wiggle = 5;

		var overLineTop = (
			e.pageY > offset.top - LayoutMode.marginTop - wiggle &&
			e.pageY < offset.top - LayoutMode.marginTop + wiggle
		);

		var overLineBottom = (
			e.pageY > offset.top + LayoutMode.outerHeight + LayoutMode.marginBottom - wiggle &&
			e.pageY < offset.top + LayoutMode.outerHeight + LayoutMode.marginBottom + wiggle
		);

		var overLineLeft = (
			e.pageX > offset.left - LayoutMode.marginLeft - wiggle &&
			e.pageX < offset.left - LayoutMode.marginLeft + wiggle
		);

		var overLineRight = (
			e.pageX > offset.left + LayoutMode.outerWidth + LayoutMode.marginRight - wiggle &&
			e.pageX < offset.left + LayoutMode.outerWidth + LayoutMode.marginRight + wiggle
		);

		// top margin box
		var overMarginTop = (
			e.pageX > offset.left && //left side
			e.pageX < offset.left + LayoutMode.outerWidth && // right side
			e.pageY > offset.top - LayoutMode.marginTop && // top side
			e.pageY < offset.top // bottom side
		) || this.overTopHandle || overLineTop;

		// bottom margin box
		var overMarginBottom = (
			e.pageX > offset.left && //left side
			e.pageX < offset.left + LayoutMode.outerWidth && // right side
			e.pageY > offset.top + LayoutMode.outerHeight && // top side
			e.pageY < offset.top + LayoutMode.outerHeight + LayoutMode.marginBottom // bottom side
		) || this.overBottomHandle || overLineBottom;

		// left margin box
		var overMarginLeft = (
			e.pageY > offset.top && //left side
			e.pageY < offset.top + LayoutMode.outerHeight && // right side
			e.pageX > offset.left - LayoutMode.marginLeft && // top side
			e.pageX < offset.left // bottom side
		) || this.overLeftHandle || overLineLeft;

		// right margin box
		var overMarginRight = (
			e.pageY > offset.top && //left side
			e.pageY < offset.top + LayoutMode.outerHeight && // right side
			e.pageX > offset.left + LayoutMode.outerWidth && // top side
			e.pageX < offset.left + LayoutMode.outerWidth + LayoutMode.marginRight // bottom side
		) || this.overRightHandle || overLineRight;

		var notOverCompetingHandle = !LayoutMode.overSize && !LayoutMode.overPadding && !e.target.classList.contains('handle-padding');

		// if over any margin area, show margin handles
		if(
			(overMarginTop ||
			overMarginBottom ||
			overMarginLeft ||
			overMarginRight) && notOverCompetingHandle
		) {
			if(!this.overMargin) {
				LayoutMode.overlayElement.classList.add('hover-margin');
				this.overMargin = true;
			}
		} else {
			if(this.overMargin) {
				this.overMargin = false;
				LayoutMode.overlayElement.classList.remove('hover-margin');		
			}
		}

		var cursorAdded = false;
		var cursorRemoved = false;

		if(overMarginTop && notOverCompetingHandle) {
			if(!this.overMarginTop) {
				this.overMarginTop = true;
				this.captionMarginTop.classList.add('over');
				document.body.classList.add('resize-margin-top');
				LayoutMode.selectRule('marginTop');
				cursorAdded = true;
			}
		} else {
			if(this.overMarginTop) {
				this.overMarginTop = false;
				this.captionMarginTop.classList.remove('over');
				LayoutMode.deselectRule('marginTop');
				cursorRemoved = true;
			}
		}

		if(overMarginBottom && notOverCompetingHandle) {
			if(!this.overMarginBottom) {
				this.overMarginBottom = true;
				this.captionMarginBottom.classList.add('over');
				document.body.classList.add('resize-margin-bottom');
				LayoutMode.selectRule('marginBottom');
				cursorAdded = true;
			}
		} else {
			if(this.overMarginBottom) {
				this.overMarginBottom = false;
				this.captionMarginBottom.classList.remove('over');
				LayoutMode.deselectRule('marginBottom');
				cursorRemoved = true;
			}
		}

		if(overMarginLeft && notOverCompetingHandle) {
			if(!this.overMarginLeft) {
				this.overMarginLeft = true;
				this.captionMarginLeft.classList.add('over');
				document.body.classList.add('resize-margin-left');
				LayoutMode.selectRule('marginLeft');
				cursorAdded = true;
			}
		} else {
			if(this.overMarginLeft) {
				this.overMarginLeft = false;
				this.captionMarginLeft.classList.remove('over');
				LayoutMode.deselectRule('marginLeft');
				cursorRemoved = true;
			}
		}

		if(overMarginRight && notOverCompetingHandle) {
			if(!this.overMarginRight) {
				this.overMarginRight = true;
				this.captionMarginRight.classList.add('over');
				document.body.classList.add('resize-margin-right');
				LayoutMode.selectRule('marginRight');
				cursorAdded = true;
			}
		} else {
			if(this.overMarginRight) {
				this.overMarginRight = false;
				this.captionMarginRight.classList.remove('over');
				LayoutMode.deselectRule('marginRight');
				cursorRemoved = true;
			}
		}

		if(!cursorAdded && cursorRemoved) {
			document.body.classList.remove('resize-margin-top', 'resize-margin-bottom', 'resize-margin-left', 'resize-margin-right');
		}

	},

	relayout: function(props, handleSize) {

		this.handleMarginLeft[0].style.height = handleSize.y + 'px';
		this.handleMarginRight[0].style.height = handleSize.y + 'px';
		this.handleMarginTop[0].style.width = handleSize.x + 'px';
		this.handleMarginBottom[0].style.width = handleSize.x + 'px';

		this.handleMarginLeft[0].style.marginLeft = -(props.paddingLeft + props.marginLeft) + 'px';
		this.handleMarginRight[0].style.marginRight = -(props.paddingRight + props.marginRight) + 'px';
		this.handleMarginTop[0].style.marginTop = -(props.paddingTop + props.marginTop) + 'px';
		this.handleMarginBottom[0].style.marginBottom = -(props.paddingBottom + props.marginBottom) + 'px';

		// offset magic
		this.handleMarginLeft[0].style.marginTop = (props.marginLeft < 20 ? (-(((handleSize.y / 4) * props.marginLeft) / 5) + (handleSize.y / 2)) : -(handleSize.y / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
		this.captionMarginLeft.style.marginTop = (props.marginLeft < 20 ? (-(((handleSize.y / 4) * props.marginLeft) / 5) - 8 + handleSize.y) : -8) + 'px';
		
		this.handleMarginRight[0].style.marginTop = (props.marginRight < 20 ? (-(((handleSize.y / 4) * props.marginRight) / 5) + (handleSize.y / 2)) : -(handleSize.y / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
		this.captionMarginRight.style.marginTop = (props.marginRight < 20 ? (-(((handleSize.y / 4) * props.marginRight) / 5) - 8 + handleSize.y) : -8) + 'px';
		
		this.handleMarginTop[0].style.marginLeft = (props.marginTop < 20 ? (-(((handleSize.x / 4) * props.marginTop) / 5) + (handleSize.x / 2)) : -(handleSize.x / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
		this.captionMarginTop.style.marginLeft = (props.marginTop < 20 ? ((handleSize.x) + (-(handleSize.x) * (props.marginTop / 20)) - 8) : -11) + 'px';
		
		this.handleMarginBottom[0].style.marginLeft = (props.marginBottom < 20 ? (-(((handleSize.x / 4) * props.marginBottom) / 5) + (handleSize.x / 2)) : -(handleSize.x / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
		this.captionMarginBottom.style.marginLeft = (props.marginBottom < 20 ? ((handleSize.x) + (-(handleSize.x) * (props.marginBottom / 20)) - 8) : -11) + 'px';

		this.refreshCaptions();

	},

	/* member functions */

	refreshCaptions: function() {

		var offset = LayoutMode.currentOffset;

		// captions
		var hitsRightEdge, hitsLeftEdge;

		this.captionMarginLeft.innerHTML = '<span>margin-left: </span>' + LayoutMode.getCaptionProperty('marginLeft');
		this.captionMarginRight.innerHTML = '<span>margin-right: </span>' + LayoutMode.getCaptionProperty('marginRight');
		this.captionMarginTop.innerHTML = '<span>margin-top: </span>' + LayoutMode.getCaptionProperty('marginTop');
		this.captionMarginBottom.innerHTML = '<span>margin-bottom: </span>' + LayoutMode.getCaptionProperty('marginBottom');

		hitsLeftEdge = (offset.left - LayoutMode.marginLeft - 80 < 0);
		this.captionMarginLeft.classList[hitsLeftEdge ? 'add' : 'remove']('edge');
		this.captionMarginLeft.style.marginRight = LayoutMode.paddingLeft + LayoutMode.marginLeft + (hitsLeftEdge ? -this.captionMarginLeft.offsetWidth-17 : 14) + 'px';

		hitsRightEdge = (offset.left + LayoutMode.outerWidth + LayoutMode.marginRight + 80 > window.innerWidth);
		this.captionMarginRight.classList[hitsRightEdge ? 'add' : 'remove']('edge');
		this.captionMarginRight.style.marginLeft = LayoutMode.paddingRight + LayoutMode.marginRight + (hitsRightEdge ? -this.captionMarginRight.offsetWidth-17 : 14) + 'px';

		this.captionMarginBottom.style.bottom = -LayoutMode.marginBottom -LayoutMode.paddingBottom -24 + 'px';
		this.captionMarginTop.style.top = -LayoutMode.marginTop -LayoutMode.paddingTop -24 + 'px';

	},

	initDraggers: function() {

		var that = this;
		var isTouch = 'ontouchstart' in document;

		// padding bottom
		$(document).on(isTouch ? 'touchstart' : 'mousedown', function(event) {

			var startMarginRight,
				startMarginLeft,
				startMarginBottom,
				startMarginTop;

			if(that.overMarginLeft) {

				startMarginLeft = LayoutMode.marginLeft;
				startMarginRight = LayoutMode.marginRight;
				LayoutMode.setLastActiveProperty('marginLeft');

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('marginLeft', startMarginLeft + delta);
						LayoutMode.changeValue('marginRight', LayoutMode.altPressed ? startMarginLeft + delta : startMarginRight, true);
						LayoutMode.relayout();
					}
				});

			}

			if(that.overMarginRight) {

				startMarginLeft = LayoutMode.marginLeft;
				startMarginRight = LayoutMode.marginRight;
				LayoutMode.setLastActiveProperty('marginRight');

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('marginRight', startMarginRight - delta);
						LayoutMode.changeValue('marginLeft', LayoutMode.altPressed ? startMarginRight - delta : startMarginLeft, true);
						LayoutMode.relayout();
					}
				});

			}

			if(that.overMarginTop) {

				startMarginTop = LayoutMode.marginTop;
				startMarginBottom = LayoutMode.marginBottom;
				LayoutMode.setLastActiveProperty('marginTop');

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('marginTop', startMarginTop + delta);
						LayoutMode.changeValue('marginBottom', LayoutMode.altPressed ? startMarginTop + delta : startMarginBottom, true);
						LayoutMode.relayout();
					}
				});

			}

			if(that.overMarginBottom) {

				startMarginTop = LayoutMode.marginTop;
				startMarginBottom = LayoutMode.marginBottom;
				LayoutMode.setLastActiveProperty('marginBottom');

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('marginBottom', startMarginBottom - delta);
						LayoutMode.changeValue('marginTop', LayoutMode.altPressed ? startMarginBottom - delta : startMarginTop, true);
						LayoutMode.relayout();
					}
				});

			}

		});

	}

});