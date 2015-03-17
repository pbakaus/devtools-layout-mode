(function() {


	var Overlay = function() {

		// the actual overlay div
		this.overlayElement = null;

		// the currently selected element
		this.currentElement = null;

		// when defined, we're in rule mode
		this.selectedRule = null;

		// ghosts are elements created to visualize hovering, or when we edit based on rule
		this.ghosts = [];

		// the hover ghost
		this.hoverGhost = new Ghost();

		// on whether we're currenly hovering a certain part of the overlay
		this.over = false;
		this.overInner = false;

		// whether we're currently interacting with the element
		this.interacting = false;

		// initialize
		this.create();

	};

	$.extend(Overlay.prototype, {

		create: function() {

			this.createOverlay();
			this.createTitle();

		},

		createOverlay: function() {

			this.overlayElement = $('<div id="overlay" class="overlay"></div>');

			this.guideLeft = $('<div class="guide-left"></div>').appendTo(this.overlayElement)[0];
			this.guideRight = $('<div class="guide-right"></div>').appendTo(this.overlayElement)[0];
			this.guideBottom = $('<div class="guide-bottom"></div>').appendTo(this.overlayElement)[0];
			this.guideTop = $('<div class="guide-top"></div>').appendTo(this.overlayElement)[0];
			
			$('<div class="container-margin top"></div>').appendTo(this.overlayElement);
			$('<div class="container-margin bottom"></div>').appendTo(this.overlayElement);
			$('<div class="container-margin left"></div>').appendTo(this.overlayElement);
			$('<div class="container-margin right"></div>').appendTo(this.overlayElement);
			$('<div class="container-padding top"></div>').appendTo(this.overlayElement);
			$('<div class="container-padding bottom"></div>').appendTo(this.overlayElement);
			$('<div class="container-padding left"></div>').appendTo(this.overlayElement);
			$('<div class="container-padding right"></div>').appendTo(this.overlayElement);
			

			this.handleSizeBottom = $('<div class="handle bottom handle-size" title="Drag to change height"></div>').appendTo(this.overlayElement);
			this.handlePaddingBottom = $('<div class="handle bottom handle-padding" title="Drag to change padding-bottom"></div>').appendTo(this.overlayElement);
			this.handleMarginBottom = $('<div class="handle bottom handle-margin" title="Drag to change margin-bottom"></div>').appendTo(this.overlayElement);
			this.handleSizeRight = $('<div class="handle right handle-size" title="Drag to change width"></div>').appendTo(this.overlayElement);
			this.handlePaddingRight = $('<div class="handle right handle-padding" title="Drag to change padding-right"></div>').appendTo(this.overlayElement);
			this.handleMarginRight = $('<div class="handle right handle-margin" title="Drag to change margin-right"></div>').appendTo(this.overlayElement);
			this.handlePaddingTop = $('<div class="handle top handle-padding" title="Drag to change padding-top"></div>').appendTo(this.overlayElement);
			this.handleMarginTop = $('<div class="handle top handle-margin" title="Drag to change margin-top"></div>').appendTo(this.overlayElement);
			this.handlePaddingLeft = $('<div class="handle left handle-padding" title="Drag to change padding-left"></div>').appendTo(this.overlayElement);
			this.handleMarginLeft = $('<div class="handle left handle-margin" title="Drag to change margin-left"></div>').appendTo(this.overlayElement);

			this.captionWidth = $('<div class="caption caption-width"></div>').appendTo(this.overlayElement);
			this.captionHeight = $('<div class="caption caption-height"></div>').appendTo(this.overlayElement);

			this.overlayElement.appendTo(document.body);

		},

		createTitle: function() {

			this.titleBox = $('<div class="overlay-title"><div class="title-rule"><span class="selected">inline style</span> <span class="toggle">▾</span><ul class="dropdown"><li>inline style</li></ul></div><div class="title-proportions">100 x 100</div></div>')
				.appendTo(document.body);

			this.titleDropdown = $('.dropdown', Overlay.titleBox);

		},

		/*
		 * Events & Behaviour initialization
		 */

		init: function() {

			this.initTitleBox();
			this.initHover();
			this.initRuleShortcut();
			this.initHandles();

			$(document).on('keyup', function(e) {
				if(e.keyCode === 27) {
					Overlay.unset();
				}
			});

		},

		initTitleBox: function() {

			// initialize title box behaviour

			var titleBox = this.titleBox;
			var titleDropdown = this.titleDropdown;

			$('span', titleBox).click(function() {
				$(".dropdown", titleBox).toggle();
			});


			titleDropdown.on('click', 'li', function() {

				titleDropdown.hide();
				$(".selected", titleBox).html(this.innerHTML);
				
				var cssRule = $(this).data('cssRule');
				if(cssRule) {
					Overlay.enterRuleMode(cssRule);
				} else {
					Overlay.exitRuleMode();
				}

			});

		},

		initHover: function() {

			var that = this;

			$('body').on('mousemove', function(e) {

				var extraMargin = 10;
				var offset = Overlay.currentOffset;

				if(!Overlay.currentElement) {
					return;
				}

				// general over/out

				if(
					e.pageX > offset.left - that.marginLeft - extraMargin
					&& e.pageY > offset.top - that.marginTop - extraMargin
					&& e.pageX < (offset.left + that.outerWidth + that.marginRight + extraMargin)
					&& e.pageY < (offset.top + that.outerHeight + that.marginBottom + extraMargin)
				) {

					if(!that.over) {
						Overlay.overlayElement.addClass('hover');
						that.over = true;
						Overlay.hoverGhost.overlayElement.style.display = 'none';
					}

				} else {

					if(that.over && !that.interacting) {
						that.over = false;
						Overlay.overlayElement.removeClass('hover');
						Overlay.hoverGhost.overlayElement.style.display = 'block';			
					}

				}

				// over inner box

				if(
					e.pageX > offset.left
					&& e.pageY > offset.top
					&& e.pageX < (offset.left + that.outerWidth - that.paddingRight)
					&& e.pageY < (offset.top + that.outerHeight - that.paddingBottom)
				) {

					if(!that.overInner) {
						Overlay.overlayElement.addClass('hover-inner');
						that.overInner = true;
					}

				} else {

					if(that.overInner && that.interacting !== "size") {
						that.overInner = false;
						Overlay.overlayElement.removeClass('hover-inner');		
					}

				}


			});

		},

		initRuleShortcut: function() {

			var titleDropdown = this.titleDropdown;

			$(document).on('keydown', function(e) {
				if(e.which === 16) titleDropdown.find('li:eq(1)').click();
			});

			$(document).on('keyup', function(e) {
				if(e.which === 16) titleDropdown.find('li:eq(0)').click();
			});

		},

		initHandles: function() {

			var that = this;
			var handleOffset = 7;

			// resize handles

			(function() {

				var start = function() { that.interacting = "size"; this.__x = $(this).draggable('option', 'axis') === 'x'; };
				var drag = function(event, ui) {
					var x = this.__x;
					ui.position[x ? "left" : "top"] = Math.max(0 - handleOffset, ui.position[x ? "left" : "top"]);
					(that.selectedRule || that.currentElement).style[x ? "width" : "height"] = (ui.position[x ? "left" : "top"] + handleOffset) + 'px';
					that.sync(null, true);
					that.updateGhosts();
				};
				var stop = function() {
					this.removeAttribute('style');
					that.interacting = false;
				};

				that.handleSizeBottom.draggable({ axis: 'y', cursor: 's-resize', start: start, drag: drag, stop: stop });
				that.handleSizeRight.draggable({ axis: 'x', cursor: 'e-resize', start: start, drag: drag, stop: stop });

			})();


			// resize padding

			(function() {

				var stop = function() {
					this.removeAttribute('style');
					that.interacting = false;
					drag();
				};

				var drag = function() {
					that.sync(null, true);
					that.updateGhosts();					
				};

				that.handlePaddingBottom.draggable({
					axis: 'y',
					cursor: 's-resize',
					start: function() {
						this.curInnerHeight = $(that.currentElement).height();
						this.curPaddingBottom = that.paddingBottom;
						that.interacting = "padding";
					},
					drag: function(event, ui) {
						ui.position.top = Math.max(this.curInnerHeight - handleOffset, ui.position.top);
						(that.selectedRule || that.currentElement).style.paddingBottom = Math.max(0, this.curPaddingBottom + (ui.position.top - ui.originalPosition.top)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handlePaddingRight.draggable({
					axis: 'x',
					cursor: 'e-resize',
					start: function() {
						this.curInnerWidth = $(that.currentElement).width();
						this.curPaddingRight = that.paddingRight;
						that.interacting = "padding";
					},
					drag: function(event, ui) {
						ui.position.left = Math.max(this.curInnerWidth - handleOffset, ui.position.left);
						(that.selectedRule || that.currentElement).style.paddingRight = Math.max(0, this.curPaddingRight + (ui.position.left - ui.originalPosition.left)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handlePaddingTop.draggable({
					axis: 'y',
					cursor: 'n-resize',
					start: function(event, ui) {
						this.curOffset = ui.offset.top;
						this.curPaddingTop = that.paddingTop;
						that.interacting = "padding";
					},
					drag: function(event, ui) {
						ui.position.top = -handleOffset + 2;
						(that.selectedRule || that.currentElement).style.paddingTop = Math.max(0, this.curPaddingTop - (ui.offset.top - this.curOffset)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handlePaddingLeft.draggable({
					axis: 'x',
					cursor: 'w-resize',
					start: function(event, ui) {
						this.curOffset = ui.offset.left;
						this.curPaddingLeft = that.paddingLeft;
						that.interacting = "padding";
					},
					drag: function(event, ui) {
						ui.position.left = -handleOffset + 2;
						(that.selectedRule || that.currentElement).style.paddingLeft = Math.max(0, this.curPaddingLeft - (ui.offset.left - this.curOffset)) + 'px';
						drag();
					},
					stop: stop
				});				

			})();


			// resize margin

			(function() {

				var stop = function() {
					this.removeAttribute('style');
					that.interacting = false;
					drag();
				};

				var drag = function() {
					that.sync(null, true);
					that.updateGhosts();
				};

				that.handleMarginBottom.draggable({
					axis: 'y',
					cursor: 's-resize',
					start: function() {
						this.curInnerHeight = $(that.currentElement).height();
						this.curMarginBottom = that.marginBottom;
						this.curPaddingBottom = that.paddingBottom;
						that.interacting = "margin";
					},
					drag: function(event, ui) {
						ui.position.top = Math.max(this.curInnerHeight + this.curPaddingBottom - handleOffset, ui.position.top);
						(that.selectedRule || that.currentElement).style.marginBottom = Math.max(0, this.curMarginBottom + (ui.position.top - ui.originalPosition.top)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handleMarginRight.draggable({
					axis: 'x',
					cursor: 'e-resize',
					start: function() {
						this.curInnerWidth = $(that.currentElement).width();
						this.curMarginRight = that.marginRight;
						this.curPaddingRight = that.paddingRight;
						that.interacting = "margin";
					},
					drag: function(event, ui) {
						ui.position.left = Math.max(this.curInnerWidth + this.curPaddingRight - handleOffset, ui.position.left);
						(that.selectedRule || that.currentElement).style.marginRight = Math.max(0, this.curMarginRight + (ui.position.left - ui.originalPosition.left)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handleMarginLeft.draggable({
					axis: 'x',
					cursor: 'w-resize',
					start: function(event, ui) {
						this.curOffset = ui.offset.left;
						this.curMarginLeft = that.marginLeft;
						that.interacting = "margin";
					},
					drag: function(event, ui) {
						ui.position.left = -handleOffset + 2;
						(that.selectedRule || that.currentElement).style.marginLeft = Math.max(0, this.curMarginLeft - (ui.offset.left - this.curOffset)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handleMarginTop.draggable({
					axis: 'y',
					cursor: 'n-resize',
					start: function(event, ui) {
						this.curOffset = ui.offset.top;
						this.curMarginTop = that.marginTop;
						that.interacting = "margin";
					},
					drag: function(event, ui) {
						ui.position.top = -handleOffset + 2;
						(that.selectedRule || that.currentElement).style.marginTop = Math.max(0, this.curMarginTop - (ui.offset.top - this.curOffset)) + 'px';
						drag();
					},
					stop: stop
				});

			})();

		},

		/*
		 * Core runtime functionality
		 */

		sync: function(newElem, duringInteraction) {

			if(newElem) {
				this.set(newElem);
			}

			var overlayElement = $(this.overlayElement);
			var elem = $(this.currentElement);
			var offset = elem.offset();

			var innerWidth = elem.width();
			var innerHeight = elem.height();

			// we need to store outer height, bottom/right padding and margins for hover detection
			var outerWidth = this.outerWidth = elem[0].offsetWidth;
			var outerHeight = this.outerHeight = elem[0].offsetHeight;

			var paddingLeft = this.paddingLeft = parseInt(elem.css('padding-left'));
			var paddingTop = this.paddingTop = parseInt(elem.css('padding-top'));
			var paddingRight = this.paddingRight = parseInt(elem.css('padding-right'));
			var paddingBottom = this.paddingBottom = parseInt(elem.css('padding-bottom'));

			var marginLeft = this.marginLeft = parseInt(elem.css('margin-left'));
			var marginTop = this.marginTop = parseInt(elem.css('margin-top'));
			var marginRight = this.marginRight = parseInt(elem.css('margin-right'));
			var marginBottom = this.marginBottom = parseInt(elem.css('margin-bottom'));

			// place overlay
			overlayElement
				.css({
					display: 'block',
					width: innerWidth,
					height: innerHeight,
					top: offset.top + paddingTop,
					left: offset.left + paddingLeft
				});

			// place title
			this.titleBox[0].style.display = 'inline-block';
			this.titleBox.css({ top: offset.top - 35, left: offset.left + ((outerWidth - this.titleBox[0].offsetWidth) / 2) });
			$('.title-proportions', this.titleBox).html(outerWidth + ' x ' + outerHeight);

			// modify padding box

			// left
			$(".container-padding.left", overlayElement).css({
				width: paddingLeft,
				height: outerHeight,
				top: -paddingTop,
				left: -paddingLeft
			});

			// right
			$(".container-padding.right", overlayElement).css({
				width: paddingRight,
				height: outerHeight,
				top: -paddingTop,
				right: -paddingRight
			});

			// top
			$(".container-padding.top", overlayElement).css({
				width: innerWidth,
				height: paddingTop,
				top: -paddingTop
			});

			// bottom
			$(".container-padding.bottom", overlayElement).css({
				width: innerWidth,
				height: paddingBottom,
				bottom: -paddingBottom
			});

			this.handlePaddingLeft.css({
				marginLeft: -paddingLeft
			});

			this.handlePaddingRight.css({
				marginRight: -paddingRight
			});

			this.handlePaddingTop.css({
				marginTop: -paddingTop
			});

			this.handlePaddingBottom.css({
				marginBottom: -paddingBottom
			});

			// modify margin box

			// left
			$(".container-margin.left", overlayElement).css({
				width: marginLeft,
				height: outerHeight + marginTop + marginBottom,
				top: -(paddingTop + marginTop),
				left: -(paddingLeft + marginLeft)
			});

			// right
			$(".container-margin.right", overlayElement).css({
				width: marginRight,
				height: outerHeight + marginTop + marginBottom,
				top: -(paddingTop + marginTop),
				right: -(paddingRight + marginRight)
			});

			// top
			$(".container-margin.top", overlayElement).css({
				width: outerWidth,
				height: marginTop,
				top: -(paddingTop + marginTop),
				left: -paddingLeft
			});

			// bottom
			$(".container-margin.bottom", overlayElement).css({
				width: outerWidth,
				height: marginBottom,
				bottom: -(paddingBottom + marginBottom),
				left: -paddingLeft
			});

			this.handleMarginLeft.css({
				marginLeft: -(paddingLeft + marginLeft)
			});

			this.handleMarginRight.css({
				marginRight: -(paddingRight + marginRight)
			});

			this.handleMarginTop.css({
				marginTop: -(paddingTop + marginTop)
			});

			this.handleMarginBottom.css({
				marginBottom: -(paddingBottom + marginBottom)
			});


			// guides

			this.guideLeft.style.top = (-offset.top -paddingTop) + 'px';
			this.guideLeft.style.height = window.innerHeight + 'px';
			this.guideRight.style.top = (-offset.top -paddingTop) + 'px';
			this.guideRight.style.height = window.innerHeight + 'px';
			this.guideBottom.style.left = (-offset.left -paddingLeft) + 'px';
			this.guideBottom.style.width = window.innerWidth + 'px';
			this.guideTop.style.left = (-offset.left -paddingLeft) + 'px';
			this.guideTop.style.width = window.innerWidth + 'px';

			// captions

			var hitsRightEdge = (offset.left + outerWidth + 40 > window.innerWidth);
			this.captionWidth[(hitsRightEdge ? 'add' : 'remove') + 'Class']('edge');
			this.captionWidth
				.html('<span>width: </span>' + innerWidth + ' <span>px</span>')
				.css({
					right: hitsRightEdge ? 13 : -(this.captionWidth[0].offsetWidth+13)
				});

			this.captionHeight
				.html('<span>height: </span>' + innerHeight + ' <span>px</span>')
				.css({
					bottom: 1
				});

			// content editable
			elem[0].setAttribute('contentEditable', true);
			elem[0].style.outline = 'none';

			this.currentOffset = offset;


		},

		set: function(newElem) {

			this.currentElement = newElem;

			// initial hover
			this.overlayElement.addClass('hover hover-inner');
			this.over = true;
			this.overInner = true;

			// fill dropdown with correct CSS rules
			this.fillRules(this.currentElement);

		},

		unset: function() {

			if(this.selectedRule) {
				this.exitRuleMode();
			}

			this.overlayElement[0].style.display = 'none';
			this.titleBox[0].style.display = 'none';
			this.currentElement.attr('contentEditable', false);
			this.currentElement[0].style.outline = '';

			this.over = false;
			this.currentElement = null;

		},

		/*
		 * Functions related to rule-based editing
		 */

		enterRuleMode: function(cssRule) {

			console.log('entering rule mode..');

			var ghosts = this.ghosts;

			this.selectedRule = cssRule;
			this.titleBox.addClass('rule');
			this.overlayElement.css('zIndex', 10002);

			$(this.selectedRule.selectorText).not(this.currentElement).not('.overlay, .overlay *').each(function() {

				var ghost = new Ghost(this);
				setOverlay(ghost.overlayElement, this, true);
				ghosts.push(ghost);

			});

		},

		exitRuleMode: function() {

			console.log('exiting rule mode..');
			
			$('span.selected', this.titleBox).html('inline style');
			$(this.titleBox).removeClass('rule');
			Overlay.overlayElement.css('zIndex', '');

			for (var i = 0; i < this.ghosts.length; i++) {
				this.ghosts[i].destroy();
			}

			this.selectedRule = null;
			this.ghosts = [];

		},

		fillRules: function(trackedElement) {

			var resolutions = StyleParser.resolve(trackedElement);
			var resolved = StyleParser.validate(resolutions);

			this.titleDropdown.empty();
			$('<li>inline style</li>').appendTo(this.titleDropdown);
			for (var i = 0; i < resolved.length; i++) {
				$('<li>' + resolved[i].selectorText + '</li>')
					.data('cssRule', resolved[i])
					.appendTo(this.titleDropdown);
			}

		},

		/*
		 * Functions related to ghosts
		 */

		updateGhosts: function() {
			if(!this.ghosts) return;
			for (var i = 0; i < this.ghosts.length; i++) {
				setOverlay(this.ghosts[i].overlayElement, this.ghosts[i].currentElement, true);
			}		
		}

	});

	// Create Overlay (singleton)
	Overlay = new Overlay();

	// Initialize overlay
	Overlay.init();


	// make all elements on page inspectable
	$("body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)").on('mouseover', function() {

		if(Overlay.hoverGhost.currentElement === this || Overlay.interacting || Overlay.over)
			return;

		Overlay.hoverGhost.sync(this);

		return false;

	});

	// make all elements on page inspectable
	$("body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)").on('click', function() {

		if(Overlay.currentElement === this)
			return;

		//hide hover ghost
		Overlay.hoverGhost.overlayElement.style.display = 'none';

		// sync on the element
		Overlay.sync(this);

		return false;

	});


	$(".box").click();


})();


