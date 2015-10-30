var Ghost = function(elem) {

	this.overlayElement = this.create();
	this.currentElement = elem;

};

$.extend(Ghost.prototype, {

	create: function() {

		var ghost = $('<div class="overlay ghost"></div>');
		$('<div class="container-margin top"></div>').appendTo(ghost);
		$('<div class="container-margin bottom"></div>').appendTo(ghost);
		$('<div class="container-margin left"></div>').appendTo(ghost);
		$('<div class="container-margin right"></div>').appendTo(ghost);
		$('<div class="container-padding top"></div>').appendTo(ghost);
		$('<div class="container-padding bottom"></div>').appendTo(ghost);
		$('<div class="container-padding left"></div>').appendTo(ghost);
		$('<div class="container-padding right"></div>').appendTo(ghost);

		ghost.appendTo('body');
		return ghost[0];

	},

	destroy: function() {
		this.overlayElement.parentNode.removeChild(this.overlayElement);
	},

	relayout: function(newElem) {

		if(newElem) {
			this.currentElement = newElem;
		}

		var overlayElement = this.overlayElement;
		var elem = $(this.currentElement);
		var offset = elem.offset();

		var computedStyle = getComputedStyle(this.currentElement);

		var innerWidth = parseInt(computedStyle.width);
		var innerHeight = parseInt(computedStyle.height);

		var paddingLeft = parseInt(computedStyle.paddingLeft);
		var paddingTop = parseInt(computedStyle.paddingTop);
		var paddingRight = parseInt(computedStyle.paddingRight);
		var paddingBottom = parseInt(computedStyle.paddingBottom);

		var marginLeft = parseInt(computedStyle.marginLeft);
		var marginTop = parseInt(computedStyle.marginTop);
		var marginRight = parseInt(computedStyle.marginRight);
		var marginBottom = parseInt(computedStyle.marginBottom);

		var outerWidth = innerWidth + paddingLeft + paddingRight;
		var outerHeight = innerHeight + paddingTop + paddingBottom;

		// place and resize overlay
		overlayElement.style.display = 'block';
		overlayElement.style.width = innerWidth + 'px';
		overlayElement.style.height = innerHeight + 'px';
		overlayElement.style.transform = 'translate(' + (offset.left + paddingLeft) + 'px, ' + (offset.top + paddingTop) + 'px)';

		// modify padding box

		// left
		$('.container-padding.left', overlayElement).css({
			width: paddingLeft,
			height: outerHeight,
			top: -paddingTop,
			left: -paddingLeft
		});

		// right
		$('.container-padding.right', overlayElement).css({
			width: paddingRight,
			height: outerHeight,
			top: -paddingTop,
			right: -paddingRight
		});

		// top
		$('.container-padding.top', overlayElement).css({
			width: innerWidth,
			height: paddingTop,
			top: -paddingTop
		});

		// bottom
		$('.container-padding.bottom', overlayElement).css({
			width: innerWidth,
			height: paddingBottom,
			bottom: -paddingBottom
		});

		// modify margin box

		// left
		$('.container-margin.left', overlayElement).css({
			width: marginLeft,
			height: outerHeight + marginTop + marginBottom,
			top: -(paddingTop + marginTop),
			left: -(paddingLeft + marginLeft)
		});

		// right
		$('.container-margin.right', overlayElement).css({
			width: marginRight,
			height: outerHeight + marginTop + marginBottom,
			top: -(paddingTop + marginTop),
			right: -(paddingRight + marginRight)
		});

		// top
		$('.container-margin.top', overlayElement).css({
			width: outerWidth,
			height: marginTop,
			top: -(paddingTop + marginTop),
			left: -paddingLeft
		});

		// bottom
		$('.container-margin.bottom', overlayElement).css({
			width: outerWidth,
			height: marginBottom,
			bottom: -(paddingBottom + marginBottom),
			left: -paddingLeft
		});

	}

});
(function() {

	'use strict';

	var isTouch = 'ontouchstart' in document;

	var Dragger = function(event, options) {

		this.options = options;
		this.eventDown = event.touches ? event.touches[0] : event;
		this.start();

	};

	$.extend(Dragger.prototype, {
		start: function() {

			event.preventDefault();

			var self = this;
			this.__move = function(e) { self.move(e); };
			this.__stop = function(e) { self.stop(e); };
			document.addEventListener(isTouch ? 'touchmove' : 'mousemove', this.__move, false);
			document.addEventListener(isTouch ? 'touchend' : 'mouseup', this.__stop, false);

		},
		move: function(event) {

			this.eventMove = event.touches ? event.touches[0] : event;
			event.preventDefault();

			var moveby = 0;

			if(this.options.vertical) {
				moveby = (this.eventDown.pageY - this.eventMove.pageY);
			} else {
				moveby = (this.eventDown.pageX - this.eventMove.pageX);
			}

			this.options.move(moveby);

		},
		stop: function(event) {

			document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', this.__move);
			document.removeEventListener(isTouch ? 'touchend' : 'mouseup', this.__stop);

			event.preventDefault();
			this.options.stop();

		}
	});

	window.Dragger = Dragger;

})();
/**
 * Calculates the specificity of CSS selectors
 * http://www.w3.org/TR/css3-selectors/#specificity
 *
 * Returns an array of objects with the following properties:
 *  - selector: the input
 *  - specificity: e.g. 0,1,0,0
 *  - parts: array with details about each part of the selector that counts towards the specificity
 */
var SPECIFICITY = (function() {
	var calculate,
		calculateSingle;

	calculate = function(input) {
		var selectors,
			selector,
			i,
			len,
			results = [];

		// Separate input by commas
		selectors = input.split(',');

		for (i = 0, len = selectors.length; i < len; i += 1) {
			selector = selectors[i];
			if (selector.length > 0) {
				results.push(calculateSingle(selector));
			}
		}

		return results;
	};

	// Calculate the specificity for a selector by dividing it into simple selectors and counting them
	calculateSingle = function(input) {
		var selector = input,
			findMatch,
			typeCount = {
				'a': 0,
				'b': 0,
				'c': 0
			},
			parts = [],
			// The following regular expressions assume that selectors matching the preceding regular expressions have been removed
			attributeRegex = /(\[[^\]]+\])/g,
			idRegex = /(#[^\s\+>~\.\[:]+)/g,
			classRegex = /(\.[^\s\+>~\.\[:]+)/g,
			pseudoElementRegex = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,
			// A regex for pseudo classes with brackets - :nth-child(), :nth-last-child(), :nth-of-type(), :nth-last-type(), :lang()
			pseudoClassWithBracketsRegex = /(:[\w-]+\([^\)]*\))/gi,
			// A regex for other pseudo classes, which don't have brackets
			pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g,
			elementRegex = /([^\s\+>~\.\[:]+)/g;

		// Find matches for a regular expression in a string and push their details to parts
		// Type is "a" for IDs, "b" for classes, attributes and pseudo-classes and "c" for elements and pseudo-elements
		findMatch = function(regex, type) {
			var matches, i, len, match, index, length;
			if (regex.test(selector)) {
				matches = selector.match(regex);
				for (i = 0, len = matches.length; i < len; i += 1) {
					typeCount[type] += 1;
					match = matches[i];
					index = selector.indexOf(match);
					length = match.length;
					parts.push({
						selector: match,
						type: type,
						index: index,
						length: length
					});
					// Replace this simple selector with whitespace so it won't be counted in further simple selectors
					selector = selector.replace(match, Array(length + 1).join(' '));
				}
			}
		};

		// Remove the negation psuedo-class (:not) but leave its argument because specificity is calculated on its argument
		(function() {
			var regex = /:not\(([^\)]*)\)/g;
			if (regex.test(selector)) {
				selector = selector.replace(regex, '     $1 ');
			}
		}());

		// Remove anything after a left brace in case a user has pasted in a rule, not just a selector
		(function() {
			var regex = /{[^]*/gm,
				matches, i, len, match;
			if (regex.test(selector)) {
				matches = selector.match(regex);
				for (i = 0, len = matches.length; i < len; i += 1) {
					match = matches[i];
					selector = selector.replace(match, Array(match.length + 1).join(' '));
				}
			}
		}());

		// Add attribute selectors to parts collection (type b)
		findMatch(attributeRegex, 'b');

		// Add ID selectors to parts collection (type a)
		findMatch(idRegex, 'a');

		// Add class selectors to parts collection (type b)
		findMatch(classRegex, 'b');

		// Add pseudo-element selectors to parts collection (type c)
		findMatch(pseudoElementRegex, 'c');

		// Add pseudo-class selectors to parts collection (type b)
		findMatch(pseudoClassWithBracketsRegex, 'b');
		findMatch(pseudoClassRegex, 'b');

		// Remove universal selector and separator characters
		selector = selector.replace(/[\*\s\+>~]/g, ' ');

		// Remove any stray dots or hashes which aren't attached to words
		// These may be present if the user is live-editing this selector
		selector = selector.replace(/[#\.]/g, ' ');

		// The only things left should be element selectors (type c)
		findMatch(elementRegex, 'c');

		// Order the parts in the order they appear in the original selector
		// This is neater for external apps to deal with
		parts.sort(function(a, b) {
			return a.index - b.index;
		});

		return {
			selector: input,
			specificity: '0,' + typeCount.a.toString() + ',' + typeCount.b.toString() + ',' + typeCount.c.toString(),
			parts: parts
		};
	};

	return {
		calculate: calculate
	};
}());


(function() {

	var StyleParser = {};

	var rules = {};
	var sheets = document.styleSheets;

	var sheet, rule;
	for (var i = 0; i < sheets.length; i++) {
		
		sheet = sheets[i];
		if(!sheet.cssRules) continue;

		for (var j = 0; j < sheet.cssRules.length; j++) {
			rule = sheet.cssRules[j];
			rules[rule.selectorText] = rule;
		}
	}

	StyleParser.resolve = function(trackedElement) {

		var matchedRules = window.getMatchedCSSRules(trackedElement) || [];
		var rules = [];
		for (var i = 0; i < matchedRules.length; i++) {
			rules.push([matchedRules[i], parseInt(SPECIFICITY.calculate(matchedRules[i].selectorText)[0].specificity.replace(/\,/g, ''), 10) + 0.01 * i]);
		}



		rules = rules
			.sort(function(a, b) {
				return b[1] - a[1];
			})
			.map(function(a) {
				return a[0];
			});

		return rules;

	};

	window.StyleParser = StyleParser;

})();
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



LayoutMode.registerPlugin({

	create: function() {

		this.titleBox = $('<div class="overlay-title"><div class="title-rule"><span class="selected">inline style</span> <span class="toggle">▾</span><ul class="dropdown"><li>inline style</li></ul></div><div class="title-proportions">100 x 100</div></div>')
			.appendTo(document.body)[0];

		this.titleProportions = $('.title-proportions', this.titleBox)[0];
		this.titleDropdown = $('.dropdown', this.titleBox);

	},

	activate: function() {

		// initialize title box behaviour
		var titleBox = this.titleBox;
		var titleDropdown = this.titleDropdown;

		$('span', titleBox).click(function() {
			$('.dropdown', titleBox).toggle();
		});


		titleDropdown.on('click', 'li', function() {
			titleDropdown.hide();
			$('.selected', titleBox).html(this.innerHTML);
		});

		this.fillRules();

	},

	deactivate: function() {
		this.titleBox.style.opacity = 0;
		$('span', this.titleBox).off('click');
		$('span', this.titleDropdown).off('click');
	},

	enterRule: function(index) {
		this.titleBox.classList.add('rule');
		LayoutMode.overlayElement.style.zIndex = 10002;
		this.changeRule(index);
	},

	changeRule: function(index) {
		this.titleDropdown.find('li:eq(' + (index + 1) + ')').click();
	},

	exitRule: function() {
		$('span.selected', this.titleBox).html('inline style');
		this.titleBox.classList.remove('rule');
		LayoutMode.overlayElement.style.zIndex = '';
	},

	relayout: function(props) {

		var offset = LayoutMode.currentOffset;

		// place title box
		this.titleBox.style.opacity = 1;
		this.titleBox.style.transform = 'translate(' + (offset.left + ((props.outerWidth - this.titleBox.offsetWidth) / 2)) + 'px, ' + (offset.top - props.marginTop - 55) + 'px)';
		this.titleProportions.innerHTML = props.outerWidth + ' x ' + props.outerHeight;

	},

	show: function() {
		this.titleBox.style.opacity = 1;
	},

	hide: function() {
		this.titleBox.style.opacity = 0;
	},

	/* member functions */

	fillRules: function() {

		var resolved = LayoutMode.matchedRules;

		this.titleDropdown.empty();
		$('<li>inline style</li>').appendTo(this.titleDropdown);
		for (var i = 0; i < resolved.length; i++) {
			$('<li>' + resolved[i].selectorText + '</li>')
				.data('cssRule', resolved[i])
				.appendTo(this.titleDropdown);
		}

	}

});
LayoutMode.registerPlugin({

	create: function() {

		var overlay = LayoutMode.overlayElement;

		this.guideMarginLeft = $('<div class="guide guide-margin-left"></div>').appendTo(overlay)[0];
		this.guideMarginRight = $('<div class="guide guide-margin-right"></div>').appendTo(overlay)[0];
		this.guideMarginBottom = $('<div class="guide guide-margin-bottom"></div>').appendTo(overlay)[0];
		this.guideMarginTop = $('<div class="guide guide-margin-top"></div>').appendTo(overlay)[0];

		this.guidePaddingLeft = $('<div class="guide guide-padding-left"></div>').appendTo(overlay)[0];
		this.guidePaddingRight = $('<div class="guide guide-padding-right"></div>').appendTo(overlay)[0];
		this.guidePaddingBottom = $('<div class="guide guide-padding-bottom"></div>').appendTo(overlay)[0];
		this.guidePaddingTop = $('<div class="guide guide-padding-top"></div>').appendTo(overlay)[0];

	},

	relayout: function(props) {

		// padding guides
		this.guidePaddingLeft.style.transform = 'translate(0px, ' + (-props.offset.top -props.paddingTop) + 'px)';
		this.guidePaddingLeft.style.height = window.innerHeight + 'px';
		this.guidePaddingLeft.style.left = -props.paddingLeft + 'px';

		this.guidePaddingRight.style.transform = 'translate(0px, ' + (-props.offset.top -props.paddingTop) + 'px)';
		this.guidePaddingRight.style.height = window.innerHeight + 'px';
		this.guidePaddingRight.style.right = -props.paddingRight-1 + 'px';

		this.guidePaddingBottom.style.transform = 'translate(' + (-props.offset.left -props.paddingLeft) + 'px, 0px)';
		this.guidePaddingBottom.style.width = window.innerWidth + 'px';
		this.guidePaddingBottom.style.bottom = -props.paddingBottom-1 + 'px';

		this.guidePaddingTop.style.transform = 'translate(' + (-props.offset.left -props.paddingLeft) + 'px, 0px)';
		this.guidePaddingTop.style.width = window.innerWidth + 'px';
		this.guidePaddingTop.style.top = -props.paddingTop-1 + 'px';

		// margin guides
		this.guideMarginLeft.style.transform = 'translate(0px, ' + (-props.offset.top -props.paddingTop) + 'px)';
		this.guideMarginLeft.style.height = window.innerHeight + 'px';
		this.guideMarginLeft.style.left = -props.paddingLeft -props.marginLeft + 'px';

		this.guideMarginRight.style.transform = 'translate(0px, ' + (-props.offset.top -props.paddingTop) + 'px)';
		this.guideMarginRight.style.height = window.innerHeight + 'px';
		this.guideMarginRight.style.right = -props.paddingRight -props.marginRight - 1 + 'px';

		this.guideMarginBottom.style.transform = 'translate(' + (-props.offset.left -props.paddingLeft) + 'px, 0px)';
		this.guideMarginBottom.style.width = window.innerWidth + 'px';
		this.guideMarginBottom.style.bottom = -props.paddingBottom -props.marginBottom -1 + 'px';

		this.guideMarginTop.style.transform = 'translate(' + (-props.offset.left -props.paddingLeft) + 'px, 0px)';
		this.guideMarginTop.style.width = window.innerWidth + 'px';
		this.guideMarginTop.style.top = -props.paddingTop -props.marginTop -1 + 'px';

	}

});
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
LayoutMode.registerPlugin({

	activate: function() {

		LayoutMode.currentElement.setAttribute('contentEditable', true);
		LayoutMode.currentElement.style.outline = 'none';

		LayoutMode.currentElement.focus();

		$(document).on('keyup', this.keyup);

	},

	deactivate: function() {

		LayoutMode.currentElement.removeAttribute('contentEditable');
		LayoutMode.currentElement.style.outline = '';

		$(document).off('keyup', this.keyup);

	},

	/* member functions */

	keyup: function() {
		LayoutMode.relayout();
	}

});
LayoutMode.registerPlugin({

	create: function() {

	},

	activate: function() {

		var that = this;

		$(document)
			.on('keydown', function(e) {
				if(e.keyCode === 91) { // cmd key
					that.enable();
				}
			})
			.on('keyup', function(e) {
				if(e.keyCode === 91) { // cmd key
					that.disable();
				}
			});

	},

	deactivate: function() {
		this.disable();
	},

	hoverTargetChange: function(e) {

		if(this.enabled)
			this.processCommandOverLogic(e);

		// if we're holding shift and hover another element, show guides
		if(this.enabled &&
			LayoutMode.currentElement &&
			LayoutMode.hoverElement !== LayoutMode.currentElement &&
			!$.contains(LayoutMode.hoverElement, LayoutMode.currentElement) &&
			!$.contains(LayoutMode.currentElement, LayoutMode.hoverElement)
		) {
			this.visualizeRelationTo(LayoutMode.hoverElement);
			return false;
		}

	},

	/* member functions */

	enable: function() {

		this.enabled = true;

		LayoutMode.hide();

		//LayoutMode.over = false;

		// process over logic once
		if(LayoutMode.__lastMouseMoveEvent)
			this.processCommandOverLogic(LayoutMode.__lastMouseMoveEvent);

		// visualize right away with what we previously hovered
		if(LayoutMode.hoverElement !== LayoutMode.currentElement &&
			!$.contains(LayoutMode.hoverElement, LayoutMode.currentElement) &&
			!$.contains(LayoutMode.currentElement, LayoutMode.hoverElement)
		) {
			this.visualizeRelationTo(LayoutMode.hoverElement);
		}

	},

	disable: function() {
		this.enabled = false;
		this.commandOver = false;
		if(this.vLineX) this.vLineX.style.opacity = 0;
		if(this.vLineY) this.vLineY.style.opacity = 0;
		LayoutMode.show();
	},

	processCommandOverLogic: function(e) {

		var extraMargin = 10;
		var offset = LayoutMode.currentOffset;

		// command over/out

		if(
			e.pageX > offset.left - LayoutMode.marginLeft - extraMargin &&
			e.pageY > offset.top - LayoutMode.marginTop - extraMargin &&
			e.pageX < (offset.left + LayoutMode.outerWidth + LayoutMode.marginRight + extraMargin) &&
			e.pageY < (offset.top + LayoutMode.outerHeight + LayoutMode.marginBottom + extraMargin)
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

		var currentElement = LayoutMode.currentElement;

		this.createVisualizationLines();

		this.vLineX.style.opacity = 1;
		this.vLineX.style.top = (LayoutMode.currentOffset.top + (currentElement.offsetHeight / 2)) + 'px';
		this.vLineX.style.left = 0 + 'px';
		this.vLineX.style.width = LayoutMode.currentOffset.left + 'px';
		this.vLineXCaption.innerHTML = LayoutMode.currentOffset.left + ' <span>px</span>';

		this.vLineY.style.opacity = 1;
		this.vLineY.style.left = (LayoutMode.currentOffset.left + (currentElement.offsetWidth / 2)) + 'px';
		this.vLineY.style.top = 0 + 'px';
		this.vLineY.style.height = LayoutMode.currentOffset.top + 'px';
		this.vLineYCaption.innerHTML = LayoutMode.currentOffset.top + ' <span>px</span>';

	},

	visualizeRelationTo: function(relatedElement) {

		var currentElement = LayoutMode.currentElement, top, left;
		var currentOffset = LayoutMode.currentOffset;
		var relatedOffset = $(relatedElement).offset();

		this.createVisualizationLines();

		var reRightEdge = relatedOffset.left + relatedElement.offsetWidth;
		var ceRightEdge = currentOffset.left + currentElement.offsetWidth;
		var reLeftEdge = relatedOffset.left;
		var ceLeftEdge = currentOffset.left;

		var reBottomEdge = relatedOffset.top + relatedElement.offsetHeight;
		var ceBottomEdge = currentOffset.top + currentElement.offsetHeight;
		var reTopEdge = relatedOffset.top;
		var ceTopEdge = currentOffset.top;
		
		// horizontal connection
		if(reRightEdge < ceLeftEdge) {

			top = currentOffset.top + (currentElement.offsetHeight / 2);
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

			top = currentOffset.top + (currentElement.offsetHeight / 2);
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

			left = currentOffset.left + (currentElement.offsetWidth / 2);
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

			left = currentOffset.left + (currentElement.offsetWidth / 2);
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

	}

});
(function() {

	LayoutMode.enable();

	//$('ul').sortable();
	$('#testbox').click();

})();



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiRHJhZ2dlci5qcyIsIlN0eWxlUGFyc2VyLmpzIiwiTGF5b3V0TW9kZS5qcyIsIlRpdGxlLmpzIiwiR3VpZGVzLmpzIiwiR2hvc3RzLmpzIiwiQ29udGVudEVkaXRhYmxlLmpzIiwiQ29tcGFyZUFuZFByZXZpZXcuanMiLCJpbml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEdob3N0ID0gZnVuY3Rpb24oZWxlbSkge1xuXG5cdHRoaXMub3ZlcmxheUVsZW1lbnQgPSB0aGlzLmNyZWF0ZSgpO1xuXHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gZWxlbTtcblxufTtcblxuJC5leHRlbmQoR2hvc3QucHJvdG90eXBlLCB7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBnaG9zdCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5IGdob3N0XCI+PC9kaXY+Jyk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cblx0XHRnaG9zdC5hcHBlbmRUbygnYm9keScpO1xuXHRcdHJldHVybiBnaG9zdFswXTtcblxuXHR9LFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0aWYobmV3RWxlbSkge1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG5ld0VsZW07XG5cdFx0fVxuXG5cdFx0dmFyIG92ZXJsYXlFbGVtZW50ID0gdGhpcy5vdmVybGF5RWxlbWVudDtcblx0XHR2YXIgZWxlbSA9ICQodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cdFx0dmFyIG9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHR2YXIgY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHR2YXIgaW5uZXJXaWR0aCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUud2lkdGgpO1xuXHRcdHZhciBpbm5lckhlaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUuaGVpZ2h0KTtcblxuXHRcdHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdHZhciBwYWRkaW5nVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nVG9wKTtcblx0XHR2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuXHRcdHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0KTtcblx0XHR2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Ub3ApO1xuXHRcdHZhciBtYXJnaW5SaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luUmlnaHQpO1xuXHRcdHZhciBtYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHR2YXIgb3V0ZXJXaWR0aCA9IGlubmVyV2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodDtcblx0XHR2YXIgb3V0ZXJIZWlnaHQgPSBpbm5lckhlaWdodCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuXG5cdFx0Ly8gcGxhY2UgYW5kIHJlc2l6ZSBvdmVybGF5XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUud2lkdGggPSBpbm5lcldpZHRoICsgJ3B4Jztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgKyBwYWRkaW5nVG9wKSArICdweCknO1xuXG5cdFx0Ly8gbW9kaWZ5IHBhZGRpbmcgYm94XG5cblx0XHQvLyBsZWZ0XG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBwYWRkaW5nTGVmdCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyByaWdodFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IHBhZGRpbmdSaWdodCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0cmlnaHQ6IC1wYWRkaW5nUmlnaHRcblx0XHR9KTtcblxuXHRcdC8vIHRvcFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy50b3AnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBwYWRkaW5nVG9wLFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcFxuXHRcdH0pO1xuXG5cdFx0Ly8gYm90dG9tXG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmJvdHRvbScsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHBhZGRpbmdCb3R0b20sXG5cdFx0XHRib3R0b206IC1wYWRkaW5nQm90dG9tXG5cdFx0fSk7XG5cblx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXG5cdFx0Ly8gbGVmdFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBtYXJnaW5MZWZ0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdGxlZnQ6IC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gcmlnaHRcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG1hcmdpblJpZ2h0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdHJpZ2h0OiAtKHBhZGRpbmdSaWdodCArIG1hcmdpblJpZ2h0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gdG9wXG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4udG9wJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdGhlaWdodDogbWFyZ2luVG9wLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyBib3R0b21cblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5ib3R0b20nLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBvdXRlcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBtYXJnaW5Cb3R0b20sXG5cdFx0XHRib3R0b206IC0ocGFkZGluZ0JvdHRvbSArIG1hcmdpbkJvdHRvbSksXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIihmdW5jdGlvbigpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGlzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudDtcblxuXHR2YXIgRHJhZ2dlciA9IGZ1bmN0aW9uKGV2ZW50LCBvcHRpb25zKSB7XG5cblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdHRoaXMuZXZlbnREb3duID0gZXZlbnQudG91Y2hlcyA/IGV2ZW50LnRvdWNoZXNbMF0gOiBldmVudDtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cblx0fTtcblxuXHQkLmV4dGVuZChEcmFnZ2VyLnByb3RvdHlwZSwge1xuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dGhpcy5fX21vdmUgPSBmdW5jdGlvbihlKSB7IHNlbGYubW92ZShlKTsgfTtcblx0XHRcdHRoaXMuX19zdG9wID0gZnVuY3Rpb24oZSkgeyBzZWxmLnN0b3AoZSk7IH07XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGlzVG91Y2ggPyAndG91Y2htb3ZlJyA6ICdtb3VzZW1vdmUnLCB0aGlzLl9fbW92ZSwgZmFsc2UpO1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihpc1RvdWNoID8gJ3RvdWNoZW5kJyA6ICdtb3VzZXVwJywgdGhpcy5fX3N0b3AsIGZhbHNlKTtcblxuXHRcdH0sXG5cdFx0bW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcblxuXHRcdFx0dGhpcy5ldmVudE1vdmUgPSBldmVudC50b3VjaGVzID8gZXZlbnQudG91Y2hlc1swXSA6IGV2ZW50O1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dmFyIG1vdmVieSA9IDA7XG5cblx0XHRcdGlmKHRoaXMub3B0aW9ucy52ZXJ0aWNhbCkge1xuXHRcdFx0XHRtb3ZlYnkgPSAodGhpcy5ldmVudERvd24ucGFnZVkgLSB0aGlzLmV2ZW50TW92ZS5wYWdlWSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtb3ZlYnkgPSAodGhpcy5ldmVudERvd24ucGFnZVggLSB0aGlzLmV2ZW50TW92ZS5wYWdlWCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub3B0aW9ucy5tb3ZlKG1vdmVieSk7XG5cblx0XHR9LFxuXHRcdHN0b3A6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXNUb3VjaCA/ICd0b3VjaG1vdmUnIDogJ21vdXNlbW92ZScsIHRoaXMuX19tb3ZlKTtcblx0XHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXNUb3VjaCA/ICd0b3VjaGVuZCcgOiAnbW91c2V1cCcsIHRoaXMuX19zdG9wKTtcblxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMub3B0aW9ucy5zdG9wKCk7XG5cblx0XHR9XG5cdH0pO1xuXG5cdHdpbmRvdy5EcmFnZ2VyID0gRHJhZ2dlcjtcblxufSkoKTsiLCIvKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNwZWNpZmljaXR5IG9mIENTUyBzZWxlY3RvcnNcbiAqIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtc2VsZWN0b3JzLyNzcGVjaWZpY2l0eVxuICpcbiAqIFJldHVybnMgYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqICAtIHNlbGVjdG9yOiB0aGUgaW5wdXRcbiAqICAtIHNwZWNpZmljaXR5OiBlLmcuIDAsMSwwLDBcbiAqICAtIHBhcnRzOiBhcnJheSB3aXRoIGRldGFpbHMgYWJvdXQgZWFjaCBwYXJ0IG9mIHRoZSBzZWxlY3RvciB0aGF0IGNvdW50cyB0b3dhcmRzIHRoZSBzcGVjaWZpY2l0eVxuICovXG52YXIgU1BFQ0lGSUNJVFkgPSAoZnVuY3Rpb24oKSB7XG5cdHZhciBjYWxjdWxhdGUsXG5cdFx0Y2FsY3VsYXRlU2luZ2xlO1xuXG5cdGNhbGN1bGF0ZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0dmFyIHNlbGVjdG9ycyxcblx0XHRcdHNlbGVjdG9yLFxuXHRcdFx0aSxcblx0XHRcdGxlbixcblx0XHRcdHJlc3VsdHMgPSBbXTtcblxuXHRcdC8vIFNlcGFyYXRlIGlucHV0IGJ5IGNvbW1hc1xuXHRcdHNlbGVjdG9ycyA9IGlucHV0LnNwbGl0KCcsJyk7XG5cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBzZWxlY3RvcnMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3JzW2ldO1xuXHRcdFx0aWYgKHNlbGVjdG9yLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0cmVzdWx0cy5wdXNoKGNhbGN1bGF0ZVNpbmdsZShzZWxlY3RvcikpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHRzO1xuXHR9O1xuXG5cdC8vIENhbGN1bGF0ZSB0aGUgc3BlY2lmaWNpdHkgZm9yIGEgc2VsZWN0b3IgYnkgZGl2aWRpbmcgaXQgaW50byBzaW1wbGUgc2VsZWN0b3JzIGFuZCBjb3VudGluZyB0aGVtXG5cdGNhbGN1bGF0ZVNpbmdsZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0dmFyIHNlbGVjdG9yID0gaW5wdXQsXG5cdFx0XHRmaW5kTWF0Y2gsXG5cdFx0XHR0eXBlQ291bnQgPSB7XG5cdFx0XHRcdCdhJzogMCxcblx0XHRcdFx0J2InOiAwLFxuXHRcdFx0XHQnYyc6IDBcblx0XHRcdH0sXG5cdFx0XHRwYXJ0cyA9IFtdLFxuXHRcdFx0Ly8gVGhlIGZvbGxvd2luZyByZWd1bGFyIGV4cHJlc3Npb25zIGFzc3VtZSB0aGF0IHNlbGVjdG9ycyBtYXRjaGluZyB0aGUgcHJlY2VkaW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMgaGF2ZSBiZWVuIHJlbW92ZWRcblx0XHRcdGF0dHJpYnV0ZVJlZ2V4ID0gLyhcXFtbXlxcXV0rXFxdKS9nLFxuXHRcdFx0aWRSZWdleCA9IC8oI1teXFxzXFwrPn5cXC5cXFs6XSspL2csXG5cdFx0XHRjbGFzc1JlZ2V4ID0gLyhcXC5bXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0cHNldWRvRWxlbWVudFJlZ2V4ID0gLyg6OlteXFxzXFwrPn5cXC5cXFs6XSt8OmZpcnN0LWxpbmV8OmZpcnN0LWxldHRlcnw6YmVmb3JlfDphZnRlcikvZ2ksXG5cdFx0XHQvLyBBIHJlZ2V4IGZvciBwc2V1ZG8gY2xhc3NlcyB3aXRoIGJyYWNrZXRzIC0gOm50aC1jaGlsZCgpLCA6bnRoLWxhc3QtY2hpbGQoKSwgOm50aC1vZi10eXBlKCksIDpudGgtbGFzdC10eXBlKCksIDpsYW5nKClcblx0XHRcdHBzZXVkb0NsYXNzV2l0aEJyYWNrZXRzUmVnZXggPSAvKDpbXFx3LV0rXFwoW15cXCldKlxcKSkvZ2ksXG5cdFx0XHQvLyBBIHJlZ2V4IGZvciBvdGhlciBwc2V1ZG8gY2xhc3Nlcywgd2hpY2ggZG9uJ3QgaGF2ZSBicmFja2V0c1xuXHRcdFx0cHNldWRvQ2xhc3NSZWdleCA9IC8oOlteXFxzXFwrPn5cXC5cXFs6XSspL2csXG5cdFx0XHRlbGVtZW50UmVnZXggPSAvKFteXFxzXFwrPn5cXC5cXFs6XSspL2c7XG5cblx0XHQvLyBGaW5kIG1hdGNoZXMgZm9yIGEgcmVndWxhciBleHByZXNzaW9uIGluIGEgc3RyaW5nIGFuZCBwdXNoIHRoZWlyIGRldGFpbHMgdG8gcGFydHNcblx0XHQvLyBUeXBlIGlzIFwiYVwiIGZvciBJRHMsIFwiYlwiIGZvciBjbGFzc2VzLCBhdHRyaWJ1dGVzIGFuZCBwc2V1ZG8tY2xhc3NlcyBhbmQgXCJjXCIgZm9yIGVsZW1lbnRzIGFuZCBwc2V1ZG8tZWxlbWVudHNcblx0XHRmaW5kTWF0Y2ggPSBmdW5jdGlvbihyZWdleCwgdHlwZSkge1xuXHRcdFx0dmFyIG1hdGNoZXMsIGksIGxlbiwgbWF0Y2gsIGluZGV4LCBsZW5ndGg7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0bWF0Y2hlcyA9IHNlbGVjdG9yLm1hdGNoKHJlZ2V4KTtcblx0XHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbWF0Y2hlcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0XHRcdHR5cGVDb3VudFt0eXBlXSArPSAxO1xuXHRcdFx0XHRcdG1hdGNoID0gbWF0Y2hlc1tpXTtcblx0XHRcdFx0XHRpbmRleCA9IHNlbGVjdG9yLmluZGV4T2YobWF0Y2gpO1xuXHRcdFx0XHRcdGxlbmd0aCA9IG1hdGNoLmxlbmd0aDtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHtcblx0XHRcdFx0XHRcdHNlbGVjdG9yOiBtYXRjaCxcblx0XHRcdFx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHRcdFx0XHRpbmRleDogaW5kZXgsXG5cdFx0XHRcdFx0XHRsZW5ndGg6IGxlbmd0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8vIFJlcGxhY2UgdGhpcyBzaW1wbGUgc2VsZWN0b3Igd2l0aCB3aGl0ZXNwYWNlIHNvIGl0IHdvbid0IGJlIGNvdW50ZWQgaW4gZnVydGhlciBzaW1wbGUgc2VsZWN0b3JzXG5cdFx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG1hdGNoLCBBcnJheShsZW5ndGggKyAxKS5qb2luKCcgJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIFJlbW92ZSB0aGUgbmVnYXRpb24gcHN1ZWRvLWNsYXNzICg6bm90KSBidXQgbGVhdmUgaXRzIGFyZ3VtZW50IGJlY2F1c2Ugc3BlY2lmaWNpdHkgaXMgY2FsY3VsYXRlZCBvbiBpdHMgYXJndW1lbnRcblx0XHQoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmVnZXggPSAvOm5vdFxcKChbXlxcKV0qKVxcKS9nO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShyZWdleCwgJyAgICAgJDEgJyk7XG5cdFx0XHR9XG5cdFx0fSgpKTtcblxuXHRcdC8vIFJlbW92ZSBhbnl0aGluZyBhZnRlciBhIGxlZnQgYnJhY2UgaW4gY2FzZSBhIHVzZXIgaGFzIHBhc3RlZCBpbiBhIHJ1bGUsIG5vdCBqdXN0IGEgc2VsZWN0b3Jcblx0XHQoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmVnZXggPSAve1teXSovZ20sXG5cdFx0XHRcdG1hdGNoZXMsIGksIGxlbiwgbWF0Y2g7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0bWF0Y2hlcyA9IHNlbGVjdG9yLm1hdGNoKHJlZ2V4KTtcblx0XHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbWF0Y2hlcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0XHRcdG1hdGNoID0gbWF0Y2hlc1tpXTtcblx0XHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UobWF0Y2gsIEFycmF5KG1hdGNoLmxlbmd0aCArIDEpLmpvaW4oJyAnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KCkpO1xuXG5cdFx0Ly8gQWRkIGF0dHJpYnV0ZSBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChhdHRyaWJ1dGVSZWdleCwgJ2InKTtcblxuXHRcdC8vIEFkZCBJRCBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBhKVxuXHRcdGZpbmRNYXRjaChpZFJlZ2V4LCAnYScpO1xuXG5cdFx0Ly8gQWRkIGNsYXNzIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGIpXG5cdFx0ZmluZE1hdGNoKGNsYXNzUmVnZXgsICdiJyk7XG5cblx0XHQvLyBBZGQgcHNldWRvLWVsZW1lbnQgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYylcblx0XHRmaW5kTWF0Y2gocHNldWRvRWxlbWVudFJlZ2V4LCAnYycpO1xuXG5cdFx0Ly8gQWRkIHBzZXVkby1jbGFzcyBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChwc2V1ZG9DbGFzc1dpdGhCcmFja2V0c1JlZ2V4LCAnYicpO1xuXHRcdGZpbmRNYXRjaChwc2V1ZG9DbGFzc1JlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gUmVtb3ZlIHVuaXZlcnNhbCBzZWxlY3RvciBhbmQgc2VwYXJhdG9yIGNoYXJhY3RlcnNcblx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoL1tcXCpcXHNcXCs+fl0vZywgJyAnKTtcblxuXHRcdC8vIFJlbW92ZSBhbnkgc3RyYXkgZG90cyBvciBoYXNoZXMgd2hpY2ggYXJlbid0IGF0dGFjaGVkIHRvIHdvcmRzXG5cdFx0Ly8gVGhlc2UgbWF5IGJlIHByZXNlbnQgaWYgdGhlIHVzZXIgaXMgbGl2ZS1lZGl0aW5nIHRoaXMgc2VsZWN0b3Jcblx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoL1sjXFwuXS9nLCAnICcpO1xuXG5cdFx0Ly8gVGhlIG9ubHkgdGhpbmdzIGxlZnQgc2hvdWxkIGJlIGVsZW1lbnQgc2VsZWN0b3JzICh0eXBlIGMpXG5cdFx0ZmluZE1hdGNoKGVsZW1lbnRSZWdleCwgJ2MnKTtcblxuXHRcdC8vIE9yZGVyIHRoZSBwYXJ0cyBpbiB0aGUgb3JkZXIgdGhleSBhcHBlYXIgaW4gdGhlIG9yaWdpbmFsIHNlbGVjdG9yXG5cdFx0Ly8gVGhpcyBpcyBuZWF0ZXIgZm9yIGV4dGVybmFsIGFwcHMgdG8gZGVhbCB3aXRoXG5cdFx0cGFydHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHRyZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VsZWN0b3I6IGlucHV0LFxuXHRcdFx0c3BlY2lmaWNpdHk6ICcwLCcgKyB0eXBlQ291bnQuYS50b1N0cmluZygpICsgJywnICsgdHlwZUNvdW50LmIudG9TdHJpbmcoKSArICcsJyArIHR5cGVDb3VudC5jLnRvU3RyaW5nKCksXG5cdFx0XHRwYXJ0czogcGFydHNcblx0XHR9O1xuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0Y2FsY3VsYXRlOiBjYWxjdWxhdGVcblx0fTtcbn0oKSk7XG5cblxuKGZ1bmN0aW9uKCkge1xuXG5cdHZhciBTdHlsZVBhcnNlciA9IHt9O1xuXG5cdHZhciBydWxlcyA9IHt9O1xuXHR2YXIgc2hlZXRzID0gZG9jdW1lbnQuc3R5bGVTaGVldHM7XG5cblx0dmFyIHNoZWV0LCBydWxlO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNoZWV0cy5sZW5ndGg7IGkrKykge1xuXHRcdFxuXHRcdHNoZWV0ID0gc2hlZXRzW2ldO1xuXHRcdGlmKCFzaGVldC5jc3NSdWxlcykgY29udGludWU7XG5cblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHNoZWV0LmNzc1J1bGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRydWxlID0gc2hlZXQuY3NzUnVsZXNbal07XG5cdFx0XHRydWxlc1tydWxlLnNlbGVjdG9yVGV4dF0gPSBydWxlO1xuXHRcdH1cblx0fVxuXG5cdFN0eWxlUGFyc2VyLnJlc29sdmUgPSBmdW5jdGlvbih0cmFja2VkRWxlbWVudCkge1xuXG5cdFx0dmFyIG1hdGNoZWRSdWxlcyA9IHdpbmRvdy5nZXRNYXRjaGVkQ1NTUnVsZXModHJhY2tlZEVsZW1lbnQpIHx8IFtdO1xuXHRcdHZhciBydWxlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRydWxlcy5wdXNoKFttYXRjaGVkUnVsZXNbaV0sIHBhcnNlSW50KFNQRUNJRklDSVRZLmNhbGN1bGF0ZShtYXRjaGVkUnVsZXNbaV0uc2VsZWN0b3JUZXh0KVswXS5zcGVjaWZpY2l0eS5yZXBsYWNlKC9cXCwvZywgJycpLCAxMCkgKyAwLjAxICogaV0pO1xuXHRcdH1cblxuXG5cblx0XHRydWxlcyA9IHJ1bGVzXG5cdFx0XHQuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHRcdHJldHVybiBiWzFdIC0gYVsxXTtcblx0XHRcdH0pXG5cdFx0XHQubWFwKGZ1bmN0aW9uKGEpIHtcblx0XHRcdFx0cmV0dXJuIGFbMF07XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiBydWxlcztcblxuXHR9O1xuXG5cdHdpbmRvdy5TdHlsZVBhcnNlciA9IFN0eWxlUGFyc2VyO1xuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuXHR2YXIgTGF5b3V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5vdmVybGF5RWxlbWVudCA9IG51bGw7IC8vIHRoZSBhY3R1YWwgb3ZlcmxheSBkaXZcblx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDsgLy8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBlbGVtZW50XG5cdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBudWxsOyAvLyB3aGVuIGRlZmluZWQsIHdlJ3JlIGluIHJ1bGUgbW9kZVxuXHRcdHRoaXMuaG92ZXJHaG9zdCA9IG5ldyBHaG9zdCgpOyAvLyB0aGUgaG92ZXIgZ2hvc3Rcblx0XHR0aGlzLm92ZXIgPSBmYWxzZTsgLy8gb24gd2hldGhlciB3ZSdyZSBjdXJyZW5seSBob3ZlcmluZyBhIGNlcnRhaW4gcGFydCBvZiB0aGUgb3ZlcmxheVxuXHRcdHRoaXMub3ZlcklubmVyID0gZmFsc2U7XG5cdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuaW50ZXJhY3RpbmcgPSBmYWxzZTsgLy8gd2hldGhlciB3ZSdyZSBjdXJyZW50bHkgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgZWxlbWVudFxuXG5cdFx0Ly8gaW5pdGlhbGl6ZVxuXHRcdHRoaXMuY3JlYXRlKCk7XG5cblx0fTtcblxuXHQkLmV4dGVuZChMYXlvdXRNb2RlLnByb3RvdHlwZSwge1xuXG5cdFx0cGx1Z2luczogW10sXG5cblx0XHRyZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKSB7XG5cdFx0XHR0aGlzLnBsdWdpbnMucHVzaChwbHVnaW4pO1xuXHRcdFx0aWYocGx1Z2luLmNyZWF0ZSkge1xuXHRcdFx0XHRwbHVnaW4uY3JlYXRlLmNhbGwocGx1Z2luKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Y2FsbFBsdWdpbjogZnVuY3Rpb24oZXZlbnROYW1lLCBhLCBiLCBjLCBkLCBlLCBmKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGx1Z2lucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLnBsdWdpbnNbaV1bZXZlbnROYW1lXSkge1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luc1tpXVtldmVudE5hbWVdLmNhbGwodGhpcy5wbHVnaW5zW2ldLCBhLCBiLCBjLCBkLCBlLCBmKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRlbmFibGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRcdC8vIG1ha2UgYWxsIGVsZW1lbnRzIG9uIHBhZ2UgaW5zcGVjdGFibGVcblx0XHRcdCQoJ2JvZHkgKjpub3QoLm92ZXJsYXksLm92ZXJsYXkgKiwub3ZlcmxheS10aXRsZSwub3ZlcmxheS10aXRsZSAqKScpXG5cdFx0XHRcdC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRcdFx0dmFyIHRhcmdldENoYW5nZWQgPSB0aGF0LmhvdmVyRWxlbWVudCAhPT0gdGhpcztcblx0XHRcdFx0XHR0aGF0LmhvdmVyRWxlbWVudCA9IHRoaXM7XG5cblx0XHRcdFx0XHRpZih0YXJnZXRDaGFuZ2VkKSB7XG5cdFx0XHRcdFx0XHR0aGF0LmNhbGxQbHVnaW4oJ2hvdmVyVGFyZ2V0Q2hhbmdlJywgZSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gaW4gbm9ybWFsIG1vZGUsIGRvbid0IGFjdGl2YXRlIHRoZSBob3ZlciBnaG9zdCB3aGVuIGludGVyYWN0aW5nIG9yIG92ZXIgdGhlIGN1cnJlbnQgZWxcblx0XHRcdFx0XHRpZih0aGF0LmhvdmVyR2hvc3QuY3VycmVudEVsZW1lbnQgPT09IHRoaXMgfHwgdGhhdC5pbnRlcmFjdGluZyB8fCB0aGF0Lm92ZXIpXG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cblx0XHRcdFx0XHR0aGF0LmhvdmVyR2hvc3QucmVsYXlvdXQodGhpcyk7XG5cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdFx0fSlcblx0XHRcdFx0Lm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0aWYodGhhdC5jdXJyZW50RWxlbWVudCA9PT0gdGhpcyB8fCB0aGF0LmludGVyYWN0aW5nKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdFx0Ly8gdGhpcyBpcyBhbiBpbnNhbmVseSB1Z2x5IHdvcmthcm91bmQgZm9yIGEgcHJvcGFnYXRpb24gaXNzdWUgZnJvbSBkcmFnLFxuXHRcdFx0XHRcdC8vIGJ1dCBJIGp1c3QgZG9udCBnaXZlIGEgc2hpdCEgOkRcblx0XHRcdFx0XHRpZihEYXRlLm5vdygpIC0gdGhhdC5sYXN0SW50ZXJhY3Rpb25UaW1lIDwgNSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKHRoYXQuY3VycmVudEVsZW1lbnQpIHtcblx0XHRcdFx0XHRcdHRoYXQuZGVhY3RpdmF0ZSgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIHN5bmMgb24gdGhlIGVsZW1lbnRcblx0XHRcdFx0XHR0aGF0LmFjdGl2YXRlKHRoaXMpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdH0pO1x0XHRcblxuXHRcdH0sXG5cblx0XHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jcmVhdGVPdmVybGF5KCk7XG5cdFx0XHR0aGlzLmluaXQoKTtcblx0XHR9LFxuXG5cdFx0Y3JlYXRlT3ZlcmxheTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQgPSAkKCc8ZGl2IGlkPVwib3ZlcmxheVwiIGNsYXNzPVwib3ZlcmxheVwiPjwvZGl2PicpWzBdO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Cb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZVNpemVCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtc2l6ZVwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgaGVpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBib3R0b20gaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1zaXplXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSB3aWR0aFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgdG9wIGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHRvcCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBsZWZ0IGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgbGVmdCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24td2lkdGhcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24taGVpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogRXZlbnRzICYgQmVoYXZpb3VyIGluaXRpYWxpemF0aW9uXG5cdFx0ICovXG5cblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5pbml0SG92ZXIoKTtcblx0XHRcdHRoaXMuaW5pdEhhbmRsZUhvdmVyKCk7XG5cdFx0XHR0aGlzLmluaXRIYW5kbGVzKCk7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHRoaXMuX19rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxNikge1xuXHRcdFx0XHRcdHRoYXQuc2hpZnRQcmVzc2VkID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihlLmtleUNvZGUgPT09IDI3KSB7XG5cdFx0XHRcdFx0dGhhdC5kZWFjdGl2YXRlKCk7XG5cdFx0XHRcdH1cdFx0XG5cdFx0XHR9O1xuXHRcdFx0dGhpcy5fX2tleWRvd24gPSBmdW5jdGlvbihlKSB7XG5cblx0XHRcdFx0aWYoZS53aGljaCA9PT0gMTYpIHtcblx0XHRcdFx0XHR0aGF0LnNoaWZ0UHJlc3NlZCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0fTtcblx0XHRcdCQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIHRoaXMuX19rZXl1cCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vbigna2V5ZG93bicsIHRoaXMuX19rZXlkb3duKTtcblxuXHRcdH0sXG5cblx0XHRpbml0SG92ZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRcdCQoJ2JvZHknKS5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRcdHRoYXQuX19sYXN0TW91c2VNb3ZlRXZlbnQgPSBlO1xuXHRcdFx0XHRpZighdGhhdC5jdXJyZW50RWxlbWVudCB8fCB0aGF0LmhpZGRlbikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoYXQucHJvY2Vzc092ZXJMb2dpYyhlKTtcblxuXHRcdFx0fSk7XG5cblx0XHR9LFxuXG5cdFx0aW5pdEhhbmRsZUhvdmVyOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b21cblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVBhZGRpbmdUb3ApXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVQYWRkaW5nTGVmdClcblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVBhZGRpbmdSaWdodClcblx0XHRcdFx0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQub3ZlclBhZGRpbmdIYW5kbGUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1yaWdodCcpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVBhZGRpbmdCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ0JvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1ib3R0b20nKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nTGVmdFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1sZWZ0Jyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1RvcFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nVG9wLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLXRvcCcpOyB9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQub3ZlclBhZGRpbmdIYW5kbGUgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdFx0XHR2YXIgcmVtb3ZlU3BhbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ1JpZ2h0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdCb3R0b20uY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nVG9wWzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdUb3AuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGlmKCF0aGF0LmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0XHRyZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCF0aGF0Ll9fY2F0Y2hNb3VzZVVwKSB7XG5cdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gJChkb2N1bWVudCkub25lKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGlmKCF0aGF0Lm92ZXJQYWRkaW5nSGFuZGxlKSByZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlTWFyZ2luVG9wKVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlTWFyZ2luTGVmdClcblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZU1hcmdpblJpZ2h0KVxuXHRcdFx0XHQuaG92ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5vdmVyTWFyZ2luSGFuZGxlID0gdHJ1ZTtcblxuXHRcdFx0XHRcdGlmKCF0aGF0LmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpblJpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpblJpZ2h0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tcmlnaHQnKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Cb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luQm90dG9tLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tYm90dG9tJyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlTWFyZ2luTGVmdFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tbGVmdCcpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpblRvcFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5Ub3AuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnNlbGVjdFJ1bGUoJ21hcmdpbi10b3AnKTsgfVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0Lm92ZXJNYXJnaW5IYW5kbGUgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdFx0XHR2YXIgcmVtb3ZlU3BhbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5SaWdodFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luTGVmdFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Ub3BbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luVG9wLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0cmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZighdGhhdC5fX2NhdGNoTW91c2VVcCkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9ICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpZighdGhhdC5vdmVyTWFyZ2luSGFuZGxlKSByZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdHByb2Nlc3NPdmVyTG9naWM6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0dmFyIGV4dHJhTWFyZ2luID0gMTA7XG5cdFx0XHR2YXIgb2Zmc2V0ID0gdGhpcy5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0XHQvLyBnZW5lcmFsIG92ZXIvb3V0XG5cblx0XHRcdGlmKFxuXHRcdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSB0aGlzLm1hcmdpbkxlZnQgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAtIHRoaXMubWFyZ2luVG9wIC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIHRoaXMubWFyZ2luUmlnaHQgKyBleHRyYU1hcmdpbikgJiZcblx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCArIHRoaXMubWFyZ2luQm90dG9tICsgZXh0cmFNYXJnaW4pXG5cdFx0XHQpIHtcblxuXHRcdFx0XHRpZighdGhpcy5vdmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cdFx0XHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZih0aGlzLm92ZXIgJiYgIXRoaXMuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHR0aGlzLm92ZXIgPSBmYWxzZTtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyJyk7XG5cdFx0XHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1x0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gZG9uJ3QgcHJvY2VzcyBpZiBpbnRlcmFjdGluZ1xuXHRcdFx0aWYodGhpcy5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIG92ZXIgaW5uZXIgYm94XG5cdFx0XHRpZihcblx0XHRcdFx0KChlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyB0aGlzLnBhZGRpbmdMZWZ0ICYmXG5cdFx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgKyB0aGlzLnBhZGRpbmdUb3AgJiZcblx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoIC0gdGhpcy5wYWRkaW5nUmlnaHQpICYmXG5cdFx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCAtIHRoaXMucGFkZGluZ0JvdHRvbSkpIHx8XG5cdFx0XHRcdHRoaXMub3ZlcldpZHRoIHx8IHRoaXMub3ZlckhlaWdodCkgJiZcblx0XHRcdFx0IXRoaXMub3ZlclBhZGRpbmdIYW5kbGUgJiYgLy8gY2Fubm90IGJlIG92ZXIgcGFkZGluZyBoYW5kbGVcblx0XHRcdFx0IXRoaXMub3Zlck1hcmdpbkhhbmRsZVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3ZlcklubmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbm5lcicpO1xuXHRcdFx0XHRcdHRoaXMub3ZlcklubmVyID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGlmKHRoaXMub3ZlcklubmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVySW5uZXIgPSBmYWxzZTtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLWlubmVyJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cblx0XHRcdC8vIG92ZXIgcmlnaHQgc2lkZVxuXHRcdFx0aWYoXG5cdFx0XHRcdChlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyB0aGlzLnBhZGRpbmdMZWZ0ICsgdGhpcy5pbm5lcldpZHRoIC0gMTAgJiZcblx0XHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIHRoaXMucGFkZGluZ1RvcCAmJlxuXHRcdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggLSB0aGlzLnBhZGRpbmdSaWdodCkgJiZcblx0XHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0IC0gdGhpcy5wYWRkaW5nQm90dG9tKSkgJiZcblx0XHRcdFx0IXRoaXMub3ZlclBhZGRpbmdIYW5kbGUgJiYgLy8gY2Fubm90IGJlIG92ZXIgcGFkZGluZyBoYW5kbGVcblx0XHRcdFx0IXRoaXMub3Zlck1hcmdpbkhhbmRsZVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3ZlcldpZHRoKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZS1yZXNpemUnO1xuXHRcdFx0XHRcdHRoaXMuY2FwdGlvbldpZHRoLmNsYXNzTGlzdC5hZGQoJ292ZXInKTtcblx0XHRcdFx0XHR0aGlzLnJlZnJlc2hDYXB0aW9ucygpO1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0UnVsZSgnd2lkdGgnKTtcblx0XHRcdFx0XHR0aGlzLm92ZXJXaWR0aCA9IHRydWU7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGlmKHRoaXMub3ZlcldpZHRoKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyV2lkdGggPSBmYWxzZTtcblx0XHRcdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICcnO1xuXHRcdFx0XHRcdHRoaXMuY2FwdGlvbldpZHRoLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTtcblx0XHRcdFx0XHR0aGlzLnJlZnJlc2hDYXB0aW9ucygpO1xuXHRcdFx0XHRcdHRoaXMuZGVzZWxlY3RSdWxlKCk7XG5cdFx0XHRcdFx0dGhpcy5jdXJyZW50SGFuZGxlID0gbnVsbDtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblxuXG5cdFx0XHQvLyBvdmVyIHBhZGRpbmcgYm94XG5cdFx0XHRpZihcblx0XHRcdFx0KChlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgJiYgZS5wYWdlWSA+IG9mZnNldC50b3AgJiZcblx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoKSAmJlxuXHRcdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQpICYmXG5cdFx0XHRcdFx0IXRoaXMub3ZlcklubmVyKSB8fFxuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nSGFuZGxlKSAmJlxuXHRcdFx0XHQhKHRoaXMub3ZlcldpZHRoIHx8IHRoaXMub3ZlckhlaWdodCkgJiZcblx0XHRcdFx0IXRoaXMub3Zlck1hcmdpbkhhbmRsZVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmcpIHtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLXBhZGRpbmcnKTtcblxuXHRcdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZykge1xuXHRcdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLXBhZGRpbmcnKTtcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cblx0XHRcdC8vIG92ZXIgbWFyZ2luIGJveFxuXHRcdFx0aWYoXG5cdFx0XHRcdCgoZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0ICYmXG5cdFx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSB0aGlzLm1hcmdpblRvcCAmJiBcblx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCkgJiZcblx0XHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0ICsgdGhpcy5tYXJnaW5Cb3R0b20pICYmXG5cdFx0XHRcdFx0IXRoaXMub3ZlcklubmVyICYmXG5cdFx0XHRcdFx0IXRoaXMub3ZlclBhZGRpbmcpIHx8XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJNYXJnaW5IYW5kbGUpICYmXG5cdFx0XHRcdCF0aGlzLm92ZXJQYWRkaW5nSGFuZGxlICYmXG5cdFx0XHRcdCEodGhpcy5vdmVyV2lkdGggfHwgdGhpcy5vdmVySGVpZ2h0KVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3Zlck1hcmdpbikge1xuXHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItbWFyZ2luJyk7XG5cdFx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGlmKHRoaXMub3Zlck1hcmdpbikge1xuXHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItbWFyZ2luJyk7XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRpbml0SGFuZGxlczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHZhciBoYW5kbGVPZmZzZXQgPSAzO1xuXHRcdFx0dmFyIGlzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudDtcblxuXHRcdFx0dmFyIGFwcGx5UHJlY2lzaW9uID0gZnVuY3Rpb24ob3JpZywgY3VycmVudCkge1xuXHRcdFx0XHRpZighdGhhdC5zaGlmdFByZXNzZWQpIHtcblx0XHRcdFx0XHR2YXIgZGVsdGEgPSBvcmlnIC0gY3VycmVudDtcblx0XHRcdFx0XHR2YXIgcHJlY2lzaW9uRGVsdGEgPSBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0cmV0dXJuIGN1cnJlbnQgKyBNYXRoLnJvdW5kKGRlbHRhIC0gcHJlY2lzaW9uRGVsdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjdXJyZW50O1xuXHRcdFx0fTtcblxuXG5cdFx0XHQvLyBoZWlnaHRcblx0XHRcdHRoYXQuaGFuZGxlU2l6ZUJvdHRvbS5vbihpc1RvdWNoID8gJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdzaXplJztcblx0XHRcdFx0dmFyIHN0YXJ0SGVpZ2h0ID0gdGhhdC5pbm5lckhlaWdodDtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IHRydWUsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gdGhhdC5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5oZWlnaHQgPSBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0SGVpZ2h0IC0gZGVsdGEpKSArICdweCc7XG5cdFx0XHRcdFx0XHR0aGF0LnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gd2lkdGhcblx0XHRcdCQoZG9jdW1lbnQpLm9uKGlzVG91Y2ggPyAndG91Y2hzdGFydCcgOiAnbW91c2Vkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuXHRcdFx0XHRpZih0aGF0Lm92ZXJXaWR0aCkge1xuXHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnc2l6ZSc7XG5cdFx0XHRcdFx0dmFyIHN0YXJ0V2lkdGggPSB0aGF0LmlubmVyV2lkdGg7XG5cblx0XHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0XHR2ZXJ0aWNhbDogZmFsc2UsXG5cdFx0XHRcdFx0XHRtb3ZlOiBmdW5jdGlvbihkZWx0YSkge1xuXHRcdFx0XHRcdFx0XHRkZWx0YSA9IHRoYXQuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS53aWR0aCA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRXaWR0aCAtIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0XHR0aGF0LnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0c3RvcDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdHRoYXQubGFzdEludGVyYWN0aW9uVGltZSA9IERhdGUubm93KCk7XG5cdFx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcdFx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXG5cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBwYWRkaW5nIGJvdHRvbVxuXHRcdFx0JChkb2N1bWVudCkub24oaXNUb3VjaCA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0XHRcdGlmKCF0aGF0Lm92ZXJQYWRkaW5nKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdwYWRkaW5nJztcblx0XHRcdFx0dmFyIHN0YXJ0UGFkZGluZ0JvdHRvbSA9IHRoYXQucGFkZGluZ0JvdHRvbTtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IHRydWUsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gdGhhdC5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nQm90dG9tID0gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydFBhZGRpbmdCb3R0b20gLSBkZWx0YSkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdHRoYXQucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhhdC5sYXN0SW50ZXJhY3Rpb25UaW1lID0gRGF0ZS5ub3coKTtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gcmVzaXplIHBhZGRpbmdcbi8qXG5cdFx0XHQoZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIHN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcblx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBkcmFnID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5yZWxheW91dCgpO1x0XHRcdFx0XHRcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdCb3R0b20uZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y3Vyc29yOiAncy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJIZWlnaHQgPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLmhlaWdodCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nQm90dG9tID0gdGhhdC5wYWRkaW5nQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdwYWRkaW5nJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi50b3AsIHVpLnBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBNYXRoLm1heCh0aGlzLmN1cklubmVySGVpZ2h0IC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdCb3R0b20gKyAoKHVpLnBvc2l0aW9uLnRvcCkgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLnRvcCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nUmlnaHQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnZS1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJXaWR0aCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkud2lkdGgoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ1JpZ2h0ID0gdGhhdC5wYWRkaW5nUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi5sZWZ0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCh0aGlzLmN1cklubmVyV2lkdGggLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdSaWdodCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ1JpZ2h0ICsgKCh1aS5wb3NpdGlvbi5sZWZ0KSAtIHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nVG9wLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ24tcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC50b3A7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdUb3AgPSB0aGF0LnBhZGRpbmdUb3A7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC50b3AgLSB0aGlzLmN1ck9mZnNldCk7XG5cdFx0XHRcdFx0XHRkZWx0YSA9ICF0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdUb3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdUb3AgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3ctcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC5sZWZ0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nTGVmdCA9IHRoYXQucGFkZGluZ0xlZnQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQubGVmdCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gIXRoYXQuc2hpZnRQcmVzc2VkID8gTWF0aC5yb3VuZChkZWx0YSAvIDQpIDogZGVsdGE7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ0xlZnQgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdMZWZ0IC0gZGVsdGEpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XHRcdFx0XHRcblxuXHRcdFx0fSkoKTtcbiovXG5cblx0XHRcdC8vIHJlc2l6ZSBtYXJnaW5cblxuXHRcdFx0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZHJhZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQucmVsYXlvdXQoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpbkJvdHRvbS5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd5Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICdzLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJJbm5lckhlaWdodCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkuaGVpZ2h0KCk7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpbkJvdHRvbSA9IHRoYXQubWFyZ2luQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nQm90dG9tID0gdGhhdC5wYWRkaW5nQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdtYXJnaW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBhcHBseVByZWNpc2lvbih1aS5vcmlnaW5hbFBvc2l0aW9uLnRvcCwgdWkucG9zaXRpb24udG9wKTtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IE1hdGgubWF4KHRoaXMuY3VySW5uZXJIZWlnaHQgKyB0aGlzLmN1clBhZGRpbmdCb3R0b20gLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luQm90dG9tID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5Cb3R0b20gKyAodWkucG9zaXRpb24udG9wIC0gdWkub3JpZ2luYWxQb3NpdGlvbi50b3ApKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlTWFyZ2luUmlnaHQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnZS1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJXaWR0aCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkud2lkdGgoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luUmlnaHQgPSB0aGF0Lm1hcmdpblJpZ2h0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nUmlnaHQgPSB0aGF0LnBhZGRpbmdSaWdodDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCwgdWkucG9zaXRpb24ubGVmdCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gTWF0aC5tYXgodGhpcy5jdXJJbm5lcldpZHRoICsgdGhpcy5jdXJQYWRkaW5nUmlnaHQgLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpblJpZ2h0ID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5SaWdodCArICh1aS5wb3NpdGlvbi5sZWZ0IC0gdWkub3JpZ2luYWxQb3NpdGlvbi5sZWZ0KSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpbkxlZnQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAndy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VyT2Zmc2V0ID0gdWkub2Zmc2V0LmxlZnQ7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpbkxlZnQgPSB0aGF0Lm1hcmdpbkxlZnQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC5sZWZ0IC0gdGhpcy5jdXJPZmZzZXQpO1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSAhdGhhdC5zaGlmdFByZXNzZWQgPyBNYXRoLnJvdW5kKGRlbHRhIC8gNCkgOiBkZWx0YTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5MZWZ0ID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5MZWZ0IC0gZGVsdGEpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5Ub3AuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnbi1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VyT2Zmc2V0ID0gdWkub2Zmc2V0LnRvcDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luVG9wID0gdGhhdC5tYXJnaW5Ub3A7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IC1oYW5kbGVPZmZzZXQ7XG5cdFx0XHRcdFx0XHR2YXIgZGVsdGEgPSAodWkub2Zmc2V0LnRvcCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gIXRoYXQuc2hpZnRQcmVzc2VkID8gTWF0aC5yb3VuZChkZWx0YSAvIDQpIDogZGVsdGE7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luVG9wID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5Ub3AgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fSkoKTtcblxuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIENvcmUgcnVudGltZSBmdW5jdGlvbmFsaXR5XG5cdFx0ICovXG5cblx0XHRyZWxheW91dDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBjb21wdXRlZFN0eWxlID0gdGhpcy5jb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdFx0dmFyIG92ZXJsYXlFbGVtZW50ID0gdGhpcy5vdmVybGF5RWxlbWVudDtcblx0XHRcdHZhciBlbGVtID0gJCh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblx0XHRcdHZhciBvZmZzZXQgPSBlbGVtLm9mZnNldCgpO1xuXG5cdFx0XHQvLyB3ZSBuZWVkIHRvIHN0b3JlIG91dGVyIGhlaWdodCwgYm90dG9tL3JpZ2h0IHBhZGRpbmcgYW5kIG1hcmdpbnMgZm9yIGhvdmVyIGRldGVjdGlvblxuXHRcdFx0dmFyIHBhZGRpbmdMZWZ0ID0gdGhpcy5wYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdFx0dmFyIHBhZGRpbmdUb3AgPSB0aGlzLnBhZGRpbmdUb3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdUb3ApO1xuXHRcdFx0dmFyIHBhZGRpbmdSaWdodCA9IHRoaXMucGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdFx0dmFyIHBhZGRpbmdCb3R0b20gPSB0aGlzLnBhZGRpbmdCb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG5cdFx0XHR2YXIgbWFyZ2luTGVmdCA9IHRoaXMubWFyZ2luTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luTGVmdCk7XG5cdFx0XHR2YXIgbWFyZ2luVG9wID0gdGhpcy5tYXJnaW5Ub3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblRvcCk7XG5cdFx0XHR2YXIgbWFyZ2luUmlnaHQgPSB0aGlzLm1hcmdpblJpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5SaWdodCk7XG5cdFx0XHR2YXIgbWFyZ2luQm90dG9tID0gdGhpcy5tYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHRcdHZhciBpbm5lcldpZHRoID0gdGhpcy5pbm5lcldpZHRoID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS53aWR0aCkgfHwgKHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodCk7XG5cdFx0XHR2YXIgaW5uZXJIZWlnaHQgPSB0aGlzLmlubmVySGVpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5oZWlnaHQpIHx8ICh0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tKTtcblxuXHRcdFx0dmFyIG91dGVyV2lkdGggPSB0aGlzLm91dGVyV2lkdGggPSBpbm5lcldpZHRoICsgcGFkZGluZ0xlZnQgKyBwYWRkaW5nUmlnaHQ7XG5cdFx0XHR2YXIgb3V0ZXJIZWlnaHQgPSB0aGlzLm91dGVySGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbTtcblxuXHRcdFx0Ly8gY2FsY3VsYXRlIGhhbmRsZSBzaXplXG5cdFx0XHR2YXIgaGFuZGxlU2l6ZVggPSAxNjtcblx0XHRcdHZhciBoYW5kbGVTaXplWSA9IDE2O1xuXHRcdFx0aWYoaW5uZXJXaWR0aCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWCA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWCAqIChpbm5lcldpZHRoIC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHRpZihpbm5lckhlaWdodCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWSA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWSAqIChpbm5lckhlaWdodCAvIDYwKSkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcyhoYW5kbGVTaXplWCwgaGFuZGxlU2l6ZVkpO1xuXG5cdFx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHRcdC8vIG1vZGlmeSBwYWRkaW5nIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nTGVmdCArICcsICcgKyBvdXRlckhlaWdodCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1JpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nUmlnaHQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKC1wYWRkaW5nVG9wKSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ1RvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoMCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQpICsgJ3B4KSBzY2FsZSgnICsgaW5uZXJXaWR0aCArICcsICcgKyBwYWRkaW5nQm90dG9tICsgJyknO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIC1wYWRkaW5nTGVmdCArICdweCwgMHB4KSc7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodFswXS5zdHlsZS5tYXJnaW5SaWdodCA9IC1wYWRkaW5nUmlnaHQgKyAncHgnOyAvLyBUT0RPOiBmaW5kIG91dCB3aHkgY29udmVydGluZyB0aGVzZSB0byB0cmFuc2Zvcm1zIG1lc3NlcyB3aXRoIGRyYWdnaW5nXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdUb3BbMF0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAtcGFkZGluZ1RvcCArICdweCknO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICAtcGFkZGluZ0JvdHRvbSArICdweCc7ICAvLyBUT0RPOiBmaW5kIG91dCB3aHkgY29udmVydGluZyB0aGVzZSB0byB0cmFuc2Zvcm1zIG1lc3NlcyB3aXRoIGRyYWdnaW5nXG5cblx0XHRcdC8vIG1vZGlmeSBtYXJnaW4gYm94XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkxlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KSkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5MZWZ0ICsgJywgJyArIChvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSkgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblJpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoICsgcGFkZGluZ1JpZ2h0KSArICdweCwgJyArICgtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApKSArICdweCkgc2NhbGUoJyArIG1hcmdpblJpZ2h0ICsgJywgJyArIChvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSkgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblRvcC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApKSArICdweCkgc2NhbGUoJyArIG91dGVyV2lkdGggKyAnLCAnICsgbWFyZ2luVG9wICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Cb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQgKyBwYWRkaW5nQm90dG9tKSArICdweCkgc2NhbGUoJyArIG91dGVyV2lkdGggKyAnLCAnICsgbWFyZ2luQm90dG9tICsgJyknO1xuXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUubWFyZ2luTGVmdCA9IC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLm1hcmdpblJpZ2h0ID0gLShwYWRkaW5nUmlnaHQgKyBtYXJnaW5SaWdodCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3BbMF0uc3R5bGUubWFyZ2luVG9wID0gLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVswXS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAtKHBhZGRpbmdCb3R0b20gKyBtYXJnaW5Cb3R0b20pICsgJ3B4JztcblxuXHRcdFx0Ly8gb2Zmc2V0IG1hZ2ljXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUubWFyZ2luVG9wID0gKG1hcmdpbkxlZnQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIG1hcmdpbkxlZnQpIC8gNSkgKyAoaGFuZGxlU2l6ZVkgLyAyKSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5MZWZ0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5MZWZ0KSAvIDUpIC0gOCArIGhhbmRsZVNpemVZKSA6IC04KSArICdweCc7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gKG1hcmdpblJpZ2h0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5SaWdodCkgLyA1KSArIChoYW5kbGVTaXplWSAvIDIpKSA6IC0oaGFuZGxlU2l6ZVkgLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0LnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luUmlnaHQpIC8gNSkgLSA4ICsgaGFuZGxlU2l6ZVkpIDogLTgpICsgJ3B4Jztcblx0XHRcdFxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3BbMF0uc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Ub3AgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVggLyA0KSAqIG1hcmdpblRvcCkgLyA1KSArIChoYW5kbGVTaXplWCAvIDIpKSA6IC0oaGFuZGxlU2l6ZVggLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5zdHlsZS5tYXJnaW5MZWZ0ID0gKG1hcmdpblRvcCA8IDIwID8gKChoYW5kbGVTaXplWCkgKyAoLShoYW5kbGVTaXplWCkgKiAobWFyZ2luVG9wIC8gMjApKSAtIDgpIDogLTExKSArICdweCc7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luQm90dG9tIDwgMjAgPyAoLSgoKGhhbmRsZVNpemVYIC8gNCkgKiBtYXJnaW5Cb3R0b20pIC8gNSkgKyAoaGFuZGxlU2l6ZVggLyAyKSkgOiAtKGhhbmRsZVNpemVYIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Cb3R0b20uc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Cb3R0b20gPCAyMCA/ICgoaGFuZGxlU2l6ZVgpICsgKC0oaGFuZGxlU2l6ZVgpICogKG1hcmdpbkJvdHRvbSAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVNpemVSaWdodFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAocGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemVZIC8gNCkgKiBwYWRkaW5nUmlnaHQpIC8gNSkgLSAoaGFuZGxlU2l6ZVkgKiAxLjUpKSA6IC0oaGFuZGxlU2l6ZVkgLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHRcdHRoaXMuY2FwdGlvbldpZHRoLnN0eWxlLm1hcmdpblRvcCA9IChwYWRkaW5nUmlnaHQgPCAyMCA/ICgrKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIHBhZGRpbmdSaWdodCkgLyA1KSAtIChoYW5kbGVTaXplWSAqIDEuNSkpIDogLTgpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAocGFkZGluZ0JvdHRvbSA8IDIwID8gKCsoKChoYW5kbGVTaXplWCAvIDQpICogcGFkZGluZ0JvdHRvbSkgLyA1KSAtIChoYW5kbGVTaXplWCAqIDEuNSkpIDogLShoYW5kbGVTaXplWCAvIDIpKSArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IChwYWRkaW5nQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemVYICogKHBhZGRpbmdCb3R0b20gLyAyMCkpIC0gaGFuZGxlU2l6ZVggKiAyICsgaGFuZGxlU2l6ZVggLSA5KSA6IC0xMCkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLm1hcmdpblRvcCA9IC0oaGFuZGxlU2l6ZVkgLyAyKSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAtKGhhbmRsZVNpemVZIC8gMikgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKGhhbmRsZVNpemVYIC8gMikgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKGhhbmRsZVNpemVYIC8gMikgKyAncHgnO1xuXG5cdFx0XHR0aGlzLnJlZnJlc2hIYW5kbGVzKCk7XG5cdFx0XHR0aGlzLnJlZnJlc2hDYXB0aW9ucygpO1xuXG5cdFx0XHR0aGlzLmN1cnJlbnRPZmZzZXQgPSBvZmZzZXQ7XG5cblx0XHRcdC8vIGluZm9ybSBwbHVnaW5zIHRoYXQgYSByZWxheW91dCBoYXMgaGFwcGVuZWRcblx0XHRcdHRoaXMuY2FsbFBsdWdpbigncmVsYXlvdXQnLCB7XG5cblx0XHRcdFx0Y29tcHV0ZWRTdHlsZTogY29tcHV0ZWRTdHlsZSxcblx0XHRcdFx0b2Zmc2V0OiBvZmZzZXQsXG5cblx0XHRcdFx0cGFkZGluZ0xlZnQ6IHBhZGRpbmdMZWZ0LFxuXHRcdFx0XHRwYWRkaW5nVG9wOiBwYWRkaW5nVG9wLFxuXHRcdFx0XHRwYWRkaW5nUmlnaHQ6IHBhZGRpbmdSaWdodCxcblx0XHRcdFx0cGFkZGluZ0JvdHRvbTogcGFkZGluZ0JvdHRvbSxcblxuXHRcdFx0XHRtYXJnaW5MZWZ0OiBtYXJnaW5MZWZ0LFxuXHRcdFx0XHRtYXJnaW5Ub3A6IG1hcmdpblRvcCxcblx0XHRcdFx0bWFyZ2luUmlnaHQ6IG1hcmdpblJpZ2h0LFxuXHRcdFx0XHRtYXJnaW5Cb3R0b206IG1hcmdpbkJvdHRvbSxcblxuXHRcdFx0XHRpbm5lcldpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0XHRpbm5lckhlaWdodDogaW5uZXJIZWlnaHQsXG5cdFx0XHRcdG91dGVyV2lkdGg6IG91dGVyV2lkdGgsXG5cdFx0XHRcdG91dGVySGVpZ2h0OiBvdXRlckhlaWdodFxuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRyZWZyZXNoSGFuZGxlczogZnVuY3Rpb24oaGFuZGxlU2l6ZVgsIGhhbmRsZVNpemVZKSB7XG5cblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luTGVmdFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplWSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplWCArICdweCc7XG5cblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0xlZnRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVNpemVSaWdodFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplWSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZVNpemVCb3R0b21bMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplWCArICdweCc7XG5cblx0XHR9LFxuXG5cdFx0cmVmcmVzaENhcHRpb25zOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIG9mZnNldCA9IHsgbGVmdDogdGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0LCB0b3A6IHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wIH07XG5cblx0XHRcdC8vIGNhcHRpb25zXG5cdFx0XHR2YXIgaGl0c1JpZ2h0RWRnZSwgaGl0c0xlZnRFZGdlO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5pbm5lckhUTUwgPSAnPHNwYW4+d2lkdGg6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3dpZHRoJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5zdHlsZS5yaWdodCA9IChoaXRzUmlnaHRFZGdlID8gMTYgOiAtKHRoaXMuY2FwdGlvbldpZHRoLm9mZnNldFdpZHRoICsgMTMpKSArICdweCc7XG5cblx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+aGVpZ2h0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdoZWlnaHQnKTtcblxuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctbGVmdDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ0xlZnQnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy1yaWdodDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ1JpZ2h0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wLmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLXRvcDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ1RvcCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0JvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy1ib3R0b206IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdCb3R0b20nKTtcblxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWxlZnQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ21hcmdpbkxlZnQnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0LmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tcmlnaHQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ21hcmdpblJpZ2h0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3AuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi10b3A6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ21hcmdpblRvcCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tYm90dG9tOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5Cb3R0b20nKTtcblxuXHRcdFx0aGl0c0xlZnRFZGdlID0gKG9mZnNldC5sZWZ0IC0gODAgPCAwKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdFtoaXRzTGVmdEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuc3R5bGUubWFyZ2luUmlnaHQgPSAoaGl0c0xlZnRFZGdlID8gdGhpcy5wYWRkaW5nTGVmdCAtIHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0Lm9mZnNldFdpZHRoLTE2IDogdGhpcy5wYWRkaW5nTGVmdCArIDE0KSArICdweCc7XG5cblx0XHRcdGhpdHNSaWdodEVkZ2UgPSAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyA4MCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IChoaXRzUmlnaHRFZGdlID8gdGhpcy5wYWRkaW5nUmlnaHQgLSB0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQub2Zmc2V0V2lkdGgtMTYgOiB0aGlzLnBhZGRpbmdSaWdodCArIDE0KSArICdweCc7XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uc3R5bGUuYm90dG9tID0gLSh0aGlzLnBhZGRpbmdCb3R0b20gICsgMjQpICsgJ3B4Jztcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3Auc3R5bGUudG9wID0gLSh0aGlzLnBhZGRpbmdUb3AgICsgMjQpICsgJ3B4JztcblxuXHRcdFx0aGl0c0xlZnRFZGdlID0gKG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0IC0gODAgPCAwKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuY2xhc3NMaXN0W2hpdHNMZWZ0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LnN0eWxlLm1hcmdpblJpZ2h0ID0gdGhpcy5wYWRkaW5nTGVmdCArIHRoaXMubWFyZ2luTGVmdCArIChoaXRzTGVmdEVkZ2UgPyAtdGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5vZmZzZXRXaWR0aC0xNyA6IDE0KSArICdweCc7XG5cblx0XHRcdGhpdHNSaWdodEVkZ2UgPSAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0ICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5zdHlsZS5tYXJnaW5MZWZ0ID0gdGhpcy5wYWRkaW5nUmlnaHQgKyB0aGlzLm1hcmdpblJpZ2h0ICsgKGhpdHNSaWdodEVkZ2UgPyAtdGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQub2Zmc2V0V2lkdGgtMTcgOiAxNCkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Cb3R0b20uc3R5bGUuYm90dG9tID0gLXRoaXMubWFyZ2luQm90dG9tIC10aGlzLnBhZGRpbmdCb3R0b20gLTI0ICsgJ3B4Jztcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5zdHlsZS50b3AgPSAtdGhpcy5tYXJnaW5Ub3AgLXRoaXMucGFkZGluZ1RvcCAtMjQgKyAncHgnO1xuXG5cdFx0fSxcblxuXHRcdGdldENhcHRpb25Qcm9wZXJ0eTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Ly8gY2hlY2sgaW4gaW5saW5lIHN0eWxlc1xuXHRcdFx0aWYodGhpcy5jdXJyZW50RWxlbWVudC5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNoZWNrIGluIHJ1bGVzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMubWF0Y2hlZFJ1bGVzW2ldLnN0eWxlW2Nzc1Byb3BlcnR5XSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0ucmVwbGFjZSgvKGVtfHB4KS8sICfigIk8c3Bhbj4kMTwvc3Bhbj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmV0VmFsID0gJyc7XG5cblx0XHRcdGlmKGNzc1Byb3BlcnR5LmluZGV4T2YoJ21hcmdpbicpID4gLTEgfHwgY3NzUHJvcGVydHkuaW5kZXhPZigncGFkZGluZycpID4gLTEpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpc1tjc3NQcm9wZXJ0eV07XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICdoZWlnaHQnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJIZWlnaHQ7XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICd3aWR0aCcpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpcy5pbm5lcldpZHRoO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpbXBsaWNpdCB2YWx1ZVxuXHRcdFx0cmV0dXJuICcoJyArIHJldFZhbCArICfigIk8c3Bhbj5weDwvc3Bhbj4pJztcblxuXHRcdH0sXG5cblx0XHRhY3RpdmF0ZTogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbmV3RWxlbTtcblx0XHRcdHRoaXMuY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHRcdC8vIGluaXRpYWwgaG92ZXJcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHR0aGlzLm92ZXIgPSB0cnVlO1xuXG5cdFx0XHRpZih0aGlzLmNvbXB1dGVkU3R5bGUuZGlzcGxheSA9PT0gJ2lubGluZScpIHtcblx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbmxpbmUnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItaW5saW5lJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGhpZGUgdGhlIGhvdmVyIGdob3N0IGZvciBpbnNwZWN0aW9uXG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZmluZCBtYXRjaGluZyBydWxlc1xuXHRcdFx0dGhpcy5tYXRjaGVkUnVsZXMgPSBTdHlsZVBhcnNlci5yZXNvbHZlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHQvLyBleGVjdXRlIHBsdWdpbnNcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignYWN0aXZhdGUnKTtcblxuXHRcdFx0Ly8gcmVsYXlvdXRcblx0XHRcdHRoaXMucmVsYXlvdXQoKTtcblxuXHRcdH0sXG5cblx0XHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUpIHtcblx0XHRcdFx0dGhpcy5leGl0UnVsZU1vZGUoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdob3Zlci1pbm5lcicsICdob3Zlci1wYWRkaW5nJywgJ2hvdmVyLW1hcmdpbicsICdoaWRkZW4nKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZXhlY3V0ZSBwbHVnaW5zXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2RlYWN0aXZhdGUnKTtcblxuXHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJDb21tYW5kID0gZmFsc2U7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDtcblxuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdrZXl1cCcsIHRoaXMuX19rZXl1cCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2tleWRvd24nLCB0aGlzLl9fa2V5ZG93bik7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBGdW5jdGlvbnMgcmVsYXRlZCB0byBydWxlLWJhc2VkIGVkaXRpbmdcblx0XHQgKi9cblxuXHRcdGVudGVyUnVsZU1vZGU6IGZ1bmN0aW9uKGNzc1J1bGUsIGluZGV4KSB7XG5cblx0XHRcdC8vIGlmIHNlbGVjdGVkUnVsZSBhbmQgbmV3IGNzc1J1bGUgYXJlIHRoZSBzYW1lLCBkb24ndCBkbyBhbnl0aGluZ1xuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUgPT09IGNzc1J1bGUpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiBzZWxlY3RlZFJ1bGUgd2Fzbid0IGVtcHR5LCB3ZSBzaW1wbHkgY2hhbmdlIHRoZSBydWxlXG5cdFx0XHRpZih0aGlzLnNlbGVjdGVkUnVsZSkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGVkUnVsZSA9IGNzc1J1bGU7XG5cdFx0XHRcdHRoaXMuY2FsbFBsdWdpbignY2hhbmdlUnVsZScsIGluZGV4KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gY3NzUnVsZTtcblx0XHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdlbnRlclJ1bGUnLCBpbmRleCk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0ZXhpdFJ1bGVNb2RlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignZXhpdFJ1bGUnKTtcblx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDtcblx0XHR9LFxuXG5cdFx0c2VsZWN0UnVsZTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHR0aGlzLmVudGVyUnVsZU1vZGUodGhpcy5tYXRjaGVkUnVsZXNbaV0sIGkpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBubyBydWxlIG1hdGNoaW5nPyBleGl0IHJ1bGUgbW9kZSB0aGVuXG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXG5cdFx0fSxcblxuXHRcdGRlc2VsZWN0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXHRcdH0sXG5cblx0XHQvKiBcblx0XHQgKiBmdW5jdGlvbnMgdG8gdGVtcG9yYXJpbHkgZGlzYWJsZVxuXHRcdCAqIGxheW91dCBtb2RlLCBpLmUuIGZvciBwcmV2aWV3aW5nLlxuXHRcdCAqL1xuXG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuaGlkZGVuID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXIgPSB0aGlzLl9fbGFzdE92ZXI7XG5cblx0XHRcdGlmKHRoaXMub3ZlcikgdGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0aWYodGhpcy5vdmVySW5uZXIpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5uZXInKTtcblx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmcpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItcGFkZGluZycpO1xuXHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luKSB0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLW1hcmdpbicpO1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuXG5cdFx0XHQvLyBlZGdlIGNhc2U6IHVzZXIgaG9sZHMgY29tbWFuZCwgbW92ZXMgb3V0LCByZWxlYXNlcyBjb21tYW5kXG5cdFx0XHRpZih0aGlzLl9fbGFzdE1vdXNlTW92ZUV2ZW50KVxuXHRcdFx0XHR0aGlzLnByb2Nlc3NPdmVyTG9naWModGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudCk7XG5cblx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG5cblx0XHRcdHRoaXMuY2FsbFBsdWdpbignc2hvdycpO1xuXG5cdFx0fSxcblxuXHRcdGhpZGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmhpZGRlbiA9IHRydWU7XG5cdFx0XHR0aGlzLl9fbGFzdE92ZXIgPSB0aGlzLm92ZXI7XG5cdFx0XHR0aGlzLm92ZXIgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdob3Zlci1pbm5lcicsICdob3Zlci1tYXJnaW4nLCAnaG92ZXItcGFkZGluZycpO1xuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcblx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG5cblx0XHRcdHRoaXMuY2FsbFBsdWdpbignaGlkZScpO1xuXG5cdFx0fVxuXG5cblx0fSk7XG5cblx0Ly8gQ3JlYXRlIExheW91dCBNb2RlIChzaW5nbGV0b24pXG5cdHdpbmRvdy5MYXlvdXRNb2RlID0gbmV3IExheW91dE1vZGUoKTtcblxufSkoKTtcblxuXG4iLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy50aXRsZUJveCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5LXRpdGxlXCI+PGRpdiBjbGFzcz1cInRpdGxlLXJ1bGVcIj48c3BhbiBjbGFzcz1cInNlbGVjdGVkXCI+aW5saW5lIHN0eWxlPC9zcGFuPiA8c3BhbiBjbGFzcz1cInRvZ2dsZVwiPuKWvjwvc3Bhbj48dWwgY2xhc3M9XCJkcm9wZG93blwiPjxsaT5pbmxpbmUgc3R5bGU8L2xpPjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cInRpdGxlLXByb3BvcnRpb25zXCI+MTAwIHggMTAwPC9kaXY+PC9kaXY+Jylcblx0XHRcdC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KVswXTtcblxuXHRcdHRoaXMudGl0bGVQcm9wb3J0aW9ucyA9ICQoJy50aXRsZS1wcm9wb3J0aW9ucycsIHRoaXMudGl0bGVCb3gpWzBdO1xuXHRcdHRoaXMudGl0bGVEcm9wZG93biA9ICQoJy5kcm9wZG93bicsIHRoaXMudGl0bGVCb3gpO1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gaW5pdGlhbGl6ZSB0aXRsZSBib3ggYmVoYXZpb3VyXG5cdFx0dmFyIHRpdGxlQm94ID0gdGhpcy50aXRsZUJveDtcblx0XHR2YXIgdGl0bGVEcm9wZG93biA9IHRoaXMudGl0bGVEcm9wZG93bjtcblxuXHRcdCQoJ3NwYW4nLCB0aXRsZUJveCkuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCcuZHJvcGRvd24nLCB0aXRsZUJveCkudG9nZ2xlKCk7XG5cdFx0fSk7XG5cblxuXHRcdHRpdGxlRHJvcGRvd24ub24oJ2NsaWNrJywgJ2xpJywgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aXRsZURyb3Bkb3duLmhpZGUoKTtcblx0XHRcdCQoJy5zZWxlY3RlZCcsIHRpdGxlQm94KS5odG1sKHRoaXMuaW5uZXJIVE1MKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuZmlsbFJ1bGVzKCk7XG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdCQoJ3NwYW4nLCB0aGlzLnRpdGxlQm94KS5vZmYoJ2NsaWNrJyk7XG5cdFx0JCgnc3BhbicsIHRoaXMudGl0bGVEcm9wZG93bikub2ZmKCdjbGljaycpO1xuXHR9LFxuXG5cdGVudGVyUnVsZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR0aGlzLnRpdGxlQm94LmNsYXNzTGlzdC5hZGQoJ3J1bGUnKTtcblx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LnN0eWxlLnpJbmRleCA9IDEwMDAyO1xuXHRcdHRoaXMuY2hhbmdlUnVsZShpbmRleCk7XG5cdH0sXG5cblx0Y2hhbmdlUnVsZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR0aGlzLnRpdGxlRHJvcGRvd24uZmluZCgnbGk6ZXEoJyArIChpbmRleCArIDEpICsgJyknKS5jbGljaygpO1xuXHR9LFxuXG5cdGV4aXRSdWxlOiBmdW5jdGlvbigpIHtcblx0XHQkKCdzcGFuLnNlbGVjdGVkJywgdGhpcy50aXRsZUJveCkuaHRtbCgnaW5saW5lIHN0eWxlJyk7XG5cdFx0dGhpcy50aXRsZUJveC5jbGFzc0xpc3QucmVtb3ZlKCdydWxlJyk7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5zdHlsZS56SW5kZXggPSAnJztcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMpIHtcblxuXHRcdHZhciBvZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHQvLyBwbGFjZSB0aXRsZSBib3hcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdHRoaXMudGl0bGVCb3guc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgKChwcm9wcy5vdXRlcldpZHRoIC0gdGhpcy50aXRsZUJveC5vZmZzZXRXaWR0aCkgLyAyKSkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCAtIHByb3BzLm1hcmdpblRvcCAtIDU1KSArICdweCknO1xuXHRcdHRoaXMudGl0bGVQcm9wb3J0aW9ucy5pbm5lckhUTUwgPSBwcm9wcy5vdXRlcldpZHRoICsgJyB4ICcgKyBwcm9wcy5vdXRlckhlaWdodDtcblxuXHR9LFxuXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudGl0bGVCb3guc3R5bGUub3BhY2l0eSA9IDE7XG5cdH0sXG5cblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0ZmlsbFJ1bGVzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciByZXNvbHZlZCA9IExheW91dE1vZGUubWF0Y2hlZFJ1bGVzO1xuXG5cdFx0dGhpcy50aXRsZURyb3Bkb3duLmVtcHR5KCk7XG5cdFx0JCgnPGxpPmlubGluZSBzdHlsZTwvbGk+JykuYXBwZW5kVG8odGhpcy50aXRsZURyb3Bkb3duKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc29sdmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQkKCc8bGk+JyArIHJlc29sdmVkW2ldLnNlbGVjdG9yVGV4dCArICc8L2xpPicpXG5cdFx0XHRcdC5kYXRhKCdjc3NSdWxlJywgcmVzb2x2ZWRbaV0pXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLnRpdGxlRHJvcGRvd24pO1xuXHRcdH1cblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgb3ZlcmxheSA9IExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQ7XG5cblx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMpIHtcblxuXHRcdC8vIHBhZGRpbmcgZ3VpZGVzXG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdMZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1wcm9wcy5vZmZzZXQudG9wIC1wcm9wcy5wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5sZWZ0ID0gLXByb3BzLnBhZGRpbmdMZWZ0ICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUucmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0LTEgKyAncHgnO1xuXG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS5ib3R0b20gPSAtcHJvcHMucGFkZGluZ0JvdHRvbS0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcHJvcHMub2Zmc2V0LmxlZnQgLXByb3BzLnBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudG9wID0gLXByb3BzLnBhZGRpbmdUb3AtMSArICdweCc7XG5cblx0XHQvLyBtYXJnaW4gZ3VpZGVzXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdC5zdHlsZS5sZWZ0ID0gLXByb3BzLnBhZGRpbmdMZWZ0IC1wcm9wcy5tYXJnaW5MZWZ0ICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtcHJvcHMub2Zmc2V0LnRvcCAtcHJvcHMucGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUucmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0IC1wcm9wcy5tYXJnaW5SaWdodCAtIDEgKyAncHgnO1xuXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXByb3BzLm9mZnNldC5sZWZ0IC1wcm9wcy5wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbS5zdHlsZS5ib3R0b20gPSAtcHJvcHMucGFkZGluZ0JvdHRvbSAtcHJvcHMubWFyZ2luQm90dG9tIC0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3Auc3R5bGUudG9wID0gLXByb3BzLnBhZGRpbmdUb3AgLXByb3BzLm1hcmdpblRvcCAtMSArICdweCc7XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXG5cdGVudGVyUnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jcmVhdGVHaG9zdHMoKTtcblx0fSxcblxuXHRjaGFuZ2VSdWxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3lHaG9zdHMoKTtcblx0XHR0aGlzLmNyZWF0ZUdob3N0cygpO1xuXHR9LFxuXG5cdGV4aXRSdWxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3lHaG9zdHMoKTtcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy51cGRhdGVHaG9zdHMoKTtcblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0Z2hvc3RzOiBbXSxcblxuXHRjcmVhdGVHaG9zdHM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBnaG9zdHMgPSB0aGlzLmdob3N0cztcblx0XHQkKExheW91dE1vZGUuc2VsZWN0ZWRSdWxlLnNlbGVjdG9yVGV4dCkubm90KExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLm5vdCgnLm92ZXJsYXksIC5vdmVybGF5IConKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGdob3N0ID0gbmV3IEdob3N0KHRoaXMpO1xuXHRcdFx0Z2hvc3QucmVsYXlvdXQoKTtcblx0XHRcdGdob3N0cy5wdXNoKGdob3N0KTtcblx0XHR9KTtcblx0fSxcblxuXHRkZXN0cm95R2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmdob3N0c1tpXS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdHRoaXMuZ2hvc3RzID0gW107XG5cdH0sXG5cblx0dXBkYXRlR2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRpZighdGhpcy5naG9zdHMpIHJldHVybjtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmdob3N0c1tpXS5yZWxheW91dCgpO1xuXHRcdH1cdFx0XG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScsIHRydWUpO1xuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICdub25lJztcblxuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuZm9jdXMoKTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJyk7XG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5zdHlsZS5vdXRsaW5lID0gJyc7XG5cblx0XHQkKGRvY3VtZW50KS5vZmYoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0a2V5dXA6IGZ1bmN0aW9uKCkge1xuXHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0JChkb2N1bWVudClcblx0XHRcdC5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlID09PSA5MSkgeyAvLyBjbWQga2V5XG5cdFx0XHRcdFx0dGhhdC5lbmFibGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5vbigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSA9PT0gOTEpIHsgLy8gY21kIGtleVxuXHRcdFx0XHRcdHRoYXQuZGlzYWJsZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZGlzYWJsZSgpO1xuXHR9LFxuXG5cdGhvdmVyVGFyZ2V0Q2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRpZih0aGlzLmVuYWJsZWQpXG5cdFx0XHR0aGlzLnByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljKGUpO1xuXG5cdFx0Ly8gaWYgd2UncmUgaG9sZGluZyBzaGlmdCBhbmQgaG92ZXIgYW5vdGhlciBlbGVtZW50LCBzaG93IGd1aWRlc1xuXHRcdGlmKHRoaXMuZW5hYmxlZCAmJlxuXHRcdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCAmJlxuXHRcdFx0TGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQgIT09IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuaG92ZXJFbGVtZW50LCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KSAmJlxuXHRcdFx0ISQuY29udGFpbnMoTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCwgTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpXG5cdFx0KSB7XG5cdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG8oTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qIG1lbWJlciBmdW5jdGlvbnMgKi9cblxuXHRlbmFibGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHRcdExheW91dE1vZGUuaGlkZSgpO1xuXG5cdFx0Ly9MYXlvdXRNb2RlLm92ZXIgPSBmYWxzZTtcblxuXHRcdC8vIHByb2Nlc3Mgb3ZlciBsb2dpYyBvbmNlXG5cdFx0aWYoTGF5b3V0TW9kZS5fX2xhc3RNb3VzZU1vdmVFdmVudClcblx0XHRcdHRoaXMucHJvY2Vzc0NvbW1hbmRPdmVyTG9naWMoTGF5b3V0TW9kZS5fX2xhc3RNb3VzZU1vdmVFdmVudCk7XG5cblx0XHQvLyB2aXN1YWxpemUgcmlnaHQgYXdheSB3aXRoIHdoYXQgd2UgcHJldmlvdXNseSBob3ZlcmVkXG5cdFx0aWYoTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQgIT09IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuaG92ZXJFbGVtZW50LCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KSAmJlxuXHRcdFx0ISQuY29udGFpbnMoTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCwgTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpXG5cdFx0KSB7XG5cdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG8oTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXHRcdHRoaXMuY29tbWFuZE92ZXIgPSBmYWxzZTtcblx0XHRpZih0aGlzLnZMaW5lWCkgdGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDA7XG5cdFx0aWYodGhpcy52TGluZVkpIHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdExheW91dE1vZGUuc2hvdygpO1xuXHR9LFxuXG5cdHByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgZXh0cmFNYXJnaW4gPSAxMDtcblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0Ly8gY29tbWFuZCBvdmVyL291dFxuXG5cdFx0aWYoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSBMYXlvdXRNb2RlLm1hcmdpbkxlZnQgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCArIGV4dHJhTWFyZ2luKSAmJlxuXHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCArIExheW91dE1vZGUubWFyZ2luQm90dG9tICsgZXh0cmFNYXJnaW4pXG5cdFx0KSB7XG5cblx0XHRcdGlmKCF0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdHRoaXMuY29tbWFuZE92ZXIgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG9XaW5kb3coKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGlmKHRoaXMuY29tbWFuZE92ZXIpIHtcblx0XHRcdFx0dGhpcy5jb21tYW5kT3ZlciA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0Y3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzOiBmdW5jdGlvbigpIHtcblxuXHRcdGlmKCF0aGlzLnZMaW5lWCkge1xuXHRcdFx0dGhpcy52TGluZVggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdHRoaXMudkxpbmVYLmNsYXNzTmFtZSA9ICd2bGluZS14Jztcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVgpO1xuXG5cdFx0XHR0aGlzLnZMaW5lWENhcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5jbGFzc05hbWUgPSAnY2FwdGlvbic7XG5cdFx0XHR0aGlzLnZMaW5lWC5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWENhcHRpb24pO1xuXG5cdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLmNsYXNzTmFtZSA9ICdjcm9zc2Jhcic7XG5cdFx0XHR0aGlzLnZMaW5lWC5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWENyb3NzQmFyKTtcblx0XHR9XG5cblx0XHRpZighdGhpcy52TGluZVkpIHtcblx0XHRcdHRoaXMudkxpbmVZID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWS5jbGFzc05hbWUgPSAndmxpbmUteSc7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudkxpbmVZKTtcblxuXHRcdFx0dGhpcy52TGluZVlDYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uY2xhc3NOYW1lID0gJ2NhcHRpb24nO1xuXHRcdFx0dGhpcy52TGluZVkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVlDYXB0aW9uKTtcblxuXHRcdFx0dGhpcy52TGluZVlDcm9zc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5jbGFzc05hbWUgPSAnY3Jvc3NiYXInO1xuXHRcdFx0dGhpcy52TGluZVkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVlDcm9zc0Jhcik7XG5cdFx0fVxuXG5cdH0sXG5cblx0dmlzdWFsaXplUmVsYXRpb25Ub1dpbmRvdzogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgY3VycmVudEVsZW1lbnQgPSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50O1xuXG5cdFx0dGhpcy5jcmVhdGVWaXN1YWxpemF0aW9uTGluZXMoKTtcblxuXHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IChMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQudG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpKSArICdweCc7XG5cdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IDAgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LmxlZnQgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQubGVmdCArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IChMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpKSArICdweCc7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gMCArICdweCc7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LnRvcCArICdweCc7XG5cdFx0dGhpcy52TGluZVlDYXB0aW9uLmlubmVySFRNTCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldC50b3AgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHR9LFxuXG5cdHZpc3VhbGl6ZVJlbGF0aW9uVG86IGZ1bmN0aW9uKHJlbGF0ZWRFbGVtZW50KSB7XG5cblx0XHR2YXIgY3VycmVudEVsZW1lbnQgPSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LCB0b3AsIGxlZnQ7XG5cdFx0dmFyIGN1cnJlbnRPZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cdFx0dmFyIHJlbGF0ZWRPZmZzZXQgPSAkKHJlbGF0ZWRFbGVtZW50KS5vZmZzZXQoKTtcblxuXHRcdHRoaXMuY3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzKCk7XG5cblx0XHR2YXIgcmVSaWdodEVkZ2UgPSByZWxhdGVkT2Zmc2V0LmxlZnQgKyByZWxhdGVkRWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHR2YXIgY2VSaWdodEVkZ2UgPSBjdXJyZW50T2Zmc2V0LmxlZnQgKyBjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHR2YXIgcmVMZWZ0RWRnZSA9IHJlbGF0ZWRPZmZzZXQubGVmdDtcblx0XHR2YXIgY2VMZWZ0RWRnZSA9IGN1cnJlbnRPZmZzZXQubGVmdDtcblxuXHRcdHZhciByZUJvdHRvbUVkZ2UgPSByZWxhdGVkT2Zmc2V0LnRvcCArIHJlbGF0ZWRFbGVtZW50Lm9mZnNldEhlaWdodDtcblx0XHR2YXIgY2VCb3R0b21FZGdlID0gY3VycmVudE9mZnNldC50b3AgKyBjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cdFx0dmFyIHJlVG9wRWRnZSA9IHJlbGF0ZWRPZmZzZXQudG9wO1xuXHRcdHZhciBjZVRvcEVkZ2UgPSBjdXJyZW50T2Zmc2V0LnRvcDtcblx0XHRcblx0XHQvLyBob3Jpem9udGFsIGNvbm5lY3Rpb25cblx0XHRpZihyZVJpZ2h0RWRnZSA8IGNlTGVmdEVkZ2UpIHtcblxuXHRcdFx0dG9wID0gY3VycmVudE9mZnNldC50b3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gcmVSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSBjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCB0b3ApIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSBpZih0b3AgPCByZVRvcEVkZ2UpIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChyZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZihjZVJpZ2h0RWRnZSA8IHJlTGVmdEVkZ2UpIHtcblxuXHRcdFx0dG9wID0gY3VycmVudE9mZnNldC50b3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gY2VSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSByZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCB0b3ApIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAoY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2UgaWYodG9wIDwgcmVUb3BFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdH1cblxuXHRcdC8vIHZlcnRpY2FsIGNvbm5lY3Rpb25cblx0XHRpZihyZUJvdHRvbUVkZ2UgPCBjZVRvcEVkZ2UpIHtcblxuXHRcdFx0bGVmdCA9IGN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSByZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSBjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVSaWdodEVkZ2UgPCBsZWZ0KSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAoY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2UgaWYobGVmdCA8IHJlTGVmdEVkZ2UpIHtcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChyZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZihjZUJvdHRvbUVkZ2UgPCByZVRvcEVkZ2UpIHtcblxuXHRcdFx0bGVmdCA9IGN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSBjZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gcmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSByZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVSaWdodEVkZ2UgPCBsZWZ0KSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIGlmKGxlZnQgPCByZUxlZnRFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdH1cblxuXHR9XG5cbn0pOyIsIihmdW5jdGlvbigpIHtcblxuXHRMYXlvdXRNb2RlLmVuYWJsZSgpO1xuXG5cdC8vJCgndWwnKS5zb3J0YWJsZSgpO1xuXHQkKCcjdGVzdGJveCcpLmNsaWNrKCk7XG5cbn0pKCk7XG5cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
