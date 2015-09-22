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

	sync: function(newElem) {

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

			//this.guideLeft = $('<div class="guide guide-left"></div>').appendTo(this.overlayElement)[0];
			//this.guideRight = $('<div class="guide guide-right"></div>').appendTo(this.overlayElement)[0];
			//this.guideBottom = $('<div class="guide guide-bottom"></div>').appendTo(this.overlayElement)[0];
			//this.guideTop = $('<div class="guide guide-top"></div>').appendTo(this.overlayElement)[0];

			this.guideMarginLeft = $('<div class="guide guide-margin-left"></div>').appendTo(this.overlayElement)[0];
			this.guideMarginRight = $('<div class="guide guide-margin-right"></div>').appendTo(this.overlayElement)[0];
			this.guideMarginBottom = $('<div class="guide guide-margin-bottom"></div>').appendTo(this.overlayElement)[0];
			this.guideMarginTop = $('<div class="guide guide-margin-top"></div>').appendTo(this.overlayElement)[0];

			this.guidePaddingLeft = $('<div class="guide guide-padding-left"></div>').appendTo(this.overlayElement)[0];
			this.guidePaddingRight = $('<div class="guide guide-padding-right"></div>').appendTo(this.overlayElement)[0];
			this.guidePaddingBottom = $('<div class="guide guide-padding-bottom"></div>').appendTo(this.overlayElement)[0];
			this.guidePaddingTop = $('<div class="guide guide-padding-top"></div>').appendTo(this.overlayElement)[0];
						
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

			var that = this;
			this.handleSizeBottom
				.add(this.handleSizeRight)
				.hover(function() {
					that.currentHandle = this;
					that.overSizeHandle = true;

					if(!that.interacting) {
						if(this === that.handleSizeRight[0]) { that.captionWidth.classList.add('over'); that.refreshCaptions(); that.selectRule('width'); }
						if(this === that.handleSizeBottom[0]) { that.captionHeight.classList.add('over'); that.selectRule('height'); }
					}

				}, function() {
					that.currentHandle = null;
					that.overSizeHandle = false;

					var self = this;
					var removeSpan = function() {
						if(self === that.handleSizeRight[0]) { that.captionWidth.classList.remove('over'); that.refreshCaptions(); that.deselectRule(); }
						if(self === that.handleSizeBottom[0]) { that.captionHeight.classList.remove('over'); that.deselectRule(); }	
					};

					if(!that.interacting) {
						removeSpan();
					} else if(!that.__catchMouseUp) {
						that.__catchMouseUp = $(document).one('mouseup', function() {
							if(!that.overSizeHandle) removeSpan();
							that.__catchMouseUp = null;
						});
					}

				});
			this.handlePaddingBottom
				.add(this.handlePaddingTop)
				.add(this.handlePaddingLeft)
				.add(this.handlePaddingRight)
				.hover(function() {
					that.currentHandle = this;
					that.overPaddingHandle = true;

					if(!that.interacting) {
						if(this === that.handlePaddingRight[0]) { that.captionPaddingRight.classList.add('over'); that.selectRule('padding-right'); that.refreshCaptions(); }
						if(this === that.handlePaddingBottom[0]) { that.captionPaddingBottom.classList.add('over'); that.selectRule('padding-bottom'); }
						if(this === that.handlePaddingLeft[0]) { that.captionPaddingLeft.classList.add('over'); that.selectRule('padding-left'); that.refreshCaptions(); }
						if(this === that.handlePaddingTop[0]) { that.captionPaddingTop.classList.add('over'); that.selectRule('padding-top'); }
					}

				}, function() {
					that.currentHandle = null;
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
					that.currentHandle = this;
					that.overMarginHandle = true;

					if(!that.interacting) {
						if(this === that.handleMarginRight[0]) { that.captionMarginRight.classList.add('over'); that.refreshCaptions(); that.selectRule('margin-right'); }
						if(this === that.handleMarginBottom[0]) { that.captionMarginBottom.classList.add('over'); that.selectRule('margin-bottom'); }
						if(this === that.handleMarginLeft[0]) { that.captionMarginLeft.classList.add('over'); that.refreshCaptions(); that.selectRule('margin-left'); }
						if(this === that.handleMarginTop[0]) { that.captionMarginTop.classList.add('over'); that.selectRule('margin-top'); }
					}

				}, function() {
					that.currentHandle = null;
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
			this.initDimensionShortcut();
			this.initHandles();
			this.initActiveHandles();

			var that = this;
			this.__keyup = function(e) {

				if(e.which === 16) {
					that.shiftPressed = false;
				}

				if(e.keyCode === 27) {
					that.unset();
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

		initTitleBox: function() {

			// initialize title box behaviour

			var that = this;
			var titleBox = this.titleBox;
			var titleDropdown = this.titleDropdown;

			$('span', titleBox).click(function() {
				$('.dropdown', titleBox).toggle();
			});


			titleDropdown.on('click', 'li', function() {

				titleDropdown.hide();
				$('.selected', titleBox).html(this.innerHTML);
				
				var cssRule = $(this).data('cssRule');
				if(cssRule) {
					that.enterRuleMode(cssRule);
				} else {
					that.exitRuleMode();
				}

			});

		},

		processCommandOverLogic: function(e) {

			var extraMargin = 10;
			var offset = this.currentOffset;

			// command over/out

			if(
				e.pageX > offset.left - this.marginLeft - extraMargin &&
				e.pageY > offset.top - this.marginTop - extraMargin &&
				e.pageX < (offset.left + this.outerWidth + this.marginRight + extraMargin) &&
				e.pageY < (offset.top + this.outerHeight + this.marginBottom + extraMargin)
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

			// over inner box

			if(!this.interacting) {

				if(
					((e.pageX > offset.left + this.paddingLeft &&
						e.pageY > offset.top + this.paddingTop &&
						e.pageX < (offset.left + this.outerWidth - this.paddingRight) &&
						e.pageY < (offset.top + this.outerHeight - this.paddingBottom)) ||
					this.overSizeHandle) &&
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

			}

			// over padding box

			if(!this.interacting) {

				if(
					((e.pageX > offset.left && e.pageY > offset.top &&
						e.pageX < (offset.left + this.outerWidth) &&
						e.pageY < (offset.top + this.outerHeight) &&
						!this.overInner) ||
					this.overPaddingHandle) &&
					!this.overSizeHandle &&
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

			}

			// over margin box

			if(!this.interacting) {

				if(
					((e.pageX > offset.left - this.marginLeft &&
						e.pageY > offset.top - this.marginTop && 
						e.pageX < (offset.left + this.outerWidth + this.marginRight) &&
						e.pageY < (offset.top + this.outerHeight + this.marginBottom) &&
						!this.overInner &&
						!this.overPadding) ||
							this.overMarginHandle) &&
					!this.overPaddingHandle &&
					!this.overSizeHandle
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

			}

		},

		initHover: function() {

			var that = this;

			$('body').on('mousemove', function(e) {

				that.__lastMouseMoveEvent = e;
				if(!that.currentElement) {
					return;
				}

				if(that.commandPressed) {
					that.processCommandOverLogic(e);
				} else {
					that.processOverLogic(e);
				}

			});

		},

		initDimensionShortcut: function() {

			var that = this;

			$(document).on('keydown', function(e) {
				if(e.which === 91) {
					that.enterDimensionMode();
				}
			});

			$(document).on('keyup', function(e) {
				if(e.which === 91) {
					that.exitDimensionMode();
				}
			});

		},

		enterDimensionMode: function() {

			this.commandPressed = true;
			this.commandOver = false;

			this.overlayElement.classList.remove('hover', 'hover-inner', 'hover-margin', 'hover-padding');
			this.overlayElement.classList.add('in-command');
			this.hoverGhost.overlayElement.style.visibility = 'hidden';
			this.titleBox.style.opacity = 0;

			if(this.__lastMouseMoveEvent)
				this.processCommandOverLogic(this.__lastMouseMoveEvent);

			if(this.hoverElement !== this.currentElement &&
				!$.contains(this.hoverElement, this.currentElement) &&
				!$.contains(this.currentElement, this.hoverElement)
			) {
				this.visualizeRelationTo(this.hoverElement);
			}

		},

		exitDimensionMode: function() {

			this.commandPressed = false;

			if(this.over) this.overlayElement.classList.add('hover');
			if(this.overInner) this.overlayElement.classList.add('hover-inner');
			if(this.overPadding) this.overlayElement.classList.add('hover-padding');
			if(this.overMargin) this.overlayElement.classList.add('hover-margin');

			this.overlayElement.classList.remove('in-command');

			// edge case: user holds command, moves out, releases command
			if(this.__lastMouseMoveEvent)
				this.processOverLogic(this.__lastMouseMoveEvent);

			this.hoverGhost.overlayElement.style.visibility = '';
			this.titleBox.style.opacity = 1;

			if(this.vLineX) this.vLineX.style.opacity = 0;
			if(this.vLineY) this.vLineY.style.opacity = 0;

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
					node === that.currentElement) {
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

		calculateSnap: function(currentValue, axis, add) {

			// this part is still somewhat broken.
			return currentValue;
/*
			var offset = this.currentOffset;
			offset.left = parseInt(offset.left);
			var targets = this.currentSnapTargets;


			if(axis === "y") {

				var target;
				for (var i = 0; i < targets.length; i++) {
					target = targets[i];

					if(Math.abs(target[1].bottom - (offset.top + add + currentValue)) < 10) {
						currentValue = parseInt(target[1].bottom) - offset.top - add - 3;
						break;
					}

					if(Math.abs(target[1].top - (offset.top + add + currentValue)) < 10) {
						currentValue = parseInt(target[1].top) - offset.top - add - 3;
						break;
					}
				}

			} else {

				var target;
				for (var i = 0; i < targets.length; i++) {
					target = targets[i];

					if(Math.abs(target[1].right - (offset.left + add + currentValue)) < 10) {
						currentValue = parseInt(target[1].right) - offset.left - add - 3;
						break;
					}

					if(Math.abs(target[1].left - (offset.left + add + currentValue)) < 10) {
						currentValue = parseInt(target[1].left) - offset.left - add - 3;
						break;
					}
				}

			}

			return currentValue;
*/
		},

		setActiveHandle: function(type, handleElement) {

			// clear previous
			this.clearActiveHandle();

			this.activeHandle = {
				node: handleElement,
				type: type
			};
			handleElement.classList.add('active');
		},

		clearActiveHandle: function() {

			if(this.activeHandle) {
				this.activeHandle.node.classList.remove('active');
				this.activeHandle = null;
			}

		},

		initActiveHandles: function() {

			var that = this;
			this.handleSizeBottom[0].onmousedown = function() { that.setActiveHandle('height', this); };
			this.handleSizeRight[0].onmousedown = function() { that.setActiveHandle('width', this); };
		},

		initHandles: function() {

			var that = this;
			var handleOffset = 3;

			var applyPrecision = function(orig, current) {
				if(that.shiftPressed) {
					var delta = orig - current;
					var precisionDelta = delta / 4;
					return current + Math.round(delta - precisionDelta);
				}
				return current;
			};

			// resize handles

			(function() {

				var start = function() { that.interacting = 'size'; this.__x = $(this).draggable('option', 'axis') === 'x'; };
				var drag = function(event, ui) {
					var x = this.__x;
					var prop = x ? 'left' : 'top';

					// apply precision drag
					ui.position[prop] = applyPrecision(ui.originalPosition[prop], ui.position[prop]);

					// calculate normal handle position
					ui.position[prop] = Math.max(0 - handleOffset, ui.position[prop]);

					// apply possible snap
					ui.position[prop] = that.calculateSnap(ui.position[prop], x ? 'x' : 'y', x ? that.paddingLeft + that.paddingRight : that.paddingTop + that.paddingBottom);

					(that.selectedRule || that.currentElement).style[x ? 'width' : 'height'] = (ui.position[prop] + handleOffset) + 'px';
					that.sync(null, true);
					that.updateGhosts();
				};
				var stop = function() {
					//this.removeAttribute('style');
					this.style.height = '';
					this.style.width = '';
					this.style.bottom = '';
					this.style.top = '';
					this.style.left = '';
					this.style.right = '';
					that.interacting = false;
				};

				that.handleSizeBottom.draggable({ distance: 0, axis: 'y', cursor: 's-resize', start: start, drag: drag, stop: stop });
				that.handleSizeRight.draggable({ distance: 0, axis: 'x', cursor: 'e-resize', start: start, drag: drag, stop: stop });

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
						ui.position.top = that.calculateSnap(ui.position.top, 'y', that.paddingTop);
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
						ui.position.left = that.calculateSnap(ui.position.left, 'x', that.paddingLeft);
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
						delta = that.shiftPressed ? Math.round(delta / 4) : delta;
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
						delta = that.shiftPressed ? Math.round(delta / 4) : delta;
						(that.selectedRule || that.currentElement).style.paddingLeft = Math.max(0, this.curPaddingLeft - delta) + 'px';
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
						delta = that.shiftPressed ? Math.round(delta / 4) : delta;
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
						delta = that.shiftPressed ? Math.round(delta / 4) : delta;
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

		sync: function(newElem, duringInteraction) {

			var computedStyle = this.computedStyle = getComputedStyle(newElem || this.currentElement);

			if(newElem) {
				this.set(newElem);
			}

			var overlayElement = this.overlayElement;
			var elem = $(this.currentElement);
			var offset = elem.offset();

			if(!duringInteraction) {
				this.offsetWidth = this.currentElement.offsetWidth;
				this.offsetHeight = this.currentElement.offsetHeight;				
			}

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

			// place title box
			this.titleBox.style.opacity = 1;
			this.titleBox.style.transform = 'translate(' + (offset.left + ((outerWidth - this.titleBox.offsetWidth) / 2)) + 'px, ' + (offset.top - marginTop - 55) + 'px)';
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

			// guides
			//this.guideLeft.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			//this.guideLeft.style.height = window.innerHeight + 'px';
			//this.guideLeft.style.left =  '0px';

			//this.guideRight.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			//this.guideRight.style.height = window.innerHeight + 'px';
			//this.guideRight.style.right = -1 + 'px';

			//this.guideBottom.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			//this.guideBottom.style.width = window.innerWidth + 'px';
			//this.guideBottom.style.bottom = -1 + 'px';

			//this.guideTop.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			//this.guideTop.style.width = window.innerWidth + 'px';
			//this.guideTop.style.top = -1 + 'px';

			// padding guides
			this.guidePaddingLeft.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			this.guidePaddingLeft.style.height = window.innerHeight + 'px';
			this.guidePaddingLeft.style.left = -paddingLeft + 'px';

			this.guidePaddingRight.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			this.guidePaddingRight.style.height = window.innerHeight + 'px';
			this.guidePaddingRight.style.right = -paddingRight-1 + 'px';

			this.guidePaddingBottom.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			this.guidePaddingBottom.style.width = window.innerWidth + 'px';
			this.guidePaddingBottom.style.bottom = -paddingBottom-1 + 'px';

			this.guidePaddingTop.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			this.guidePaddingTop.style.width = window.innerWidth + 'px';
			this.guidePaddingTop.style.top = -paddingTop-1 + 'px';

			// margin guides
			this.guideMarginLeft.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			this.guideMarginLeft.style.height = window.innerHeight + 'px';
			this.guideMarginLeft.style.left = -paddingLeft -marginLeft + 'px';

			this.guideMarginRight.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			this.guideMarginRight.style.height = window.innerHeight + 'px';
			this.guideMarginRight.style.right = -paddingRight -marginRight - 1 + 'px';

			this.guideMarginBottom.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			this.guideMarginBottom.style.width = window.innerWidth + 'px';
			this.guideMarginBottom.style.bottom = -paddingBottom -marginBottom -1 + 'px';

			this.guideMarginTop.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			this.guideMarginTop.style.width = window.innerWidth + 'px';
			this.guideMarginTop.style.top = -paddingTop -marginTop -1 + 'px';

			this.refreshHandles();
			this.refreshCaptions();

			this.currentOffset = offset;

			if(!duringInteraction) {
				this.init();
			}

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

		set: function(newElem) {

			this.currentElement = newElem;

			// initial hover
			this.overlayElement.classList.add('hover');
			this.overlayElement.style.display = 'block';
			this.over = true;

			// fill dropdown with correct CSS rules
			this.fillRules(this.currentElement);

			// content editable
			//this.currentElement.setAttribute('contentEditable', true);
			//this.currentElement.style.outline = 'none';

			if(this.computedStyle.display === 'inline') {
				this.overlayElement.classList.add('hover-inline');
			} else {
				this.overlayElement.classList.remove('hover-inline');
			}

			// compute the list of visible elements to snap to
			this.calculateSnapAreas();

		},

		unset: function() {

			if(this.selectedRule) {
				this.exitRuleMode();
			}

			this.overlayElement.classList.remove('hover', 'hover-inner', 'hover-padding', 'hover-margin', 'in-command');

			this.overlayElement.style.display = 'none';
			this.titleBox.style.opacity = 0;
			//this.currentElement.removeAttribute('contentEditable');
			//this.currentElement.style.outline = '';

			this.over = false;
			this.overInner = false;
			this.overPadding = false;
			this.overMargin = false;
			this.overCommand = false;
			this.currentElement = null;

			this.clearActiveHandle();

			$(document).off('keyup', this.__keyup);
			$(document).off('keydown', this.__keydown);

		},

		/*
		 * Functions related to rule-based editing
		 */

		enterRuleMode: function(cssRule) {

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

			var resolved = StyleParser.resolve(trackedElement);
			this.matchedRules = resolved;

			this.titleDropdown.empty();
			$('<li>inline style</li>').appendTo(this.titleDropdown);
			for (var i = 0; i < resolved.length; i++) {
				$('<li>' + resolved[i].selectorText + '</li>')
					.data('cssRule', resolved[i])
					.appendTo(this.titleDropdown);
			}

		},

		selectRule: function(cssProperty) {

			for (var i = 0; i < this.matchedRules.length; i++) {
				if(this.matchedRules[i].style[cssProperty]) {
					this.titleDropdown.find('li:eq(' + (i+1) + ')').click();
					return;
				}
			}

			this.titleDropdown.find('li:eq(1)').click();

		},

		deselectRule: function() {
			this.exitRuleMode();
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

			var currentElement = this.currentElement;

			this.createVisualizationLines();

			this.vLineX.style.opacity = 1;
			this.vLineX.style.top = (currentElement.offsetTop + (currentElement.offsetHeight / 2)) + 'px';
			this.vLineX.style.left = 0 + 'px';
			this.vLineX.style.width = currentElement.offsetLeft + 'px';
			this.vLineXCaption.innerHTML = currentElement.offsetLeft + ' <span>px</span>';

			this.vLineY.style.opacity = 1;
			this.vLineY.style.left = (currentElement.offsetLeft + (currentElement.offsetWidth / 2)) + 'px';
			this.vLineY.style.top = 0 + 'px';
			this.vLineY.style.height = currentElement.offsetTop + 'px';
			this.vLineYCaption.innerHTML = currentElement.offsetTop + ' <span>px</span>';

		},

		visualizeRelationTo: function(relatedElement) {

			var currentElement = this.currentElement, top, left;

			this.createVisualizationLines();

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

				top = currentElement.offsetTop + (currentElement.offsetHeight / 2);
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

				top = currentElement.offsetTop + (currentElement.offsetHeight / 2);
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

				left = currentElement.offsetLeft + (currentElement.offsetWidth / 2);
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

				left = currentElement.offsetLeft + (currentElement.offsetWidth / 2);
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

	// Create Overlay (singleton)
	Overlay = new Overlay();

	// make all elements on page inspectable
	$('body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)').on('mouseover', function() {

		Overlay.hoverElement = this;

		// if we're holding shift and hover another element, show guides
		if(Overlay.commandPressed &&
			Overlay.currentElement &&
			this !== Overlay.currentElement &&
			!$.contains(this, Overlay.currentElement) &&
			!$.contains(Overlay.currentElement, this)
		) {
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
	$('body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)').on('click', function() {

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

	//$('ul').sortable();
	$('#testbox').click();


})();



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiU3R5bGVQYXJzZXIuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEdob3N0ID0gZnVuY3Rpb24oZWxlbSkge1xuXG5cdHRoaXMub3ZlcmxheUVsZW1lbnQgPSB0aGlzLmNyZWF0ZSgpO1xuXHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gZWxlbTtcblxufTtcblxuJC5leHRlbmQoR2hvc3QucHJvdG90eXBlLCB7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBnaG9zdCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5IGdob3N0XCI+PC9kaXY+Jyk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cblx0XHRnaG9zdC5hcHBlbmRUbygnYm9keScpO1xuXHRcdHJldHVybiBnaG9zdFswXTtcblxuXHR9LFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0fSxcblxuXHRzeW5jOiBmdW5jdGlvbihuZXdFbGVtKSB7XG5cblx0XHRpZihuZXdFbGVtKSB7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbmV3RWxlbTtcblx0XHR9XG5cblx0XHR2YXIgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLm92ZXJsYXlFbGVtZW50O1xuXHRcdHZhciBlbGVtID0gJCh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblx0XHR2YXIgb2Zmc2V0ID0gZWxlbS5vZmZzZXQoKTtcblxuXHRcdHZhciBjb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdHZhciBpbm5lcldpZHRoID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS53aWR0aCk7XG5cdFx0dmFyIGlubmVySGVpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5oZWlnaHQpO1xuXG5cdFx0dmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nTGVmdCk7XG5cdFx0dmFyIHBhZGRpbmdUb3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdUb3ApO1xuXHRcdHZhciBwYWRkaW5nUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdSaWdodCk7XG5cdFx0dmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG5cdFx0dmFyIG1hcmdpbkxlZnQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkxlZnQpO1xuXHRcdHZhciBtYXJnaW5Ub3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblRvcCk7XG5cdFx0dmFyIG1hcmdpblJpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5SaWdodCk7XG5cdFx0dmFyIG1hcmdpbkJvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luQm90dG9tKTtcblxuXHRcdHZhciBvdXRlcldpZHRoID0gaW5uZXJXaWR0aCArIHBhZGRpbmdMZWZ0ICsgcGFkZGluZ1JpZ2h0O1xuXHRcdHZhciBvdXRlckhlaWdodCA9IGlubmVySGVpZ2h0ICsgcGFkZGluZ1RvcCArIHBhZGRpbmdCb3R0b207XG5cblx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS53aWR0aCA9IGlubmVyV2lkdGggKyAncHgnO1xuXHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLmhlaWdodCA9IGlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHQvLyBtb2RpZnkgcGFkZGluZyBib3hcblxuXHRcdC8vIGxlZnRcblx0XHQkKCcuY29udGFpbmVyLXBhZGRpbmcubGVmdCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IHBhZGRpbmdMZWZ0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCxcblx0XHRcdHRvcDogLXBhZGRpbmdUb3AsXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHRcdC8vIHJpZ2h0XG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLnJpZ2h0Jywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogcGFkZGluZ1JpZ2h0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCxcblx0XHRcdHRvcDogLXBhZGRpbmdUb3AsXG5cdFx0XHRyaWdodDogLXBhZGRpbmdSaWdodFxuXHRcdH0pO1xuXG5cdFx0Ly8gdG9wXG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLnRvcCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHBhZGRpbmdUb3AsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wXG5cdFx0fSk7XG5cblx0XHQvLyBib3R0b21cblx0XHQkKCcuY29udGFpbmVyLXBhZGRpbmcuYm90dG9tJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogaW5uZXJXaWR0aCxcblx0XHRcdGhlaWdodDogcGFkZGluZ0JvdHRvbSxcblx0XHRcdGJvdHRvbTogLXBhZGRpbmdCb3R0b21cblx0XHR9KTtcblxuXHRcdC8vIG1vZGlmeSBtYXJnaW4gYm94XG5cblx0XHQvLyBsZWZ0XG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4ubGVmdCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG1hcmdpbkxlZnQsXG5cdFx0XHRoZWlnaHQ6IG91dGVySGVpZ2h0ICsgbWFyZ2luVG9wICsgbWFyZ2luQm90dG9tLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0bGVmdDogLShwYWRkaW5nTGVmdCArIG1hcmdpbkxlZnQpXG5cdFx0fSk7XG5cblx0XHQvLyByaWdodFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLnJpZ2h0Jywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogbWFyZ2luUmlnaHQsXG5cdFx0XHRoZWlnaHQ6IG91dGVySGVpZ2h0ICsgbWFyZ2luVG9wICsgbWFyZ2luQm90dG9tLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0cmlnaHQ6IC0ocGFkZGluZ1JpZ2h0ICsgbWFyZ2luUmlnaHQpXG5cdFx0fSk7XG5cblx0XHQvLyB0b3Bcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi50b3AnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBvdXRlcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBtYXJnaW5Ub3AsXG5cdFx0XHR0b3A6IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCksXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHRcdC8vIGJvdHRvbVxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLmJvdHRvbScsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG91dGVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IG1hcmdpbkJvdHRvbSxcblx0XHRcdGJvdHRvbTogLShwYWRkaW5nQm90dG9tICsgbWFyZ2luQm90dG9tKSxcblx0XHRcdGxlZnQ6IC1wYWRkaW5nTGVmdFxuXHRcdH0pO1xuXG5cdH1cblxufSk7IiwiLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcGVjaWZpY2l0eSBvZiBDU1Mgc2VsZWN0b3JzXG4gKiBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXNlbGVjdG9ycy8jc3BlY2lmaWNpdHlcbiAqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAgLSBzZWxlY3RvcjogdGhlIGlucHV0XG4gKiAgLSBzcGVjaWZpY2l0eTogZS5nLiAwLDEsMCwwXG4gKiAgLSBwYXJ0czogYXJyYXkgd2l0aCBkZXRhaWxzIGFib3V0IGVhY2ggcGFydCBvZiB0aGUgc2VsZWN0b3IgdGhhdCBjb3VudHMgdG93YXJkcyB0aGUgc3BlY2lmaWNpdHlcbiAqL1xudmFyIFNQRUNJRklDSVRZID0gKGZ1bmN0aW9uKCkge1xuXHR2YXIgY2FsY3VsYXRlLFxuXHRcdGNhbGN1bGF0ZVNpbmdsZTtcblxuXHRjYWxjdWxhdGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdHZhciBzZWxlY3RvcnMsXG5cdFx0XHRzZWxlY3Rvcixcblx0XHRcdGksXG5cdFx0XHRsZW4sXG5cdFx0XHRyZXN1bHRzID0gW107XG5cblx0XHQvLyBTZXBhcmF0ZSBpbnB1dCBieSBjb21tYXNcblx0XHRzZWxlY3RvcnMgPSBpbnB1dC5zcGxpdCgnLCcpO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gc2VsZWN0b3JzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yc1tpXTtcblx0XHRcdGlmIChzZWxlY3Rvci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHJlc3VsdHMucHVzaChjYWxjdWxhdGVTaW5nbGUoc2VsZWN0b3IpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fTtcblxuXHQvLyBDYWxjdWxhdGUgdGhlIHNwZWNpZmljaXR5IGZvciBhIHNlbGVjdG9yIGJ5IGRpdmlkaW5nIGl0IGludG8gc2ltcGxlIHNlbGVjdG9ycyBhbmQgY291bnRpbmcgdGhlbVxuXHRjYWxjdWxhdGVTaW5nbGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdHZhciBzZWxlY3RvciA9IGlucHV0LFxuXHRcdFx0ZmluZE1hdGNoLFxuXHRcdFx0dHlwZUNvdW50ID0ge1xuXHRcdFx0XHQnYSc6IDAsXG5cdFx0XHRcdCdiJzogMCxcblx0XHRcdFx0J2MnOiAwXG5cdFx0XHR9LFxuXHRcdFx0cGFydHMgPSBbXSxcblx0XHRcdC8vIFRoZSBmb2xsb3dpbmcgcmVndWxhciBleHByZXNzaW9ucyBhc3N1bWUgdGhhdCBzZWxlY3RvcnMgbWF0Y2hpbmcgdGhlIHByZWNlZGluZyByZWd1bGFyIGV4cHJlc3Npb25zIGhhdmUgYmVlbiByZW1vdmVkXG5cdFx0XHRhdHRyaWJ1dGVSZWdleCA9IC8oXFxbW15cXF1dK1xcXSkvZyxcblx0XHRcdGlkUmVnZXggPSAvKCNbXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0Y2xhc3NSZWdleCA9IC8oXFwuW15cXHNcXCs+flxcLlxcWzpdKykvZyxcblx0XHRcdHBzZXVkb0VsZW1lbnRSZWdleCA9IC8oOjpbXlxcc1xcKz5+XFwuXFxbOl0rfDpmaXJzdC1saW5lfDpmaXJzdC1sZXR0ZXJ8OmJlZm9yZXw6YWZ0ZXIpL2dpLFxuXHRcdFx0Ly8gQSByZWdleCBmb3IgcHNldWRvIGNsYXNzZXMgd2l0aCBicmFja2V0cyAtIDpudGgtY2hpbGQoKSwgOm50aC1sYXN0LWNoaWxkKCksIDpudGgtb2YtdHlwZSgpLCA6bnRoLWxhc3QtdHlwZSgpLCA6bGFuZygpXG5cdFx0XHRwc2V1ZG9DbGFzc1dpdGhCcmFja2V0c1JlZ2V4ID0gLyg6W1xcdy1dK1xcKFteXFwpXSpcXCkpL2dpLFxuXHRcdFx0Ly8gQSByZWdleCBmb3Igb3RoZXIgcHNldWRvIGNsYXNzZXMsIHdoaWNoIGRvbid0IGhhdmUgYnJhY2tldHNcblx0XHRcdHBzZXVkb0NsYXNzUmVnZXggPSAvKDpbXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0ZWxlbWVudFJlZ2V4ID0gLyhbXlxcc1xcKz5+XFwuXFxbOl0rKS9nO1xuXG5cdFx0Ly8gRmluZCBtYXRjaGVzIGZvciBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBpbiBhIHN0cmluZyBhbmQgcHVzaCB0aGVpciBkZXRhaWxzIHRvIHBhcnRzXG5cdFx0Ly8gVHlwZSBpcyBcImFcIiBmb3IgSURzLCBcImJcIiBmb3IgY2xhc3NlcywgYXR0cmlidXRlcyBhbmQgcHNldWRvLWNsYXNzZXMgYW5kIFwiY1wiIGZvciBlbGVtZW50cyBhbmQgcHNldWRvLWVsZW1lbnRzXG5cdFx0ZmluZE1hdGNoID0gZnVuY3Rpb24ocmVnZXgsIHR5cGUpIHtcblx0XHRcdHZhciBtYXRjaGVzLCBpLCBsZW4sIG1hdGNoLCBpbmRleCwgbGVuZ3RoO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaChyZWdleCk7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdFx0XHR0eXBlQ291bnRbdHlwZV0gKz0gMTtcblx0XHRcdFx0XHRtYXRjaCA9IG1hdGNoZXNbaV07XG5cdFx0XHRcdFx0aW5kZXggPSBzZWxlY3Rvci5pbmRleE9mKG1hdGNoKTtcblx0XHRcdFx0XHRsZW5ndGggPSBtYXRjaC5sZW5ndGg7XG5cdFx0XHRcdFx0cGFydHMucHVzaCh7XG5cdFx0XHRcdFx0XHRzZWxlY3RvcjogbWF0Y2gsXG5cdFx0XHRcdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0XHRcdFx0aW5kZXg6IGluZGV4LFxuXHRcdFx0XHRcdFx0bGVuZ3RoOiBsZW5ndGhcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBSZXBsYWNlIHRoaXMgc2ltcGxlIHNlbGVjdG9yIHdpdGggd2hpdGVzcGFjZSBzbyBpdCB3b24ndCBiZSBjb3VudGVkIGluIGZ1cnRoZXIgc2ltcGxlIHNlbGVjdG9yc1xuXHRcdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShtYXRjaCwgQXJyYXkobGVuZ3RoICsgMSkuam9pbignICcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBSZW1vdmUgdGhlIG5lZ2F0aW9uIHBzdWVkby1jbGFzcyAoOm5vdCkgYnV0IGxlYXZlIGl0cyBhcmd1bWVudCBiZWNhdXNlIHNwZWNpZmljaXR5IGlzIGNhbGN1bGF0ZWQgb24gaXRzIGFyZ3VtZW50XG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZ2V4ID0gLzpub3RcXCgoW15cXCldKilcXCkvZztcblx0XHRcdGlmIChyZWdleC50ZXN0KHNlbGVjdG9yKSkge1xuXHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UocmVnZXgsICcgICAgICQxICcpO1xuXHRcdFx0fVxuXHRcdH0oKSk7XG5cblx0XHQvLyBSZW1vdmUgYW55dGhpbmcgYWZ0ZXIgYSBsZWZ0IGJyYWNlIGluIGNhc2UgYSB1c2VyIGhhcyBwYXN0ZWQgaW4gYSBydWxlLCBub3QganVzdCBhIHNlbGVjdG9yXG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZ2V4ID0gL3tbXl0qL2dtLFxuXHRcdFx0XHRtYXRjaGVzLCBpLCBsZW4sIG1hdGNoO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaChyZWdleCk7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdFx0XHRtYXRjaCA9IG1hdGNoZXNbaV07XG5cdFx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG1hdGNoLCBBcnJheShtYXRjaC5sZW5ndGggKyAxKS5qb2luKCcgJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSgpKTtcblxuXHRcdC8vIEFkZCBhdHRyaWJ1dGUgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2goYXR0cmlidXRlUmVnZXgsICdiJyk7XG5cblx0XHQvLyBBZGQgSUQgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYSlcblx0XHRmaW5kTWF0Y2goaWRSZWdleCwgJ2EnKTtcblxuXHRcdC8vIEFkZCBjbGFzcyBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChjbGFzc1JlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gQWRkIHBzZXVkby1lbGVtZW50IHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGMpXG5cdFx0ZmluZE1hdGNoKHBzZXVkb0VsZW1lbnRSZWdleCwgJ2MnKTtcblxuXHRcdC8vIEFkZCBwc2V1ZG8tY2xhc3Mgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2gocHNldWRvQ2xhc3NXaXRoQnJhY2tldHNSZWdleCwgJ2InKTtcblx0XHRmaW5kTWF0Y2gocHNldWRvQ2xhc3NSZWdleCwgJ2InKTtcblxuXHRcdC8vIFJlbW92ZSB1bml2ZXJzYWwgc2VsZWN0b3IgYW5kIHNlcGFyYXRvciBjaGFyYWN0ZXJzXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC9bXFwqXFxzXFwrPn5dL2csICcgJyk7XG5cblx0XHQvLyBSZW1vdmUgYW55IHN0cmF5IGRvdHMgb3IgaGFzaGVzIHdoaWNoIGFyZW4ndCBhdHRhY2hlZCB0byB3b3Jkc1xuXHRcdC8vIFRoZXNlIG1heSBiZSBwcmVzZW50IGlmIHRoZSB1c2VyIGlzIGxpdmUtZWRpdGluZyB0aGlzIHNlbGVjdG9yXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC9bI1xcLl0vZywgJyAnKTtcblxuXHRcdC8vIFRoZSBvbmx5IHRoaW5ncyBsZWZ0IHNob3VsZCBiZSBlbGVtZW50IHNlbGVjdG9ycyAodHlwZSBjKVxuXHRcdGZpbmRNYXRjaChlbGVtZW50UmVnZXgsICdjJyk7XG5cblx0XHQvLyBPcmRlciB0aGUgcGFydHMgaW4gdGhlIG9yZGVyIHRoZXkgYXBwZWFyIGluIHRoZSBvcmlnaW5hbCBzZWxlY3RvclxuXHRcdC8vIFRoaXMgaXMgbmVhdGVyIGZvciBleHRlcm5hbCBhcHBzIHRvIGRlYWwgd2l0aFxuXHRcdHBhcnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0cmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yOiBpbnB1dCxcblx0XHRcdHNwZWNpZmljaXR5OiAnMCwnICsgdHlwZUNvdW50LmEudG9TdHJpbmcoKSArICcsJyArIHR5cGVDb3VudC5iLnRvU3RyaW5nKCkgKyAnLCcgKyB0eXBlQ291bnQuYy50b1N0cmluZygpLFxuXHRcdFx0cGFydHM6IHBhcnRzXG5cdFx0fTtcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGNhbGN1bGF0ZTogY2FsY3VsYXRlXG5cdH07XG59KCkpO1xuXG5cbihmdW5jdGlvbigpIHtcblxuXHR2YXIgU3R5bGVQYXJzZXIgPSB7fTtcblxuXHR2YXIgcnVsZXMgPSB7fTtcblx0dmFyIHNoZWV0cyA9IGRvY3VtZW50LnN0eWxlU2hlZXRzO1xuXG5cdHZhciBzaGVldCwgcnVsZTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaGVldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcblx0XHRzaGVldCA9IHNoZWV0c1tpXTtcblx0XHRpZighc2hlZXQuY3NzUnVsZXMpIGNvbnRpbnVlO1xuXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzaGVldC5jc3NSdWxlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0cnVsZSA9IHNoZWV0LmNzc1J1bGVzW2pdO1xuXHRcdFx0cnVsZXNbcnVsZS5zZWxlY3RvclRleHRdID0gcnVsZTtcblx0XHR9XG5cdH1cblxuXHRTdHlsZVBhcnNlci5yZXNvbHZlID0gZnVuY3Rpb24odHJhY2tlZEVsZW1lbnQpIHtcblxuXHRcdHZhciBtYXRjaGVkUnVsZXMgPSB3aW5kb3cuZ2V0TWF0Y2hlZENTU1J1bGVzKHRyYWNrZWRFbGVtZW50KSB8fCBbXTtcblx0XHR2YXIgcnVsZXMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cnVsZXMucHVzaChbbWF0Y2hlZFJ1bGVzW2ldLCBwYXJzZUludChTUEVDSUZJQ0lUWS5jYWxjdWxhdGUobWF0Y2hlZFJ1bGVzW2ldLnNlbGVjdG9yVGV4dClbMF0uc3BlY2lmaWNpdHkucmVwbGFjZSgvXFwsL2csICcnKSwgMTApICsgMC4wMSAqIGldKTtcblx0XHR9XG5cblxuXG5cdFx0cnVsZXMgPSBydWxlc1xuXHRcdFx0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0XHRyZXR1cm4gYlsxXSAtIGFbMV07XG5cdFx0XHR9KVxuXHRcdFx0Lm1hcChmdW5jdGlvbihhKSB7XG5cdFx0XHRcdHJldHVybiBhWzBdO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcnVsZXM7XG5cblx0fTtcblxuXHR3aW5kb3cuU3R5bGVQYXJzZXIgPSBTdHlsZVBhcnNlcjtcblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0dmFyIE92ZXJsYXkgPSBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQgPSBudWxsOyAvLyB0aGUgYWN0dWFsIG92ZXJsYXkgZGl2XG5cdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG51bGw7IC8vIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudFxuXHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDsgLy8gd2hlbiBkZWZpbmVkLCB3ZSdyZSBpbiBydWxlIG1vZGVcblx0XHR0aGlzLmdob3N0cyA9IFtdOyAvLyBnaG9zdHMgYXJlIGVsZW1lbnRzIGNyZWF0ZWQgdG8gdmlzdWFsaXplIGhvdmVyaW5nLCBvciB3aGVuIHdlIGVkaXQgYmFzZWQgb24gcnVsZVxuXHRcdHRoaXMuaG92ZXJHaG9zdCA9IG5ldyBHaG9zdCgpOyAvLyB0aGUgaG92ZXIgZ2hvc3Rcblx0XHR0aGlzLm92ZXIgPSBmYWxzZTsgLy8gb24gd2hldGhlciB3ZSdyZSBjdXJyZW5seSBob3ZlcmluZyBhIGNlcnRhaW4gcGFydCBvZiB0aGUgb3ZlcmxheVxuXHRcdHRoaXMub3ZlcklubmVyID0gZmFsc2U7XG5cdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdHRoaXMuaW50ZXJhY3RpbmcgPSBmYWxzZTsgLy8gd2hldGhlciB3ZSdyZSBjdXJyZW50bHkgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgZWxlbWVudFxuXG5cdFx0Ly8gaW5pdGlhbGl6ZVxuXHRcdHRoaXMuY3JlYXRlKCk7XG5cblx0fTtcblxuXHQkLmV4dGVuZChPdmVybGF5LnByb3RvdHlwZSwge1xuXG5cdFx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5jcmVhdGVPdmVybGF5KCk7XG5cdFx0XHR0aGlzLmNyZWF0ZVRpdGxlKCk7XG5cblx0XHR9LFxuXG5cdFx0Y3JlYXRlT3ZlcmxheTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQgPSAkKCc8ZGl2IGlkPVwib3ZlcmxheVwiIGNsYXNzPVwib3ZlcmxheVwiPjwvZGl2PicpWzBdO1xuXG5cdFx0XHQvL3RoaXMuZ3VpZGVMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdC8vdGhpcy5ndWlkZVJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHQvL3RoaXMuZ3VpZGVCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHQvL3RoaXMuZ3VpZGVUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtbWFyZ2luLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtbWFyZ2luLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtcGFkZGluZy1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Cb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZVNpemVCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtc2l6ZVwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgaGVpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBib3R0b20gaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1zaXplXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSB3aWR0aFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgdG9wIGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHRvcCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBsZWZ0IGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgbGVmdCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24td2lkdGhcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24taGVpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR0aGlzLmhhbmRsZVNpemVCb3R0b21cblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVNpemVSaWdodClcblx0XHRcdFx0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5vdmVyU2l6ZUhhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVTaXplUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uV2lkdGguY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LnNlbGVjdFJ1bGUoJ3dpZHRoJyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlU2l6ZUJvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25IZWlnaHQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnNlbGVjdFJ1bGUoJ2hlaWdodCcpOyB9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IG51bGw7XG5cdFx0XHRcdFx0dGhhdC5vdmVyU2l6ZUhhbmRsZSA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0XHRcdHZhciByZW1vdmVTcGFuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVNpemVSaWdodFswXSkgeyB0aGF0LmNhcHRpb25XaWR0aC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlU2l6ZUJvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25IZWlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XHRcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYoIXRoYXQuX19jYXRjaE1vdXNlVXApIHtcblx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSAkKGRvY3VtZW50KS5vbmUoJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0aWYoIXRoYXQub3ZlclNpemVIYW5kbGUpIHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9IG51bGw7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b21cblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVBhZGRpbmdUb3ApXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVQYWRkaW5nTGVmdClcblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVBhZGRpbmdSaWdodClcblx0XHRcdFx0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5vdmVyUGFkZGluZ0hhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ1JpZ2h0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLXJpZ2h0Jyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ0JvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nQm90dG9tLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLWJvdHRvbScpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLWxlZnQnKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nVG9wWzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdUb3AuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnNlbGVjdFJ1bGUoJ3BhZGRpbmctdG9wJyk7IH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gbnVsbDtcblx0XHRcdFx0XHR0aGF0Lm92ZXJQYWRkaW5nSGFuZGxlID0gZmFsc2U7XG5cblx0XHRcdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRcdFx0dmFyIHJlbW92ZVNwYW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ0JvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nQm90dG9tLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nTGVmdFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1RvcFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nVG9wLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0cmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZighdGhhdC5fX2NhdGNoTW91c2VVcCkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9ICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpZighdGhhdC5vdmVyUGFkZGluZ0hhbmRsZSkgcmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gbnVsbDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVNYXJnaW5Ub3ApXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVNYXJnaW5MZWZ0KVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlTWFyZ2luUmlnaHQpXG5cdFx0XHRcdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHRoYXQub3Zlck1hcmdpbkhhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5SaWdodFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLXJpZ2h0Jyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLWJvdHRvbScpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpbkxlZnRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLWxlZnQnKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Ub3BbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luVG9wLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tdG9wJyk7IH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gbnVsbDtcblx0XHRcdFx0XHR0aGF0Lm92ZXJNYXJnaW5IYW5kbGUgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdFx0XHR2YXIgcmVtb3ZlU3BhbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5SaWdodFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luTGVmdFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Ub3BbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luVG9wLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0cmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZighdGhhdC5fX2NhdGNoTW91c2VVcCkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9ICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpZighdGhhdC5vdmVyTWFyZ2luSGFuZGxlKSByZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0fSxcblxuXHRcdGNyZWF0ZVRpdGxlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy50aXRsZUJveCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5LXRpdGxlXCI+PGRpdiBjbGFzcz1cInRpdGxlLXJ1bGVcIj48c3BhbiBjbGFzcz1cInNlbGVjdGVkXCI+aW5saW5lIHN0eWxlPC9zcGFuPiA8c3BhbiBjbGFzcz1cInRvZ2dsZVwiPuKWvjwvc3Bhbj48dWwgY2xhc3M9XCJkcm9wZG93blwiPjxsaT5pbmxpbmUgc3R5bGU8L2xpPjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cInRpdGxlLXByb3BvcnRpb25zXCI+MTAwIHggMTAwPC9kaXY+PC9kaXY+Jylcblx0XHRcdFx0LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpWzBdO1xuXG5cdFx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMgPSAkKCcudGl0bGUtcHJvcG9ydGlvbnMnLCB0aGlzLnRpdGxlQm94KVswXTtcblx0XHRcdHRoaXMudGl0bGVEcm9wZG93biA9ICQoJy5kcm9wZG93bicsIHRoaXMudGl0bGVCb3gpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogRXZlbnRzICYgQmVoYXZpb3VyIGluaXRpYWxpemF0aW9uXG5cdFx0ICovXG5cblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5pbml0VGl0bGVCb3goKTtcblx0XHRcdHRoaXMuaW5pdEhvdmVyKCk7XG5cdFx0XHR0aGlzLmluaXREaW1lbnNpb25TaG9ydGN1dCgpO1xuXHRcdFx0dGhpcy5pbml0SGFuZGxlcygpO1xuXHRcdFx0dGhpcy5pbml0QWN0aXZlSGFuZGxlcygpO1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR0aGlzLl9fa2V5dXAgPSBmdW5jdGlvbihlKSB7XG5cblx0XHRcdFx0aWYoZS53aGljaCA9PT0gMTYpIHtcblx0XHRcdFx0XHR0aGF0LnNoaWZ0UHJlc3NlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoZS5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0XHRcdHRoYXQudW5zZXQoKTtcblx0XHRcdFx0fVx0XHRcblx0XHRcdH07XG5cdFx0XHR0aGlzLl9fa2V5ZG93biA9IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxNikge1xuXHRcdFx0XHRcdHRoYXQuc2hpZnRQcmVzc2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9O1xuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleXVwJywgdGhpcy5fX2tleXVwKTtcblx0XHRcdCQoZG9jdW1lbnQpLm9uKCdrZXlkb3duJywgdGhpcy5fX2tleWRvd24pO1xuXG5cdFx0fSxcblxuXHRcdGluaXRUaXRsZUJveDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIGluaXRpYWxpemUgdGl0bGUgYm94IGJlaGF2aW91clxuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR2YXIgdGl0bGVCb3ggPSB0aGlzLnRpdGxlQm94O1xuXHRcdFx0dmFyIHRpdGxlRHJvcGRvd24gPSB0aGlzLnRpdGxlRHJvcGRvd247XG5cblx0XHRcdCQoJ3NwYW4nLCB0aXRsZUJveCkuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoJy5kcm9wZG93bicsIHRpdGxlQm94KS50b2dnbGUoKTtcblx0XHRcdH0pO1xuXG5cblx0XHRcdHRpdGxlRHJvcGRvd24ub24oJ2NsaWNrJywgJ2xpJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dGl0bGVEcm9wZG93bi5oaWRlKCk7XG5cdFx0XHRcdCQoJy5zZWxlY3RlZCcsIHRpdGxlQm94KS5odG1sKHRoaXMuaW5uZXJIVE1MKTtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBjc3NSdWxlID0gJCh0aGlzKS5kYXRhKCdjc3NSdWxlJyk7XG5cdFx0XHRcdGlmKGNzc1J1bGUpIHtcblx0XHRcdFx0XHR0aGF0LmVudGVyUnVsZU1vZGUoY3NzUnVsZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhhdC5leGl0UnVsZU1vZGUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRwcm9jZXNzQ29tbWFuZE92ZXJMb2dpYzogZnVuY3Rpb24oZSkge1xuXG5cdFx0XHR2YXIgZXh0cmFNYXJnaW4gPSAxMDtcblx0XHRcdHZhciBvZmZzZXQgPSB0aGlzLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHRcdC8vIGNvbW1hbmQgb3Zlci9vdXRcblxuXHRcdFx0aWYoXG5cdFx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gdGhpcy5tYXJnaW5Ub3AgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCArIGV4dHJhTWFyZ2luKSAmJlxuXHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0ICsgdGhpcy5tYXJnaW5Cb3R0b20gKyBleHRyYU1hcmdpbilcblx0XHRcdCkge1xuXG5cdFx0XHRcdGlmKCF0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5jb21tYW5kT3ZlciA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvV2luZG93KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZih0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5jb21tYW5kT3ZlciA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRwcm9jZXNzT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdHZhciBleHRyYU1hcmdpbiA9IDEwO1xuXHRcdFx0dmFyIG9mZnNldCA9IHRoaXMuY3VycmVudE9mZnNldDtcblxuXHRcdFx0Ly8gZ2VuZXJhbCBvdmVyL291dFxuXG5cdFx0XHRpZihcblx0XHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0IC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSB0aGlzLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0ICsgZXh0cmFNYXJnaW4pICYmXG5cdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgKyB0aGlzLm1hcmdpbkJvdHRvbSArIGV4dHJhTWFyZ2luKVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3Zlcikge1xuXHRcdFx0XHRcdHRoaXMub3ZlciA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYodGhpcy5vdmVyICYmICF0aGlzLmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcdFx0XHRcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIG92ZXIgaW5uZXIgYm94XG5cblx0XHRcdGlmKCF0aGlzLmludGVyYWN0aW5nKSB7XG5cblx0XHRcdFx0aWYoXG5cdFx0XHRcdFx0KChlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyB0aGlzLnBhZGRpbmdMZWZ0ICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIHRoaXMucGFkZGluZ1RvcCAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCAtIHRoaXMucGFkZGluZ1JpZ2h0KSAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCAtIHRoaXMucGFkZGluZ0JvdHRvbSkpIHx8XG5cdFx0XHRcdFx0dGhpcy5vdmVyU2l6ZUhhbmRsZSkgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyUGFkZGluZ0hhbmRsZSAmJiAvLyBjYW5ub3QgYmUgb3ZlciBwYWRkaW5nIGhhbmRsZVxuXHRcdFx0XHRcdCF0aGlzLm92ZXJNYXJnaW5IYW5kbGVcblx0XHRcdFx0KSB7XG5cblx0XHRcdFx0XHRpZighdGhpcy5vdmVySW5uZXIpIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5uZXInKTtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcklubmVyID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGlmKHRoaXMub3ZlcklubmVyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbm5lcicpO1x0XHRcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIG92ZXIgcGFkZGluZyBib3hcblxuXHRcdFx0aWYoIXRoaXMuaW50ZXJhY3RpbmcpIHtcblxuXHRcdFx0XHRpZihcblx0XHRcdFx0XHQoKGUucGFnZVggPiBvZmZzZXQubGVmdCAmJiBlLnBhZ2VZID4gb2Zmc2V0LnRvcCAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCkgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQpICYmXG5cdFx0XHRcdFx0XHQhdGhpcy5vdmVySW5uZXIpIHx8XG5cdFx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ0hhbmRsZSkgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyU2l6ZUhhbmRsZSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJNYXJnaW5IYW5kbGVcblx0XHRcdFx0KSB7XG5cblx0XHRcdFx0XHRpZighdGhpcy5vdmVyUGFkZGluZykge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1wYWRkaW5nJyk7XG5cblx0XHRcdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZykge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1wYWRkaW5nJyk7XHRcdFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gb3ZlciBtYXJnaW4gYm94XG5cblx0XHRcdGlmKCF0aGlzLmludGVyYWN0aW5nKSB7XG5cblx0XHRcdFx0aWYoXG5cdFx0XHRcdFx0KChlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSB0aGlzLm1hcmdpbkxlZnQgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gdGhpcy5tYXJnaW5Ub3AgJiYgXG5cdFx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCkgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgKyB0aGlzLm1hcmdpbkJvdHRvbSkgJiZcblx0XHRcdFx0XHRcdCF0aGlzLm92ZXJJbm5lciAmJlxuXHRcdFx0XHRcdFx0IXRoaXMub3ZlclBhZGRpbmcpIHx8XG5cdFx0XHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbkhhbmRsZSkgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyUGFkZGluZ0hhbmRsZSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJTaXplSGFuZGxlXG5cdFx0XHRcdCkge1xuXG5cdFx0XHRcdFx0aWYoIXRoaXMub3Zlck1hcmdpbikge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1tYXJnaW4nKTtcblx0XHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRpZih0aGlzLm92ZXJNYXJnaW4pIHtcblx0XHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1tYXJnaW4nKTtcdFx0XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGluaXRIb3ZlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdFx0JCgnYm9keScpLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cblx0XHRcdFx0dGhhdC5fX2xhc3RNb3VzZU1vdmVFdmVudCA9IGU7XG5cdFx0XHRcdGlmKCF0aGF0LmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYodGhhdC5jb21tYW5kUHJlc3NlZCkge1xuXHRcdFx0XHRcdHRoYXQucHJvY2Vzc0NvbW1hbmRPdmVyTG9naWMoZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhhdC5wcm9jZXNzT3ZlckxvZ2ljKGUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdGluaXREaW1lbnNpb25TaG9ydGN1dDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUud2hpY2ggPT09IDkxKSB7XG5cdFx0XHRcdFx0dGhhdC5lbnRlckRpbWVuc2lvbk1vZGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdCQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0aWYoZS53aGljaCA9PT0gOTEpIHtcblx0XHRcdFx0XHR0aGF0LmV4aXREaW1lbnNpb25Nb2RlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdGVudGVyRGltZW5zaW9uTW9kZTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuY29tbWFuZFByZXNzZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5jb21tYW5kT3ZlciA9IGZhbHNlO1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyJywgJ2hvdmVyLWlubmVyJywgJ2hvdmVyLW1hcmdpbicsICdob3Zlci1wYWRkaW5nJyk7XG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2luLWNvbW1hbmQnKTtcblx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG5cdFx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAwO1xuXG5cdFx0XHRpZih0aGlzLl9fbGFzdE1vdXNlTW92ZUV2ZW50KVxuXHRcdFx0XHR0aGlzLnByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljKHRoaXMuX19sYXN0TW91c2VNb3ZlRXZlbnQpO1xuXG5cdFx0XHRpZih0aGlzLmhvdmVyRWxlbWVudCAhPT0gdGhpcy5jdXJyZW50RWxlbWVudCAmJlxuXHRcdFx0XHQhJC5jb250YWlucyh0aGlzLmhvdmVyRWxlbWVudCwgdGhpcy5jdXJyZW50RWxlbWVudCkgJiZcblx0XHRcdFx0ISQuY29udGFpbnModGhpcy5jdXJyZW50RWxlbWVudCwgdGhpcy5ob3ZlckVsZW1lbnQpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvKHRoaXMuaG92ZXJFbGVtZW50KTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRleGl0RGltZW5zaW9uTW9kZTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuY29tbWFuZFByZXNzZWQgPSBmYWxzZTtcblxuXHRcdFx0aWYodGhpcy5vdmVyKSB0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cdFx0XHRpZih0aGlzLm92ZXJJbm5lcikgdGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbm5lcicpO1xuXHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZykgdGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1wYWRkaW5nJyk7XG5cdFx0XHRpZih0aGlzLm92ZXJNYXJnaW4pIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItbWFyZ2luJyk7XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaW4tY29tbWFuZCcpO1xuXG5cdFx0XHQvLyBlZGdlIGNhc2U6IHVzZXIgaG9sZHMgY29tbWFuZCwgbW92ZXMgb3V0LCByZWxlYXNlcyBjb21tYW5kXG5cdFx0XHRpZih0aGlzLl9fbGFzdE1vdXNlTW92ZUV2ZW50KVxuXHRcdFx0XHR0aGlzLnByb2Nlc3NPdmVyTG9naWModGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudCk7XG5cblx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG5cdFx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAxO1xuXG5cdFx0XHRpZih0aGlzLnZMaW5lWCkgdGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDA7XG5cdFx0XHRpZih0aGlzLnZMaW5lWSkgdGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDA7XG5cblx0XHR9LFxuXG5cdFx0aXNWaXNpYmxlOiBmdW5jdGlvbihub2RlLCByZWN0cykge1xuXG5cdFx0XHR2YXIgb2Zmc2V0VG9wID0gcmVjdHMudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cdFx0XHR2YXIgb2Zmc2V0TGVmdCA9IHJlY3RzLnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXG5cdFx0XHRpZihvZmZzZXRUb3AgPiB3aW5kb3cuaW5uZXJIZWlnaHQgfHxcblx0XHRcdFx0b2Zmc2V0TGVmdCA+IHdpbmRvdy5pbm5lcldpZHRoIHx8XG5cdFx0XHRcdG9mZnNldFRvcCArIHJlY3RzLmhlaWdodCA8IDAgfHxcblx0XHRcdFx0b2Zmc2V0TGVmdCArIHJlY3RzLndpZHRoIDwgMCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0fSxcblxuXHRcdGNhbGN1bGF0ZVNuYXBBcmVhczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHZhciBzdGFydCA9IGRvY3VtZW50LmJvZHk7XG5cdFx0XHR2YXIgY2FuZGlkYXRlcyA9IFtdO1xuXG5cdFx0XHR2YXIgaXNFbGlnaWJsZSA9IGZ1bmN0aW9uKG5vZGUsIHJlY3RzKSB7XG5cblx0XHRcdFx0dmFyIHdpZHRoID0gcmVjdHMud2lkdGg7XG5cdFx0XHRcdHZhciBoZWlnaHQgPSByZWN0cy5oZWlnaHQ7XG5cblx0XHRcdFx0aWYod2lkdGggPCAxMDAgJiYgaGVpZ2h0IDwgMTAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYobm9kZS5pZCA9PT0gJ292ZXJsYXknIHx8XG5cdFx0XHRcdFx0bm9kZS5jbGFzc05hbWUgPT09ICdvdmVybGF5LXRpdGxlJyB8fFxuXHRcdFx0XHRcdG5vZGUgPT09IHRoYXQuY3VycmVudEVsZW1lbnQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZighdGhhdC5pc1Zpc2libGUobm9kZSwgcmVjdHMpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHRcdH07XG5cblx0XHRcdHZhciByZWN1cnNlID0gZnVuY3Rpb24obm9kZSkge1xuXG5cdFx0XHRcdC8vIG5vIGNoaWxkcmVuPyBleGl0XG5cdFx0XHRcdGlmKCFub2RlLmNoaWxkcmVuKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGNhbmRpZGF0ZSwgcmVjdHM7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGNhbmRpZGF0ZSA9IG5vZGUuY2hpbGRyZW5baV07XG5cdFx0XHRcdFx0cmVjdHMgPSBjYW5kaWRhdGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdFx0aWYoaXNFbGlnaWJsZShjYW5kaWRhdGUsIHJlY3RzKSkge1xuXHRcdFx0XHRcdFx0Y2FuZGlkYXRlcy5wdXNoKFtjYW5kaWRhdGUsIHJlY3RzXSk7XG5cdFx0XHRcdFx0XHRyZWN1cnNlKGNhbmRpZGF0ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cblx0XHRcdHJlY3Vyc2Uoc3RhcnQpO1xuXHRcdFx0dGhpcy5jdXJyZW50U25hcFRhcmdldHMgPSBjYW5kaWRhdGVzO1xuXG5cdFx0fSxcblxuXHRcdGNhbGN1bGF0ZVNuYXA6IGZ1bmN0aW9uKGN1cnJlbnRWYWx1ZSwgYXhpcywgYWRkKSB7XG5cblx0XHRcdC8vIHRoaXMgcGFydCBpcyBzdGlsbCBzb21ld2hhdCBicm9rZW4uXG5cdFx0XHRyZXR1cm4gY3VycmVudFZhbHVlO1xuLypcblx0XHRcdHZhciBvZmZzZXQgPSB0aGlzLmN1cnJlbnRPZmZzZXQ7XG5cdFx0XHRvZmZzZXQubGVmdCA9IHBhcnNlSW50KG9mZnNldC5sZWZ0KTtcblx0XHRcdHZhciB0YXJnZXRzID0gdGhpcy5jdXJyZW50U25hcFRhcmdldHM7XG5cblxuXHRcdFx0aWYoYXhpcyA9PT0gXCJ5XCIpIHtcblxuXHRcdFx0XHR2YXIgdGFyZ2V0O1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR0YXJnZXQgPSB0YXJnZXRzW2ldO1xuXG5cdFx0XHRcdFx0aWYoTWF0aC5hYnModGFyZ2V0WzFdLmJvdHRvbSAtIChvZmZzZXQudG9wICsgYWRkICsgY3VycmVudFZhbHVlKSkgPCAxMCkge1xuXHRcdFx0XHRcdFx0Y3VycmVudFZhbHVlID0gcGFyc2VJbnQodGFyZ2V0WzFdLmJvdHRvbSkgLSBvZmZzZXQudG9wIC0gYWRkIC0gMztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKE1hdGguYWJzKHRhcmdldFsxXS50b3AgLSAob2Zmc2V0LnRvcCArIGFkZCArIGN1cnJlbnRWYWx1ZSkpIDwgMTApIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IHBhcnNlSW50KHRhcmdldFsxXS50b3ApIC0gb2Zmc2V0LnRvcCAtIGFkZCAtIDM7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR2YXIgdGFyZ2V0O1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR0YXJnZXQgPSB0YXJnZXRzW2ldO1xuXG5cdFx0XHRcdFx0aWYoTWF0aC5hYnModGFyZ2V0WzFdLnJpZ2h0IC0gKG9mZnNldC5sZWZ0ICsgYWRkICsgY3VycmVudFZhbHVlKSkgPCAxMCkge1xuXHRcdFx0XHRcdFx0Y3VycmVudFZhbHVlID0gcGFyc2VJbnQodGFyZ2V0WzFdLnJpZ2h0KSAtIG9mZnNldC5sZWZ0IC0gYWRkIC0gMztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKE1hdGguYWJzKHRhcmdldFsxXS5sZWZ0IC0gKG9mZnNldC5sZWZ0ICsgYWRkICsgY3VycmVudFZhbHVlKSkgPCAxMCkge1xuXHRcdFx0XHRcdFx0Y3VycmVudFZhbHVlID0gcGFyc2VJbnQodGFyZ2V0WzFdLmxlZnQpIC0gb2Zmc2V0LmxlZnQgLSBhZGQgLSAzO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiovXG5cdFx0fSxcblxuXHRcdHNldEFjdGl2ZUhhbmRsZTogZnVuY3Rpb24odHlwZSwgaGFuZGxlRWxlbWVudCkge1xuXG5cdFx0XHQvLyBjbGVhciBwcmV2aW91c1xuXHRcdFx0dGhpcy5jbGVhckFjdGl2ZUhhbmRsZSgpO1xuXG5cdFx0XHR0aGlzLmFjdGl2ZUhhbmRsZSA9IHtcblx0XHRcdFx0bm9kZTogaGFuZGxlRWxlbWVudCxcblx0XHRcdFx0dHlwZTogdHlwZVxuXHRcdFx0fTtcblx0XHRcdGhhbmRsZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0fSxcblxuXHRcdGNsZWFyQWN0aXZlSGFuZGxlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYodGhpcy5hY3RpdmVIYW5kbGUpIHtcblx0XHRcdFx0dGhpcy5hY3RpdmVIYW5kbGUubm9kZS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcblx0XHRcdFx0dGhpcy5hY3RpdmVIYW5kbGUgPSBudWxsO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGluaXRBY3RpdmVIYW5kbGVzOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tWzBdLm9ubW91c2Vkb3duID0gZnVuY3Rpb24oKSB7IHRoYXQuc2V0QWN0aXZlSGFuZGxlKCdoZWlnaHQnLCB0aGlzKTsgfTtcblx0XHRcdHRoaXMuaGFuZGxlU2l6ZVJpZ2h0WzBdLm9ubW91c2Vkb3duID0gZnVuY3Rpb24oKSB7IHRoYXQuc2V0QWN0aXZlSGFuZGxlKCd3aWR0aCcsIHRoaXMpOyB9O1xuXHRcdH0sXG5cblx0XHRpbml0SGFuZGxlczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHZhciBoYW5kbGVPZmZzZXQgPSAzO1xuXG5cdFx0XHR2YXIgYXBwbHlQcmVjaXNpb24gPSBmdW5jdGlvbihvcmlnLCBjdXJyZW50KSB7XG5cdFx0XHRcdGlmKHRoYXQuc2hpZnRQcmVzc2VkKSB7XG5cdFx0XHRcdFx0dmFyIGRlbHRhID0gb3JpZyAtIGN1cnJlbnQ7XG5cdFx0XHRcdFx0dmFyIHByZWNpc2lvbkRlbHRhID0gZGVsdGEgLyA0O1xuXHRcdFx0XHRcdHJldHVybiBjdXJyZW50ICsgTWF0aC5yb3VuZChkZWx0YSAtIHByZWNpc2lvbkRlbHRhKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gY3VycmVudDtcblx0XHRcdH07XG5cblx0XHRcdC8vIHJlc2l6ZSBoYW5kbGVzXG5cblx0XHRcdChmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgc3RhcnQgPSBmdW5jdGlvbigpIHsgdGhhdC5pbnRlcmFjdGluZyA9ICdzaXplJzsgdGhpcy5fX3ggPSAkKHRoaXMpLmRyYWdnYWJsZSgnb3B0aW9uJywgJ2F4aXMnKSA9PT0gJ3gnOyB9O1xuXHRcdFx0XHR2YXIgZHJhZyA9IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdHZhciB4ID0gdGhpcy5fX3g7XG5cdFx0XHRcdFx0dmFyIHByb3AgPSB4ID8gJ2xlZnQnIDogJ3RvcCc7XG5cblx0XHRcdFx0XHQvLyBhcHBseSBwcmVjaXNpb24gZHJhZ1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uW3Byb3BdID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbltwcm9wXSwgdWkucG9zaXRpb25bcHJvcF0pO1xuXG5cdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIG5vcm1hbCBoYW5kbGUgcG9zaXRpb25cblx0XHRcdFx0XHR1aS5wb3NpdGlvbltwcm9wXSA9IE1hdGgubWF4KDAgLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uW3Byb3BdKTtcblxuXHRcdFx0XHRcdC8vIGFwcGx5IHBvc3NpYmxlIHNuYXBcblx0XHRcdFx0XHR1aS5wb3NpdGlvbltwcm9wXSA9IHRoYXQuY2FsY3VsYXRlU25hcCh1aS5wb3NpdGlvbltwcm9wXSwgeCA/ICd4JyA6ICd5JywgeCA/IHRoYXQucGFkZGluZ0xlZnQgKyB0aGF0LnBhZGRpbmdSaWdodCA6IHRoYXQucGFkZGluZ1RvcCArIHRoYXQucGFkZGluZ0JvdHRvbSk7XG5cblx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGVbeCA/ICd3aWR0aCcgOiAnaGVpZ2h0J10gPSAodWkucG9zaXRpb25bcHJvcF0gKyBoYW5kbGVPZmZzZXQpICsgJ3B4Jztcblx0XHRcdFx0XHR0aGF0LnN5bmMobnVsbCwgdHJ1ZSk7XG5cdFx0XHRcdFx0dGhhdC51cGRhdGVHaG9zdHMoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0dmFyIHN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvL3RoaXMucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUuaGVpZ2h0ID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS53aWR0aCA9ICcnO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUuYm90dG9tID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS50b3AgPSAnJztcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmxlZnQgPSAnJztcblx0XHRcdFx0XHR0aGlzLnN0eWxlLnJpZ2h0ID0gJyc7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlU2l6ZUJvdHRvbS5kcmFnZ2FibGUoeyBkaXN0YW5jZTogMCwgYXhpczogJ3knLCBjdXJzb3I6ICdzLXJlc2l6ZScsIHN0YXJ0OiBzdGFydCwgZHJhZzogZHJhZywgc3RvcDogc3RvcCB9KTtcblx0XHRcdFx0dGhhdC5oYW5kbGVTaXplUmlnaHQuZHJhZ2dhYmxlKHsgZGlzdGFuY2U6IDAsIGF4aXM6ICd4JywgY3Vyc29yOiAnZS1yZXNpemUnLCBzdGFydDogc3RhcnQsIGRyYWc6IGRyYWcsIHN0b3A6IHN0b3AgfSk7XG5cblx0XHRcdH0pKCk7XG5cblxuXHRcdFx0Ly8gcmVzaXplIHBhZGRpbmdcblxuXHRcdFx0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZHJhZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuc3luYyhudWxsLCB0cnVlKTtcblx0XHRcdFx0XHR0aGF0LnVwZGF0ZUdob3N0cygpO1x0XHRcdFx0XHRcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdCb3R0b20uZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y3Vyc29yOiAncy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJIZWlnaHQgPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLmhlaWdodCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nQm90dG9tID0gdGhhdC5wYWRkaW5nQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdwYWRkaW5nJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi50b3AsIHVpLnBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBNYXRoLm1heCh0aGlzLmN1cklubmVySGVpZ2h0IC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gdGhhdC5jYWxjdWxhdGVTbmFwKHVpLnBvc2l0aW9uLnRvcCwgJ3knLCB0aGF0LnBhZGRpbmdUb3ApO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdCb3R0b20gKyAoKHVpLnBvc2l0aW9uLnRvcCkgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLnRvcCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nUmlnaHQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnZS1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJXaWR0aCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkud2lkdGgoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ1JpZ2h0ID0gdGhhdC5wYWRkaW5nUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi5sZWZ0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCh0aGlzLmN1cklubmVyV2lkdGggLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IHRoYXQuY2FsY3VsYXRlU25hcCh1aS5wb3NpdGlvbi5sZWZ0LCAneCcsIHRoYXQucGFkZGluZ0xlZnQpO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdSaWdodCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ1JpZ2h0ICsgKCh1aS5wb3NpdGlvbi5sZWZ0KSAtIHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nVG9wLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ24tcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC50b3A7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdUb3AgPSB0aGF0LnBhZGRpbmdUb3A7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC50b3AgLSB0aGlzLmN1ck9mZnNldCk7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IHRoYXQuc2hpZnRQcmVzc2VkID8gTWF0aC5yb3VuZChkZWx0YSAvIDQpIDogZGVsdGE7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ1RvcCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ1RvcCAtIGRlbHRhKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlUGFkZGluZ0xlZnQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMSxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAndy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VyT2Zmc2V0ID0gdWkub2Zmc2V0LmxlZnQ7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdMZWZ0ID0gdGhhdC5wYWRkaW5nTGVmdDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAncGFkZGluZyc7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC5sZWZ0IC0gdGhpcy5jdXJPZmZzZXQpO1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSB0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdMZWZ0ID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJQYWRkaW5nTGVmdCAtIGRlbHRhKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1x0XHRcdFx0XG5cblx0XHRcdH0pKCk7XG5cblxuXHRcdFx0Ly8gcmVzaXplIG1hcmdpblxuXG5cdFx0XHQoZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIHN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcblx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBkcmFnID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5zeW5jKG51bGwsIHRydWUpO1xuXHRcdFx0XHRcdHRoYXQudXBkYXRlR2hvc3RzKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5Cb3R0b20uZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y3Vyc29yOiAncy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJIZWlnaHQgPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLmhlaWdodCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5Cb3R0b20gPSB0aGF0Lm1hcmdpbkJvdHRvbTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ0JvdHRvbSA9IHRoYXQucGFkZGluZ0JvdHRvbTtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi50b3AsIHVpLnBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBNYXRoLm1heCh0aGlzLmN1cklubmVySGVpZ2h0ICsgdGhpcy5jdXJQYWRkaW5nQm90dG9tIC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpbkJvdHRvbSA9IE1hdGgubWF4KDAsIHRoaXMuY3VyTWFyZ2luQm90dG9tICsgKHVpLnBvc2l0aW9uLnRvcCAtIHVpLm9yaWdpbmFsUG9zaXRpb24udG9wKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpblJpZ2h0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ2UtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVyV2lkdGggPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLndpZHRoKCk7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpblJpZ2h0ID0gdGhhdC5tYXJnaW5SaWdodDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ1JpZ2h0ID0gdGhhdC5wYWRkaW5nUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBhcHBseVByZWNpc2lvbih1aS5vcmlnaW5hbFBvc2l0aW9uLmxlZnQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IE1hdGgubWF4KHRoaXMuY3VySW5uZXJXaWR0aCArIHRoaXMuY3VyUGFkZGluZ1JpZ2h0IC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5SaWdodCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyTWFyZ2luUmlnaHQgKyAodWkucG9zaXRpb24ubGVmdCAtIHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5MZWZ0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3ctcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC5sZWZ0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5MZWZ0ID0gdGhhdC5tYXJnaW5MZWZ0O1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdtYXJnaW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQubGVmdCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gdGhhdC5zaGlmdFByZXNzZWQgPyBNYXRoLnJvdW5kKGRlbHRhIC8gNCkgOiBkZWx0YTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5MZWZ0ID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5MZWZ0IC0gZGVsdGEpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5Ub3AuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnbi1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VyT2Zmc2V0ID0gdWkub2Zmc2V0LnRvcDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luVG9wID0gdGhhdC5tYXJnaW5Ub3A7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IC1oYW5kbGVPZmZzZXQ7XG5cdFx0XHRcdFx0XHR2YXIgZGVsdGEgPSAodWkub2Zmc2V0LnRvcCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gdGhhdC5zaGlmdFByZXNzZWQgPyBNYXRoLnJvdW5kKGRlbHRhIC8gNCkgOiBkZWx0YTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5Ub3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpblRvcCAtIGRlbHRhKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9KSgpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogQ29yZSBydW50aW1lIGZ1bmN0aW9uYWxpdHlcblx0XHQgKi9cblxuXHRcdHN5bmM6IGZ1bmN0aW9uKG5ld0VsZW0sIGR1cmluZ0ludGVyYWN0aW9uKSB7XG5cblx0XHRcdHZhciBjb21wdXRlZFN0eWxlID0gdGhpcy5jb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShuZXdFbGVtIHx8IHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHRpZihuZXdFbGVtKSB7XG5cdFx0XHRcdHRoaXMuc2V0KG5ld0VsZW0pO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLm92ZXJsYXlFbGVtZW50O1xuXHRcdFx0dmFyIGVsZW0gPSAkKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXHRcdFx0dmFyIG9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHRcdGlmKCFkdXJpbmdJbnRlcmFjdGlvbikge1xuXHRcdFx0XHR0aGlzLm9mZnNldFdpZHRoID0gdGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHRcdFx0dGhpcy5vZmZzZXRIZWlnaHQgPSB0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodDtcdFx0XHRcdFxuXHRcdFx0fVxuXG5cdFx0XHQvLyB3ZSBuZWVkIHRvIHN0b3JlIG91dGVyIGhlaWdodCwgYm90dG9tL3JpZ2h0IHBhZGRpbmcgYW5kIG1hcmdpbnMgZm9yIGhvdmVyIGRldGVjdGlvblxuXHRcdFx0dmFyIHBhZGRpbmdMZWZ0ID0gdGhpcy5wYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdFx0dmFyIHBhZGRpbmdUb3AgPSB0aGlzLnBhZGRpbmdUb3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdUb3ApO1xuXHRcdFx0dmFyIHBhZGRpbmdSaWdodCA9IHRoaXMucGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdFx0dmFyIHBhZGRpbmdCb3R0b20gPSB0aGlzLnBhZGRpbmdCb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG5cdFx0XHR2YXIgbWFyZ2luTGVmdCA9IHRoaXMubWFyZ2luTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luTGVmdCk7XG5cdFx0XHR2YXIgbWFyZ2luVG9wID0gdGhpcy5tYXJnaW5Ub3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblRvcCk7XG5cdFx0XHR2YXIgbWFyZ2luUmlnaHQgPSB0aGlzLm1hcmdpblJpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5SaWdodCk7XG5cdFx0XHR2YXIgbWFyZ2luQm90dG9tID0gdGhpcy5tYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHRcdHZhciBpbm5lcldpZHRoID0gdGhpcy5pbm5lcldpZHRoID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS53aWR0aCkgfHwgKHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodCk7XG5cdFx0XHR2YXIgaW5uZXJIZWlnaHQgPSB0aGlzLmlubmVySGVpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5oZWlnaHQpIHx8ICh0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tKTtcblxuXHRcdFx0dmFyIG91dGVyV2lkdGggPSB0aGlzLm91dGVyV2lkdGggPSBpbm5lcldpZHRoICsgcGFkZGluZ0xlZnQgKyBwYWRkaW5nUmlnaHQ7XG5cdFx0XHR2YXIgb3V0ZXJIZWlnaHQgPSB0aGlzLm91dGVySGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbTtcblxuXHRcdFx0Ly8gY2FsY3VsYXRlIGhhbmRsZSBzaXplXG5cdFx0XHR2YXIgaGFuZGxlU2l6ZVggPSAxNjtcblx0XHRcdHZhciBoYW5kbGVTaXplWSA9IDE2O1xuXHRcdFx0aWYoaW5uZXJXaWR0aCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWCA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWCAqIChpbm5lcldpZHRoIC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHRpZihpbm5lckhlaWdodCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWSA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWSAqIChpbm5lckhlaWdodCAvIDYwKSkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcyhoYW5kbGVTaXplWCwgaGFuZGxlU2l6ZVkpO1xuXG5cdFx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHRcdC8vIHBsYWNlIHRpdGxlIGJveFxuXHRcdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudGl0bGVCb3guc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgKChvdXRlcldpZHRoIC0gdGhpcy50aXRsZUJveC5vZmZzZXRXaWR0aCkgLyAyKSkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCAtIG1hcmdpblRvcCAtIDU1KSArICdweCknO1xuXHRcdFx0dGhpcy50aXRsZVByb3BvcnRpb25zLmlubmVySFRNTCA9IG91dGVyV2lkdGggKyAnIHggJyArIG91dGVySGVpZ2h0O1xuXG5cdFx0XHQvLyBtb2RpZnkgcGFkZGluZyBib3hcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0xlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLXBhZGRpbmdUb3ApICsgJ3B4KSBzY2FsZSgnICsgcGFkZGluZ0xlZnQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdSaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCkgKyAncHgsICcgKyAoLXBhZGRpbmdUb3ApICsgJ3B4KSBzY2FsZSgnICsgcGFkZGluZ1JpZ2h0ICsgJywgJyArIG91dGVySGVpZ2h0ICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgwKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBpbm5lcldpZHRoICsgJywgJyArIHBhZGRpbmdUb3AgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdCb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0KSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ0JvdHRvbSArICcpJztcblxuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAtcGFkZGluZ0xlZnQgKyAncHgsIDBweCknO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luUmlnaHQgPSAtcGFkZGluZ1JpZ2h0ICsgJ3B4JzsgLy8gVE9ETzogZmluZCBvdXQgd2h5IGNvbnZlcnRpbmcgdGhlc2UgdG8gdHJhbnNmb3JtcyBtZXNzZXMgd2l0aCBkcmFnZ2luZ1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgLXBhZGRpbmdUb3AgKyAncHgpJztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAgLXBhZGRpbmdCb3R0b20gKyAncHgnOyAgLy8gVE9ETzogZmluZCBvdXQgd2h5IGNvbnZlcnRpbmcgdGhlc2UgdG8gdHJhbnNmb3JtcyBtZXNzZXMgd2l0aCBkcmFnZ2luZ1xuXG5cdFx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkpICsgJ3B4LCAnICsgKC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkpICsgJ3B4KSBzY2FsZSgnICsgbWFyZ2luTGVmdCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCArIHBhZGRpbmdSaWdodCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5SaWdodCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpblRvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0ICsgcGFkZGluZ0JvdHRvbSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpbkJvdHRvbSArICcpJztcblxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5tYXJnaW5SaWdodCA9IC0ocGFkZGluZ1JpZ2h0ICsgbWFyZ2luUmlnaHQpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpblRvcCA9IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUubWFyZ2luQm90dG9tID0gLShwYWRkaW5nQm90dG9tICsgbWFyZ2luQm90dG9tKSArICdweCc7XG5cblx0XHRcdC8vIG9mZnNldCBtYWdpY1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5MZWZ0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5MZWZ0KSAvIDUpICsgKGhhbmRsZVNpemVZIC8gMikpIDogLShoYW5kbGVTaXplWSAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luTGVmdCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luTGVmdCkgLyA1KSAtIDggKyBoYW5kbGVTaXplWSkgOiAtOCkgKyAncHgnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luUmlnaHQpIC8gNSkgKyAoaGFuZGxlU2l6ZVkgLyAyKSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luUmlnaHQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIG1hcmdpblJpZ2h0KSAvIDUpIC0gOCArIGhhbmRsZVNpemVZKSA6IC04KSArICdweCc7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luVG9wIDwgMjAgPyAoLSgoKGhhbmRsZVNpemVYIC8gNCkgKiBtYXJnaW5Ub3ApIC8gNSkgKyAoaGFuZGxlU2l6ZVggLyAyKSkgOiAtKGhhbmRsZVNpemVYIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Ub3AgPCAyMCA/ICgoaGFuZGxlU2l6ZVgpICsgKC0oaGFuZGxlU2l6ZVgpICogKG1hcmdpblRvcCAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKG1hcmdpbkJvdHRvbSA8IDIwID8gKC0oKChoYW5kbGVTaXplWCAvIDQpICogbWFyZ2luQm90dG9tKSAvIDUpICsgKGhhbmRsZVNpemVYIC8gMikpIDogLShoYW5kbGVTaXplWCAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemVYKSArICgtKGhhbmRsZVNpemVYKSAqIChtYXJnaW5Cb3R0b20gLyAyMCkpIC0gOCkgOiAtMTEpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gKHBhZGRpbmdSaWdodCA8IDIwID8gKCsoKChoYW5kbGVTaXplWSAvIDQpICogcGFkZGluZ1JpZ2h0KSAvIDUpIC0gKGhhbmRsZVNpemVZICogMS41KSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5zdHlsZS5tYXJnaW5Ub3AgPSAocGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemVZIC8gNCkgKiBwYWRkaW5nUmlnaHQpIC8gNSkgLSAoaGFuZGxlU2l6ZVkgKiAxLjUpKSA6IC04KSArICdweCc7XG5cblx0XHRcdHRoaXMuaGFuZGxlU2l6ZUJvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKHBhZGRpbmdCb3R0b20gPCAyMCA/ICgrKCgoaGFuZGxlU2l6ZVggLyA0KSAqIHBhZGRpbmdCb3R0b20pIC8gNSkgLSAoaGFuZGxlU2l6ZVggKiAxLjUpKSA6IC0oaGFuZGxlU2l6ZVggLyAyKSkgKyAncHgnO1xuXHRcdFx0dGhpcy5jYXB0aW9uSGVpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAocGFkZGluZ0JvdHRvbSA8IDIwID8gKChoYW5kbGVTaXplWCAqIChwYWRkaW5nQm90dG9tIC8gMjApKSAtIGhhbmRsZVNpemVYICogMiArIGhhbmRsZVNpemVYIC0gOSkgOiAtMTApICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAtKGhhbmRsZVNpemVZIC8gMikgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gLShoYW5kbGVTaXplWSAvIDIpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplWCAvIDIpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplWCAvIDIpICsgJ3B4JztcblxuXHRcdFx0Ly8gZ3VpZGVzXG5cdFx0XHQvL3RoaXMuZ3VpZGVMZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1vZmZzZXQudG9wIC1wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdFx0Ly90aGlzLmd1aWRlTGVmdC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdFx0Ly90aGlzLmd1aWRlTGVmdC5zdHlsZS5sZWZ0ID0gICcwcHgnO1xuXG5cdFx0XHQvL3RoaXMuZ3VpZGVSaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtb2Zmc2V0LnRvcCAtcGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHRcdC8vdGhpcy5ndWlkZVJpZ2h0LnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cdFx0XHQvL3RoaXMuZ3VpZGVSaWdodC5zdHlsZS5yaWdodCA9IC0xICsgJ3B4JztcblxuXHRcdFx0Ly90aGlzLmd1aWRlQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtb2Zmc2V0LmxlZnQgLXBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0XHQvL3RoaXMuZ3VpZGVCb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHQvL3RoaXMuZ3VpZGVCb3R0b20uc3R5bGUuYm90dG9tID0gLTEgKyAncHgnO1xuXG5cdFx0XHQvL3RoaXMuZ3VpZGVUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1vZmZzZXQubGVmdCAtcGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHRcdC8vdGhpcy5ndWlkZVRvcC5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHRcdC8vdGhpcy5ndWlkZVRvcC5zdHlsZS50b3AgPSAtMSArICdweCc7XG5cblx0XHRcdC8vIHBhZGRpbmcgZ3VpZGVzXG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLW9mZnNldC50b3AgLXBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5sZWZ0ID0gLXBhZGRpbmdMZWZ0ICsgJ3B4JztcblxuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtb2Zmc2V0LnRvcCAtcGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUucmlnaHQgPSAtcGFkZGluZ1JpZ2h0LTEgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLW9mZnNldC5sZWZ0IC1wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS5ib3R0b20gPSAtcGFkZGluZ0JvdHRvbS0xICsgJ3B4JztcblxuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1vZmZzZXQubGVmdCAtcGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudG9wID0gLXBhZGRpbmdUb3AtMSArICdweCc7XG5cblx0XHRcdC8vIG1hcmdpbiBndWlkZXNcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1vZmZzZXQudG9wIC1wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLmxlZnQgPSAtcGFkZGluZ0xlZnQgLW1hcmdpbkxlZnQgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLW9mZnNldC50b3AgLXBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodC5zdHlsZS5yaWdodCA9IC1wYWRkaW5nUmlnaHQgLW1hcmdpblJpZ2h0IC0gMSArICdweCc7XG5cblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1vZmZzZXQubGVmdCAtcGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tLnN0eWxlLmJvdHRvbSA9IC1wYWRkaW5nQm90dG9tIC1tYXJnaW5Cb3R0b20gLTEgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtb2Zmc2V0LmxlZnQgLXBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdFx0dGhpcy5ndWlkZU1hcmdpblRvcC5zdHlsZS50b3AgPSAtcGFkZGluZ1RvcCAtbWFyZ2luVG9wIC0xICsgJ3B4JztcblxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcygpO1xuXHRcdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHRcdFx0dGhpcy5jdXJyZW50T2Zmc2V0ID0gb2Zmc2V0O1xuXG5cdFx0XHRpZighZHVyaW5nSW50ZXJhY3Rpb24pIHtcblx0XHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0cmVmcmVzaEhhbmRsZXM6IGZ1bmN0aW9uKGhhbmRsZVNpemVYLCBoYW5kbGVTaXplWSkge1xuXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplWSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0fSxcblxuXHRcdHJlZnJlc2hDYXB0aW9uczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBvZmZzZXQgPSB7IGxlZnQ6IHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCwgdG9wOiB0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCB9O1xuXG5cdFx0XHQvLyBjYXB0aW9uc1xuXHRcdFx0dmFyIGhpdHNSaWdodEVkZ2UsIGhpdHNMZWZ0RWRnZTtcblxuXHRcdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguaW5uZXJIVE1MID0gJzxzcGFuPndpZHRoOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCd3aWR0aCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguc3R5bGUucmlnaHQgPSAoaGl0c1JpZ2h0RWRnZSA/IDE2IDogLSh0aGlzLmNhcHRpb25XaWR0aC5vZmZzZXRXaWR0aCArIDEzKSkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPmhlaWdodDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnaGVpZ2h0Jyk7XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLWxlZnQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdMZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctcmlnaHQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdSaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy10b3A6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdUb3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctYm90dG9tOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdwYWRkaW5nQm90dG9tJyk7XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1sZWZ0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5MZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLXJpZ2h0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5SaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wLmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tdG9wOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5Ub3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWJvdHRvbTogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luQm90dG9tJyk7XG5cblx0XHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIDgwIDwgMCk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3RbaGl0c0xlZnRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LnN0eWxlLm1hcmdpblJpZ2h0ID0gKGhpdHNMZWZ0RWRnZSA/IHRoaXMucGFkZGluZ0xlZnQgLSB0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5vZmZzZXRXaWR0aC0xNiA6IHRoaXMucGFkZGluZ0xlZnQgKyAxNCkgKyAncHgnO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAoaGl0c1JpZ2h0RWRnZSA/IHRoaXMucGFkZGluZ1JpZ2h0IC0gdGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0Lm9mZnNldFdpZHRoLTE2IDogdGhpcy5wYWRkaW5nUmlnaHQgKyAxNCkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tLnN0eWxlLmJvdHRvbSA9IC0odGhpcy5wYWRkaW5nQm90dG9tICArIDI0KSArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wLnN0eWxlLnRvcCA9IC0odGhpcy5wYWRkaW5nVG9wICArIDI0KSArICdweCc7XG5cblx0XHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAtIDgwIDwgMCk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdFtoaXRzTGVmdEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5SaWdodCA9IHRoaXMucGFkZGluZ0xlZnQgKyB0aGlzLm1hcmdpbkxlZnQgKyAoaGl0c0xlZnRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpbkxlZnQub2Zmc2V0V2lkdGgtMTcgOiAxNCkgKyAncHgnO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IHRoaXMucGFkZGluZ1JpZ2h0ICsgdGhpcy5tYXJnaW5SaWdodCArIChoaXRzUmlnaHRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0Lm9mZnNldFdpZHRoLTE3IDogMTQpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLmJvdHRvbSA9IC10aGlzLm1hcmdpbkJvdHRvbSAtdGhpcy5wYWRkaW5nQm90dG9tIC0yNCArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUudG9wID0gLXRoaXMubWFyZ2luVG9wIC10aGlzLnBhZGRpbmdUb3AgLTI0ICsgJ3B4JztcblxuXHRcdH0sXG5cblx0XHRnZXRDYXB0aW9uUHJvcGVydHk6IGZ1bmN0aW9uKGNzc1Byb3BlcnR5KSB7XG5cblx0XHRcdC8vIGNoZWNrIGluIGlubGluZSBzdHlsZXNcblx0XHRcdGlmKHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRFbGVtZW50LnN0eWxlW2Nzc1Byb3BlcnR5XS5yZXBsYWNlKC8oZW18cHgpLywgJ+KAiTxzcGFuPiQxPC9zcGFuPicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjaGVjayBpbiBydWxlc1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkUnVsZXNbaV0uc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHJldFZhbCA9ICcnO1xuXG5cdFx0XHRpZihjc3NQcm9wZXJ0eS5pbmRleE9mKCdtYXJnaW4nKSA+IC0xIHx8IGNzc1Byb3BlcnR5LmluZGV4T2YoJ3BhZGRpbmcnKSA+IC0xKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXNbY3NzUHJvcGVydHldO1xuXHRcdFx0fSBlbHNlIGlmKGNzc1Byb3BlcnR5ID09PSAnaGVpZ2h0Jykge1xuXHRcdFx0XHRyZXRWYWwgPSB0aGlzLmlubmVySGVpZ2h0O1xuXHRcdFx0fSBlbHNlIGlmKGNzc1Byb3BlcnR5ID09PSAnd2lkdGgnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJXaWR0aDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaW1wbGljaXQgdmFsdWVcblx0XHRcdHJldHVybiAnKCcgKyByZXRWYWwgKyAn4oCJPHNwYW4+cHg8L3NwYW4+KSc7XG5cblx0XHR9LFxuXG5cdFx0c2V0OiBmdW5jdGlvbihuZXdFbGVtKSB7XG5cblx0XHRcdHRoaXMuY3VycmVudEVsZW1lbnQgPSBuZXdFbGVtO1xuXG5cdFx0XHQvLyBpbml0aWFsIGhvdmVyXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0dGhpcy5vdmVyID0gdHJ1ZTtcblxuXHRcdFx0Ly8gZmlsbCBkcm9wZG93biB3aXRoIGNvcnJlY3QgQ1NTIHJ1bGVzXG5cdFx0XHR0aGlzLmZpbGxSdWxlcyh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdFx0Ly8gY29udGVudCBlZGl0YWJsZVxuXHRcdFx0Ly90aGlzLmN1cnJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJywgdHJ1ZSk7XG5cdFx0XHQvL3RoaXMuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICdub25lJztcblxuXHRcdFx0aWYodGhpcy5jb21wdXRlZFN0eWxlLmRpc3BsYXkgPT09ICdpbmxpbmUnKSB7XG5cdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5saW5lJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLWlubGluZScpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjb21wdXRlIHRoZSBsaXN0IG9mIHZpc2libGUgZWxlbWVudHMgdG8gc25hcCB0b1xuXHRcdFx0dGhpcy5jYWxjdWxhdGVTbmFwQXJlYXMoKTtcblxuXHRcdH0sXG5cblx0XHR1bnNldDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmKHRoaXMuc2VsZWN0ZWRSdWxlKSB7XG5cdFx0XHRcdHRoaXMuZXhpdFJ1bGVNb2RlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInLCAnaG92ZXItaW5uZXInLCAnaG92ZXItcGFkZGluZycsICdob3Zlci1tYXJnaW4nLCAnaW4tY29tbWFuZCcpO1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdFx0Ly90aGlzLmN1cnJlbnRFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJyk7XG5cdFx0XHQvL3RoaXMuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICcnO1xuXG5cdFx0XHR0aGlzLm92ZXIgPSBmYWxzZTtcblx0XHRcdHRoaXMub3ZlcklubmVyID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJQYWRkaW5nID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJNYXJnaW4gPSBmYWxzZTtcblx0XHRcdHRoaXMub3ZlckNvbW1hbmQgPSBmYWxzZTtcblx0XHRcdHRoaXMuY3VycmVudEVsZW1lbnQgPSBudWxsO1xuXG5cdFx0XHR0aGlzLmNsZWFyQWN0aXZlSGFuZGxlKCk7XG5cblx0XHRcdCQoZG9jdW1lbnQpLm9mZigna2V5dXAnLCB0aGlzLl9fa2V5dXApO1xuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdrZXlkb3duJywgdGhpcy5fX2tleWRvd24pO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogRnVuY3Rpb25zIHJlbGF0ZWQgdG8gcnVsZS1iYXNlZCBlZGl0aW5nXG5cdFx0ICovXG5cblx0XHRlbnRlclJ1bGVNb2RlOiBmdW5jdGlvbihjc3NSdWxlKSB7XG5cblx0XHRcdHZhciBnaG9zdHMgPSB0aGlzLmdob3N0cztcblxuXHRcdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBjc3NSdWxlO1xuXHRcdFx0dGhpcy50aXRsZUJveC5jbGFzc0xpc3QuYWRkKCdydWxlJyk7XG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnN0eWxlLnpJbmRleCA9IDEwMDAyO1xuXG5cdFx0XHQkKHRoaXMuc2VsZWN0ZWRSdWxlLnNlbGVjdG9yVGV4dCkubm90KHRoaXMuY3VycmVudEVsZW1lbnQpLm5vdCgnLm92ZXJsYXksIC5vdmVybGF5IConKS5lYWNoKGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBnaG9zdCA9IG5ldyBHaG9zdCh0aGlzKTtcblx0XHRcdFx0Z2hvc3Quc3luYygpO1xuXHRcdFx0XHRnaG9zdHMucHVzaChnaG9zdCk7XG5cblx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdGV4aXRSdWxlTW9kZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdCQoJ3NwYW4uc2VsZWN0ZWQnLCB0aGlzLnRpdGxlQm94KS5odG1sKCdpbmxpbmUgc3R5bGUnKTtcblx0XHRcdHRoaXMudGl0bGVCb3guY2xhc3NMaXN0LnJlbW92ZSgncnVsZScpO1xuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5zdHlsZS56SW5kZXggPSAnJztcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdob3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0aGlzLmdob3N0c1tpXS5kZXN0cm95KCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDtcblx0XHRcdHRoaXMuZ2hvc3RzID0gW107XG5cblx0XHR9LFxuXG5cdFx0ZmlsbFJ1bGVzOiBmdW5jdGlvbih0cmFja2VkRWxlbWVudCkge1xuXG5cdFx0XHR2YXIgcmVzb2x2ZWQgPSBTdHlsZVBhcnNlci5yZXNvbHZlKHRyYWNrZWRFbGVtZW50KTtcblx0XHRcdHRoaXMubWF0Y2hlZFJ1bGVzID0gcmVzb2x2ZWQ7XG5cblx0XHRcdHRoaXMudGl0bGVEcm9wZG93bi5lbXB0eSgpO1xuXHRcdFx0JCgnPGxpPmlubGluZSBzdHlsZTwvbGk+JykuYXBwZW5kVG8odGhpcy50aXRsZURyb3Bkb3duKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzb2x2ZWQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0JCgnPGxpPicgKyByZXNvbHZlZFtpXS5zZWxlY3RvclRleHQgKyAnPC9saT4nKVxuXHRcdFx0XHRcdC5kYXRhKCdjc3NSdWxlJywgcmVzb2x2ZWRbaV0pXG5cdFx0XHRcdFx0LmFwcGVuZFRvKHRoaXMudGl0bGVEcm9wZG93bik7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0c2VsZWN0UnVsZTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHR0aGlzLnRpdGxlRHJvcGRvd24uZmluZCgnbGk6ZXEoJyArIChpKzEpICsgJyknKS5jbGljaygpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnRpdGxlRHJvcGRvd24uZmluZCgnbGk6ZXEoMSknKS5jbGljaygpO1xuXG5cdFx0fSxcblxuXHRcdGRlc2VsZWN0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIEZ1bmN0aW9ucyByZWxhdGVkIHRvIGdob3N0c1xuXHRcdCAqL1xuXG5cdFx0dXBkYXRlR2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRcdGlmKCF0aGlzLmdob3N0cykgcmV0dXJuO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmdob3N0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0aGlzLmdob3N0c1tpXS5zeW5jKCk7XG5cdFx0XHR9XHRcdFxuXHRcdH0sXG5cblx0XHRjcmVhdGVWaXN1YWxpemF0aW9uTGluZXM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZighdGhpcy52TGluZVgpIHtcblx0XHRcdFx0dGhpcy52TGluZVggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0dGhpcy52TGluZVguY2xhc3NOYW1lID0gJ3ZsaW5lLXgnO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudkxpbmVYKTtcblxuXHRcdFx0XHR0aGlzLnZMaW5lWENhcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmNsYXNzTmFtZSA9ICdjYXB0aW9uJztcblx0XHRcdFx0dGhpcy52TGluZVguYXBwZW5kQ2hpbGQodGhpcy52TGluZVhDYXB0aW9uKTtcblxuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuY2xhc3NOYW1lID0gJ2Nyb3NzYmFyJztcblx0XHRcdFx0dGhpcy52TGluZVguYXBwZW5kQ2hpbGQodGhpcy52TGluZVhDcm9zc0Jhcik7XG5cdFx0XHR9XG5cblx0XHRcdGlmKCF0aGlzLnZMaW5lWSkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5jbGFzc05hbWUgPSAndmxpbmUteSc7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVkpO1xuXG5cdFx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uY2xhc3NOYW1lID0gJ2NhcHRpb24nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWUNhcHRpb24pO1xuXG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5jbGFzc05hbWUgPSAnY3Jvc3NiYXInO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWUNyb3NzQmFyKTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHR2aXN1YWxpemVSZWxhdGlvblRvV2luZG93OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIGN1cnJlbnRFbGVtZW50ID0gdGhpcy5jdXJyZW50RWxlbWVudDtcblxuXHRcdFx0dGhpcy5jcmVhdGVWaXN1YWxpemF0aW9uTGluZXMoKTtcblxuXHRcdFx0dGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpKSArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gMCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS53aWR0aCA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldExlZnQgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldExlZnQgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldExlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSkgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gMCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5oZWlnaHQgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRUb3AgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVlDYXB0aW9uLmlubmVySFRNTCA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0fSxcblxuXHRcdHZpc3VhbGl6ZVJlbGF0aW9uVG86IGZ1bmN0aW9uKHJlbGF0ZWRFbGVtZW50KSB7XG5cblx0XHRcdHZhciBjdXJyZW50RWxlbWVudCA9IHRoaXMuY3VycmVudEVsZW1lbnQsIHRvcCwgbGVmdDtcblxuXHRcdFx0dGhpcy5jcmVhdGVWaXN1YWxpemF0aW9uTGluZXMoKTtcblxuXHRcdFx0dmFyIHJlUmlnaHRFZGdlID0gcmVsYXRlZEVsZW1lbnQub2Zmc2V0TGVmdCArIHJlbGF0ZWRFbGVtZW50Lm9mZnNldFdpZHRoO1xuXHRcdFx0dmFyIGNlUmlnaHRFZGdlID0gY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCArIGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoO1xuXHRcdFx0dmFyIHJlTGVmdEVkZ2UgPSByZWxhdGVkRWxlbWVudC5vZmZzZXRMZWZ0O1xuXHRcdFx0dmFyIGNlTGVmdEVkZ2UgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0O1xuXG5cdFx0XHR2YXIgcmVCb3R0b21FZGdlID0gcmVsYXRlZEVsZW1lbnQub2Zmc2V0VG9wICsgcmVsYXRlZEVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0dmFyIGNlQm90dG9tRWRnZSA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCArIGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodDtcblx0XHRcdHZhciByZVRvcEVkZ2UgPSByZWxhdGVkRWxlbWVudC5vZmZzZXRUb3A7XG5cdFx0XHR2YXIgY2VUb3BFZGdlID0gY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wO1xuXHRcdFx0XG5cdFx0XHQvLyBob3Jpem9udGFsIGNvbm5lY3Rpb25cblx0XHRcdGlmKHJlUmlnaHRFZGdlIDwgY2VMZWZ0RWRnZSkge1xuXG5cdFx0XHRcdHRvcCA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKTtcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLmxlZnQgPSByZVJpZ2h0RWRnZSArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRcdGlmKHJlQm90dG9tRWRnZSA8IHRvcCkge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdFx0fSBlbHNlIGlmKHRvcCA8IHJlVG9wRWRnZSkge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChyZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIGlmKGNlUmlnaHRFZGdlIDwgcmVMZWZ0RWRnZSkge1xuXG5cdFx0XHRcdHRvcCA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKTtcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLmxlZnQgPSBjZVJpZ2h0RWRnZSArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gcmVMZWZ0RWRnZSAtIGNlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRcdGlmKHJlQm90dG9tRWRnZSA8IHRvcCkge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzEwMCUnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAoY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHRcdH0gZWxzZSBpZih0b3AgPCByZVRvcEVkZ2UpIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcxMDAlJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdmVydGljYWwgY29ubmVjdGlvblxuXHRcdFx0aWYocmVCb3R0b21FZGdlIDwgY2VUb3BFZGdlKSB7XG5cblx0XHRcdFx0bGVmdCA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldExlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKTtcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmxlZnQgPSBsZWZ0ICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gcmVCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDYXB0aW9uLmlubmVySFRNTCA9IGNlVG9wRWRnZSAtIHJlQm90dG9tRWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRcdGlmKHJlUmlnaHRFZGdlIDwgbGVmdCkge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdFx0fSBlbHNlIGlmKGxlZnQgPCByZUxlZnRFZGdlKSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2UgaWYoY2VCb3R0b21FZGdlIDwgcmVUb3BFZGdlKSB7XG5cblx0XHRcdFx0bGVmdCA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldExlZnQgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKTtcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmxlZnQgPSBsZWZ0ICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gY2VCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gcmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDYXB0aW9uLmlubmVySFRNTCA9IHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRcdGlmKHJlUmlnaHRFZGdlIDwgbGVmdCkge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS50b3AgPSAnMTAwJSc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAoY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHRcdH0gZWxzZSBpZihsZWZ0IDwgcmVMZWZ0RWRnZSkge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS50b3AgPSAnMTAwJSc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAocmVMZWZ0RWRnZSAtIGNlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0pO1xuXG5cdC8vIENyZWF0ZSBPdmVybGF5IChzaW5nbGV0b24pXG5cdE92ZXJsYXkgPSBuZXcgT3ZlcmxheSgpO1xuXG5cdC8vIG1ha2UgYWxsIGVsZW1lbnRzIG9uIHBhZ2UgaW5zcGVjdGFibGVcblx0JCgnYm9keSAqOm5vdCgub3ZlcmxheSwub3ZlcmxheSAqLC5vdmVybGF5LXRpdGxlLC5vdmVybGF5LXRpdGxlICopJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuXG5cdFx0T3ZlcmxheS5ob3ZlckVsZW1lbnQgPSB0aGlzO1xuXG5cdFx0Ly8gaWYgd2UncmUgaG9sZGluZyBzaGlmdCBhbmQgaG92ZXIgYW5vdGhlciBlbGVtZW50LCBzaG93IGd1aWRlc1xuXHRcdGlmKE92ZXJsYXkuY29tbWFuZFByZXNzZWQgJiZcblx0XHRcdE92ZXJsYXkuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdHRoaXMgIT09IE92ZXJsYXkuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdCEkLmNvbnRhaW5zKHRoaXMsIE92ZXJsYXkuY3VycmVudEVsZW1lbnQpICYmXG5cdFx0XHQhJC5jb250YWlucyhPdmVybGF5LmN1cnJlbnRFbGVtZW50LCB0aGlzKVxuXHRcdCkge1xuXHRcdFx0T3ZlcmxheS52aXN1YWxpemVSZWxhdGlvblRvKHRoaXMpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGluIG5vcm1hbCBtb2RlLCBkb24ndCBhY3RpdmF0ZSB0aGUgaG92ZXIgZ2hvc3Qgd2hlbiBpbnRlcmFjdGluZyBvciBvdmVyIHRoZSBjdXJyZW50IGVsXG5cdFx0aWYoT3ZlcmxheS5ob3Zlckdob3N0LmN1cnJlbnRFbGVtZW50ID09PSB0aGlzIHx8IE92ZXJsYXkuaW50ZXJhY3RpbmcgfHwgT3ZlcmxheS5vdmVyKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0T3ZlcmxheS5ob3Zlckdob3N0LnN5bmModGhpcyk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0fSk7XG5cblx0Ly8gbWFrZSBhbGwgZWxlbWVudHMgb24gcGFnZSBpbnNwZWN0YWJsZVxuXHQkKCdib2R5ICo6bm90KC5vdmVybGF5LC5vdmVybGF5ICosLm92ZXJsYXktdGl0bGUsLm92ZXJsYXktdGl0bGUgKiknKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblxuXHRcdGlmKE92ZXJsYXkuY3VycmVudEVsZW1lbnQgPT09IHRoaXMpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRpZihPdmVybGF5LmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRPdmVybGF5LnVuc2V0KCk7XG5cdFx0fVxuXG5cdFx0Ly9oaWRlIGhvdmVyIGdob3N0XG5cdFx0T3ZlcmxheS5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cblx0XHQvLyBzeW5jIG9uIHRoZSBlbGVtZW50XG5cdFx0T3ZlcmxheS5zeW5jKHRoaXMpO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH0pO1xuXG5cdC8vJCgndWwnKS5zb3J0YWJsZSgpO1xuXHQkKCcjdGVzdGJveCcpLmNsaWNrKCk7XG5cblxufSkoKTtcblxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=