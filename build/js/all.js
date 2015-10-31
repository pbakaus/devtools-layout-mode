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
			LayoutMode.interacting = true;

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
			LayoutMode.lastInteractionTime = Date.now();
			LayoutMode.interacting = false;
			if(this.options.stop) this.options.stop();

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

			this.handleMarginBottom = $('<div class="handle bottom handle-margin" title="Drag to change margin-bottom"></div>').appendTo(this.overlayElement);
			this.handleMarginRight = $('<div class="handle right handle-margin" title="Drag to change margin-right"></div>').appendTo(this.overlayElement);
			this.handleMarginTop = $('<div class="handle top handle-margin" title="Drag to change margin-top"></div>').appendTo(this.overlayElement);
			this.handleMarginLeft = $('<div class="handle left handle-margin" title="Drag to change margin-left"></div>').appendTo(this.overlayElement);

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

				if(e.which === 18) {
					that.altPressed = false;
				}

				if(e.keyCode === 27) {
					that.deactivate();
				}		
			};
			this.__keydown = function(e) {

				if(e.which === 16) {
					that.shiftPressed = true;
				}

				if(e.which === 18) {
					that.altPressed = true;
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

			// call plugins
			this.callPlugin('mousemove', e);

			// over margin box
			if(
				e.pageX > offset.left - this.marginLeft &&
				e.pageY > offset.top - this.marginTop && 
				e.pageX < (offset.left + this.outerWidth + this.marginRight) &&
				e.pageY < (offset.top + this.outerHeight + this.marginBottom)
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

			var applyPrecision = function(orig, current) {
				if(!that.shiftPressed) {
					var delta = orig - current;
					var precisionDelta = delta / 4;
					return current + Math.round(delta - precisionDelta);
				}
				return current;
			};

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

		calculateHandleSize: function(innerWidth, innerHeight) {
			var handleSizeX = 16;
			var handleSizeY = 16;
			if(innerWidth < 100) {
				handleSizeX = Math.max(8, Math.min(16, handleSizeX * (innerWidth / 60)));
			}
			if(innerHeight < 100) {
				handleSizeY = Math.max(8, Math.min(16, handleSizeY * (innerHeight / 60)));
			}
			return {
				y: handleSizeY,
				x: handleSizeX
			};
		},

		relayout: function() {

			var computedStyle = this.computedStyle = getComputedStyle(this.currentElement);

			var overlayElement = this.overlayElement;
			var elem = $(this.currentElement);
			var offset = this.currentOffset = elem.offset();

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

			this.refreshCaptions();

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

			}, this.calculateHandleSize(innerWidth, innerHeight));

		},

		refreshHandles: function(handleSizeX, handleSizeY) {

			this.handleMarginLeft[0].style.height = handleSizeY + 'px';
			this.handleMarginRight[0].style.height = handleSizeY + 'px';
			this.handleMarginTop[0].style.width = handleSizeX + 'px';
			this.handleMarginBottom[0].style.width = handleSizeX + 'px';

		},

		refreshCaptions: function() {

			var offset = { left: this.currentElement.offsetLeft, top: this.currentElement.offsetTop };

			// captions
			var hitsRightEdge, hitsLeftEdge;

			this.captionMarginLeft.innerHTML = '<span>margin-left: </span>' + this.getCaptionProperty('marginLeft');
			this.captionMarginRight.innerHTML = '<span>margin-right: </span>' + this.getCaptionProperty('marginRight');
			this.captionMarginTop.innerHTML = '<span>margin-top: </span>' + this.getCaptionProperty('marginTop');
			this.captionMarginBottom.innerHTML = '<span>margin-bottom: </span>' + this.getCaptionProperty('marginBottom');

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

			this.overlayElement.classList.remove('hover', 'hover-margin', 'hidden');
			this.overlayElement.style.display = 'none';

			// execute plugins
			this.callPlugin('deactivate');

			this.over = false;
			this.overMargin = false;
			this.overCommand = false;
			this.currentElement = null;

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

			this.overlayElement.classList.remove('hover', 'hover-margin');
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
LayoutMode.registerPlugin({

	create: function() {

		this.handleHeight = $('<div class="handle bottom handle-size" title="Drag to change height"></div>').appendTo(LayoutMode.overlayElement);
		this.handleWidth = $('<div class="handle right handle-size" title="Drag to change width"></div>').appendTo(LayoutMode.overlayElement);

		this.captionWidth = $('<div class="caption caption-width"></div>').appendTo(LayoutMode.overlayElement)[0];
		this.captionHeight = $('<div class="caption caption-height"></div>').appendTo(LayoutMode.overlayElement)[0];

		this.initDraggers();

	},

	deactivate: function() {
		this.overInner = false;
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
			e.pageY < (offset.top + LayoutMode.outerHeight - LayoutMode.paddingBottom)
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
			e.pageX > offset.left + LayoutMode.paddingLeft + LayoutMode.innerWidth - 10 &&
			e.pageY > offset.top + LayoutMode.paddingTop &&
			e.pageX < (offset.left + LayoutMode.outerWidth - LayoutMode.paddingRight) &&
			e.pageY < (offset.top + LayoutMode.outerHeight - LayoutMode.paddingBottom)
		) {

			if(!this.overWidth) {
				document.body.style.cursor = 'e-resize';
				this.captionWidth.classList.add('over');
				this.refreshCaptions();
				LayoutMode.selectRule('width');
				this.overWidth = true;

			}

		} else {

			if(this.overWidth) {
				this.overWidth = false;
				document.body.style.cursor = '';
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
			e.pageY > offset.top + LayoutMode.paddingTop + LayoutMode.innerHeight - 10 &&
			e.pageX > offset.left + LayoutMode.paddingLeft &&
			e.pageY < (offset.top + LayoutMode.outerHeight - LayoutMode.paddingBottom) &&
			e.pageX < (offset.left + LayoutMode.outerWidth - LayoutMode.paddingRight)
		) {

			if(!this.overHeight) {
				document.body.style.cursor = 's-resize';
				this.captionHeight.classList.add('over');
				this.refreshCaptions();
				LayoutMode.selectRule('height');
				this.overHeight = true;
			}

		} else {

			if(this.overHeight) {
				this.overHeight = false;
				document.body.style.cursor = '';
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
LayoutMode.registerPlugin({

	create: function() {

		this.handlePaddingBottom = $('<div class="handle bottom handle-padding" title="Drag to change padding-bottom"></div>').appendTo(LayoutMode.overlayElement);
		this.handlePaddingRight = $('<div class="handle right handle-padding" title="Drag to change padding-right"></div>').appendTo(LayoutMode.overlayElement);
		this.handlePaddingTop = $('<div class="handle top handle-padding" title="Drag to change padding-top"></div>').appendTo(LayoutMode.overlayElement);
		this.handlePaddingLeft = $('<div class="handle left handle-padding" title="Drag to change padding-left"></div>').appendTo(LayoutMode.overlayElement);

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

		// if over any padding area, show padding handles
		if(
			overPaddingTop ||
			overPaddingBottom ||
			overPaddingLeft ||
			overPaddingRight
		) {
			if(!this.overPadding) {
				LayoutMode.overlayElement.classList.add('hover-padding');
				this.overPadding = true;
			}
		} else {
			if(this.overPadding) {
				this.overPadding = false;
				LayoutMode.overlayElement.classList.remove('hover-padding');		
			}
		}

		var cursorAdded = false;
		var cursorRemoved = false;

		if(overPaddingTop) {
			if(!this.overPaddingTop) {
				this.overPaddingTop = true;
				this.captionPaddingTop.classList.add('over');
				document.body.style.cursor = 'n-resize';
				cursorAdded = true;
			}
		} else {
			if(this.overPaddingTop) {
				this.overPaddingTop = false;
				this.captionPaddingTop.classList.remove('over');
				cursorRemoved = true;
			}
		}

		if(overPaddingBottom) {
			if(!this.overPaddingBottom) {
				this.overPaddingBottom = true;
				this.captionPaddingBottom.classList.add('over');
				document.body.style.cursor = 's-resize';
				cursorAdded = true;
			}
		} else {
			if(this.overPaddingBottom) {
				this.overPaddingBottom = false;
				this.captionPaddingBottom.classList.remove('over');
				cursorRemoved = true;
			}
		}

		if(overPaddingLeft) {
			if(!this.overPaddingLeft) {
				this.overPaddingLeft = true;
				this.captionPaddingLeft.classList.add('over');
				document.body.style.cursor = 'w-resize';
				cursorAdded = true;
			}
		} else {
			if(this.overPaddingLeft) {
				this.overPaddingLeft = false;
				this.captionPaddingLeft.classList.remove('over');
				cursorRemoved = true;
			}
		}

		if(overPaddingRight) {
			if(!this.overPaddingRight) {
				this.overPaddingRight = true;
				this.captionPaddingRight.classList.add('over');
				document.body.style.cursor = 'e-resize';
				cursorAdded = true;
			}
		} else {
			if(this.overPaddingRight) {
				this.overPaddingRight = false;
				this.captionPaddingRight.classList.remove('over');
				cursorRemoved = true;
			}
		}

		if(!cursorAdded && cursorRemoved) {
			document.body.style.cursor = '';
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


/*
			(function() {

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

	}

});
(function() {

	LayoutMode.enable();

	//$('ul').sortable();
	$('#testbox').click();

})();



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiRHJhZ2dlci5qcyIsIlN0eWxlUGFyc2VyLmpzIiwiTGF5b3V0TW9kZS5qcyIsIlRpdGxlLmpzIiwiR3VpZGVzLmpzIiwiR2hvc3RzLmpzIiwiQ29udGVudEVkaXRhYmxlLmpzIiwiQ29tcGFyZUFuZFByZXZpZXcuanMiLCJNb2RpZnlTaXplLmpzIiwiTW9kaWZ5UGFkZGluZy5qcyIsImluaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDellBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEdob3N0ID0gZnVuY3Rpb24oZWxlbSkge1xuXG5cdHRoaXMub3ZlcmxheUVsZW1lbnQgPSB0aGlzLmNyZWF0ZSgpO1xuXHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gZWxlbTtcblxufTtcblxuJC5leHRlbmQoR2hvc3QucHJvdG90eXBlLCB7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBnaG9zdCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5IGdob3N0XCI+PC9kaXY+Jyk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cblx0XHRnaG9zdC5hcHBlbmRUbygnYm9keScpO1xuXHRcdHJldHVybiBnaG9zdFswXTtcblxuXHR9LFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0aWYobmV3RWxlbSkge1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG5ld0VsZW07XG5cdFx0fVxuXG5cdFx0dmFyIG92ZXJsYXlFbGVtZW50ID0gdGhpcy5vdmVybGF5RWxlbWVudDtcblx0XHR2YXIgZWxlbSA9ICQodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cdFx0dmFyIG9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHR2YXIgY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHR2YXIgaW5uZXJXaWR0aCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUud2lkdGgpO1xuXHRcdHZhciBpbm5lckhlaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUuaGVpZ2h0KTtcblxuXHRcdHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdHZhciBwYWRkaW5nVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nVG9wKTtcblx0XHR2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuXHRcdHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0KTtcblx0XHR2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Ub3ApO1xuXHRcdHZhciBtYXJnaW5SaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luUmlnaHQpO1xuXHRcdHZhciBtYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHR2YXIgb3V0ZXJXaWR0aCA9IGlubmVyV2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodDtcblx0XHR2YXIgb3V0ZXJIZWlnaHQgPSBpbm5lckhlaWdodCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuXG5cdFx0Ly8gcGxhY2UgYW5kIHJlc2l6ZSBvdmVybGF5XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUud2lkdGggPSBpbm5lcldpZHRoICsgJ3B4Jztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgKyBwYWRkaW5nVG9wKSArICdweCknO1xuXG5cdFx0Ly8gbW9kaWZ5IHBhZGRpbmcgYm94XG5cblx0XHQvLyBsZWZ0XG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBwYWRkaW5nTGVmdCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyByaWdodFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IHBhZGRpbmdSaWdodCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0cmlnaHQ6IC1wYWRkaW5nUmlnaHRcblx0XHR9KTtcblxuXHRcdC8vIHRvcFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy50b3AnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBwYWRkaW5nVG9wLFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcFxuXHRcdH0pO1xuXG5cdFx0Ly8gYm90dG9tXG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmJvdHRvbScsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHBhZGRpbmdCb3R0b20sXG5cdFx0XHRib3R0b206IC1wYWRkaW5nQm90dG9tXG5cdFx0fSk7XG5cblx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXG5cdFx0Ly8gbGVmdFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBtYXJnaW5MZWZ0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdGxlZnQ6IC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gcmlnaHRcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG1hcmdpblJpZ2h0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdHJpZ2h0OiAtKHBhZGRpbmdSaWdodCArIG1hcmdpblJpZ2h0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gdG9wXG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4udG9wJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdGhlaWdodDogbWFyZ2luVG9wLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyBib3R0b21cblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5ib3R0b20nLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBvdXRlcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBtYXJnaW5Cb3R0b20sXG5cdFx0XHRib3R0b206IC0ocGFkZGluZ0JvdHRvbSArIG1hcmdpbkJvdHRvbSksXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIihmdW5jdGlvbigpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGlzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudDtcblxuXHR2YXIgRHJhZ2dlciA9IGZ1bmN0aW9uKGV2ZW50LCBvcHRpb25zKSB7XG5cblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdHRoaXMuZXZlbnREb3duID0gZXZlbnQudG91Y2hlcyA/IGV2ZW50LnRvdWNoZXNbMF0gOiBldmVudDtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cblx0fTtcblxuXHQkLmV4dGVuZChEcmFnZ2VyLnByb3RvdHlwZSwge1xuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdExheW91dE1vZGUuaW50ZXJhY3RpbmcgPSB0cnVlO1xuXG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR0aGlzLl9fbW92ZSA9IGZ1bmN0aW9uKGUpIHsgc2VsZi5tb3ZlKGUpOyB9O1xuXHRcdFx0dGhpcy5fX3N0b3AgPSBmdW5jdGlvbihlKSB7IHNlbGYuc3RvcChlKTsgfTtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoaXNUb3VjaCA/ICd0b3VjaG1vdmUnIDogJ21vdXNlbW92ZScsIHRoaXMuX19tb3ZlLCBmYWxzZSk7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGlzVG91Y2ggPyAndG91Y2hlbmQnIDogJ21vdXNldXAnLCB0aGlzLl9fc3RvcCwgZmFsc2UpO1xuXG5cdFx0fSxcblx0XHRtb3ZlOiBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0XHR0aGlzLmV2ZW50TW92ZSA9IGV2ZW50LnRvdWNoZXMgPyBldmVudC50b3VjaGVzWzBdIDogZXZlbnQ7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR2YXIgbW92ZWJ5ID0gMDtcblxuXHRcdFx0aWYodGhpcy5vcHRpb25zLnZlcnRpY2FsKSB7XG5cdFx0XHRcdG1vdmVieSA9ICh0aGlzLmV2ZW50RG93bi5wYWdlWSAtIHRoaXMuZXZlbnRNb3ZlLnBhZ2VZKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1vdmVieSA9ICh0aGlzLmV2ZW50RG93bi5wYWdlWCAtIHRoaXMuZXZlbnRNb3ZlLnBhZ2VYKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vcHRpb25zLm1vdmUobW92ZWJ5KTtcblxuXHRcdH0sXG5cdFx0c3RvcDogZnVuY3Rpb24oZXZlbnQpIHtcblxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpc1RvdWNoID8gJ3RvdWNobW92ZScgOiAnbW91c2Vtb3ZlJywgdGhpcy5fX21vdmUpO1xuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpc1RvdWNoID8gJ3RvdWNoZW5kJyA6ICdtb3VzZXVwJywgdGhpcy5fX3N0b3ApO1xuXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TGF5b3V0TW9kZS5sYXN0SW50ZXJhY3Rpb25UaW1lID0gRGF0ZS5ub3coKTtcblx0XHRcdExheW91dE1vZGUuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdGlmKHRoaXMub3B0aW9ucy5zdG9wKSB0aGlzLm9wdGlvbnMuc3RvcCgpO1xuXG5cdFx0fVxuXHR9KTtcblxuXHR3aW5kb3cuRHJhZ2dlciA9IERyYWdnZXI7XG5cbn0pKCk7IiwiLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcGVjaWZpY2l0eSBvZiBDU1Mgc2VsZWN0b3JzXG4gKiBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXNlbGVjdG9ycy8jc3BlY2lmaWNpdHlcbiAqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAgLSBzZWxlY3RvcjogdGhlIGlucHV0XG4gKiAgLSBzcGVjaWZpY2l0eTogZS5nLiAwLDEsMCwwXG4gKiAgLSBwYXJ0czogYXJyYXkgd2l0aCBkZXRhaWxzIGFib3V0IGVhY2ggcGFydCBvZiB0aGUgc2VsZWN0b3IgdGhhdCBjb3VudHMgdG93YXJkcyB0aGUgc3BlY2lmaWNpdHlcbiAqL1xudmFyIFNQRUNJRklDSVRZID0gKGZ1bmN0aW9uKCkge1xuXHR2YXIgY2FsY3VsYXRlLFxuXHRcdGNhbGN1bGF0ZVNpbmdsZTtcblxuXHRjYWxjdWxhdGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdHZhciBzZWxlY3RvcnMsXG5cdFx0XHRzZWxlY3Rvcixcblx0XHRcdGksXG5cdFx0XHRsZW4sXG5cdFx0XHRyZXN1bHRzID0gW107XG5cblx0XHQvLyBTZXBhcmF0ZSBpbnB1dCBieSBjb21tYXNcblx0XHRzZWxlY3RvcnMgPSBpbnB1dC5zcGxpdCgnLCcpO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gc2VsZWN0b3JzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yc1tpXTtcblx0XHRcdGlmIChzZWxlY3Rvci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHJlc3VsdHMucHVzaChjYWxjdWxhdGVTaW5nbGUoc2VsZWN0b3IpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fTtcblxuXHQvLyBDYWxjdWxhdGUgdGhlIHNwZWNpZmljaXR5IGZvciBhIHNlbGVjdG9yIGJ5IGRpdmlkaW5nIGl0IGludG8gc2ltcGxlIHNlbGVjdG9ycyBhbmQgY291bnRpbmcgdGhlbVxuXHRjYWxjdWxhdGVTaW5nbGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdHZhciBzZWxlY3RvciA9IGlucHV0LFxuXHRcdFx0ZmluZE1hdGNoLFxuXHRcdFx0dHlwZUNvdW50ID0ge1xuXHRcdFx0XHQnYSc6IDAsXG5cdFx0XHRcdCdiJzogMCxcblx0XHRcdFx0J2MnOiAwXG5cdFx0XHR9LFxuXHRcdFx0cGFydHMgPSBbXSxcblx0XHRcdC8vIFRoZSBmb2xsb3dpbmcgcmVndWxhciBleHByZXNzaW9ucyBhc3N1bWUgdGhhdCBzZWxlY3RvcnMgbWF0Y2hpbmcgdGhlIHByZWNlZGluZyByZWd1bGFyIGV4cHJlc3Npb25zIGhhdmUgYmVlbiByZW1vdmVkXG5cdFx0XHRhdHRyaWJ1dGVSZWdleCA9IC8oXFxbW15cXF1dK1xcXSkvZyxcblx0XHRcdGlkUmVnZXggPSAvKCNbXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0Y2xhc3NSZWdleCA9IC8oXFwuW15cXHNcXCs+flxcLlxcWzpdKykvZyxcblx0XHRcdHBzZXVkb0VsZW1lbnRSZWdleCA9IC8oOjpbXlxcc1xcKz5+XFwuXFxbOl0rfDpmaXJzdC1saW5lfDpmaXJzdC1sZXR0ZXJ8OmJlZm9yZXw6YWZ0ZXIpL2dpLFxuXHRcdFx0Ly8gQSByZWdleCBmb3IgcHNldWRvIGNsYXNzZXMgd2l0aCBicmFja2V0cyAtIDpudGgtY2hpbGQoKSwgOm50aC1sYXN0LWNoaWxkKCksIDpudGgtb2YtdHlwZSgpLCA6bnRoLWxhc3QtdHlwZSgpLCA6bGFuZygpXG5cdFx0XHRwc2V1ZG9DbGFzc1dpdGhCcmFja2V0c1JlZ2V4ID0gLyg6W1xcdy1dK1xcKFteXFwpXSpcXCkpL2dpLFxuXHRcdFx0Ly8gQSByZWdleCBmb3Igb3RoZXIgcHNldWRvIGNsYXNzZXMsIHdoaWNoIGRvbid0IGhhdmUgYnJhY2tldHNcblx0XHRcdHBzZXVkb0NsYXNzUmVnZXggPSAvKDpbXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0ZWxlbWVudFJlZ2V4ID0gLyhbXlxcc1xcKz5+XFwuXFxbOl0rKS9nO1xuXG5cdFx0Ly8gRmluZCBtYXRjaGVzIGZvciBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBpbiBhIHN0cmluZyBhbmQgcHVzaCB0aGVpciBkZXRhaWxzIHRvIHBhcnRzXG5cdFx0Ly8gVHlwZSBpcyBcImFcIiBmb3IgSURzLCBcImJcIiBmb3IgY2xhc3NlcywgYXR0cmlidXRlcyBhbmQgcHNldWRvLWNsYXNzZXMgYW5kIFwiY1wiIGZvciBlbGVtZW50cyBhbmQgcHNldWRvLWVsZW1lbnRzXG5cdFx0ZmluZE1hdGNoID0gZnVuY3Rpb24ocmVnZXgsIHR5cGUpIHtcblx0XHRcdHZhciBtYXRjaGVzLCBpLCBsZW4sIG1hdGNoLCBpbmRleCwgbGVuZ3RoO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaChyZWdleCk7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdFx0XHR0eXBlQ291bnRbdHlwZV0gKz0gMTtcblx0XHRcdFx0XHRtYXRjaCA9IG1hdGNoZXNbaV07XG5cdFx0XHRcdFx0aW5kZXggPSBzZWxlY3Rvci5pbmRleE9mKG1hdGNoKTtcblx0XHRcdFx0XHRsZW5ndGggPSBtYXRjaC5sZW5ndGg7XG5cdFx0XHRcdFx0cGFydHMucHVzaCh7XG5cdFx0XHRcdFx0XHRzZWxlY3RvcjogbWF0Y2gsXG5cdFx0XHRcdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0XHRcdFx0aW5kZXg6IGluZGV4LFxuXHRcdFx0XHRcdFx0bGVuZ3RoOiBsZW5ndGhcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBSZXBsYWNlIHRoaXMgc2ltcGxlIHNlbGVjdG9yIHdpdGggd2hpdGVzcGFjZSBzbyBpdCB3b24ndCBiZSBjb3VudGVkIGluIGZ1cnRoZXIgc2ltcGxlIHNlbGVjdG9yc1xuXHRcdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShtYXRjaCwgQXJyYXkobGVuZ3RoICsgMSkuam9pbignICcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBSZW1vdmUgdGhlIG5lZ2F0aW9uIHBzdWVkby1jbGFzcyAoOm5vdCkgYnV0IGxlYXZlIGl0cyBhcmd1bWVudCBiZWNhdXNlIHNwZWNpZmljaXR5IGlzIGNhbGN1bGF0ZWQgb24gaXRzIGFyZ3VtZW50XG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZ2V4ID0gLzpub3RcXCgoW15cXCldKilcXCkvZztcblx0XHRcdGlmIChyZWdleC50ZXN0KHNlbGVjdG9yKSkge1xuXHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UocmVnZXgsICcgICAgICQxICcpO1xuXHRcdFx0fVxuXHRcdH0oKSk7XG5cblx0XHQvLyBSZW1vdmUgYW55dGhpbmcgYWZ0ZXIgYSBsZWZ0IGJyYWNlIGluIGNhc2UgYSB1c2VyIGhhcyBwYXN0ZWQgaW4gYSBydWxlLCBub3QganVzdCBhIHNlbGVjdG9yXG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZ2V4ID0gL3tbXl0qL2dtLFxuXHRcdFx0XHRtYXRjaGVzLCBpLCBsZW4sIG1hdGNoO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaChyZWdleCk7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdFx0XHRtYXRjaCA9IG1hdGNoZXNbaV07XG5cdFx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG1hdGNoLCBBcnJheShtYXRjaC5sZW5ndGggKyAxKS5qb2luKCcgJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSgpKTtcblxuXHRcdC8vIEFkZCBhdHRyaWJ1dGUgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2goYXR0cmlidXRlUmVnZXgsICdiJyk7XG5cblx0XHQvLyBBZGQgSUQgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYSlcblx0XHRmaW5kTWF0Y2goaWRSZWdleCwgJ2EnKTtcblxuXHRcdC8vIEFkZCBjbGFzcyBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChjbGFzc1JlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gQWRkIHBzZXVkby1lbGVtZW50IHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGMpXG5cdFx0ZmluZE1hdGNoKHBzZXVkb0VsZW1lbnRSZWdleCwgJ2MnKTtcblxuXHRcdC8vIEFkZCBwc2V1ZG8tY2xhc3Mgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2gocHNldWRvQ2xhc3NXaXRoQnJhY2tldHNSZWdleCwgJ2InKTtcblx0XHRmaW5kTWF0Y2gocHNldWRvQ2xhc3NSZWdleCwgJ2InKTtcblxuXHRcdC8vIFJlbW92ZSB1bml2ZXJzYWwgc2VsZWN0b3IgYW5kIHNlcGFyYXRvciBjaGFyYWN0ZXJzXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC9bXFwqXFxzXFwrPn5dL2csICcgJyk7XG5cblx0XHQvLyBSZW1vdmUgYW55IHN0cmF5IGRvdHMgb3IgaGFzaGVzIHdoaWNoIGFyZW4ndCBhdHRhY2hlZCB0byB3b3Jkc1xuXHRcdC8vIFRoZXNlIG1heSBiZSBwcmVzZW50IGlmIHRoZSB1c2VyIGlzIGxpdmUtZWRpdGluZyB0aGlzIHNlbGVjdG9yXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC9bI1xcLl0vZywgJyAnKTtcblxuXHRcdC8vIFRoZSBvbmx5IHRoaW5ncyBsZWZ0IHNob3VsZCBiZSBlbGVtZW50IHNlbGVjdG9ycyAodHlwZSBjKVxuXHRcdGZpbmRNYXRjaChlbGVtZW50UmVnZXgsICdjJyk7XG5cblx0XHQvLyBPcmRlciB0aGUgcGFydHMgaW4gdGhlIG9yZGVyIHRoZXkgYXBwZWFyIGluIHRoZSBvcmlnaW5hbCBzZWxlY3RvclxuXHRcdC8vIFRoaXMgaXMgbmVhdGVyIGZvciBleHRlcm5hbCBhcHBzIHRvIGRlYWwgd2l0aFxuXHRcdHBhcnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0cmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yOiBpbnB1dCxcblx0XHRcdHNwZWNpZmljaXR5OiAnMCwnICsgdHlwZUNvdW50LmEudG9TdHJpbmcoKSArICcsJyArIHR5cGVDb3VudC5iLnRvU3RyaW5nKCkgKyAnLCcgKyB0eXBlQ291bnQuYy50b1N0cmluZygpLFxuXHRcdFx0cGFydHM6IHBhcnRzXG5cdFx0fTtcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGNhbGN1bGF0ZTogY2FsY3VsYXRlXG5cdH07XG59KCkpO1xuXG5cbihmdW5jdGlvbigpIHtcblxuXHR2YXIgU3R5bGVQYXJzZXIgPSB7fTtcblxuXHR2YXIgcnVsZXMgPSB7fTtcblx0dmFyIHNoZWV0cyA9IGRvY3VtZW50LnN0eWxlU2hlZXRzO1xuXG5cdHZhciBzaGVldCwgcnVsZTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaGVldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcblx0XHRzaGVldCA9IHNoZWV0c1tpXTtcblx0XHRpZighc2hlZXQuY3NzUnVsZXMpIGNvbnRpbnVlO1xuXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzaGVldC5jc3NSdWxlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0cnVsZSA9IHNoZWV0LmNzc1J1bGVzW2pdO1xuXHRcdFx0cnVsZXNbcnVsZS5zZWxlY3RvclRleHRdID0gcnVsZTtcblx0XHR9XG5cdH1cblxuXHRTdHlsZVBhcnNlci5yZXNvbHZlID0gZnVuY3Rpb24odHJhY2tlZEVsZW1lbnQpIHtcblxuXHRcdHZhciBtYXRjaGVkUnVsZXMgPSB3aW5kb3cuZ2V0TWF0Y2hlZENTU1J1bGVzKHRyYWNrZWRFbGVtZW50KSB8fCBbXTtcblx0XHR2YXIgcnVsZXMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cnVsZXMucHVzaChbbWF0Y2hlZFJ1bGVzW2ldLCBwYXJzZUludChTUEVDSUZJQ0lUWS5jYWxjdWxhdGUobWF0Y2hlZFJ1bGVzW2ldLnNlbGVjdG9yVGV4dClbMF0uc3BlY2lmaWNpdHkucmVwbGFjZSgvXFwsL2csICcnKSwgMTApICsgMC4wMSAqIGldKTtcblx0XHR9XG5cblxuXG5cdFx0cnVsZXMgPSBydWxlc1xuXHRcdFx0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0XHRyZXR1cm4gYlsxXSAtIGFbMV07XG5cdFx0XHR9KVxuXHRcdFx0Lm1hcChmdW5jdGlvbihhKSB7XG5cdFx0XHRcdHJldHVybiBhWzBdO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcnVsZXM7XG5cblx0fTtcblxuXHR3aW5kb3cuU3R5bGVQYXJzZXIgPSBTdHlsZVBhcnNlcjtcblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0dmFyIExheW91dE1vZGUgPSBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQgPSBudWxsOyAvLyB0aGUgYWN0dWFsIG92ZXJsYXkgZGl2XG5cdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG51bGw7IC8vIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudFxuXHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDsgLy8gd2hlbiBkZWZpbmVkLCB3ZSdyZSBpbiBydWxlIG1vZGVcblx0XHR0aGlzLmhvdmVyR2hvc3QgPSBuZXcgR2hvc3QoKTsgLy8gdGhlIGhvdmVyIGdob3N0XG5cdFx0dGhpcy5vdmVyID0gZmFsc2U7IC8vIG9uIHdoZXRoZXIgd2UncmUgY3VycmVubHkgaG92ZXJpbmcgYSBjZXJ0YWluIHBhcnQgb2YgdGhlIG92ZXJsYXlcblx0XHR0aGlzLmludGVyYWN0aW5nID0gZmFsc2U7IC8vIHdoZXRoZXIgd2UncmUgY3VycmVudGx5IGludGVyYWN0aW5nIHdpdGggdGhlIGVsZW1lbnRcblxuXHRcdC8vIGluaXRpYWxpemVcblx0XHR0aGlzLmNyZWF0ZSgpO1xuXG5cdH07XG5cblx0JC5leHRlbmQoTGF5b3V0TW9kZS5wcm90b3R5cGUsIHtcblxuXHRcdHBsdWdpbnM6IFtdLFxuXG5cdFx0cmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbikge1xuXHRcdFx0dGhpcy5wbHVnaW5zLnB1c2gocGx1Z2luKTtcblx0XHRcdGlmKHBsdWdpbi5jcmVhdGUpIHtcblx0XHRcdFx0cGx1Z2luLmNyZWF0ZS5jYWxsKHBsdWdpbik7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGNhbGxQbHVnaW46IGZ1bmN0aW9uKGV2ZW50TmFtZSwgYSwgYiwgYywgZCwgZSwgZikge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsdWdpbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYodGhpcy5wbHVnaW5zW2ldW2V2ZW50TmFtZV0pIHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbnNbaV1bZXZlbnROYW1lXS5jYWxsKHRoaXMucGx1Z2luc1tpXSwgYSwgYiwgYywgZCwgZSwgZik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZW5hYmxlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBtYWtlIGFsbCBlbGVtZW50cyBvbiBwYWdlIGluc3BlY3RhYmxlXG5cdFx0XHQkKCdib2R5ICo6bm90KC5vdmVybGF5LC5vdmVybGF5ICosLm92ZXJsYXktdGl0bGUsLm92ZXJsYXktdGl0bGUgKiknKVxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRcdHZhciB0YXJnZXRDaGFuZ2VkID0gdGhhdC5ob3ZlckVsZW1lbnQgIT09IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5ob3ZlckVsZW1lbnQgPSB0aGlzO1xuXG5cdFx0XHRcdFx0aWYodGFyZ2V0Q2hhbmdlZCkge1xuXHRcdFx0XHRcdFx0dGhhdC5jYWxsUGx1Z2luKCdob3ZlclRhcmdldENoYW5nZScsIGUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIGluIG5vcm1hbCBtb2RlLCBkb24ndCBhY3RpdmF0ZSB0aGUgaG92ZXIgZ2hvc3Qgd2hlbiBpbnRlcmFjdGluZyBvciBvdmVyIHRoZSBjdXJyZW50IGVsXG5cdFx0XHRcdFx0aWYodGhhdC5ob3Zlckdob3N0LmN1cnJlbnRFbGVtZW50ID09PSB0aGlzIHx8IHRoYXQuaW50ZXJhY3RpbmcgfHwgdGhhdC5vdmVyKVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRcdFx0dGhhdC5ob3Zlckdob3N0LnJlbGF5b3V0KHRoaXMpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdGlmKHRoYXQuY3VycmVudEVsZW1lbnQgPT09IHRoaXMgfHwgdGhhdC5pbnRlcmFjdGluZylcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHRcdC8vIHRoaXMgaXMgYW4gaW5zYW5lbHkgdWdseSB3b3JrYXJvdW5kIGZvciBhIHByb3BhZ2F0aW9uIGlzc3VlIGZyb20gZHJhZyxcblx0XHRcdFx0XHQvLyBidXQgSSBqdXN0IGRvbnQgZ2l2ZSBhIHNoaXQhIDpEXG5cdFx0XHRcdFx0aWYoRGF0ZS5ub3coKSAtIHRoYXQubGFzdEludGVyYWN0aW9uVGltZSA8IDUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZih0aGF0LmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdFx0XHR0aGF0LmRlYWN0aXZhdGUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBzeW5jIG9uIHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0dGhhdC5hY3RpdmF0ZSh0aGlzKTtcblxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHR9KTtcdFx0XG5cblx0XHR9LFxuXG5cdFx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY3JlYXRlT3ZlcmxheSgpO1xuXHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0fSxcblxuXHRcdGNyZWF0ZU92ZXJsYXk6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gJCgnPGRpdiBpZD1cIm92ZXJsYXlcIiBjbGFzcz1cIm92ZXJsYXlcIj48L2Rpdj4nKVswXTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSB0b3AgaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBsZWZ0IGhhbmRsZS1tYXJnaW5cIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIG1hcmdpbi1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogRXZlbnRzICYgQmVoYXZpb3VyIGluaXRpYWxpemF0aW9uXG5cdFx0ICovXG5cblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5pbml0SG92ZXIoKTtcblx0XHRcdHRoaXMuaW5pdEhhbmRsZUhvdmVyKCk7XG5cdFx0XHR0aGlzLmluaXRIYW5kbGVzKCk7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHRoaXMuX19rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxNikge1xuXHRcdFx0XHRcdHRoYXQuc2hpZnRQcmVzc2VkID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxOCkge1xuXHRcdFx0XHRcdHRoYXQuYWx0UHJlc3NlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoZS5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0XHRcdHRoYXQuZGVhY3RpdmF0ZSgpO1xuXHRcdFx0XHR9XHRcdFxuXHRcdFx0fTtcblx0XHRcdHRoaXMuX19rZXlkb3duID0gZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRcdGlmKGUud2hpY2ggPT09IDE2KSB7XG5cdFx0XHRcdFx0dGhhdC5zaGlmdFByZXNzZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoZS53aGljaCA9PT0gMTgpIHtcblx0XHRcdFx0XHR0aGF0LmFsdFByZXNzZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH07XG5cdFx0XHQkKGRvY3VtZW50KS5vbigna2V5dXAnLCB0aGlzLl9fa2V5dXApO1xuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCB0aGlzLl9fa2V5ZG93bik7XG5cblx0XHR9LFxuXG5cdFx0aW5pdEhvdmVyOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0XHQkKCdib2R5Jykub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHR0aGF0Ll9fbGFzdE1vdXNlTW92ZUV2ZW50ID0gZTtcblx0XHRcdFx0aWYoIXRoYXQuY3VycmVudEVsZW1lbnQgfHwgdGhhdC5oaWRkZW4pIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGF0LnByb2Nlc3NPdmVyTG9naWMoZSk7XG5cblx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdGluaXRIYW5kbGVIb3ZlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21cblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZU1hcmdpblRvcClcblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZU1hcmdpbkxlZnQpXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVNYXJnaW5SaWdodClcblx0XHRcdFx0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQub3Zlck1hcmdpbkhhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5SaWdodFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLXJpZ2h0Jyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLWJvdHRvbScpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpbkxlZnRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLWxlZnQnKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Ub3BbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luVG9wLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tdG9wJyk7IH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5vdmVyTWFyZ2luSGFuZGxlID0gZmFsc2U7XG5cblx0XHRcdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRcdFx0dmFyIHJlbW92ZVNwYW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZU1hcmdpbkJvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5Cb3R0b20uY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZU1hcmdpbkxlZnRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luVG9wWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpblRvcC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYoIXRoYXQuX19jYXRjaE1vdXNlVXApIHtcblx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSAkKGRvY3VtZW50KS5vbmUoJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0aWYoIXRoYXQub3Zlck1hcmdpbkhhbmRsZSkgcmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gbnVsbDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRwcm9jZXNzT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdHZhciBleHRyYU1hcmdpbiA9IDEwO1xuXHRcdFx0dmFyIG9mZnNldCA9IHRoaXMuY3VycmVudE9mZnNldDtcblxuXHRcdFx0Ly8gZ2VuZXJhbCBvdmVyL291dFxuXG5cdFx0XHRpZihcblx0XHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0IC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSB0aGlzLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0ICsgZXh0cmFNYXJnaW4pICYmXG5cdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgKyB0aGlzLm1hcmdpbkJvdHRvbSArIGV4dHJhTWFyZ2luKVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3Zlcikge1xuXHRcdFx0XHRcdHRoaXMub3ZlciA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYodGhpcy5vdmVyICYmICF0aGlzLmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcdFx0XHRcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIGRvbid0IHByb2Nlc3MgaWYgaW50ZXJhY3Rpbmdcblx0XHRcdGlmKHRoaXMuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjYWxsIHBsdWdpbnNcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignbW91c2Vtb3ZlJywgZSk7XG5cblx0XHRcdC8vIG92ZXIgbWFyZ2luIGJveFxuXHRcdFx0aWYoXG5cdFx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAmJlxuXHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAtIHRoaXMubWFyZ2luVG9wICYmIFxuXHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCkgJiZcblx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCArIHRoaXMubWFyZ2luQm90dG9tKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGlmKCF0aGlzLm92ZXJNYXJnaW4pIHtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLW1hcmdpbicpO1xuXHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmKHRoaXMub3Zlck1hcmdpbikge1xuXHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItbWFyZ2luJyk7XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0aW5pdEhhbmRsZXM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR2YXIgaGFuZGxlT2Zmc2V0ID0gMztcblxuXHRcdFx0dmFyIGFwcGx5UHJlY2lzaW9uID0gZnVuY3Rpb24ob3JpZywgY3VycmVudCkge1xuXHRcdFx0XHRpZighdGhhdC5zaGlmdFByZXNzZWQpIHtcblx0XHRcdFx0XHR2YXIgZGVsdGEgPSBvcmlnIC0gY3VycmVudDtcblx0XHRcdFx0XHR2YXIgcHJlY2lzaW9uRGVsdGEgPSBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0cmV0dXJuIGN1cnJlbnQgKyBNYXRoLnJvdW5kKGRlbHRhIC0gcHJlY2lzaW9uRGVsdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjdXJyZW50O1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gcmVzaXplIG1hcmdpblxuXG5cdFx0XHQoZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIHN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcblx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBkcmFnID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5yZWxheW91dCgpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3MtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVySGVpZ2h0ID0gJCh0aGF0LmN1cnJlbnRFbGVtZW50KS5oZWlnaHQoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luQm90dG9tID0gdGhhdC5tYXJnaW5Cb3R0b207XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdCb3R0b20gPSB0aGF0LnBhZGRpbmdCb3R0b207XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb24udG9wLCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gTWF0aC5tYXgodGhpcy5jdXJJbm5lckhlaWdodCArIHRoaXMuY3VyUGFkZGluZ0JvdHRvbSAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb24udG9wKTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5Cb3R0b20gPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpbkJvdHRvbSArICh1aS5wb3NpdGlvbi50b3AgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLnRvcCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5SaWdodC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd4Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICdlLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJJbm5lcldpZHRoID0gJCh0aGF0LmN1cnJlbnRFbGVtZW50KS53aWR0aCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5SaWdodCA9IHRoYXQubWFyZ2luUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdSaWdodCA9IHRoYXQucGFkZGluZ1JpZ2h0O1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdtYXJnaW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi5sZWZ0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCh0aGlzLmN1cklubmVyV2lkdGggKyB0aGlzLmN1clBhZGRpbmdSaWdodCAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb24ubGVmdCk7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luUmlnaHQgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpblJpZ2h0ICsgKHVpLnBvc2l0aW9uLmxlZnQgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLmxlZnQpKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlTWFyZ2luTGVmdC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd4Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICd3LXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJPZmZzZXQgPSB1aS5vZmZzZXQubGVmdDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luTGVmdCA9IHRoYXQubWFyZ2luTGVmdDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IC1oYW5kbGVPZmZzZXQ7XG5cdFx0XHRcdFx0XHR2YXIgZGVsdGEgPSAodWkub2Zmc2V0LmxlZnQgLSB0aGlzLmN1ck9mZnNldCk7XG5cdFx0XHRcdFx0XHRkZWx0YSA9ICF0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpbkxlZnQgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpbkxlZnQgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpblRvcC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd5Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICduLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJPZmZzZXQgPSB1aS5vZmZzZXQudG9wO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5Ub3AgPSB0aGF0Lm1hcmdpblRvcDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQudG9wIC0gdGhpcy5jdXJPZmZzZXQpO1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSAhdGhhdC5zaGlmdFByZXNzZWQgPyBNYXRoLnJvdW5kKGRlbHRhIC8gNCkgOiBkZWx0YTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5Ub3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpblRvcCAtIGRlbHRhKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9KSgpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogQ29yZSBydW50aW1lIGZ1bmN0aW9uYWxpdHlcblx0XHQgKi9cblxuXHRcdGNhbGN1bGF0ZUhhbmRsZVNpemU6IGZ1bmN0aW9uKGlubmVyV2lkdGgsIGlubmVySGVpZ2h0KSB7XG5cdFx0XHR2YXIgaGFuZGxlU2l6ZVggPSAxNjtcblx0XHRcdHZhciBoYW5kbGVTaXplWSA9IDE2O1xuXHRcdFx0aWYoaW5uZXJXaWR0aCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWCA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWCAqIChpbm5lcldpZHRoIC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHRpZihpbm5lckhlaWdodCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWSA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWSAqIChpbm5lckhlaWdodCAvIDYwKSkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eTogaGFuZGxlU2l6ZVksXG5cdFx0XHRcdHg6IGhhbmRsZVNpemVYXG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRyZWxheW91dDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBjb21wdXRlZFN0eWxlID0gdGhpcy5jb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdFx0dmFyIG92ZXJsYXlFbGVtZW50ID0gdGhpcy5vdmVybGF5RWxlbWVudDtcblx0XHRcdHZhciBlbGVtID0gJCh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblx0XHRcdHZhciBvZmZzZXQgPSB0aGlzLmN1cnJlbnRPZmZzZXQgPSBlbGVtLm9mZnNldCgpO1xuXG5cdFx0XHQvLyB3ZSBuZWVkIHRvIHN0b3JlIG91dGVyIGhlaWdodCwgYm90dG9tL3JpZ2h0IHBhZGRpbmcgYW5kIG1hcmdpbnMgZm9yIGhvdmVyIGRldGVjdGlvblxuXHRcdFx0dmFyIHBhZGRpbmdMZWZ0ID0gdGhpcy5wYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdFx0dmFyIHBhZGRpbmdUb3AgPSB0aGlzLnBhZGRpbmdUb3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdUb3ApO1xuXHRcdFx0dmFyIHBhZGRpbmdSaWdodCA9IHRoaXMucGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdFx0dmFyIHBhZGRpbmdCb3R0b20gPSB0aGlzLnBhZGRpbmdCb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG5cdFx0XHR2YXIgbWFyZ2luTGVmdCA9IHRoaXMubWFyZ2luTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luTGVmdCk7XG5cdFx0XHR2YXIgbWFyZ2luVG9wID0gdGhpcy5tYXJnaW5Ub3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblRvcCk7XG5cdFx0XHR2YXIgbWFyZ2luUmlnaHQgPSB0aGlzLm1hcmdpblJpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5SaWdodCk7XG5cdFx0XHR2YXIgbWFyZ2luQm90dG9tID0gdGhpcy5tYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHRcdHZhciBpbm5lcldpZHRoID0gdGhpcy5pbm5lcldpZHRoID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS53aWR0aCkgfHwgKHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodCk7XG5cdFx0XHR2YXIgaW5uZXJIZWlnaHQgPSB0aGlzLmlubmVySGVpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5oZWlnaHQpIHx8ICh0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tKTtcblxuXHRcdFx0dmFyIG91dGVyV2lkdGggPSB0aGlzLm91dGVyV2lkdGggPSBpbm5lcldpZHRoICsgcGFkZGluZ0xlZnQgKyBwYWRkaW5nUmlnaHQ7XG5cdFx0XHR2YXIgb3V0ZXJIZWlnaHQgPSB0aGlzLm91dGVySGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbTtcblxuXHRcdFx0Ly8gY2FsY3VsYXRlIGhhbmRsZSBzaXplXG5cdFx0XHR2YXIgaGFuZGxlU2l6ZVggPSAxNjtcblx0XHRcdHZhciBoYW5kbGVTaXplWSA9IDE2O1xuXHRcdFx0aWYoaW5uZXJXaWR0aCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWCA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWCAqIChpbm5lcldpZHRoIC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHRpZihpbm5lckhlaWdodCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWSA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWSAqIChpbm5lckhlaWdodCAvIDYwKSkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcyhoYW5kbGVTaXplWCwgaGFuZGxlU2l6ZVkpO1xuXG5cdFx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHRcdC8vIG1vZGlmeSBwYWRkaW5nIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nTGVmdCArICcsICcgKyBvdXRlckhlaWdodCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1JpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nUmlnaHQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKC1wYWRkaW5nVG9wKSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ1RvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoMCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQpICsgJ3B4KSBzY2FsZSgnICsgaW5uZXJXaWR0aCArICcsICcgKyBwYWRkaW5nQm90dG9tICsgJyknO1xuXG5cdFx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkpICsgJ3B4LCAnICsgKC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkpICsgJ3B4KSBzY2FsZSgnICsgbWFyZ2luTGVmdCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCArIHBhZGRpbmdSaWdodCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5SaWdodCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpblRvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0ICsgcGFkZGluZ0JvdHRvbSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpbkJvdHRvbSArICcpJztcblxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5tYXJnaW5SaWdodCA9IC0ocGFkZGluZ1JpZ2h0ICsgbWFyZ2luUmlnaHQpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpblRvcCA9IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUubWFyZ2luQm90dG9tID0gLShwYWRkaW5nQm90dG9tICsgbWFyZ2luQm90dG9tKSArICdweCc7XG5cblx0XHRcdC8vIG9mZnNldCBtYWdpY1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5MZWZ0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5MZWZ0KSAvIDUpICsgKGhhbmRsZVNpemVZIC8gMikpIDogLShoYW5kbGVTaXplWSAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luTGVmdCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luTGVmdCkgLyA1KSAtIDggKyBoYW5kbGVTaXplWSkgOiAtOCkgKyAncHgnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luUmlnaHQpIC8gNSkgKyAoaGFuZGxlU2l6ZVkgLyAyKSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luUmlnaHQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIG1hcmdpblJpZ2h0KSAvIDUpIC0gOCArIGhhbmRsZVNpemVZKSA6IC04KSArICdweCc7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luVG9wIDwgMjAgPyAoLSgoKGhhbmRsZVNpemVYIC8gNCkgKiBtYXJnaW5Ub3ApIC8gNSkgKyAoaGFuZGxlU2l6ZVggLyAyKSkgOiAtKGhhbmRsZVNpemVYIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Ub3AgPCAyMCA/ICgoaGFuZGxlU2l6ZVgpICsgKC0oaGFuZGxlU2l6ZVgpICogKG1hcmdpblRvcCAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKG1hcmdpbkJvdHRvbSA8IDIwID8gKC0oKChoYW5kbGVTaXplWCAvIDQpICogbWFyZ2luQm90dG9tKSAvIDUpICsgKGhhbmRsZVNpemVYIC8gMikpIDogLShoYW5kbGVTaXplWCAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemVYKSArICgtKGhhbmRsZVNpemVYKSAqIChtYXJnaW5Cb3R0b20gLyAyMCkpIC0gOCkgOiAtMTEpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHRcdFx0Ly8gaW5mb3JtIHBsdWdpbnMgdGhhdCBhIHJlbGF5b3V0IGhhcyBoYXBwZW5lZFxuXHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdyZWxheW91dCcsIHtcblxuXHRcdFx0XHRjb21wdXRlZFN0eWxlOiBjb21wdXRlZFN0eWxlLFxuXHRcdFx0XHRvZmZzZXQ6IG9mZnNldCxcblxuXHRcdFx0XHRwYWRkaW5nTGVmdDogcGFkZGluZ0xlZnQsXG5cdFx0XHRcdHBhZGRpbmdUb3A6IHBhZGRpbmdUb3AsXG5cdFx0XHRcdHBhZGRpbmdSaWdodDogcGFkZGluZ1JpZ2h0LFxuXHRcdFx0XHRwYWRkaW5nQm90dG9tOiBwYWRkaW5nQm90dG9tLFxuXG5cdFx0XHRcdG1hcmdpbkxlZnQ6IG1hcmdpbkxlZnQsXG5cdFx0XHRcdG1hcmdpblRvcDogbWFyZ2luVG9wLFxuXHRcdFx0XHRtYXJnaW5SaWdodDogbWFyZ2luUmlnaHQsXG5cdFx0XHRcdG1hcmdpbkJvdHRvbTogbWFyZ2luQm90dG9tLFxuXG5cdFx0XHRcdGlubmVyV2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRcdGlubmVySGVpZ2h0OiBpbm5lckhlaWdodCxcblx0XHRcdFx0b3V0ZXJXaWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdFx0b3V0ZXJIZWlnaHQ6IG91dGVySGVpZ2h0XG5cblx0XHRcdH0sIHRoaXMuY2FsY3VsYXRlSGFuZGxlU2l6ZShpbm5lcldpZHRoLCBpbm5lckhlaWdodCkpO1xuXG5cdFx0fSxcblxuXHRcdHJlZnJlc2hIYW5kbGVzOiBmdW5jdGlvbihoYW5kbGVTaXplWCwgaGFuZGxlU2l6ZVkpIHtcblxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3BbMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplWCArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4JztcblxuXHRcdH0sXG5cblx0XHRyZWZyZXNoQ2FwdGlvbnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgb2Zmc2V0ID0geyBsZWZ0OiB0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldExlZnQsIHRvcDogdGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRUb3AgfTtcblxuXHRcdFx0Ly8gY2FwdGlvbnNcblx0XHRcdHZhciBoaXRzUmlnaHRFZGdlLCBoaXRzTGVmdEVkZ2U7XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1sZWZ0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5MZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLXJpZ2h0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5SaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wLmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tdG9wOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5Ub3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWJvdHRvbTogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luQm90dG9tJyk7XG5cblx0XHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAtIDgwIDwgMCk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdFtoaXRzTGVmdEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5SaWdodCA9IHRoaXMucGFkZGluZ0xlZnQgKyB0aGlzLm1hcmdpbkxlZnQgKyAoaGl0c0xlZnRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpbkxlZnQub2Zmc2V0V2lkdGgtMTcgOiAxNCkgKyAncHgnO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IHRoaXMucGFkZGluZ1JpZ2h0ICsgdGhpcy5tYXJnaW5SaWdodCArIChoaXRzUmlnaHRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0Lm9mZnNldFdpZHRoLTE3IDogMTQpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLmJvdHRvbSA9IC10aGlzLm1hcmdpbkJvdHRvbSAtdGhpcy5wYWRkaW5nQm90dG9tIC0yNCArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUudG9wID0gLXRoaXMubWFyZ2luVG9wIC10aGlzLnBhZGRpbmdUb3AgLTI0ICsgJ3B4JztcblxuXHRcdH0sXG5cblx0XHRnZXRDYXB0aW9uUHJvcGVydHk6IGZ1bmN0aW9uKGNzc1Byb3BlcnR5KSB7XG5cblx0XHRcdC8vIGNoZWNrIGluIGlubGluZSBzdHlsZXNcblx0XHRcdGlmKHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRFbGVtZW50LnN0eWxlW2Nzc1Byb3BlcnR5XS5yZXBsYWNlKC8oZW18cHgpLywgJ+KAiTxzcGFuPiQxPC9zcGFuPicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjaGVjayBpbiBydWxlc1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkUnVsZXNbaV0uc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHJldFZhbCA9ICcnO1xuXG5cdFx0XHRpZihjc3NQcm9wZXJ0eS5pbmRleE9mKCdtYXJnaW4nKSA+IC0xIHx8IGNzc1Byb3BlcnR5LmluZGV4T2YoJ3BhZGRpbmcnKSA+IC0xKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXNbY3NzUHJvcGVydHldO1xuXHRcdFx0fSBlbHNlIGlmKGNzc1Byb3BlcnR5ID09PSAnaGVpZ2h0Jykge1xuXHRcdFx0XHRyZXRWYWwgPSB0aGlzLmlubmVySGVpZ2h0O1xuXHRcdFx0fSBlbHNlIGlmKGNzc1Byb3BlcnR5ID09PSAnd2lkdGgnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJXaWR0aDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaW1wbGljaXQgdmFsdWVcblx0XHRcdHJldHVybiAnKCcgKyByZXRWYWwgKyAn4oCJPHNwYW4+cHg8L3NwYW4+KSc7XG5cblx0XHR9LFxuXG5cdFx0YWN0aXZhdGU6IGZ1bmN0aW9uKG5ld0VsZW0pIHtcblxuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG5ld0VsZW07XG5cdFx0XHR0aGlzLmNvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHQvLyBpbml0aWFsIGhvdmVyXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0dGhpcy5vdmVyID0gdHJ1ZTtcblxuXHRcdFx0aWYodGhpcy5jb21wdXRlZFN0eWxlLmRpc3BsYXkgPT09ICdpbmxpbmUnKSB7XG5cdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5saW5lJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLWlubGluZScpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBoaWRlIHRoZSBob3ZlciBnaG9zdCBmb3IgaW5zcGVjdGlvblxuXHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cblx0XHRcdC8vIGZpbmQgbWF0Y2hpbmcgcnVsZXNcblx0XHRcdHRoaXMubWF0Y2hlZFJ1bGVzID0gU3R5bGVQYXJzZXIucmVzb2x2ZSh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdFx0Ly8gZXhlY3V0ZSBwbHVnaW5zXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2FjdGl2YXRlJyk7XG5cblx0XHRcdC8vIHJlbGF5b3V0XG5cdFx0XHR0aGlzLnJlbGF5b3V0KCk7XG5cblx0XHR9LFxuXG5cdFx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmKHRoaXMuc2VsZWN0ZWRSdWxlKSB7XG5cdFx0XHRcdHRoaXMuZXhpdFJ1bGVNb2RlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInLCAnaG92ZXItbWFyZ2luJywgJ2hpZGRlbicpO1xuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG5cdFx0XHQvLyBleGVjdXRlIHBsdWdpbnNcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignZGVhY3RpdmF0ZScpO1xuXG5cdFx0XHR0aGlzLm92ZXIgPSBmYWxzZTtcblx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyQ29tbWFuZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG51bGw7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBGdW5jdGlvbnMgcmVsYXRlZCB0byBydWxlLWJhc2VkIGVkaXRpbmdcblx0XHQgKi9cblxuXHRcdGVudGVyUnVsZU1vZGU6IGZ1bmN0aW9uKGNzc1J1bGUsIGluZGV4KSB7XG5cblx0XHRcdC8vIGlmIHNlbGVjdGVkUnVsZSBhbmQgbmV3IGNzc1J1bGUgYXJlIHRoZSBzYW1lLCBkb24ndCBkbyBhbnl0aGluZ1xuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUgPT09IGNzc1J1bGUpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiBzZWxlY3RlZFJ1bGUgd2Fzbid0IGVtcHR5LCB3ZSBzaW1wbHkgY2hhbmdlIHRoZSBydWxlXG5cdFx0XHRpZih0aGlzLnNlbGVjdGVkUnVsZSkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGVkUnVsZSA9IGNzc1J1bGU7XG5cdFx0XHRcdHRoaXMuY2FsbFBsdWdpbignY2hhbmdlUnVsZScsIGluZGV4KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gY3NzUnVsZTtcblx0XHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdlbnRlclJ1bGUnLCBpbmRleCk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0ZXhpdFJ1bGVNb2RlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignZXhpdFJ1bGUnKTtcblx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDtcblx0XHR9LFxuXG5cdFx0c2VsZWN0UnVsZTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHR0aGlzLmVudGVyUnVsZU1vZGUodGhpcy5tYXRjaGVkUnVsZXNbaV0sIGkpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBubyBydWxlIG1hdGNoaW5nPyBleGl0IHJ1bGUgbW9kZSB0aGVuXG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXG5cdFx0fSxcblxuXHRcdGRlc2VsZWN0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXHRcdH0sXG5cblx0XHQvKiBcblx0XHQgKiBmdW5jdGlvbnMgdG8gdGVtcG9yYXJpbHkgZGlzYWJsZVxuXHRcdCAqIGxheW91dCBtb2RlLCBpLmUuIGZvciBwcmV2aWV3aW5nLlxuXHRcdCAqL1xuXG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuaGlkZGVuID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXIgPSB0aGlzLl9fbGFzdE92ZXI7XG5cblx0XHRcdGlmKHRoaXMub3ZlcikgdGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luKSB0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLW1hcmdpbicpO1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuXG5cdFx0XHQvLyBlZGdlIGNhc2U6IHVzZXIgaG9sZHMgY29tbWFuZCwgbW92ZXMgb3V0LCByZWxlYXNlcyBjb21tYW5kXG5cdFx0XHRpZih0aGlzLl9fbGFzdE1vdXNlTW92ZUV2ZW50KVxuXHRcdFx0XHR0aGlzLnByb2Nlc3NPdmVyTG9naWModGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudCk7XG5cblx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG5cblx0XHRcdHRoaXMuY2FsbFBsdWdpbignc2hvdycpO1xuXG5cdFx0fSxcblxuXHRcdGhpZGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmhpZGRlbiA9IHRydWU7XG5cdFx0XHR0aGlzLl9fbGFzdE92ZXIgPSB0aGlzLm92ZXI7XG5cdFx0XHR0aGlzLm92ZXIgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdob3Zlci1tYXJnaW4nKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2hpZGUnKTtcblxuXHRcdH1cblxuXG5cdH0pO1xuXG5cdC8vIENyZWF0ZSBMYXlvdXQgTW9kZSAoc2luZ2xldG9uKVxuXHR3aW5kb3cuTGF5b3V0TW9kZSA9IG5ldyBMYXlvdXRNb2RlKCk7XG5cbn0pKCk7XG5cblxuIiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMudGl0bGVCb3ggPSAkKCc8ZGl2IGNsYXNzPVwib3ZlcmxheS10aXRsZVwiPjxkaXYgY2xhc3M9XCJ0aXRsZS1ydWxlXCI+PHNwYW4gY2xhc3M9XCJzZWxlY3RlZFwiPmlubGluZSBzdHlsZTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJ0b2dnbGVcIj7ilr48L3NwYW4+PHVsIGNsYXNzPVwiZHJvcGRvd25cIj48bGk+aW5saW5lIHN0eWxlPC9saT48L3VsPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXRsZS1wcm9wb3J0aW9uc1wiPjEwMCB4IDEwMDwvZGl2PjwvZGl2PicpXG5cdFx0XHQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSlbMF07XG5cblx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMgPSAkKCcudGl0bGUtcHJvcG9ydGlvbnMnLCB0aGlzLnRpdGxlQm94KVswXTtcblx0XHR0aGlzLnRpdGxlRHJvcGRvd24gPSAkKCcuZHJvcGRvd24nLCB0aGlzLnRpdGxlQm94KTtcblxuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIGluaXRpYWxpemUgdGl0bGUgYm94IGJlaGF2aW91clxuXHRcdHZhciB0aXRsZUJveCA9IHRoaXMudGl0bGVCb3g7XG5cdFx0dmFyIHRpdGxlRHJvcGRvd24gPSB0aGlzLnRpdGxlRHJvcGRvd247XG5cblx0XHQkKCdzcGFuJywgdGl0bGVCb3gpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLmRyb3Bkb3duJywgdGl0bGVCb3gpLnRvZ2dsZSgpO1xuXHRcdH0pO1xuXG5cblx0XHR0aXRsZURyb3Bkb3duLm9uKCdjbGljaycsICdsaScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGl0bGVEcm9wZG93bi5oaWRlKCk7XG5cdFx0XHQkKCcuc2VsZWN0ZWQnLCB0aXRsZUJveCkuaHRtbCh0aGlzLmlubmVySFRNTCk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmZpbGxSdWxlcygpO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHQkKCdzcGFuJywgdGhpcy50aXRsZUJveCkub2ZmKCdjbGljaycpO1xuXHRcdCQoJ3NwYW4nLCB0aGlzLnRpdGxlRHJvcGRvd24pLm9mZignY2xpY2snKTtcblx0fSxcblxuXHRlbnRlclJ1bGU6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dGhpcy50aXRsZUJveC5jbGFzc0xpc3QuYWRkKCdydWxlJyk7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5zdHlsZS56SW5kZXggPSAxMDAwMjtcblx0XHR0aGlzLmNoYW5nZVJ1bGUoaW5kZXgpO1xuXHR9LFxuXG5cdGNoYW5nZVJ1bGU6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dGhpcy50aXRsZURyb3Bkb3duLmZpbmQoJ2xpOmVxKCcgKyAoaW5kZXggKyAxKSArICcpJykuY2xpY2soKTtcblx0fSxcblxuXHRleGl0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0JCgnc3Bhbi5zZWxlY3RlZCcsIHRoaXMudGl0bGVCb3gpLmh0bWwoJ2lubGluZSBzdHlsZScpO1xuXHRcdHRoaXMudGl0bGVCb3guY2xhc3NMaXN0LnJlbW92ZSgncnVsZScpO1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuc3R5bGUuekluZGV4ID0gJyc7XG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKHByb3BzKSB7XG5cblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0Ly8gcGxhY2UgdGl0bGUgYm94XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChvZmZzZXQubGVmdCArICgocHJvcHMub3V0ZXJXaWR0aCAtIHRoaXMudGl0bGVCb3gub2Zmc2V0V2lkdGgpIC8gMikpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgLSBwcm9wcy5tYXJnaW5Ub3AgLSA1NSkgKyAncHgpJztcblx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMuaW5uZXJIVE1MID0gcHJvcHMub3V0ZXJXaWR0aCArICcgeCAnICsgcHJvcHMub3V0ZXJIZWlnaHQ7XG5cblx0fSxcblxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAxO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudGl0bGVCb3guc3R5bGUub3BhY2l0eSA9IDA7XG5cdH0sXG5cblx0LyogbWVtYmVyIGZ1bmN0aW9ucyAqL1xuXG5cdGZpbGxSdWxlczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgcmVzb2x2ZWQgPSBMYXlvdXRNb2RlLm1hdGNoZWRSdWxlcztcblxuXHRcdHRoaXMudGl0bGVEcm9wZG93bi5lbXB0eSgpO1xuXHRcdCQoJzxsaT5pbmxpbmUgc3R5bGU8L2xpPicpLmFwcGVuZFRvKHRoaXMudGl0bGVEcm9wZG93bik7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNvbHZlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0JCgnPGxpPicgKyByZXNvbHZlZFtpXS5zZWxlY3RvclRleHQgKyAnPC9saT4nKVxuXHRcdFx0XHQuZGF0YSgnY3NzUnVsZScsIHJlc29sdmVkW2ldKVxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy50aXRsZURyb3Bkb3duKTtcblx0XHR9XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG92ZXJsYXkgPSBMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50O1xuXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtbWFyZ2luLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtbWFyZ2luLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cdFx0dGhpcy5ndWlkZU1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cblx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtcGFkZGluZy1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtcGFkZGluZy1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKHByb3BzKSB7XG5cblx0XHQvLyBwYWRkaW5nIGd1aWRlc1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtcHJvcHMub2Zmc2V0LnRvcCAtcHJvcHMucGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUubGVmdCA9IC1wcm9wcy5wYWRkaW5nTGVmdCArICdweCc7XG5cblx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1wcm9wcy5vZmZzZXQudG9wIC1wcm9wcy5wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0LnN0eWxlLnJpZ2h0ID0gLXByb3BzLnBhZGRpbmdSaWdodC0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcHJvcHMub2Zmc2V0LmxlZnQgLXByb3BzLnBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUuYm90dG9tID0gLXByb3BzLnBhZGRpbmdCb3R0b20tMSArICdweCc7XG5cblx0XHR0aGlzLmd1aWRlUGFkZGluZ1RvcC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXByb3BzLm9mZnNldC5sZWZ0IC1wcm9wcy5wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLnRvcCA9IC1wcm9wcy5wYWRkaW5nVG9wLTEgKyAncHgnO1xuXG5cdFx0Ly8gbWFyZ2luIGd1aWRlc1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1wcm9wcy5vZmZzZXQudG9wIC1wcm9wcy5wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUubGVmdCA9IC1wcm9wcy5wYWRkaW5nTGVmdCAtcHJvcHMubWFyZ2luTGVmdCArICdweCc7XG5cblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpblJpZ2h0LnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpblJpZ2h0LnN0eWxlLnJpZ2h0ID0gLXByb3BzLnBhZGRpbmdSaWdodCAtcHJvcHMubWFyZ2luUmlnaHQgLSAxICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUuYm90dG9tID0gLXByb3BzLnBhZGRpbmdCb3R0b20gLXByb3BzLm1hcmdpbkJvdHRvbSAtMSArICdweCc7XG5cblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcHJvcHMub2Zmc2V0LmxlZnQgLXByb3BzLnBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpblRvcC5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLnRvcCA9IC1wcm9wcy5wYWRkaW5nVG9wIC1wcm9wcy5tYXJnaW5Ub3AgLTEgKyAncHgnO1xuXG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cblx0fSxcblxuXHRlbnRlclJ1bGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY3JlYXRlR2hvc3RzKCk7XG5cdH0sXG5cblx0Y2hhbmdlUnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5kZXN0cm95R2hvc3RzKCk7XG5cdFx0dGhpcy5jcmVhdGVHaG9zdHMoKTtcblx0fSxcblxuXHRleGl0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5kZXN0cm95R2hvc3RzKCk7XG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudXBkYXRlR2hvc3RzKCk7XG5cdH0sXG5cblx0LyogbWVtYmVyIGZ1bmN0aW9ucyAqL1xuXG5cdGdob3N0czogW10sXG5cblx0Y3JlYXRlR2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZ2hvc3RzID0gdGhpcy5naG9zdHM7XG5cdFx0JChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZS5zZWxlY3RvclRleHQpLm5vdChMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5ub3QoJy5vdmVybGF5LCAub3ZlcmxheSAqJykuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHZhciBnaG9zdCA9IG5ldyBHaG9zdCh0aGlzKTtcblx0XHRcdGdob3N0LnJlbGF5b3V0KCk7XG5cdFx0XHRnaG9zdHMucHVzaChnaG9zdCk7XG5cdFx0fSk7XG5cdH0sXG5cblx0ZGVzdHJveUdob3N0czogZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdob3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5naG9zdHNbaV0uZGVzdHJveSgpO1xuXHRcdH1cblx0XHR0aGlzLmdob3N0cyA9IFtdO1xuXHR9LFxuXG5cdHVwZGF0ZUdob3N0czogZnVuY3Rpb24oKSB7XG5cdFx0aWYoIXRoaXMuZ2hvc3RzKSByZXR1cm47XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdob3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5naG9zdHNbaV0ucmVsYXlvdXQoKTtcblx0XHR9XHRcdFxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdjb250ZW50RWRpdGFibGUnLCB0cnVlKTtcblx0XHRMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LnN0eWxlLm91dGxpbmUgPSAnbm9uZSc7XG5cblx0XHRMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LmZvY3VzKCk7XG5cblx0XHQkKGRvY3VtZW50KS5vbigna2V5dXAnLCB0aGlzLmtleXVwKTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScpO1xuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICcnO1xuXG5cdFx0JChkb2N1bWVudCkub2ZmKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuXG5cdH0sXG5cblx0LyogbWVtYmVyIGZ1bmN0aW9ucyAqL1xuXG5cdGtleXVwOiBmdW5jdGlvbigpIHtcblx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdCQoZG9jdW1lbnQpXG5cdFx0XHQub24oJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSA9PT0gOTEpIHsgLy8gY21kIGtleVxuXHRcdFx0XHRcdHRoYXQuZW5hYmxlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRpZihlLmtleUNvZGUgPT09IDkxKSB7IC8vIGNtZCBrZXlcblx0XHRcdFx0XHR0aGF0LmRpc2FibGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRpc2FibGUoKTtcblx0fSxcblxuXHRob3ZlclRhcmdldENoYW5nZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0aWYodGhpcy5lbmFibGVkKVxuXHRcdFx0dGhpcy5wcm9jZXNzQ29tbWFuZE92ZXJMb2dpYyhlKTtcblxuXHRcdC8vIGlmIHdlJ3JlIGhvbGRpbmcgc2hpZnQgYW5kIGhvdmVyIGFub3RoZXIgZWxlbWVudCwgc2hvdyBndWlkZXNcblx0XHRpZih0aGlzLmVuYWJsZWQgJiZcblx0XHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdExheW91dE1vZGUuaG92ZXJFbGVtZW50ICE9PSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50ICYmXG5cdFx0XHQhJC5jb250YWlucyhMYXlvdXRNb2RlLmhvdmVyRWxlbWVudCwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuY3VycmVudEVsZW1lbnQsIExheW91dE1vZGUuaG92ZXJFbGVtZW50KVxuXHRcdCkge1xuXHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvKExheW91dE1vZGUuaG92ZXJFbGVtZW50KTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0ZW5hYmxlOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0XHRMYXlvdXRNb2RlLmhpZGUoKTtcblxuXHRcdC8vTGF5b3V0TW9kZS5vdmVyID0gZmFsc2U7XG5cblx0XHQvLyBwcm9jZXNzIG92ZXIgbG9naWMgb25jZVxuXHRcdGlmKExheW91dE1vZGUuX19sYXN0TW91c2VNb3ZlRXZlbnQpXG5cdFx0XHR0aGlzLnByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljKExheW91dE1vZGUuX19sYXN0TW91c2VNb3ZlRXZlbnQpO1xuXG5cdFx0Ly8gdmlzdWFsaXplIHJpZ2h0IGF3YXkgd2l0aCB3aGF0IHdlIHByZXZpb3VzbHkgaG92ZXJlZFxuXHRcdGlmKExheW91dE1vZGUuaG92ZXJFbGVtZW50ICE9PSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50ICYmXG5cdFx0XHQhJC5jb250YWlucyhMYXlvdXRNb2RlLmhvdmVyRWxlbWVudCwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuY3VycmVudEVsZW1lbnQsIExheW91dE1vZGUuaG92ZXJFbGVtZW50KVxuXHRcdCkge1xuXHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvKExheW91dE1vZGUuaG92ZXJFbGVtZW50KTtcblx0XHR9XG5cblx0fSxcblxuXHRkaXNhYmxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLmNvbW1hbmRPdmVyID0gZmFsc2U7XG5cdFx0aWYodGhpcy52TGluZVgpIHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdGlmKHRoaXMudkxpbmVZKSB0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHRMYXlvdXRNb2RlLnNob3coKTtcblx0fSxcblxuXHRwcm9jZXNzQ29tbWFuZE92ZXJMb2dpYzogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIGV4dHJhTWFyZ2luID0gMTA7XG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIGNvbW1hbmQgb3Zlci9vdXRcblxuXHRcdGlmKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gTGF5b3V0TW9kZS5tYXJnaW5MZWZ0IC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gTGF5b3V0TW9kZS5tYXJnaW5Ub3AgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCArIExheW91dE1vZGUubWFyZ2luUmlnaHQgKyBleHRyYU1hcmdpbikgJiZcblx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgKyBMYXlvdXRNb2RlLm1hcmdpbkJvdHRvbSArIGV4dHJhTWFyZ2luKVxuXHRcdCkge1xuXG5cdFx0XHRpZighdGhpcy5jb21tYW5kT3Zlcikge1xuXHRcdFx0XHR0aGlzLmNvbW1hbmRPdmVyID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvV2luZG93KCk7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZih0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdHRoaXMuY29tbWFuZE92ZXIgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG5cdGNyZWF0ZVZpc3VhbGl6YXRpb25MaW5lczogZnVuY3Rpb24oKSB7XG5cblx0XHRpZighdGhpcy52TGluZVgpIHtcblx0XHRcdHRoaXMudkxpbmVYID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWC5jbGFzc05hbWUgPSAndmxpbmUteCc7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudkxpbmVYKTtcblxuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWENhcHRpb24uY2xhc3NOYW1lID0gJ2NhcHRpb24nO1xuXHRcdFx0dGhpcy52TGluZVguYXBwZW5kQ2hpbGQodGhpcy52TGluZVhDYXB0aW9uKTtcblxuXHRcdFx0dGhpcy52TGluZVhDcm9zc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5jbGFzc05hbWUgPSAnY3Jvc3NiYXInO1xuXHRcdFx0dGhpcy52TGluZVguYXBwZW5kQ2hpbGQodGhpcy52TGluZVhDcm9zc0Jhcik7XG5cdFx0fVxuXG5cdFx0aWYoIXRoaXMudkxpbmVZKSB7XG5cdFx0XHR0aGlzLnZMaW5lWSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVkuY2xhc3NOYW1lID0gJ3ZsaW5lLXknO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWSk7XG5cblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVlDYXB0aW9uLmNsYXNzTmFtZSA9ICdjYXB0aW9uJztcblx0XHRcdHRoaXMudkxpbmVZLmFwcGVuZENoaWxkKHRoaXMudkxpbmVZQ2FwdGlvbik7XG5cblx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuY2xhc3NOYW1lID0gJ2Nyb3NzYmFyJztcblx0XHRcdHRoaXMudkxpbmVZLmFwcGVuZENoaWxkKHRoaXMudkxpbmVZQ3Jvc3NCYXIpO1xuXHRcdH1cblxuXHR9LFxuXG5cdHZpc3VhbGl6ZVJlbGF0aW9uVG9XaW5kb3c6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGN1cnJlbnRFbGVtZW50ID0gTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudDtcblxuXHRcdHRoaXMuY3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzKCk7XG5cblx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSAoTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LnRvcCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSkgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVYLnN0eWxlLmxlZnQgPSAwICsgJ3B4Jztcblx0XHR0aGlzLnZMaW5lWC5zdHlsZS53aWR0aCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldC5sZWZ0ICsgJ3B4Jztcblx0XHR0aGlzLnZMaW5lWENhcHRpb24uaW5uZXJIVE1MID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LmxlZnQgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdHRoaXMudkxpbmVZLnN0eWxlLmxlZnQgPSAoTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LmxlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSkgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVZLnN0eWxlLnRvcCA9IDAgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldC50b3AgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQudG9wICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0fSxcblxuXHR2aXN1YWxpemVSZWxhdGlvblRvOiBmdW5jdGlvbihyZWxhdGVkRWxlbWVudCkge1xuXG5cdFx0dmFyIGN1cnJlbnRFbGVtZW50ID0gTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCwgdG9wLCBsZWZ0O1xuXHRcdHZhciBjdXJyZW50T2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXHRcdHZhciByZWxhdGVkT2Zmc2V0ID0gJChyZWxhdGVkRWxlbWVudCkub2Zmc2V0KCk7XG5cblx0XHR0aGlzLmNyZWF0ZVZpc3VhbGl6YXRpb25MaW5lcygpO1xuXG5cdFx0dmFyIHJlUmlnaHRFZGdlID0gcmVsYXRlZE9mZnNldC5sZWZ0ICsgcmVsYXRlZEVsZW1lbnQub2Zmc2V0V2lkdGg7XG5cdFx0dmFyIGNlUmlnaHRFZGdlID0gY3VycmVudE9mZnNldC5sZWZ0ICsgY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XG5cdFx0dmFyIHJlTGVmdEVkZ2UgPSByZWxhdGVkT2Zmc2V0LmxlZnQ7XG5cdFx0dmFyIGNlTGVmdEVkZ2UgPSBjdXJyZW50T2Zmc2V0LmxlZnQ7XG5cblx0XHR2YXIgcmVCb3R0b21FZGdlID0gcmVsYXRlZE9mZnNldC50b3AgKyByZWxhdGVkRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cdFx0dmFyIGNlQm90dG9tRWRnZSA9IGN1cnJlbnRPZmZzZXQudG9wICsgY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXHRcdHZhciByZVRvcEVkZ2UgPSByZWxhdGVkT2Zmc2V0LnRvcDtcblx0XHR2YXIgY2VUb3BFZGdlID0gY3VycmVudE9mZnNldC50b3A7XG5cdFx0XG5cdFx0Ly8gaG9yaXpvbnRhbCBjb25uZWN0aW9uXG5cdFx0aWYocmVSaWdodEVkZ2UgPCBjZUxlZnRFZGdlKSB7XG5cblx0XHRcdHRvcCA9IGN1cnJlbnRPZmZzZXQudG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IHJlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSBjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVCb3R0b21FZGdlIDwgdG9wKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAoY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2UgaWYodG9wIDwgcmVUb3BFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAocmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYoY2VSaWdodEVkZ2UgPCByZUxlZnRFZGdlKSB7XG5cblx0XHRcdHRvcCA9IGN1cnJlbnRPZmZzZXQudG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IGNlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gcmVMZWZ0RWRnZSAtIGNlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSByZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVCb3R0b21FZGdlIDwgdG9wKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKGNlVG9wRWRnZSAtIHJlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIGlmKHRvcCA8IHJlVG9wRWRnZSkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMTAwJSc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChyZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHR9XG5cblx0XHQvLyB2ZXJ0aWNhbCBjb25uZWN0aW9uXG5cdFx0aWYocmVCb3R0b21FZGdlIDwgY2VUb3BFZGdlKSB7XG5cblx0XHRcdGxlZnQgPSBjdXJyZW50T2Zmc2V0LmxlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKTtcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gcmVCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IGNlVG9wRWRnZSAtIHJlQm90dG9tRWRnZSArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uaW5uZXJIVE1MID0gY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdGlmKHJlUmlnaHRFZGdlIDwgbGVmdCkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIGlmKGxlZnQgPCByZUxlZnRFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAocmVMZWZ0RWRnZSAtIGNlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYoY2VCb3R0b21FZGdlIDwgcmVUb3BFZGdlKSB7XG5cblx0XHRcdGxlZnQgPSBjdXJyZW50T2Zmc2V0LmxlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKTtcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gY2VCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uaW5uZXJIVE1MID0gcmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdGlmKHJlUmlnaHRFZGdlIDwgbGVmdCkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSBpZihsZWZ0IDwgcmVMZWZ0RWRnZSkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChyZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHR9XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5oYW5kbGVIZWlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtc2l6ZVwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgaGVpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVXaWR0aCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgcmlnaHQgaGFuZGxlLXNpemVcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIHdpZHRoXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cblx0XHR0aGlzLmNhcHRpb25XaWR0aCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24td2lkdGhcIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHR0aGlzLmNhcHRpb25IZWlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLWhlaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0dGhpcy5pbml0RHJhZ2dlcnMoKTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3ZlcklubmVyID0gZmFsc2U7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbm5lcicpO1xuXHR9LFxuXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKHRoaXMub3ZlcklubmVyKSBMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLWlubmVyJyk7XG5cdH0sXG5cblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbm5lcicpO1xuXHR9LFxuXG5cdG1vdXNlbW92ZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIG92ZXIgaW5uZXIgYm94XG5cdFx0aWYoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICYmXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCAmJlxuXHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAtIExheW91dE1vZGUucGFkZGluZ1JpZ2h0KSAmJlxuXHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAtIExheW91dE1vZGUucGFkZGluZ0JvdHRvbSlcblx0XHQpIHtcblx0XHRcdGlmKCF0aGlzLm92ZXJJbm5lcikge1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLWlubmVyJyk7XG5cdFx0XHRcdHRoaXMub3ZlcklubmVyID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVySW5uZXIpIHtcblx0XHRcdFx0dGhpcy5vdmVySW5uZXIgPSBmYWxzZTtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbm5lcicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMucHJvY2Vzc092ZXJXaWR0aChlKTtcblx0XHR0aGlzLnByb2Nlc3NPdmVySGVpZ2h0KGUpO1xuXG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKHByb3BzLCBoYW5kbGVTaXplKSB7XG5cblx0XHR0aGlzLmhhbmRsZVdpZHRoWzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemUueSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVIZWlnaHRbMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplLnggKyAncHgnO1xuXG5cdFx0dGhpcy5oYW5kbGVXaWR0aFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAocHJvcHMucGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemUueSAvIDQpICogcHJvcHMucGFkZGluZ1JpZ2h0KSAvIDUpIC0gKGhhbmRsZVNpemUueSAqIDEuNSkpIDogLShoYW5kbGVTaXplLnkgLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHR0aGlzLmNhcHRpb25XaWR0aC5zdHlsZS5tYXJnaW5Ub3AgPSAocHJvcHMucGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemUueSAvIDQpICogcHJvcHMucGFkZGluZ1JpZ2h0KSAvIDUpIC0gKGhhbmRsZVNpemUueSAqIDEuNSkpIDogLTgpICsgJ3B4JztcblxuXHRcdHRoaXMuaGFuZGxlSGVpZ2h0WzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMucGFkZGluZ0JvdHRvbSA8IDIwID8gKCsoKChoYW5kbGVTaXplLnggLyA0KSAqIHByb3BzLnBhZGRpbmdCb3R0b20pIC8gNSkgLSAoaGFuZGxlU2l6ZS54ICogMS41KSkgOiAtKGhhbmRsZVNpemUueCAvIDIpKSArICdweCc7XG5cdFx0dGhpcy5jYXB0aW9uSGVpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMucGFkZGluZ0JvdHRvbSA8IDIwID8gKChoYW5kbGVTaXplLnggKiAocHJvcHMucGFkZGluZ0JvdHRvbSAvIDIwKSkgLSBoYW5kbGVTaXplLnggKiAyICsgaGFuZGxlU2l6ZS54IC0gOSkgOiAtMTApICsgJ3B4JztcblxuXHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0cHJvY2Vzc092ZXJXaWR0aDogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIG92ZXIgcmlnaHQgc2lkZVxuXHRcdGlmKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCArIExheW91dE1vZGUuaW5uZXJXaWR0aCAtIDEwICYmXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCAmJlxuXHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAtIExheW91dE1vZGUucGFkZGluZ1JpZ2h0KSAmJlxuXHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAtIExheW91dE1vZGUucGFkZGluZ0JvdHRvbSlcblx0XHQpIHtcblxuXHRcdFx0aWYoIXRoaXMub3ZlcldpZHRoKSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2UtcmVzaXplJztcblx0XHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHR0aGlzLnJlZnJlc2hDYXB0aW9ucygpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNlbGVjdFJ1bGUoJ3dpZHRoJyk7XG5cdFx0XHRcdHRoaXMub3ZlcldpZHRoID0gdHJ1ZTtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYodGhpcy5vdmVyV2lkdGgpIHtcblx0XHRcdFx0dGhpcy5vdmVyV2lkdGggPSBmYWxzZTtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnJztcblx0XHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHR0aGlzLnJlZnJlc2hDYXB0aW9ucygpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLmRlc2VsZWN0UnVsZSgpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0cHJvY2Vzc092ZXJIZWlnaHQ6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdHZhciBvZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHQvLyBvdmVyIGJvdHRvbSBzaWRlXG5cdFx0aWYoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCArIExheW91dE1vZGUuaW5uZXJIZWlnaHQgLSAxMCAmJlxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCAmJlxuXHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAtIExheW91dE1vZGUucGFkZGluZ0JvdHRvbSkgJiZcblx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggLSBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodClcblx0XHQpIHtcblxuXHRcdFx0aWYoIXRoaXMub3ZlckhlaWdodCkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdzLXJlc2l6ZSc7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cdFx0XHRcdExheW91dE1vZGUuc2VsZWN0UnVsZSgnaGVpZ2h0Jyk7XG5cdFx0XHRcdHRoaXMub3ZlckhlaWdodCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZih0aGlzLm92ZXJIZWlnaHQpIHtcblx0XHRcdFx0dGhpcy5vdmVySGVpZ2h0ID0gZmFsc2U7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJyc7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSxcblxuXHRyZWZyZXNoQ2FwdGlvbnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblx0XHR2YXIgaGl0c1JpZ2h0RWRnZTtcblxuXHRcdGhpdHNSaWdodEVkZ2UgPSAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyA4MCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcblx0XHR0aGlzLmNhcHRpb25XaWR0aC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0dGhpcy5jYXB0aW9uV2lkdGguaW5uZXJIVE1MID0gJzxzcGFuPndpZHRoOiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCd3aWR0aCcpO1xuXHRcdHRoaXMuY2FwdGlvbldpZHRoLnN0eWxlLnJpZ2h0ID0gKGhpdHNSaWdodEVkZ2UgPyAxNiA6IC0odGhpcy5jYXB0aW9uV2lkdGgub2Zmc2V0V2lkdGggKyAxMykpICsgJ3B4JztcblxuXHRcdHRoaXMuY2FwdGlvbkhlaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+aGVpZ2h0OiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCdoZWlnaHQnKTtcblxuXHR9LFxuXG5cdGluaXREcmFnZ2VyczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIGlzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudDtcblxuXHRcdC8vIHdpZHRoXG5cdFx0JChkb2N1bWVudCkub24oaXNUb3VjaCA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0XHRpZih0aGF0Lm92ZXJXaWR0aCkge1xuXG5cdFx0XHRcdHZhciBzdGFydFdpZHRoID0gTGF5b3V0TW9kZS5pbm5lcldpZHRoO1xuXG5cdFx0XHRcdG5ldyBEcmFnZ2VyKGV2ZW50Lm9yaWdpbmFsRXZlbnQsIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbDogZmFsc2UsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gTGF5b3V0TW9kZS5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS53aWR0aCA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRXaWR0aCAtIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XHRcblxuXHRcdFx0fSBlbHNlIGlmKHRoYXQub3ZlckhlaWdodCkge1xuXG5cdFx0XHRcdHZhciBzdGFydEhlaWdodCA9IExheW91dE1vZGUuaW5uZXJIZWlnaHQ7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiB0cnVlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHQoTGF5b3V0TW9kZS5zZWxlY3RlZFJ1bGUgfHwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkuc3R5bGUuaGVpZ2h0ID0gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydEhlaWdodCAtIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy1yaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgdG9wIGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGxlZnQgaGFuZGxlLXBhZGRpbmdcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIHBhZGRpbmctbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlclRvcEhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJUb3BIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b20uaG92ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJCb3R0b21IYW5kbGUgPSB0cnVlO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyQm90dG9tSGFuZGxlID0gZmFsc2U7XG5cdFx0fSk7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlckxlZnRIYW5kbGUgPSB0cnVlO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyTGVmdEhhbmRsZSA9IGZhbHNlO1xuXHRcdH0pO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyUmlnaHRIYW5kbGUgPSB0cnVlO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyUmlnaHRIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblxuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHR0aGlzLmluaXREcmFnZ2VycygpO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItcGFkZGluZycpO1xuXHR9LFxuXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKHRoaXMub3ZlclBhZGRpbmcpIExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItcGFkZGluZycpO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItcGFkZGluZycpO1xuXHR9LFxuXG5cdG1vdXNlbW92ZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblx0XHR2YXIgd2lnZ2xlID0gNTtcblxuXHRcdHZhciBvdmVyTGluZVRvcCA9IChcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gNSAmJlxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyA1XG5cdFx0KTtcblxuXHRcdHZhciBvdmVyTGluZUJvdHRvbSA9IChcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0ICsgd2lnZ2xlXG5cdFx0KTtcblxuXHRcdHZhciBvdmVyTGluZUxlZnQgPSAoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSB3aWdnbGUgJiZcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIHdpZ2dsZVxuXHRcdCk7XG5cblx0XHR2YXIgb3ZlckxpbmVSaWdodCA9IChcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgd2lnZ2xlXG5cdFx0KTtcblxuXHRcdC8vIHRvcCBwYWRkaW5nIGJveFxuXHRcdHZhciBvdmVyUGFkZGluZ1RvcCA9IChcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCArIExheW91dE1vZGUucGFkZGluZ0xlZnQgJiYgLy9sZWZ0IHNpZGVcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIExheW91dE1vZGUucGFkZGluZ0xlZnQgKyBMYXlvdXRNb2RlLmlubmVyV2lkdGggJiYgLy8gcmlnaHQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgJiYgLy8gdG9wIHNpZGVcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5wYWRkaW5nVG9wIC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJUb3BIYW5kbGUgfHwgb3ZlckxpbmVUb3A7XG5cblx0XHQvLyBib3R0b20gcGFkZGluZyBib3hcblx0XHR2YXIgb3ZlclBhZGRpbmdCb3R0b20gPSAoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICYmIC8vbGVmdCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICsgTGF5b3V0TW9kZS5pbm5lcldpZHRoICYmIC8vIHJpZ2h0IHNpZGVcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAtIExheW91dE1vZGUucGFkZGluZ0JvdHRvbSAmJiAvLyB0b3Agc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0IC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJCb3R0b21IYW5kbGUgfHwgb3ZlckxpbmVCb3R0b207XG5cblx0XHQvLyBsZWZ0IHBhZGRpbmcgYm94XG5cdFx0dmFyIG92ZXJQYWRkaW5nTGVmdCA9IChcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5wYWRkaW5nVG9wICYmIC8vbGVmdCBzaWRlXG5cdFx0XHRlLnBhZ2VZIDwgb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCArIExheW91dE1vZGUuaW5uZXJIZWlnaHQgJiYgLy8gcmlnaHQgc2lkZVxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICYmIC8vIHRvcCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0IC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJMZWZ0SGFuZGxlIHx8IG92ZXJMaW5lTGVmdDtcblxuXHRcdC8vIHJpZ2h0IHBhZGRpbmcgYm94XG5cdFx0dmFyIG92ZXJQYWRkaW5nUmlnaHQgPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCAmJiAvL2xlZnQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLnBhZGRpbmdUb3AgKyBMYXlvdXRNb2RlLmlubmVySGVpZ2h0ICYmIC8vIHJpZ2h0IHNpZGVcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAtIExheW91dE1vZGUucGFkZGluZ1JpZ2h0ICYmIC8vIHRvcCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggLy8gYm90dG9tIHNpZGVcblx0XHQpIHx8IHRoaXMub3ZlclJpZ2h0SGFuZGxlIHx8IG92ZXJMaW5lUmlnaHQ7XG5cblx0XHQvLyBpZiBvdmVyIGFueSBwYWRkaW5nIGFyZWEsIHNob3cgcGFkZGluZyBoYW5kbGVzXG5cdFx0aWYoXG5cdFx0XHRvdmVyUGFkZGluZ1RvcCB8fFxuXHRcdFx0b3ZlclBhZGRpbmdCb3R0b20gfHxcblx0XHRcdG92ZXJQYWRkaW5nTGVmdCB8fFxuXHRcdFx0b3ZlclBhZGRpbmdSaWdodFxuXHRcdCkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmcpIHtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1wYWRkaW5nJyk7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJQYWRkaW5nKSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1wYWRkaW5nJyk7XHRcdFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBjdXJzb3JBZGRlZCA9IGZhbHNlO1xuXHRcdHZhciBjdXJzb3JSZW1vdmVkID0gZmFsc2U7XG5cblx0XHRpZihvdmVyUGFkZGluZ1RvcCkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmdUb3ApIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ1RvcCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3AuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICduLXJlc2l6ZSc7XG5cdFx0XHRcdGN1cnNvckFkZGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZ1RvcCkge1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nVG9wID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3AuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHRjdXJzb3JSZW1vdmVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZihvdmVyUGFkZGluZ0JvdHRvbSkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmdCb3R0b20pIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ0JvdHRvbSA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdzLXJlc2l6ZSc7XG5cdFx0XHRcdGN1cnNvckFkZGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZ0JvdHRvbSkge1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nQm90dG9tID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHRjdXJzb3JSZW1vdmVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZihvdmVyUGFkZGluZ0xlZnQpIHtcblx0XHRcdGlmKCF0aGlzLm92ZXJQYWRkaW5nTGVmdCkge1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nTGVmdCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAndy1yZXNpemUnO1xuXHRcdFx0XHRjdXJzb3JBZGRlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmdMZWZ0KSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdMZWZ0ID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYob3ZlclBhZGRpbmdSaWdodCkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmdSaWdodCkge1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nUmlnaHQgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdlLXJlc2l6ZSc7XG5cdFx0XHRcdGN1cnNvckFkZGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZ1JpZ2h0KSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdSaWdodCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHRjdXJzb3JSZW1vdmVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZighY3Vyc29yQWRkZWQgJiYgY3Vyc29yUmVtb3ZlZCkge1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnJztcblx0XHR9XG5cblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMsIGhhbmRsZVNpemUpIHtcblxuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0xlZnRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZS55ICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplLnkgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemUueCArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZS54ICsgJ3B4JztcblxuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0xlZnRbMF0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgLXByb3BzLnBhZGRpbmdMZWZ0ICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodFswXS5zdHlsZS5tYXJnaW5SaWdodCA9IC1wcm9wcy5wYWRkaW5nUmlnaHQgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArIC1wcm9wcy5wYWRkaW5nVG9wICsgJ3B4KSc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICAtcHJvcHMucGFkZGluZ0JvdHRvbSArICdweCc7XG5cblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLm1hcmdpblRvcCA9IC0oaGFuZGxlU2l6ZS55IC8gMikgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdLnN0eWxlLm1hcmdpblRvcCA9IC0oaGFuZGxlU2l6ZS55IC8gMikgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplLnggLyAyKSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKGhhbmRsZVNpemUueCAvIDIpICsgJ3B4JztcblxuXHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0cmVmcmVzaENhcHRpb25zOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBvZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHQvLyBjYXB0aW9uc1xuXHRcdHZhciBoaXRzUmlnaHRFZGdlLCBoaXRzTGVmdEVkZ2U7XG5cblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy1sZWZ0OiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCdwYWRkaW5nTGVmdCcpO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy1yaWdodDogPC9zcGFuPicgKyBMYXlvdXRNb2RlLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ1JpZ2h0Jyk7XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy10b3A6IDwvc3Bhbj4nICsgTGF5b3V0TW9kZS5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdUb3AnKTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tLmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLWJvdHRvbTogPC9zcGFuPicgKyBMYXlvdXRNb2RlLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ0JvdHRvbScpO1xuXG5cdFx0aGl0c0xlZnRFZGdlID0gKG9mZnNldC5sZWZ0IC0gODAgPCAwKTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3RbaGl0c0xlZnRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5zdHlsZS5tYXJnaW5SaWdodCA9IChoaXRzTGVmdEVkZ2UgPyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0IC0gdGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQub2Zmc2V0V2lkdGgtMTYgOiBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICsgMTQpICsgJ3B4JztcblxuXHRcdGhpdHNSaWdodEVkZ2UgPSAob2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggKyA4MCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5zdHlsZS5tYXJnaW5MZWZ0ID0gKGhpdHNSaWdodEVkZ2UgPyBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodCAtIHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5vZmZzZXRXaWR0aC0xNiA6IExheW91dE1vZGUucGFkZGluZ1JpZ2h0ICsgMTQpICsgJ3B4JztcblxuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uc3R5bGUuYm90dG9tID0gLShMYXlvdXRNb2RlLnBhZGRpbmdCb3R0b20gICsgMjQpICsgJ3B4Jztcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wLnN0eWxlLnRvcCA9IC0oTGF5b3V0TW9kZS5wYWRkaW5nVG9wICArIDI0KSArICdweCc7XG5cblx0fSxcblxuXHRpbml0RHJhZ2dlcnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHZhciBpc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQ7XG5cblx0XHQvLyBwYWRkaW5nIGJvdHRvbVxuXHRcdCQoZG9jdW1lbnQpLm9uKGlzVG91Y2ggPyAndG91Y2hzdGFydCcgOiAnbW91c2Vkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcblxuXHRcdFx0dmFyIHN0YXJ0UGFkZGluZ0JvdHRvbSxcblx0XHRcdFx0c3RhcnRQYWRkaW5nVG9wLFxuXHRcdFx0XHRzdGFydFBhZGRpbmdSaWdodCxcblx0XHRcdFx0c3RhcnRQYWRkaW5nTGVmdDtcblxuXHRcdFx0aWYodGhhdC5vdmVyUGFkZGluZ0JvdHRvbSkge1xuXG5cdFx0XHRcdHN0YXJ0UGFkZGluZ0JvdHRvbSA9IExheW91dE1vZGUucGFkZGluZ0JvdHRvbTtcblx0XHRcdFx0c3RhcnRQYWRkaW5nVG9wID0gTGF5b3V0TW9kZS5wYWRkaW5nVG9wO1xuXG5cdFx0XHRcdG5ldyBEcmFnZ2VyKGV2ZW50Lm9yaWdpbmFsRXZlbnQsIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbDogdHJ1ZSxcblx0XHRcdFx0XHRtb3ZlOiBmdW5jdGlvbihkZWx0YSkge1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSBMYXlvdXRNb2RlLnNoaWZ0UHJlc3NlZCA/IGRlbHRhIDogZGVsdGEgLyA0O1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0UGFkZGluZ0JvdHRvbSAtIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdUb3AgPSBMYXlvdXRNb2RlLmFsdFByZXNzZWQgPyBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0UGFkZGluZ0JvdHRvbSAtIGRlbHRhKSkgKyAncHgnIDogc3RhcnRQYWRkaW5nVG9wICsgJ3B4Jztcblx0XHRcdFx0XHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmKHRoYXQub3ZlclBhZGRpbmdUb3ApIHtcblxuXHRcdFx0XHRzdGFydFBhZGRpbmdUb3AgPSBMYXlvdXRNb2RlLnBhZGRpbmdUb3A7XG5cdFx0XHRcdHN0YXJ0UGFkZGluZ0JvdHRvbSA9IExheW91dE1vZGUucGFkZGluZ0JvdHRvbTtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IHRydWUsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gTGF5b3V0TW9kZS5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nVG9wID0gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydFBhZGRpbmdUb3AgKyBkZWx0YSkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nQm90dG9tID0gTGF5b3V0TW9kZS5hbHRQcmVzc2VkID8gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydFBhZGRpbmdUb3AgKyBkZWx0YSkpICsgJ3B4JyA6IHN0YXJ0UGFkZGluZ0JvdHRvbSArICdweCc7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGF0Lm92ZXJQYWRkaW5nUmlnaHQpIHtcblxuXHRcdFx0XHRzdGFydFBhZGRpbmdSaWdodCA9IExheW91dE1vZGUucGFkZGluZ1JpZ2h0O1xuXHRcdFx0XHRzdGFydFBhZGRpbmdMZWZ0ID0gTGF5b3V0TW9kZS5wYWRkaW5nTGVmdDtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IGZhbHNlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHQoTGF5b3V0TW9kZS5zZWxlY3RlZFJ1bGUgfHwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydFBhZGRpbmdSaWdodCAtIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdMZWZ0ID0gTGF5b3V0TW9kZS5hbHRQcmVzc2VkID8gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydFBhZGRpbmdSaWdodCAtIGRlbHRhKSkgKyAncHgnIDogc3RhcnRQYWRkaW5nTGVmdCArICdweCc7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGF0Lm92ZXJQYWRkaW5nTGVmdCkge1xuXG5cdFx0XHRcdHN0YXJ0UGFkZGluZ0xlZnQgPSBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0O1xuXHRcdFx0XHRzdGFydFBhZGRpbmdSaWdodCA9IExheW91dE1vZGUucGFkZGluZ1JpZ2h0O1xuXG5cdFx0XHRcdG5ldyBEcmFnZ2VyKGV2ZW50Lm9yaWdpbmFsRXZlbnQsIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbDogZmFsc2UsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gTGF5b3V0TW9kZS5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nTGVmdCA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRQYWRkaW5nTGVmdCArIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdSaWdodCA9IExheW91dE1vZGUuYWx0UHJlc3NlZCA/IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRQYWRkaW5nTGVmdCArIGRlbHRhKSkgKyAncHgnIDogc3RhcnRQYWRkaW5nUmlnaHQgKyAncHgnO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cbi8qXG5cdFx0XHQoZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nUmlnaHQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnZS1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJXaWR0aCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkud2lkdGgoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ1JpZ2h0ID0gdGhhdC5wYWRkaW5nUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi5sZWZ0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCh0aGlzLmN1cklubmVyV2lkdGggLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdSaWdodCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ1JpZ2h0ICsgKCh1aS5wb3NpdGlvbi5sZWZ0KSAtIHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nVG9wLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ24tcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC50b3A7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdUb3AgPSB0aGF0LnBhZGRpbmdUb3A7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC50b3AgLSB0aGlzLmN1ck9mZnNldCk7XG5cdFx0XHRcdFx0XHRkZWx0YSA9ICF0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdUb3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdUb3AgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3ctcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC5sZWZ0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nTGVmdCA9IHRoYXQucGFkZGluZ0xlZnQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQubGVmdCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gIXRoYXQuc2hpZnRQcmVzc2VkID8gTWF0aC5yb3VuZChkZWx0YSAvIDQpIDogZGVsdGE7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ0xlZnQgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdMZWZ0IC0gZGVsdGEpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XHRcdFx0XHRcblxuXHRcdFx0fSkoKTtcbiovXG5cblx0fVxuXG59KTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0TGF5b3V0TW9kZS5lbmFibGUoKTtcblxuXHQvLyQoJ3VsJykuc29ydGFibGUoKTtcblx0JCgnI3Rlc3Rib3gnKS5jbGljaygpO1xuXG59KSgpO1xuXG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==