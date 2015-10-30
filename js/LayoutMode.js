(function() {

	var LayoutMode = function() {

		this.overlayElement = null; // the actual overlay div
		this.currentElement = null; // the currently selected element
		this.selectedRule = null; // when defined, we're in rule mode
		this.hoverGhost = new Ghost(); // the hover ghost
		this.over = false; // on whether we're currenly hovering a certain part of the overlay
		this.overInner = false;
		this.overPadding = false;
		this.interacting = false; // whether we're currently interacting with the element

		// initialize
		this.create();

	};

	$.extend(LayoutMode.prototype, {

		plugins: [],

		registerPlugin: function(plugin) {
			this.plugins.push(plugin);
			if(plugin.create) {
				plugin.create.call(plugin);
			}
		},

		callPlugin: function(eventName, a, b, c, d, e, f) {
			for (var i = 0; i < this.plugins.length; i++) {
				if(this.plugins[i][eventName]) {
					this.plugins[i][eventName].call(this.plugins[i], a, b, c, d, e, f);
				}
			}
		},

		enable: function() {

			var that = this;

			// make all elements on page inspectable
			$('body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)')
				.on('mouseover', function(e) {

					var targetChanged = that.hoverElement !== this;
					that.hoverElement = this;

					if(targetChanged) {
						that.callPlugin('hoverTargetChange', e);
					}

					// in normal mode, don't activate the hover ghost when interacting or over the current el
					if(that.hoverGhost.currentElement === this || that.interacting || that.over)
						return;

					that.hoverGhost.relayout(this);

					return false;

				})
				.on('click', function() {

					if(that.currentElement === this || that.interacting)
						return false;

					// this is an insanely ugly workaround for a propagation issue from drag,
					// but I just dont give a shit! :D
					if(Date.now() - that.lastInteractionTime < 5) {
						return false;
					}

					if(that.currentElement) {
						that.deactivate();
					}

					// sync on the element
					that.activate(this);

					return false;

				});		

		},

		create: function() {
			this.createOverlay();
			this.init();
		},

		createOverlay: function() {

			this.overlayElement = $('<div id="overlay" class="overlay"></div>')[0];
						
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

		/*
		 * Events & Behaviour initialization
		 */

		init: function() {

			this.initHover();
			this.initHandleHover();
			this.initHandles();

			var that = this;
			this.__keyup = function(e) {

				if(e.which === 16) {
					that.shiftPressed = false;
				}

				if(e.keyCode === 27) {
					that.deactivate();
				}		
			};
			this.__keydown = function(e) {

				if(e.which === 16) {
					that.shiftPressed = true;
				}

			};
			$(document).on('keyup', this.__keyup);
			$(document).on('keydown', this.__keydown);

		},

		initHover: function() {

			var that = this;

			$('body').on('mousemove', function(e) {

				that.__lastMouseMoveEvent = e;
				if(!that.currentElement || that.hidden) {
					return;
				}

				that.processOverLogic(e);

			});

		},

		initHandleHover: function() {

			var that = this;

			this.handlePaddingBottom
				.add(this.handlePaddingTop)
				.add(this.handlePaddingLeft)
				.add(this.handlePaddingRight)
				.hover(function() {
					that.overPaddingHandle = true;

					if(!that.interacting) {
						if(this === that.handlePaddingRight[0]) { that.captionPaddingRight.classList.add('over'); that.selectRule('padding-right'); that.refreshCaptions(); }
						if(this === that.handlePaddingBottom[0]) { that.captionPaddingBottom.classList.add('over'); that.selectRule('padding-bottom'); }
						if(this === that.handlePaddingLeft[0]) { that.captionPaddingLeft.classList.add('over'); that.selectRule('padding-left'); that.refreshCaptions(); }
						if(this === that.handlePaddingTop[0]) { that.captionPaddingTop.classList.add('over'); that.selectRule('padding-top'); }
					}

				}, function() {
					that.overPaddingHandle = false;

					var self = this;
					var removeSpan = function() {
						if(self === that.handlePaddingRight[0]) { that.captionPaddingRight.classList.remove('over'); that.deselectRule(); that.refreshCaptions(); }
						if(self === that.handlePaddingBottom[0]) { that.captionPaddingBottom.classList.remove('over'); that.deselectRule(); }
						if(self === that.handlePaddingLeft[0]) { that.captionPaddingLeft.classList.remove('over'); that.deselectRule(); that.refreshCaptions(); }
						if(self === that.handlePaddingTop[0]) { that.captionPaddingTop.classList.remove('over'); that.deselectRule(); }
					};

					if(!that.interacting) {
						removeSpan();
					} else if(!that.__catchMouseUp) {
						that.__catchMouseUp = $(document).one('mouseup', function() {
							if(!that.overPaddingHandle) removeSpan();
							that.__catchMouseUp = null;
						});
					}

				});

			this.handleMarginBottom
				.add(this.handleMarginTop)
				.add(this.handleMarginLeft)
				.add(this.handleMarginRight)
				.hover(function() {
					that.overMarginHandle = true;

					if(!that.interacting) {
						if(this === that.handleMarginRight[0]) { that.captionMarginRight.classList.add('over'); that.refreshCaptions(); that.selectRule('margin-right'); }
						if(this === that.handleMarginBottom[0]) { that.captionMarginBottom.classList.add('over'); that.selectRule('margin-bottom'); }
						if(this === that.handleMarginLeft[0]) { that.captionMarginLeft.classList.add('over'); that.refreshCaptions(); that.selectRule('margin-left'); }
						if(this === that.handleMarginTop[0]) { that.captionMarginTop.classList.add('over'); that.selectRule('margin-top'); }
					}

				}, function() {
					that.overMarginHandle = false;

					var self = this;
					var removeSpan = function() {
						if(self === that.handleMarginRight[0]) { that.captionMarginRight.classList.remove('over'); that.refreshCaptions(); that.deselectRule(); }
						if(self === that.handleMarginBottom[0]) { that.captionMarginBottom.classList.remove('over'); that.deselectRule(); }
						if(self === that.handleMarginLeft[0]) { that.captionMarginLeft.classList.remove('over'); that.refreshCaptions(); that.deselectRule(); }
						if(self === that.handleMarginTop[0]) { that.captionMarginTop.classList.remove('over'); that.deselectRule(); }
					};

					if(!that.interacting) {
						removeSpan();
					} else if(!that.__catchMouseUp) {
						that.__catchMouseUp = $(document).one('mouseup', function() {
							if(!that.overMarginHandle) removeSpan();
							that.__catchMouseUp = null;
						});
					}

				});

		},

		processOverLogic: function(e) {

			var extraMargin = 10;
			var offset = this.currentOffset;

			// general over/out

			if(
				e.pageX > offset.left - this.marginLeft - extraMargin &&
				e.pageY > offset.top - this.marginTop - extraMargin &&
				e.pageX < (offset.left + this.outerWidth + this.marginRight + extraMargin) &&
				e.pageY < (offset.top + this.outerHeight + this.marginBottom + extraMargin)
			) {

				if(!this.over) {
					this.over = true;
					this.overlayElement.classList.add('hover');
					this.hoverGhost.overlayElement.style.display = 'none';
				}

			} else {

				if(this.over && !this.interacting) {
					this.over = false;
					this.overlayElement.classList.remove('hover');
					this.hoverGhost.overlayElement.style.display = 'block';			
				}

			}

			// don't process if interacting
			if(this.interacting) {
				return;
			}

			// over inner box
			if(
				((e.pageX > offset.left + this.paddingLeft &&
					e.pageY > offset.top + this.paddingTop &&
					e.pageX < (offset.left + this.outerWidth - this.paddingRight) &&
					e.pageY < (offset.top + this.outerHeight - this.paddingBottom)) ||
				this.overWidth || this.overHeight) &&
				!this.overPaddingHandle && // cannot be over padding handle
				!this.overMarginHandle
			) {

				if(!this.overInner) {
					this.overlayElement.classList.add('hover-inner');
					this.overInner = true;
				}

			} else {

				if(this.overInner) {
					this.overInner = false;
					this.overlayElement.classList.remove('hover-inner');
				}

			}


			// over right side
			if(
				(e.pageX > offset.left + this.paddingLeft + this.innerWidth - 10 &&
					e.pageY > offset.top + this.paddingTop &&
					e.pageX < (offset.left + this.outerWidth - this.paddingRight) &&
					e.pageY < (offset.top + this.outerHeight - this.paddingBottom)) &&
				!this.overPaddingHandle && // cannot be over padding handle
				!this.overMarginHandle
			) {

				if(!this.overWidth) {
					document.body.style.cursor = 'e-resize';
					this.captionWidth.classList.add('over');
					this.refreshCaptions();
					this.selectRule('width');
					this.overWidth = true;

				}

			} else {

				if(this.overWidth) {
					this.overWidth = false;
					document.body.style.cursor = '';
					this.captionWidth.classList.remove('over');
					this.refreshCaptions();
					this.deselectRule();
					this.currentHandle = null;
				}

			}



			// over padding box
			if(
				((e.pageX > offset.left && e.pageY > offset.top &&
					e.pageX < (offset.left + this.outerWidth) &&
					e.pageY < (offset.top + this.outerHeight) &&
					!this.overInner) ||
				this.overPaddingHandle) &&
				!(this.overWidth || this.overHeight) &&
				!this.overMarginHandle
			) {

				if(!this.overPadding) {
					this.overlayElement.classList.add('hover-padding');

					this.overPadding = true;
				}

			} else {

				if(this.overPadding) {
					this.overPadding = false;
					this.overlayElement.classList.remove('hover-padding');		
				}

			}


			// over margin box
			if(
				((e.pageX > offset.left - this.marginLeft &&
					e.pageY > offset.top - this.marginTop && 
					e.pageX < (offset.left + this.outerWidth + this.marginRight) &&
					e.pageY < (offset.top + this.outerHeight + this.marginBottom) &&
					!this.overInner &&
					!this.overPadding) ||
						this.overMarginHandle) &&
				!this.overPaddingHandle &&
				!(this.overWidth || this.overHeight)
			) {

				if(!this.overMargin) {
					this.overlayElement.classList.add('hover-margin');
					this.overMargin = true;
				}

			} else {

				if(this.overMargin) {
					this.overMargin = false;
					this.overlayElement.classList.remove('hover-margin');		
				}

			}

		},

		initHandles: function() {

			var that = this;
			var handleOffset = 3;
			var isTouch = 'ontouchstart' in document;

			var applyPrecision = function(orig, current) {
				if(!that.shiftPressed) {
					var delta = orig - current;
					var precisionDelta = delta / 4;
					return current + Math.round(delta - precisionDelta);
				}
				return current;
			};


			// height
			that.handleSizeBottom.on(isTouch ? 'touchstart' : 'mousedown', function(event) {

				that.interacting = 'size';
				var startHeight = that.innerHeight;

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = that.shiftPressed ? delta : delta / 4;
						(that.selectedRule || that.currentElement).style.height = Math.round(Math.max(0, startHeight - delta)) + 'px';
						that.relayout();
					},
					stop: function() {
						that.interacting = false;
					}
				});

			});

			// width
			$(document).on(isTouch ? 'touchstart' : 'mousedown', function(event) {

				if(that.overWidth) {
					that.interacting = 'size';
					var startWidth = that.innerWidth;

					new Dragger(event.originalEvent, {
						vertical: false,
						move: function(delta) {
							delta = that.shiftPressed ? delta : delta / 4;
							(that.selectedRule || that.currentElement).style.width = Math.round(Math.max(0, startWidth - delta)) + 'px';
							that.relayout();
						},
						stop: function() {
							that.lastInteractionTime = Date.now();
							that.interacting = false;
						}
					});					
				}



			});

			// padding bottom
			$(document).on(isTouch ? 'touchstart' : 'mousedown', function(event) {

				if(!that.overPadding) {
					return;
				}

				that.interacting = 'padding';
				var startPaddingBottom = that.paddingBottom;

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = that.shiftPressed ? delta : delta / 4;
						(that.selectedRule || that.currentElement).style.paddingBottom = Math.round(Math.max(0, startPaddingBottom - delta)) + 'px';
						that.relayout();
					},
					stop: function() {
						that.lastInteractionTime = Date.now();
						that.interacting = false;
					}
				});

			});

			// resize padding
/*
			(function() {

				var stop = function() {
					this.removeAttribute('style');
					that.interacting = false;
					drag();
				};

				var drag = function() {
					that.relayout();					
				};

				that.handlePaddingBottom.draggable({
					distance: 0,
					axis: 'y',
					cursor: 's-resize',
					start: function() {
						this.curInnerHeight = $(that.currentElement).height();
						this.curPaddingBottom = that.paddingBottom;
						that.interacting = 'padding';
					},
					drag: function(event, ui) {
						ui.position.top = applyPrecision(ui.originalPosition.top, ui.position.top);
						ui.position.top = Math.max(this.curInnerHeight - handleOffset, ui.position.top);
						(that.selectedRule || that.currentElement).style.paddingBottom = Math.max(0, this.curPaddingBottom + ((ui.position.top) - ui.originalPosition.top)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handlePaddingRight.draggable({
					distance: 0,
					axis: 'x',
					cursor: 'e-resize',
					start: function() {
						this.curInnerWidth = $(that.currentElement).width();
						this.curPaddingRight = that.paddingRight;
						that.interacting = 'padding';
					},
					drag: function(event, ui) {
						ui.position.left = applyPrecision(ui.originalPosition.left, ui.position.left);
						ui.position.left = Math.max(this.curInnerWidth - handleOffset, ui.position.left);
						(that.selectedRule || that.currentElement).style.paddingRight = Math.max(0, this.curPaddingRight + ((ui.position.left) - ui.originalPosition.left)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handlePaddingTop.draggable({
					distance: 1,
					axis: 'y',
					cursor: 'n-resize',
					start: function(event, ui) {
						this.curOffset = ui.offset.top;
						this.curPaddingTop = that.paddingTop;
						that.interacting = 'padding';
					},
					drag: function(event, ui) {
						ui.position.top = -handleOffset;
						var delta = (ui.offset.top - this.curOffset);
						delta = !that.shiftPressed ? Math.round(delta / 4) : delta;
						(that.selectedRule || that.currentElement).style.paddingTop = Math.max(0, this.curPaddingTop - delta) + 'px';
						drag();
					},
					stop: stop
				});

				that.handlePaddingLeft.draggable({
					distance: 1,
					axis: 'x',
					cursor: 'w-resize',
					start: function(event, ui) {
						this.curOffset = ui.offset.left;
						this.curPaddingLeft = that.paddingLeft;
						that.interacting = 'padding';
					},
					drag: function(event, ui) {
						ui.position.left = -handleOffset;
						var delta = (ui.offset.left - this.curOffset);
						delta = !that.shiftPressed ? Math.round(delta / 4) : delta;
						(that.selectedRule || that.currentElement).style.paddingLeft = Math.max(0, this.curPaddingLeft - delta) + 'px';
						drag();
					},
					stop: stop
				});				

			})();
*/

			// resize margin

			(function() {

				var stop = function() {
					this.removeAttribute('style');
					that.interacting = false;
					drag();
				};

				var drag = function() {
					that.relayout();
				};

				that.handleMarginBottom.draggable({
					distance: 0,
					axis: 'y',
					cursor: 's-resize',
					start: function() {
						this.curInnerHeight = $(that.currentElement).height();
						this.curMarginBottom = that.marginBottom;
						this.curPaddingBottom = that.paddingBottom;
						that.interacting = 'margin';
					},
					drag: function(event, ui) {
						ui.position.top = applyPrecision(ui.originalPosition.top, ui.position.top);
						ui.position.top = Math.max(this.curInnerHeight + this.curPaddingBottom - handleOffset, ui.position.top);
						(that.selectedRule || that.currentElement).style.marginBottom = Math.max(0, this.curMarginBottom + (ui.position.top - ui.originalPosition.top)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handleMarginRight.draggable({
					distance: 0,
					axis: 'x',
					cursor: 'e-resize',
					start: function() {
						this.curInnerWidth = $(that.currentElement).width();
						this.curMarginRight = that.marginRight;
						this.curPaddingRight = that.paddingRight;
						that.interacting = 'margin';
					},
					drag: function(event, ui) {
						ui.position.left = applyPrecision(ui.originalPosition.left, ui.position.left);
						ui.position.left = Math.max(this.curInnerWidth + this.curPaddingRight - handleOffset, ui.position.left);
						(that.selectedRule || that.currentElement).style.marginRight = Math.max(0, this.curMarginRight + (ui.position.left - ui.originalPosition.left)) + 'px';
						drag();
					},
					stop: stop
				});

				that.handleMarginLeft.draggable({
					distance: 0,
					axis: 'x',
					cursor: 'w-resize',
					start: function(event, ui) {
						this.curOffset = ui.offset.left;
						this.curMarginLeft = that.marginLeft;
						that.interacting = 'margin';
					},
					drag: function(event, ui) {
						ui.position.left = -handleOffset;
						var delta = (ui.offset.left - this.curOffset);
						delta = !that.shiftPressed ? Math.round(delta / 4) : delta;
						(that.selectedRule || that.currentElement).style.marginLeft = Math.max(0, this.curMarginLeft - delta) + 'px';
						drag();
					},
					stop: stop
				});

				that.handleMarginTop.draggable({
					distance: 0,
					axis: 'y',
					cursor: 'n-resize',
					start: function(event, ui) {
						this.curOffset = ui.offset.top;
						this.curMarginTop = that.marginTop;
						that.interacting = 'margin';
					},
					drag: function(event, ui) {
						ui.position.top = -handleOffset;
						var delta = (ui.offset.top - this.curOffset);
						delta = !that.shiftPressed ? Math.round(delta / 4) : delta;
						(that.selectedRule || that.currentElement).style.marginTop = Math.max(0, this.curMarginTop - delta) + 'px';
						drag();
					},
					stop: stop
				});

			})();

		},

		/*
		 * Core runtime functionality
		 */

		relayout: function() {

			var computedStyle = this.computedStyle = getComputedStyle(this.currentElement);

			var overlayElement = this.overlayElement;
			var elem = $(this.currentElement);
			var offset = elem.offset();

			// we need to store outer height, bottom/right padding and margins for hover detection
			var paddingLeft = this.paddingLeft = parseInt(computedStyle.paddingLeft);
			var paddingTop = this.paddingTop = parseInt(computedStyle.paddingTop);
			var paddingRight = this.paddingRight = parseInt(computedStyle.paddingRight);
			var paddingBottom = this.paddingBottom = parseInt(computedStyle.paddingBottom);

			var marginLeft = this.marginLeft = parseInt(computedStyle.marginLeft);
			var marginTop = this.marginTop = parseInt(computedStyle.marginTop);
			var marginRight = this.marginRight = parseInt(computedStyle.marginRight);
			var marginBottom = this.marginBottom = parseInt(computedStyle.marginBottom);

			var innerWidth = this.innerWidth = parseInt(computedStyle.width) || (this.currentElement.offsetWidth - paddingLeft - paddingRight);
			var innerHeight = this.innerHeight = parseInt(computedStyle.height) || (this.currentElement.offsetHeight - paddingTop - paddingBottom);

			var outerWidth = this.outerWidth = innerWidth + paddingLeft + paddingRight;
			var outerHeight = this.outerHeight = innerHeight + paddingTop + paddingBottom;

			// calculate handle size
			var handleSizeX = 16;
			var handleSizeY = 16;
			if(innerWidth < 100) {
				handleSizeX = Math.max(8, Math.min(16, handleSizeX * (innerWidth / 60)));
			}
			if(innerHeight < 100) {
				handleSizeY = Math.max(8, Math.min(16, handleSizeY * (innerHeight / 60)));
			}
			this.refreshHandles(handleSizeX, handleSizeY);

			// place and resize overlay
			overlayElement.style.width = innerWidth + 'px';
			overlayElement.style.height = innerHeight + 'px';
			overlayElement.style.transform = 'translate(' + (offset.left + paddingLeft) + 'px, ' + (offset.top + paddingTop) + 'px)';

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

			// offset magic
			this.handleMarginLeft[0].style.marginTop = (marginLeft < 20 ? (-(((handleSizeY / 4) * marginLeft) / 5) + (handleSizeY / 2)) : -(handleSizeY / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
			this.captionMarginLeft.style.marginTop = (marginLeft < 20 ? (-(((handleSizeY / 4) * marginLeft) / 5) - 8 + handleSizeY) : -8) + 'px';
			
			this.handleMarginRight[0].style.marginTop = (marginRight < 20 ? (-(((handleSizeY / 4) * marginRight) / 5) + (handleSizeY / 2)) : -(handleSizeY / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
			this.captionMarginRight.style.marginTop = (marginRight < 20 ? (-(((handleSizeY / 4) * marginRight) / 5) - 8 + handleSizeY) : -8) + 'px';
			
			this.handleMarginTop[0].style.marginLeft = (marginTop < 20 ? (-(((handleSizeX / 4) * marginTop) / 5) + (handleSizeX / 2)) : -(handleSizeX / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
			this.captionMarginTop.style.marginLeft = (marginTop < 20 ? ((handleSizeX) + (-(handleSizeX) * (marginTop / 20)) - 8) : -11) + 'px';
			
			this.handleMarginBottom[0].style.marginLeft = (marginBottom < 20 ? (-(((handleSizeX / 4) * marginBottom) / 5) + (handleSizeX / 2)) : -(handleSizeX / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
			this.captionMarginBottom.style.marginLeft = (marginBottom < 20 ? ((handleSizeX) + (-(handleSizeX) * (marginBottom / 20)) - 8) : -11) + 'px';

			this.handleSizeRight[0].style.marginTop = (paddingRight < 20 ? (+(((handleSizeY / 4) * paddingRight) / 5) - (handleSizeY * 1.5)) : -(handleSizeY / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
			this.captionWidth.style.marginTop = (paddingRight < 20 ? (+(((handleSizeY / 4) * paddingRight) / 5) - (handleSizeY * 1.5)) : -8) + 'px';

			this.handleSizeBottom[0].style.marginLeft = (paddingBottom < 20 ? (+(((handleSizeX / 4) * paddingBottom) / 5) - (handleSizeX * 1.5)) : -(handleSizeX / 2)) + 'px';
			this.captionHeight.style.marginLeft = (paddingBottom < 20 ? ((handleSizeX * (paddingBottom / 20)) - handleSizeX * 2 + handleSizeX - 9) : -10) + 'px';

			this.handlePaddingLeft[0].style.marginTop = -(handleSizeY / 2) + 'px';
			this.handlePaddingRight[0].style.marginTop = -(handleSizeY / 2) + 'px';
			this.handlePaddingTop[0].style.marginLeft = -(handleSizeX / 2) + 'px';
			this.handlePaddingBottom[0].style.marginLeft = -(handleSizeX / 2) + 'px';

			this.refreshHandles();
			this.refreshCaptions();

			this.currentOffset = offset;

			// inform plugins that a relayout has happened
			this.callPlugin('relayout', {

				computedStyle: computedStyle,
				offset: offset,

				paddingLeft: paddingLeft,
				paddingTop: paddingTop,
				paddingRight: paddingRight,
				paddingBottom: paddingBottom,

				marginLeft: marginLeft,
				marginTop: marginTop,
				marginRight: marginRight,
				marginBottom: marginBottom,

				innerWidth: innerWidth,
				innerHeight: innerHeight,
				outerWidth: outerWidth,
				outerHeight: outerHeight

			});

		},

		refreshHandles: function(handleSizeX, handleSizeY) {

			this.handleMarginLeft[0].style.height = handleSizeY + 'px';
			this.handleMarginRight[0].style.height = handleSizeY + 'px';
			this.handleMarginTop[0].style.width = handleSizeX + 'px';
			this.handleMarginBottom[0].style.width = handleSizeX + 'px';

			this.handlePaddingLeft[0].style.height = handleSizeY + 'px';
			this.handlePaddingRight[0].style.height = handleSizeY + 'px';
			this.handlePaddingTop[0].style.width = handleSizeX + 'px';
			this.handlePaddingBottom[0].style.width = handleSizeX + 'px';

			this.handleSizeRight[0].style.height = handleSizeY + 'px';
			this.handleSizeBottom[0].style.width = handleSizeX + 'px';

		},

		refreshCaptions: function() {

			var offset = { left: this.currentElement.offsetLeft, top: this.currentElement.offsetTop };

			// captions
			var hitsRightEdge, hitsLeftEdge;

			hitsRightEdge = (offset.left + this.outerWidth + 80 > window.innerWidth);
			this.captionWidth.classList[hitsRightEdge ? 'add' : 'remove']('edge');
			this.captionWidth.innerHTML = '<span>width: </span>' + this.getCaptionProperty('width');
			this.captionWidth.style.right = (hitsRightEdge ? 16 : -(this.captionWidth.offsetWidth + 13)) + 'px';

			this.captionHeight.innerHTML = '<span>height: </span>' + this.getCaptionProperty('height');

			this.captionPaddingLeft.innerHTML = '<span>padding-left: </span>' + this.getCaptionProperty('paddingLeft');
			this.captionPaddingRight.innerHTML = '<span>padding-right: </span>' + this.getCaptionProperty('paddingRight');
			this.captionPaddingTop.innerHTML = '<span>padding-top: </span>' + this.getCaptionProperty('paddingTop');
			this.captionPaddingBottom.innerHTML = '<span>padding-bottom: </span>' + this.getCaptionProperty('paddingBottom');

			this.captionMarginLeft.innerHTML = '<span>margin-left: </span>' + this.getCaptionProperty('marginLeft');
			this.captionMarginRight.innerHTML = '<span>margin-right: </span>' + this.getCaptionProperty('marginRight');
			this.captionMarginTop.innerHTML = '<span>margin-top: </span>' + this.getCaptionProperty('marginTop');
			this.captionMarginBottom.innerHTML = '<span>margin-bottom: </span>' + this.getCaptionProperty('marginBottom');

			hitsLeftEdge = (offset.left - 80 < 0);
			this.captionPaddingLeft.classList[hitsLeftEdge ? 'add' : 'remove']('edge');
			this.captionPaddingLeft.style.marginRight = (hitsLeftEdge ? this.paddingLeft - this.captionPaddingLeft.offsetWidth-16 : this.paddingLeft + 14) + 'px';

			hitsRightEdge = (offset.left + this.outerWidth + 80 > window.innerWidth);
			this.captionPaddingRight.classList[hitsRightEdge ? 'add' : 'remove']('edge');
			this.captionPaddingRight.style.marginLeft = (hitsRightEdge ? this.paddingRight - this.captionPaddingRight.offsetWidth-16 : this.paddingRight + 14) + 'px';

			this.captionPaddingBottom.style.bottom = -(this.paddingBottom  + 24) + 'px';
			this.captionPaddingTop.style.top = -(this.paddingTop  + 24) + 'px';

			hitsLeftEdge = (offset.left - this.marginLeft - 80 < 0);
			this.captionMarginLeft.classList[hitsLeftEdge ? 'add' : 'remove']('edge');
			this.captionMarginLeft.style.marginRight = this.paddingLeft + this.marginLeft + (hitsLeftEdge ? -this.captionMarginLeft.offsetWidth-17 : 14) + 'px';

			hitsRightEdge = (offset.left + this.outerWidth + this.marginRight + 80 > window.innerWidth);
			this.captionMarginRight.classList[hitsRightEdge ? 'add' : 'remove']('edge');
			this.captionMarginRight.style.marginLeft = this.paddingRight + this.marginRight + (hitsRightEdge ? -this.captionMarginRight.offsetWidth-17 : 14) + 'px';

			this.captionMarginBottom.style.bottom = -this.marginBottom -this.paddingBottom -24 + 'px';
			this.captionMarginTop.style.top = -this.marginTop -this.paddingTop -24 + 'px';

		},

		getCaptionProperty: function(cssProperty) {

			// check in inline styles
			if(this.currentElement.style[cssProperty]) {
				return this.currentElement.style[cssProperty].replace(/(em|px)/, ' <span>$1</span>');
			}

			// check in rules
			for (var i = 0; i < this.matchedRules.length; i++) {
				if(this.matchedRules[i].style[cssProperty]) {
					return this.matchedRules[i].style[cssProperty].replace(/(em|px)/, ' <span>$1</span>');
				}
			}

			var retVal = '';

			if(cssProperty.indexOf('margin') > -1 || cssProperty.indexOf('padding') > -1) {
				retVal = this[cssProperty];
			} else if(cssProperty === 'height') {
				retVal = this.innerHeight;
			} else if(cssProperty === 'width') {
				retVal = this.innerWidth;
			}

			// implicit value
			return '(' + retVal + ' <span>px</span>)';

		},

		activate: function(newElem) {

			this.currentElement = newElem;
			this.computedStyle = getComputedStyle(this.currentElement);

			// initial hover
			this.overlayElement.classList.add('hover');
			this.overlayElement.style.display = 'block';
			this.over = true;

			if(this.computedStyle.display === 'inline') {
				this.overlayElement.classList.add('hover-inline');
			} else {
				this.overlayElement.classList.remove('hover-inline');
			}

			// hide the hover ghost for inspection
			this.hoverGhost.overlayElement.style.display = 'none';

			// find matching rules
			this.matchedRules = StyleParser.resolve(this.currentElement);

			// execute plugins
			this.callPlugin('activate');

			// relayout
			this.relayout();

		},

		deactivate: function() {

			if(this.selectedRule) {
				this.exitRuleMode();
			}

			this.overlayElement.classList.remove('hover', 'hover-inner', 'hover-padding', 'hover-margin', 'hidden');
			this.overlayElement.style.display = 'none';

			// execute plugins
			this.callPlugin('deactivate');

			this.over = false;
			this.overInner = false;
			this.overPadding = false;
			this.overMargin = false;
			this.overCommand = false;
			this.currentElement = null;

			$(document).off('keyup', this.__keyup);
			$(document).off('keydown', this.__keydown);

		},

		/*
		 * Functions related to rule-based editing
		 */

		enterRuleMode: function(cssRule, index) {

			// if selectedRule and new cssRule are the same, don't do anything
			if(this.selectedRule === cssRule) {
				return;
			}

			// if selectedRule wasn't empty, we simply change the rule
			if(this.selectedRule) {
				this.selectedRule = cssRule;
				this.callPlugin('changeRule', index);
			} else {
				this.selectedRule = cssRule;
				this.callPlugin('enterRule', index);
			}

		},

		exitRuleMode: function() {
			this.callPlugin('exitRule');
			this.selectedRule = null;
		},

		selectRule: function(cssProperty) {

			for (var i = 0; i < this.matchedRules.length; i++) {
				if(this.matchedRules[i].style[cssProperty]) {
					this.enterRuleMode(this.matchedRules[i], i);
					return;
				}
			}

			// no rule matching? exit rule mode then
			this.exitRuleMode();

		},

		deselectRule: function() {
			this.exitRuleMode();
		},

		/* 
		 * functions to temporarily disable
		 * layout mode, i.e. for previewing.
		 */

		show: function() {

			this.hidden = false;
			this.over = this.__lastOver;

			if(this.over) this.overlayElement.classList.add('hover');
			if(this.overInner) this.overlayElement.classList.add('hover-inner');
			if(this.overPadding) this.overlayElement.classList.add('hover-padding');
			if(this.overMargin) this.overlayElement.classList.add('hover-margin');

			this.overlayElement.classList.remove('hidden');

			// edge case: user holds command, moves out, releases command
			if(this.__lastMouseMoveEvent)
				this.processOverLogic(this.__lastMouseMoveEvent);

			this.hoverGhost.overlayElement.style.visibility = '';

			this.callPlugin('show');

		},

		hide: function() {

			this.hidden = true;
			this.__lastOver = this.over;
			this.over = false;

			this.overlayElement.classList.remove('hover', 'hover-inner', 'hover-margin', 'hover-padding');
			this.overlayElement.classList.add('hidden');
			this.hoverGhost.overlayElement.style.visibility = 'hidden';

			this.callPlugin('hide');

		}


	});

	// Create Layout Mode (singleton)
	window.LayoutMode = new LayoutMode();

})();


