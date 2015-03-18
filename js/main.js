(function() {


	var Overlay = function() {

		this.overlayElement = null; // the actual overlay div
		this.currentElement = null; // the currently selected element
		this.selectedRule = null; // when defined, we're in rule mode
		this.ghosts = []; // ghosts are elements created to visualize hovering, or when we edit based on rule
		this.hoverGhost = new Ghost(); // the hover ghost
		this.over = false; // on whether we're currenly hovering a certain part of the overlay
		this.overInner = false;
		this.overPadding = false;
		this.interacting = false; // whether we're currently interacting with the element

		// initialize
		this.create();

	};

	$.extend(Overlay.prototype, {

		create: function() {

			this.createOverlay();
			this.createTitle();

		},

		createOverlay: function() {

			this.overlayElement = $('<div id="overlay" class="overlay"></div>')[0];

			this.guideLeft = $('<div class="guide-left"></div>').appendTo(this.overlayElement)[0];
			this.guideRight = $('<div class="guide-right"></div>').appendTo(this.overlayElement)[0];
			this.guideBottom = $('<div class="guide-bottom"></div>').appendTo(this.overlayElement)[0];
			this.guideTop = $('<div class="guide-top"></div>').appendTo(this.overlayElement)[0];
			
			this.containerMarginTop = $('<div class="container-margin top"></div>').appendTo(this.overlayElement)[0];
			this.containerMarginBottom = $('<div class="container-margin bottom"></div>').appendTo(this.overlayElement)[0];
			this.containerMarginLeft = $('<div class="container-margin left"></div>').appendTo(this.overlayElement)[0];
			this.containerMarginRight = $('<div class="container-margin right"></div>').appendTo(this.overlayElement)[0];
			this.containerPaddingTop = $('<div class="container-padding top"></div>').appendTo(this.overlayElement)[0];
			this.containerPaddingBottom = $('<div class="container-padding bottom"></div>').appendTo(this.overlayElement)[0];
			this.containerPaddingLeft = $('<div class="container-padding left"></div>').appendTo(this.overlayElement)[0];
			this.containerPaddingRight = $('<div class="container-padding right"></div>').appendTo(this.overlayElement)[0];
			
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

			var that = this;
			this.handleSizeBottom
				.add(this.handleSizeRight)
				.hover(function() {
					that.overSizeHandle = true;
				}, function() {
					that.overSizeHandle = false;
				});
			this.handlePaddingBottom
				.add(this.handlePaddingTop)
				.add(this.handlePaddingLeft)
				.add(this.handlePaddingRight)
				.hover(function() {
					that.overPaddingHandle = true;
				}, function() {
					that.overPaddingHandle = false;
				});
			this.handleMarginBottom
				.add(this.handleMarginTop)
				.add(this.handleMarginLeft)
				.add(this.handleMarginRight)
				.hover(function() {
					that.overMarginHandle = true;
				}, function() {
					that.overMarginHandle = false;
				});

			this.captionWidth = $('<div class="caption caption-width"></div>').appendTo(this.overlayElement)[0];
			this.captionHeight = $('<div class="caption caption-height"></div>').appendTo(this.overlayElement)[0];

			this.captionPaddingLeft = $('<div class="caption caption-padding left"></div>').appendTo(this.overlayElement)[0];
			this.captionPaddingRight = $('<div class="caption caption-padding right"></div>').appendTo(this.overlayElement)[0];
			this.captionPaddingTop = $('<div class="caption caption-padding top"></div>').appendTo(this.overlayElement)[0];
			this.captionPaddingBottom = $('<div class="caption caption-padding bottom"></div>').appendTo(this.overlayElement)[0];

			this.captionMarginLeft = $('<div class="caption caption-margin left"></div>').appendTo(this.overlayElement)[0];
			this.captionMarginRight = $('<div class="caption caption-margin right"></div>').appendTo(this.overlayElement)[0];
			this.captionMarginTop = $('<div class="caption caption-margin top"></div>').appendTo(this.overlayElement)[0];
			this.captionMarginBottom = $('<div class="caption caption-margin bottom"></div>').appendTo(this.overlayElement)[0];


			document.body.appendChild(this.overlayElement);

		},

		createTitle: function() {

			this.titleBox = $('<div class="overlay-title"><div class="title-rule"><span class="selected">inline style</span> <span class="toggle">▾</span><ul class="dropdown"><li>inline style</li></ul></div><div class="title-proportions">100 x 100</div></div>')
				.appendTo(document.body)[0];

			this.titleProportions = $('.title-proportions', this.titleBox)[0];
			this.titleDropdown = $('.dropdown', this.titleBox);

		},

		/*
		 * Events & Behaviour initialization
		 */

		init: function() {

			this.initTitleBox();
			this.initHover();
			this.initRuleShortcut();
			this.initDimensionShortcut();
			this.initHandles();

			var that = this;
			$(document).on('keyup', function(e) {
				if(e.keyCode === 27) {
					that.unset();
				}
			});

		},

		initTitleBox: function() {

			// initialize title box behaviour

			var that = this;
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
					that.enterRuleMode(cssRule);
				} else {
					that.exitRuleMode();
				}

			});

		},

		initHover: function() {

			var that = this;

			$('body').on('mousemove', function(e) {

				var extraMargin = 10;
				var offset = that.currentOffset;

				if(!that.currentElement) {
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
						that.over = true;
						that.overlayElement.classList.add('hover');
						that.hoverGhost.overlayElement.style.display = 'none';
						if(that.vLineX) that.vLineX.style.display = 'none';
						if(that.vLineY) that.vLineY.style.display = 'none';
					}

				} else {

					if(that.over && !that.interacting) {
						that.over = false;
						that.overlayElement.classList.remove('hover');
						that.hoverGhost.overlayElement.style.display = 'block';			
					}

				}

				// over inner box

				if(!that.interacting) {

					if(
						(e.pageX > offset.left + that.paddingLeft
						&& e.pageY > offset.top + that.paddingTop
						&& e.pageX < (offset.left + that.outerWidth - that.paddingRight)
						&& e.pageY < (offset.top + that.outerHeight - that.paddingBottom))
						|| that.overSizeHandle
					) {

						if(!that.overInner) {
							that.overlayElement.classList.add('hover-inner');
							that.overInner = true;
						}

					} else {

						if(that.overInner) {
							that.overInner = false;
							that.overlayElement.classList.remove('hover-inner');		
						}

					}

				}

				// over padding box

				if(!that.interacting) {

					if(
						(e.pageX > offset.left
						&& e.pageY > offset.top
						&& e.pageX < (offset.left + that.outerWidth)
						&& e.pageY < (offset.top + that.outerHeight)
						&& !that.overInner)
						|| that.overPaddingHandle
					) {

						if(!that.overPadding) {
							that.overlayElement.classList.add('hover-padding');
							that.overPadding = true;
						}

					} else {

						if(that.overPadding) {
							that.overPadding = false;
							that.overlayElement.classList.remove('hover-padding');		
						}

					}

				}

				// over margin box

				if(!that.interacting) {

					if(
						(e.pageX > offset.left - that.marginLeft
						&& e.pageY > offset.top - that.marginTop
						&& e.pageX < (offset.left + that.outerWidth + that.marginRight)
						&& e.pageY < (offset.top + that.outerHeight + that.marginBottom)
						&& !that.overInner
						&& !that.overPadding)
						|| that.overMarginHandle
					) {

						if(!that.overMargin) {
							that.overlayElement.classList.add('hover-margin');
							that.overMargin = true;
						}

					} else {

						if(that.overMargin) {
							that.overMargin = false;
							that.overlayElement.classList.remove('hover-margin');		
						}

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

		initDimensionShortcut: function() {

			var that = this;

			$(document).on('keydown', function(e) {
				if(e.which === 91) {
					that.commandPressed = true;
					that.hoverGhost.overlayElement.style.visibility = 'hidden';
					if(that.hoverElement !== that.currentElement) {
						that.visualizeRelationTo(that.hoverElement);
					}
				}
			});

			$(document).on('keyup', function(e) {
				if(e.which === 91) {
					that.commandPressed = false;
					that.hoverGhost.overlayElement.style.visibility = '';
					if(that.vLineX) that.vLineX.style.display = 'none';
					if(that.vLineY) that.vLineY.style.display = 'none';
				}
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

			var overlayElement = this.overlayElement;
			var elem = $(this.currentElement);
			var offset = elem.offset();

			var computedStyle = getComputedStyle(this.currentElement);

			var innerWidth = parseInt(computedStyle.width);
			var innerHeight = parseInt(computedStyle.height);

			// we need to store outer height, bottom/right padding and margins for hover detection
			var paddingLeft = this.paddingLeft = parseInt(computedStyle.paddingLeft);
			var paddingTop = this.paddingTop = parseInt(computedStyle.paddingTop);
			var paddingRight = this.paddingRight = parseInt(computedStyle.paddingRight);
			var paddingBottom = this.paddingBottom = parseInt(computedStyle.paddingBottom);

			var marginLeft = this.marginLeft = parseInt(computedStyle.marginLeft);
			var marginTop = this.marginTop = parseInt(computedStyle.marginTop);
			var marginRight = this.marginRight = parseInt(computedStyle.marginRight);
			var marginBottom = this.marginBottom = parseInt(computedStyle.marginBottom);

			var outerWidth = this.outerWidth = innerWidth + paddingLeft + paddingRight;
			var outerHeight = this.outerHeight = innerHeight + paddingTop + paddingBottom;


			// place and resize overlay
			overlayElement.style.width = innerWidth + 'px';
			overlayElement.style.height = innerHeight + 'px';
			overlayElement.style.transform = 'translate(' + (offset.left + paddingLeft) + 'px, ' + (offset.top + paddingTop) + 'px)';

			// place title box
			this.titleBox.style.display = 'inline-block';
			this.titleBox.style.transform = 'translate(' + (offset.left + ((outerWidth - this.titleBox.offsetWidth) / 2)) + 'px, ' + (offset.top - 35) + 'px)';
			this.titleProportions.innerHTML = outerWidth + ' x ' + outerHeight;

			// modify padding box
			this.containerPaddingLeft.style.transform = 'translate(' + (-paddingLeft) + 'px, ' + (-paddingTop) + 'px) scale(' + paddingLeft + ', ' + outerHeight + ')';
			this.containerPaddingRight.style.transform = 'translate(' + (innerWidth) + 'px, ' + (-paddingTop) + 'px) scale(' + paddingRight + ', ' + outerHeight + ')';
			this.containerPaddingTop.style.transform = 'translate(' + (0) + 'px, ' + (-paddingTop) + 'px) scale(' + innerWidth + ', ' + paddingTop + ')';
			this.containerPaddingBottom.style.transform = 'translate(' + (0) + 'px, ' + (innerHeight) + 'px) scale(' + innerWidth + ', ' + paddingBottom + ')';


			this.handlePaddingLeft[0].style.transform = 'translate(' + -paddingLeft + 'px, 0px)';
			this.handlePaddingRight[0].style.marginRight = -paddingRight + 'px'; // TODO: find out why converting these to transforms messes with dragging
			this.handlePaddingTop[0].style.transform = 'translate(0px, ' + -paddingTop + 'px)';
			this.handlePaddingBottom[0].style.marginBottom =  -paddingBottom + 'px';  // TODO: find out why converting these to transforms messes with dragging

			// modify margin box
			this.containerMarginLeft.style.transform = 'translate(' + (-(paddingLeft + marginLeft)) + 'px, ' + (-(paddingTop + marginTop)) + 'px) scale(' + marginLeft + ', ' + (outerHeight + marginTop + marginBottom) + ')';
			this.containerMarginRight.style.transform = 'translate(' + (innerWidth + paddingRight) + 'px, ' + (-(paddingTop + marginTop)) + 'px) scale(' + marginRight + ', ' + (outerHeight + marginTop + marginBottom) + ')';
			this.containerMarginTop.style.transform = 'translate(' + (-paddingLeft) + 'px, ' + (-(paddingTop + marginTop)) + 'px) scale(' + outerWidth + ', ' + marginTop + ')';
			this.containerMarginBottom.style.transform = 'translate(' + (-paddingLeft) + 'px, ' + (innerHeight + paddingBottom) + 'px) scale(' + outerWidth + ', ' + marginBottom + ')';

			this.handleMarginLeft[0].style.marginLeft = -(paddingLeft + marginLeft) + 'px';
			this.handleMarginRight[0].style.marginRight = -(paddingRight + marginRight) + 'px';
			this.handleMarginTop[0].style.marginTop = -(paddingTop + marginTop) + 'px';
			this.handleMarginBottom[0].style.marginBottom = -(paddingBottom + marginBottom) + 'px';


			// guides
			this.guideLeft.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			this.guideLeft.style.height = window.innerHeight + 'px';
			this.guideRight.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			this.guideRight.style.height = window.innerHeight + 'px';
			this.guideBottom.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			this.guideBottom.style.width = window.innerWidth + 'px';
			this.guideTop.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			this.guideTop.style.width = window.innerWidth + 'px';

			// captions
			var hitsRightEdge, hitsLeftEdge;

			var hitsRightEdge = (offset.left + outerWidth + 80 > window.innerWidth);
			this.captionWidth.classList[hitsRightEdge ? 'add' : 'remove']('edge');
			this.captionWidth.innerHTML = '<span>width: </span>' + innerWidth + ' <span>px</span>';
			this.captionWidth.style.right = (hitsRightEdge ? 16 : -(this.captionWidth.offsetWidth + 13)) + 'px';

			this.captionHeight.innerHTML = '<span>height: </span>' + innerHeight + ' <span>px</span>';

			this.captionPaddingLeft.innerHTML = '<span>padding: </span>' + paddingLeft + ' <span>px</span>';
			this.captionPaddingRight.innerHTML = '<span>padding: </span>' + paddingRight + ' <span>px</span>';
			this.captionPaddingTop.innerHTML = '<span>padding: </span>' + paddingTop + ' <span>px</span>';
			this.captionPaddingBottom.innerHTML = '<span>padding: </span>' + paddingBottom + ' <span>px</span>';

			this.captionMarginLeft.innerHTML = '<span>margin: </span>' + marginLeft + ' <span>px</span>';
			this.captionMarginRight.innerHTML = '<span>margin: </span>' + marginRight + ' <span>px</span>';
			this.captionMarginTop.innerHTML = '<span>margin: </span>' + marginTop + ' <span>px</span>';
			this.captionMarginBottom.innerHTML = '<span>margin: </span>' + marginBottom + ' <span>px</span>';

			hitsLeftEdge = (offset.left - 80 < 0);
			this.captionPaddingLeft.classList[hitsLeftEdge ? 'add' : 'remove']('edge');
			this.captionPaddingLeft.style.marginRight = (hitsLeftEdge ? paddingLeft - this.captionPaddingLeft.offsetWidth-16 : paddingLeft + 14) + 'px';

			hitsRightEdge = (offset.left + outerWidth + 80 > window.innerWidth);
			this.captionPaddingRight.classList[hitsRightEdge ? 'add' : 'remove']('edge');
			this.captionPaddingRight.style.marginLeft = (hitsRightEdge ? paddingRight - this.captionPaddingRight.offsetWidth-16 : paddingRight + 14) + 'px';

			this.captionPaddingBottom.style.bottom = -(paddingBottom  + 7) + 'px';
			this.captionPaddingTop.style.top = -(paddingTop  + 7) + 'px';

			hitsLeftEdge = (offset.left - marginLeft - 80 < 0);
			this.captionMarginLeft.classList[hitsLeftEdge ? 'add' : 'remove']('edge');
			this.captionMarginLeft.style.marginRight = paddingLeft + marginLeft + (hitsLeftEdge ? -this.captionMarginLeft.offsetWidth-17 : 14) + 'px';

			hitsRightEdge = (offset.left + outerWidth + marginRight + 80 > window.innerWidth);
			this.captionMarginRight.classList[hitsRightEdge ? 'add' : 'remove']('edge');
			this.captionMarginRight.style.marginLeft = paddingRight + marginRight + (hitsRightEdge ? -this.captionMarginRight.offsetWidth-17 : 14) + 'px';

			this.captionMarginBottom.style.bottom = -marginBottom -paddingBottom -7 + 'px';
			this.captionMarginTop.style.top = -marginTop -paddingTop -7 + 'px';

			// content editable
			elem[0].setAttribute('contentEditable', true);
			elem[0].style.outline = 'none';

			this.currentOffset = offset;


		},

		set: function(newElem) {

			this.currentElement = newElem;

			// initial hover
			this.overlayElement.classList.add('hover');
			this.overlayElement.style.display = 'block';
			this.over = true;

			// fill dropdown with correct CSS rules
			this.fillRules(this.currentElement);

		},

		unset: function() {

			if(this.selectedRule) {
				this.exitRuleMode();
			}

			this.overlayElement.style.display = 'none';
			this.titleBox.style.display = 'none';
			this.currentElement.removeAttribute('contentEditable');
			this.currentElement.style.outline = '';

			this.over = false;
			this.overInner = false;
			this.currentElement = null;

		},

		/*
		 * Functions related to rule-based editing
		 */

		enterRuleMode: function(cssRule) {

			console.log('entering rule mode..');

			var ghosts = this.ghosts;

			this.selectedRule = cssRule;
			this.titleBox.classList.add('rule');
			this.overlayElement.style.zIndex = 10002;

			$(this.selectedRule.selectorText).not(this.currentElement).not('.overlay, .overlay *').each(function() {

				var ghost = new Ghost(this);
				ghost.sync();
				ghosts.push(ghost);

			});

		},

		exitRuleMode: function() {

			console.log('exiting rule mode..');
			
			$('span.selected', this.titleBox).html('inline style');
			this.titleBox.classList.remove('rule');
			this.overlayElement.style.zIndex = '';

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
				this.ghosts[i].sync();
			}		
		},

		visualizeRelationTo: function(relatedElement) {

			var currentElement = this.currentElement;

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
				this.vLineX.style.display = 'block';
				this.vLineX.style.top = currentElement.offsetTop + (currentElement.offsetHeight / 2) + 'px';
				this.vLineX.style.left = reRightEdge + 'px';
				this.vLineX.style.width = ceLeftEdge - reRightEdge + 'px';
				this.vLineXCaption.innerHTML = ceLeftEdge - reRightEdge + ' <span>px</span>';

				if(reBottomEdge < ceTopEdge) {
					this.vLineXCrossBar.style.display = 'block';
					this.vLineXCrossBar.style.left = '0px';
					this.vLineXCrossBar.style.bottom = '0px';
					this.vLineXCrossBar.style.top = 'auto';
					this.vLineXCrossBar.style.height = (currentElement.offsetHeight / 2) + (ceTopEdge - reBottomEdge) + 'px';
				} else if(ceBottomEdge < reTopEdge) {
					this.vLineXCrossBar.style.display = 'block';
					this.vLineXCrossBar.style.left = '0px';
					this.vLineXCrossBar.style.top = '0px';
					this.vLineXCrossBar.style.bottom = 'auto';
					this.vLineXCrossBar.style.height = (currentElement.offsetHeight / 2) + (reTopEdge - ceBottomEdge) + 'px';
				} else {
					this.vLineXCrossBar.style.display = 'none';
				}

			} else if(ceRightEdge < reLeftEdge) {
				this.vLineX.style.display = 'block';
				this.vLineX.style.top = currentElement.offsetTop + (currentElement.offsetHeight / 2) + 'px';
				this.vLineX.style.left = ceRightEdge + 'px';
				this.vLineX.style.width = reLeftEdge - ceRightEdge + 'px';
				this.vLineXCaption.innerHTML = reLeftEdge - ceRightEdge + ' <span>px</span>';

				if(reBottomEdge < ceTopEdge) {
					this.vLineXCrossBar.style.display = 'block';
					this.vLineXCrossBar.style.left = '100%';
					this.vLineXCrossBar.style.bottom = '0px';
					this.vLineXCrossBar.style.top = 'auto';
					this.vLineXCrossBar.style.height = (currentElement.offsetHeight / 2) + (ceTopEdge - reBottomEdge) + 'px';
				} else if(ceBottomEdge < reTopEdge) {
					this.vLineXCrossBar.style.display = 'block';
					this.vLineXCrossBar.style.left = '100%';
					this.vLineXCrossBar.style.top = '0px';
					this.vLineXCrossBar.style.bottom = 'auto';
					this.vLineXCrossBar.style.height = (currentElement.offsetHeight / 2) + (reTopEdge - ceBottomEdge) + 'px';
				} else {
					this.vLineXCrossBar.style.display = 'none';
				}

			} else {
				this.vLineX.style.display = 'none';
			}

			// vertical connection
			if(reBottomEdge < ceTopEdge) {
				this.vLineY.style.display = 'block';
				this.vLineY.style.left = currentElement.offsetLeft + (currentElement.offsetWidth / 2) + 'px';
				this.vLineY.style.top = reBottomEdge + 'px';
				this.vLineY.style.height = ceTopEdge - reBottomEdge + 'px';
				this.vLineYCaption.innerHTML = ceTopEdge - reBottomEdge + ' <span>px</span>';

				if(reRightEdge < ceLeftEdge) {
					this.vLineYCrossBar.style.display = 'block';
					this.vLineYCrossBar.style.top = '0px';
					this.vLineYCrossBar.style.right = '0px';
					this.vLineYCrossBar.style.left = 'auto';
					this.vLineYCrossBar.style.width = (currentElement.offsetWidth / 2) + (ceLeftEdge - reRightEdge) + 'px';
				} else if(ceRightEdge < reLeftEdge) {
					this.vLineYCrossBar.style.display = 'block';
					this.vLineYCrossBar.style.top = '0px';
					this.vLineYCrossBar.style.left = '0px';
					this.vLineYCrossBar.style.right = 'auto';
					this.vLineYCrossBar.style.width = (currentElement.offsetWidth / 2) + (reLeftEdge - ceRightEdge) + 'px';
				} else {
					this.vLineYCrossBar.style.display = 'none';
				}

			} else if(ceBottomEdge < reTopEdge) {
				this.vLineY.style.display = 'block';
				this.vLineY.style.left = currentElement.offsetLeft + (currentElement.offsetWidth / 2) + 'px';
				this.vLineY.style.top = ceBottomEdge + 'px';
				this.vLineY.style.height = reTopEdge - ceBottomEdge + 'px';
				this.vLineYCaption.innerHTML = reTopEdge - ceBottomEdge + ' <span>px</span>';

				if(reRightEdge < ceLeftEdge) {
					this.vLineYCrossBar.style.display = 'block';
					this.vLineYCrossBar.style.top = '100%';
					this.vLineYCrossBar.style.right = '0px';
					this.vLineYCrossBar.style.left = 'auto';
					this.vLineYCrossBar.style.width = (currentElement.offsetWidth / 2) + (ceLeftEdge - reRightEdge) + 'px';
				} else if(ceRightEdge < reLeftEdge) {
					this.vLineYCrossBar.style.display = 'block';
					this.vLineYCrossBar.style.top = '100%';
					this.vLineYCrossBar.style.left = '0px';
					this.vLineYCrossBar.style.right = 'auto';
					this.vLineYCrossBar.style.width = (currentElement.offsetWidth / 2) + (reLeftEdge - ceRightEdge) + 'px';
				} else {
					this.vLineYCrossBar.style.display = 'none';
				}

			} else {
				this.vLineY.style.display = 'none';
			}

		}

	});

	// Create Overlay (singleton)
	Overlay = new Overlay();

	// Initialize overlay
	Overlay.init();


	// make all elements on page inspectable
	$("body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)").on('mouseover', function() {

		Overlay.hoverElement = this;

		// if we're holding shift and hover another element, show guides
		if(Overlay.commandPressed && Overlay.currentElement && this !== Overlay.currentElement) {
			Overlay.visualizeRelationTo(this);
			return false;
		}

		// in normal mode, don't activate the hover ghost when interacting or over the current el
		if(Overlay.hoverGhost.currentElement === this || Overlay.interacting || Overlay.over)
			return;

		Overlay.hoverGhost.sync(this);

		return false;

	});

	// make all elements on page inspectable
	$("body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)").on('click', function() {

		if(Overlay.currentElement === this)
			return false;

		if(Overlay.currentElement) {
			Overlay.unset();
		}

		//hide hover ghost
		Overlay.hoverGhost.overlayElement.style.display = 'none';

		// sync on the element
		Overlay.sync(this);

		return false;

	});


	$(".boxes li:eq(0)").click();


})();


