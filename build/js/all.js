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

			this.options.move(moveby, event);

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
			var retVal, tmp;
			for (var i = 0; i < this.plugins.length; i++) {
				if(this.plugins[i][eventName]) {
					tmp = this.plugins[i][eventName].call(this.plugins[i], a, b, c, d, e, f);
					if(tmp !== undefined) {
						retVal = tmp;
					}
				}
			}
			return retVal;
		},

		sortPlugins: function() {
			this.plugins.sort(function(a, b) {
				return a.priority > b.priority;
			});
		},

		enable: function() {

			var that = this;

			// prioritize some plugins over others
			this.sortPlugins();

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

			document.body.appendChild(this.overlayElement);

		},

		/*
		 * Events & Behaviour initialization
		 */

		init: function() {

			this.initHover();

			var that = this;
			this.__keyup = function(e) {

				if(e.which === 16) {
					that.shiftPressed = false;
				}

				if(e.which === 18) {
					that.altPressed = false;
				}

				if(e.which === 17) {
					that.ctrlPressed = false;
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

				if(e.which === 17) {
					that.ctrlPressed = true;
				}

			};
			this.__resize = function() {
				window.LayoutMode.relayout();
			};

			$(document).on('keyup', this.__keyup);
			$(document).on('keydown', this.__keydown);
			$(window).on('resize', this.__resize);

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

			this.overlayElement.classList.remove('hover', 'hidden');
			this.overlayElement.style.display = 'none';

			// execute plugins
			this.callPlugin('deactivate');

			this.over = false;
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

			this.selectedProp = cssProperty;

			for (var i = 0; i < this.matchedRules.length; i++) {
				if(this.matchedRules[i].style[cssProperty]) {
					this.enterRuleMode(this.matchedRules[i], i);
					return;
				}
			}

			// no rule matching? exit rule mode then
			this.exitRuleMode();

		},

		deselectRule: function(cssProperty) {

			// don't do anything if in the meantime another rule was selected
			if(this.selectedProp !== cssProperty) {
				return;
			}

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

			this.overlayElement.classList.remove('hover');
			this.overlayElement.classList.add('hidden');
			this.hoverGhost.overlayElement.style.visibility = 'hidden';

			this.callPlugin('hide');

		},

		setLastActiveProperty: function(property) {
			this.lastActiveProperty = property;
		},

		changeValue: function(property, value, precision) {

			// if CTRL is pressed, force presision mode (disables snap)
			if(this.ctrlPressed) {
				precision = true;
			}

			value = Math.round(value);

			var pluginValue = this.callPlugin('changeValue', property, value, precision);
			if(pluginValue !== undefined) {
				value = pluginValue;
			}

			(this.selectedRule || this.currentElement).style[property] = Math.max(0, value) + 'px';

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
				LayoutMode.deselectRule('width');
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
				LayoutMode.deselectRule('height');
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
				LayoutMode.setLastActiveProperty('width');

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('width', startWidth - delta);
						LayoutMode.relayout();
					}
				});	

			} else if(that.overHeight) {

				var startHeight = LayoutMode.innerHeight;
				LayoutMode.setLastActiveProperty('height');

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('height', startHeight - delta);
						LayoutMode.relayout();
					}
				});

			}

		});

	}

});
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
				LayoutMode.setLastActiveProperty('paddingBottom');

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('paddingBottom', startPaddingBottom - delta);
						LayoutMode.changeValue('paddingTop', LayoutMode.altPressed ? startPaddingBottom - delta : startPaddingTop, true);
						LayoutMode.relayout();
					}
				});

			}

			if(that.overPaddingTop) {

				startPaddingTop = LayoutMode.paddingTop;
				startPaddingBottom = LayoutMode.paddingBottom;
				LayoutMode.setLastActiveProperty('paddingTop');

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('paddingTop', startPaddingTop + delta);
						LayoutMode.changeValue('paddingBottom', LayoutMode.altPressed ? startPaddingTop + delta : startPaddingBottom, true);
						LayoutMode.relayout();
					}
				});

			}

			if(that.overPaddingRight) {

				startPaddingRight = LayoutMode.paddingRight;
				startPaddingLeft = LayoutMode.paddingLeft;
				LayoutMode.setLastActiveProperty('paddingRight');

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('paddingRight', startPaddingRight - delta);
						LayoutMode.changeValue('paddingLeft', LayoutMode.altPressed ? (startPaddingRight - delta) : startPaddingLeft, true);
						LayoutMode.relayout();
					}
				});

			}

			if(that.overPaddingLeft) {

				startPaddingLeft = LayoutMode.paddingLeft;
				startPaddingRight = LayoutMode.paddingRight;
				LayoutMode.setLastActiveProperty('paddingLeft');

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						LayoutMode.changeValue('paddingLeft', startPaddingLeft + delta);
						LayoutMode.changeValue('paddingRight', LayoutMode.altPressed ? (startPaddingLeft + delta) : startPaddingRight, true);
						LayoutMode.relayout();
					}
				});

			}

		});

	}

});
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
LayoutMode.registerPlugin({

	create: function() {

		$(document).on('keydown', function(e) {

			if(!LayoutMode.lastActiveProperty) {
				return;
			}

			// up or down
			if(e.keyCode == 38 || e.keyCode == 40) {

				// temporarily select the last active rule
				LayoutMode.selectRule(LayoutMode.lastActiveProperty);

				switch(LayoutMode.lastActiveProperty) {
				case 'height':
					LayoutMode.changeValue('height', LayoutMode.innerHeight + (e.keyCode == 38 ? -1 : 1), true);
					break;
				case 'paddingBottom':
					LayoutMode.changeValue('paddingBottom', LayoutMode.paddingBottom + (e.keyCode == 38 ? -1 : 1), true);
					break;
				case 'marginBottom':
					LayoutMode.changeValue('marginBottom', LayoutMode.marginBottom + (e.keyCode == 38 ? -1 : 1), true);
					break;
				case 'paddingTop':
					LayoutMode.changeValue('paddingTop', LayoutMode.paddingTop + (e.keyCode == 38 ? 1 : -1), true);
					break;
				case 'marginTop':
					LayoutMode.changeValue('marginTop', LayoutMode.marginTop + (e.keyCode == 38 ? 1 : -1), true);
					break;
				}
				
				LayoutMode.relayout();

				// deselect again.
				// TODO: restore hover selection from modify plugins
				LayoutMode.deselectRule(LayoutMode.lastActiveProperty);

			}

			// left or right
			if(e.keyCode == 39 || e.keyCode == 37) {

				// temporarily select the last active rule
				LayoutMode.selectRule(LayoutMode.lastActiveProperty);

				switch(LayoutMode.lastActiveProperty) {
				case 'width':
					LayoutMode.changeValue('width', LayoutMode.innerWidth + (e.keyCode == 37 ? -1 : 1), true);
					break;
				case 'paddingRight':
					LayoutMode.changeValue('paddingRight', LayoutMode.paddingRight + (e.keyCode == 37 ? -1 : 1), true);
					break;
				case 'marginRight':
					LayoutMode.changeValue('marginRight', LayoutMode.marginRight + (e.keyCode == 37 ? -1 : 1), true);
					break;
				case 'paddingLeft':
					LayoutMode.changeValue('paddingLeft', LayoutMode.paddingLeft + (e.keyCode == 37 ? 1 : -1), true);
					break;
				case 'marginLeft':
					LayoutMode.changeValue('marginLeft', LayoutMode.marginLeft + (e.keyCode == 37 ? 1 : -1), true);
					break;
				}
				
				LayoutMode.relayout();

				// deselect again.
				// TODO: restore hover selection from modify plugins
				LayoutMode.deselectRule(LayoutMode.lastActiveProperty);

			}

		});

	}

});
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




(function() {

	LayoutMode.enable();

	//$('ul').sortable();
	$('#testbox').click();

})();



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiRHJhZ2dlci5qcyIsIlN0eWxlUGFyc2VyLmpzIiwiTGF5b3V0TW9kZS5qcyIsIlRpdGxlLmpzIiwiR3VpZGVzLmpzIiwiR2hvc3RzLmpzIiwiQ29udGVudEVkaXRhYmxlLmpzIiwiQ29tcGFyZUFuZFByZXZpZXcuanMiLCJNb2RpZnlTaXplLmpzIiwiTW9kaWZ5UGFkZGluZy5qcyIsIk1vZGlmeU1hcmdpbi5qcyIsIktleWJvYXJkLmpzIiwiU25hcC5qcyIsImluaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBHaG9zdCA9IGZ1bmN0aW9uKGVsZW0pIHtcblxuXHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gdGhpcy5jcmVhdGUoKTtcblx0dGhpcy5jdXJyZW50RWxlbWVudCA9IGVsZW07XG5cbn07XG5cbiQuZXh0ZW5kKEdob3N0LnByb3RvdHlwZSwge1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZ2hvc3QgPSAkKCc8ZGl2IGNsYXNzPVwib3ZlcmxheSBnaG9zdFwiPjwvZGl2PicpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXG5cdFx0Z2hvc3QuYXBwZW5kVG8oJ2JvZHknKTtcblx0XHRyZXR1cm4gZ2hvc3RbMF07XG5cblx0fSxcblxuXHRkZXN0cm95OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKG5ld0VsZW0pIHtcblxuXHRcdGlmKG5ld0VsZW0pIHtcblx0XHRcdHRoaXMuY3VycmVudEVsZW1lbnQgPSBuZXdFbGVtO1xuXHRcdH1cblxuXHRcdHZhciBvdmVybGF5RWxlbWVudCA9IHRoaXMub3ZlcmxheUVsZW1lbnQ7XG5cdFx0dmFyIGVsZW0gPSAkKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXHRcdHZhciBvZmZzZXQgPSBlbGVtLm9mZnNldCgpO1xuXG5cdFx0dmFyIGNvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0dmFyIGlubmVyV2lkdGggPSBwYXJzZUludChjb21wdXRlZFN0eWxlLndpZHRoKTtcblx0XHR2YXIgaW5uZXJIZWlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLmhlaWdodCk7XG5cblx0XHR2YXIgcGFkZGluZ0xlZnQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdMZWZ0KTtcblx0XHR2YXIgcGFkZGluZ1RvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ1RvcCk7XG5cdFx0dmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ1JpZ2h0KTtcblx0XHR2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0JvdHRvbSk7XG5cblx0XHR2YXIgbWFyZ2luTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luTGVmdCk7XG5cdFx0dmFyIG1hcmdpblRvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luVG9wKTtcblx0XHR2YXIgbWFyZ2luUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblJpZ2h0KTtcblx0XHR2YXIgbWFyZ2luQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Cb3R0b20pO1xuXG5cdFx0dmFyIG91dGVyV2lkdGggPSBpbm5lcldpZHRoICsgcGFkZGluZ0xlZnQgKyBwYWRkaW5nUmlnaHQ7XG5cdFx0dmFyIG91dGVySGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbTtcblxuXHRcdC8vIHBsYWNlIGFuZCByZXNpemUgb3ZlcmxheVxuXHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChvZmZzZXQubGVmdCArIHBhZGRpbmdMZWZ0KSArICdweCwgJyArIChvZmZzZXQudG9wICsgcGFkZGluZ1RvcCkgKyAncHgpJztcblxuXHRcdC8vIG1vZGlmeSBwYWRkaW5nIGJveFxuXG5cdFx0Ly8gbGVmdFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5sZWZ0Jywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogcGFkZGluZ0xlZnQsXG5cdFx0XHRoZWlnaHQ6IG91dGVySGVpZ2h0LFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcCxcblx0XHRcdGxlZnQ6IC1wYWRkaW5nTGVmdFxuXHRcdH0pO1xuXG5cdFx0Ly8gcmlnaHRcblx0XHQkKCcuY29udGFpbmVyLXBhZGRpbmcucmlnaHQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBwYWRkaW5nUmlnaHQsXG5cdFx0XHRoZWlnaHQ6IG91dGVySGVpZ2h0LFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcCxcblx0XHRcdHJpZ2h0OiAtcGFkZGluZ1JpZ2h0XG5cdFx0fSk7XG5cblx0XHQvLyB0b3Bcblx0XHQkKCcuY29udGFpbmVyLXBhZGRpbmcudG9wJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogaW5uZXJXaWR0aCxcblx0XHRcdGhlaWdodDogcGFkZGluZ1RvcCxcblx0XHRcdHRvcDogLXBhZGRpbmdUb3Bcblx0XHR9KTtcblxuXHRcdC8vIGJvdHRvbVxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5ib3R0b20nLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBwYWRkaW5nQm90dG9tLFxuXHRcdFx0Ym90dG9tOiAtcGFkZGluZ0JvdHRvbVxuXHRcdH0pO1xuXG5cdFx0Ly8gbW9kaWZ5IG1hcmdpbiBib3hcblxuXHRcdC8vIGxlZnRcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5sZWZ0Jywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogbWFyZ2luTGVmdCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20sXG5cdFx0XHR0b3A6IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCksXG5cdFx0XHRsZWZ0OiAtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdClcblx0XHR9KTtcblxuXHRcdC8vIHJpZ2h0XG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4ucmlnaHQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBtYXJnaW5SaWdodCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20sXG5cdFx0XHR0b3A6IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCksXG5cdFx0XHRyaWdodDogLShwYWRkaW5nUmlnaHQgKyBtYXJnaW5SaWdodClcblx0XHR9KTtcblxuXHRcdC8vIHRvcFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLnRvcCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG91dGVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IG1hcmdpblRvcCxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdGxlZnQ6IC1wYWRkaW5nTGVmdFxuXHRcdH0pO1xuXG5cdFx0Ly8gYm90dG9tXG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4uYm90dG9tJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdGhlaWdodDogbWFyZ2luQm90dG9tLFxuXHRcdFx0Ym90dG9tOiAtKHBhZGRpbmdCb3R0b20gKyBtYXJnaW5Cb3R0b20pLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0fVxuXG59KTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBpc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQ7XG5cblx0dmFyIERyYWdnZXIgPSBmdW5jdGlvbihldmVudCwgb3B0aW9ucykge1xuXG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblx0XHR0aGlzLmV2ZW50RG93biA9IGV2ZW50LnRvdWNoZXMgPyBldmVudC50b3VjaGVzWzBdIDogZXZlbnQ7XG5cdFx0dGhpcy5zdGFydCgpO1xuXG5cdH07XG5cblx0JC5leHRlbmQoRHJhZ2dlci5wcm90b3R5cGUsIHtcblx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRMYXlvdXRNb2RlLmludGVyYWN0aW5nID0gdHJ1ZTtcblxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dGhpcy5fX21vdmUgPSBmdW5jdGlvbihlKSB7IHNlbGYubW92ZShlKTsgfTtcblx0XHRcdHRoaXMuX19zdG9wID0gZnVuY3Rpb24oZSkgeyBzZWxmLnN0b3AoZSk7IH07XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGlzVG91Y2ggPyAndG91Y2htb3ZlJyA6ICdtb3VzZW1vdmUnLCB0aGlzLl9fbW92ZSwgZmFsc2UpO1xuXHRcdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihpc1RvdWNoID8gJ3RvdWNoZW5kJyA6ICdtb3VzZXVwJywgdGhpcy5fX3N0b3AsIGZhbHNlKTtcblxuXHRcdH0sXG5cdFx0bW92ZTogZnVuY3Rpb24oZXZlbnQpIHtcblxuXHRcdFx0dGhpcy5ldmVudE1vdmUgPSBldmVudC50b3VjaGVzID8gZXZlbnQudG91Y2hlc1swXSA6IGV2ZW50O1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dmFyIG1vdmVieSA9IDA7XG5cblx0XHRcdGlmKHRoaXMub3B0aW9ucy52ZXJ0aWNhbCkge1xuXHRcdFx0XHRtb3ZlYnkgPSAodGhpcy5ldmVudERvd24ucGFnZVkgLSB0aGlzLmV2ZW50TW92ZS5wYWdlWSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtb3ZlYnkgPSAodGhpcy5ldmVudERvd24ucGFnZVggLSB0aGlzLmV2ZW50TW92ZS5wYWdlWCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub3B0aW9ucy5tb3ZlKG1vdmVieSwgZXZlbnQpO1xuXG5cdFx0fSxcblx0XHRzdG9wOiBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGlzVG91Y2ggPyAndG91Y2htb3ZlJyA6ICdtb3VzZW1vdmUnLCB0aGlzLl9fbW92ZSk7XG5cdFx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGlzVG91Y2ggPyAndG91Y2hlbmQnIDogJ21vdXNldXAnLCB0aGlzLl9fc3RvcCk7XG5cblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRMYXlvdXRNb2RlLmxhc3RJbnRlcmFjdGlvblRpbWUgPSBEYXRlLm5vdygpO1xuXHRcdFx0TGF5b3V0TW9kZS5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0aWYodGhpcy5vcHRpb25zLnN0b3ApIHRoaXMub3B0aW9ucy5zdG9wKCk7XG5cblx0XHR9XG5cdH0pO1xuXG5cdHdpbmRvdy5EcmFnZ2VyID0gRHJhZ2dlcjtcblxufSkoKTsiLCIvKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNwZWNpZmljaXR5IG9mIENTUyBzZWxlY3RvcnNcbiAqIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtc2VsZWN0b3JzLyNzcGVjaWZpY2l0eVxuICpcbiAqIFJldHVybnMgYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqICAtIHNlbGVjdG9yOiB0aGUgaW5wdXRcbiAqICAtIHNwZWNpZmljaXR5OiBlLmcuIDAsMSwwLDBcbiAqICAtIHBhcnRzOiBhcnJheSB3aXRoIGRldGFpbHMgYWJvdXQgZWFjaCBwYXJ0IG9mIHRoZSBzZWxlY3RvciB0aGF0IGNvdW50cyB0b3dhcmRzIHRoZSBzcGVjaWZpY2l0eVxuICovXG52YXIgU1BFQ0lGSUNJVFkgPSAoZnVuY3Rpb24oKSB7XG5cdHZhciBjYWxjdWxhdGUsXG5cdFx0Y2FsY3VsYXRlU2luZ2xlO1xuXG5cdGNhbGN1bGF0ZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0dmFyIHNlbGVjdG9ycyxcblx0XHRcdHNlbGVjdG9yLFxuXHRcdFx0aSxcblx0XHRcdGxlbixcblx0XHRcdHJlc3VsdHMgPSBbXTtcblxuXHRcdC8vIFNlcGFyYXRlIGlucHV0IGJ5IGNvbW1hc1xuXHRcdHNlbGVjdG9ycyA9IGlucHV0LnNwbGl0KCcsJyk7XG5cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBzZWxlY3RvcnMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3JzW2ldO1xuXHRcdFx0aWYgKHNlbGVjdG9yLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0cmVzdWx0cy5wdXNoKGNhbGN1bGF0ZVNpbmdsZShzZWxlY3RvcikpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHRzO1xuXHR9O1xuXG5cdC8vIENhbGN1bGF0ZSB0aGUgc3BlY2lmaWNpdHkgZm9yIGEgc2VsZWN0b3IgYnkgZGl2aWRpbmcgaXQgaW50byBzaW1wbGUgc2VsZWN0b3JzIGFuZCBjb3VudGluZyB0aGVtXG5cdGNhbGN1bGF0ZVNpbmdsZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0dmFyIHNlbGVjdG9yID0gaW5wdXQsXG5cdFx0XHRmaW5kTWF0Y2gsXG5cdFx0XHR0eXBlQ291bnQgPSB7XG5cdFx0XHRcdCdhJzogMCxcblx0XHRcdFx0J2InOiAwLFxuXHRcdFx0XHQnYyc6IDBcblx0XHRcdH0sXG5cdFx0XHRwYXJ0cyA9IFtdLFxuXHRcdFx0Ly8gVGhlIGZvbGxvd2luZyByZWd1bGFyIGV4cHJlc3Npb25zIGFzc3VtZSB0aGF0IHNlbGVjdG9ycyBtYXRjaGluZyB0aGUgcHJlY2VkaW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMgaGF2ZSBiZWVuIHJlbW92ZWRcblx0XHRcdGF0dHJpYnV0ZVJlZ2V4ID0gLyhcXFtbXlxcXV0rXFxdKS9nLFxuXHRcdFx0aWRSZWdleCA9IC8oI1teXFxzXFwrPn5cXC5cXFs6XSspL2csXG5cdFx0XHRjbGFzc1JlZ2V4ID0gLyhcXC5bXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0cHNldWRvRWxlbWVudFJlZ2V4ID0gLyg6OlteXFxzXFwrPn5cXC5cXFs6XSt8OmZpcnN0LWxpbmV8OmZpcnN0LWxldHRlcnw6YmVmb3JlfDphZnRlcikvZ2ksXG5cdFx0XHQvLyBBIHJlZ2V4IGZvciBwc2V1ZG8gY2xhc3NlcyB3aXRoIGJyYWNrZXRzIC0gOm50aC1jaGlsZCgpLCA6bnRoLWxhc3QtY2hpbGQoKSwgOm50aC1vZi10eXBlKCksIDpudGgtbGFzdC10eXBlKCksIDpsYW5nKClcblx0XHRcdHBzZXVkb0NsYXNzV2l0aEJyYWNrZXRzUmVnZXggPSAvKDpbXFx3LV0rXFwoW15cXCldKlxcKSkvZ2ksXG5cdFx0XHQvLyBBIHJlZ2V4IGZvciBvdGhlciBwc2V1ZG8gY2xhc3Nlcywgd2hpY2ggZG9uJ3QgaGF2ZSBicmFja2V0c1xuXHRcdFx0cHNldWRvQ2xhc3NSZWdleCA9IC8oOlteXFxzXFwrPn5cXC5cXFs6XSspL2csXG5cdFx0XHRlbGVtZW50UmVnZXggPSAvKFteXFxzXFwrPn5cXC5cXFs6XSspL2c7XG5cblx0XHQvLyBGaW5kIG1hdGNoZXMgZm9yIGEgcmVndWxhciBleHByZXNzaW9uIGluIGEgc3RyaW5nIGFuZCBwdXNoIHRoZWlyIGRldGFpbHMgdG8gcGFydHNcblx0XHQvLyBUeXBlIGlzIFwiYVwiIGZvciBJRHMsIFwiYlwiIGZvciBjbGFzc2VzLCBhdHRyaWJ1dGVzIGFuZCBwc2V1ZG8tY2xhc3NlcyBhbmQgXCJjXCIgZm9yIGVsZW1lbnRzIGFuZCBwc2V1ZG8tZWxlbWVudHNcblx0XHRmaW5kTWF0Y2ggPSBmdW5jdGlvbihyZWdleCwgdHlwZSkge1xuXHRcdFx0dmFyIG1hdGNoZXMsIGksIGxlbiwgbWF0Y2gsIGluZGV4LCBsZW5ndGg7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0bWF0Y2hlcyA9IHNlbGVjdG9yLm1hdGNoKHJlZ2V4KTtcblx0XHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbWF0Y2hlcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0XHRcdHR5cGVDb3VudFt0eXBlXSArPSAxO1xuXHRcdFx0XHRcdG1hdGNoID0gbWF0Y2hlc1tpXTtcblx0XHRcdFx0XHRpbmRleCA9IHNlbGVjdG9yLmluZGV4T2YobWF0Y2gpO1xuXHRcdFx0XHRcdGxlbmd0aCA9IG1hdGNoLmxlbmd0aDtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHtcblx0XHRcdFx0XHRcdHNlbGVjdG9yOiBtYXRjaCxcblx0XHRcdFx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHRcdFx0XHRpbmRleDogaW5kZXgsXG5cdFx0XHRcdFx0XHRsZW5ndGg6IGxlbmd0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8vIFJlcGxhY2UgdGhpcyBzaW1wbGUgc2VsZWN0b3Igd2l0aCB3aGl0ZXNwYWNlIHNvIGl0IHdvbid0IGJlIGNvdW50ZWQgaW4gZnVydGhlciBzaW1wbGUgc2VsZWN0b3JzXG5cdFx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG1hdGNoLCBBcnJheShsZW5ndGggKyAxKS5qb2luKCcgJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIFJlbW92ZSB0aGUgbmVnYXRpb24gcHN1ZWRvLWNsYXNzICg6bm90KSBidXQgbGVhdmUgaXRzIGFyZ3VtZW50IGJlY2F1c2Ugc3BlY2lmaWNpdHkgaXMgY2FsY3VsYXRlZCBvbiBpdHMgYXJndW1lbnRcblx0XHQoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmVnZXggPSAvOm5vdFxcKChbXlxcKV0qKVxcKS9nO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShyZWdleCwgJyAgICAgJDEgJyk7XG5cdFx0XHR9XG5cdFx0fSgpKTtcblxuXHRcdC8vIFJlbW92ZSBhbnl0aGluZyBhZnRlciBhIGxlZnQgYnJhY2UgaW4gY2FzZSBhIHVzZXIgaGFzIHBhc3RlZCBpbiBhIHJ1bGUsIG5vdCBqdXN0IGEgc2VsZWN0b3Jcblx0XHQoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmVnZXggPSAve1teXSovZ20sXG5cdFx0XHRcdG1hdGNoZXMsIGksIGxlbiwgbWF0Y2g7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0bWF0Y2hlcyA9IHNlbGVjdG9yLm1hdGNoKHJlZ2V4KTtcblx0XHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbWF0Y2hlcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0XHRcdG1hdGNoID0gbWF0Y2hlc1tpXTtcblx0XHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UobWF0Y2gsIEFycmF5KG1hdGNoLmxlbmd0aCArIDEpLmpvaW4oJyAnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KCkpO1xuXG5cdFx0Ly8gQWRkIGF0dHJpYnV0ZSBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChhdHRyaWJ1dGVSZWdleCwgJ2InKTtcblxuXHRcdC8vIEFkZCBJRCBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBhKVxuXHRcdGZpbmRNYXRjaChpZFJlZ2V4LCAnYScpO1xuXG5cdFx0Ly8gQWRkIGNsYXNzIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGIpXG5cdFx0ZmluZE1hdGNoKGNsYXNzUmVnZXgsICdiJyk7XG5cblx0XHQvLyBBZGQgcHNldWRvLWVsZW1lbnQgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYylcblx0XHRmaW5kTWF0Y2gocHNldWRvRWxlbWVudFJlZ2V4LCAnYycpO1xuXG5cdFx0Ly8gQWRkIHBzZXVkby1jbGFzcyBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChwc2V1ZG9DbGFzc1dpdGhCcmFja2V0c1JlZ2V4LCAnYicpO1xuXHRcdGZpbmRNYXRjaChwc2V1ZG9DbGFzc1JlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gUmVtb3ZlIHVuaXZlcnNhbCBzZWxlY3RvciBhbmQgc2VwYXJhdG9yIGNoYXJhY3RlcnNcblx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoL1tcXCpcXHNcXCs+fl0vZywgJyAnKTtcblxuXHRcdC8vIFJlbW92ZSBhbnkgc3RyYXkgZG90cyBvciBoYXNoZXMgd2hpY2ggYXJlbid0IGF0dGFjaGVkIHRvIHdvcmRzXG5cdFx0Ly8gVGhlc2UgbWF5IGJlIHByZXNlbnQgaWYgdGhlIHVzZXIgaXMgbGl2ZS1lZGl0aW5nIHRoaXMgc2VsZWN0b3Jcblx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoL1sjXFwuXS9nLCAnICcpO1xuXG5cdFx0Ly8gVGhlIG9ubHkgdGhpbmdzIGxlZnQgc2hvdWxkIGJlIGVsZW1lbnQgc2VsZWN0b3JzICh0eXBlIGMpXG5cdFx0ZmluZE1hdGNoKGVsZW1lbnRSZWdleCwgJ2MnKTtcblxuXHRcdC8vIE9yZGVyIHRoZSBwYXJ0cyBpbiB0aGUgb3JkZXIgdGhleSBhcHBlYXIgaW4gdGhlIG9yaWdpbmFsIHNlbGVjdG9yXG5cdFx0Ly8gVGhpcyBpcyBuZWF0ZXIgZm9yIGV4dGVybmFsIGFwcHMgdG8gZGVhbCB3aXRoXG5cdFx0cGFydHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHRyZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VsZWN0b3I6IGlucHV0LFxuXHRcdFx0c3BlY2lmaWNpdHk6ICcwLCcgKyB0eXBlQ291bnQuYS50b1N0cmluZygpICsgJywnICsgdHlwZUNvdW50LmIudG9TdHJpbmcoKSArICcsJyArIHR5cGVDb3VudC5jLnRvU3RyaW5nKCksXG5cdFx0XHRwYXJ0czogcGFydHNcblx0XHR9O1xuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0Y2FsY3VsYXRlOiBjYWxjdWxhdGVcblx0fTtcbn0oKSk7XG5cblxuKGZ1bmN0aW9uKCkge1xuXG5cdHZhciBTdHlsZVBhcnNlciA9IHt9O1xuXG5cdHZhciBydWxlcyA9IHt9O1xuXHR2YXIgc2hlZXRzID0gZG9jdW1lbnQuc3R5bGVTaGVldHM7XG5cblx0dmFyIHNoZWV0LCBydWxlO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNoZWV0cy5sZW5ndGg7IGkrKykge1xuXHRcdFxuXHRcdHNoZWV0ID0gc2hlZXRzW2ldO1xuXHRcdGlmKCFzaGVldC5jc3NSdWxlcykgY29udGludWU7XG5cblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHNoZWV0LmNzc1J1bGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRydWxlID0gc2hlZXQuY3NzUnVsZXNbal07XG5cdFx0XHRydWxlc1tydWxlLnNlbGVjdG9yVGV4dF0gPSBydWxlO1xuXHRcdH1cblx0fVxuXG5cdFN0eWxlUGFyc2VyLnJlc29sdmUgPSBmdW5jdGlvbih0cmFja2VkRWxlbWVudCkge1xuXG5cdFx0dmFyIG1hdGNoZWRSdWxlcyA9IHdpbmRvdy5nZXRNYXRjaGVkQ1NTUnVsZXModHJhY2tlZEVsZW1lbnQpIHx8IFtdO1xuXHRcdHZhciBydWxlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRydWxlcy5wdXNoKFttYXRjaGVkUnVsZXNbaV0sIHBhcnNlSW50KFNQRUNJRklDSVRZLmNhbGN1bGF0ZShtYXRjaGVkUnVsZXNbaV0uc2VsZWN0b3JUZXh0KVswXS5zcGVjaWZpY2l0eS5yZXBsYWNlKC9cXCwvZywgJycpLCAxMCkgKyAwLjAxICogaV0pO1xuXHRcdH1cblxuXG5cblx0XHRydWxlcyA9IHJ1bGVzXG5cdFx0XHQuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHRcdHJldHVybiBiWzFdIC0gYVsxXTtcblx0XHRcdH0pXG5cdFx0XHQubWFwKGZ1bmN0aW9uKGEpIHtcblx0XHRcdFx0cmV0dXJuIGFbMF07XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiBydWxlcztcblxuXHR9O1xuXG5cdHdpbmRvdy5TdHlsZVBhcnNlciA9IFN0eWxlUGFyc2VyO1xuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuXHR2YXIgTGF5b3V0TW9kZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5vdmVybGF5RWxlbWVudCA9IG51bGw7IC8vIHRoZSBhY3R1YWwgb3ZlcmxheSBkaXZcblx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDsgLy8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBlbGVtZW50XG5cdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBudWxsOyAvLyB3aGVuIGRlZmluZWQsIHdlJ3JlIGluIHJ1bGUgbW9kZVxuXHRcdHRoaXMuaG92ZXJHaG9zdCA9IG5ldyBHaG9zdCgpOyAvLyB0aGUgaG92ZXIgZ2hvc3Rcblx0XHR0aGlzLm92ZXIgPSBmYWxzZTsgLy8gb24gd2hldGhlciB3ZSdyZSBjdXJyZW5seSBob3ZlcmluZyBhIGNlcnRhaW4gcGFydCBvZiB0aGUgb3ZlcmxheVxuXHRcdHRoaXMuaW50ZXJhY3RpbmcgPSBmYWxzZTsgLy8gd2hldGhlciB3ZSdyZSBjdXJyZW50bHkgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgZWxlbWVudFxuXG5cdFx0Ly8gaW5pdGlhbGl6ZVxuXHRcdHRoaXMuY3JlYXRlKCk7XG5cblx0fTtcblxuXHQkLmV4dGVuZChMYXlvdXRNb2RlLnByb3RvdHlwZSwge1xuXG5cdFx0cGx1Z2luczogW10sXG5cblx0XHRyZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKSB7XG5cdFx0XHR0aGlzLnBsdWdpbnMucHVzaChwbHVnaW4pO1xuXHRcdFx0aWYocGx1Z2luLmNyZWF0ZSkge1xuXHRcdFx0XHRwbHVnaW4uY3JlYXRlLmNhbGwocGx1Z2luKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Y2FsbFBsdWdpbjogZnVuY3Rpb24oZXZlbnROYW1lLCBhLCBiLCBjLCBkLCBlLCBmKSB7XG5cdFx0XHR2YXIgcmV0VmFsLCB0bXA7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGx1Z2lucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLnBsdWdpbnNbaV1bZXZlbnROYW1lXSkge1xuXHRcdFx0XHRcdHRtcCA9IHRoaXMucGx1Z2luc1tpXVtldmVudE5hbWVdLmNhbGwodGhpcy5wbHVnaW5zW2ldLCBhLCBiLCBjLCBkLCBlLCBmKTtcblx0XHRcdFx0XHRpZih0bXAgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0cmV0VmFsID0gdG1wO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJldFZhbDtcblx0XHR9LFxuXG5cdFx0c29ydFBsdWdpbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5wbHVnaW5zLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0XHRyZXR1cm4gYS5wcmlvcml0eSA+IGIucHJpb3JpdHk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0ZW5hYmxlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBwcmlvcml0aXplIHNvbWUgcGx1Z2lucyBvdmVyIG90aGVyc1xuXHRcdFx0dGhpcy5zb3J0UGx1Z2lucygpO1xuXG5cdFx0XHQvLyBtYWtlIGFsbCBlbGVtZW50cyBvbiBwYWdlIGluc3BlY3RhYmxlXG5cdFx0XHQkKCdib2R5ICo6bm90KC5vdmVybGF5LC5vdmVybGF5ICosLm92ZXJsYXktdGl0bGUsLm92ZXJsYXktdGl0bGUgKiknKVxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRcdHZhciB0YXJnZXRDaGFuZ2VkID0gdGhhdC5ob3ZlckVsZW1lbnQgIT09IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5ob3ZlckVsZW1lbnQgPSB0aGlzO1xuXG5cdFx0XHRcdFx0aWYodGFyZ2V0Q2hhbmdlZCkge1xuXHRcdFx0XHRcdFx0dGhhdC5jYWxsUGx1Z2luKCdob3ZlclRhcmdldENoYW5nZScsIGUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIGluIG5vcm1hbCBtb2RlLCBkb24ndCBhY3RpdmF0ZSB0aGUgaG92ZXIgZ2hvc3Qgd2hlbiBpbnRlcmFjdGluZyBvciBvdmVyIHRoZSBjdXJyZW50IGVsXG5cdFx0XHRcdFx0aWYodGhhdC5ob3Zlckdob3N0LmN1cnJlbnRFbGVtZW50ID09PSB0aGlzIHx8IHRoYXQuaW50ZXJhY3RpbmcgfHwgdGhhdC5vdmVyKVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRcdFx0dGhhdC5ob3Zlckdob3N0LnJlbGF5b3V0KHRoaXMpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdGlmKHRoYXQuY3VycmVudEVsZW1lbnQgPT09IHRoaXMgfHwgdGhhdC5pbnRlcmFjdGluZylcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHRcdC8vIHRoaXMgaXMgYW4gaW5zYW5lbHkgdWdseSB3b3JrYXJvdW5kIGZvciBhIHByb3BhZ2F0aW9uIGlzc3VlIGZyb20gZHJhZyxcblx0XHRcdFx0XHQvLyBidXQgSSBqdXN0IGRvbnQgZ2l2ZSBhIHNoaXQhIDpEXG5cdFx0XHRcdFx0aWYoRGF0ZS5ub3coKSAtIHRoYXQubGFzdEludGVyYWN0aW9uVGltZSA8IDUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZih0aGF0LmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdFx0XHR0aGF0LmRlYWN0aXZhdGUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBzeW5jIG9uIHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0dGhhdC5hY3RpdmF0ZSh0aGlzKTtcblxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHR9KTtcdFx0XG5cblx0XHR9LFxuXG5cdFx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY3JlYXRlT3ZlcmxheSgpO1xuXHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0fSxcblxuXHRcdGNyZWF0ZU92ZXJsYXk6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gJCgnPGRpdiBpZD1cIm92ZXJsYXlcIiBjbGFzcz1cIm92ZXJsYXlcIj48L2Rpdj4nKVswXTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblxuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIEV2ZW50cyAmIEJlaGF2aW91ciBpbml0aWFsaXphdGlvblxuXHRcdCAqL1xuXG5cdFx0aW5pdDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuaW5pdEhvdmVyKCk7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHRoaXMuX19rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxNikge1xuXHRcdFx0XHRcdHRoYXQuc2hpZnRQcmVzc2VkID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxOCkge1xuXHRcdFx0XHRcdHRoYXQuYWx0UHJlc3NlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoZS53aGljaCA9PT0gMTcpIHtcblx0XHRcdFx0XHR0aGF0LmN0cmxQcmVzc2VkID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihlLmtleUNvZGUgPT09IDI3KSB7XG5cdFx0XHRcdFx0dGhhdC5kZWFjdGl2YXRlKCk7XG5cdFx0XHRcdH1cdFx0XG5cdFx0XHR9O1xuXHRcdFx0dGhpcy5fX2tleWRvd24gPSBmdW5jdGlvbihlKSB7XG5cblx0XHRcdFx0aWYoZS53aGljaCA9PT0gMTYpIHtcblx0XHRcdFx0XHR0aGF0LnNoaWZ0UHJlc3NlZCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxOCkge1xuXHRcdFx0XHRcdHRoYXQuYWx0UHJlc3NlZCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxNykge1xuXHRcdFx0XHRcdHRoYXQuY3RybFByZXNzZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH07XG5cdFx0XHR0aGlzLl9fcmVzaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHdpbmRvdy5MYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHR9O1xuXG5cdFx0XHQkKGRvY3VtZW50KS5vbigna2V5dXAnLCB0aGlzLl9fa2V5dXApO1xuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCB0aGlzLl9fa2V5ZG93bik7XG5cdFx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIHRoaXMuX19yZXNpemUpO1xuXG5cdFx0fSxcblxuXHRcdGluaXRIb3ZlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdFx0JCgnYm9keScpLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cblx0XHRcdFx0dGhhdC5fX2xhc3RNb3VzZU1vdmVFdmVudCA9IGU7XG5cdFx0XHRcdGlmKCF0aGF0LmN1cnJlbnRFbGVtZW50IHx8IHRoYXQuaGlkZGVuKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhhdC5wcm9jZXNzT3ZlckxvZ2ljKGUpO1xuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRwcm9jZXNzT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdHZhciBleHRyYU1hcmdpbiA9IDEwO1xuXHRcdFx0dmFyIG9mZnNldCA9IHRoaXMuY3VycmVudE9mZnNldDtcblxuXHRcdFx0Ly8gZ2VuZXJhbCBvdmVyL291dFxuXG5cdFx0XHRpZihcblx0XHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0IC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSB0aGlzLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0ICsgZXh0cmFNYXJnaW4pICYmXG5cdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgKyB0aGlzLm1hcmdpbkJvdHRvbSArIGV4dHJhTWFyZ2luKVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3Zlcikge1xuXHRcdFx0XHRcdHRoaXMub3ZlciA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYodGhpcy5vdmVyICYmICF0aGlzLmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcdFx0XHRcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIGRvbid0IHByb2Nlc3MgaWYgaW50ZXJhY3Rpbmdcblx0XHRcdGlmKHRoaXMuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjYWxsIHBsdWdpbnNcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignbW91c2Vtb3ZlJywgZSk7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBDb3JlIHJ1bnRpbWUgZnVuY3Rpb25hbGl0eVxuXHRcdCAqL1xuXG5cdFx0Y2FsY3VsYXRlSGFuZGxlU2l6ZTogZnVuY3Rpb24oaW5uZXJXaWR0aCwgaW5uZXJIZWlnaHQpIHtcblx0XHRcdHZhciBoYW5kbGVTaXplWCA9IDE2O1xuXHRcdFx0dmFyIGhhbmRsZVNpemVZID0gMTY7XG5cdFx0XHRpZihpbm5lcldpZHRoIDwgMTAwKSB7XG5cdFx0XHRcdGhhbmRsZVNpemVYID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oMTYsIGhhbmRsZVNpemVYICogKGlubmVyV2lkdGggLyA2MCkpKTtcblx0XHRcdH1cblx0XHRcdGlmKGlubmVySGVpZ2h0IDwgMTAwKSB7XG5cdFx0XHRcdGhhbmRsZVNpemVZID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oMTYsIGhhbmRsZVNpemVZICogKGlubmVySGVpZ2h0IC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR5OiBoYW5kbGVTaXplWSxcblx0XHRcdFx0eDogaGFuZGxlU2l6ZVhcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHJlbGF5b3V0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIGNvbXB1dGVkU3R5bGUgPSB0aGlzLmNvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHR2YXIgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLm92ZXJsYXlFbGVtZW50O1xuXHRcdFx0dmFyIGVsZW0gPSAkKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXHRcdFx0dmFyIG9mZnNldCA9IHRoaXMuY3VycmVudE9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHRcdC8vIHdlIG5lZWQgdG8gc3RvcmUgb3V0ZXIgaGVpZ2h0LCBib3R0b20vcmlnaHQgcGFkZGluZyBhbmQgbWFyZ2lucyBmb3IgaG92ZXIgZGV0ZWN0aW9uXG5cdFx0XHR2YXIgcGFkZGluZ0xlZnQgPSB0aGlzLnBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nTGVmdCk7XG5cdFx0XHR2YXIgcGFkZGluZ1RvcCA9IHRoaXMucGFkZGluZ1RvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ1RvcCk7XG5cdFx0XHR2YXIgcGFkZGluZ1JpZ2h0ID0gdGhpcy5wYWRkaW5nUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdSaWdodCk7XG5cdFx0XHR2YXIgcGFkZGluZ0JvdHRvbSA9IHRoaXMucGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0JvdHRvbSk7XG5cblx0XHRcdHZhciBtYXJnaW5MZWZ0ID0gdGhpcy5tYXJnaW5MZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0KTtcblx0XHRcdHZhciBtYXJnaW5Ub3AgPSB0aGlzLm1hcmdpblRvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luVG9wKTtcblx0XHRcdHZhciBtYXJnaW5SaWdodCA9IHRoaXMubWFyZ2luUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblJpZ2h0KTtcblx0XHRcdHZhciBtYXJnaW5Cb3R0b20gPSB0aGlzLm1hcmdpbkJvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luQm90dG9tKTtcblxuXHRcdFx0dmFyIGlubmVyV2lkdGggPSB0aGlzLmlubmVyV2lkdGggPSBwYXJzZUludChjb21wdXRlZFN0eWxlLndpZHRoKSB8fCAodGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0KTtcblx0XHRcdHZhciBpbm5lckhlaWdodCA9IHRoaXMuaW5uZXJIZWlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLmhlaWdodCkgfHwgKHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b20pO1xuXG5cdFx0XHR2YXIgb3V0ZXJXaWR0aCA9IHRoaXMub3V0ZXJXaWR0aCA9IGlubmVyV2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodDtcblx0XHRcdHZhciBvdXRlckhlaWdodCA9IHRoaXMub3V0ZXJIZWlnaHQgPSBpbm5lckhlaWdodCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuXG5cdFx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHRcdC8vIG1vZGlmeSBwYWRkaW5nIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nTGVmdCArICcsICcgKyBvdXRlckhlaWdodCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1JpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nUmlnaHQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKC1wYWRkaW5nVG9wKSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ1RvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoMCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQpICsgJ3B4KSBzY2FsZSgnICsgaW5uZXJXaWR0aCArICcsICcgKyBwYWRkaW5nQm90dG9tICsgJyknO1xuXG5cdFx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkpICsgJ3B4LCAnICsgKC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkpICsgJ3B4KSBzY2FsZSgnICsgbWFyZ2luTGVmdCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCArIHBhZGRpbmdSaWdodCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5SaWdodCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpblRvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0ICsgcGFkZGluZ0JvdHRvbSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpbkJvdHRvbSArICcpJztcblxuXHRcdFx0Ly8gaW5mb3JtIHBsdWdpbnMgdGhhdCBhIHJlbGF5b3V0IGhhcyBoYXBwZW5lZFxuXHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdyZWxheW91dCcsIHtcblxuXHRcdFx0XHRjb21wdXRlZFN0eWxlOiBjb21wdXRlZFN0eWxlLFxuXHRcdFx0XHRvZmZzZXQ6IG9mZnNldCxcblxuXHRcdFx0XHRwYWRkaW5nTGVmdDogcGFkZGluZ0xlZnQsXG5cdFx0XHRcdHBhZGRpbmdUb3A6IHBhZGRpbmdUb3AsXG5cdFx0XHRcdHBhZGRpbmdSaWdodDogcGFkZGluZ1JpZ2h0LFxuXHRcdFx0XHRwYWRkaW5nQm90dG9tOiBwYWRkaW5nQm90dG9tLFxuXG5cdFx0XHRcdG1hcmdpbkxlZnQ6IG1hcmdpbkxlZnQsXG5cdFx0XHRcdG1hcmdpblRvcDogbWFyZ2luVG9wLFxuXHRcdFx0XHRtYXJnaW5SaWdodDogbWFyZ2luUmlnaHQsXG5cdFx0XHRcdG1hcmdpbkJvdHRvbTogbWFyZ2luQm90dG9tLFxuXG5cdFx0XHRcdGlubmVyV2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRcdGlubmVySGVpZ2h0OiBpbm5lckhlaWdodCxcblx0XHRcdFx0b3V0ZXJXaWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdFx0b3V0ZXJIZWlnaHQ6IG91dGVySGVpZ2h0XG5cblx0XHRcdH0sIHRoaXMuY2FsY3VsYXRlSGFuZGxlU2l6ZShpbm5lcldpZHRoLCBpbm5lckhlaWdodCkpO1xuXG5cdFx0fSxcblxuXHRcdGdldENhcHRpb25Qcm9wZXJ0eTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Ly8gY2hlY2sgaW4gaW5saW5lIHN0eWxlc1xuXHRcdFx0aWYodGhpcy5jdXJyZW50RWxlbWVudC5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNoZWNrIGluIHJ1bGVzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMubWF0Y2hlZFJ1bGVzW2ldLnN0eWxlW2Nzc1Byb3BlcnR5XSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0ucmVwbGFjZSgvKGVtfHB4KS8sICfigIk8c3Bhbj4kMTwvc3Bhbj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmV0VmFsID0gJyc7XG5cblx0XHRcdGlmKGNzc1Byb3BlcnR5LmluZGV4T2YoJ21hcmdpbicpID4gLTEgfHwgY3NzUHJvcGVydHkuaW5kZXhPZigncGFkZGluZycpID4gLTEpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpc1tjc3NQcm9wZXJ0eV07XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICdoZWlnaHQnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJIZWlnaHQ7XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICd3aWR0aCcpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpcy5pbm5lcldpZHRoO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpbXBsaWNpdCB2YWx1ZVxuXHRcdFx0cmV0dXJuICcoJyArIHJldFZhbCArICfigIk8c3Bhbj5weDwvc3Bhbj4pJztcblxuXHRcdH0sXG5cblx0XHRhY3RpdmF0ZTogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbmV3RWxlbTtcblx0XHRcdHRoaXMuY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHRcdC8vIGluaXRpYWwgaG92ZXJcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHR0aGlzLm92ZXIgPSB0cnVlO1xuXG5cdFx0XHRpZih0aGlzLmNvbXB1dGVkU3R5bGUuZGlzcGxheSA9PT0gJ2lubGluZScpIHtcblx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbmxpbmUnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItaW5saW5lJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGhpZGUgdGhlIGhvdmVyIGdob3N0IGZvciBpbnNwZWN0aW9uXG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZmluZCBtYXRjaGluZyBydWxlc1xuXHRcdFx0dGhpcy5tYXRjaGVkUnVsZXMgPSBTdHlsZVBhcnNlci5yZXNvbHZlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHQvLyBleGVjdXRlIHBsdWdpbnNcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignYWN0aXZhdGUnKTtcblxuXHRcdFx0Ly8gcmVsYXlvdXRcblx0XHRcdHRoaXMucmVsYXlvdXQoKTtcblxuXHRcdH0sXG5cblx0XHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUpIHtcblx0XHRcdFx0dGhpcy5leGl0UnVsZU1vZGUoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdoaWRkZW4nKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZXhlY3V0ZSBwbHVnaW5zXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2RlYWN0aXZhdGUnKTtcblxuXHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDtcblxuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIEZ1bmN0aW9ucyByZWxhdGVkIHRvIHJ1bGUtYmFzZWQgZWRpdGluZ1xuXHRcdCAqL1xuXG5cdFx0ZW50ZXJSdWxlTW9kZTogZnVuY3Rpb24oY3NzUnVsZSwgaW5kZXgpIHtcblxuXHRcdFx0Ly8gaWYgc2VsZWN0ZWRSdWxlIGFuZCBuZXcgY3NzUnVsZSBhcmUgdGhlIHNhbWUsIGRvbid0IGRvIGFueXRoaW5nXG5cdFx0XHRpZih0aGlzLnNlbGVjdGVkUnVsZSA9PT0gY3NzUnVsZSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIGlmIHNlbGVjdGVkUnVsZSB3YXNuJ3QgZW1wdHksIHdlIHNpbXBseSBjaGFuZ2UgdGhlIHJ1bGVcblx0XHRcdGlmKHRoaXMuc2VsZWN0ZWRSdWxlKSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gY3NzUnVsZTtcblx0XHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdjaGFuZ2VSdWxlJywgaW5kZXgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBjc3NSdWxlO1xuXHRcdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2VudGVyUnVsZScsIGluZGV4KTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRleGl0UnVsZU1vZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdleGl0UnVsZScpO1xuXHRcdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBudWxsO1xuXHRcdH0sXG5cblx0XHRzZWxlY3RSdWxlOiBmdW5jdGlvbihjc3NQcm9wZXJ0eSkge1xuXG5cdFx0XHR0aGlzLnNlbGVjdGVkUHJvcCA9IGNzc1Byb3BlcnR5O1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMubWF0Y2hlZFJ1bGVzW2ldLnN0eWxlW2Nzc1Byb3BlcnR5XSkge1xuXHRcdFx0XHRcdHRoaXMuZW50ZXJSdWxlTW9kZSh0aGlzLm1hdGNoZWRSdWxlc1tpXSwgaSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIG5vIHJ1bGUgbWF0Y2hpbmc/IGV4aXQgcnVsZSBtb2RlIHRoZW5cblx0XHRcdHRoaXMuZXhpdFJ1bGVNb2RlKCk7XG5cblx0XHR9LFxuXG5cdFx0ZGVzZWxlY3RSdWxlOiBmdW5jdGlvbihjc3NQcm9wZXJ0eSkge1xuXG5cdFx0XHQvLyBkb24ndCBkbyBhbnl0aGluZyBpZiBpbiB0aGUgbWVhbnRpbWUgYW5vdGhlciBydWxlIHdhcyBzZWxlY3RlZFxuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFByb3AgIT09IGNzc1Byb3BlcnR5KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5leGl0UnVsZU1vZGUoKTtcblx0XHR9LFxuXG5cdFx0LyogXG5cdFx0ICogZnVuY3Rpb25zIHRvIHRlbXBvcmFyaWx5IGRpc2FibGVcblx0XHQgKiBsYXlvdXQgbW9kZSwgaS5lLiBmb3IgcHJldmlld2luZy5cblx0XHQgKi9cblxuXHRcdHNob3c6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmhpZGRlbiA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyID0gdGhpcy5fX2xhc3RPdmVyO1xuXG5cdFx0XHRpZih0aGlzLm92ZXIpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcblxuXHRcdFx0Ly8gZWRnZSBjYXNlOiB1c2VyIGhvbGRzIGNvbW1hbmQsIG1vdmVzIG91dCwgcmVsZWFzZXMgY29tbWFuZFxuXHRcdFx0aWYodGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudClcblx0XHRcdFx0dGhpcy5wcm9jZXNzT3ZlckxvZ2ljKHRoaXMuX19sYXN0TW91c2VNb3ZlRXZlbnQpO1xuXG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ3Nob3cnKTtcblxuXHRcdH0sXG5cblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5oaWRkZW4gPSB0cnVlO1xuXHRcdFx0dGhpcy5fX2xhc3RPdmVyID0gdGhpcy5vdmVyO1xuXHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2hpZGUnKTtcblxuXHRcdH0sXG5cblx0XHRzZXRMYXN0QWN0aXZlUHJvcGVydHk6IGZ1bmN0aW9uKHByb3BlcnR5KSB7XG5cdFx0XHR0aGlzLmxhc3RBY3RpdmVQcm9wZXJ0eSA9IHByb3BlcnR5O1xuXHRcdH0sXG5cblx0XHRjaGFuZ2VWYWx1ZTogZnVuY3Rpb24ocHJvcGVydHksIHZhbHVlLCBwcmVjaXNpb24pIHtcblxuXHRcdFx0Ly8gaWYgQ1RSTCBpcyBwcmVzc2VkLCBmb3JjZSBwcmVzaXNpb24gbW9kZSAoZGlzYWJsZXMgc25hcClcblx0XHRcdGlmKHRoaXMuY3RybFByZXNzZWQpIHtcblx0XHRcdFx0cHJlY2lzaW9uID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKTtcblxuXHRcdFx0dmFyIHBsdWdpblZhbHVlID0gdGhpcy5jYWxsUGx1Z2luKCdjaGFuZ2VWYWx1ZScsIHByb3BlcnR5LCB2YWx1ZSwgcHJlY2lzaW9uKTtcblx0XHRcdGlmKHBsdWdpblZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dmFsdWUgPSBwbHVnaW5WYWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0KHRoaXMuc2VsZWN0ZWRSdWxlIHx8IHRoaXMuY3VycmVudEVsZW1lbnQpLnN0eWxlW3Byb3BlcnR5XSA9IE1hdGgubWF4KDAsIHZhbHVlKSArICdweCc7XG5cblx0XHR9XG5cblx0fSk7XG5cblx0Ly8gQ3JlYXRlIExheW91dCBNb2RlIChzaW5nbGV0b24pXG5cdHdpbmRvdy5MYXlvdXRNb2RlID0gbmV3IExheW91dE1vZGUoKTtcblxufSkoKTtcblxuXG4iLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy50aXRsZUJveCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5LXRpdGxlXCI+PGRpdiBjbGFzcz1cInRpdGxlLXJ1bGVcIj48c3BhbiBjbGFzcz1cInNlbGVjdGVkXCI+aW5saW5lIHN0eWxlPC9zcGFuPiA8c3BhbiBjbGFzcz1cInRvZ2dsZVwiPuKWvjwvc3Bhbj48dWwgY2xhc3M9XCJkcm9wZG93blwiPjxsaT5pbmxpbmUgc3R5bGU8L2xpPjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cInRpdGxlLXByb3BvcnRpb25zXCI+MTAwIHggMTAwPC9kaXY+PC9kaXY+Jylcblx0XHRcdC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KVswXTtcblxuXHRcdHRoaXMudGl0bGVQcm9wb3J0aW9ucyA9ICQoJy50aXRsZS1wcm9wb3J0aW9ucycsIHRoaXMudGl0bGVCb3gpWzBdO1xuXHRcdHRoaXMudGl0bGVEcm9wZG93biA9ICQoJy5kcm9wZG93bicsIHRoaXMudGl0bGVCb3gpO1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gaW5pdGlhbGl6ZSB0aXRsZSBib3ggYmVoYXZpb3VyXG5cdFx0dmFyIHRpdGxlQm94ID0gdGhpcy50aXRsZUJveDtcblx0XHR2YXIgdGl0bGVEcm9wZG93biA9IHRoaXMudGl0bGVEcm9wZG93bjtcblxuXHRcdCQoJ3NwYW4nLCB0aXRsZUJveCkuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCcuZHJvcGRvd24nLCB0aXRsZUJveCkudG9nZ2xlKCk7XG5cdFx0fSk7XG5cblxuXHRcdHRpdGxlRHJvcGRvd24ub24oJ2NsaWNrJywgJ2xpJywgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aXRsZURyb3Bkb3duLmhpZGUoKTtcblx0XHRcdCQoJy5zZWxlY3RlZCcsIHRpdGxlQm94KS5odG1sKHRoaXMuaW5uZXJIVE1MKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuZmlsbFJ1bGVzKCk7XG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdCQoJ3NwYW4nLCB0aGlzLnRpdGxlQm94KS5vZmYoJ2NsaWNrJyk7XG5cdFx0JCgnc3BhbicsIHRoaXMudGl0bGVEcm9wZG93bikub2ZmKCdjbGljaycpO1xuXHR9LFxuXG5cdGVudGVyUnVsZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR0aGlzLnRpdGxlQm94LmNsYXNzTGlzdC5hZGQoJ3J1bGUnKTtcblx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LnN0eWxlLnpJbmRleCA9IDEwMDAyO1xuXHRcdHRoaXMuY2hhbmdlUnVsZShpbmRleCk7XG5cdH0sXG5cblx0Y2hhbmdlUnVsZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR0aGlzLnRpdGxlRHJvcGRvd24uZmluZCgnbGk6ZXEoJyArIChpbmRleCArIDEpICsgJyknKS5jbGljaygpO1xuXHR9LFxuXG5cdGV4aXRSdWxlOiBmdW5jdGlvbigpIHtcblx0XHQkKCdzcGFuLnNlbGVjdGVkJywgdGhpcy50aXRsZUJveCkuaHRtbCgnaW5saW5lIHN0eWxlJyk7XG5cdFx0dGhpcy50aXRsZUJveC5jbGFzc0xpc3QucmVtb3ZlKCdydWxlJyk7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5zdHlsZS56SW5kZXggPSAnJztcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMpIHtcblxuXHRcdHZhciBvZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHQvLyBwbGFjZSB0aXRsZSBib3hcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdHRoaXMudGl0bGVCb3guc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgKChwcm9wcy5vdXRlcldpZHRoIC0gdGhpcy50aXRsZUJveC5vZmZzZXRXaWR0aCkgLyAyKSkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCAtIHByb3BzLm1hcmdpblRvcCAtIDU1KSArICdweCknO1xuXHRcdHRoaXMudGl0bGVQcm9wb3J0aW9ucy5pbm5lckhUTUwgPSBwcm9wcy5vdXRlcldpZHRoICsgJyB4ICcgKyBwcm9wcy5vdXRlckhlaWdodDtcblxuXHR9LFxuXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudGl0bGVCb3guc3R5bGUub3BhY2l0eSA9IDE7XG5cdH0sXG5cblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0ZmlsbFJ1bGVzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciByZXNvbHZlZCA9IExheW91dE1vZGUubWF0Y2hlZFJ1bGVzO1xuXG5cdFx0dGhpcy50aXRsZURyb3Bkb3duLmVtcHR5KCk7XG5cdFx0JCgnPGxpPmlubGluZSBzdHlsZTwvbGk+JykuYXBwZW5kVG8odGhpcy50aXRsZURyb3Bkb3duKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc29sdmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQkKCc8bGk+JyArIHJlc29sdmVkW2ldLnNlbGVjdG9yVGV4dCArICc8L2xpPicpXG5cdFx0XHRcdC5kYXRhKCdjc3NSdWxlJywgcmVzb2x2ZWRbaV0pXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLnRpdGxlRHJvcGRvd24pO1xuXHRcdH1cblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgb3ZlcmxheSA9IExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQ7XG5cblx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMpIHtcblxuXHRcdC8vIHBhZGRpbmcgZ3VpZGVzXG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdMZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1wcm9wcy5vZmZzZXQudG9wIC1wcm9wcy5wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5sZWZ0ID0gLXByb3BzLnBhZGRpbmdMZWZ0ICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUucmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0LTEgKyAncHgnO1xuXG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS5ib3R0b20gPSAtcHJvcHMucGFkZGluZ0JvdHRvbS0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcHJvcHMub2Zmc2V0LmxlZnQgLXByb3BzLnBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudG9wID0gLXByb3BzLnBhZGRpbmdUb3AtMSArICdweCc7XG5cblx0XHQvLyBtYXJnaW4gZ3VpZGVzXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdC5zdHlsZS5sZWZ0ID0gLXByb3BzLnBhZGRpbmdMZWZ0IC1wcm9wcy5tYXJnaW5MZWZ0ICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtcHJvcHMub2Zmc2V0LnRvcCAtcHJvcHMucGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUucmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0IC1wcm9wcy5tYXJnaW5SaWdodCAtIDEgKyAncHgnO1xuXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXByb3BzLm9mZnNldC5sZWZ0IC1wcm9wcy5wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbS5zdHlsZS5ib3R0b20gPSAtcHJvcHMucGFkZGluZ0JvdHRvbSAtcHJvcHMubWFyZ2luQm90dG9tIC0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3Auc3R5bGUudG9wID0gLXByb3BzLnBhZGRpbmdUb3AgLXByb3BzLm1hcmdpblRvcCAtMSArICdweCc7XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXG5cdGVudGVyUnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jcmVhdGVHaG9zdHMoKTtcblx0fSxcblxuXHRjaGFuZ2VSdWxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3lHaG9zdHMoKTtcblx0XHR0aGlzLmNyZWF0ZUdob3N0cygpO1xuXHR9LFxuXG5cdGV4aXRSdWxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3lHaG9zdHMoKTtcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy51cGRhdGVHaG9zdHMoKTtcblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0Z2hvc3RzOiBbXSxcblxuXHRjcmVhdGVHaG9zdHM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBnaG9zdHMgPSB0aGlzLmdob3N0cztcblx0XHQkKExheW91dE1vZGUuc2VsZWN0ZWRSdWxlLnNlbGVjdG9yVGV4dCkubm90KExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLm5vdCgnLm92ZXJsYXksIC5vdmVybGF5IConKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGdob3N0ID0gbmV3IEdob3N0KHRoaXMpO1xuXHRcdFx0Z2hvc3QucmVsYXlvdXQoKTtcblx0XHRcdGdob3N0cy5wdXNoKGdob3N0KTtcblx0XHR9KTtcblx0fSxcblxuXHRkZXN0cm95R2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmdob3N0c1tpXS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdHRoaXMuZ2hvc3RzID0gW107XG5cdH0sXG5cblx0dXBkYXRlR2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRpZighdGhpcy5naG9zdHMpIHJldHVybjtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmdob3N0c1tpXS5yZWxheW91dCgpO1xuXHRcdH1cdFx0XG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScsIHRydWUpO1xuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICdub25lJztcblxuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuZm9jdXMoKTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJyk7XG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5zdHlsZS5vdXRsaW5lID0gJyc7XG5cblx0XHQkKGRvY3VtZW50KS5vZmYoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0a2V5dXA6IGZ1bmN0aW9uKCkge1xuXHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0JChkb2N1bWVudClcblx0XHRcdC5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlID09PSA5MSkgeyAvLyBjbWQga2V5XG5cdFx0XHRcdFx0dGhhdC5lbmFibGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5vbigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSA9PT0gOTEpIHsgLy8gY21kIGtleVxuXHRcdFx0XHRcdHRoYXQuZGlzYWJsZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZGlzYWJsZSgpO1xuXHR9LFxuXG5cdGhvdmVyVGFyZ2V0Q2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRpZih0aGlzLmVuYWJsZWQpXG5cdFx0XHR0aGlzLnByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljKGUpO1xuXG5cdFx0Ly8gaWYgd2UncmUgaG9sZGluZyBzaGlmdCBhbmQgaG92ZXIgYW5vdGhlciBlbGVtZW50LCBzaG93IGd1aWRlc1xuXHRcdGlmKHRoaXMuZW5hYmxlZCAmJlxuXHRcdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCAmJlxuXHRcdFx0TGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQgIT09IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuaG92ZXJFbGVtZW50LCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KSAmJlxuXHRcdFx0ISQuY29udGFpbnMoTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCwgTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpXG5cdFx0KSB7XG5cdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG8oTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qIG1lbWJlciBmdW5jdGlvbnMgKi9cblxuXHRlbmFibGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHRcdExheW91dE1vZGUuaGlkZSgpO1xuXG5cdFx0Ly9MYXlvdXRNb2RlLm92ZXIgPSBmYWxzZTtcblxuXHRcdC8vIHByb2Nlc3Mgb3ZlciBsb2dpYyBvbmNlXG5cdFx0aWYoTGF5b3V0TW9kZS5fX2xhc3RNb3VzZU1vdmVFdmVudClcblx0XHRcdHRoaXMucHJvY2Vzc0NvbW1hbmRPdmVyTG9naWMoTGF5b3V0TW9kZS5fX2xhc3RNb3VzZU1vdmVFdmVudCk7XG5cblx0XHQvLyB2aXN1YWxpemUgcmlnaHQgYXdheSB3aXRoIHdoYXQgd2UgcHJldmlvdXNseSBob3ZlcmVkXG5cdFx0aWYoTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQgIT09IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuaG92ZXJFbGVtZW50LCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KSAmJlxuXHRcdFx0ISQuY29udGFpbnMoTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCwgTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpXG5cdFx0KSB7XG5cdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG8oTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXHRcdHRoaXMuY29tbWFuZE92ZXIgPSBmYWxzZTtcblx0XHRpZih0aGlzLnZMaW5lWCkgdGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDA7XG5cdFx0aWYodGhpcy52TGluZVkpIHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdExheW91dE1vZGUuc2hvdygpO1xuXHR9LFxuXG5cdHByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgZXh0cmFNYXJnaW4gPSAxMDtcblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0Ly8gY29tbWFuZCBvdmVyL291dFxuXG5cdFx0aWYoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSBMYXlvdXRNb2RlLm1hcmdpbkxlZnQgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCArIGV4dHJhTWFyZ2luKSAmJlxuXHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCArIExheW91dE1vZGUubWFyZ2luQm90dG9tICsgZXh0cmFNYXJnaW4pXG5cdFx0KSB7XG5cblx0XHRcdGlmKCF0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdHRoaXMuY29tbWFuZE92ZXIgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG9XaW5kb3coKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGlmKHRoaXMuY29tbWFuZE92ZXIpIHtcblx0XHRcdFx0dGhpcy5jb21tYW5kT3ZlciA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0Y3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzOiBmdW5jdGlvbigpIHtcblxuXHRcdGlmKCF0aGlzLnZMaW5lWCkge1xuXHRcdFx0dGhpcy52TGluZVggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdHRoaXMudkxpbmVYLmNsYXNzTmFtZSA9ICd2bGluZS14Jztcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVgpO1xuXG5cdFx0XHR0aGlzLnZMaW5lWENhcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5jbGFzc05hbWUgPSAnY2FwdGlvbic7XG5cdFx0XHR0aGlzLnZMaW5lWC5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWENhcHRpb24pO1xuXG5cdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLmNsYXNzTmFtZSA9ICdjcm9zc2Jhcic7XG5cdFx0XHR0aGlzLnZMaW5lWC5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWENyb3NzQmFyKTtcblx0XHR9XG5cblx0XHRpZighdGhpcy52TGluZVkpIHtcblx0XHRcdHRoaXMudkxpbmVZID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWS5jbGFzc05hbWUgPSAndmxpbmUteSc7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudkxpbmVZKTtcblxuXHRcdFx0dGhpcy52TGluZVlDYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uY2xhc3NOYW1lID0gJ2NhcHRpb24nO1xuXHRcdFx0dGhpcy52TGluZVkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVlDYXB0aW9uKTtcblxuXHRcdFx0dGhpcy52TGluZVlDcm9zc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5jbGFzc05hbWUgPSAnY3Jvc3NiYXInO1xuXHRcdFx0dGhpcy52TGluZVkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVlDcm9zc0Jhcik7XG5cdFx0fVxuXG5cdH0sXG5cblx0dmlzdWFsaXplUmVsYXRpb25Ub1dpbmRvdzogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgY3VycmVudEVsZW1lbnQgPSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50O1xuXG5cdFx0dGhpcy5jcmVhdGVWaXN1YWxpemF0aW9uTGluZXMoKTtcblxuXHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IChMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQudG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpKSArICdweCc7XG5cdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IDAgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LmxlZnQgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQubGVmdCArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IChMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpKSArICdweCc7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gMCArICdweCc7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LnRvcCArICdweCc7XG5cdFx0dGhpcy52TGluZVlDYXB0aW9uLmlubmVySFRNTCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldC50b3AgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHR9LFxuXG5cdHZpc3VhbGl6ZVJlbGF0aW9uVG86IGZ1bmN0aW9uKHJlbGF0ZWRFbGVtZW50KSB7XG5cblx0XHR2YXIgY3VycmVudEVsZW1lbnQgPSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LCB0b3AsIGxlZnQ7XG5cdFx0dmFyIGN1cnJlbnRPZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cdFx0dmFyIHJlbGF0ZWRPZmZzZXQgPSAkKHJlbGF0ZWRFbGVtZW50KS5vZmZzZXQoKTtcblxuXHRcdHRoaXMuY3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzKCk7XG5cblx0XHR2YXIgcmVSaWdodEVkZ2UgPSByZWxhdGVkT2Zmc2V0LmxlZnQgKyByZWxhdGVkRWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHR2YXIgY2VSaWdodEVkZ2UgPSBjdXJyZW50T2Zmc2V0LmxlZnQgKyBjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHR2YXIgcmVMZWZ0RWRnZSA9IHJlbGF0ZWRPZmZzZXQubGVmdDtcblx0XHR2YXIgY2VMZWZ0RWRnZSA9IGN1cnJlbnRPZmZzZXQubGVmdDtcblxuXHRcdHZhciByZUJvdHRvbUVkZ2UgPSByZWxhdGVkT2Zmc2V0LnRvcCArIHJlbGF0ZWRFbGVtZW50Lm9mZnNldEhlaWdodDtcblx0XHR2YXIgY2VCb3R0b21FZGdlID0gY3VycmVudE9mZnNldC50b3AgKyBjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cdFx0dmFyIHJlVG9wRWRnZSA9IHJlbGF0ZWRPZmZzZXQudG9wO1xuXHRcdHZhciBjZVRvcEVkZ2UgPSBjdXJyZW50T2Zmc2V0LnRvcDtcblx0XHRcblx0XHQvLyBob3Jpem9udGFsIGNvbm5lY3Rpb25cblx0XHRpZihyZVJpZ2h0RWRnZSA8IGNlTGVmdEVkZ2UpIHtcblxuXHRcdFx0dG9wID0gY3VycmVudE9mZnNldC50b3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gcmVSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSBjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCB0b3ApIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSBpZih0b3AgPCByZVRvcEVkZ2UpIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChyZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZihjZVJpZ2h0RWRnZSA8IHJlTGVmdEVkZ2UpIHtcblxuXHRcdFx0dG9wID0gY3VycmVudE9mZnNldC50b3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gY2VSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSByZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCB0b3ApIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAoY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2UgaWYodG9wIDwgcmVUb3BFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdH1cblxuXHRcdC8vIHZlcnRpY2FsIGNvbm5lY3Rpb25cblx0XHRpZihyZUJvdHRvbUVkZ2UgPCBjZVRvcEVkZ2UpIHtcblxuXHRcdFx0bGVmdCA9IGN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSByZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSBjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVSaWdodEVkZ2UgPCBsZWZ0KSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAoY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2UgaWYobGVmdCA8IHJlTGVmdEVkZ2UpIHtcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChyZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZihjZUJvdHRvbUVkZ2UgPCByZVRvcEVkZ2UpIHtcblxuXHRcdFx0bGVmdCA9IGN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSBjZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gcmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSByZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVSaWdodEVkZ2UgPCBsZWZ0KSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIGlmKGxlZnQgPCByZUxlZnRFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdH1cblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdHByaW9yaXR5OiAwLFxuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLmhhbmRsZUhlaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1zaXplXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVXaWR0aCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgcmlnaHQgaGFuZGxlLXNpemVcIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KTtcblxuXHRcdHRoaXMuY2FwdGlvbldpZHRoID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi13aWR0aFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvbkhlaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24taGVpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHR0aGlzLmluaXREcmFnZ2VycygpO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vdmVySW5uZXIgPSBmYWxzZTtcblx0XHRMYXlvdXRNb2RlLm92ZXJTaXplID0gZmFsc2U7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbm5lcicpO1xuXHR9LFxuXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKHRoaXMub3ZlcklubmVyKSBMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLWlubmVyJyk7XG5cdH0sXG5cblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbm5lcicpO1xuXHR9LFxuXG5cdG1vdXNlbW92ZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIG92ZXIgaW5uZXIgYm94XG5cdFx0aWYoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICYmXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCAmJlxuXHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAtIExheW91dE1vZGUucGFkZGluZ1JpZ2h0KSAmJlxuXHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAtIExheW91dE1vZGUucGFkZGluZ0JvdHRvbSkgJiZcblx0XHRcdCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2hhbmRsZS1wYWRkaW5nJykgJiZcblx0XHRcdCFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2hhbmRsZS1tYXJnaW4nKVxuXHRcdCkge1xuXHRcdFx0aWYoIXRoaXMub3ZlcklubmVyKSB7XG5cdFx0XHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5uZXInKTtcblx0XHRcdFx0dGhpcy5vdmVySW5uZXIgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJJbm5lcikge1xuXHRcdFx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLWlubmVyJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5wcm9jZXNzT3ZlcldpZHRoKGUpO1xuXHRcdHRoaXMucHJvY2Vzc092ZXJIZWlnaHQoZSk7XG5cblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMsIGhhbmRsZVNpemUpIHtcblxuXHRcdHRoaXMuaGFuZGxlV2lkdGhbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZS55ICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZUhlaWdodFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemUueCArICdweCc7XG5cblx0XHR0aGlzLmhhbmRsZVdpZHRoWzBdLnN0eWxlLm1hcmdpblRvcCA9IChwcm9wcy5wYWRkaW5nUmlnaHQgPCAyMCA/ICgrKCgoaGFuZGxlU2l6ZS55IC8gNCkgKiBwcm9wcy5wYWRkaW5nUmlnaHQpIC8gNSkgLSAoaGFuZGxlU2l6ZS55ICogMS41KSkgOiAtKGhhbmRsZVNpemUueSAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdHRoaXMuY2FwdGlvbldpZHRoLnN0eWxlLm1hcmdpblRvcCA9IChwcm9wcy5wYWRkaW5nUmlnaHQgPCAyMCA/ICgrKCgoaGFuZGxlU2l6ZS55IC8gNCkgKiBwcm9wcy5wYWRkaW5nUmlnaHQpIC8gNSkgLSAoaGFuZGxlU2l6ZS55ICogMS41KSkgOiAtOCkgKyAncHgnO1xuXG5cdFx0dGhpcy5oYW5kbGVIZWlnaHRbMF0uc3R5bGUubWFyZ2luTGVmdCA9IChwcm9wcy5wYWRkaW5nQm90dG9tIDwgMjAgPyAoKygoKGhhbmRsZVNpemUueCAvIDQpICogcHJvcHMucGFkZGluZ0JvdHRvbSkgLyA1KSAtIChoYW5kbGVTaXplLnggKiAxLjUpKSA6IC0oaGFuZGxlU2l6ZS54IC8gMikpICsgJ3B4Jztcblx0XHR0aGlzLmNhcHRpb25IZWlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IChwcm9wcy5wYWRkaW5nQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemUueCAqIChwcm9wcy5wYWRkaW5nQm90dG9tIC8gMjApKSAtIGhhbmRsZVNpemUueCAqIDIgKyBoYW5kbGVTaXplLnggLSA5KSA6IC0xMCkgKyAncHgnO1xuXG5cdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHR9LFxuXG5cdC8qIG1lbWJlciBmdW5jdGlvbnMgKi9cblxuXHRwcm9jZXNzT3ZlcldpZHRoOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0Ly8gb3ZlciByaWdodCBzaWRlXG5cdFx0aWYoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICsgTGF5b3V0TW9kZS5pbm5lcldpZHRoIC0gNSAmJlxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLnBhZGRpbmdUb3AgJiZcblx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggLSBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodCkgJiZcblx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgLSBMYXlvdXRNb2RlLnBhZGRpbmdCb3R0b20pICYmXG5cdFx0XHQhZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdoYW5kbGUtcGFkZGluZycpICYmXG5cdFx0XHQhZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdoYW5kbGUtbWFyZ2luJylcblx0XHQpIHtcblxuXHRcdFx0aWYoIXRoaXMub3ZlcldpZHRoKSB7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLXdpZHRoJyk7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbldpZHRoLmNsYXNzTGlzdC5hZGQoJ292ZXInKTtcblx0XHRcdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCd3aWR0aCcpO1xuXHRcdFx0XHR0aGlzLm92ZXJXaWR0aCA9IHRydWU7XG5cdFx0XHRcdExheW91dE1vZGUub3ZlclNpemUgPSB0cnVlO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZih0aGlzLm92ZXJXaWR0aCkge1xuXHRcdFx0XHR0aGlzLm92ZXJXaWR0aCA9IGZhbHNlO1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJTaXplID0gZmFsc2U7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplLXdpZHRoJyk7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbldpZHRoLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTtcblx0XHRcdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5kZXNlbGVjdFJ1bGUoJ3dpZHRoJyk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSxcblxuXHRwcm9jZXNzT3ZlckhlaWdodDogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIG92ZXIgYm90dG9tIHNpZGVcblx0XHRpZihcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5wYWRkaW5nVG9wICsgTGF5b3V0TW9kZS5pbm5lckhlaWdodCAtIDUgJiZcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCArIExheW91dE1vZGUucGFkZGluZ0xlZnQgJiZcblx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgLSBMYXlvdXRNb2RlLnBhZGRpbmdCb3R0b20pICYmXG5cdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoIC0gTGF5b3V0TW9kZS5wYWRkaW5nUmlnaHQpICYmXG5cdFx0XHQhZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdoYW5kbGUtcGFkZGluZycpXG5cdFx0XHQmJiAhZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdoYW5kbGUtbWFyZ2luJylcblx0XHQpIHtcblxuXHRcdFx0aWYoIXRoaXMub3ZlckhlaWdodCkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZS1oZWlnaHQnKTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uSGVpZ2h0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTtcblx0XHRcdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCdoZWlnaHQnKTtcblx0XHRcdFx0dGhpcy5vdmVySGVpZ2h0ID0gdHJ1ZTtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVyU2l6ZSA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZih0aGlzLm92ZXJIZWlnaHQpIHtcblx0XHRcdFx0dGhpcy5vdmVySGVpZ2h0ID0gZmFsc2U7XG5cdFx0XHRcdExheW91dE1vZGUub3ZlclNpemUgPSBmYWxzZTtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdyZXNpemUtaGVpZ2h0Jyk7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdoZWlnaHQnKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG5cdHJlZnJlc2hDYXB0aW9uczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXHRcdHZhciBoaXRzUmlnaHRFZGdlO1xuXG5cdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdHRoaXMuY2FwdGlvbldpZHRoLmNsYXNzTGlzdFtoaXRzUmlnaHRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHR0aGlzLmNhcHRpb25XaWR0aC5pbm5lckhUTUwgPSAnPHNwYW4+d2lkdGg6IDwvc3Bhbj4nICsgTGF5b3V0TW9kZS5nZXRDYXB0aW9uUHJvcGVydHkoJ3dpZHRoJyk7XG5cdFx0dGhpcy5jYXB0aW9uV2lkdGguc3R5bGUucmlnaHQgPSAoaGl0c1JpZ2h0RWRnZSA/IDE2IDogLSh0aGlzLmNhcHRpb25XaWR0aC5vZmZzZXRXaWR0aCArIDEzKSkgKyAncHgnO1xuXG5cdFx0dGhpcy5jYXB0aW9uSGVpZ2h0LmlubmVySFRNTCA9ICc8c3Bhbj5oZWlnaHQ6IDwvc3Bhbj4nICsgTGF5b3V0TW9kZS5nZXRDYXB0aW9uUHJvcGVydHkoJ2hlaWdodCcpO1xuXG5cdH0sXG5cblx0aW5pdERyYWdnZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR2YXIgaXNUb3VjaCA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50O1xuXG5cdFx0Ly8gd2lkdGhcblx0XHQkKGRvY3VtZW50KS5vbihpc1RvdWNoID8gJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHRcdGlmKHRoYXQub3ZlcldpZHRoKSB7XG5cblx0XHRcdFx0dmFyIHN0YXJ0V2lkdGggPSBMYXlvdXRNb2RlLmlubmVyV2lkdGg7XG5cdFx0XHRcdExheW91dE1vZGUuc2V0TGFzdEFjdGl2ZVByb3BlcnR5KCd3aWR0aCcpO1xuXG5cdFx0XHRcdG5ldyBEcmFnZ2VyKGV2ZW50Lm9yaWdpbmFsRXZlbnQsIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbDogZmFsc2UsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gTGF5b3V0TW9kZS5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ3dpZHRoJywgc3RhcnRXaWR0aCAtIGRlbHRhKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1x0XG5cblx0XHRcdH0gZWxzZSBpZih0aGF0Lm92ZXJIZWlnaHQpIHtcblxuXHRcdFx0XHR2YXIgc3RhcnRIZWlnaHQgPSBMYXlvdXRNb2RlLmlubmVySGVpZ2h0O1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNldExhc3RBY3RpdmVQcm9wZXJ0eSgnaGVpZ2h0Jyk7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiB0cnVlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdoZWlnaHQnLCBzdGFydEhlaWdodCAtIGRlbHRhKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdHByaW9yaXR5OiAxLFxuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtcGFkZGluZ1wiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtcGFkZGluZ1wiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgdG9wIGhhbmRsZS1wYWRkaW5nXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgbGVmdCBoYW5kbGUtcGFkZGluZ1wiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlclRvcEhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJUb3BIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b20uaG92ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJCb3R0b21IYW5kbGUgPSB0cnVlO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyQm90dG9tSGFuZGxlID0gZmFsc2U7XG5cdFx0fSk7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlckxlZnRIYW5kbGUgPSB0cnVlO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyTGVmdEhhbmRsZSA9IGZhbHNlO1xuXHRcdH0pO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyUmlnaHRIYW5kbGUgPSB0cnVlO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyUmlnaHRIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblxuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHR0aGlzLmluaXREcmFnZ2VycygpO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdExheW91dE1vZGUub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLXBhZGRpbmcnKTtcblx0fSxcblxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRpZih0aGlzLm92ZXJQYWRkaW5nKSBMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLXBhZGRpbmcnKTtcblx0fSxcblxuXHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLXBhZGRpbmcnKTtcblx0fSxcblxuXHRtb3VzZW1vdmU6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdHZhciBvZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cdFx0dmFyIHdpZ2dsZSA9IDU7XG5cblx0XHR2YXIgb3ZlckxpbmVUb3AgPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAtIDUgJiZcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgNVxuXHRcdCk7XG5cblx0XHR2YXIgb3ZlckxpbmVCb3R0b20gPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgLSB3aWdnbGUgJiZcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCArIHdpZ2dsZVxuXHRcdCk7XG5cblx0XHR2YXIgb3ZlckxpbmVMZWZ0ID0gKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gd2lnZ2xlICYmXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyB3aWdnbGVcblx0XHQpO1xuXG5cdFx0dmFyIG92ZXJMaW5lUmlnaHQgPSAoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggLSB3aWdnbGUgJiZcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCArIHdpZ2dsZVxuXHRcdCk7XG5cblx0XHQvLyB0b3AgcGFkZGluZyBib3hcblx0XHR2YXIgb3ZlclBhZGRpbmdUb3AgPSAoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICYmIC8vbGVmdCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICsgTGF5b3V0TW9kZS5pbm5lcldpZHRoICYmIC8vIHJpZ2h0IHNpZGVcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICYmIC8vIHRvcCBzaWRlXG5cdFx0XHRlLnBhZ2VZIDwgb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCAvLyBib3R0b20gc2lkZVxuXHRcdCkgfHwgdGhpcy5vdmVyVG9wSGFuZGxlIHx8IG92ZXJMaW5lVG9wO1xuXG5cdFx0Ly8gYm90dG9tIHBhZGRpbmcgYm94XG5cdFx0dmFyIG92ZXJQYWRkaW5nQm90dG9tID0gKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCAmJiAvL2xlZnQgc2lkZVxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCArIExheW91dE1vZGUuaW5uZXJXaWR0aCAmJiAvLyByaWdodCBzaWRlXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgLSBMYXlvdXRNb2RlLnBhZGRpbmdCb3R0b20gJiYgLy8gdG9wIHNpZGVcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAvLyBib3R0b20gc2lkZVxuXHRcdCkgfHwgdGhpcy5vdmVyQm90dG9tSGFuZGxlIHx8IG92ZXJMaW5lQm90dG9tO1xuXG5cdFx0Ly8gbGVmdCBwYWRkaW5nIGJveFxuXHRcdHZhciBvdmVyUGFkZGluZ0xlZnQgPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCAmJiAvL2xlZnQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLnBhZGRpbmdUb3AgKyBMYXlvdXRNb2RlLmlubmVySGVpZ2h0ICYmIC8vIHJpZ2h0IHNpZGVcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAmJiAvLyB0b3Agc2lkZVxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCAvLyBib3R0b20gc2lkZVxuXHRcdCkgfHwgdGhpcy5vdmVyTGVmdEhhbmRsZSB8fCBvdmVyTGluZUxlZnQ7XG5cblx0XHQvLyByaWdodCBwYWRkaW5nIGJveFxuXHRcdHZhciBvdmVyUGFkZGluZ1JpZ2h0ID0gKFxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLnBhZGRpbmdUb3AgJiYgLy9sZWZ0IHNpZGVcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5wYWRkaW5nVG9wICsgTGF5b3V0TW9kZS5pbm5lckhlaWdodCAmJiAvLyByaWdodCBzaWRlXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggLSBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodCAmJiAvLyB0b3Agc2lkZVxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoIC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJSaWdodEhhbmRsZSB8fCBvdmVyTGluZVJpZ2h0O1xuXG5cdFx0dmFyIG5vdE92ZXJDb21wZXRpbmdIYW5kbGUgPSAhTGF5b3V0TW9kZS5vdmVyU2l6ZSAmJiAhZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdoYW5kbGUtbWFyZ2luJyk7XG5cblx0XHQvLyBpZiBvdmVyIGFueSBwYWRkaW5nIGFyZWEsIHNob3cgcGFkZGluZyBoYW5kbGVzXG5cdFx0aWYoXG5cdFx0XHQob3ZlclBhZGRpbmdUb3AgfHxcblx0XHRcdG92ZXJQYWRkaW5nQm90dG9tIHx8XG5cdFx0XHRvdmVyUGFkZGluZ0xlZnQgfHxcblx0XHRcdG92ZXJQYWRkaW5nUmlnaHQpICYmIG5vdE92ZXJDb21wZXRpbmdIYW5kbGVcblx0XHQpIHtcblx0XHRcdGlmKCF0aGlzLm92ZXJQYWRkaW5nKSB7XG5cdFx0XHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItcGFkZGluZycpO1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nID0gdHJ1ZTtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVyUGFkZGluZyA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmcpIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJQYWRkaW5nID0gZmFsc2U7XG5cdFx0XHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItcGFkZGluZycpO1x0XHRcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgY3Vyc29yQWRkZWQgPSBmYWxzZTtcblx0XHR2YXIgY3Vyc29yUmVtb3ZlZCA9IGZhbHNlO1xuXG5cdFx0aWYob3ZlclBhZGRpbmdUb3AgJiYgbm90T3ZlckNvbXBldGluZ0hhbmRsZSkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmdUb3ApIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ1RvcCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3AuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZS1wYWRkaW5nLXRvcCcpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNlbGVjdFJ1bGUoJ3BhZGRpbmdUb3AnKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJQYWRkaW5nVG9wKSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdUb3AgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdwYWRkaW5nVG9wJyk7XG5cdFx0XHRcdGN1cnNvclJlbW92ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKG92ZXJQYWRkaW5nQm90dG9tICYmIG5vdE92ZXJDb21wZXRpbmdIYW5kbGUpIHtcblx0XHRcdGlmKCF0aGlzLm92ZXJQYWRkaW5nQm90dG9tKSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdCb3R0b20gPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tLmNsYXNzTGlzdC5hZGQoJ292ZXInKTtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdyZXNpemUtcGFkZGluZy1ib3R0b20nKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCdwYWRkaW5nQm90dG9tJyk7XG5cdFx0XHRcdGN1cnNvckFkZGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZ0JvdHRvbSkge1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nQm90dG9tID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLmRlc2VsZWN0UnVsZSgncGFkZGluZ0JvdHRvbScpO1xuXHRcdFx0XHRjdXJzb3JSZW1vdmVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZihvdmVyUGFkZGluZ0xlZnQgJiYgbm90T3ZlckNvbXBldGluZ0hhbmRsZSkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmdMZWZ0KSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdMZWZ0ID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZS1wYWRkaW5nLWxlZnQnKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCdwYWRkaW5nTGVmdCcpO1xuXHRcdFx0XHRjdXJzb3JBZGRlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmdMZWZ0KSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdMZWZ0ID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5kZXNlbGVjdFJ1bGUoJ3BhZGRpbmdMZWZ0Jyk7XG5cdFx0XHRcdGN1cnNvclJlbW92ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKG92ZXJQYWRkaW5nUmlnaHQgJiYgbm90T3ZlckNvbXBldGluZ0hhbmRsZSkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmdSaWdodCkge1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nUmlnaHQgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZS1wYWRkaW5nLXJpZ2h0Jyk7XG5cdFx0XHRcdExheW91dE1vZGUuc2VsZWN0UnVsZSgncGFkZGluZ1JpZ2h0Jyk7XG5cdFx0XHRcdGN1cnNvckFkZGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZ1JpZ2h0KSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdSaWdodCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLmRlc2VsZWN0UnVsZSgncGFkZGluZ1JpZ2h0Jyk7XG5cdFx0XHRcdGN1cnNvclJlbW92ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKCFjdXJzb3JBZGRlZCAmJiBjdXJzb3JSZW1vdmVkKSB7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3Jlc2l6ZS1wYWRkaW5nLXRvcCcsICdyZXNpemUtcGFkZGluZy1ib3R0b20nLCAncmVzaXplLXBhZGRpbmctbGVmdCcsICdyZXNpemUtcGFkZGluZy1yaWdodCcpO1xuXHRcdH1cblxuXHR9LFxuXG5cdHJlbGF5b3V0OiBmdW5jdGlvbihwcm9wcywgaGFuZGxlU2l6ZSkge1xuXG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplLnkgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemUueSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZS54ICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b21bMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplLnggKyAncHgnO1xuXG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAtcHJvcHMucGFkZGluZ0xlZnQgKyAncHgsIDBweCknO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdLnN0eWxlLm1hcmdpblJpZ2h0ID0gLXByb3BzLnBhZGRpbmdSaWdodCArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgLXByb3BzLnBhZGRpbmdUb3AgKyAncHgpJztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b21bMF0uc3R5bGUubWFyZ2luQm90dG9tID0gIC1wcm9wcy5wYWRkaW5nQm90dG9tICsgJ3B4JztcblxuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0xlZnRbMF0uc3R5bGUubWFyZ2luVG9wID0gLShoYW5kbGVTaXplLnkgLyAyKSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gLShoYW5kbGVTaXplLnkgLyAyKSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKGhhbmRsZVNpemUueCAvIDIpICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b21bMF0uc3R5bGUubWFyZ2luTGVmdCA9IC0oaGFuZGxlU2l6ZS54IC8gMikgKyAncHgnO1xuXG5cdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHR9LFxuXG5cdC8qIG1lbWJlciBmdW5jdGlvbnMgKi9cblxuXHRyZWZyZXNoQ2FwdGlvbnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIGNhcHRpb25zXG5cdFx0dmFyIGhpdHNSaWdodEVkZ2UsIGhpdHNMZWZ0RWRnZTtcblxuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLWxlZnQ6IDwvc3Bhbj4nICsgTGF5b3V0TW9kZS5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdMZWZ0Jyk7XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0LmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLXJpZ2h0OiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCdwYWRkaW5nUmlnaHQnKTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wLmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLXRvcDogPC9zcGFuPicgKyBMYXlvdXRNb2RlLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ1RvcCcpO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctYm90dG9tOiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCdwYWRkaW5nQm90dG9tJyk7XG5cblx0XHRoaXRzTGVmdEVkZ2UgPSAob2Zmc2V0LmxlZnQgLSA4MCA8IDApO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdFtoaXRzTGVmdEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LnN0eWxlLm1hcmdpblJpZ2h0ID0gKGhpdHNMZWZ0RWRnZSA/IExheW91dE1vZGUucGFkZGluZ0xlZnQgLSB0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5vZmZzZXRXaWR0aC0xNiA6IExheW91dE1vZGUucGFkZGluZ0xlZnQgKyAxNCkgKyAncHgnO1xuXG5cdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAoaGl0c1JpZ2h0RWRnZSA/IExheW91dE1vZGUucGFkZGluZ1JpZ2h0IC0gdGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0Lm9mZnNldFdpZHRoLTE2IDogTGF5b3V0TW9kZS5wYWRkaW5nUmlnaHQgKyAxNCkgKyAncHgnO1xuXG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0JvdHRvbS5zdHlsZS5ib3R0b20gPSAtKExheW91dE1vZGUucGFkZGluZ0JvdHRvbSAgKyAyNCkgKyAncHgnO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3Auc3R5bGUudG9wID0gLShMYXlvdXRNb2RlLnBhZGRpbmdUb3AgICsgMjQpICsgJ3B4JztcblxuXHR9LFxuXG5cdGluaXREcmFnZ2VyczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIGlzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudDtcblxuXHRcdC8vIHBhZGRpbmcgYm90dG9tXG5cdFx0JChkb2N1bWVudCkub24oaXNUb3VjaCA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0XHR2YXIgc3RhcnRQYWRkaW5nQm90dG9tLFxuXHRcdFx0XHRzdGFydFBhZGRpbmdUb3AsXG5cdFx0XHRcdHN0YXJ0UGFkZGluZ1JpZ2h0LFxuXHRcdFx0XHRzdGFydFBhZGRpbmdMZWZ0O1xuXG5cdFx0XHRpZih0aGF0Lm92ZXJQYWRkaW5nQm90dG9tKSB7XG5cblx0XHRcdFx0c3RhcnRQYWRkaW5nQm90dG9tID0gTGF5b3V0TW9kZS5wYWRkaW5nQm90dG9tO1xuXHRcdFx0XHRzdGFydFBhZGRpbmdUb3AgPSBMYXlvdXRNb2RlLnBhZGRpbmdUb3A7XG5cdFx0XHRcdExheW91dE1vZGUuc2V0TGFzdEFjdGl2ZVByb3BlcnR5KCdwYWRkaW5nQm90dG9tJyk7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiB0cnVlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdwYWRkaW5nQm90dG9tJywgc3RhcnRQYWRkaW5nQm90dG9tIC0gZGVsdGEpO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5jaGFuZ2VWYWx1ZSgncGFkZGluZ1RvcCcsIExheW91dE1vZGUuYWx0UHJlc3NlZCA/IHN0YXJ0UGFkZGluZ0JvdHRvbSAtIGRlbHRhIDogc3RhcnRQYWRkaW5nVG9wLCB0cnVlKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmKHRoYXQub3ZlclBhZGRpbmdUb3ApIHtcblxuXHRcdFx0XHRzdGFydFBhZGRpbmdUb3AgPSBMYXlvdXRNb2RlLnBhZGRpbmdUb3A7XG5cdFx0XHRcdHN0YXJ0UGFkZGluZ0JvdHRvbSA9IExheW91dE1vZGUucGFkZGluZ0JvdHRvbTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZXRMYXN0QWN0aXZlUHJvcGVydHkoJ3BhZGRpbmdUb3AnKTtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IHRydWUsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gTGF5b3V0TW9kZS5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ3BhZGRpbmdUb3AnLCBzdGFydFBhZGRpbmdUb3AgKyBkZWx0YSk7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdwYWRkaW5nQm90dG9tJywgTGF5b3V0TW9kZS5hbHRQcmVzc2VkID8gc3RhcnRQYWRkaW5nVG9wICsgZGVsdGEgOiBzdGFydFBhZGRpbmdCb3R0b20sIHRydWUpO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYodGhhdC5vdmVyUGFkZGluZ1JpZ2h0KSB7XG5cblx0XHRcdFx0c3RhcnRQYWRkaW5nUmlnaHQgPSBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodDtcblx0XHRcdFx0c3RhcnRQYWRkaW5nTGVmdCA9IExheW91dE1vZGUucGFkZGluZ0xlZnQ7XG5cdFx0XHRcdExheW91dE1vZGUuc2V0TGFzdEFjdGl2ZVByb3BlcnR5KCdwYWRkaW5nUmlnaHQnKTtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IGZhbHNlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdwYWRkaW5nUmlnaHQnLCBzdGFydFBhZGRpbmdSaWdodCAtIGRlbHRhKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ3BhZGRpbmdMZWZ0JywgTGF5b3V0TW9kZS5hbHRQcmVzc2VkID8gKHN0YXJ0UGFkZGluZ1JpZ2h0IC0gZGVsdGEpIDogc3RhcnRQYWRkaW5nTGVmdCwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGF0Lm92ZXJQYWRkaW5nTGVmdCkge1xuXG5cdFx0XHRcdHN0YXJ0UGFkZGluZ0xlZnQgPSBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0O1xuXHRcdFx0XHRzdGFydFBhZGRpbmdSaWdodCA9IExheW91dE1vZGUucGFkZGluZ1JpZ2h0O1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNldExhc3RBY3RpdmVQcm9wZXJ0eSgncGFkZGluZ0xlZnQnKTtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IGZhbHNlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdwYWRkaW5nTGVmdCcsIHN0YXJ0UGFkZGluZ0xlZnQgKyBkZWx0YSk7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdwYWRkaW5nUmlnaHQnLCBMYXlvdXRNb2RlLmFsdFByZXNzZWQgPyAoc3RhcnRQYWRkaW5nTGVmdCArIGRlbHRhKSA6IHN0YXJ0UGFkZGluZ1JpZ2h0LCB0cnVlKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdHByaW9yaXR5OiAyLFxuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1tYXJnaW5cIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KTtcblx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtbWFyZ2luXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHRvcCBoYW5kbGUtbWFyZ2luXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBsZWZ0IGhhbmRsZS1tYXJnaW5cIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KTtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlclRvcEhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJUb3BIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbS5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlckJvdHRvbUhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJCb3R0b21IYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnQuaG92ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJMZWZ0SGFuZGxlID0gdHJ1ZTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlckxlZnRIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyUmlnaHRIYW5kbGUgPSB0cnVlO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyUmlnaHRIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblxuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0dGhpcy5pbml0RHJhZ2dlcnMoKTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItbWFyZ2luJyk7XG5cdH0sXG5cblx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0aWYodGhpcy5vdmVyTWFyZ2luKSBMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLW1hcmdpbicpO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItbWFyZ2luJyk7XG5cdH0sXG5cblx0bW91c2Vtb3ZlOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXHRcdHZhciB3aWdnbGUgPSA1O1xuXG5cdFx0dmFyIG92ZXJMaW5lVG9wID0gKFxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCArIHdpZ2dsZVxuXHRcdCk7XG5cblx0XHR2YXIgb3ZlckxpbmVCb3R0b20gPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgKyBMYXlvdXRNb2RlLm1hcmdpbkJvdHRvbSAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0ICsgTGF5b3V0TW9kZS5tYXJnaW5Cb3R0b20gKyB3aWdnbGVcblx0XHQpO1xuXG5cdFx0dmFyIG92ZXJMaW5lTGVmdCA9IChcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAtIExheW91dE1vZGUubWFyZ2luTGVmdCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0IC0gTGF5b3V0TW9kZS5tYXJnaW5MZWZ0ICsgd2lnZ2xlXG5cdFx0KTtcblxuXHRcdHZhciBvdmVyTGluZVJpZ2h0ID0gKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCArIHdpZ2dsZVxuXHRcdCk7XG5cblx0XHQvLyB0b3AgbWFyZ2luIGJveFxuXHRcdHZhciBvdmVyTWFyZ2luVG9wID0gKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICYmIC8vbGVmdCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggJiYgLy8gcmlnaHQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCAmJiAvLyB0b3Agc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgLy8gYm90dG9tIHNpZGVcblx0XHQpIHx8IHRoaXMub3ZlclRvcEhhbmRsZSB8fCBvdmVyTGluZVRvcDtcblxuXHRcdC8vIGJvdHRvbSBtYXJnaW4gYm94XG5cdFx0dmFyIG92ZXJNYXJnaW5Cb3R0b20gPSAoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgJiYgLy9sZWZ0IHNpZGVcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAmJiAvLyByaWdodCBzaWRlXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgJiYgLy8gdG9wIHNpZGVcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCArIExheW91dE1vZGUubWFyZ2luQm90dG9tIC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJCb3R0b21IYW5kbGUgfHwgb3ZlckxpbmVCb3R0b207XG5cblx0XHQvLyBsZWZ0IG1hcmdpbiBib3hcblx0XHR2YXIgb3Zlck1hcmdpbkxlZnQgPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAmJiAvL2xlZnQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0ICYmIC8vIHJpZ2h0IHNpZGVcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAtIExheW91dE1vZGUubWFyZ2luTGVmdCAmJiAvLyB0b3Agc2lkZVxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0IC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJMZWZ0SGFuZGxlIHx8IG92ZXJMaW5lTGVmdDtcblxuXHRcdC8vIHJpZ2h0IG1hcmdpbiBib3hcblx0XHR2YXIgb3Zlck1hcmdpblJpZ2h0ID0gKFxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgJiYgLy9sZWZ0IHNpZGVcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAmJiAvLyByaWdodCBzaWRlXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggJiYgLy8gdG9wIHNpZGVcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCArIExheW91dE1vZGUubWFyZ2luUmlnaHQgLy8gYm90dG9tIHNpZGVcblx0XHQpIHx8IHRoaXMub3ZlclJpZ2h0SGFuZGxlIHx8IG92ZXJMaW5lUmlnaHQ7XG5cblx0XHR2YXIgbm90T3ZlckNvbXBldGluZ0hhbmRsZSA9ICFMYXlvdXRNb2RlLm92ZXJTaXplICYmICFMYXlvdXRNb2RlLm92ZXJQYWRkaW5nICYmICFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2hhbmRsZS1wYWRkaW5nJyk7XG5cblx0XHQvLyBpZiBvdmVyIGFueSBtYXJnaW4gYXJlYSwgc2hvdyBtYXJnaW4gaGFuZGxlc1xuXHRcdGlmKFxuXHRcdFx0KG92ZXJNYXJnaW5Ub3AgfHxcblx0XHRcdG92ZXJNYXJnaW5Cb3R0b20gfHxcblx0XHRcdG92ZXJNYXJnaW5MZWZ0IHx8XG5cdFx0XHRvdmVyTWFyZ2luUmlnaHQpICYmIG5vdE92ZXJDb21wZXRpbmdIYW5kbGVcblx0XHQpIHtcblx0XHRcdGlmKCF0aGlzLm92ZXJNYXJnaW4pIHtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1tYXJnaW4nKTtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luKSB7XG5cdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLW1hcmdpbicpO1x0XHRcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgY3Vyc29yQWRkZWQgPSBmYWxzZTtcblx0XHR2YXIgY3Vyc29yUmVtb3ZlZCA9IGZhbHNlO1xuXG5cdFx0aWYob3Zlck1hcmdpblRvcCAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyTWFyZ2luVG9wKSB7XG5cdFx0XHRcdHRoaXMub3Zlck1hcmdpblRvcCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLW1hcmdpbi10b3AnKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCdtYXJnaW5Ub3AnKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJNYXJnaW5Ub3ApIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luVG9wID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdtYXJnaW5Ub3AnKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYob3Zlck1hcmdpbkJvdHRvbSAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyTWFyZ2luQm90dG9tKSB7XG5cdFx0XHRcdHRoaXMub3Zlck1hcmdpbkJvdHRvbSA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLW1hcmdpbi1ib3R0b20nKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCdtYXJnaW5Cb3R0b20nKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJNYXJnaW5Cb3R0b20pIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luQm90dG9tID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdtYXJnaW5Cb3R0b20nKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYob3Zlck1hcmdpbkxlZnQgJiYgbm90T3ZlckNvbXBldGluZ0hhbmRsZSkge1xuXHRcdFx0aWYoIXRoaXMub3Zlck1hcmdpbkxlZnQpIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luTGVmdCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZS1tYXJnaW4tbGVmdCcpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNlbGVjdFJ1bGUoJ21hcmdpbkxlZnQnKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJNYXJnaW5MZWZ0KSB7XG5cdFx0XHRcdHRoaXMub3Zlck1hcmdpbkxlZnQgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdtYXJnaW5MZWZ0Jyk7XG5cdFx0XHRcdGN1cnNvclJlbW92ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKG92ZXJNYXJnaW5SaWdodCAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyTWFyZ2luUmlnaHQpIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luUmlnaHQgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLW1hcmdpbi1yaWdodCcpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNlbGVjdFJ1bGUoJ21hcmdpblJpZ2h0Jyk7XG5cdFx0XHRcdGN1cnNvckFkZGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luUmlnaHQpIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luUmlnaHQgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLmRlc2VsZWN0UnVsZSgnbWFyZ2luUmlnaHQnKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoIWN1cnNvckFkZGVkICYmIGN1cnNvclJlbW92ZWQpIHtcblx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplLW1hcmdpbi10b3AnLCAncmVzaXplLW1hcmdpbi1ib3R0b20nLCAncmVzaXplLW1hcmdpbi1sZWZ0JywgJ3Jlc2l6ZS1tYXJnaW4tcmlnaHQnKTtcblx0XHR9XG5cblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMsIGhhbmRsZVNpemUpIHtcblxuXHRcdHRoaXMuaGFuZGxlTWFyZ2luTGVmdFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplLnkgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlTWFyZ2luUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZS55ICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemUueCArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplLnggKyAncHgnO1xuXG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKHByb3BzLnBhZGRpbmdMZWZ0ICsgcHJvcHMubWFyZ2luTGVmdCkgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlTWFyZ2luUmlnaHRbMF0uc3R5bGUubWFyZ2luUmlnaHQgPSAtKHByb3BzLnBhZGRpbmdSaWdodCArIHByb3BzLm1hcmdpblJpZ2h0KSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3BbMF0uc3R5bGUubWFyZ2luVG9wID0gLShwcm9wcy5wYWRkaW5nVG9wICsgcHJvcHMubWFyZ2luVG9wKSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUubWFyZ2luQm90dG9tID0gLShwcm9wcy5wYWRkaW5nQm90dG9tICsgcHJvcHMubWFyZ2luQm90dG9tKSArICdweCc7XG5cblx0XHQvLyBvZmZzZXQgbWFnaWNcblx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUubWFyZ2luVG9wID0gKHByb3BzLm1hcmdpbkxlZnQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZS55IC8gNCkgKiBwcm9wcy5tYXJnaW5MZWZ0KSAvIDUpICsgKGhhbmRsZVNpemUueSAvIDIpKSA6IC0oaGFuZGxlU2l6ZS55IC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5Ub3AgPSAocHJvcHMubWFyZ2luTGVmdCA8IDIwID8gKC0oKChoYW5kbGVTaXplLnkgLyA0KSAqIHByb3BzLm1hcmdpbkxlZnQpIC8gNSkgLSA4ICsgaGFuZGxlU2l6ZS55KSA6IC04KSArICdweCc7XG5cdFx0XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAocHJvcHMubWFyZ2luUmlnaHQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZS55IC8gNCkgKiBwcm9wcy5tYXJnaW5SaWdodCkgLyA1KSArIChoYW5kbGVTaXplLnkgLyAyKSkgOiAtKGhhbmRsZVNpemUueSAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0LnN0eWxlLm1hcmdpblRvcCA9IChwcm9wcy5tYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplLnkgLyA0KSAqIHByb3BzLm1hcmdpblJpZ2h0KSAvIDUpIC0gOCArIGhhbmRsZVNpemUueSkgOiAtOCkgKyAncHgnO1xuXHRcdFxuXHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMubWFyZ2luVG9wIDwgMjAgPyAoLSgoKGhhbmRsZVNpemUueCAvIDQpICogcHJvcHMubWFyZ2luVG9wKSAvIDUpICsgKGhhbmRsZVNpemUueCAvIDIpKSA6IC0oaGFuZGxlU2l6ZS54IC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMubWFyZ2luVG9wIDwgMjAgPyAoKGhhbmRsZVNpemUueCkgKyAoLShoYW5kbGVTaXplLngpICogKHByb3BzLm1hcmdpblRvcCAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXHRcdFxuXHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMubWFyZ2luQm90dG9tIDwgMjAgPyAoLSgoKGhhbmRsZVNpemUueCAvIDQpICogcHJvcHMubWFyZ2luQm90dG9tKSAvIDUpICsgKGhhbmRsZVNpemUueCAvIDIpKSA6IC0oaGFuZGxlU2l6ZS54IC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMubWFyZ2luQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemUueCkgKyAoLShoYW5kbGVTaXplLngpICogKHByb3BzLm1hcmdpbkJvdHRvbSAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXG5cdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHR9LFxuXG5cdC8qIG1lbWJlciBmdW5jdGlvbnMgKi9cblxuXHRyZWZyZXNoQ2FwdGlvbnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIGNhcHRpb25zXG5cdFx0dmFyIGhpdHNSaWdodEVkZ2UsIGhpdHNMZWZ0RWRnZTtcblxuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1sZWZ0OiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5MZWZ0Jyk7XG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1yaWdodDogPC9zcGFuPicgKyBMYXlvdXRNb2RlLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luUmlnaHQnKTtcblx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3AuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi10b3A6IDwvc3Bhbj4nICsgTGF5b3V0TW9kZS5nZXRDYXB0aW9uUHJvcGVydHkoJ21hcmdpblRvcCcpO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWJvdHRvbTogPC9zcGFuPicgKyBMYXlvdXRNb2RlLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luQm90dG9tJyk7XG5cblx0XHRoaXRzTGVmdEVkZ2UgPSAob2Zmc2V0LmxlZnQgLSBMYXlvdXRNb2RlLm1hcmdpbkxlZnQgLSA4MCA8IDApO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuY2xhc3NMaXN0W2hpdHNMZWZ0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5SaWdodCA9IExheW91dE1vZGUucGFkZGluZ0xlZnQgKyBMYXlvdXRNb2RlLm1hcmdpbkxlZnQgKyAoaGl0c0xlZnRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpbkxlZnQub2Zmc2V0V2lkdGgtMTcgOiAxNCkgKyAncHgnO1xuXG5cdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCArIExheW91dE1vZGUubWFyZ2luUmlnaHQgKyA4MCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcblx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IExheW91dE1vZGUucGFkZGluZ1JpZ2h0ICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCArIChoaXRzUmlnaHRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0Lm9mZnNldFdpZHRoLTE3IDogMTQpICsgJ3B4JztcblxuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5zdHlsZS5ib3R0b20gPSAtTGF5b3V0TW9kZS5tYXJnaW5Cb3R0b20gLUxheW91dE1vZGUucGFkZGluZ0JvdHRvbSAtMjQgKyAncHgnO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5zdHlsZS50b3AgPSAtTGF5b3V0TW9kZS5tYXJnaW5Ub3AgLUxheW91dE1vZGUucGFkZGluZ1RvcCAtMjQgKyAncHgnO1xuXG5cdH0sXG5cblx0aW5pdERyYWdnZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR2YXIgaXNUb3VjaCA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50O1xuXG5cdFx0Ly8gcGFkZGluZyBib3R0b21cblx0XHQkKGRvY3VtZW50KS5vbihpc1RvdWNoID8gJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHRcdHZhciBzdGFydE1hcmdpblJpZ2h0LFxuXHRcdFx0XHRzdGFydE1hcmdpbkxlZnQsXG5cdFx0XHRcdHN0YXJ0TWFyZ2luQm90dG9tLFxuXHRcdFx0XHRzdGFydE1hcmdpblRvcDtcblxuXHRcdFx0aWYodGhhdC5vdmVyTWFyZ2luTGVmdCkge1xuXG5cdFx0XHRcdHN0YXJ0TWFyZ2luTGVmdCA9IExheW91dE1vZGUubWFyZ2luTGVmdDtcblx0XHRcdFx0c3RhcnRNYXJnaW5SaWdodCA9IExheW91dE1vZGUubWFyZ2luUmlnaHQ7XG5cdFx0XHRcdExheW91dE1vZGUuc2V0TGFzdEFjdGl2ZVByb3BlcnR5KCdtYXJnaW5MZWZ0Jyk7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiBmYWxzZSxcblx0XHRcdFx0XHRtb3ZlOiBmdW5jdGlvbihkZWx0YSkge1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSBMYXlvdXRNb2RlLnNoaWZ0UHJlc3NlZCA/IGRlbHRhIDogZGVsdGEgLyA0O1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5jaGFuZ2VWYWx1ZSgnbWFyZ2luTGVmdCcsIHN0YXJ0TWFyZ2luTGVmdCArIGRlbHRhKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ21hcmdpblJpZ2h0JywgTGF5b3V0TW9kZS5hbHRQcmVzc2VkID8gc3RhcnRNYXJnaW5MZWZ0ICsgZGVsdGEgOiBzdGFydE1hcmdpblJpZ2h0LCB0cnVlKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmKHRoYXQub3Zlck1hcmdpblJpZ2h0KSB7XG5cblx0XHRcdFx0c3RhcnRNYXJnaW5MZWZ0ID0gTGF5b3V0TW9kZS5tYXJnaW5MZWZ0O1xuXHRcdFx0XHRzdGFydE1hcmdpblJpZ2h0ID0gTGF5b3V0TW9kZS5tYXJnaW5SaWdodDtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZXRMYXN0QWN0aXZlUHJvcGVydHkoJ21hcmdpblJpZ2h0Jyk7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiBmYWxzZSxcblx0XHRcdFx0XHRtb3ZlOiBmdW5jdGlvbihkZWx0YSkge1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSBMYXlvdXRNb2RlLnNoaWZ0UHJlc3NlZCA/IGRlbHRhIDogZGVsdGEgLyA0O1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5jaGFuZ2VWYWx1ZSgnbWFyZ2luUmlnaHQnLCBzdGFydE1hcmdpblJpZ2h0IC0gZGVsdGEpO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5jaGFuZ2VWYWx1ZSgnbWFyZ2luTGVmdCcsIExheW91dE1vZGUuYWx0UHJlc3NlZCA/IHN0YXJ0TWFyZ2luUmlnaHQgLSBkZWx0YSA6IHN0YXJ0TWFyZ2luTGVmdCwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGF0Lm92ZXJNYXJnaW5Ub3ApIHtcblxuXHRcdFx0XHRzdGFydE1hcmdpblRvcCA9IExheW91dE1vZGUubWFyZ2luVG9wO1xuXHRcdFx0XHRzdGFydE1hcmdpbkJvdHRvbSA9IExheW91dE1vZGUubWFyZ2luQm90dG9tO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNldExhc3RBY3RpdmVQcm9wZXJ0eSgnbWFyZ2luVG9wJyk7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiB0cnVlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdtYXJnaW5Ub3AnLCBzdGFydE1hcmdpblRvcCArIGRlbHRhKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ21hcmdpbkJvdHRvbScsIExheW91dE1vZGUuYWx0UHJlc3NlZCA/IHN0YXJ0TWFyZ2luVG9wICsgZGVsdGEgOiBzdGFydE1hcmdpbkJvdHRvbSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGF0Lm92ZXJNYXJnaW5Cb3R0b20pIHtcblxuXHRcdFx0XHRzdGFydE1hcmdpblRvcCA9IExheW91dE1vZGUubWFyZ2luVG9wO1xuXHRcdFx0XHRzdGFydE1hcmdpbkJvdHRvbSA9IExheW91dE1vZGUubWFyZ2luQm90dG9tO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNldExhc3RBY3RpdmVQcm9wZXJ0eSgnbWFyZ2luQm90dG9tJyk7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiB0cnVlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdtYXJnaW5Cb3R0b20nLCBzdGFydE1hcmdpbkJvdHRvbSAtIGRlbHRhKTtcblx0XHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ21hcmdpblRvcCcsIExheW91dE1vZGUuYWx0UHJlc3NlZCA/IHN0YXJ0TWFyZ2luQm90dG9tIC0gZGVsdGEgOiBzdGFydE1hcmdpblRvcCwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG5cblx0XHRcdGlmKCFMYXlvdXRNb2RlLmxhc3RBY3RpdmVQcm9wZXJ0eSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIHVwIG9yIGRvd25cblx0XHRcdGlmKGUua2V5Q29kZSA9PSAzOCB8fCBlLmtleUNvZGUgPT0gNDApIHtcblxuXHRcdFx0XHQvLyB0ZW1wb3JhcmlseSBzZWxlY3QgdGhlIGxhc3QgYWN0aXZlIHJ1bGVcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKExheW91dE1vZGUubGFzdEFjdGl2ZVByb3BlcnR5KTtcblxuXHRcdFx0XHRzd2l0Y2goTGF5b3V0TW9kZS5sYXN0QWN0aXZlUHJvcGVydHkpIHtcblx0XHRcdFx0Y2FzZSAnaGVpZ2h0Jzpcblx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdoZWlnaHQnLCBMYXlvdXRNb2RlLmlubmVySGVpZ2h0ICsgKGUua2V5Q29kZSA9PSAzOCA/IC0xIDogMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdwYWRkaW5nQm90dG9tJzpcblx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdwYWRkaW5nQm90dG9tJywgTGF5b3V0TW9kZS5wYWRkaW5nQm90dG9tICsgKGUua2V5Q29kZSA9PSAzOCA/IC0xIDogMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdtYXJnaW5Cb3R0b20nOlxuXHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ21hcmdpbkJvdHRvbScsIExheW91dE1vZGUubWFyZ2luQm90dG9tICsgKGUua2V5Q29kZSA9PSAzOCA/IC0xIDogMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdwYWRkaW5nVG9wJzpcblx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdwYWRkaW5nVG9wJywgTGF5b3V0TW9kZS5wYWRkaW5nVG9wICsgKGUua2V5Q29kZSA9PSAzOCA/IDEgOiAtMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdtYXJnaW5Ub3AnOlxuXHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ21hcmdpblRvcCcsIExheW91dE1vZGUubWFyZ2luVG9wICsgKGUua2V5Q29kZSA9PSAzOCA/IDEgOiAtMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cblx0XHRcdFx0Ly8gZGVzZWxlY3QgYWdhaW4uXG5cdFx0XHRcdC8vIFRPRE86IHJlc3RvcmUgaG92ZXIgc2VsZWN0aW9uIGZyb20gbW9kaWZ5IHBsdWdpbnNcblx0XHRcdFx0TGF5b3V0TW9kZS5kZXNlbGVjdFJ1bGUoTGF5b3V0TW9kZS5sYXN0QWN0aXZlUHJvcGVydHkpO1xuXG5cdFx0XHR9XG5cblx0XHRcdC8vIGxlZnQgb3IgcmlnaHRcblx0XHRcdGlmKGUua2V5Q29kZSA9PSAzOSB8fCBlLmtleUNvZGUgPT0gMzcpIHtcblxuXHRcdFx0XHQvLyB0ZW1wb3JhcmlseSBzZWxlY3QgdGhlIGxhc3QgYWN0aXZlIHJ1bGVcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKExheW91dE1vZGUubGFzdEFjdGl2ZVByb3BlcnR5KTtcblxuXHRcdFx0XHRzd2l0Y2goTGF5b3V0TW9kZS5sYXN0QWN0aXZlUHJvcGVydHkpIHtcblx0XHRcdFx0Y2FzZSAnd2lkdGgnOlxuXHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ3dpZHRoJywgTGF5b3V0TW9kZS5pbm5lcldpZHRoICsgKGUua2V5Q29kZSA9PSAzNyA/IC0xIDogMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdwYWRkaW5nUmlnaHQnOlxuXHRcdFx0XHRcdExheW91dE1vZGUuY2hhbmdlVmFsdWUoJ3BhZGRpbmdSaWdodCcsIExheW91dE1vZGUucGFkZGluZ1JpZ2h0ICsgKGUua2V5Q29kZSA9PSAzNyA/IC0xIDogMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdtYXJnaW5SaWdodCc6XG5cdFx0XHRcdFx0TGF5b3V0TW9kZS5jaGFuZ2VWYWx1ZSgnbWFyZ2luUmlnaHQnLCBMYXlvdXRNb2RlLm1hcmdpblJpZ2h0ICsgKGUua2V5Q29kZSA9PSAzNyA/IC0xIDogMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdwYWRkaW5nTGVmdCc6XG5cdFx0XHRcdFx0TGF5b3V0TW9kZS5jaGFuZ2VWYWx1ZSgncGFkZGluZ0xlZnQnLCBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICsgKGUua2V5Q29kZSA9PSAzNyA/IDEgOiAtMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlICdtYXJnaW5MZWZ0Jzpcblx0XHRcdFx0XHRMYXlvdXRNb2RlLmNoYW5nZVZhbHVlKCdtYXJnaW5MZWZ0JywgTGF5b3V0TW9kZS5tYXJnaW5MZWZ0ICsgKGUua2V5Q29kZSA9PSAzNyA/IDEgOiAtMSksIHRydWUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cblx0XHRcdFx0Ly8gZGVzZWxlY3QgYWdhaW4uXG5cdFx0XHRcdC8vIFRPRE86IHJlc3RvcmUgaG92ZXIgc2VsZWN0aW9uIGZyb20gbW9kaWZ5IHBsdWdpbnNcblx0XHRcdFx0TGF5b3V0TW9kZS5kZXNlbGVjdFJ1bGUoTGF5b3V0TW9kZS5sYXN0QWN0aXZlUHJvcGVydHkpO1xuXG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0fSxcblxuXHRhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLmNhbGN1bGF0ZVNuYXBBcmVhcygpO1xuXG5cdH0sXG5cblx0Y2hhbmdlVmFsdWU6IGZ1bmN0aW9uKHByb3BlcnR5LCB2YWx1ZSwgcHJlY2lzaW9uKSB7XG5cblx0XHQvLyBwcmVjaXNpb24gaXMgc2V0IGlmIHdlIGRvIGtleWJvYXJkLCBmb3IgaW5zdGFuY2UuXG5cdFx0Ly8gZG9uJ3QgYXBwbHkgc25hcCB0aGVyZS5cblx0XHRpZihwcmVjaXNpb24pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIGF4aXMgPSAvKHdpZHRofHBhZGRpbmdMZWZ0fHBhZGRpbmdSaWdodHxtYXJnaW5MZWZ0fG1hcmdpblJpZ2h0KS8udGVzdChwcm9wZXJ0eSkgPyAneCcgOiAneSc7XG5cdFx0cmV0dXJuIHBhcnNlSW50KHRoaXMuY2FsY3VsYXRlU25hcChwcm9wZXJ0eSwgdmFsdWUsIGF4aXMpKTtcblxuXHR9LFxuXG5cdC8qIG1lbWJlciBmdW5jdGlvbnMgKi9cblx0X19wcmV2aW91c1RhcmdldHM6IFtdLFxuXG5cdGZsYXNoOiBmdW5jdGlvbih0YXJnZXQsIGVkZ2UpIHtcblxuXHRcdC8vIGRvbid0IGZsYXNoIGEgdGFyZ2V0IHR3aWNlIGluIGEgcm93XG5cdFx0aWYodGhpcy5fX3ByZXZpb3VzVGFyZ2V0cy5pbmRleE9mKHRhcmdldCkgPiAtMSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX19wcmV2aW91c1RhcmdldHMucHVzaCh0YXJnZXQpO1xuXG5cdFx0Ly8gZGVsYXkgZXhlY3V0aW9uIG9mIHRoZSBmbGFzaCwgb3IgdGhlIHZhbHVlIGlzbid0IGFwcGxpZWQgeWV0XG5cdFx0Ly8gYW5kIHRoZSBjb3JyZWN0ZWQgb2Zmc2V0cyBhcmUgd3JvbmcuXG5cblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gcmVmcmVzaCByZWN0IG9yIHRoZSBvZmZzZXRzIG1pZ2h0IGJlIHdyb25nXG5cdFx0XHR0YXJnZXRbMV0gPSB0YXJnZXRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRcdGlmKGVkZ2UgPT09ICd3aWR0aCcpIHtcblxuXHRcdFx0XHR2YXIgdkxpbmVYID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHZMaW5lWC5jbGFzc05hbWUgPSAndmxpbmUteCc7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodkxpbmVYKTtcblxuXHRcdFx0XHR2YXIgdkxpbmVYQ2FwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHR2TGluZVhDYXB0aW9uLmNsYXNzTmFtZSA9ICdjYXB0aW9uJztcblx0XHRcdFx0dkxpbmVYLmFwcGVuZENoaWxkKHZMaW5lWENhcHRpb24pO1xuXG5cdFx0XHRcdHZhciB2TGluZVhDcm9zc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHR2TGluZVhDcm9zc0Jhci5jbGFzc05hbWUgPSAnY3Jvc3NiYXInO1xuXHRcdFx0XHR2TGluZVguYXBwZW5kQ2hpbGQodkxpbmVYQ3Jvc3NCYXIpO1xuXG5cdFx0XHRcdHZMaW5lWC5zdHlsZS50b3AgPSAodGFyZ2V0WzFdLnRvcCArICh0YXJnZXRbMV0uaGVpZ2h0IC8gMikpICsgJ3B4Jztcblx0XHRcdFx0dkxpbmVYLnN0eWxlLmxlZnQgPSB0YXJnZXRbMV0ubGVmdCArICdweCc7XG5cdFx0XHRcdHZMaW5lWC5zdHlsZS53aWR0aCA9IHRhcmdldFsxXVtlZGdlXSArICdweCc7XG5cdFx0XHRcdHZMaW5lWENhcHRpb24uaW5uZXJIVE1MID0gdGFyZ2V0WzFdW2VkZ2VdICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdFx0Ly8gdG8gYSBoaWRlIGFuaW1hdGlvbiwgdGhlbiByZW1vdmUgdGhlIERPTSBlbGVtZW50IGFuZCBhbGxvdyBpdFxuXHRcdFx0XHQvLyB0byBhcHBlYXIgYWdhaW4uXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICB2TGluZVguY2xhc3NMaXN0LmFkZCgnaGlkZScpOyB9LCA2MDApO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQodkxpbmVYKTtcblx0XHRcdFx0XHR2YXIgaW5kZXggPSB0aGF0Ll9fcHJldmlvdXNUYXJnZXRzLmluZGV4T2YodGFyZ2V0KTtcblx0XHRcdFx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX3ByZXZpb3VzVGFyZ2V0cy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgODAwKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZihlZGdlID09PSAnaGVpZ2h0Jykge1xuXG5cdFx0XHRcdHZhciB2TGluZVkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0dkxpbmVZLmNsYXNzTmFtZSA9ICd2bGluZS15Jztcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh2TGluZVkpO1xuXG5cdFx0XHRcdHZhciB2TGluZVlDYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHZMaW5lWUNhcHRpb24uY2xhc3NOYW1lID0gJ2NhcHRpb24nO1xuXHRcdFx0XHR2TGluZVkuYXBwZW5kQ2hpbGQodkxpbmVZQ2FwdGlvbik7XG5cblx0XHRcdFx0dmFyIHZMaW5lWUNyb3NzQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHZMaW5lWUNyb3NzQmFyLmNsYXNzTmFtZSA9ICdjcm9zc2Jhcic7XG5cdFx0XHRcdHZMaW5lWS5hcHBlbmRDaGlsZCh2TGluZVlDcm9zc0Jhcik7XG5cblx0XHRcdFx0dkxpbmVZLnN0eWxlLmxlZnQgPSAodGFyZ2V0WzFdLmxlZnQgKyAodGFyZ2V0WzFdLndpZHRoIC8gMikpICsgJ3B4Jztcblx0XHRcdFx0dkxpbmVZLnN0eWxlLnRvcCA9IHRhcmdldFsxXS50b3AgKyAncHgnO1xuXHRcdFx0XHR2TGluZVkuc3R5bGUuaGVpZ2h0ID0gdGFyZ2V0WzFdW2VkZ2VdICsgJ3B4Jztcblx0XHRcdFx0dkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSB0YXJnZXRbMV1bZWRnZV0gKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0XHQvLyB0byBhIGhpZGUgYW5pbWF0aW9uLCB0aGVuIHJlbW92ZSB0aGUgRE9NIGVsZW1lbnQgYW5kIGFsbG93IGl0XG5cdFx0XHRcdC8vIHRvIGFwcGVhciBhZ2Fpbi5cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHsgIHZMaW5lWS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7IH0sIDYwMCk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh2TGluZVkpO1xuXHRcdFx0XHRcdHZhciBpbmRleCA9IHRoYXQuX19wcmV2aW91c1RhcmdldHMuaW5kZXhPZih0YXJnZXQpO1xuXHRcdFx0XHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRcdFx0XHR0aGF0Ll9fcHJldmlvdXNUYXJnZXRzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCA4MDApO1xuXG5cdFx0XHR9XG5cblx0XHR9LCAwKTtcblxuXG5cblxuXHR9LFxuXG5cdGlzVmlzaWJsZTogZnVuY3Rpb24obm9kZSwgcmVjdHMpIHtcblxuXHRcdHZhciBvZmZzZXRUb3AgPSByZWN0cy50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcblx0XHR2YXIgb2Zmc2V0TGVmdCA9IHJlY3RzLnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXG5cdFx0aWYob2Zmc2V0VG9wID4gd2luZG93LmlubmVySGVpZ2h0IHx8XG5cdFx0XHRvZmZzZXRMZWZ0ID4gd2luZG93LmlubmVyV2lkdGggfHxcblx0XHRcdG9mZnNldFRvcCArIHJlY3RzLmhlaWdodCA8IDAgfHxcblx0XHRcdG9mZnNldExlZnQgKyByZWN0cy53aWR0aCA8IDApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblxuXHR9LFxuXG5cdGNhbGN1bGF0ZVNuYXBBcmVhczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIHN0YXJ0ID0gZG9jdW1lbnQuYm9keTtcblx0XHR2YXIgY2FuZGlkYXRlcyA9IFtdO1xuXG5cdFx0dmFyIGlzRWxpZ2libGUgPSBmdW5jdGlvbihub2RlLCByZWN0cykge1xuXG5cdFx0XHR2YXIgd2lkdGggPSByZWN0cy53aWR0aDtcblx0XHRcdHZhciBoZWlnaHQgPSByZWN0cy5oZWlnaHQ7XG5cblx0XHRcdGlmKHdpZHRoIDwgMTAwICYmIGhlaWdodCA8IDEwMCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmKG5vZGUuaWQgPT09ICdvdmVybGF5JyB8fFxuXHRcdFx0XHRub2RlLmNsYXNzTmFtZSA9PT0gJ292ZXJsYXktdGl0bGUnIHx8XG5cdFx0XHRcdG5vZGUgPT09IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighdGhhdC5pc1Zpc2libGUobm9kZSwgcmVjdHMpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9O1xuXG5cdFx0dmFyIHJlY3Vyc2UgPSBmdW5jdGlvbihub2RlKSB7XG5cblx0XHRcdC8vIG5vIGNoaWxkcmVuPyBleGl0XG5cdFx0XHRpZighbm9kZS5jaGlsZHJlbikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBjYW5kaWRhdGUsIHJlY3RzO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNhbmRpZGF0ZSA9IG5vZGUuY2hpbGRyZW5baV07XG5cdFx0XHRcdHJlY3RzID0gY2FuZGlkYXRlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRpZihpc0VsaWdpYmxlKGNhbmRpZGF0ZSwgcmVjdHMpKSB7XG5cdFx0XHRcdFx0Y2FuZGlkYXRlcy5wdXNoKFtjYW5kaWRhdGUsIHJlY3RzXSk7XG5cdFx0XHRcdFx0cmVjdXJzZShjYW5kaWRhdGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXG5cdFx0cmVjdXJzZShzdGFydCk7XG5cdFx0dGhpcy5jdXJyZW50U25hcFRhcmdldHMgPSBjYW5kaWRhdGVzO1xuXG5cdH0sXG5cblx0Y2FsY3VsYXRlU25hcDogZnVuY3Rpb24ocHJvcGVydHksIGN1cnJlbnRWYWx1ZSwgYXhpcykge1xuXG5cdFx0dmFyIHRocmVzaG9sZCA9IDU7XG5cdFx0dmFyIHRhcmdldHMgPSB0aGlzLmN1cnJlbnRTbmFwVGFyZ2V0cztcblx0XHR2YXIgdGFyZ2V0LCBpO1xuXG5cdFx0aWYoYXhpcyA9PT0gJ3knKSB7XG5cblx0XHRcdGZvciAoaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRhcmdldCA9IHRhcmdldHNbaV07XG5cblx0XHRcdFx0aWYocHJvcGVydHkgPT09ICdoZWlnaHQnKSB7XG5cdFx0XHRcdFx0aWYoTWF0aC5hYnModGFyZ2V0WzFdLmhlaWdodCAtIChjdXJyZW50VmFsdWUpKSA8PSB0aHJlc2hvbGQpIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IHRhcmdldFsxXS5oZWlnaHQ7XG5cdFx0XHRcdFx0XHR0aGlzLmZsYXNoKHRhcmdldCwgJ2hlaWdodCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHByb3BlcnR5ID09PSAncGFkZGluZ1RvcCcpIHtcblx0XHRcdFx0XHRpZihNYXRoLmFicyh0YXJnZXRbMV0uaGVpZ2h0IC0gKExheW91dE1vZGUucGFkZGluZ1RvcCArIExheW91dE1vZGUuaW5uZXJIZWlnaHQgKyBjdXJyZW50VmFsdWUpKSA8PSB0aHJlc2hvbGQpIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IHRhcmdldFsxXS5oZWlnaHQgLSAoTGF5b3V0TW9kZS5wYWRkaW5nVG9wICsgTGF5b3V0TW9kZS5pbm5lckhlaWdodCk7XG5cdFx0XHRcdFx0XHR0aGlzLmZsYXNoKHRhcmdldCwgJ2hlaWdodCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHByb3BlcnR5ID09PSAncGFkZGluZ0JvdHRvbScpIHtcblx0XHRcdFx0XHRpZihNYXRoLmFicyh0YXJnZXRbMV0uaGVpZ2h0IC0gKExheW91dE1vZGUucGFkZGluZ0JvdHRvbSArIExheW91dE1vZGUuaW5uZXJIZWlnaHQgKyBjdXJyZW50VmFsdWUpKSA8PSB0aHJlc2hvbGQpIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IHRhcmdldFsxXS5oZWlnaHQgLSAoTGF5b3V0TW9kZS5wYWRkaW5nQm90dG9tICsgTGF5b3V0TW9kZS5pbm5lckhlaWdodCk7XG5cdFx0XHRcdFx0XHR0aGlzLmZsYXNoKHRhcmdldCwgJ2hlaWdodCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgdGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0YXJnZXQgPSB0YXJnZXRzW2ldO1xuXG5cdFx0XHRcdGlmKHByb3BlcnR5ID09PSAnd2lkdGgnKSB7XG5cdFx0XHRcdFx0aWYoTWF0aC5hYnModGFyZ2V0WzFdLndpZHRoIC0gKGN1cnJlbnRWYWx1ZSkpIDw9IHRocmVzaG9sZCkge1xuXHRcdFx0XHRcdFx0Y3VycmVudFZhbHVlID0gdGFyZ2V0WzFdLndpZHRoO1xuXHRcdFx0XHRcdFx0dGhpcy5mbGFzaCh0YXJnZXQsICd3aWR0aCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHByb3BlcnR5ID09PSAncGFkZGluZ0xlZnQnKSB7XG5cdFx0XHRcdFx0aWYoTWF0aC5hYnModGFyZ2V0WzFdLndpZHRoIC0gKExheW91dE1vZGUucGFkZGluZ1JpZ2h0ICsgTGF5b3V0TW9kZS5pbm5lcldpZHRoICsgY3VycmVudFZhbHVlKSkgPD0gdGhyZXNob2xkKSB7XG5cdFx0XHRcdFx0XHRjdXJyZW50VmFsdWUgPSB0YXJnZXRbMV0ud2lkdGggLSAoTGF5b3V0TW9kZS5wYWRkaW5nUmlnaHQgKyBMYXlvdXRNb2RlLmlubmVyV2lkdGgpO1xuXHRcdFx0XHRcdFx0dGhpcy5mbGFzaCh0YXJnZXQsICd3aWR0aCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHByb3BlcnR5ID09PSAncGFkZGluZ1JpZ2h0Jykge1xuXHRcdFx0XHRcdGlmKE1hdGguYWJzKHRhcmdldFsxXS53aWR0aCAtIChMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICsgTGF5b3V0TW9kZS5pbm5lcldpZHRoICsgY3VycmVudFZhbHVlKSkgPD0gdGhyZXNob2xkKSB7XG5cdFx0XHRcdFx0XHRjdXJyZW50VmFsdWUgPSB0YXJnZXRbMV0ud2lkdGggLSAoTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCArIExheW91dE1vZGUuaW5uZXJXaWR0aCk7XG5cdFx0XHRcdFx0XHR0aGlzLmZsYXNoKHRhcmdldCwgJ3dpZHRoJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiBjdXJyZW50VmFsdWU7XG5cblx0fVxuXG59KTtcblxuXG5cbiIsIihmdW5jdGlvbigpIHtcblxuXHRMYXlvdXRNb2RlLmVuYWJsZSgpO1xuXG5cdC8vJCgndWwnKS5zb3J0YWJsZSgpO1xuXHQkKCcjdGVzdGJveCcpLmNsaWNrKCk7XG5cbn0pKCk7XG5cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
