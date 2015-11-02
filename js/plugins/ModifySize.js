LayoutMode.registerPlugin({

	priority: 0,

	create: function() {

		this.handleHeight = $('<div class="handle bottom handle-size"></div>').appendTo(LayoutMode.overlayElement);
		this.handleWidth = $('<div class="handle right handle-size"></div>').appendTo(LayoutMode.overlayElement);

		this.captionWidth = $('<div class="caption caption-width"></div>').appendTo(LayoutMode.overlayElement)[0];
		this.captionHeight = $('<div class="caption caption-height"></div>').appendTo(LayoutMode.overlayElement)[0];

		this.initDraggers();

	},

	deactivate: function() {
		this.overInner = false;
		LayoutMode.overSize = false;
		LayoutMode.overlayElement.classList.remove('hover-inner');
	},

	show: function() {
		if(this.overInner) LayoutMode.overlayElement.classList.add('hover-inner');
	},

	hide: function() {
		LayoutMode.overlayElement.classList.remove('hover-inner');
	},

	mousemove: function(e) {

		var offset = LayoutMode.currentOffset;

		// over inner box
		if(
			e.pageX > offset.left + LayoutMode.paddingLeft &&
			e.pageY > offset.top + LayoutMode.paddingTop &&
			e.pageX < (offset.left + LayoutMode.outerWidth - LayoutMode.paddingRight) &&
			e.pageY < (offset.top + LayoutMode.outerHeight - LayoutMode.paddingBottom) &&
			!e.target.classList.contains('handle-padding') &&
			!e.target.classList.contains('handle-margin')
		) {
			if(!this.overInner) {
				LayoutMode.overlayElement.classList.add('hover-inner');
				this.overInner = true;
			}
		} else {
			if(this.overInner) {
				this.overInner = false;
				LayoutMode.overlayElement.classList.remove('hover-inner');
			}
		}

		this.processOverWidth(e);
		this.processOverHeight(e);

	},

	relayout: function(props, handleSize) {

		this.handleWidth[0].style.height = handleSize.y + 'px';
		this.handleHeight[0].style.width = handleSize.x + 'px';

		this.handleWidth[0].style.marginTop = (props.paddingRight < 20 ? (+(((handleSize.y / 4) * props.paddingRight) / 5) - (handleSize.y * 1.5)) : -(handleSize.y / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
		this.captionWidth.style.marginTop = (props.paddingRight < 20 ? (+(((handleSize.y / 4) * props.paddingRight) / 5) - (handleSize.y * 1.5)) : -8) + 'px';

		this.handleHeight[0].style.marginLeft = (props.paddingBottom < 20 ? (+(((handleSize.x / 4) * props.paddingBottom) / 5) - (handleSize.x * 1.5)) : -(handleSize.x / 2)) + 'px';
		this.captionHeight.style.marginLeft = (props.paddingBottom < 20 ? ((handleSize.x * (props.paddingBottom / 20)) - handleSize.x * 2 + handleSize.x - 9) : -10) + 'px';

		this.refreshCaptions();

	},

	/* member functions */

	processOverWidth: function(e) {

		var offset = LayoutMode.currentOffset;

		// over right side
		if(
			e.pageX > offset.left + LayoutMode.paddingLeft + LayoutMode.innerWidth - 5 &&
			e.pageY > offset.top + LayoutMode.paddingTop &&
			e.pageX < (offset.left + LayoutMode.outerWidth - LayoutMode.paddingRight) &&
			e.pageY < (offset.top + LayoutMode.outerHeight - LayoutMode.paddingBottom) &&
			!e.target.classList.contains('handle-padding') &&
			!e.target.classList.contains('handle-margin')
		) {

			if(!this.overWidth) {
				document.body.classList.add('resize-width');
				this.captionWidth.classList.add('over');
				this.refreshCaptions();
				LayoutMode.selectRule('width');
				this.overWidth = true;
				LayoutMode.overSize = true;

			}

		} else {

			if(this.overWidth) {
				this.overWidth = false;
				LayoutMode.overSize = false;
				document.body.classList.remove('resize-width');
				this.captionWidth.classList.remove('over');
				this.refreshCaptions();
				LayoutMode.deselectRule();
			}

		}

	},

	processOverHeight: function(e) {

		var offset = LayoutMode.currentOffset;

		// over bottom side
		if(
			e.pageY > offset.top + LayoutMode.paddingTop + LayoutMode.innerHeight - 5 &&
			e.pageX > offset.left + LayoutMode.paddingLeft &&
			e.pageY < (offset.top + LayoutMode.outerHeight - LayoutMode.paddingBottom) &&
			e.pageX < (offset.left + LayoutMode.outerWidth - LayoutMode.paddingRight) &&
			!e.target.classList.contains('handle-padding')
			&& !e.target.classList.contains('handle-margin')
		) {

			if(!this.overHeight) {
				document.body.classList.add('resize-height');
				this.captionHeight.classList.add('over');
				this.refreshCaptions();
				LayoutMode.selectRule('height');
				this.overHeight = true;
				LayoutMode.overSize = true;
			}

		} else {

			if(this.overHeight) {
				this.overHeight = false;
				LayoutMode.overSize = false;
				document.body.classList.remove('resize-height');
				this.captionHeight.classList.remove('over');
				this.refreshCaptions();
				LayoutMode.deselectRule();
			}

		}

	},

	refreshCaptions: function() {

		var offset = LayoutMode.currentOffset;
		var hitsRightEdge;

		hitsRightEdge = (offset.left + this.outerWidth + 80 > window.innerWidth);
		this.captionWidth.classList[hitsRightEdge ? 'add' : 'remove']('edge');
		this.captionWidth.innerHTML = '<span>width: </span>' + LayoutMode.getCaptionProperty('width');
		this.captionWidth.style.right = (hitsRightEdge ? 16 : -(this.captionWidth.offsetWidth + 13)) + 'px';

		this.captionHeight.innerHTML = '<span>height: </span>' + LayoutMode.getCaptionProperty('height');

	},

	initDraggers: function() {

		var that = this;
		var isTouch = 'ontouchstart' in document;

		// width
		$(document).on(isTouch ? 'touchstart' : 'mousedown', function(event) {

			if(that.overWidth) {

				var startWidth = LayoutMode.innerWidth;

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.width = Math.round(Math.max(0, startWidth - delta)) + 'px';
						LayoutMode.relayout();
					}
				});	

			} else if(that.overHeight) {

				var startHeight = LayoutMode.innerHeight;

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.height = Math.round(Math.max(0, startHeight - delta)) + 'px';
						LayoutMode.relayout();
					}
				});

			}

		});

	}

});