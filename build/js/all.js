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

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.marginLeft = Math.round(Math.max(0, startMarginLeft + delta)) + 'px';
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.marginRight = LayoutMode.altPressed ? Math.round(Math.max(0, startMarginLeft + delta)) + 'px' : startMarginRight + 'px';
						LayoutMode.relayout();
					}
				});

			}

			if(that.overMarginRight) {

				startMarginLeft = LayoutMode.marginLeft;
				startMarginRight = LayoutMode.marginRight;

				new Dragger(event.originalEvent, {
					vertical: false,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.marginRight = Math.round(Math.max(0, startMarginRight - delta)) + 'px';
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.marginLeft = LayoutMode.altPressed ? Math.round(Math.max(0, startMarginRight - delta)) + 'px' : startMarginLeft + 'px';
						LayoutMode.relayout();
					}
				});

			}

			if(that.overMarginTop) {

				startMarginTop = LayoutMode.marginTop;
				startMarginBottom = LayoutMode.marginBottom;

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.marginTop = Math.round(Math.max(0, startMarginTop + delta)) + 'px';
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.marginBottom = LayoutMode.altPressed ? Math.round(Math.max(0, startMarginTop + delta)) + 'px' : startMarginBottom + 'px';
						LayoutMode.relayout();
					}
				});

			}

			if(that.overMarginBottom) {

				startMarginTop = LayoutMode.marginTop;
				startMarginBottom = LayoutMode.marginBottom;

				new Dragger(event.originalEvent, {
					vertical: true,
					move: function(delta) {
						delta = LayoutMode.shiftPressed ? delta : delta / 4;
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.marginBottom = Math.round(Math.max(0, startMarginBottom - delta)) + 'px';
						(LayoutMode.selectedRule || LayoutMode.currentElement).style.marginTop = LayoutMode.altPressed ? Math.round(Math.max(0, startMarginBottom - delta)) + 'px' : startMarginTop + 'px';
						LayoutMode.relayout();
					}
				});

			}

		});

	}

});
(function() {

	LayoutMode.enable();

	//$('ul').sortable();
	$('#testbox').click();

})();



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiRHJhZ2dlci5qcyIsIlN0eWxlUGFyc2VyLmpzIiwiTGF5b3V0TW9kZS5qcyIsIlRpdGxlLmpzIiwiR3VpZGVzLmpzIiwiR2hvc3RzLmpzIiwiQ29udGVudEVkaXRhYmxlLmpzIiwiQ29tcGFyZUFuZFByZXZpZXcuanMiLCJNb2RpZnlTaXplLmpzIiwiTW9kaWZ5UGFkZGluZy5qcyIsIk1vZGlmeU1hcmdpbi5qcyIsImluaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOVZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEdob3N0ID0gZnVuY3Rpb24oZWxlbSkge1xuXG5cdHRoaXMub3ZlcmxheUVsZW1lbnQgPSB0aGlzLmNyZWF0ZSgpO1xuXHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gZWxlbTtcblxufTtcblxuJC5leHRlbmQoR2hvc3QucHJvdG90eXBlLCB7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBnaG9zdCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5IGdob3N0XCI+PC9kaXY+Jyk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cblx0XHRnaG9zdC5hcHBlbmRUbygnYm9keScpO1xuXHRcdHJldHVybiBnaG9zdFswXTtcblxuXHR9LFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0aWYobmV3RWxlbSkge1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG5ld0VsZW07XG5cdFx0fVxuXG5cdFx0dmFyIG92ZXJsYXlFbGVtZW50ID0gdGhpcy5vdmVybGF5RWxlbWVudDtcblx0XHR2YXIgZWxlbSA9ICQodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cdFx0dmFyIG9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHR2YXIgY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHR2YXIgaW5uZXJXaWR0aCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUud2lkdGgpO1xuXHRcdHZhciBpbm5lckhlaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUuaGVpZ2h0KTtcblxuXHRcdHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdHZhciBwYWRkaW5nVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nVG9wKTtcblx0XHR2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuXHRcdHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0KTtcblx0XHR2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Ub3ApO1xuXHRcdHZhciBtYXJnaW5SaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luUmlnaHQpO1xuXHRcdHZhciBtYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHR2YXIgb3V0ZXJXaWR0aCA9IGlubmVyV2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodDtcblx0XHR2YXIgb3V0ZXJIZWlnaHQgPSBpbm5lckhlaWdodCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuXG5cdFx0Ly8gcGxhY2UgYW5kIHJlc2l6ZSBvdmVybGF5XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUud2lkdGggPSBpbm5lcldpZHRoICsgJ3B4Jztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgKyBwYWRkaW5nVG9wKSArICdweCknO1xuXG5cdFx0Ly8gbW9kaWZ5IHBhZGRpbmcgYm94XG5cblx0XHQvLyBsZWZ0XG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBwYWRkaW5nTGVmdCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyByaWdodFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IHBhZGRpbmdSaWdodCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0cmlnaHQ6IC1wYWRkaW5nUmlnaHRcblx0XHR9KTtcblxuXHRcdC8vIHRvcFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy50b3AnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBwYWRkaW5nVG9wLFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcFxuXHRcdH0pO1xuXG5cdFx0Ly8gYm90dG9tXG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmJvdHRvbScsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHBhZGRpbmdCb3R0b20sXG5cdFx0XHRib3R0b206IC1wYWRkaW5nQm90dG9tXG5cdFx0fSk7XG5cblx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXG5cdFx0Ly8gbGVmdFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBtYXJnaW5MZWZ0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdGxlZnQ6IC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gcmlnaHRcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG1hcmdpblJpZ2h0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdHJpZ2h0OiAtKHBhZGRpbmdSaWdodCArIG1hcmdpblJpZ2h0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gdG9wXG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4udG9wJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdGhlaWdodDogbWFyZ2luVG9wLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyBib3R0b21cblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5ib3R0b20nLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBvdXRlcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBtYXJnaW5Cb3R0b20sXG5cdFx0XHRib3R0b206IC0ocGFkZGluZ0JvdHRvbSArIG1hcmdpbkJvdHRvbSksXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIihmdW5jdGlvbigpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGlzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudDtcblxuXHR2YXIgRHJhZ2dlciA9IGZ1bmN0aW9uKGV2ZW50LCBvcHRpb25zKSB7XG5cblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXHRcdHRoaXMuZXZlbnREb3duID0gZXZlbnQudG91Y2hlcyA/IGV2ZW50LnRvdWNoZXNbMF0gOiBldmVudDtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cblx0fTtcblxuXHQkLmV4dGVuZChEcmFnZ2VyLnByb3RvdHlwZSwge1xuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdExheW91dE1vZGUuaW50ZXJhY3RpbmcgPSB0cnVlO1xuXG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR0aGlzLl9fbW92ZSA9IGZ1bmN0aW9uKGUpIHsgc2VsZi5tb3ZlKGUpOyB9O1xuXHRcdFx0dGhpcy5fX3N0b3AgPSBmdW5jdGlvbihlKSB7IHNlbGYuc3RvcChlKTsgfTtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoaXNUb3VjaCA/ICd0b3VjaG1vdmUnIDogJ21vdXNlbW92ZScsIHRoaXMuX19tb3ZlLCBmYWxzZSk7XG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGlzVG91Y2ggPyAndG91Y2hlbmQnIDogJ21vdXNldXAnLCB0aGlzLl9fc3RvcCwgZmFsc2UpO1xuXG5cdFx0fSxcblx0XHRtb3ZlOiBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0XHR0aGlzLmV2ZW50TW92ZSA9IGV2ZW50LnRvdWNoZXMgPyBldmVudC50b3VjaGVzWzBdIDogZXZlbnQ7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR2YXIgbW92ZWJ5ID0gMDtcblxuXHRcdFx0aWYodGhpcy5vcHRpb25zLnZlcnRpY2FsKSB7XG5cdFx0XHRcdG1vdmVieSA9ICh0aGlzLmV2ZW50RG93bi5wYWdlWSAtIHRoaXMuZXZlbnRNb3ZlLnBhZ2VZKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1vdmVieSA9ICh0aGlzLmV2ZW50RG93bi5wYWdlWCAtIHRoaXMuZXZlbnRNb3ZlLnBhZ2VYKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vcHRpb25zLm1vdmUobW92ZWJ5KTtcblxuXHRcdH0sXG5cdFx0c3RvcDogZnVuY3Rpb24oZXZlbnQpIHtcblxuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpc1RvdWNoID8gJ3RvdWNobW92ZScgOiAnbW91c2Vtb3ZlJywgdGhpcy5fX21vdmUpO1xuXHRcdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpc1RvdWNoID8gJ3RvdWNoZW5kJyA6ICdtb3VzZXVwJywgdGhpcy5fX3N0b3ApO1xuXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TGF5b3V0TW9kZS5sYXN0SW50ZXJhY3Rpb25UaW1lID0gRGF0ZS5ub3coKTtcblx0XHRcdExheW91dE1vZGUuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdGlmKHRoaXMub3B0aW9ucy5zdG9wKSB0aGlzLm9wdGlvbnMuc3RvcCgpO1xuXG5cdFx0fVxuXHR9KTtcblxuXHR3aW5kb3cuRHJhZ2dlciA9IERyYWdnZXI7XG5cbn0pKCk7IiwiLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcGVjaWZpY2l0eSBvZiBDU1Mgc2VsZWN0b3JzXG4gKiBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXNlbGVjdG9ycy8jc3BlY2lmaWNpdHlcbiAqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAgLSBzZWxlY3RvcjogdGhlIGlucHV0XG4gKiAgLSBzcGVjaWZpY2l0eTogZS5nLiAwLDEsMCwwXG4gKiAgLSBwYXJ0czogYXJyYXkgd2l0aCBkZXRhaWxzIGFib3V0IGVhY2ggcGFydCBvZiB0aGUgc2VsZWN0b3IgdGhhdCBjb3VudHMgdG93YXJkcyB0aGUgc3BlY2lmaWNpdHlcbiAqL1xudmFyIFNQRUNJRklDSVRZID0gKGZ1bmN0aW9uKCkge1xuXHR2YXIgY2FsY3VsYXRlLFxuXHRcdGNhbGN1bGF0ZVNpbmdsZTtcblxuXHRjYWxjdWxhdGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdHZhciBzZWxlY3RvcnMsXG5cdFx0XHRzZWxlY3Rvcixcblx0XHRcdGksXG5cdFx0XHRsZW4sXG5cdFx0XHRyZXN1bHRzID0gW107XG5cblx0XHQvLyBTZXBhcmF0ZSBpbnB1dCBieSBjb21tYXNcblx0XHRzZWxlY3RvcnMgPSBpbnB1dC5zcGxpdCgnLCcpO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gc2VsZWN0b3JzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yc1tpXTtcblx0XHRcdGlmIChzZWxlY3Rvci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHJlc3VsdHMucHVzaChjYWxjdWxhdGVTaW5nbGUoc2VsZWN0b3IpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fTtcblxuXHQvLyBDYWxjdWxhdGUgdGhlIHNwZWNpZmljaXR5IGZvciBhIHNlbGVjdG9yIGJ5IGRpdmlkaW5nIGl0IGludG8gc2ltcGxlIHNlbGVjdG9ycyBhbmQgY291bnRpbmcgdGhlbVxuXHRjYWxjdWxhdGVTaW5nbGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdHZhciBzZWxlY3RvciA9IGlucHV0LFxuXHRcdFx0ZmluZE1hdGNoLFxuXHRcdFx0dHlwZUNvdW50ID0ge1xuXHRcdFx0XHQnYSc6IDAsXG5cdFx0XHRcdCdiJzogMCxcblx0XHRcdFx0J2MnOiAwXG5cdFx0XHR9LFxuXHRcdFx0cGFydHMgPSBbXSxcblx0XHRcdC8vIFRoZSBmb2xsb3dpbmcgcmVndWxhciBleHByZXNzaW9ucyBhc3N1bWUgdGhhdCBzZWxlY3RvcnMgbWF0Y2hpbmcgdGhlIHByZWNlZGluZyByZWd1bGFyIGV4cHJlc3Npb25zIGhhdmUgYmVlbiByZW1vdmVkXG5cdFx0XHRhdHRyaWJ1dGVSZWdleCA9IC8oXFxbW15cXF1dK1xcXSkvZyxcblx0XHRcdGlkUmVnZXggPSAvKCNbXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0Y2xhc3NSZWdleCA9IC8oXFwuW15cXHNcXCs+flxcLlxcWzpdKykvZyxcblx0XHRcdHBzZXVkb0VsZW1lbnRSZWdleCA9IC8oOjpbXlxcc1xcKz5+XFwuXFxbOl0rfDpmaXJzdC1saW5lfDpmaXJzdC1sZXR0ZXJ8OmJlZm9yZXw6YWZ0ZXIpL2dpLFxuXHRcdFx0Ly8gQSByZWdleCBmb3IgcHNldWRvIGNsYXNzZXMgd2l0aCBicmFja2V0cyAtIDpudGgtY2hpbGQoKSwgOm50aC1sYXN0LWNoaWxkKCksIDpudGgtb2YtdHlwZSgpLCA6bnRoLWxhc3QtdHlwZSgpLCA6bGFuZygpXG5cdFx0XHRwc2V1ZG9DbGFzc1dpdGhCcmFja2V0c1JlZ2V4ID0gLyg6W1xcdy1dK1xcKFteXFwpXSpcXCkpL2dpLFxuXHRcdFx0Ly8gQSByZWdleCBmb3Igb3RoZXIgcHNldWRvIGNsYXNzZXMsIHdoaWNoIGRvbid0IGhhdmUgYnJhY2tldHNcblx0XHRcdHBzZXVkb0NsYXNzUmVnZXggPSAvKDpbXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0ZWxlbWVudFJlZ2V4ID0gLyhbXlxcc1xcKz5+XFwuXFxbOl0rKS9nO1xuXG5cdFx0Ly8gRmluZCBtYXRjaGVzIGZvciBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBpbiBhIHN0cmluZyBhbmQgcHVzaCB0aGVpciBkZXRhaWxzIHRvIHBhcnRzXG5cdFx0Ly8gVHlwZSBpcyBcImFcIiBmb3IgSURzLCBcImJcIiBmb3IgY2xhc3NlcywgYXR0cmlidXRlcyBhbmQgcHNldWRvLWNsYXNzZXMgYW5kIFwiY1wiIGZvciBlbGVtZW50cyBhbmQgcHNldWRvLWVsZW1lbnRzXG5cdFx0ZmluZE1hdGNoID0gZnVuY3Rpb24ocmVnZXgsIHR5cGUpIHtcblx0XHRcdHZhciBtYXRjaGVzLCBpLCBsZW4sIG1hdGNoLCBpbmRleCwgbGVuZ3RoO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaChyZWdleCk7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdFx0XHR0eXBlQ291bnRbdHlwZV0gKz0gMTtcblx0XHRcdFx0XHRtYXRjaCA9IG1hdGNoZXNbaV07XG5cdFx0XHRcdFx0aW5kZXggPSBzZWxlY3Rvci5pbmRleE9mKG1hdGNoKTtcblx0XHRcdFx0XHRsZW5ndGggPSBtYXRjaC5sZW5ndGg7XG5cdFx0XHRcdFx0cGFydHMucHVzaCh7XG5cdFx0XHRcdFx0XHRzZWxlY3RvcjogbWF0Y2gsXG5cdFx0XHRcdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0XHRcdFx0aW5kZXg6IGluZGV4LFxuXHRcdFx0XHRcdFx0bGVuZ3RoOiBsZW5ndGhcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBSZXBsYWNlIHRoaXMgc2ltcGxlIHNlbGVjdG9yIHdpdGggd2hpdGVzcGFjZSBzbyBpdCB3b24ndCBiZSBjb3VudGVkIGluIGZ1cnRoZXIgc2ltcGxlIHNlbGVjdG9yc1xuXHRcdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShtYXRjaCwgQXJyYXkobGVuZ3RoICsgMSkuam9pbignICcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBSZW1vdmUgdGhlIG5lZ2F0aW9uIHBzdWVkby1jbGFzcyAoOm5vdCkgYnV0IGxlYXZlIGl0cyBhcmd1bWVudCBiZWNhdXNlIHNwZWNpZmljaXR5IGlzIGNhbGN1bGF0ZWQgb24gaXRzIGFyZ3VtZW50XG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZ2V4ID0gLzpub3RcXCgoW15cXCldKilcXCkvZztcblx0XHRcdGlmIChyZWdleC50ZXN0KHNlbGVjdG9yKSkge1xuXHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UocmVnZXgsICcgICAgICQxICcpO1xuXHRcdFx0fVxuXHRcdH0oKSk7XG5cblx0XHQvLyBSZW1vdmUgYW55dGhpbmcgYWZ0ZXIgYSBsZWZ0IGJyYWNlIGluIGNhc2UgYSB1c2VyIGhhcyBwYXN0ZWQgaW4gYSBydWxlLCBub3QganVzdCBhIHNlbGVjdG9yXG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZ2V4ID0gL3tbXl0qL2dtLFxuXHRcdFx0XHRtYXRjaGVzLCBpLCBsZW4sIG1hdGNoO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaChyZWdleCk7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdFx0XHRtYXRjaCA9IG1hdGNoZXNbaV07XG5cdFx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG1hdGNoLCBBcnJheShtYXRjaC5sZW5ndGggKyAxKS5qb2luKCcgJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSgpKTtcblxuXHRcdC8vIEFkZCBhdHRyaWJ1dGUgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2goYXR0cmlidXRlUmVnZXgsICdiJyk7XG5cblx0XHQvLyBBZGQgSUQgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYSlcblx0XHRmaW5kTWF0Y2goaWRSZWdleCwgJ2EnKTtcblxuXHRcdC8vIEFkZCBjbGFzcyBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChjbGFzc1JlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gQWRkIHBzZXVkby1lbGVtZW50IHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGMpXG5cdFx0ZmluZE1hdGNoKHBzZXVkb0VsZW1lbnRSZWdleCwgJ2MnKTtcblxuXHRcdC8vIEFkZCBwc2V1ZG8tY2xhc3Mgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2gocHNldWRvQ2xhc3NXaXRoQnJhY2tldHNSZWdleCwgJ2InKTtcblx0XHRmaW5kTWF0Y2gocHNldWRvQ2xhc3NSZWdleCwgJ2InKTtcblxuXHRcdC8vIFJlbW92ZSB1bml2ZXJzYWwgc2VsZWN0b3IgYW5kIHNlcGFyYXRvciBjaGFyYWN0ZXJzXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC9bXFwqXFxzXFwrPn5dL2csICcgJyk7XG5cblx0XHQvLyBSZW1vdmUgYW55IHN0cmF5IGRvdHMgb3IgaGFzaGVzIHdoaWNoIGFyZW4ndCBhdHRhY2hlZCB0byB3b3Jkc1xuXHRcdC8vIFRoZXNlIG1heSBiZSBwcmVzZW50IGlmIHRoZSB1c2VyIGlzIGxpdmUtZWRpdGluZyB0aGlzIHNlbGVjdG9yXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC9bI1xcLl0vZywgJyAnKTtcblxuXHRcdC8vIFRoZSBvbmx5IHRoaW5ncyBsZWZ0IHNob3VsZCBiZSBlbGVtZW50IHNlbGVjdG9ycyAodHlwZSBjKVxuXHRcdGZpbmRNYXRjaChlbGVtZW50UmVnZXgsICdjJyk7XG5cblx0XHQvLyBPcmRlciB0aGUgcGFydHMgaW4gdGhlIG9yZGVyIHRoZXkgYXBwZWFyIGluIHRoZSBvcmlnaW5hbCBzZWxlY3RvclxuXHRcdC8vIFRoaXMgaXMgbmVhdGVyIGZvciBleHRlcm5hbCBhcHBzIHRvIGRlYWwgd2l0aFxuXHRcdHBhcnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0cmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yOiBpbnB1dCxcblx0XHRcdHNwZWNpZmljaXR5OiAnMCwnICsgdHlwZUNvdW50LmEudG9TdHJpbmcoKSArICcsJyArIHR5cGVDb3VudC5iLnRvU3RyaW5nKCkgKyAnLCcgKyB0eXBlQ291bnQuYy50b1N0cmluZygpLFxuXHRcdFx0cGFydHM6IHBhcnRzXG5cdFx0fTtcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGNhbGN1bGF0ZTogY2FsY3VsYXRlXG5cdH07XG59KCkpO1xuXG5cbihmdW5jdGlvbigpIHtcblxuXHR2YXIgU3R5bGVQYXJzZXIgPSB7fTtcblxuXHR2YXIgcnVsZXMgPSB7fTtcblx0dmFyIHNoZWV0cyA9IGRvY3VtZW50LnN0eWxlU2hlZXRzO1xuXG5cdHZhciBzaGVldCwgcnVsZTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaGVldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcblx0XHRzaGVldCA9IHNoZWV0c1tpXTtcblx0XHRpZighc2hlZXQuY3NzUnVsZXMpIGNvbnRpbnVlO1xuXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzaGVldC5jc3NSdWxlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0cnVsZSA9IHNoZWV0LmNzc1J1bGVzW2pdO1xuXHRcdFx0cnVsZXNbcnVsZS5zZWxlY3RvclRleHRdID0gcnVsZTtcblx0XHR9XG5cdH1cblxuXHRTdHlsZVBhcnNlci5yZXNvbHZlID0gZnVuY3Rpb24odHJhY2tlZEVsZW1lbnQpIHtcblxuXHRcdHZhciBtYXRjaGVkUnVsZXMgPSB3aW5kb3cuZ2V0TWF0Y2hlZENTU1J1bGVzKHRyYWNrZWRFbGVtZW50KSB8fCBbXTtcblx0XHR2YXIgcnVsZXMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cnVsZXMucHVzaChbbWF0Y2hlZFJ1bGVzW2ldLCBwYXJzZUludChTUEVDSUZJQ0lUWS5jYWxjdWxhdGUobWF0Y2hlZFJ1bGVzW2ldLnNlbGVjdG9yVGV4dClbMF0uc3BlY2lmaWNpdHkucmVwbGFjZSgvXFwsL2csICcnKSwgMTApICsgMC4wMSAqIGldKTtcblx0XHR9XG5cblxuXG5cdFx0cnVsZXMgPSBydWxlc1xuXHRcdFx0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0XHRyZXR1cm4gYlsxXSAtIGFbMV07XG5cdFx0XHR9KVxuXHRcdFx0Lm1hcChmdW5jdGlvbihhKSB7XG5cdFx0XHRcdHJldHVybiBhWzBdO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcnVsZXM7XG5cblx0fTtcblxuXHR3aW5kb3cuU3R5bGVQYXJzZXIgPSBTdHlsZVBhcnNlcjtcblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0dmFyIExheW91dE1vZGUgPSBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQgPSBudWxsOyAvLyB0aGUgYWN0dWFsIG92ZXJsYXkgZGl2XG5cdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG51bGw7IC8vIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudFxuXHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDsgLy8gd2hlbiBkZWZpbmVkLCB3ZSdyZSBpbiBydWxlIG1vZGVcblx0XHR0aGlzLmhvdmVyR2hvc3QgPSBuZXcgR2hvc3QoKTsgLy8gdGhlIGhvdmVyIGdob3N0XG5cdFx0dGhpcy5vdmVyID0gZmFsc2U7IC8vIG9uIHdoZXRoZXIgd2UncmUgY3VycmVubHkgaG92ZXJpbmcgYSBjZXJ0YWluIHBhcnQgb2YgdGhlIG92ZXJsYXlcblx0XHR0aGlzLmludGVyYWN0aW5nID0gZmFsc2U7IC8vIHdoZXRoZXIgd2UncmUgY3VycmVudGx5IGludGVyYWN0aW5nIHdpdGggdGhlIGVsZW1lbnRcblxuXHRcdC8vIGluaXRpYWxpemVcblx0XHR0aGlzLmNyZWF0ZSgpO1xuXG5cdH07XG5cblx0JC5leHRlbmQoTGF5b3V0TW9kZS5wcm90b3R5cGUsIHtcblxuXHRcdHBsdWdpbnM6IFtdLFxuXG5cdFx0cmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbikge1xuXHRcdFx0dGhpcy5wbHVnaW5zLnB1c2gocGx1Z2luKTtcblx0XHRcdGlmKHBsdWdpbi5jcmVhdGUpIHtcblx0XHRcdFx0cGx1Z2luLmNyZWF0ZS5jYWxsKHBsdWdpbik7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGNhbGxQbHVnaW46IGZ1bmN0aW9uKGV2ZW50TmFtZSwgYSwgYiwgYywgZCwgZSwgZikge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsdWdpbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYodGhpcy5wbHVnaW5zW2ldW2V2ZW50TmFtZV0pIHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbnNbaV1bZXZlbnROYW1lXS5jYWxsKHRoaXMucGx1Z2luc1tpXSwgYSwgYiwgYywgZCwgZSwgZik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c29ydFBsdWdpbnM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5wbHVnaW5zLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0XHRyZXR1cm4gYS5wcmlvcml0eSA+IGIucHJpb3JpdHk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0ZW5hYmxlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBwcmlvcml0aXplIHNvbWUgcGx1Z2lucyBvdmVyIG90aGVyc1xuXHRcdFx0dGhpcy5zb3J0UGx1Z2lucygpO1xuXG5cdFx0XHQvLyBtYWtlIGFsbCBlbGVtZW50cyBvbiBwYWdlIGluc3BlY3RhYmxlXG5cdFx0XHQkKCdib2R5ICo6bm90KC5vdmVybGF5LC5vdmVybGF5ICosLm92ZXJsYXktdGl0bGUsLm92ZXJsYXktdGl0bGUgKiknKVxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRcdHZhciB0YXJnZXRDaGFuZ2VkID0gdGhhdC5ob3ZlckVsZW1lbnQgIT09IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5ob3ZlckVsZW1lbnQgPSB0aGlzO1xuXG5cdFx0XHRcdFx0aWYodGFyZ2V0Q2hhbmdlZCkge1xuXHRcdFx0XHRcdFx0dGhhdC5jYWxsUGx1Z2luKCdob3ZlclRhcmdldENoYW5nZScsIGUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIGluIG5vcm1hbCBtb2RlLCBkb24ndCBhY3RpdmF0ZSB0aGUgaG92ZXIgZ2hvc3Qgd2hlbiBpbnRlcmFjdGluZyBvciBvdmVyIHRoZSBjdXJyZW50IGVsXG5cdFx0XHRcdFx0aWYodGhhdC5ob3Zlckdob3N0LmN1cnJlbnRFbGVtZW50ID09PSB0aGlzIHx8IHRoYXQuaW50ZXJhY3RpbmcgfHwgdGhhdC5vdmVyKVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRcdFx0dGhhdC5ob3Zlckdob3N0LnJlbGF5b3V0KHRoaXMpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdGlmKHRoYXQuY3VycmVudEVsZW1lbnQgPT09IHRoaXMgfHwgdGhhdC5pbnRlcmFjdGluZylcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHRcdC8vIHRoaXMgaXMgYW4gaW5zYW5lbHkgdWdseSB3b3JrYXJvdW5kIGZvciBhIHByb3BhZ2F0aW9uIGlzc3VlIGZyb20gZHJhZyxcblx0XHRcdFx0XHQvLyBidXQgSSBqdXN0IGRvbnQgZ2l2ZSBhIHNoaXQhIDpEXG5cdFx0XHRcdFx0aWYoRGF0ZS5ub3coKSAtIHRoYXQubGFzdEludGVyYWN0aW9uVGltZSA8IDUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZih0aGF0LmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdFx0XHR0aGF0LmRlYWN0aXZhdGUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBzeW5jIG9uIHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0dGhhdC5hY3RpdmF0ZSh0aGlzKTtcblxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHR9KTtcdFx0XG5cblx0XHR9LFxuXG5cdFx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY3JlYXRlT3ZlcmxheSgpO1xuXHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0fSxcblxuXHRcdGNyZWF0ZU92ZXJsYXk6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gJCgnPGRpdiBpZD1cIm92ZXJsYXlcIiBjbGFzcz1cIm92ZXJsYXlcIj48L2Rpdj4nKVswXTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblxuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIEV2ZW50cyAmIEJlaGF2aW91ciBpbml0aWFsaXphdGlvblxuXHRcdCAqL1xuXG5cdFx0aW5pdDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuaW5pdEhvdmVyKCk7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHRoaXMuX19rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxNikge1xuXHRcdFx0XHRcdHRoYXQuc2hpZnRQcmVzc2VkID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxOCkge1xuXHRcdFx0XHRcdHRoYXQuYWx0UHJlc3NlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoZS5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0XHRcdHRoYXQuZGVhY3RpdmF0ZSgpO1xuXHRcdFx0XHR9XHRcdFxuXHRcdFx0fTtcblx0XHRcdHRoaXMuX19rZXlkb3duID0gZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRcdGlmKGUud2hpY2ggPT09IDE2KSB7XG5cdFx0XHRcdFx0dGhhdC5zaGlmdFByZXNzZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoZS53aGljaCA9PT0gMTgpIHtcblx0XHRcdFx0XHR0aGF0LmFsdFByZXNzZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH07XG5cdFx0XHR0aGlzLl9fcmVzaXplID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHdpbmRvdy5MYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHR9O1xuXG5cdFx0XHQkKGRvY3VtZW50KS5vbigna2V5dXAnLCB0aGlzLl9fa2V5dXApO1xuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCB0aGlzLl9fa2V5ZG93bik7XG5cdFx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZScsIHRoaXMuX19yZXNpemUpO1xuXG5cdFx0fSxcblxuXHRcdGluaXRIb3ZlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdFx0JCgnYm9keScpLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cblx0XHRcdFx0dGhhdC5fX2xhc3RNb3VzZU1vdmVFdmVudCA9IGU7XG5cdFx0XHRcdGlmKCF0aGF0LmN1cnJlbnRFbGVtZW50IHx8IHRoYXQuaGlkZGVuKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhhdC5wcm9jZXNzT3ZlckxvZ2ljKGUpO1xuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRwcm9jZXNzT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdHZhciBleHRyYU1hcmdpbiA9IDEwO1xuXHRcdFx0dmFyIG9mZnNldCA9IHRoaXMuY3VycmVudE9mZnNldDtcblxuXHRcdFx0Ly8gZ2VuZXJhbCBvdmVyL291dFxuXG5cdFx0XHRpZihcblx0XHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0IC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSB0aGlzLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0ICsgZXh0cmFNYXJnaW4pICYmXG5cdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgKyB0aGlzLm1hcmdpbkJvdHRvbSArIGV4dHJhTWFyZ2luKVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3Zlcikge1xuXHRcdFx0XHRcdHRoaXMub3ZlciA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYodGhpcy5vdmVyICYmICF0aGlzLmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcdFx0XHRcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIGRvbid0IHByb2Nlc3MgaWYgaW50ZXJhY3Rpbmdcblx0XHRcdGlmKHRoaXMuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjYWxsIHBsdWdpbnNcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignbW91c2Vtb3ZlJywgZSk7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBDb3JlIHJ1bnRpbWUgZnVuY3Rpb25hbGl0eVxuXHRcdCAqL1xuXG5cdFx0Y2FsY3VsYXRlSGFuZGxlU2l6ZTogZnVuY3Rpb24oaW5uZXJXaWR0aCwgaW5uZXJIZWlnaHQpIHtcblx0XHRcdHZhciBoYW5kbGVTaXplWCA9IDE2O1xuXHRcdFx0dmFyIGhhbmRsZVNpemVZID0gMTY7XG5cdFx0XHRpZihpbm5lcldpZHRoIDwgMTAwKSB7XG5cdFx0XHRcdGhhbmRsZVNpemVYID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oMTYsIGhhbmRsZVNpemVYICogKGlubmVyV2lkdGggLyA2MCkpKTtcblx0XHRcdH1cblx0XHRcdGlmKGlubmVySGVpZ2h0IDwgMTAwKSB7XG5cdFx0XHRcdGhhbmRsZVNpemVZID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oMTYsIGhhbmRsZVNpemVZICogKGlubmVySGVpZ2h0IC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR5OiBoYW5kbGVTaXplWSxcblx0XHRcdFx0eDogaGFuZGxlU2l6ZVhcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHJlbGF5b3V0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIGNvbXB1dGVkU3R5bGUgPSB0aGlzLmNvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHR2YXIgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLm92ZXJsYXlFbGVtZW50O1xuXHRcdFx0dmFyIGVsZW0gPSAkKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXHRcdFx0dmFyIG9mZnNldCA9IHRoaXMuY3VycmVudE9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHRcdC8vIHdlIG5lZWQgdG8gc3RvcmUgb3V0ZXIgaGVpZ2h0LCBib3R0b20vcmlnaHQgcGFkZGluZyBhbmQgbWFyZ2lucyBmb3IgaG92ZXIgZGV0ZWN0aW9uXG5cdFx0XHR2YXIgcGFkZGluZ0xlZnQgPSB0aGlzLnBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nTGVmdCk7XG5cdFx0XHR2YXIgcGFkZGluZ1RvcCA9IHRoaXMucGFkZGluZ1RvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ1RvcCk7XG5cdFx0XHR2YXIgcGFkZGluZ1JpZ2h0ID0gdGhpcy5wYWRkaW5nUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdSaWdodCk7XG5cdFx0XHR2YXIgcGFkZGluZ0JvdHRvbSA9IHRoaXMucGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0JvdHRvbSk7XG5cblx0XHRcdHZhciBtYXJnaW5MZWZ0ID0gdGhpcy5tYXJnaW5MZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0KTtcblx0XHRcdHZhciBtYXJnaW5Ub3AgPSB0aGlzLm1hcmdpblRvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luVG9wKTtcblx0XHRcdHZhciBtYXJnaW5SaWdodCA9IHRoaXMubWFyZ2luUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblJpZ2h0KTtcblx0XHRcdHZhciBtYXJnaW5Cb3R0b20gPSB0aGlzLm1hcmdpbkJvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luQm90dG9tKTtcblxuXHRcdFx0dmFyIGlubmVyV2lkdGggPSB0aGlzLmlubmVyV2lkdGggPSBwYXJzZUludChjb21wdXRlZFN0eWxlLndpZHRoKSB8fCAodGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0KTtcblx0XHRcdHZhciBpbm5lckhlaWdodCA9IHRoaXMuaW5uZXJIZWlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLmhlaWdodCkgfHwgKHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b20pO1xuXG5cdFx0XHR2YXIgb3V0ZXJXaWR0aCA9IHRoaXMub3V0ZXJXaWR0aCA9IGlubmVyV2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodDtcblx0XHRcdHZhciBvdXRlckhlaWdodCA9IHRoaXMub3V0ZXJIZWlnaHQgPSBpbm5lckhlaWdodCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuXG5cdFx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHRcdC8vIG1vZGlmeSBwYWRkaW5nIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nTGVmdCArICcsICcgKyBvdXRlckhlaWdodCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1JpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nUmlnaHQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKC1wYWRkaW5nVG9wKSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ1RvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoMCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQpICsgJ3B4KSBzY2FsZSgnICsgaW5uZXJXaWR0aCArICcsICcgKyBwYWRkaW5nQm90dG9tICsgJyknO1xuXG5cdFx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkpICsgJ3B4LCAnICsgKC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkpICsgJ3B4KSBzY2FsZSgnICsgbWFyZ2luTGVmdCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCArIHBhZGRpbmdSaWdodCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5SaWdodCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpblRvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0ICsgcGFkZGluZ0JvdHRvbSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpbkJvdHRvbSArICcpJztcblxuXHRcdFx0Ly8gaW5mb3JtIHBsdWdpbnMgdGhhdCBhIHJlbGF5b3V0IGhhcyBoYXBwZW5lZFxuXHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdyZWxheW91dCcsIHtcblxuXHRcdFx0XHRjb21wdXRlZFN0eWxlOiBjb21wdXRlZFN0eWxlLFxuXHRcdFx0XHRvZmZzZXQ6IG9mZnNldCxcblxuXHRcdFx0XHRwYWRkaW5nTGVmdDogcGFkZGluZ0xlZnQsXG5cdFx0XHRcdHBhZGRpbmdUb3A6IHBhZGRpbmdUb3AsXG5cdFx0XHRcdHBhZGRpbmdSaWdodDogcGFkZGluZ1JpZ2h0LFxuXHRcdFx0XHRwYWRkaW5nQm90dG9tOiBwYWRkaW5nQm90dG9tLFxuXG5cdFx0XHRcdG1hcmdpbkxlZnQ6IG1hcmdpbkxlZnQsXG5cdFx0XHRcdG1hcmdpblRvcDogbWFyZ2luVG9wLFxuXHRcdFx0XHRtYXJnaW5SaWdodDogbWFyZ2luUmlnaHQsXG5cdFx0XHRcdG1hcmdpbkJvdHRvbTogbWFyZ2luQm90dG9tLFxuXG5cdFx0XHRcdGlubmVyV2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRcdGlubmVySGVpZ2h0OiBpbm5lckhlaWdodCxcblx0XHRcdFx0b3V0ZXJXaWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdFx0b3V0ZXJIZWlnaHQ6IG91dGVySGVpZ2h0XG5cblx0XHRcdH0sIHRoaXMuY2FsY3VsYXRlSGFuZGxlU2l6ZShpbm5lcldpZHRoLCBpbm5lckhlaWdodCkpO1xuXG5cdFx0fSxcblxuXHRcdGdldENhcHRpb25Qcm9wZXJ0eTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Ly8gY2hlY2sgaW4gaW5saW5lIHN0eWxlc1xuXHRcdFx0aWYodGhpcy5jdXJyZW50RWxlbWVudC5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNoZWNrIGluIHJ1bGVzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMubWF0Y2hlZFJ1bGVzW2ldLnN0eWxlW2Nzc1Byb3BlcnR5XSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0ucmVwbGFjZSgvKGVtfHB4KS8sICfigIk8c3Bhbj4kMTwvc3Bhbj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmV0VmFsID0gJyc7XG5cblx0XHRcdGlmKGNzc1Byb3BlcnR5LmluZGV4T2YoJ21hcmdpbicpID4gLTEgfHwgY3NzUHJvcGVydHkuaW5kZXhPZigncGFkZGluZycpID4gLTEpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpc1tjc3NQcm9wZXJ0eV07XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICdoZWlnaHQnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJIZWlnaHQ7XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICd3aWR0aCcpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpcy5pbm5lcldpZHRoO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpbXBsaWNpdCB2YWx1ZVxuXHRcdFx0cmV0dXJuICcoJyArIHJldFZhbCArICfigIk8c3Bhbj5weDwvc3Bhbj4pJztcblxuXHRcdH0sXG5cblx0XHRhY3RpdmF0ZTogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbmV3RWxlbTtcblx0XHRcdHRoaXMuY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHRcdC8vIGluaXRpYWwgaG92ZXJcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHR0aGlzLm92ZXIgPSB0cnVlO1xuXG5cdFx0XHRpZih0aGlzLmNvbXB1dGVkU3R5bGUuZGlzcGxheSA9PT0gJ2lubGluZScpIHtcblx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbmxpbmUnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItaW5saW5lJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGhpZGUgdGhlIGhvdmVyIGdob3N0IGZvciBpbnNwZWN0aW9uXG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZmluZCBtYXRjaGluZyBydWxlc1xuXHRcdFx0dGhpcy5tYXRjaGVkUnVsZXMgPSBTdHlsZVBhcnNlci5yZXNvbHZlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHQvLyBleGVjdXRlIHBsdWdpbnNcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignYWN0aXZhdGUnKTtcblxuXHRcdFx0Ly8gcmVsYXlvdXRcblx0XHRcdHRoaXMucmVsYXlvdXQoKTtcblxuXHRcdH0sXG5cblx0XHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUpIHtcblx0XHRcdFx0dGhpcy5leGl0UnVsZU1vZGUoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdoaWRkZW4nKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZXhlY3V0ZSBwbHVnaW5zXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2RlYWN0aXZhdGUnKTtcblxuXHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDtcblxuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIEZ1bmN0aW9ucyByZWxhdGVkIHRvIHJ1bGUtYmFzZWQgZWRpdGluZ1xuXHRcdCAqL1xuXG5cdFx0ZW50ZXJSdWxlTW9kZTogZnVuY3Rpb24oY3NzUnVsZSwgaW5kZXgpIHtcblxuXHRcdFx0Ly8gaWYgc2VsZWN0ZWRSdWxlIGFuZCBuZXcgY3NzUnVsZSBhcmUgdGhlIHNhbWUsIGRvbid0IGRvIGFueXRoaW5nXG5cdFx0XHRpZih0aGlzLnNlbGVjdGVkUnVsZSA9PT0gY3NzUnVsZSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIGlmIHNlbGVjdGVkUnVsZSB3YXNuJ3QgZW1wdHksIHdlIHNpbXBseSBjaGFuZ2UgdGhlIHJ1bGVcblx0XHRcdGlmKHRoaXMuc2VsZWN0ZWRSdWxlKSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gY3NzUnVsZTtcblx0XHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdjaGFuZ2VSdWxlJywgaW5kZXgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBjc3NSdWxlO1xuXHRcdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2VudGVyUnVsZScsIGluZGV4KTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRleGl0UnVsZU1vZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdleGl0UnVsZScpO1xuXHRcdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBudWxsO1xuXHRcdH0sXG5cblx0XHRzZWxlY3RSdWxlOiBmdW5jdGlvbihjc3NQcm9wZXJ0eSkge1xuXG5cdFx0XHR0aGlzLnNlbGVjdGVkUHJvcCA9IGNzc1Byb3BlcnR5O1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMubWF0Y2hlZFJ1bGVzW2ldLnN0eWxlW2Nzc1Byb3BlcnR5XSkge1xuXHRcdFx0XHRcdHRoaXMuZW50ZXJSdWxlTW9kZSh0aGlzLm1hdGNoZWRSdWxlc1tpXSwgaSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIG5vIHJ1bGUgbWF0Y2hpbmc/IGV4aXQgcnVsZSBtb2RlIHRoZW5cblx0XHRcdHRoaXMuZXhpdFJ1bGVNb2RlKCk7XG5cblx0XHR9LFxuXG5cdFx0ZGVzZWxlY3RSdWxlOiBmdW5jdGlvbihjc3NQcm9wZXJ0eSkge1xuXG5cdFx0XHQvLyBkb24ndCBkbyBhbnl0aGluZyBpZiBpbiB0aGUgbWVhbnRpbWUgYW5vdGhlciBydWxlIHdhcyBzZWxlY3RlZFxuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFByb3AgIT09IGNzc1Byb3BlcnR5KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5leGl0UnVsZU1vZGUoKTtcblx0XHR9LFxuXG5cdFx0LyogXG5cdFx0ICogZnVuY3Rpb25zIHRvIHRlbXBvcmFyaWx5IGRpc2FibGVcblx0XHQgKiBsYXlvdXQgbW9kZSwgaS5lLiBmb3IgcHJldmlld2luZy5cblx0XHQgKi9cblxuXHRcdHNob3c6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmhpZGRlbiA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyID0gdGhpcy5fX2xhc3RPdmVyO1xuXG5cdFx0XHRpZih0aGlzLm92ZXIpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcblxuXHRcdFx0Ly8gZWRnZSBjYXNlOiB1c2VyIGhvbGRzIGNvbW1hbmQsIG1vdmVzIG91dCwgcmVsZWFzZXMgY29tbWFuZFxuXHRcdFx0aWYodGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudClcblx0XHRcdFx0dGhpcy5wcm9jZXNzT3ZlckxvZ2ljKHRoaXMuX19sYXN0TW91c2VNb3ZlRXZlbnQpO1xuXG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ3Nob3cnKTtcblxuXHRcdH0sXG5cblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5oaWRkZW4gPSB0cnVlO1xuXHRcdFx0dGhpcy5fX2xhc3RPdmVyID0gdGhpcy5vdmVyO1xuXHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2hpZGUnKTtcblxuXHRcdH1cblxuXG5cdH0pO1xuXG5cdC8vIENyZWF0ZSBMYXlvdXQgTW9kZSAoc2luZ2xldG9uKVxuXHR3aW5kb3cuTGF5b3V0TW9kZSA9IG5ldyBMYXlvdXRNb2RlKCk7XG5cbn0pKCk7XG5cblxuIiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMudGl0bGVCb3ggPSAkKCc8ZGl2IGNsYXNzPVwib3ZlcmxheS10aXRsZVwiPjxkaXYgY2xhc3M9XCJ0aXRsZS1ydWxlXCI+PHNwYW4gY2xhc3M9XCJzZWxlY3RlZFwiPmlubGluZSBzdHlsZTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJ0b2dnbGVcIj7ilr48L3NwYW4+PHVsIGNsYXNzPVwiZHJvcGRvd25cIj48bGk+aW5saW5lIHN0eWxlPC9saT48L3VsPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXRsZS1wcm9wb3J0aW9uc1wiPjEwMCB4IDEwMDwvZGl2PjwvZGl2PicpXG5cdFx0XHQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSlbMF07XG5cblx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMgPSAkKCcudGl0bGUtcHJvcG9ydGlvbnMnLCB0aGlzLnRpdGxlQm94KVswXTtcblx0XHR0aGlzLnRpdGxlRHJvcGRvd24gPSAkKCcuZHJvcGRvd24nLCB0aGlzLnRpdGxlQm94KTtcblxuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIGluaXRpYWxpemUgdGl0bGUgYm94IGJlaGF2aW91clxuXHRcdHZhciB0aXRsZUJveCA9IHRoaXMudGl0bGVCb3g7XG5cdFx0dmFyIHRpdGxlRHJvcGRvd24gPSB0aGlzLnRpdGxlRHJvcGRvd247XG5cblx0XHQkKCdzcGFuJywgdGl0bGVCb3gpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLmRyb3Bkb3duJywgdGl0bGVCb3gpLnRvZ2dsZSgpO1xuXHRcdH0pO1xuXG5cblx0XHR0aXRsZURyb3Bkb3duLm9uKCdjbGljaycsICdsaScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGl0bGVEcm9wZG93bi5oaWRlKCk7XG5cdFx0XHQkKCcuc2VsZWN0ZWQnLCB0aXRsZUJveCkuaHRtbCh0aGlzLmlubmVySFRNTCk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmZpbGxSdWxlcygpO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHQkKCdzcGFuJywgdGhpcy50aXRsZUJveCkub2ZmKCdjbGljaycpO1xuXHRcdCQoJ3NwYW4nLCB0aGlzLnRpdGxlRHJvcGRvd24pLm9mZignY2xpY2snKTtcblx0fSxcblxuXHRlbnRlclJ1bGU6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dGhpcy50aXRsZUJveC5jbGFzc0xpc3QuYWRkKCdydWxlJyk7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5zdHlsZS56SW5kZXggPSAxMDAwMjtcblx0XHR0aGlzLmNoYW5nZVJ1bGUoaW5kZXgpO1xuXHR9LFxuXG5cdGNoYW5nZVJ1bGU6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dGhpcy50aXRsZURyb3Bkb3duLmZpbmQoJ2xpOmVxKCcgKyAoaW5kZXggKyAxKSArICcpJykuY2xpY2soKTtcblx0fSxcblxuXHRleGl0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0JCgnc3Bhbi5zZWxlY3RlZCcsIHRoaXMudGl0bGVCb3gpLmh0bWwoJ2lubGluZSBzdHlsZScpO1xuXHRcdHRoaXMudGl0bGVCb3guY2xhc3NMaXN0LnJlbW92ZSgncnVsZScpO1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuc3R5bGUuekluZGV4ID0gJyc7XG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKHByb3BzKSB7XG5cblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0Ly8gcGxhY2UgdGl0bGUgYm94XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChvZmZzZXQubGVmdCArICgocHJvcHMub3V0ZXJXaWR0aCAtIHRoaXMudGl0bGVCb3gub2Zmc2V0V2lkdGgpIC8gMikpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgLSBwcm9wcy5tYXJnaW5Ub3AgLSA1NSkgKyAncHgpJztcblx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMuaW5uZXJIVE1MID0gcHJvcHMub3V0ZXJXaWR0aCArICcgeCAnICsgcHJvcHMub3V0ZXJIZWlnaHQ7XG5cblx0fSxcblxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAxO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudGl0bGVCb3guc3R5bGUub3BhY2l0eSA9IDA7XG5cdH0sXG5cblx0LyogbWVtYmVyIGZ1bmN0aW9ucyAqL1xuXG5cdGZpbGxSdWxlczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgcmVzb2x2ZWQgPSBMYXlvdXRNb2RlLm1hdGNoZWRSdWxlcztcblxuXHRcdHRoaXMudGl0bGVEcm9wZG93bi5lbXB0eSgpO1xuXHRcdCQoJzxsaT5pbmxpbmUgc3R5bGU8L2xpPicpLmFwcGVuZFRvKHRoaXMudGl0bGVEcm9wZG93bik7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNvbHZlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0JCgnPGxpPicgKyByZXNvbHZlZFtpXS5zZWxlY3RvclRleHQgKyAnPC9saT4nKVxuXHRcdFx0XHQuZGF0YSgnY3NzUnVsZScsIHJlc29sdmVkW2ldKVxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy50aXRsZURyb3Bkb3duKTtcblx0XHR9XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG92ZXJsYXkgPSBMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50O1xuXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtbWFyZ2luLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtbWFyZ2luLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cdFx0dGhpcy5ndWlkZU1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cblx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtcGFkZGluZy1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtcGFkZGluZy1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKHByb3BzKSB7XG5cblx0XHQvLyBwYWRkaW5nIGd1aWRlc1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtcHJvcHMub2Zmc2V0LnRvcCAtcHJvcHMucGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUubGVmdCA9IC1wcm9wcy5wYWRkaW5nTGVmdCArICdweCc7XG5cblx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1wcm9wcy5vZmZzZXQudG9wIC1wcm9wcy5wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0LnN0eWxlLnJpZ2h0ID0gLXByb3BzLnBhZGRpbmdSaWdodC0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcHJvcHMub2Zmc2V0LmxlZnQgLXByb3BzLnBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUuYm90dG9tID0gLXByb3BzLnBhZGRpbmdCb3R0b20tMSArICdweCc7XG5cblx0XHR0aGlzLmd1aWRlUGFkZGluZ1RvcC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXByb3BzLm9mZnNldC5sZWZ0IC1wcm9wcy5wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLnRvcCA9IC1wcm9wcy5wYWRkaW5nVG9wLTEgKyAncHgnO1xuXG5cdFx0Ly8gbWFyZ2luIGd1aWRlc1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1wcm9wcy5vZmZzZXQudG9wIC1wcm9wcy5wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUubGVmdCA9IC1wcm9wcy5wYWRkaW5nTGVmdCAtcHJvcHMubWFyZ2luTGVmdCArICdweCc7XG5cblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpblJpZ2h0LnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpblJpZ2h0LnN0eWxlLnJpZ2h0ID0gLXByb3BzLnBhZGRpbmdSaWdodCAtcHJvcHMubWFyZ2luUmlnaHQgLSAxICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUuYm90dG9tID0gLXByb3BzLnBhZGRpbmdCb3R0b20gLXByb3BzLm1hcmdpbkJvdHRvbSAtMSArICdweCc7XG5cblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcHJvcHMub2Zmc2V0LmxlZnQgLXByb3BzLnBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpblRvcC5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLnRvcCA9IC1wcm9wcy5wYWRkaW5nVG9wIC1wcm9wcy5tYXJnaW5Ub3AgLTEgKyAncHgnO1xuXG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cblx0fSxcblxuXHRlbnRlclJ1bGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY3JlYXRlR2hvc3RzKCk7XG5cdH0sXG5cblx0Y2hhbmdlUnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5kZXN0cm95R2hvc3RzKCk7XG5cdFx0dGhpcy5jcmVhdGVHaG9zdHMoKTtcblx0fSxcblxuXHRleGl0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5kZXN0cm95R2hvc3RzKCk7XG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudXBkYXRlR2hvc3RzKCk7XG5cdH0sXG5cblx0LyogbWVtYmVyIGZ1bmN0aW9ucyAqL1xuXG5cdGdob3N0czogW10sXG5cblx0Y3JlYXRlR2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZ2hvc3RzID0gdGhpcy5naG9zdHM7XG5cdFx0JChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZS5zZWxlY3RvclRleHQpLm5vdChMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5ub3QoJy5vdmVybGF5LCAub3ZlcmxheSAqJykuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHZhciBnaG9zdCA9IG5ldyBHaG9zdCh0aGlzKTtcblx0XHRcdGdob3N0LnJlbGF5b3V0KCk7XG5cdFx0XHRnaG9zdHMucHVzaChnaG9zdCk7XG5cdFx0fSk7XG5cdH0sXG5cblx0ZGVzdHJveUdob3N0czogZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdob3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5naG9zdHNbaV0uZGVzdHJveSgpO1xuXHRcdH1cblx0XHR0aGlzLmdob3N0cyA9IFtdO1xuXHR9LFxuXG5cdHVwZGF0ZUdob3N0czogZnVuY3Rpb24oKSB7XG5cdFx0aWYoIXRoaXMuZ2hvc3RzKSByZXR1cm47XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdob3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5naG9zdHNbaV0ucmVsYXlvdXQoKTtcblx0XHR9XHRcdFxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdjb250ZW50RWRpdGFibGUnLCB0cnVlKTtcblx0XHRMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LnN0eWxlLm91dGxpbmUgPSAnbm9uZSc7XG5cblx0XHRMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LmZvY3VzKCk7XG5cblx0XHQkKGRvY3VtZW50KS5vbigna2V5dXAnLCB0aGlzLmtleXVwKTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScpO1xuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICcnO1xuXG5cdFx0JChkb2N1bWVudCkub2ZmKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuXG5cdH0sXG5cblx0LyogbWVtYmVyIGZ1bmN0aW9ucyAqL1xuXG5cdGtleXVwOiBmdW5jdGlvbigpIHtcblx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdCQoZG9jdW1lbnQpXG5cdFx0XHQub24oJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSA9PT0gOTEpIHsgLy8gY21kIGtleVxuXHRcdFx0XHRcdHRoYXQuZW5hYmxlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRpZihlLmtleUNvZGUgPT09IDkxKSB7IC8vIGNtZCBrZXlcblx0XHRcdFx0XHR0aGF0LmRpc2FibGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRpc2FibGUoKTtcblx0fSxcblxuXHRob3ZlclRhcmdldENoYW5nZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0aWYodGhpcy5lbmFibGVkKVxuXHRcdFx0dGhpcy5wcm9jZXNzQ29tbWFuZE92ZXJMb2dpYyhlKTtcblxuXHRcdC8vIGlmIHdlJ3JlIGhvbGRpbmcgc2hpZnQgYW5kIGhvdmVyIGFub3RoZXIgZWxlbWVudCwgc2hvdyBndWlkZXNcblx0XHRpZih0aGlzLmVuYWJsZWQgJiZcblx0XHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdExheW91dE1vZGUuaG92ZXJFbGVtZW50ICE9PSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50ICYmXG5cdFx0XHQhJC5jb250YWlucyhMYXlvdXRNb2RlLmhvdmVyRWxlbWVudCwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuY3VycmVudEVsZW1lbnQsIExheW91dE1vZGUuaG92ZXJFbGVtZW50KVxuXHRcdCkge1xuXHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvKExheW91dE1vZGUuaG92ZXJFbGVtZW50KTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0ZW5hYmxlOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0XHRMYXlvdXRNb2RlLmhpZGUoKTtcblxuXHRcdC8vTGF5b3V0TW9kZS5vdmVyID0gZmFsc2U7XG5cblx0XHQvLyBwcm9jZXNzIG92ZXIgbG9naWMgb25jZVxuXHRcdGlmKExheW91dE1vZGUuX19sYXN0TW91c2VNb3ZlRXZlbnQpXG5cdFx0XHR0aGlzLnByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljKExheW91dE1vZGUuX19sYXN0TW91c2VNb3ZlRXZlbnQpO1xuXG5cdFx0Ly8gdmlzdWFsaXplIHJpZ2h0IGF3YXkgd2l0aCB3aGF0IHdlIHByZXZpb3VzbHkgaG92ZXJlZFxuXHRcdGlmKExheW91dE1vZGUuaG92ZXJFbGVtZW50ICE9PSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50ICYmXG5cdFx0XHQhJC5jb250YWlucyhMYXlvdXRNb2RlLmhvdmVyRWxlbWVudCwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuY3VycmVudEVsZW1lbnQsIExheW91dE1vZGUuaG92ZXJFbGVtZW50KVxuXHRcdCkge1xuXHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvKExheW91dE1vZGUuaG92ZXJFbGVtZW50KTtcblx0XHR9XG5cblx0fSxcblxuXHRkaXNhYmxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVuYWJsZWQgPSBmYWxzZTtcblx0XHR0aGlzLmNvbW1hbmRPdmVyID0gZmFsc2U7XG5cdFx0aWYodGhpcy52TGluZVgpIHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdGlmKHRoaXMudkxpbmVZKSB0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHRMYXlvdXRNb2RlLnNob3coKTtcblx0fSxcblxuXHRwcm9jZXNzQ29tbWFuZE92ZXJMb2dpYzogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIGV4dHJhTWFyZ2luID0gMTA7XG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIGNvbW1hbmQgb3Zlci9vdXRcblxuXHRcdGlmKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gTGF5b3V0TW9kZS5tYXJnaW5MZWZ0IC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gTGF5b3V0TW9kZS5tYXJnaW5Ub3AgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCArIExheW91dE1vZGUubWFyZ2luUmlnaHQgKyBleHRyYU1hcmdpbikgJiZcblx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgKyBMYXlvdXRNb2RlLm1hcmdpbkJvdHRvbSArIGV4dHJhTWFyZ2luKVxuXHRcdCkge1xuXG5cdFx0XHRpZighdGhpcy5jb21tYW5kT3Zlcikge1xuXHRcdFx0XHR0aGlzLmNvbW1hbmRPdmVyID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvV2luZG93KCk7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZih0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdHRoaXMuY29tbWFuZE92ZXIgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXG5cdGNyZWF0ZVZpc3VhbGl6YXRpb25MaW5lczogZnVuY3Rpb24oKSB7XG5cblx0XHRpZighdGhpcy52TGluZVgpIHtcblx0XHRcdHRoaXMudkxpbmVYID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWC5jbGFzc05hbWUgPSAndmxpbmUteCc7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudkxpbmVYKTtcblxuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWENhcHRpb24uY2xhc3NOYW1lID0gJ2NhcHRpb24nO1xuXHRcdFx0dGhpcy52TGluZVguYXBwZW5kQ2hpbGQodGhpcy52TGluZVhDYXB0aW9uKTtcblxuXHRcdFx0dGhpcy52TGluZVhDcm9zc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5jbGFzc05hbWUgPSAnY3Jvc3NiYXInO1xuXHRcdFx0dGhpcy52TGluZVguYXBwZW5kQ2hpbGQodGhpcy52TGluZVhDcm9zc0Jhcik7XG5cdFx0fVxuXG5cdFx0aWYoIXRoaXMudkxpbmVZKSB7XG5cdFx0XHR0aGlzLnZMaW5lWSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVkuY2xhc3NOYW1lID0gJ3ZsaW5lLXknO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWSk7XG5cblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVlDYXB0aW9uLmNsYXNzTmFtZSA9ICdjYXB0aW9uJztcblx0XHRcdHRoaXMudkxpbmVZLmFwcGVuZENoaWxkKHRoaXMudkxpbmVZQ2FwdGlvbik7XG5cblx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuY2xhc3NOYW1lID0gJ2Nyb3NzYmFyJztcblx0XHRcdHRoaXMudkxpbmVZLmFwcGVuZENoaWxkKHRoaXMudkxpbmVZQ3Jvc3NCYXIpO1xuXHRcdH1cblxuXHR9LFxuXG5cdHZpc3VhbGl6ZVJlbGF0aW9uVG9XaW5kb3c6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGN1cnJlbnRFbGVtZW50ID0gTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudDtcblxuXHRcdHRoaXMuY3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzKCk7XG5cblx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSAoTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LnRvcCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSkgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVYLnN0eWxlLmxlZnQgPSAwICsgJ3B4Jztcblx0XHR0aGlzLnZMaW5lWC5zdHlsZS53aWR0aCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldC5sZWZ0ICsgJ3B4Jztcblx0XHR0aGlzLnZMaW5lWENhcHRpb24uaW5uZXJIVE1MID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LmxlZnQgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdHRoaXMudkxpbmVZLnN0eWxlLmxlZnQgPSAoTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LmxlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSkgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVZLnN0eWxlLnRvcCA9IDAgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldC50b3AgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQudG9wICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0fSxcblxuXHR2aXN1YWxpemVSZWxhdGlvblRvOiBmdW5jdGlvbihyZWxhdGVkRWxlbWVudCkge1xuXG5cdFx0dmFyIGN1cnJlbnRFbGVtZW50ID0gTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCwgdG9wLCBsZWZ0O1xuXHRcdHZhciBjdXJyZW50T2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXHRcdHZhciByZWxhdGVkT2Zmc2V0ID0gJChyZWxhdGVkRWxlbWVudCkub2Zmc2V0KCk7XG5cblx0XHR0aGlzLmNyZWF0ZVZpc3VhbGl6YXRpb25MaW5lcygpO1xuXG5cdFx0dmFyIHJlUmlnaHRFZGdlID0gcmVsYXRlZE9mZnNldC5sZWZ0ICsgcmVsYXRlZEVsZW1lbnQub2Zmc2V0V2lkdGg7XG5cdFx0dmFyIGNlUmlnaHRFZGdlID0gY3VycmVudE9mZnNldC5sZWZ0ICsgY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XG5cdFx0dmFyIHJlTGVmdEVkZ2UgPSByZWxhdGVkT2Zmc2V0LmxlZnQ7XG5cdFx0dmFyIGNlTGVmdEVkZ2UgPSBjdXJyZW50T2Zmc2V0LmxlZnQ7XG5cblx0XHR2YXIgcmVCb3R0b21FZGdlID0gcmVsYXRlZE9mZnNldC50b3AgKyByZWxhdGVkRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cdFx0dmFyIGNlQm90dG9tRWRnZSA9IGN1cnJlbnRPZmZzZXQudG9wICsgY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXHRcdHZhciByZVRvcEVkZ2UgPSByZWxhdGVkT2Zmc2V0LnRvcDtcblx0XHR2YXIgY2VUb3BFZGdlID0gY3VycmVudE9mZnNldC50b3A7XG5cdFx0XG5cdFx0Ly8gaG9yaXpvbnRhbCBjb25uZWN0aW9uXG5cdFx0aWYocmVSaWdodEVkZ2UgPCBjZUxlZnRFZGdlKSB7XG5cblx0XHRcdHRvcCA9IGN1cnJlbnRPZmZzZXQudG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IHJlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSBjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVCb3R0b21FZGdlIDwgdG9wKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAoY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2UgaWYodG9wIDwgcmVUb3BFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAocmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYoY2VSaWdodEVkZ2UgPCByZUxlZnRFZGdlKSB7XG5cblx0XHRcdHRvcCA9IGN1cnJlbnRPZmZzZXQudG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IGNlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gcmVMZWZ0RWRnZSAtIGNlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSByZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVCb3R0b21FZGdlIDwgdG9wKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKGNlVG9wRWRnZSAtIHJlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIGlmKHRvcCA8IHJlVG9wRWRnZSkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMTAwJSc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChyZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHR9XG5cblx0XHQvLyB2ZXJ0aWNhbCBjb25uZWN0aW9uXG5cdFx0aWYocmVCb3R0b21FZGdlIDwgY2VUb3BFZGdlKSB7XG5cblx0XHRcdGxlZnQgPSBjdXJyZW50T2Zmc2V0LmxlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKTtcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gcmVCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IGNlVG9wRWRnZSAtIHJlQm90dG9tRWRnZSArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uaW5uZXJIVE1MID0gY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdGlmKHJlUmlnaHRFZGdlIDwgbGVmdCkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIGlmKGxlZnQgPCByZUxlZnRFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAocmVMZWZ0RWRnZSAtIGNlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYoY2VCb3R0b21FZGdlIDwgcmVUb3BFZGdlKSB7XG5cblx0XHRcdGxlZnQgPSBjdXJyZW50T2Zmc2V0LmxlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKTtcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gY2VCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uaW5uZXJIVE1MID0gcmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdGlmKHJlUmlnaHRFZGdlIDwgbGVmdCkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSBpZihsZWZ0IDwgcmVMZWZ0RWRnZSkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChyZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHR9XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRwcmlvcml0eTogMCxcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5oYW5kbGVIZWlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtc2l6ZVwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpO1xuXHRcdHRoaXMuaGFuZGxlV2lkdGggPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1zaXplXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cblx0XHR0aGlzLmNhcHRpb25XaWR0aCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24td2lkdGhcIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHR0aGlzLmNhcHRpb25IZWlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLWhlaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0dGhpcy5pbml0RHJhZ2dlcnMoKTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3ZlcklubmVyID0gZmFsc2U7XG5cdFx0TGF5b3V0TW9kZS5vdmVyU2l6ZSA9IGZhbHNlO1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItaW5uZXInKTtcblx0fSxcblxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRpZih0aGlzLm92ZXJJbm5lcikgTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbm5lcicpO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItaW5uZXInKTtcblx0fSxcblxuXHRtb3VzZW1vdmU6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdHZhciBvZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHQvLyBvdmVyIGlubmVyIGJveFxuXHRcdGlmKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCAmJlxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLnBhZGRpbmdUb3AgJiZcblx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggLSBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodCkgJiZcblx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgLSBMYXlvdXRNb2RlLnBhZGRpbmdCb3R0b20pICYmXG5cdFx0XHQhZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdoYW5kbGUtcGFkZGluZycpICYmXG5cdFx0XHQhZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdoYW5kbGUtbWFyZ2luJylcblx0XHQpIHtcblx0XHRcdGlmKCF0aGlzLm92ZXJJbm5lcikge1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLWlubmVyJyk7XG5cdFx0XHRcdHRoaXMub3ZlcklubmVyID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVySW5uZXIpIHtcblx0XHRcdFx0dGhpcy5vdmVySW5uZXIgPSBmYWxzZTtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbm5lcicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMucHJvY2Vzc092ZXJXaWR0aChlKTtcblx0XHR0aGlzLnByb2Nlc3NPdmVySGVpZ2h0KGUpO1xuXG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKHByb3BzLCBoYW5kbGVTaXplKSB7XG5cblx0XHR0aGlzLmhhbmRsZVdpZHRoWzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemUueSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVIZWlnaHRbMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplLnggKyAncHgnO1xuXG5cdFx0dGhpcy5oYW5kbGVXaWR0aFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAocHJvcHMucGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemUueSAvIDQpICogcHJvcHMucGFkZGluZ1JpZ2h0KSAvIDUpIC0gKGhhbmRsZVNpemUueSAqIDEuNSkpIDogLShoYW5kbGVTaXplLnkgLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHR0aGlzLmNhcHRpb25XaWR0aC5zdHlsZS5tYXJnaW5Ub3AgPSAocHJvcHMucGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemUueSAvIDQpICogcHJvcHMucGFkZGluZ1JpZ2h0KSAvIDUpIC0gKGhhbmRsZVNpemUueSAqIDEuNSkpIDogLTgpICsgJ3B4JztcblxuXHRcdHRoaXMuaGFuZGxlSGVpZ2h0WzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMucGFkZGluZ0JvdHRvbSA8IDIwID8gKCsoKChoYW5kbGVTaXplLnggLyA0KSAqIHByb3BzLnBhZGRpbmdCb3R0b20pIC8gNSkgLSAoaGFuZGxlU2l6ZS54ICogMS41KSkgOiAtKGhhbmRsZVNpemUueCAvIDIpKSArICdweCc7XG5cdFx0dGhpcy5jYXB0aW9uSGVpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMucGFkZGluZ0JvdHRvbSA8IDIwID8gKChoYW5kbGVTaXplLnggKiAocHJvcHMucGFkZGluZ0JvdHRvbSAvIDIwKSkgLSBoYW5kbGVTaXplLnggKiAyICsgaGFuZGxlU2l6ZS54IC0gOSkgOiAtMTApICsgJ3B4JztcblxuXHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0cHJvY2Vzc092ZXJXaWR0aDogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIG92ZXIgcmlnaHQgc2lkZVxuXHRcdGlmKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCArIExheW91dE1vZGUuaW5uZXJXaWR0aCAtIDUgJiZcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5wYWRkaW5nVG9wICYmXG5cdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoIC0gTGF5b3V0TW9kZS5wYWRkaW5nUmlnaHQpICYmXG5cdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0IC0gTGF5b3V0TW9kZS5wYWRkaW5nQm90dG9tKSAmJlxuXHRcdFx0IWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnaGFuZGxlLXBhZGRpbmcnKSAmJlxuXHRcdFx0IWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnaGFuZGxlLW1hcmdpbicpXG5cdFx0KSB7XG5cblx0XHRcdGlmKCF0aGlzLm92ZXJXaWR0aCkge1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZS13aWR0aCcpO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cdFx0XHRcdExheW91dE1vZGUuc2VsZWN0UnVsZSgnd2lkdGgnKTtcblx0XHRcdFx0dGhpcy5vdmVyV2lkdGggPSB0cnVlO1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJTaXplID0gdHJ1ZTtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYodGhpcy5vdmVyV2lkdGgpIHtcblx0XHRcdFx0dGhpcy5vdmVyV2lkdGggPSBmYWxzZTtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVyU2l6ZSA9IGZhbHNlO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ3Jlc2l6ZS13aWR0aCcpO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCd3aWR0aCcpO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0cHJvY2Vzc092ZXJIZWlnaHQ6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdHZhciBvZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHQvLyBvdmVyIGJvdHRvbSBzaWRlXG5cdFx0aWYoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCArIExheW91dE1vZGUuaW5uZXJIZWlnaHQgLSA1ICYmXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICYmXG5cdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0IC0gTGF5b3V0TW9kZS5wYWRkaW5nQm90dG9tKSAmJlxuXHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAtIExheW91dE1vZGUucGFkZGluZ1JpZ2h0KSAmJlxuXHRcdFx0IWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnaGFuZGxlLXBhZGRpbmcnKVxuXHRcdFx0JiYgIWUudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnaGFuZGxlLW1hcmdpbicpXG5cdFx0KSB7XG5cblx0XHRcdGlmKCF0aGlzLm92ZXJIZWlnaHQpIHtcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdyZXNpemUtaGVpZ2h0Jyk7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdHRoaXMucmVmcmVzaENhcHRpb25zKCk7XG5cdFx0XHRcdExheW91dE1vZGUuc2VsZWN0UnVsZSgnaGVpZ2h0Jyk7XG5cdFx0XHRcdHRoaXMub3ZlckhlaWdodCA9IHRydWU7XG5cdFx0XHRcdExheW91dE1vZGUub3ZlclNpemUgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYodGhpcy5vdmVySGVpZ2h0KSB7XG5cdFx0XHRcdHRoaXMub3ZlckhlaWdodCA9IGZhbHNlO1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJTaXplID0gZmFsc2U7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplLWhlaWdodCcpO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHR0aGlzLnJlZnJlc2hDYXB0aW9ucygpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLmRlc2VsZWN0UnVsZSgnaGVpZ2h0Jyk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSxcblxuXHRyZWZyZXNoQ2FwdGlvbnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblx0XHR2YXIgaGl0c1JpZ2h0RWRnZTtcblxuXHRcdGhpdHNSaWdodEVkZ2UgPSAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyA4MCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcblx0XHR0aGlzLmNhcHRpb25XaWR0aC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0dGhpcy5jYXB0aW9uV2lkdGguaW5uZXJIVE1MID0gJzxzcGFuPndpZHRoOiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCd3aWR0aCcpO1xuXHRcdHRoaXMuY2FwdGlvbldpZHRoLnN0eWxlLnJpZ2h0ID0gKGhpdHNSaWdodEVkZ2UgPyAxNiA6IC0odGhpcy5jYXB0aW9uV2lkdGgub2Zmc2V0V2lkdGggKyAxMykpICsgJ3B4JztcblxuXHRcdHRoaXMuY2FwdGlvbkhlaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+aGVpZ2h0OiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCdoZWlnaHQnKTtcblxuXHR9LFxuXG5cdGluaXREcmFnZ2VyczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIGlzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudDtcblxuXHRcdC8vIHdpZHRoXG5cdFx0JChkb2N1bWVudCkub24oaXNUb3VjaCA/ICd0b3VjaHN0YXJ0JyA6ICdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0XHRpZih0aGF0Lm92ZXJXaWR0aCkge1xuXG5cdFx0XHRcdHZhciBzdGFydFdpZHRoID0gTGF5b3V0TW9kZS5pbm5lcldpZHRoO1xuXG5cdFx0XHRcdG5ldyBEcmFnZ2VyKGV2ZW50Lm9yaWdpbmFsRXZlbnQsIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbDogZmFsc2UsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gTGF5b3V0TW9kZS5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS53aWR0aCA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRXaWR0aCAtIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XHRcblxuXHRcdFx0fSBlbHNlIGlmKHRoYXQub3ZlckhlaWdodCkge1xuXG5cdFx0XHRcdHZhciBzdGFydEhlaWdodCA9IExheW91dE1vZGUuaW5uZXJIZWlnaHQ7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiB0cnVlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHQoTGF5b3V0TW9kZS5zZWxlY3RlZFJ1bGUgfHwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkuc3R5bGUuaGVpZ2h0ID0gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydEhlaWdodCAtIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblxuXHRcdH0pO1xuXG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0cHJpb3JpdHk6IDEsXG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1wYWRkaW5nXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1wYWRkaW5nXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSB0b3AgaGFuZGxlLXBhZGRpbmdcIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KTtcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBsZWZ0IGhhbmRsZS1wYWRkaW5nXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wLmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyVG9wSGFuZGxlID0gdHJ1ZTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlclRvcEhhbmRsZSA9IGZhbHNlO1xuXHRcdH0pO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbS5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlckJvdHRvbUhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJCb3R0b21IYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyTGVmdEhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJMZWZ0SGFuZGxlID0gZmFsc2U7XG5cdFx0fSk7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHQuaG92ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJSaWdodEhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJSaWdodEhhbmRsZSA9IGZhbHNlO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdHRoaXMuaW5pdERyYWdnZXJzKCk7XG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm92ZXJQYWRkaW5nID0gZmFsc2U7XG5cdFx0TGF5b3V0TW9kZS5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItcGFkZGluZycpO1xuXHR9LFxuXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKHRoaXMub3ZlclBhZGRpbmcpIExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItcGFkZGluZycpO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItcGFkZGluZycpO1xuXHR9LFxuXG5cdG1vdXNlbW92ZTogZnVuY3Rpb24oZSkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblx0XHR2YXIgd2lnZ2xlID0gNTtcblxuXHRcdHZhciBvdmVyTGluZVRvcCA9IChcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gNSAmJlxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyA1XG5cdFx0KTtcblxuXHRcdHZhciBvdmVyTGluZUJvdHRvbSA9IChcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0ICsgd2lnZ2xlXG5cdFx0KTtcblxuXHRcdHZhciBvdmVyTGluZUxlZnQgPSAoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSB3aWdnbGUgJiZcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIHdpZ2dsZVxuXHRcdCk7XG5cblx0XHR2YXIgb3ZlckxpbmVSaWdodCA9IChcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgd2lnZ2xlXG5cdFx0KTtcblxuXHRcdC8vIHRvcCBwYWRkaW5nIGJveFxuXHRcdHZhciBvdmVyUGFkZGluZ1RvcCA9IChcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCArIExheW91dE1vZGUucGFkZGluZ0xlZnQgJiYgLy9sZWZ0IHNpZGVcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIExheW91dE1vZGUucGFkZGluZ0xlZnQgKyBMYXlvdXRNb2RlLmlubmVyV2lkdGggJiYgLy8gcmlnaHQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgJiYgLy8gdG9wIHNpZGVcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5wYWRkaW5nVG9wIC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJUb3BIYW5kbGUgfHwgb3ZlckxpbmVUb3A7XG5cblx0XHQvLyBib3R0b20gcGFkZGluZyBib3hcblx0XHR2YXIgb3ZlclBhZGRpbmdCb3R0b20gPSAoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICYmIC8vbGVmdCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0ICsgTGF5b3V0TW9kZS5pbm5lcldpZHRoICYmIC8vIHJpZ2h0IHNpZGVcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAtIExheW91dE1vZGUucGFkZGluZ0JvdHRvbSAmJiAvLyB0b3Agc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0IC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJCb3R0b21IYW5kbGUgfHwgb3ZlckxpbmVCb3R0b207XG5cblx0XHQvLyBsZWZ0IHBhZGRpbmcgYm94XG5cdFx0dmFyIG92ZXJQYWRkaW5nTGVmdCA9IChcblx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5wYWRkaW5nVG9wICYmIC8vbGVmdCBzaWRlXG5cdFx0XHRlLnBhZ2VZIDwgb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCArIExheW91dE1vZGUuaW5uZXJIZWlnaHQgJiYgLy8gcmlnaHQgc2lkZVxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICYmIC8vIHRvcCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLnBhZGRpbmdMZWZ0IC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJMZWZ0SGFuZGxlIHx8IG92ZXJMaW5lTGVmdDtcblxuXHRcdC8vIHJpZ2h0IHBhZGRpbmcgYm94XG5cdFx0dmFyIG92ZXJQYWRkaW5nUmlnaHQgPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUucGFkZGluZ1RvcCAmJiAvL2xlZnQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLnBhZGRpbmdUb3AgKyBMYXlvdXRNb2RlLmlubmVySGVpZ2h0ICYmIC8vIHJpZ2h0IHNpZGVcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAtIExheW91dE1vZGUucGFkZGluZ1JpZ2h0ICYmIC8vIHRvcCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggLy8gYm90dG9tIHNpZGVcblx0XHQpIHx8IHRoaXMub3ZlclJpZ2h0SGFuZGxlIHx8IG92ZXJMaW5lUmlnaHQ7XG5cblx0XHR2YXIgbm90T3ZlckNvbXBldGluZ0hhbmRsZSA9ICFMYXlvdXRNb2RlLm92ZXJTaXplICYmICFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2hhbmRsZS1tYXJnaW4nKTtcblxuXHRcdC8vIGlmIG92ZXIgYW55IHBhZGRpbmcgYXJlYSwgc2hvdyBwYWRkaW5nIGhhbmRsZXNcblx0XHRpZihcblx0XHRcdChvdmVyUGFkZGluZ1RvcCB8fFxuXHRcdFx0b3ZlclBhZGRpbmdCb3R0b20gfHxcblx0XHRcdG92ZXJQYWRkaW5nTGVmdCB8fFxuXHRcdFx0b3ZlclBhZGRpbmdSaWdodCkgJiYgbm90T3ZlckNvbXBldGluZ0hhbmRsZVxuXHRcdCkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmcpIHtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1wYWRkaW5nJyk7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSB0cnVlO1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJQYWRkaW5nID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZykge1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nID0gZmFsc2U7XG5cdFx0XHRcdExheW91dE1vZGUub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1wYWRkaW5nJyk7XHRcdFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHZhciBjdXJzb3JBZGRlZCA9IGZhbHNlO1xuXHRcdHZhciBjdXJzb3JSZW1vdmVkID0gZmFsc2U7XG5cblx0XHRpZihvdmVyUGFkZGluZ1RvcCAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyUGFkZGluZ1RvcCkge1xuXHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nVG9wID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLXBhZGRpbmctdG9wJyk7XG5cdFx0XHRcdExheW91dE1vZGUuc2VsZWN0UnVsZSgncGFkZGluZ1RvcCcpO1xuXHRcdFx0XHRjdXJzb3JBZGRlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmdUb3ApIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ1RvcCA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5kZXNlbGVjdFJ1bGUoJ3BhZGRpbmdUb3AnKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYob3ZlclBhZGRpbmdCb3R0b20gJiYgbm90T3ZlckNvbXBldGluZ0hhbmRsZSkge1xuXHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmdCb3R0b20pIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ0JvdHRvbSA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZS1wYWRkaW5nLWJvdHRvbScpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNlbGVjdFJ1bGUoJ3BhZGRpbmdCb3R0b20nKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJQYWRkaW5nQm90dG9tKSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdCb3R0b20gPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0JvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdwYWRkaW5nQm90dG9tJyk7XG5cdFx0XHRcdGN1cnNvclJlbW92ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKG92ZXJQYWRkaW5nTGVmdCAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyUGFkZGluZ0xlZnQpIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ0xlZnQgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLXBhZGRpbmctbGVmdCcpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNlbGVjdFJ1bGUoJ3BhZGRpbmdMZWZ0Jyk7XG5cdFx0XHRcdGN1cnNvckFkZGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZ0xlZnQpIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ0xlZnQgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLmRlc2VsZWN0UnVsZSgncGFkZGluZ0xlZnQnKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYob3ZlclBhZGRpbmdSaWdodCAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyUGFkZGluZ1JpZ2h0KSB7XG5cdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdSaWdodCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLXBhZGRpbmctcmlnaHQnKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCdwYWRkaW5nUmlnaHQnKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJQYWRkaW5nUmlnaHQpIHtcblx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ1JpZ2h0ID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdwYWRkaW5nUmlnaHQnKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoIWN1cnNvckFkZGVkICYmIGN1cnNvclJlbW92ZWQpIHtcblx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplLXBhZGRpbmctdG9wJywgJ3Jlc2l6ZS1wYWRkaW5nLWJvdHRvbScsICdyZXNpemUtcGFkZGluZy1sZWZ0JywgJ3Jlc2l6ZS1wYWRkaW5nLXJpZ2h0Jyk7XG5cdFx0fVxuXG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKHByb3BzLCBoYW5kbGVTaXplKSB7XG5cblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemUueSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZS55ICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdUb3BbMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplLnggKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemUueCArICdweCc7XG5cblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIC1wcm9wcy5wYWRkaW5nTGVmdCArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luUmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdUb3BbMF0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAtcHJvcHMucGFkZGluZ1RvcCArICdweCknO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAgLXByb3BzLnBhZGRpbmdCb3R0b20gKyAncHgnO1xuXG5cdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAtKGhhbmRsZVNpemUueSAvIDIpICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAtKGhhbmRsZVNpemUueSAvIDIpICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZVBhZGRpbmdUb3BbMF0uc3R5bGUubWFyZ2luTGVmdCA9IC0oaGFuZGxlU2l6ZS54IC8gMikgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplLnggLyAyKSArICdweCc7XG5cblx0XHR0aGlzLnJlZnJlc2hDYXB0aW9ucygpO1xuXG5cdH0sXG5cblx0LyogbWVtYmVyIGZ1bmN0aW9ucyAqL1xuXG5cdHJlZnJlc2hDYXB0aW9uczogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0Ly8gY2FwdGlvbnNcblx0XHR2YXIgaGl0c1JpZ2h0RWRnZSwgaGl0c0xlZnRFZGdlO1xuXG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctbGVmdDogPC9zcGFuPicgKyBMYXlvdXRNb2RlLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ0xlZnQnKTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctcmlnaHQ6IDwvc3Bhbj4nICsgTGF5b3V0TW9kZS5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdSaWdodCcpO1xuXHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3AuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctdG9wOiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCdwYWRkaW5nVG9wJyk7XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0JvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy1ib3R0b206IDwvc3Bhbj4nICsgTGF5b3V0TW9kZS5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdCb3R0b20nKTtcblxuXHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIDgwIDwgMCk7XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuY2xhc3NMaXN0W2hpdHNMZWZ0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuc3R5bGUubWFyZ2luUmlnaHQgPSAoaGl0c0xlZnRFZGdlID8gTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCAtIHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0Lm9mZnNldFdpZHRoLTE2IDogTGF5b3V0TW9kZS5wYWRkaW5nTGVmdCArIDE0KSArICdweCc7XG5cblx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0LmNsYXNzTGlzdFtoaXRzUmlnaHRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IChoaXRzUmlnaHRFZGdlID8gTGF5b3V0TW9kZS5wYWRkaW5nUmlnaHQgLSB0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQub2Zmc2V0V2lkdGgtMTYgOiBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodCArIDE0KSArICdweCc7XG5cblx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tLnN0eWxlLmJvdHRvbSA9IC0oTGF5b3V0TW9kZS5wYWRkaW5nQm90dG9tICArIDI0KSArICdweCc7XG5cdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcC5zdHlsZS50b3AgPSAtKExheW91dE1vZGUucGFkZGluZ1RvcCAgKyAyNCkgKyAncHgnO1xuXG5cdH0sXG5cblx0aW5pdERyYWdnZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR2YXIgaXNUb3VjaCA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50O1xuXG5cdFx0Ly8gcGFkZGluZyBib3R0b21cblx0XHQkKGRvY3VtZW50KS5vbihpc1RvdWNoID8gJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHRcdHZhciBzdGFydFBhZGRpbmdCb3R0b20sXG5cdFx0XHRcdHN0YXJ0UGFkZGluZ1RvcCxcblx0XHRcdFx0c3RhcnRQYWRkaW5nUmlnaHQsXG5cdFx0XHRcdHN0YXJ0UGFkZGluZ0xlZnQ7XG5cblx0XHRcdGlmKHRoYXQub3ZlclBhZGRpbmdCb3R0b20pIHtcblxuXHRcdFx0XHRzdGFydFBhZGRpbmdCb3R0b20gPSBMYXlvdXRNb2RlLnBhZGRpbmdCb3R0b207XG5cdFx0XHRcdHN0YXJ0UGFkZGluZ1RvcCA9IExheW91dE1vZGUucGFkZGluZ1RvcDtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IHRydWUsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gTGF5b3V0TW9kZS5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nQm90dG9tID0gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydFBhZGRpbmdCb3R0b20gLSBkZWx0YSkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nVG9wID0gTGF5b3V0TW9kZS5hbHRQcmVzc2VkID8gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydFBhZGRpbmdCb3R0b20gLSBkZWx0YSkpICsgJ3B4JyA6IHN0YXJ0UGFkZGluZ1RvcCArICdweCc7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGF0Lm92ZXJQYWRkaW5nVG9wKSB7XG5cblx0XHRcdFx0c3RhcnRQYWRkaW5nVG9wID0gTGF5b3V0TW9kZS5wYWRkaW5nVG9wO1xuXHRcdFx0XHRzdGFydFBhZGRpbmdCb3R0b20gPSBMYXlvdXRNb2RlLnBhZGRpbmdCb3R0b207XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiB0cnVlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHQoTGF5b3V0TW9kZS5zZWxlY3RlZFJ1bGUgfHwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ1RvcCA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRQYWRkaW5nVG9wICsgZGVsdGEpKSArICdweCc7XG5cdFx0XHRcdFx0XHQoTGF5b3V0TW9kZS5zZWxlY3RlZFJ1bGUgfHwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ0JvdHRvbSA9IExheW91dE1vZGUuYWx0UHJlc3NlZCA/IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRQYWRkaW5nVG9wICsgZGVsdGEpKSArICdweCcgOiBzdGFydFBhZGRpbmdCb3R0b20gKyAncHgnO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYodGhhdC5vdmVyUGFkZGluZ1JpZ2h0KSB7XG5cblx0XHRcdFx0c3RhcnRQYWRkaW5nUmlnaHQgPSBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodDtcblx0XHRcdFx0c3RhcnRQYWRkaW5nTGVmdCA9IExheW91dE1vZGUucGFkZGluZ0xlZnQ7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiBmYWxzZSxcblx0XHRcdFx0XHRtb3ZlOiBmdW5jdGlvbihkZWx0YSkge1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSBMYXlvdXRNb2RlLnNoaWZ0UHJlc3NlZCA/IGRlbHRhIDogZGVsdGEgLyA0O1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdSaWdodCA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRQYWRkaW5nUmlnaHQgLSBkZWx0YSkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nTGVmdCA9IExheW91dE1vZGUuYWx0UHJlc3NlZCA/IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRQYWRkaW5nUmlnaHQgLSBkZWx0YSkpICsgJ3B4JyA6IHN0YXJ0UGFkZGluZ0xlZnQgKyAncHgnO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYodGhhdC5vdmVyUGFkZGluZ0xlZnQpIHtcblxuXHRcdFx0XHRzdGFydFBhZGRpbmdMZWZ0ID0gTGF5b3V0TW9kZS5wYWRkaW5nTGVmdDtcblx0XHRcdFx0c3RhcnRQYWRkaW5nUmlnaHQgPSBMYXlvdXRNb2RlLnBhZGRpbmdSaWdodDtcblxuXHRcdFx0XHRuZXcgRHJhZ2dlcihldmVudC5vcmlnaW5hbEV2ZW50LCB7XG5cdFx0XHRcdFx0dmVydGljYWw6IGZhbHNlLFxuXHRcdFx0XHRcdG1vdmU6IGZ1bmN0aW9uKGRlbHRhKSB7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IExheW91dE1vZGUuc2hpZnRQcmVzc2VkID8gZGVsdGEgOiBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0XHQoTGF5b3V0TW9kZS5zZWxlY3RlZFJ1bGUgfHwgTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ0xlZnQgPSBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0UGFkZGluZ0xlZnQgKyBkZWx0YSkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBMYXlvdXRNb2RlLmFsdFByZXNzZWQgPyBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0UGFkZGluZ0xlZnQgKyBkZWx0YSkpICsgJ3B4JyA6IHN0YXJ0UGFkZGluZ1JpZ2h0ICsgJ3B4Jztcblx0XHRcdFx0XHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9XG5cblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdHByaW9yaXR5OiAyLFxuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1tYXJnaW5cIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KTtcblx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtbWFyZ2luXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHRvcCBoYW5kbGUtbWFyZ2luXCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudCk7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBsZWZ0IGhhbmRsZS1tYXJnaW5cIj48L2Rpdj4nKS5hcHBlbmRUbyhMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50KTtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlclRvcEhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJUb3BIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbS5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlckJvdHRvbUhhbmRsZSA9IHRydWU7XG5cdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJCb3R0b21IYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnQuaG92ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGF0Lm92ZXJMZWZ0SGFuZGxlID0gdHJ1ZTtcblx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdHRoYXQub3ZlckxlZnRIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyUmlnaHRIYW5kbGUgPSB0cnVlO1xuXHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhhdC5vdmVyUmlnaHRIYW5kbGUgPSBmYWxzZTtcblx0XHR9KTtcblxuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oTGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0dGhpcy5pbml0RHJhZ2dlcnMoKTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItbWFyZ2luJyk7XG5cdH0sXG5cblx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0aWYodGhpcy5vdmVyTWFyZ2luKSBMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLW1hcmdpbicpO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItbWFyZ2luJyk7XG5cdH0sXG5cblx0bW91c2Vtb3ZlOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXHRcdHZhciB3aWdnbGUgPSA1O1xuXG5cdFx0dmFyIG92ZXJMaW5lVG9wID0gKFxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCArIHdpZ2dsZVxuXHRcdCk7XG5cblx0XHR2YXIgb3ZlckxpbmVCb3R0b20gPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgKyBMYXlvdXRNb2RlLm1hcmdpbkJvdHRvbSAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0ICsgTGF5b3V0TW9kZS5tYXJnaW5Cb3R0b20gKyB3aWdnbGVcblx0XHQpO1xuXG5cdFx0dmFyIG92ZXJMaW5lTGVmdCA9IChcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAtIExheW91dE1vZGUubWFyZ2luTGVmdCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0IC0gTGF5b3V0TW9kZS5tYXJnaW5MZWZ0ICsgd2lnZ2xlXG5cdFx0KTtcblxuXHRcdHZhciBvdmVyTGluZVJpZ2h0ID0gKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCAtIHdpZ2dsZSAmJlxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCArIHdpZ2dsZVxuXHRcdCk7XG5cblx0XHQvLyB0b3AgbWFyZ2luIGJveFxuXHRcdHZhciBvdmVyTWFyZ2luVG9wID0gKFxuXHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICYmIC8vbGVmdCBzaWRlXG5cdFx0XHRlLnBhZ2VYIDwgb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggJiYgLy8gcmlnaHQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCAmJiAvLyB0b3Agc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgLy8gYm90dG9tIHNpZGVcblx0XHQpIHx8IHRoaXMub3ZlclRvcEhhbmRsZSB8fCBvdmVyTGluZVRvcDtcblxuXHRcdC8vIGJvdHRvbSBtYXJnaW4gYm94XG5cdFx0dmFyIG92ZXJNYXJnaW5Cb3R0b20gPSAoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgJiYgLy9sZWZ0IHNpZGVcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCAmJiAvLyByaWdodCBzaWRlXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIExheW91dE1vZGUub3V0ZXJIZWlnaHQgJiYgLy8gdG9wIHNpZGVcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCArIExheW91dE1vZGUubWFyZ2luQm90dG9tIC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJCb3R0b21IYW5kbGUgfHwgb3ZlckxpbmVCb3R0b207XG5cblx0XHQvLyBsZWZ0IG1hcmdpbiBib3hcblx0XHR2YXIgb3Zlck1hcmdpbkxlZnQgPSAoXG5cdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAmJiAvL2xlZnQgc2lkZVxuXHRcdFx0ZS5wYWdlWSA8IG9mZnNldC50b3AgKyBMYXlvdXRNb2RlLm91dGVySGVpZ2h0ICYmIC8vIHJpZ2h0IHNpZGVcblx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAtIExheW91dE1vZGUubWFyZ2luTGVmdCAmJiAvLyB0b3Agc2lkZVxuXHRcdFx0ZS5wYWdlWCA8IG9mZnNldC5sZWZ0IC8vIGJvdHRvbSBzaWRlXG5cdFx0KSB8fCB0aGlzLm92ZXJMZWZ0SGFuZGxlIHx8IG92ZXJMaW5lTGVmdDtcblxuXHRcdC8vIHJpZ2h0IG1hcmdpbiBib3hcblx0XHR2YXIgb3Zlck1hcmdpblJpZ2h0ID0gKFxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgJiYgLy9sZWZ0IHNpZGVcblx0XHRcdGUucGFnZVkgPCBvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCAmJiAvLyByaWdodCBzaWRlXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyBMYXlvdXRNb2RlLm91dGVyV2lkdGggJiYgLy8gdG9wIHNpZGVcblx0XHRcdGUucGFnZVggPCBvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCArIExheW91dE1vZGUubWFyZ2luUmlnaHQgLy8gYm90dG9tIHNpZGVcblx0XHQpIHx8IHRoaXMub3ZlclJpZ2h0SGFuZGxlIHx8IG92ZXJMaW5lUmlnaHQ7XG5cblx0XHR2YXIgbm90T3ZlckNvbXBldGluZ0hhbmRsZSA9ICFMYXlvdXRNb2RlLm92ZXJTaXplICYmICFMYXlvdXRNb2RlLm92ZXJQYWRkaW5nICYmICFlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2hhbmRsZS1wYWRkaW5nJyk7XG5cblx0XHQvLyBpZiBvdmVyIGFueSBtYXJnaW4gYXJlYSwgc2hvdyBtYXJnaW4gaGFuZGxlc1xuXHRcdGlmKFxuXHRcdFx0KG92ZXJNYXJnaW5Ub3AgfHxcblx0XHRcdG92ZXJNYXJnaW5Cb3R0b20gfHxcblx0XHRcdG92ZXJNYXJnaW5MZWZ0IHx8XG5cdFx0XHRvdmVyTWFyZ2luUmlnaHQpICYmIG5vdE92ZXJDb21wZXRpbmdIYW5kbGVcblx0XHQpIHtcblx0XHRcdGlmKCF0aGlzLm92ZXJNYXJnaW4pIHtcblx0XHRcdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1tYXJnaW4nKTtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luKSB7XG5cdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdFx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLW1hcmdpbicpO1x0XHRcblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgY3Vyc29yQWRkZWQgPSBmYWxzZTtcblx0XHR2YXIgY3Vyc29yUmVtb3ZlZCA9IGZhbHNlO1xuXG5cdFx0aWYob3Zlck1hcmdpblRvcCAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyTWFyZ2luVG9wKSB7XG5cdFx0XHRcdHRoaXMub3Zlck1hcmdpblRvcCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLW1hcmdpbi10b3AnKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCdtYXJnaW5Ub3AnKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJNYXJnaW5Ub3ApIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luVG9wID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdtYXJnaW5Ub3AnKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYob3Zlck1hcmdpbkJvdHRvbSAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyTWFyZ2luQm90dG9tKSB7XG5cdFx0XHRcdHRoaXMub3Zlck1hcmdpbkJvdHRvbSA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLW1hcmdpbi1ib3R0b20nKTtcblx0XHRcdFx0TGF5b3V0TW9kZS5zZWxlY3RSdWxlKCdtYXJnaW5Cb3R0b20nKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJNYXJnaW5Cb3R0b20pIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luQm90dG9tID0gZmFsc2U7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdtYXJnaW5Cb3R0b20nKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYob3Zlck1hcmdpbkxlZnQgJiYgbm90T3ZlckNvbXBldGluZ0hhbmRsZSkge1xuXHRcdFx0aWYoIXRoaXMub3Zlck1hcmdpbkxlZnQpIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luTGVmdCA9IHRydWU7XG5cdFx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3Jlc2l6ZS1tYXJnaW4tbGVmdCcpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNlbGVjdFJ1bGUoJ21hcmdpbkxlZnQnKTtcblx0XHRcdFx0Y3Vyc29yQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZih0aGlzLm92ZXJNYXJnaW5MZWZ0KSB7XG5cdFx0XHRcdHRoaXMub3Zlck1hcmdpbkxlZnQgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7XG5cdFx0XHRcdExheW91dE1vZGUuZGVzZWxlY3RSdWxlKCdtYXJnaW5MZWZ0Jyk7XG5cdFx0XHRcdGN1cnNvclJlbW92ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKG92ZXJNYXJnaW5SaWdodCAmJiBub3RPdmVyQ29tcGV0aW5nSGFuZGxlKSB7XG5cdFx0XHRpZighdGhpcy5vdmVyTWFyZ2luUmlnaHQpIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luUmlnaHQgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncmVzaXplLW1hcmdpbi1yaWdodCcpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLnNlbGVjdFJ1bGUoJ21hcmdpblJpZ2h0Jyk7XG5cdFx0XHRcdGN1cnNvckFkZGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luUmlnaHQpIHtcblx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luUmlnaHQgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpO1xuXHRcdFx0XHRMYXlvdXRNb2RlLmRlc2VsZWN0UnVsZSgnbWFyZ2luUmlnaHQnKTtcblx0XHRcdFx0Y3Vyc29yUmVtb3ZlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoIWN1cnNvckFkZGVkICYmIGN1cnNvclJlbW92ZWQpIHtcblx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncmVzaXplLW1hcmdpbi10b3AnLCAncmVzaXplLW1hcmdpbi1ib3R0b20nLCAncmVzaXplLW1hcmdpbi1sZWZ0JywgJ3Jlc2l6ZS1tYXJnaW4tcmlnaHQnKTtcblx0XHR9XG5cblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMsIGhhbmRsZVNpemUpIHtcblxuXHRcdHRoaXMuaGFuZGxlTWFyZ2luTGVmdFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplLnkgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlTWFyZ2luUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZS55ICsgJ3B4Jztcblx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemUueCArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplLnggKyAncHgnO1xuXG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKHByb3BzLnBhZGRpbmdMZWZ0ICsgcHJvcHMubWFyZ2luTGVmdCkgKyAncHgnO1xuXHRcdHRoaXMuaGFuZGxlTWFyZ2luUmlnaHRbMF0uc3R5bGUubWFyZ2luUmlnaHQgPSAtKHByb3BzLnBhZGRpbmdSaWdodCArIHByb3BzLm1hcmdpblJpZ2h0KSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3BbMF0uc3R5bGUubWFyZ2luVG9wID0gLShwcm9wcy5wYWRkaW5nVG9wICsgcHJvcHMubWFyZ2luVG9wKSArICdweCc7XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUubWFyZ2luQm90dG9tID0gLShwcm9wcy5wYWRkaW5nQm90dG9tICsgcHJvcHMubWFyZ2luQm90dG9tKSArICdweCc7XG5cblx0XHQvLyBvZmZzZXQgbWFnaWNcblx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUubWFyZ2luVG9wID0gKHByb3BzLm1hcmdpbkxlZnQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZS55IC8gNCkgKiBwcm9wcy5tYXJnaW5MZWZ0KSAvIDUpICsgKGhhbmRsZVNpemUueSAvIDIpKSA6IC0oaGFuZGxlU2l6ZS55IC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5Ub3AgPSAocHJvcHMubWFyZ2luTGVmdCA8IDIwID8gKC0oKChoYW5kbGVTaXplLnkgLyA0KSAqIHByb3BzLm1hcmdpbkxlZnQpIC8gNSkgLSA4ICsgaGFuZGxlU2l6ZS55KSA6IC04KSArICdweCc7XG5cdFx0XG5cdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAocHJvcHMubWFyZ2luUmlnaHQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZS55IC8gNCkgKiBwcm9wcy5tYXJnaW5SaWdodCkgLyA1KSArIChoYW5kbGVTaXplLnkgLyAyKSkgOiAtKGhhbmRsZVNpemUueSAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0LnN0eWxlLm1hcmdpblRvcCA9IChwcm9wcy5tYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplLnkgLyA0KSAqIHByb3BzLm1hcmdpblJpZ2h0KSAvIDUpIC0gOCArIGhhbmRsZVNpemUueSkgOiAtOCkgKyAncHgnO1xuXHRcdFxuXHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMubWFyZ2luVG9wIDwgMjAgPyAoLSgoKGhhbmRsZVNpemUueCAvIDQpICogcHJvcHMubWFyZ2luVG9wKSAvIDUpICsgKGhhbmRsZVNpemUueCAvIDIpKSA6IC0oaGFuZGxlU2l6ZS54IC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMubWFyZ2luVG9wIDwgMjAgPyAoKGhhbmRsZVNpemUueCkgKyAoLShoYW5kbGVTaXplLngpICogKHByb3BzLm1hcmdpblRvcCAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXHRcdFxuXHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMubWFyZ2luQm90dG9tIDwgMjAgPyAoLSgoKGhhbmRsZVNpemUueCAvIDQpICogcHJvcHMubWFyZ2luQm90dG9tKSAvIDUpICsgKGhhbmRsZVNpemUueCAvIDIpKSA6IC0oaGFuZGxlU2l6ZS54IC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLm1hcmdpbkxlZnQgPSAocHJvcHMubWFyZ2luQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemUueCkgKyAoLShoYW5kbGVTaXplLngpICogKHByb3BzLm1hcmdpbkJvdHRvbSAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXG5cdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHR9LFxuXG5cdC8qIG1lbWJlciBmdW5jdGlvbnMgKi9cblxuXHRyZWZyZXNoQ2FwdGlvbnM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG9mZnNldCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldDtcblxuXHRcdC8vIGNhcHRpb25zXG5cdFx0dmFyIGhpdHNSaWdodEVkZ2UsIGhpdHNMZWZ0RWRnZTtcblxuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1sZWZ0OiA8L3NwYW4+JyArIExheW91dE1vZGUuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5MZWZ0Jyk7XG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1yaWdodDogPC9zcGFuPicgKyBMYXlvdXRNb2RlLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luUmlnaHQnKTtcblx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3AuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi10b3A6IDwvc3Bhbj4nICsgTGF5b3V0TW9kZS5nZXRDYXB0aW9uUHJvcGVydHkoJ21hcmdpblRvcCcpO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWJvdHRvbTogPC9zcGFuPicgKyBMYXlvdXRNb2RlLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luQm90dG9tJyk7XG5cblx0XHRoaXRzTGVmdEVkZ2UgPSAob2Zmc2V0LmxlZnQgLSBMYXlvdXRNb2RlLm1hcmdpbkxlZnQgLSA4MCA8IDApO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuY2xhc3NMaXN0W2hpdHNMZWZ0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5SaWdodCA9IExheW91dE1vZGUucGFkZGluZ0xlZnQgKyBMYXlvdXRNb2RlLm1hcmdpbkxlZnQgKyAoaGl0c0xlZnRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpbkxlZnQub2Zmc2V0V2lkdGgtMTcgOiAxNCkgKyAncHgnO1xuXG5cdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIExheW91dE1vZGUub3V0ZXJXaWR0aCArIExheW91dE1vZGUubWFyZ2luUmlnaHQgKyA4MCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcblx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IExheW91dE1vZGUucGFkZGluZ1JpZ2h0ICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCArIChoaXRzUmlnaHRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0Lm9mZnNldFdpZHRoLTE3IDogMTQpICsgJ3B4JztcblxuXHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5zdHlsZS5ib3R0b20gPSAtTGF5b3V0TW9kZS5tYXJnaW5Cb3R0b20gLUxheW91dE1vZGUucGFkZGluZ0JvdHRvbSAtMjQgKyAncHgnO1xuXHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5zdHlsZS50b3AgPSAtTGF5b3V0TW9kZS5tYXJnaW5Ub3AgLUxheW91dE1vZGUucGFkZGluZ1RvcCAtMjQgKyAncHgnO1xuXG5cdH0sXG5cblx0aW5pdERyYWdnZXJzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR2YXIgaXNUb3VjaCA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50O1xuXG5cdFx0Ly8gcGFkZGluZyBib3R0b21cblx0XHQkKGRvY3VtZW50KS5vbihpc1RvdWNoID8gJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHRcdHZhciBzdGFydE1hcmdpblJpZ2h0LFxuXHRcdFx0XHRzdGFydE1hcmdpbkxlZnQsXG5cdFx0XHRcdHN0YXJ0TWFyZ2luQm90dG9tLFxuXHRcdFx0XHRzdGFydE1hcmdpblRvcDtcblxuXHRcdFx0aWYodGhhdC5vdmVyTWFyZ2luTGVmdCkge1xuXG5cdFx0XHRcdHN0YXJ0TWFyZ2luTGVmdCA9IExheW91dE1vZGUubWFyZ2luTGVmdDtcblx0XHRcdFx0c3RhcnRNYXJnaW5SaWdodCA9IExheW91dE1vZGUubWFyZ2luUmlnaHQ7XG5cblx0XHRcdFx0bmV3IERyYWdnZXIoZXZlbnQub3JpZ2luYWxFdmVudCwge1xuXHRcdFx0XHRcdHZlcnRpY2FsOiBmYWxzZSxcblx0XHRcdFx0XHRtb3ZlOiBmdW5jdGlvbihkZWx0YSkge1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSBMYXlvdXRNb2RlLnNoaWZ0UHJlc3NlZCA/IGRlbHRhIDogZGVsdGEgLyA0O1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpbkxlZnQgPSBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0TWFyZ2luTGVmdCArIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpblJpZ2h0ID0gTGF5b3V0TW9kZS5hbHRQcmVzc2VkID8gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBzdGFydE1hcmdpbkxlZnQgKyBkZWx0YSkpICsgJ3B4JyA6IHN0YXJ0TWFyZ2luUmlnaHQgKyAncHgnO1xuXHRcdFx0XHRcdFx0TGF5b3V0TW9kZS5yZWxheW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYodGhhdC5vdmVyTWFyZ2luUmlnaHQpIHtcblxuXHRcdFx0XHRzdGFydE1hcmdpbkxlZnQgPSBMYXlvdXRNb2RlLm1hcmdpbkxlZnQ7XG5cdFx0XHRcdHN0YXJ0TWFyZ2luUmlnaHQgPSBMYXlvdXRNb2RlLm1hcmdpblJpZ2h0O1xuXG5cdFx0XHRcdG5ldyBEcmFnZ2VyKGV2ZW50Lm9yaWdpbmFsRXZlbnQsIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbDogZmFsc2UsXG5cdFx0XHRcdFx0bW92ZTogZnVuY3Rpb24oZGVsdGEpIHtcblx0XHRcdFx0XHRcdGRlbHRhID0gTGF5b3V0TW9kZS5zaGlmdFByZXNzZWQgPyBkZWx0YSA6IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5SaWdodCA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRNYXJnaW5SaWdodCAtIGRlbHRhKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpbkxlZnQgPSBMYXlvdXRNb2RlLmFsdFByZXNzZWQgPyBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0TWFyZ2luUmlnaHQgLSBkZWx0YSkpICsgJ3B4JyA6IHN0YXJ0TWFyZ2luTGVmdCArICdweCc7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGF0Lm92ZXJNYXJnaW5Ub3ApIHtcblxuXHRcdFx0XHRzdGFydE1hcmdpblRvcCA9IExheW91dE1vZGUubWFyZ2luVG9wO1xuXHRcdFx0XHRzdGFydE1hcmdpbkJvdHRvbSA9IExheW91dE1vZGUubWFyZ2luQm90dG9tO1xuXG5cdFx0XHRcdG5ldyBEcmFnZ2VyKGV2ZW50Lm9yaWdpbmFsRXZlbnQsIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbDogdHJ1ZSxcblx0XHRcdFx0XHRtb3ZlOiBmdW5jdGlvbihkZWx0YSkge1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSBMYXlvdXRNb2RlLnNoaWZ0UHJlc3NlZCA/IGRlbHRhIDogZGVsdGEgLyA0O1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpblRvcCA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRNYXJnaW5Ub3AgKyBkZWx0YSkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5Cb3R0b20gPSBMYXlvdXRNb2RlLmFsdFByZXNzZWQgPyBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0TWFyZ2luVG9wICsgZGVsdGEpKSArICdweCcgOiBzdGFydE1hcmdpbkJvdHRvbSArICdweCc7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZih0aGF0Lm92ZXJNYXJnaW5Cb3R0b20pIHtcblxuXHRcdFx0XHRzdGFydE1hcmdpblRvcCA9IExheW91dE1vZGUubWFyZ2luVG9wO1xuXHRcdFx0XHRzdGFydE1hcmdpbkJvdHRvbSA9IExheW91dE1vZGUubWFyZ2luQm90dG9tO1xuXG5cdFx0XHRcdG5ldyBEcmFnZ2VyKGV2ZW50Lm9yaWdpbmFsRXZlbnQsIHtcblx0XHRcdFx0XHR2ZXJ0aWNhbDogdHJ1ZSxcblx0XHRcdFx0XHRtb3ZlOiBmdW5jdGlvbihkZWx0YSkge1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSBMYXlvdXRNb2RlLnNoaWZ0UHJlc3NlZCA/IGRlbHRhIDogZGVsdGEgLyA0O1xuXHRcdFx0XHRcdFx0KExheW91dE1vZGUuc2VsZWN0ZWRSdWxlIHx8IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpbkJvdHRvbSA9IE1hdGgucm91bmQoTWF0aC5tYXgoMCwgc3RhcnRNYXJnaW5Cb3R0b20gLSBkZWx0YSkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdChMYXlvdXRNb2RlLnNlbGVjdGVkUnVsZSB8fCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5Ub3AgPSBMYXlvdXRNb2RlLmFsdFByZXNzZWQgPyBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIHN0YXJ0TWFyZ2luQm90dG9tIC0gZGVsdGEpKSArICdweCcgOiBzdGFydE1hcmdpblRvcCArICdweCc7XG5cdFx0XHRcdFx0XHRMYXlvdXRNb2RlLnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXG5cdFx0fSk7XG5cblx0fVxuXG59KTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0TGF5b3V0TW9kZS5lbmFibGUoKTtcblxuXHQvLyQoJ3VsJykuc29ydGFibGUoKTtcblx0JCgnI3Rlc3Rib3gnKS5jbGljaygpO1xuXG59KSgpO1xuXG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
