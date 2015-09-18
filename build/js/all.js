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

			this.guideLeft = $('<div class="guide guide-left"></div>').appendTo(this.overlayElement)[0];
			this.guideRight = $('<div class="guide guide-right"></div>').appendTo(this.overlayElement)[0];
			this.guideBottom = $('<div class="guide guide-bottom"></div>').appendTo(this.overlayElement)[0];
			this.guideTop = $('<div class="guide guide-top"></div>').appendTo(this.overlayElement)[0];

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

		initRuleShortcut: function() {

			var titleDropdown = this.titleDropdown;
			var that = this;

			$(document).on('keydown', function(e) {
				if(e.which !== 16) return;
				that.__prevSelectedRule = that.selectedRule;
				that.shiftPressed = true;
				titleDropdown.find('li:eq(0)').click();
			});

			$(document).on('keyup', function(e) {
				if(e.which !== 16) return;
				that.shiftPressed = false;

				// re-process as if we've just hovered
				if(that.currentHandle) {
					$(that.currentHandle).trigger('mouseenter');
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

		calculateSnap: function(currentValue/*, axis*/) {
			return currentValue;
		},

		initHandles: function() {

			var that = this;
			var handleOffset = 3;

			// resize handles

			(function() {

				var start = function() { that.interacting = 'size'; this.__x = $(this).draggable('option', 'axis') === 'x'; };
				var drag = function(event, ui) {
					var x = this.__x;

					// calculate normal handle position
					ui.position[x ? 'left' : 'top'] = Math.max(0 - handleOffset, ui.position[x ? 'left' : 'top']);

					// apply possible snap
					ui.position[x ? 'left' : 'top'] = that.calculateSnap(ui.position[x ? 'left' : 'top'], x ? 'x' : 'y');

					(that.selectedRule || that.currentElement).style[x ? 'width' : 'height'] = (ui.position[x ? 'left' : 'top'] + handleOffset) + 'px';
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
						(that.selectedRule || that.currentElement).style.paddingTop = Math.max(0, this.curPaddingTop - (ui.offset.top - this.curOffset)) + 'px';
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
						(that.selectedRule || that.currentElement).style.marginLeft = Math.max(0, this.curMarginLeft - (ui.offset.left - this.curOffset)) + 'px';
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

			var computedStyle = this.computedStyle = getComputedStyle(newElem || this.currentElement);

			if(newElem) {
				this.set(newElem);
			}

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

			// place title box
			this.titleBox.style.opacity = 1;
			this.titleBox.style.transform = 'translate(' + (offset.left + ((outerWidth - this.titleBox.offsetWidth) / 2)) + 'px, ' + (offset.top - marginTop - 30) + 'px)';
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
			this.captionMarginTop.style.marginLeft = (marginTop < 20 ? ((handleSizeX * 2) + (-(handleSizeX) * (marginTop / 20)) + 11) : handleSizeX + 11) + 'px';
			this.handleMarginBottom[0].style.marginLeft = (marginBottom < 20 ? (-(((handleSizeX / 4) * marginBottom) / 5) + (handleSizeX / 2)) : -(handleSizeX / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
			this.captionMarginBottom.style.marginLeft = (marginBottom < 20 ? ((handleSizeX * 2) + (-(handleSizeX) * (marginBottom / 20)) + 11) : handleSizeX + 11) + 'px';

			this.handleSizeRight[0].style.marginTop = (paddingRight < 20 ? (+(((handleSizeY / 4) * paddingRight) / 5) - (handleSizeY * 1.5)) : -(handleSizeY / 2)) + 'px'; // (-8 * (marginLeft / 20)) + (8 - 8 * (marginLeft / 20))
			this.captionWidth.style.marginTop = (paddingRight < 20 ? (-8 -(handleSizeY * 1) + (handleSizeY * 2 * (paddingRight / 20))) : -8) + 'px';
			this.handleSizeBottom[0].style.marginLeft = (paddingBottom < 20 ? (+(((handleSizeX / 4) * paddingBottom) / 5) - (handleSizeX * 1.5)) : -(handleSizeX / 2)) + 'px';
			this.captionHeight.style.marginLeft = (paddingBottom < 20 ? ((handleSizeX * 2 * (paddingBottom / 20))) : 16) + 'px';

			this.handlePaddingLeft[0].style.marginTop = -(handleSizeY / 2) + 'px';
			this.handlePaddingRight[0].style.marginTop = -(handleSizeY / 2) + 'px';
			this.handlePaddingTop[0].style.marginLeft = -(handleSizeX / 2) + 'px';
			this.handlePaddingBottom[0].style.marginLeft = -(handleSizeX / 2) + 'px';

			// guides
			this.guideLeft.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			this.guideLeft.style.height = window.innerHeight + 'px';
			this.guideLeft.style.left =  '0px';

			this.guideRight.style.transform = 'translate(0px, ' + (-offset.top -paddingTop) + 'px)';
			this.guideRight.style.height = window.innerHeight + 'px';
			this.guideRight.style.right = -1 + 'px';

			this.guideBottom.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			this.guideBottom.style.width = window.innerWidth + 'px';
			this.guideBottom.style.bottom = -1 + 'px';

			this.guideTop.style.transform = 'translate(' + (-offset.left -paddingLeft) + 'px, 0px)';
			this.guideTop.style.width = window.innerWidth + 'px';
			this.guideTop.style.top = -1 + 'px';

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

			this.captionPaddingBottom.style.bottom = -(this.paddingBottom  + 7) + 'px';
			this.captionPaddingTop.style.top = -(this.paddingTop  + 7) + 'px';

			hitsLeftEdge = (offset.left - this.marginLeft - 80 < 0);
			this.captionMarginLeft.classList[hitsLeftEdge ? 'add' : 'remove']('edge');
			this.captionMarginLeft.style.marginRight = this.paddingLeft + this.marginLeft + (hitsLeftEdge ? -this.captionMarginLeft.offsetWidth-17 : 14) + 'px';

			hitsRightEdge = (offset.left + this.outerWidth + this.marginRight + 80 > window.innerWidth);
			this.captionMarginRight.classList[hitsRightEdge ? 'add' : 'remove']('edge');
			this.captionMarginRight.style.marginLeft = this.paddingRight + this.marginRight + (hitsRightEdge ? -this.captionMarginRight.offsetWidth-17 : 14) + 'px';

			this.captionMarginBottom.style.bottom = -this.marginBottom -this.paddingBottom -7 + 'px';
			this.captionMarginTop.style.top = -this.marginTop -this.paddingTop -7 + 'px';

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
			this.currentElement.setAttribute('contentEditable', true);
			this.currentElement.style.outline = 'none';

			if(this.computedStyle.display === 'inline') {
				this.overlayElement.classList.add('hover-inline');
			} else {
				this.overlayElement.classList.remove('hover-inline');
			}

		},

		unset: function() {

			if(this.selectedRule) {
				this.exitRuleMode();
			}

			this.overlayElement.classList.remove('hover', 'hover-inner', 'hover-padding', 'hover-margin', 'in-command');

			this.overlayElement.style.display = 'none';
			this.titleBox.style.opacity = 0;
			this.currentElement.removeAttribute('contentEditable');
			this.currentElement.style.outline = '';

			this.over = false;
			this.overInner = false;
			this.overPadding = false;
			this.overMargin = false;
			this.overCommand = false;
			this.currentElement = null;

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

	// Initialize overlay
	Overlay.init();


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
	$('li strong').click();


})();



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiU3R5bGVQYXJzZXIuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgR2hvc3QgPSBmdW5jdGlvbihlbGVtKSB7XG5cblx0dGhpcy5vdmVybGF5RWxlbWVudCA9IHRoaXMuY3JlYXRlKCk7XG5cdHRoaXMuY3VycmVudEVsZW1lbnQgPSBlbGVtO1xuXG59O1xuXG4kLmV4dGVuZChHaG9zdC5wcm90b3R5cGUsIHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGdob3N0ID0gJCgnPGRpdiBjbGFzcz1cIm92ZXJsYXkgZ2hvc3RcIj48L2Rpdj4nKTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblxuXHRcdGdob3N0LmFwcGVuZFRvKCdib2R5Jyk7XG5cdFx0cmV0dXJuIGdob3N0WzBdO1xuXG5cdH0sXG5cblx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vdmVybGF5RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHR9LFxuXG5cdHN5bmM6IGZ1bmN0aW9uKG5ld0VsZW0pIHtcblxuXHRcdGlmKG5ld0VsZW0pIHtcblx0XHRcdHRoaXMuY3VycmVudEVsZW1lbnQgPSBuZXdFbGVtO1xuXHRcdH1cblxuXHRcdHZhciBvdmVybGF5RWxlbWVudCA9IHRoaXMub3ZlcmxheUVsZW1lbnQ7XG5cdFx0dmFyIGVsZW0gPSAkKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXHRcdHZhciBvZmZzZXQgPSBlbGVtLm9mZnNldCgpO1xuXG5cdFx0dmFyIGNvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0dmFyIGlubmVyV2lkdGggPSBwYXJzZUludChjb21wdXRlZFN0eWxlLndpZHRoKTtcblx0XHR2YXIgaW5uZXJIZWlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLmhlaWdodCk7XG5cblx0XHR2YXIgcGFkZGluZ0xlZnQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdMZWZ0KTtcblx0XHR2YXIgcGFkZGluZ1RvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ1RvcCk7XG5cdFx0dmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ1JpZ2h0KTtcblx0XHR2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0JvdHRvbSk7XG5cblx0XHR2YXIgbWFyZ2luTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luTGVmdCk7XG5cdFx0dmFyIG1hcmdpblRvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luVG9wKTtcblx0XHR2YXIgbWFyZ2luUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblJpZ2h0KTtcblx0XHR2YXIgbWFyZ2luQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Cb3R0b20pO1xuXG5cdFx0dmFyIG91dGVyV2lkdGggPSBpbm5lcldpZHRoICsgcGFkZGluZ0xlZnQgKyBwYWRkaW5nUmlnaHQ7XG5cdFx0dmFyIG91dGVySGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbTtcblxuXHRcdC8vIHBsYWNlIGFuZCByZXNpemUgb3ZlcmxheVxuXHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChvZmZzZXQubGVmdCArIHBhZGRpbmdMZWZ0KSArICdweCwgJyArIChvZmZzZXQudG9wICsgcGFkZGluZ1RvcCkgKyAncHgpJztcblxuXHRcdC8vIG1vZGlmeSBwYWRkaW5nIGJveFxuXG5cdFx0Ly8gbGVmdFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5sZWZ0Jywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogcGFkZGluZ0xlZnQsXG5cdFx0XHRoZWlnaHQ6IG91dGVySGVpZ2h0LFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcCxcblx0XHRcdGxlZnQ6IC1wYWRkaW5nTGVmdFxuXHRcdH0pO1xuXG5cdFx0Ly8gcmlnaHRcblx0XHQkKCcuY29udGFpbmVyLXBhZGRpbmcucmlnaHQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBwYWRkaW5nUmlnaHQsXG5cdFx0XHRoZWlnaHQ6IG91dGVySGVpZ2h0LFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcCxcblx0XHRcdHJpZ2h0OiAtcGFkZGluZ1JpZ2h0XG5cdFx0fSk7XG5cblx0XHQvLyB0b3Bcblx0XHQkKCcuY29udGFpbmVyLXBhZGRpbmcudG9wJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogaW5uZXJXaWR0aCxcblx0XHRcdGhlaWdodDogcGFkZGluZ1RvcCxcblx0XHRcdHRvcDogLXBhZGRpbmdUb3Bcblx0XHR9KTtcblxuXHRcdC8vIGJvdHRvbVxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5ib3R0b20nLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBwYWRkaW5nQm90dG9tLFxuXHRcdFx0Ym90dG9tOiAtcGFkZGluZ0JvdHRvbVxuXHRcdH0pO1xuXG5cdFx0Ly8gbW9kaWZ5IG1hcmdpbiBib3hcblxuXHRcdC8vIGxlZnRcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5sZWZ0Jywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogbWFyZ2luTGVmdCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20sXG5cdFx0XHR0b3A6IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCksXG5cdFx0XHRsZWZ0OiAtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdClcblx0XHR9KTtcblxuXHRcdC8vIHJpZ2h0XG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4ucmlnaHQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBtYXJnaW5SaWdodCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20sXG5cdFx0XHR0b3A6IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCksXG5cdFx0XHRyaWdodDogLShwYWRkaW5nUmlnaHQgKyBtYXJnaW5SaWdodClcblx0XHR9KTtcblxuXHRcdC8vIHRvcFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLnRvcCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG91dGVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IG1hcmdpblRvcCxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdGxlZnQ6IC1wYWRkaW5nTGVmdFxuXHRcdH0pO1xuXG5cdFx0Ly8gYm90dG9tXG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4uYm90dG9tJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdGhlaWdodDogbWFyZ2luQm90dG9tLFxuXHRcdFx0Ym90dG9tOiAtKHBhZGRpbmdCb3R0b20gKyBtYXJnaW5Cb3R0b20pLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0fVxuXG59KTsiLCIvKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNwZWNpZmljaXR5IG9mIENTUyBzZWxlY3RvcnNcbiAqIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtc2VsZWN0b3JzLyNzcGVjaWZpY2l0eVxuICpcbiAqIFJldHVybnMgYW4gYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqICAtIHNlbGVjdG9yOiB0aGUgaW5wdXRcbiAqICAtIHNwZWNpZmljaXR5OiBlLmcuIDAsMSwwLDBcbiAqICAtIHBhcnRzOiBhcnJheSB3aXRoIGRldGFpbHMgYWJvdXQgZWFjaCBwYXJ0IG9mIHRoZSBzZWxlY3RvciB0aGF0IGNvdW50cyB0b3dhcmRzIHRoZSBzcGVjaWZpY2l0eVxuICovXG52YXIgU1BFQ0lGSUNJVFkgPSAoZnVuY3Rpb24oKSB7XG5cdHZhciBjYWxjdWxhdGUsXG5cdFx0Y2FsY3VsYXRlU2luZ2xlO1xuXG5cdGNhbGN1bGF0ZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0dmFyIHNlbGVjdG9ycyxcblx0XHRcdHNlbGVjdG9yLFxuXHRcdFx0aSxcblx0XHRcdGxlbixcblx0XHRcdHJlc3VsdHMgPSBbXTtcblxuXHRcdC8vIFNlcGFyYXRlIGlucHV0IGJ5IGNvbW1hc1xuXHRcdHNlbGVjdG9ycyA9IGlucHV0LnNwbGl0KCcsJyk7XG5cblx0XHRmb3IgKGkgPSAwLCBsZW4gPSBzZWxlY3RvcnMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3JzW2ldO1xuXHRcdFx0aWYgKHNlbGVjdG9yLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0cmVzdWx0cy5wdXNoKGNhbGN1bGF0ZVNpbmdsZShzZWxlY3RvcikpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHRzO1xuXHR9O1xuXG5cdC8vIENhbGN1bGF0ZSB0aGUgc3BlY2lmaWNpdHkgZm9yIGEgc2VsZWN0b3IgYnkgZGl2aWRpbmcgaXQgaW50byBzaW1wbGUgc2VsZWN0b3JzIGFuZCBjb3VudGluZyB0aGVtXG5cdGNhbGN1bGF0ZVNpbmdsZSA9IGZ1bmN0aW9uKGlucHV0KSB7XG5cdFx0dmFyIHNlbGVjdG9yID0gaW5wdXQsXG5cdFx0XHRmaW5kTWF0Y2gsXG5cdFx0XHR0eXBlQ291bnQgPSB7XG5cdFx0XHRcdCdhJzogMCxcblx0XHRcdFx0J2InOiAwLFxuXHRcdFx0XHQnYyc6IDBcblx0XHRcdH0sXG5cdFx0XHRwYXJ0cyA9IFtdLFxuXHRcdFx0Ly8gVGhlIGZvbGxvd2luZyByZWd1bGFyIGV4cHJlc3Npb25zIGFzc3VtZSB0aGF0IHNlbGVjdG9ycyBtYXRjaGluZyB0aGUgcHJlY2VkaW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMgaGF2ZSBiZWVuIHJlbW92ZWRcblx0XHRcdGF0dHJpYnV0ZVJlZ2V4ID0gLyhcXFtbXlxcXV0rXFxdKS9nLFxuXHRcdFx0aWRSZWdleCA9IC8oI1teXFxzXFwrPn5cXC5cXFs6XSspL2csXG5cdFx0XHRjbGFzc1JlZ2V4ID0gLyhcXC5bXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0cHNldWRvRWxlbWVudFJlZ2V4ID0gLyg6OlteXFxzXFwrPn5cXC5cXFs6XSt8OmZpcnN0LWxpbmV8OmZpcnN0LWxldHRlcnw6YmVmb3JlfDphZnRlcikvZ2ksXG5cdFx0XHQvLyBBIHJlZ2V4IGZvciBwc2V1ZG8gY2xhc3NlcyB3aXRoIGJyYWNrZXRzIC0gOm50aC1jaGlsZCgpLCA6bnRoLWxhc3QtY2hpbGQoKSwgOm50aC1vZi10eXBlKCksIDpudGgtbGFzdC10eXBlKCksIDpsYW5nKClcblx0XHRcdHBzZXVkb0NsYXNzV2l0aEJyYWNrZXRzUmVnZXggPSAvKDpbXFx3LV0rXFwoW15cXCldKlxcKSkvZ2ksXG5cdFx0XHQvLyBBIHJlZ2V4IGZvciBvdGhlciBwc2V1ZG8gY2xhc3Nlcywgd2hpY2ggZG9uJ3QgaGF2ZSBicmFja2V0c1xuXHRcdFx0cHNldWRvQ2xhc3NSZWdleCA9IC8oOlteXFxzXFwrPn5cXC5cXFs6XSspL2csXG5cdFx0XHRlbGVtZW50UmVnZXggPSAvKFteXFxzXFwrPn5cXC5cXFs6XSspL2c7XG5cblx0XHQvLyBGaW5kIG1hdGNoZXMgZm9yIGEgcmVndWxhciBleHByZXNzaW9uIGluIGEgc3RyaW5nIGFuZCBwdXNoIHRoZWlyIGRldGFpbHMgdG8gcGFydHNcblx0XHQvLyBUeXBlIGlzIFwiYVwiIGZvciBJRHMsIFwiYlwiIGZvciBjbGFzc2VzLCBhdHRyaWJ1dGVzIGFuZCBwc2V1ZG8tY2xhc3NlcyBhbmQgXCJjXCIgZm9yIGVsZW1lbnRzIGFuZCBwc2V1ZG8tZWxlbWVudHNcblx0XHRmaW5kTWF0Y2ggPSBmdW5jdGlvbihyZWdleCwgdHlwZSkge1xuXHRcdFx0dmFyIG1hdGNoZXMsIGksIGxlbiwgbWF0Y2gsIGluZGV4LCBsZW5ndGg7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0bWF0Y2hlcyA9IHNlbGVjdG9yLm1hdGNoKHJlZ2V4KTtcblx0XHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbWF0Y2hlcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0XHRcdHR5cGVDb3VudFt0eXBlXSArPSAxO1xuXHRcdFx0XHRcdG1hdGNoID0gbWF0Y2hlc1tpXTtcblx0XHRcdFx0XHRpbmRleCA9IHNlbGVjdG9yLmluZGV4T2YobWF0Y2gpO1xuXHRcdFx0XHRcdGxlbmd0aCA9IG1hdGNoLmxlbmd0aDtcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKHtcblx0XHRcdFx0XHRcdHNlbGVjdG9yOiBtYXRjaCxcblx0XHRcdFx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHRcdFx0XHRpbmRleDogaW5kZXgsXG5cdFx0XHRcdFx0XHRsZW5ndGg6IGxlbmd0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8vIFJlcGxhY2UgdGhpcyBzaW1wbGUgc2VsZWN0b3Igd2l0aCB3aGl0ZXNwYWNlIHNvIGl0IHdvbid0IGJlIGNvdW50ZWQgaW4gZnVydGhlciBzaW1wbGUgc2VsZWN0b3JzXG5cdFx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG1hdGNoLCBBcnJheShsZW5ndGggKyAxKS5qb2luKCcgJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIFJlbW92ZSB0aGUgbmVnYXRpb24gcHN1ZWRvLWNsYXNzICg6bm90KSBidXQgbGVhdmUgaXRzIGFyZ3VtZW50IGJlY2F1c2Ugc3BlY2lmaWNpdHkgaXMgY2FsY3VsYXRlZCBvbiBpdHMgYXJndW1lbnRcblx0XHQoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmVnZXggPSAvOm5vdFxcKChbXlxcKV0qKVxcKS9nO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShyZWdleCwgJyAgICAgJDEgJyk7XG5cdFx0XHR9XG5cdFx0fSgpKTtcblxuXHRcdC8vIFJlbW92ZSBhbnl0aGluZyBhZnRlciBhIGxlZnQgYnJhY2UgaW4gY2FzZSBhIHVzZXIgaGFzIHBhc3RlZCBpbiBhIHJ1bGUsIG5vdCBqdXN0IGEgc2VsZWN0b3Jcblx0XHQoZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcmVnZXggPSAve1teXSovZ20sXG5cdFx0XHRcdG1hdGNoZXMsIGksIGxlbiwgbWF0Y2g7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0bWF0Y2hlcyA9IHNlbGVjdG9yLm1hdGNoKHJlZ2V4KTtcblx0XHRcdFx0Zm9yIChpID0gMCwgbGVuID0gbWF0Y2hlcy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0XHRcdG1hdGNoID0gbWF0Y2hlc1tpXTtcblx0XHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UobWF0Y2gsIEFycmF5KG1hdGNoLmxlbmd0aCArIDEpLmpvaW4oJyAnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KCkpO1xuXG5cdFx0Ly8gQWRkIGF0dHJpYnV0ZSBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChhdHRyaWJ1dGVSZWdleCwgJ2InKTtcblxuXHRcdC8vIEFkZCBJRCBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBhKVxuXHRcdGZpbmRNYXRjaChpZFJlZ2V4LCAnYScpO1xuXG5cdFx0Ly8gQWRkIGNsYXNzIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGIpXG5cdFx0ZmluZE1hdGNoKGNsYXNzUmVnZXgsICdiJyk7XG5cblx0XHQvLyBBZGQgcHNldWRvLWVsZW1lbnQgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYylcblx0XHRmaW5kTWF0Y2gocHNldWRvRWxlbWVudFJlZ2V4LCAnYycpO1xuXG5cdFx0Ly8gQWRkIHBzZXVkby1jbGFzcyBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChwc2V1ZG9DbGFzc1dpdGhCcmFja2V0c1JlZ2V4LCAnYicpO1xuXHRcdGZpbmRNYXRjaChwc2V1ZG9DbGFzc1JlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gUmVtb3ZlIHVuaXZlcnNhbCBzZWxlY3RvciBhbmQgc2VwYXJhdG9yIGNoYXJhY3RlcnNcblx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoL1tcXCpcXHNcXCs+fl0vZywgJyAnKTtcblxuXHRcdC8vIFJlbW92ZSBhbnkgc3RyYXkgZG90cyBvciBoYXNoZXMgd2hpY2ggYXJlbid0IGF0dGFjaGVkIHRvIHdvcmRzXG5cdFx0Ly8gVGhlc2UgbWF5IGJlIHByZXNlbnQgaWYgdGhlIHVzZXIgaXMgbGl2ZS1lZGl0aW5nIHRoaXMgc2VsZWN0b3Jcblx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoL1sjXFwuXS9nLCAnICcpO1xuXG5cdFx0Ly8gVGhlIG9ubHkgdGhpbmdzIGxlZnQgc2hvdWxkIGJlIGVsZW1lbnQgc2VsZWN0b3JzICh0eXBlIGMpXG5cdFx0ZmluZE1hdGNoKGVsZW1lbnRSZWdleCwgJ2MnKTtcblxuXHRcdC8vIE9yZGVyIHRoZSBwYXJ0cyBpbiB0aGUgb3JkZXIgdGhleSBhcHBlYXIgaW4gdGhlIG9yaWdpbmFsIHNlbGVjdG9yXG5cdFx0Ly8gVGhpcyBpcyBuZWF0ZXIgZm9yIGV4dGVybmFsIGFwcHMgdG8gZGVhbCB3aXRoXG5cdFx0cGFydHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHRyZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VsZWN0b3I6IGlucHV0LFxuXHRcdFx0c3BlY2lmaWNpdHk6ICcwLCcgKyB0eXBlQ291bnQuYS50b1N0cmluZygpICsgJywnICsgdHlwZUNvdW50LmIudG9TdHJpbmcoKSArICcsJyArIHR5cGVDb3VudC5jLnRvU3RyaW5nKCksXG5cdFx0XHRwYXJ0czogcGFydHNcblx0XHR9O1xuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0Y2FsY3VsYXRlOiBjYWxjdWxhdGVcblx0fTtcbn0oKSk7XG5cblxuKGZ1bmN0aW9uKCkge1xuXG5cdHZhciBTdHlsZVBhcnNlciA9IHt9O1xuXG5cdHZhciBydWxlcyA9IHt9O1xuXHR2YXIgc2hlZXRzID0gZG9jdW1lbnQuc3R5bGVTaGVldHM7XG5cblx0dmFyIHNoZWV0LCBydWxlO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHNoZWV0cy5sZW5ndGg7IGkrKykge1xuXHRcdFxuXHRcdHNoZWV0ID0gc2hlZXRzW2ldO1xuXHRcdGlmKCFzaGVldC5jc3NSdWxlcykgY29udGludWU7XG5cblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHNoZWV0LmNzc1J1bGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRydWxlID0gc2hlZXQuY3NzUnVsZXNbal07XG5cdFx0XHRydWxlc1tydWxlLnNlbGVjdG9yVGV4dF0gPSBydWxlO1xuXHRcdH1cblx0fVxuXG5cdFN0eWxlUGFyc2VyLnJlc29sdmUgPSBmdW5jdGlvbih0cmFja2VkRWxlbWVudCkge1xuXG5cdFx0dmFyIG1hdGNoZWRSdWxlcyA9IHdpbmRvdy5nZXRNYXRjaGVkQ1NTUnVsZXModHJhY2tlZEVsZW1lbnQpIHx8IFtdO1xuXHRcdHZhciBydWxlcyA9IFtdO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRydWxlcy5wdXNoKFttYXRjaGVkUnVsZXNbaV0sIHBhcnNlSW50KFNQRUNJRklDSVRZLmNhbGN1bGF0ZShtYXRjaGVkUnVsZXNbaV0uc2VsZWN0b3JUZXh0KVswXS5zcGVjaWZpY2l0eS5yZXBsYWNlKC9cXCwvZywgJycpLCAxMCkgKyAwLjAxICogaV0pO1xuXHRcdH1cblxuXG5cblx0XHRydWxlcyA9IHJ1bGVzXG5cdFx0XHQuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0XHRcdHJldHVybiBiWzFdIC0gYVsxXTtcblx0XHRcdH0pXG5cdFx0XHQubWFwKGZ1bmN0aW9uKGEpIHtcblx0XHRcdFx0cmV0dXJuIGFbMF07XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiBydWxlcztcblxuXHR9O1xuXG5cdHdpbmRvdy5TdHlsZVBhcnNlciA9IFN0eWxlUGFyc2VyO1xuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuXHR2YXIgT3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5vdmVybGF5RWxlbWVudCA9IG51bGw7IC8vIHRoZSBhY3R1YWwgb3ZlcmxheSBkaXZcblx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDsgLy8gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBlbGVtZW50XG5cdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBudWxsOyAvLyB3aGVuIGRlZmluZWQsIHdlJ3JlIGluIHJ1bGUgbW9kZVxuXHRcdHRoaXMuZ2hvc3RzID0gW107IC8vIGdob3N0cyBhcmUgZWxlbWVudHMgY3JlYXRlZCB0byB2aXN1YWxpemUgaG92ZXJpbmcsIG9yIHdoZW4gd2UgZWRpdCBiYXNlZCBvbiBydWxlXG5cdFx0dGhpcy5ob3Zlckdob3N0ID0gbmV3IEdob3N0KCk7IC8vIHRoZSBob3ZlciBnaG9zdFxuXHRcdHRoaXMub3ZlciA9IGZhbHNlOyAvLyBvbiB3aGV0aGVyIHdlJ3JlIGN1cnJlbmx5IGhvdmVyaW5nIGEgY2VydGFpbiBwYXJ0IG9mIHRoZSBvdmVybGF5XG5cdFx0dGhpcy5vdmVySW5uZXIgPSBmYWxzZTtcblx0XHR0aGlzLm92ZXJQYWRkaW5nID0gZmFsc2U7XG5cdFx0dGhpcy5pbnRlcmFjdGluZyA9IGZhbHNlOyAvLyB3aGV0aGVyIHdlJ3JlIGN1cnJlbnRseSBpbnRlcmFjdGluZyB3aXRoIHRoZSBlbGVtZW50XG5cblx0XHQvLyBpbml0aWFsaXplXG5cdFx0dGhpcy5jcmVhdGUoKTtcblxuXHR9O1xuXG5cdCQuZXh0ZW5kKE92ZXJsYXkucHJvdG90eXBlLCB7XG5cblx0XHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmNyZWF0ZU92ZXJsYXkoKTtcblx0XHRcdHRoaXMuY3JlYXRlVGl0bGUoKTtcblxuXHRcdH0sXG5cblx0XHRjcmVhdGVPdmVybGF5OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudCA9ICQoJzxkaXYgaWQ9XCJvdmVybGF5XCIgY2xhc3M9XCJvdmVybGF5XCI+PC9kaXY+JylbMF07XG5cblx0XHRcdHRoaXMuZ3VpZGVMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuZ3VpZGVSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1yaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5ndWlkZUJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuZ3VpZGVUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtbWFyZ2luLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtbWFyZ2luLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtcGFkZGluZy1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Cb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZVNpemVCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtc2l6ZVwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgaGVpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBib3R0b20gaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1zaXplXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSB3aWR0aFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgdG9wIGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHRvcCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBsZWZ0IGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgbGVmdCBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24td2lkdGhcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24taGVpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR0aGlzLmhhbmRsZVNpemVCb3R0b21cblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVNpemVSaWdodClcblx0XHRcdFx0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5vdmVyU2l6ZUhhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVTaXplUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uV2lkdGguY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LnNlbGVjdFJ1bGUoJ3dpZHRoJyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlU2l6ZUJvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25IZWlnaHQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnNlbGVjdFJ1bGUoJ2hlaWdodCcpOyB9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IG51bGw7XG5cdFx0XHRcdFx0dGhhdC5vdmVyU2l6ZUhhbmRsZSA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0XHRcdHZhciByZW1vdmVTcGFuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVNpemVSaWdodFswXSkgeyB0aGF0LmNhcHRpb25XaWR0aC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlU2l6ZUJvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25IZWlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XHRcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYoIXRoYXQuX19jYXRjaE1vdXNlVXApIHtcblx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSAkKGRvY3VtZW50KS5vbmUoJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0aWYoIXRoYXQub3ZlclNpemVIYW5kbGUpIHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9IG51bGw7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b21cblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVBhZGRpbmdUb3ApXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVQYWRkaW5nTGVmdClcblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVBhZGRpbmdSaWdodClcblx0XHRcdFx0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5vdmVyUGFkZGluZ0hhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ1JpZ2h0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLXJpZ2h0Jyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ0JvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nQm90dG9tLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLWJvdHRvbScpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLWxlZnQnKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nVG9wWzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdUb3AuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnNlbGVjdFJ1bGUoJ3BhZGRpbmctdG9wJyk7IH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gbnVsbDtcblx0XHRcdFx0XHR0aGF0Lm92ZXJQYWRkaW5nSGFuZGxlID0gZmFsc2U7XG5cblx0XHRcdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRcdFx0dmFyIHJlbW92ZVNwYW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ0JvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nQm90dG9tLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nTGVmdFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1RvcFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nVG9wLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0cmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZighdGhhdC5fX2NhdGNoTW91c2VVcCkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9ICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpZighdGhhdC5vdmVyUGFkZGluZ0hhbmRsZSkgcmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gbnVsbDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVNYXJnaW5Ub3ApXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVNYXJnaW5MZWZ0KVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlTWFyZ2luUmlnaHQpXG5cdFx0XHRcdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHRoYXQub3Zlck1hcmdpbkhhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5SaWdodFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLXJpZ2h0Jyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLWJvdHRvbScpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpbkxlZnRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLWxlZnQnKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Ub3BbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luVG9wLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tdG9wJyk7IH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gbnVsbDtcblx0XHRcdFx0XHR0aGF0Lm92ZXJNYXJnaW5IYW5kbGUgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdFx0XHR2YXIgcmVtb3ZlU3BhbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5SaWdodFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luTGVmdFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Ub3BbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luVG9wLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0cmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZighdGhhdC5fX2NhdGNoTW91c2VVcCkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9ICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpZighdGhhdC5vdmVyTWFyZ2luSGFuZGxlKSByZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0fSxcblxuXHRcdGNyZWF0ZVRpdGxlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy50aXRsZUJveCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5LXRpdGxlXCI+PGRpdiBjbGFzcz1cInRpdGxlLXJ1bGVcIj48c3BhbiBjbGFzcz1cInNlbGVjdGVkXCI+aW5saW5lIHN0eWxlPC9zcGFuPiA8c3BhbiBjbGFzcz1cInRvZ2dsZVwiPuKWvjwvc3Bhbj48dWwgY2xhc3M9XCJkcm9wZG93blwiPjxsaT5pbmxpbmUgc3R5bGU8L2xpPjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cInRpdGxlLXByb3BvcnRpb25zXCI+MTAwIHggMTAwPC9kaXY+PC9kaXY+Jylcblx0XHRcdFx0LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpWzBdO1xuXG5cdFx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMgPSAkKCcudGl0bGUtcHJvcG9ydGlvbnMnLCB0aGlzLnRpdGxlQm94KVswXTtcblx0XHRcdHRoaXMudGl0bGVEcm9wZG93biA9ICQoJy5kcm9wZG93bicsIHRoaXMudGl0bGVCb3gpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogRXZlbnRzICYgQmVoYXZpb3VyIGluaXRpYWxpemF0aW9uXG5cdFx0ICovXG5cblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5pbml0VGl0bGVCb3goKTtcblx0XHRcdHRoaXMuaW5pdEhvdmVyKCk7XG5cdFx0XHR0aGlzLmluaXRSdWxlU2hvcnRjdXQoKTtcblx0XHRcdHRoaXMuaW5pdERpbWVuc2lvblNob3J0Y3V0KCk7XG5cdFx0XHR0aGlzLmluaXRIYW5kbGVzKCk7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdCQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0XHRcdHRoYXQudW5zZXQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9LFxuXG5cdFx0aW5pdFRpdGxlQm94OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0Ly8gaW5pdGlhbGl6ZSB0aXRsZSBib3ggYmVoYXZpb3VyXG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHZhciB0aXRsZUJveCA9IHRoaXMudGl0bGVCb3g7XG5cdFx0XHR2YXIgdGl0bGVEcm9wZG93biA9IHRoaXMudGl0bGVEcm9wZG93bjtcblxuXHRcdFx0JCgnc3BhbicsIHRpdGxlQm94KS5jbGljayhmdW5jdGlvbigpIHtcblx0XHRcdFx0JCgnLmRyb3Bkb3duJywgdGl0bGVCb3gpLnRvZ2dsZSgpO1xuXHRcdFx0fSk7XG5cblxuXHRcdFx0dGl0bGVEcm9wZG93bi5vbignY2xpY2snLCAnbGknLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR0aXRsZURyb3Bkb3duLmhpZGUoKTtcblx0XHRcdFx0JCgnLnNlbGVjdGVkJywgdGl0bGVCb3gpLmh0bWwodGhpcy5pbm5lckhUTUwpO1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIGNzc1J1bGUgPSAkKHRoaXMpLmRhdGEoJ2Nzc1J1bGUnKTtcblx0XHRcdFx0aWYoY3NzUnVsZSkge1xuXHRcdFx0XHRcdHRoYXQuZW50ZXJSdWxlTW9kZShjc3NSdWxlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGF0LmV4aXRSdWxlTW9kZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdHByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdHZhciBleHRyYU1hcmdpbiA9IDEwO1xuXHRcdFx0dmFyIG9mZnNldCA9IHRoaXMuY3VycmVudE9mZnNldDtcblxuXHRcdFx0Ly8gY29tbWFuZCBvdmVyL291dFxuXG5cdFx0XHRpZihcblx0XHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0IC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSB0aGlzLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0ICsgZXh0cmFNYXJnaW4pICYmXG5cdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgKyB0aGlzLm1hcmdpbkJvdHRvbSArIGV4dHJhTWFyZ2luKVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMuY29tbWFuZE92ZXIpIHtcblx0XHRcdFx0XHR0aGlzLmNvbW1hbmRPdmVyID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG9XaW5kb3coKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGlmKHRoaXMuY29tbWFuZE92ZXIpIHtcblx0XHRcdFx0XHR0aGlzLmNvbW1hbmRPdmVyID0gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHByb2Nlc3NPdmVyTG9naWM6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0dmFyIGV4dHJhTWFyZ2luID0gMTA7XG5cdFx0XHR2YXIgb2Zmc2V0ID0gdGhpcy5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0XHQvLyBnZW5lcmFsIG92ZXIvb3V0XG5cblx0XHRcdGlmKFxuXHRcdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSB0aGlzLm1hcmdpbkxlZnQgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAtIHRoaXMubWFyZ2luVG9wIC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIHRoaXMubWFyZ2luUmlnaHQgKyBleHRyYU1hcmdpbikgJiZcblx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCArIHRoaXMubWFyZ2luQm90dG9tICsgZXh0cmFNYXJnaW4pXG5cdFx0XHQpIHtcblxuXHRcdFx0XHRpZighdGhpcy5vdmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cdFx0XHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZih0aGlzLm92ZXIgJiYgIXRoaXMuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHR0aGlzLm92ZXIgPSBmYWxzZTtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyJyk7XG5cdFx0XHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1x0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gb3ZlciBpbm5lciBib3hcblxuXHRcdFx0aWYoIXRoaXMuaW50ZXJhY3RpbmcpIHtcblxuXHRcdFx0XHRpZihcblx0XHRcdFx0XHQoKGUucGFnZVggPiBvZmZzZXQubGVmdCArIHRoaXMucGFkZGluZ0xlZnQgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgdGhpcy5wYWRkaW5nVG9wICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoIC0gdGhpcy5wYWRkaW5nUmlnaHQpICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0IC0gdGhpcy5wYWRkaW5nQm90dG9tKSkgfHxcblx0XHRcdFx0XHR0aGlzLm92ZXJTaXplSGFuZGxlKSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJQYWRkaW5nSGFuZGxlICYmIC8vIGNhbm5vdCBiZSBvdmVyIHBhZGRpbmcgaGFuZGxlXG5cdFx0XHRcdFx0IXRoaXMub3Zlck1hcmdpbkhhbmRsZVxuXHRcdFx0XHQpIHtcblxuXHRcdFx0XHRcdGlmKCF0aGlzLm92ZXJJbm5lcikge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbm5lcicpO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVySW5uZXIgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYodGhpcy5vdmVySW5uZXIpIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcklubmVyID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLWlubmVyJyk7XHRcdFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gb3ZlciBwYWRkaW5nIGJveFxuXG5cdFx0XHRpZighdGhpcy5pbnRlcmFjdGluZykge1xuXG5cdFx0XHRcdGlmKFxuXHRcdFx0XHRcdCgoZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICYmIGUucGFnZVkgPiBvZmZzZXQudG9wICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoKSAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCkgJiZcblx0XHRcdFx0XHRcdCF0aGlzLm92ZXJJbm5lcikgfHxcblx0XHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nSGFuZGxlKSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJTaXplSGFuZGxlICYmXG5cdFx0XHRcdFx0IXRoaXMub3Zlck1hcmdpbkhhbmRsZVxuXHRcdFx0XHQpIHtcblxuXHRcdFx0XHRcdGlmKCF0aGlzLm92ZXJQYWRkaW5nKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLXBhZGRpbmcnKTtcblx0XHRcdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYodGhpcy5vdmVyUGFkZGluZykge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1wYWRkaW5nJyk7XHRcdFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gb3ZlciBtYXJnaW4gYm94XG5cblx0XHRcdGlmKCF0aGlzLmludGVyYWN0aW5nKSB7XG5cblx0XHRcdFx0aWYoXG5cdFx0XHRcdFx0KChlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSB0aGlzLm1hcmdpbkxlZnQgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gdGhpcy5tYXJnaW5Ub3AgJiYgXG5cdFx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCkgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgKyB0aGlzLm1hcmdpbkJvdHRvbSkgJiZcblx0XHRcdFx0XHRcdCF0aGlzLm92ZXJJbm5lciAmJlxuXHRcdFx0XHRcdFx0IXRoaXMub3ZlclBhZGRpbmcpIHx8XG5cdFx0XHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbkhhbmRsZSkgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyUGFkZGluZ0hhbmRsZSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJTaXplSGFuZGxlXG5cdFx0XHRcdCkge1xuXG5cdFx0XHRcdFx0aWYoIXRoaXMub3Zlck1hcmdpbikge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1tYXJnaW4nKTtcblx0XHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRpZih0aGlzLm92ZXJNYXJnaW4pIHtcblx0XHRcdFx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1tYXJnaW4nKTtcdFx0XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGluaXRIb3ZlcjogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdFx0JCgnYm9keScpLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cblx0XHRcdFx0dGhhdC5fX2xhc3RNb3VzZU1vdmVFdmVudCA9IGU7XG5cdFx0XHRcdGlmKCF0aGF0LmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYodGhhdC5jb21tYW5kUHJlc3NlZCkge1xuXHRcdFx0XHRcdHRoYXQucHJvY2Vzc0NvbW1hbmRPdmVyTG9naWMoZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhhdC5wcm9jZXNzT3ZlckxvZ2ljKGUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdGluaXRSdWxlU2hvcnRjdXQ6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGl0bGVEcm9wZG93biA9IHRoaXMudGl0bGVEcm9wZG93bjtcblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUud2hpY2ggIT09IDE2KSByZXR1cm47XG5cdFx0XHRcdHRoYXQuX19wcmV2U2VsZWN0ZWRSdWxlID0gdGhhdC5zZWxlY3RlZFJ1bGU7XG5cdFx0XHRcdHRoYXQuc2hpZnRQcmVzc2VkID0gdHJ1ZTtcblx0XHRcdFx0dGl0bGVEcm9wZG93bi5maW5kKCdsaTplcSgwKScpLmNsaWNrKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRpZihlLndoaWNoICE9PSAxNikgcmV0dXJuO1xuXHRcdFx0XHR0aGF0LnNoaWZ0UHJlc3NlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdC8vIHJlLXByb2Nlc3MgYXMgaWYgd2UndmUganVzdCBob3ZlcmVkXG5cdFx0XHRcdGlmKHRoYXQuY3VycmVudEhhbmRsZSkge1xuXHRcdFx0XHRcdCQodGhhdC5jdXJyZW50SGFuZGxlKS50cmlnZ2VyKCdtb3VzZWVudGVyJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSk7XG5cblx0XHR9LFxuXG5cdFx0aW5pdERpbWVuc2lvblNob3J0Y3V0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0XHQkKGRvY3VtZW50KS5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0aWYoZS53aGljaCA9PT0gOTEpIHtcblx0XHRcdFx0XHR0aGF0LmVudGVyRGltZW5zaW9uTW9kZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRpZihlLndoaWNoID09PSA5MSkge1xuXHRcdFx0XHRcdHRoYXQuZXhpdERpbWVuc2lvbk1vZGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR9LFxuXG5cdFx0ZW50ZXJEaW1lbnNpb25Nb2RlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5jb21tYW5kUHJlc3NlZCA9IHRydWU7XG5cdFx0XHR0aGlzLmNvbW1hbmRPdmVyID0gZmFsc2U7XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInLCAnaG92ZXItaW5uZXInLCAnaG92ZXItbWFyZ2luJywgJ2hvdmVyLXBhZGRpbmcnKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaW4tY29tbWFuZCcpO1xuXHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblx0XHRcdHRoaXMudGl0bGVCb3guc3R5bGUub3BhY2l0eSA9IDA7XG5cblx0XHRcdGlmKHRoaXMuX19sYXN0TW91c2VNb3ZlRXZlbnQpXG5cdFx0XHRcdHRoaXMucHJvY2Vzc0NvbW1hbmRPdmVyTG9naWModGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudCk7XG5cblx0XHRcdGlmKHRoaXMuaG92ZXJFbGVtZW50ICE9PSB0aGlzLmN1cnJlbnRFbGVtZW50ICYmXG5cdFx0XHRcdCEkLmNvbnRhaW5zKHRoaXMuaG92ZXJFbGVtZW50LCB0aGlzLmN1cnJlbnRFbGVtZW50KSAmJlxuXHRcdFx0XHQhJC5jb250YWlucyh0aGlzLmN1cnJlbnRFbGVtZW50LCB0aGlzLmhvdmVyRWxlbWVudClcblx0XHRcdCkge1xuXHRcdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG8odGhpcy5ob3ZlckVsZW1lbnQpO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdGV4aXREaW1lbnNpb25Nb2RlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5jb21tYW5kUHJlc3NlZCA9IGZhbHNlO1xuXG5cdFx0XHRpZih0aGlzLm92ZXIpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblx0XHRcdGlmKHRoaXMub3ZlcklubmVyKSB0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLWlubmVyJyk7XG5cdFx0XHRpZih0aGlzLm92ZXJQYWRkaW5nKSB0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLXBhZGRpbmcnKTtcblx0XHRcdGlmKHRoaXMub3Zlck1hcmdpbikgdGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1tYXJnaW4nKTtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpbi1jb21tYW5kJyk7XG5cblx0XHRcdC8vIGVkZ2UgY2FzZTogdXNlciBob2xkcyBjb21tYW5kLCBtb3ZlcyBvdXQsIHJlbGVhc2VzIGNvbW1hbmRcblx0XHRcdGlmKHRoaXMuX19sYXN0TW91c2VNb3ZlRXZlbnQpXG5cdFx0XHRcdHRoaXMucHJvY2Vzc092ZXJMb2dpYyh0aGlzLl9fbGFzdE1vdXNlTW92ZUV2ZW50KTtcblxuXHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPSAnJztcblx0XHRcdHRoaXMudGl0bGVCb3guc3R5bGUub3BhY2l0eSA9IDE7XG5cblx0XHRcdGlmKHRoaXMudkxpbmVYKSB0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHRcdGlmKHRoaXMudkxpbmVZKSB0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMDtcblxuXHRcdH0sXG5cblx0XHRjYWxjdWxhdGVTbmFwOiBmdW5jdGlvbihjdXJyZW50VmFsdWUvKiwgYXhpcyovKSB7XG5cdFx0XHRyZXR1cm4gY3VycmVudFZhbHVlO1xuXHRcdH0sXG5cblx0XHRpbml0SGFuZGxlczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHZhciBoYW5kbGVPZmZzZXQgPSAzO1xuXG5cdFx0XHQvLyByZXNpemUgaGFuZGxlc1xuXG5cdFx0XHQoZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIHN0YXJ0ID0gZnVuY3Rpb24oKSB7IHRoYXQuaW50ZXJhY3RpbmcgPSAnc2l6ZSc7IHRoaXMuX194ID0gJCh0aGlzKS5kcmFnZ2FibGUoJ29wdGlvbicsICdheGlzJykgPT09ICd4JzsgfTtcblx0XHRcdFx0dmFyIGRyYWcgPSBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHR2YXIgeCA9IHRoaXMuX194O1xuXG5cdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIG5vcm1hbCBoYW5kbGUgcG9zaXRpb25cblx0XHRcdFx0XHR1aS5wb3NpdGlvblt4ID8gJ2xlZnQnIDogJ3RvcCddID0gTWF0aC5tYXgoMCAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb25beCA/ICdsZWZ0JyA6ICd0b3AnXSk7XG5cblx0XHRcdFx0XHQvLyBhcHBseSBwb3NzaWJsZSBzbmFwXG5cdFx0XHRcdFx0dWkucG9zaXRpb25beCA/ICdsZWZ0JyA6ICd0b3AnXSA9IHRoYXQuY2FsY3VsYXRlU25hcCh1aS5wb3NpdGlvblt4ID8gJ2xlZnQnIDogJ3RvcCddLCB4ID8gJ3gnIDogJ3knKTtcblxuXHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZVt4ID8gJ3dpZHRoJyA6ICdoZWlnaHQnXSA9ICh1aS5wb3NpdGlvblt4ID8gJ2xlZnQnIDogJ3RvcCddICsgaGFuZGxlT2Zmc2V0KSArICdweCc7XG5cdFx0XHRcdFx0dGhhdC5zeW5jKG51bGwsIHRydWUpO1xuXHRcdFx0XHRcdHRoYXQudXBkYXRlR2hvc3RzKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly90aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmhlaWdodCA9ICcnO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUud2lkdGggPSAnJztcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmJvdHRvbSA9ICcnO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUudG9wID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS5sZWZ0ID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS5yaWdodCA9ICcnO1xuXHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVNpemVCb3R0b20uZHJhZ2dhYmxlKHsgZGlzdGFuY2U6IDAsIGF4aXM6ICd5JywgY3Vyc29yOiAncy1yZXNpemUnLCBzdGFydDogc3RhcnQsIGRyYWc6IGRyYWcsIHN0b3A6IHN0b3AgfSk7XG5cdFx0XHRcdHRoYXQuaGFuZGxlU2l6ZVJpZ2h0LmRyYWdnYWJsZSh7IGRpc3RhbmNlOiAwLCBheGlzOiAneCcsIGN1cnNvcjogJ2UtcmVzaXplJywgc3RhcnQ6IHN0YXJ0LCBkcmFnOiBkcmFnLCBzdG9wOiBzdG9wIH0pO1xuXG5cdFx0XHR9KSgpO1xuXG5cblx0XHRcdC8vIHJlc2l6ZSBwYWRkaW5nXG5cblx0XHRcdChmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoaXMucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGRyYWcgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LnN5bmMobnVsbCwgdHJ1ZSk7XG5cdFx0XHRcdFx0dGhhdC51cGRhdGVHaG9zdHMoKTtcdFx0XHRcdFx0XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nQm90dG9tLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3MtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVySGVpZ2h0ID0gJCh0aGF0LmN1cnJlbnRFbGVtZW50KS5oZWlnaHQoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ0JvdHRvbSA9IHRoYXQucGFkZGluZ0JvdHRvbTtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAncGFkZGluZyc7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IE1hdGgubWF4KHRoaXMuY3VySW5uZXJIZWlnaHQgLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ0JvdHRvbSA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ0JvdHRvbSArICgodWkucG9zaXRpb24udG9wKSAtIHVpLm9yaWdpbmFsUG9zaXRpb24udG9wKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdSaWdodC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd4Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICdlLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJJbm5lcldpZHRoID0gJCh0aGF0LmN1cnJlbnRFbGVtZW50KS53aWR0aCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nUmlnaHQgPSB0aGF0LnBhZGRpbmdSaWdodDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAncGFkZGluZyc7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCh0aGlzLmN1cklubmVyV2lkdGggLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdSaWdodCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ1JpZ2h0ICsgKCh1aS5wb3NpdGlvbi5sZWZ0KSAtIHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nVG9wLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ24tcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC50b3A7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdUb3AgPSB0aGF0LnBhZGRpbmdUb3A7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdUb3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdUb3AgLSAodWkub2Zmc2V0LnRvcCAtIHRoaXMuY3VyT2Zmc2V0KSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3ctcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC5sZWZ0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nTGVmdCA9IHRoYXQucGFkZGluZ0xlZnQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nTGVmdCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ0xlZnQgLSAodWkub2Zmc2V0LmxlZnQgLSB0aGlzLmN1ck9mZnNldCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XHRcdFx0XHRcblxuXHRcdFx0fSkoKTtcblxuXG5cdFx0XHQvLyByZXNpemUgbWFyZ2luXG5cblx0XHRcdChmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoaXMucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGRyYWcgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LnN5bmMobnVsbCwgdHJ1ZSk7XG5cdFx0XHRcdFx0dGhhdC51cGRhdGVHaG9zdHMoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpbkJvdHRvbS5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd5Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICdzLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJJbm5lckhlaWdodCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkuaGVpZ2h0KCk7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpbkJvdHRvbSA9IHRoYXQubWFyZ2luQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nQm90dG9tID0gdGhhdC5wYWRkaW5nQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdtYXJnaW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBNYXRoLm1heCh0aGlzLmN1cklubmVySGVpZ2h0ICsgdGhpcy5jdXJQYWRkaW5nQm90dG9tIC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpbkJvdHRvbSA9IE1hdGgubWF4KDAsIHRoaXMuY3VyTWFyZ2luQm90dG9tICsgKHVpLnBvc2l0aW9uLnRvcCAtIHVpLm9yaWdpbmFsUG9zaXRpb24udG9wKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpblJpZ2h0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ2UtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVyV2lkdGggPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLndpZHRoKCk7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpblJpZ2h0ID0gdGhhdC5tYXJnaW5SaWdodDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ1JpZ2h0ID0gdGhhdC5wYWRkaW5nUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCh0aGlzLmN1cklubmVyV2lkdGggKyB0aGlzLmN1clBhZGRpbmdSaWdodCAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb24ubGVmdCk7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luUmlnaHQgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpblJpZ2h0ICsgKHVpLnBvc2l0aW9uLmxlZnQgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLmxlZnQpKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlTWFyZ2luTGVmdC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd4Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICd3LXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJPZmZzZXQgPSB1aS5vZmZzZXQubGVmdDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luTGVmdCA9IHRoYXQubWFyZ2luTGVmdDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IC1oYW5kbGVPZmZzZXQ7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luTGVmdCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyTWFyZ2luTGVmdCAtICh1aS5vZmZzZXQubGVmdCAtIHRoaXMuY3VyT2Zmc2V0KSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpblRvcC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd5Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICduLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJPZmZzZXQgPSB1aS5vZmZzZXQudG9wO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5Ub3AgPSB0aGF0Lm1hcmdpblRvcDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5Ub3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpblRvcCAtICh1aS5vZmZzZXQudG9wIC0gdGhpcy5jdXJPZmZzZXQpKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9KSgpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogQ29yZSBydW50aW1lIGZ1bmN0aW9uYWxpdHlcblx0XHQgKi9cblxuXHRcdHN5bmM6IGZ1bmN0aW9uKG5ld0VsZW0sIGR1cmluZ0ludGVyYWN0aW9uKSB7XG5cblx0XHRcdHZhciBjb21wdXRlZFN0eWxlID0gdGhpcy5jb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShuZXdFbGVtIHx8IHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHRpZihuZXdFbGVtKSB7XG5cdFx0XHRcdHRoaXMuc2V0KG5ld0VsZW0pO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLm92ZXJsYXlFbGVtZW50O1xuXHRcdFx0dmFyIGVsZW0gPSAkKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXHRcdFx0dmFyIG9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHRcdC8vIHdlIG5lZWQgdG8gc3RvcmUgb3V0ZXIgaGVpZ2h0LCBib3R0b20vcmlnaHQgcGFkZGluZyBhbmQgbWFyZ2lucyBmb3IgaG92ZXIgZGV0ZWN0aW9uXG5cdFx0XHR2YXIgcGFkZGluZ0xlZnQgPSB0aGlzLnBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nTGVmdCk7XG5cdFx0XHR2YXIgcGFkZGluZ1RvcCA9IHRoaXMucGFkZGluZ1RvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ1RvcCk7XG5cdFx0XHR2YXIgcGFkZGluZ1JpZ2h0ID0gdGhpcy5wYWRkaW5nUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdSaWdodCk7XG5cdFx0XHR2YXIgcGFkZGluZ0JvdHRvbSA9IHRoaXMucGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0JvdHRvbSk7XG5cblx0XHRcdHZhciBtYXJnaW5MZWZ0ID0gdGhpcy5tYXJnaW5MZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0KTtcblx0XHRcdHZhciBtYXJnaW5Ub3AgPSB0aGlzLm1hcmdpblRvcCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luVG9wKTtcblx0XHRcdHZhciBtYXJnaW5SaWdodCA9IHRoaXMubWFyZ2luUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblJpZ2h0KTtcblx0XHRcdHZhciBtYXJnaW5Cb3R0b20gPSB0aGlzLm1hcmdpbkJvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luQm90dG9tKTtcblxuXHRcdFx0dmFyIGlubmVyV2lkdGggPSB0aGlzLmlubmVyV2lkdGggPSBwYXJzZUludChjb21wdXRlZFN0eWxlLndpZHRoKSB8fCAodGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0KTtcblx0XHRcdHZhciBpbm5lckhlaWdodCA9IHRoaXMuaW5uZXJIZWlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLmhlaWdodCkgfHwgKHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b20pO1xuXG5cdFx0XHR2YXIgb3V0ZXJXaWR0aCA9IHRoaXMub3V0ZXJXaWR0aCA9IGlubmVyV2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodDtcblx0XHRcdHZhciBvdXRlckhlaWdodCA9IHRoaXMub3V0ZXJIZWlnaHQgPSBpbm5lckhlaWdodCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuXG5cdFx0XHQvLyBjYWxjdWxhdGUgaGFuZGxlIHNpemVcblx0XHRcdHZhciBoYW5kbGVTaXplWCA9IDE2O1xuXHRcdFx0dmFyIGhhbmRsZVNpemVZID0gMTY7XG5cdFx0XHRpZihpbm5lcldpZHRoIDwgMTAwKSB7XG5cdFx0XHRcdGhhbmRsZVNpemVYID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oMTYsIGhhbmRsZVNpemVYICogKGlubmVyV2lkdGggLyA2MCkpKTtcblx0XHRcdH1cblx0XHRcdGlmKGlubmVySGVpZ2h0IDwgMTAwKSB7XG5cdFx0XHRcdGhhbmRsZVNpemVZID0gTWF0aC5tYXgoOCwgTWF0aC5taW4oMTYsIGhhbmRsZVNpemVZICogKGlubmVySGVpZ2h0IC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnJlZnJlc2hIYW5kbGVzKGhhbmRsZVNpemVYLCBoYW5kbGVTaXplWSk7XG5cblx0XHRcdC8vIHBsYWNlIGFuZCByZXNpemUgb3ZlcmxheVxuXHRcdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUud2lkdGggPSBpbm5lcldpZHRoICsgJ3B4Jztcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLmhlaWdodCA9IGlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChvZmZzZXQubGVmdCArIHBhZGRpbmdMZWZ0KSArICdweCwgJyArIChvZmZzZXQudG9wICsgcGFkZGluZ1RvcCkgKyAncHgpJztcblxuXHRcdFx0Ly8gcGxhY2UgdGl0bGUgYm94XG5cdFx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0dGhpcy50aXRsZUJveC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyAoKG91dGVyV2lkdGggLSB0aGlzLnRpdGxlQm94Lm9mZnNldFdpZHRoKSAvIDIpKSArICdweCwgJyArIChvZmZzZXQudG9wIC0gbWFyZ2luVG9wIC0gMzApICsgJ3B4KSc7XG5cdFx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMuaW5uZXJIVE1MID0gb3V0ZXJXaWR0aCArICcgeCAnICsgb3V0ZXJIZWlnaHQ7XG5cblx0XHRcdC8vIG1vZGlmeSBwYWRkaW5nIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nTGVmdCArICcsICcgKyBvdXRlckhlaWdodCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1JpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nUmlnaHQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKC1wYWRkaW5nVG9wKSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ1RvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoMCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQpICsgJ3B4KSBzY2FsZSgnICsgaW5uZXJXaWR0aCArICcsICcgKyBwYWRkaW5nQm90dG9tICsgJyknO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIC1wYWRkaW5nTGVmdCArICdweCwgMHB4KSc7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodFswXS5zdHlsZS5tYXJnaW5SaWdodCA9IC1wYWRkaW5nUmlnaHQgKyAncHgnOyAvLyBUT0RPOiBmaW5kIG91dCB3aHkgY29udmVydGluZyB0aGVzZSB0byB0cmFuc2Zvcm1zIG1lc3NlcyB3aXRoIGRyYWdnaW5nXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdUb3BbMF0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAtcGFkZGluZ1RvcCArICdweCknO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICAtcGFkZGluZ0JvdHRvbSArICdweCc7ICAvLyBUT0RPOiBmaW5kIG91dCB3aHkgY29udmVydGluZyB0aGVzZSB0byB0cmFuc2Zvcm1zIG1lc3NlcyB3aXRoIGRyYWdnaW5nXG5cblx0XHRcdC8vIG1vZGlmeSBtYXJnaW4gYm94XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkxlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KSkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5MZWZ0ICsgJywgJyArIChvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSkgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblJpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoICsgcGFkZGluZ1JpZ2h0KSArICdweCwgJyArICgtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApKSArICdweCkgc2NhbGUoJyArIG1hcmdpblJpZ2h0ICsgJywgJyArIChvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSkgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblRvcC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApKSArICdweCkgc2NhbGUoJyArIG91dGVyV2lkdGggKyAnLCAnICsgbWFyZ2luVG9wICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Cb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQgKyBwYWRkaW5nQm90dG9tKSArICdweCkgc2NhbGUoJyArIG91dGVyV2lkdGggKyAnLCAnICsgbWFyZ2luQm90dG9tICsgJyknO1xuXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUubWFyZ2luTGVmdCA9IC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLm1hcmdpblJpZ2h0ID0gLShwYWRkaW5nUmlnaHQgKyBtYXJnaW5SaWdodCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3BbMF0uc3R5bGUubWFyZ2luVG9wID0gLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVswXS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAtKHBhZGRpbmdCb3R0b20gKyBtYXJnaW5Cb3R0b20pICsgJ3B4JztcblxuXHRcdFx0Ly8gb2Zmc2V0IG1hZ2ljXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUubWFyZ2luVG9wID0gKG1hcmdpbkxlZnQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIG1hcmdpbkxlZnQpIC8gNSkgKyAoaGFuZGxlU2l6ZVkgLyAyKSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5MZWZ0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5MZWZ0KSAvIDUpIC0gOCArIGhhbmRsZVNpemVZKSA6IC04KSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luUmlnaHQpIC8gNSkgKyAoaGFuZGxlU2l6ZVkgLyAyKSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luUmlnaHQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIG1hcmdpblJpZ2h0KSAvIDUpIC0gOCArIGhhbmRsZVNpemVZKSA6IC04KSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcFswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKG1hcmdpblRvcCA8IDIwID8gKC0oKChoYW5kbGVTaXplWCAvIDQpICogbWFyZ2luVG9wKSAvIDUpICsgKGhhbmRsZVNpemVYIC8gMikpIDogLShoYW5kbGVTaXplWCAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luVG9wIDwgMjAgPyAoKGhhbmRsZVNpemVYICogMikgKyAoLShoYW5kbGVTaXplWCkgKiAobWFyZ2luVG9wIC8gMjApKSArIDExKSA6IGhhbmRsZVNpemVYICsgMTEpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luQm90dG9tIDwgMjAgPyAoLSgoKGhhbmRsZVNpemVYIC8gNCkgKiBtYXJnaW5Cb3R0b20pIC8gNSkgKyAoaGFuZGxlU2l6ZVggLyAyKSkgOiAtKGhhbmRsZVNpemVYIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Cb3R0b20uc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Cb3R0b20gPCAyMCA/ICgoaGFuZGxlU2l6ZVggKiAyKSArICgtKGhhbmRsZVNpemVYKSAqIChtYXJnaW5Cb3R0b20gLyAyMCkpICsgMTEpIDogaGFuZGxlU2l6ZVggKyAxMSkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVNpemVSaWdodFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAocGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemVZIC8gNCkgKiBwYWRkaW5nUmlnaHQpIC8gNSkgLSAoaGFuZGxlU2l6ZVkgKiAxLjUpKSA6IC0oaGFuZGxlU2l6ZVkgLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHRcdHRoaXMuY2FwdGlvbldpZHRoLnN0eWxlLm1hcmdpblRvcCA9IChwYWRkaW5nUmlnaHQgPCAyMCA/ICgtOCAtKGhhbmRsZVNpemVZICogMSkgKyAoaGFuZGxlU2l6ZVkgKiAyICogKHBhZGRpbmdSaWdodCAvIDIwKSkpIDogLTgpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlU2l6ZUJvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKHBhZGRpbmdCb3R0b20gPCAyMCA/ICgrKCgoaGFuZGxlU2l6ZVggLyA0KSAqIHBhZGRpbmdCb3R0b20pIC8gNSkgLSAoaGFuZGxlU2l6ZVggKiAxLjUpKSA6IC0oaGFuZGxlU2l6ZVggLyAyKSkgKyAncHgnO1xuXHRcdFx0dGhpcy5jYXB0aW9uSGVpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAocGFkZGluZ0JvdHRvbSA8IDIwID8gKChoYW5kbGVTaXplWCAqIDIgKiAocGFkZGluZ0JvdHRvbSAvIDIwKSkpIDogMTYpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAtKGhhbmRsZVNpemVZIC8gMikgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gLShoYW5kbGVTaXplWSAvIDIpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplWCAvIDIpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplWCAvIDIpICsgJ3B4JztcblxuXHRcdFx0Ly8gZ3VpZGVzXG5cdFx0XHR0aGlzLmd1aWRlTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtb2Zmc2V0LnRvcCAtcGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHRcdHRoaXMuZ3VpZGVMZWZ0LnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cdFx0XHR0aGlzLmd1aWRlTGVmdC5zdHlsZS5sZWZ0ID0gICcwcHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLW9mZnNldC50b3AgLXBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0XHR0aGlzLmd1aWRlUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVSaWdodC5zdHlsZS5yaWdodCA9IC0xICsgJ3B4JztcblxuXHRcdFx0dGhpcy5ndWlkZUJvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLW9mZnNldC5sZWZ0IC1wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdFx0dGhpcy5ndWlkZUJvdHRvbS5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVCb3R0b20uc3R5bGUuYm90dG9tID0gLTEgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtb2Zmc2V0LmxlZnQgLXBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0XHR0aGlzLmd1aWRlVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdFx0dGhpcy5ndWlkZVRvcC5zdHlsZS50b3AgPSAtMSArICdweCc7XG5cblx0XHRcdC8vIHBhZGRpbmcgZ3VpZGVzXG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLW9mZnNldC50b3AgLXBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5sZWZ0ID0gLXBhZGRpbmdMZWZ0ICsgJ3B4JztcblxuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtb2Zmc2V0LnRvcCAtcGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUucmlnaHQgPSAtcGFkZGluZ1JpZ2h0LTEgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLW9mZnNldC5sZWZ0IC1wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS5ib3R0b20gPSAtcGFkZGluZ0JvdHRvbS0xICsgJ3B4JztcblxuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1vZmZzZXQubGVmdCAtcGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudG9wID0gLXBhZGRpbmdUb3AtMSArICdweCc7XG5cblx0XHRcdC8vIG1hcmdpbiBndWlkZXNcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1vZmZzZXQudG9wIC1wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLmxlZnQgPSAtcGFkZGluZ0xlZnQgLW1hcmdpbkxlZnQgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLW9mZnNldC50b3AgLXBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodC5zdHlsZS5yaWdodCA9IC1wYWRkaW5nUmlnaHQgLW1hcmdpblJpZ2h0IC0gMSArICdweCc7XG5cblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1vZmZzZXQubGVmdCAtcGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tLnN0eWxlLmJvdHRvbSA9IC1wYWRkaW5nQm90dG9tIC1tYXJnaW5Cb3R0b20gLTEgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtb2Zmc2V0LmxlZnQgLXBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdFx0dGhpcy5ndWlkZU1hcmdpblRvcC5zdHlsZS50b3AgPSAtcGFkZGluZ1RvcCAtbWFyZ2luVG9wIC0xICsgJ3B4JztcblxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcygpO1xuXHRcdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHRcdFx0dGhpcy5jdXJyZW50T2Zmc2V0ID0gb2Zmc2V0O1xuXG5cdFx0XHRpZighZHVyaW5nSW50ZXJhY3Rpb24pIHtcblx0XHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0cmVmcmVzaEhhbmRsZXM6IGZ1bmN0aW9uKGhhbmRsZVNpemVYLCBoYW5kbGVTaXplWSkge1xuXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplWSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0fSxcblxuXHRcdHJlZnJlc2hDYXB0aW9uczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBvZmZzZXQgPSB7IGxlZnQ6IHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCwgdG9wOiB0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCB9O1xuXG5cdFx0XHQvLyBjYXB0aW9uc1xuXHRcdFx0dmFyIGhpdHNSaWdodEVkZ2UsIGhpdHNMZWZ0RWRnZTtcblxuXHRcdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguaW5uZXJIVE1MID0gJzxzcGFuPndpZHRoOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCd3aWR0aCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguc3R5bGUucmlnaHQgPSAoaGl0c1JpZ2h0RWRnZSA/IDE2IDogLSh0aGlzLmNhcHRpb25XaWR0aC5vZmZzZXRXaWR0aCArIDEzKSkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPmhlaWdodDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnaGVpZ2h0Jyk7XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLWxlZnQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdMZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctcmlnaHQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdSaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy10b3A6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdUb3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctYm90dG9tOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdwYWRkaW5nQm90dG9tJyk7XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1sZWZ0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5MZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLXJpZ2h0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5SaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wLmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tdG9wOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5Ub3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWJvdHRvbTogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luQm90dG9tJyk7XG5cblx0XHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIDgwIDwgMCk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3RbaGl0c0xlZnRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LnN0eWxlLm1hcmdpblJpZ2h0ID0gKGhpdHNMZWZ0RWRnZSA/IHRoaXMucGFkZGluZ0xlZnQgLSB0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5vZmZzZXRXaWR0aC0xNiA6IHRoaXMucGFkZGluZ0xlZnQgKyAxNCkgKyAncHgnO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAoaGl0c1JpZ2h0RWRnZSA/IHRoaXMucGFkZGluZ1JpZ2h0IC0gdGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0Lm9mZnNldFdpZHRoLTE2IDogdGhpcy5wYWRkaW5nUmlnaHQgKyAxNCkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tLnN0eWxlLmJvdHRvbSA9IC0odGhpcy5wYWRkaW5nQm90dG9tICArIDcpICsgJ3B4Jztcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3Auc3R5bGUudG9wID0gLSh0aGlzLnBhZGRpbmdUb3AgICsgNykgKyAncHgnO1xuXG5cdFx0XHRoaXRzTGVmdEVkZ2UgPSAob2Zmc2V0LmxlZnQgLSB0aGlzLm1hcmdpbkxlZnQgLSA4MCA8IDApO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3RbaGl0c0xlZnRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuc3R5bGUubWFyZ2luUmlnaHQgPSB0aGlzLnBhZGRpbmdMZWZ0ICsgdGhpcy5tYXJnaW5MZWZ0ICsgKGhpdHNMZWZ0RWRnZSA/IC10aGlzLmNhcHRpb25NYXJnaW5MZWZ0Lm9mZnNldFdpZHRoLTE3IDogMTQpICsgJ3B4JztcblxuXHRcdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIHRoaXMubWFyZ2luUmlnaHQgKyA4MCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0LmNsYXNzTGlzdFtoaXRzUmlnaHRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSB0aGlzLnBhZGRpbmdSaWdodCArIHRoaXMubWFyZ2luUmlnaHQgKyAoaGl0c1JpZ2h0RWRnZSA/IC10aGlzLmNhcHRpb25NYXJnaW5SaWdodC5vZmZzZXRXaWR0aC0xNyA6IDE0KSArICdweCc7XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5zdHlsZS5ib3R0b20gPSAtdGhpcy5tYXJnaW5Cb3R0b20gLXRoaXMucGFkZGluZ0JvdHRvbSAtNyArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUudG9wID0gLXRoaXMubWFyZ2luVG9wIC10aGlzLnBhZGRpbmdUb3AgLTcgKyAncHgnO1xuXG5cdFx0fSxcblxuXHRcdGdldENhcHRpb25Qcm9wZXJ0eTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Ly8gY2hlY2sgaW4gaW5saW5lIHN0eWxlc1xuXHRcdFx0aWYodGhpcy5jdXJyZW50RWxlbWVudC5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNoZWNrIGluIHJ1bGVzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMubWF0Y2hlZFJ1bGVzW2ldLnN0eWxlW2Nzc1Byb3BlcnR5XSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0ucmVwbGFjZSgvKGVtfHB4KS8sICfigIk8c3Bhbj4kMTwvc3Bhbj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmV0VmFsID0gJyc7XG5cblx0XHRcdGlmKGNzc1Byb3BlcnR5LmluZGV4T2YoJ21hcmdpbicpID4gLTEgfHwgY3NzUHJvcGVydHkuaW5kZXhPZigncGFkZGluZycpID4gLTEpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpc1tjc3NQcm9wZXJ0eV07XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICdoZWlnaHQnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJIZWlnaHQ7XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICd3aWR0aCcpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpcy5pbm5lcldpZHRoO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpbXBsaWNpdCB2YWx1ZVxuXHRcdFx0cmV0dXJuICcoJyArIHJldFZhbCArICfigIk8c3Bhbj5weDwvc3Bhbj4pJztcblxuXHRcdH0sXG5cblx0XHRzZXQ6IGZ1bmN0aW9uKG5ld0VsZW0pIHtcblxuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG5ld0VsZW07XG5cblx0XHRcdC8vIGluaXRpYWwgaG92ZXJcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHR0aGlzLm92ZXIgPSB0cnVlO1xuXG5cdFx0XHQvLyBmaWxsIGRyb3Bkb3duIHdpdGggY29ycmVjdCBDU1MgcnVsZXNcblx0XHRcdHRoaXMuZmlsbFJ1bGVzKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHQvLyBjb250ZW50IGVkaXRhYmxlXG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJywgdHJ1ZSk7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50LnN0eWxlLm91dGxpbmUgPSAnbm9uZSc7XG5cblx0XHRcdGlmKHRoaXMuY29tcHV0ZWRTdHlsZS5kaXNwbGF5ID09PSAnaW5saW5lJykge1xuXHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLWlubGluZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbmxpbmUnKTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHR1bnNldDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmKHRoaXMuc2VsZWN0ZWRSdWxlKSB7XG5cdFx0XHRcdHRoaXMuZXhpdFJ1bGVNb2RlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInLCAnaG92ZXItaW5uZXInLCAnaG92ZXItcGFkZGluZycsICdob3Zlci1tYXJnaW4nLCAnaW4tY29tbWFuZCcpO1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScpO1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudC5zdHlsZS5vdXRsaW5lID0gJyc7XG5cblx0XHRcdHRoaXMub3ZlciA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVySW5uZXIgPSBmYWxzZTtcblx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHRcdHRoaXMub3Zlck1hcmdpbiA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyQ29tbWFuZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG51bGw7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBGdW5jdGlvbnMgcmVsYXRlZCB0byBydWxlLWJhc2VkIGVkaXRpbmdcblx0XHQgKi9cblxuXHRcdGVudGVyUnVsZU1vZGU6IGZ1bmN0aW9uKGNzc1J1bGUpIHtcblxuXHRcdFx0dmFyIGdob3N0cyA9IHRoaXMuZ2hvc3RzO1xuXG5cdFx0XHR0aGlzLnNlbGVjdGVkUnVsZSA9IGNzc1J1bGU7XG5cdFx0XHR0aGlzLnRpdGxlQm94LmNsYXNzTGlzdC5hZGQoJ3J1bGUnKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuekluZGV4ID0gMTAwMDI7XG5cblx0XHRcdCQodGhpcy5zZWxlY3RlZFJ1bGUuc2VsZWN0b3JUZXh0KS5ub3QodGhpcy5jdXJyZW50RWxlbWVudCkubm90KCcub3ZlcmxheSwgLm92ZXJsYXkgKicpLmVhY2goZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIGdob3N0ID0gbmV3IEdob3N0KHRoaXMpO1xuXHRcdFx0XHRnaG9zdC5zeW5jKCk7XG5cdFx0XHRcdGdob3N0cy5wdXNoKGdob3N0KTtcblxuXHRcdFx0fSk7XG5cblx0XHR9LFxuXG5cdFx0ZXhpdFJ1bGVNb2RlOiBmdW5jdGlvbigpIHtcblx0XHRcdFxuXHRcdFx0JCgnc3Bhbi5zZWxlY3RlZCcsIHRoaXMudGl0bGVCb3gpLmh0bWwoJ2lubGluZSBzdHlsZScpO1xuXHRcdFx0dGhpcy50aXRsZUJveC5jbGFzc0xpc3QucmVtb3ZlKCdydWxlJyk7XG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnN0eWxlLnpJbmRleCA9ICcnO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRoaXMuZ2hvc3RzW2ldLmRlc3Ryb3koKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZWxlY3RlZFJ1bGUgPSBudWxsO1xuXHRcdFx0dGhpcy5naG9zdHMgPSBbXTtcblxuXHRcdH0sXG5cblx0XHRmaWxsUnVsZXM6IGZ1bmN0aW9uKHRyYWNrZWRFbGVtZW50KSB7XG5cblx0XHRcdHZhciByZXNvbHZlZCA9IFN0eWxlUGFyc2VyLnJlc29sdmUodHJhY2tlZEVsZW1lbnQpO1xuXHRcdFx0dGhpcy5tYXRjaGVkUnVsZXMgPSByZXNvbHZlZDtcblxuXHRcdFx0dGhpcy50aXRsZURyb3Bkb3duLmVtcHR5KCk7XG5cdFx0XHQkKCc8bGk+aW5saW5lIHN0eWxlPC9saT4nKS5hcHBlbmRUbyh0aGlzLnRpdGxlRHJvcGRvd24pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNvbHZlZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQkKCc8bGk+JyArIHJlc29sdmVkW2ldLnNlbGVjdG9yVGV4dCArICc8L2xpPicpXG5cdFx0XHRcdFx0LmRhdGEoJ2Nzc1J1bGUnLCByZXNvbHZlZFtpXSlcblx0XHRcdFx0XHQuYXBwZW5kVG8odGhpcy50aXRsZURyb3Bkb3duKTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRzZWxlY3RSdWxlOiBmdW5jdGlvbihjc3NQcm9wZXJ0eSkge1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMubWF0Y2hlZFJ1bGVzW2ldLnN0eWxlW2Nzc1Byb3BlcnR5XSkge1xuXHRcdFx0XHRcdHRoaXMudGl0bGVEcm9wZG93bi5maW5kKCdsaTplcSgnICsgKGkrMSkgKyAnKScpLmNsaWNrKCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMudGl0bGVEcm9wZG93bi5maW5kKCdsaTplcSgxKScpLmNsaWNrKCk7XG5cblx0XHR9LFxuXG5cdFx0ZGVzZWxlY3RSdWxlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuZXhpdFJ1bGVNb2RlKCk7XG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogRnVuY3Rpb25zIHJlbGF0ZWQgdG8gZ2hvc3RzXG5cdFx0ICovXG5cblx0XHR1cGRhdGVHaG9zdHM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoIXRoaXMuZ2hvc3RzKSByZXR1cm47XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRoaXMuZ2hvc3RzW2ldLnN5bmMoKTtcblx0XHRcdH1cdFx0XG5cdFx0fSxcblxuXHRcdGNyZWF0ZVZpc3VhbGl6YXRpb25MaW5lczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmKCF0aGlzLnZMaW5lWCkge1xuXHRcdFx0XHR0aGlzLnZMaW5lWCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5jbGFzc05hbWUgPSAndmxpbmUteCc7XG5cdFx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVgpO1xuXG5cdFx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENhcHRpb24uY2xhc3NOYW1lID0gJ2NhcHRpb24nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWENhcHRpb24pO1xuXG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5jbGFzc05hbWUgPSAnY3Jvc3NiYXInO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWENyb3NzQmFyKTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIXRoaXMudkxpbmVZKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHRoaXMudkxpbmVZLmNsYXNzTmFtZSA9ICd2bGluZS15Jztcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWSk7XG5cblx0XHRcdFx0dGhpcy52TGluZVlDYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5jbGFzc05hbWUgPSAnY2FwdGlvbic7XG5cdFx0XHRcdHRoaXMudkxpbmVZLmFwcGVuZENoaWxkKHRoaXMudkxpbmVZQ2FwdGlvbik7XG5cblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLmNsYXNzTmFtZSA9ICdjcm9zc2Jhcic7XG5cdFx0XHRcdHRoaXMudkxpbmVZLmFwcGVuZENoaWxkKHRoaXMudkxpbmVZQ3Jvc3NCYXIpO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHZpc3VhbGl6ZVJlbGF0aW9uVG9XaW5kb3c6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgY3VycmVudEVsZW1lbnQgPSB0aGlzLmN1cnJlbnRFbGVtZW50O1xuXG5cdFx0XHR0aGlzLmNyZWF0ZVZpc3VhbGl6YXRpb25MaW5lcygpO1xuXG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRUb3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikpICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLmxlZnQgPSAwICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWENhcHRpb24uaW5uZXJIVE1MID0gY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmxlZnQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpKSArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSAwICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uaW5uZXJIVE1MID0gY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHR9LFxuXG5cdFx0dmlzdWFsaXplUmVsYXRpb25UbzogZnVuY3Rpb24ocmVsYXRlZEVsZW1lbnQpIHtcblxuXHRcdFx0dmFyIGN1cnJlbnRFbGVtZW50ID0gdGhpcy5jdXJyZW50RWxlbWVudCwgdG9wLCBsZWZ0O1xuXG5cdFx0XHR0aGlzLmNyZWF0ZVZpc3VhbGl6YXRpb25MaW5lcygpO1xuXG5cdFx0XHR2YXIgcmVSaWdodEVkZ2UgPSByZWxhdGVkRWxlbWVudC5vZmZzZXRMZWZ0ICsgcmVsYXRlZEVsZW1lbnQub2Zmc2V0V2lkdGg7XG5cdFx0XHR2YXIgY2VSaWdodEVkZ2UgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0ICsgY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XG5cdFx0XHR2YXIgcmVMZWZ0RWRnZSA9IHJlbGF0ZWRFbGVtZW50Lm9mZnNldExlZnQ7XG5cdFx0XHR2YXIgY2VMZWZ0RWRnZSA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldExlZnQ7XG5cblx0XHRcdHZhciByZUJvdHRvbUVkZ2UgPSByZWxhdGVkRWxlbWVudC5vZmZzZXRUb3AgKyByZWxhdGVkRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cdFx0XHR2YXIgY2VCb3R0b21FZGdlID0gY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wICsgY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXHRcdFx0dmFyIHJlVG9wRWRnZSA9IHJlbGF0ZWRFbGVtZW50Lm9mZnNldFRvcDtcblx0XHRcdHZhciBjZVRvcEVkZ2UgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRUb3A7XG5cdFx0XHRcblx0XHRcdC8vIGhvcml6b250YWwgY29ubmVjdGlvblxuXHRcdFx0aWYocmVSaWdodEVkZ2UgPCBjZUxlZnRFZGdlKSB7XG5cblx0XHRcdFx0dG9wID0gY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUudG9wID0gdG9wICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IHJlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSBjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENhcHRpb24uaW5uZXJIVE1MID0gY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdFx0aWYocmVCb3R0b21FZGdlIDwgdG9wKSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKGNlVG9wRWRnZSAtIHJlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0XHR9IGVsc2UgaWYodG9wIDwgcmVUb3BFZGdlKSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2UgaWYoY2VSaWdodEVkZ2UgPCByZUxlZnRFZGdlKSB7XG5cblx0XHRcdFx0dG9wID0gY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUudG9wID0gdG9wICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IGNlUmlnaHRFZGdlICsgJ3B4Jztcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSByZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENhcHRpb24uaW5uZXJIVE1MID0gcmVMZWZ0RWRnZSAtIGNlUmlnaHRFZGdlICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdFx0aWYocmVCb3R0b21FZGdlIDwgdG9wKSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMTAwJSc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdFx0fSBlbHNlIGlmKHRvcCA8IHJlVG9wRWRnZSkge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzEwMCUnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAocmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB2ZXJ0aWNhbCBjb25uZWN0aW9uXG5cdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCBjZVRvcEVkZ2UpIHtcblxuXHRcdFx0XHRsZWZ0ID0gY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSByZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5oZWlnaHQgPSBjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uaW5uZXJIVE1MID0gY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdFx0aWYocmVSaWdodEVkZ2UgPCBsZWZ0KSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0XHR9IGVsc2UgaWYobGVmdCA8IHJlTGVmdEVkZ2UpIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAocmVMZWZ0RWRnZSAtIGNlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZihjZUJvdHRvbUVkZ2UgPCByZVRvcEVkZ2UpIHtcblxuXHRcdFx0XHRsZWZ0ID0gY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSBjZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5oZWlnaHQgPSByZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uaW5uZXJIVE1MID0gcmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdFx0aWYocmVSaWdodEVkZ2UgPCBsZWZ0KSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcxMDAlJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdFx0fSBlbHNlIGlmKGxlZnQgPCByZUxlZnRFZGdlKSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnRvcCA9ICcxMDAlJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChyZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDA7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fSk7XG5cblx0Ly8gQ3JlYXRlIE92ZXJsYXkgKHNpbmdsZXRvbilcblx0T3ZlcmxheSA9IG5ldyBPdmVybGF5KCk7XG5cblx0Ly8gSW5pdGlhbGl6ZSBvdmVybGF5XG5cdE92ZXJsYXkuaW5pdCgpO1xuXG5cblx0Ly8gbWFrZSBhbGwgZWxlbWVudHMgb24gcGFnZSBpbnNwZWN0YWJsZVxuXHQkKCdib2R5ICo6bm90KC5vdmVybGF5LC5vdmVybGF5ICosLm92ZXJsYXktdGl0bGUsLm92ZXJsYXktdGl0bGUgKiknKS5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oKSB7XG5cblx0XHRPdmVybGF5LmhvdmVyRWxlbWVudCA9IHRoaXM7XG5cblx0XHQvLyBpZiB3ZSdyZSBob2xkaW5nIHNoaWZ0IGFuZCBob3ZlciBhbm90aGVyIGVsZW1lbnQsIHNob3cgZ3VpZGVzXG5cdFx0aWYoT3ZlcmxheS5jb21tYW5kUHJlc3NlZCAmJlxuXHRcdFx0T3ZlcmxheS5jdXJyZW50RWxlbWVudCAmJlxuXHRcdFx0dGhpcyAhPT0gT3ZlcmxheS5jdXJyZW50RWxlbWVudCAmJlxuXHRcdFx0ISQuY29udGFpbnModGhpcywgT3ZlcmxheS5jdXJyZW50RWxlbWVudCkgJiZcblx0XHRcdCEkLmNvbnRhaW5zKE92ZXJsYXkuY3VycmVudEVsZW1lbnQsIHRoaXMpXG5cdFx0KSB7XG5cdFx0XHRPdmVybGF5LnZpc3VhbGl6ZVJlbGF0aW9uVG8odGhpcyk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaW4gbm9ybWFsIG1vZGUsIGRvbid0IGFjdGl2YXRlIHRoZSBob3ZlciBnaG9zdCB3aGVuIGludGVyYWN0aW5nIG9yIG92ZXIgdGhlIGN1cnJlbnQgZWxcblx0XHRpZihPdmVybGF5LmhvdmVyR2hvc3QuY3VycmVudEVsZW1lbnQgPT09IHRoaXMgfHwgT3ZlcmxheS5pbnRlcmFjdGluZyB8fCBPdmVybGF5Lm92ZXIpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRPdmVybGF5LmhvdmVyR2hvc3Quc3luYyh0aGlzKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblxuXHR9KTtcblxuXHQvLyBtYWtlIGFsbCBlbGVtZW50cyBvbiBwYWdlIGluc3BlY3RhYmxlXG5cdCQoJ2JvZHkgKjpub3QoLm92ZXJsYXksLm92ZXJsYXkgKiwub3ZlcmxheS10aXRsZSwub3ZlcmxheS10aXRsZSAqKScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYoT3ZlcmxheS5jdXJyZW50RWxlbWVudCA9PT0gdGhpcylcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdGlmKE92ZXJsYXkuY3VycmVudEVsZW1lbnQpIHtcblx0XHRcdE92ZXJsYXkudW5zZXQoKTtcblx0XHR9XG5cblx0XHQvL2hpZGUgaG92ZXIgZ2hvc3Rcblx0XHRPdmVybGF5LmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdC8vIHN5bmMgb24gdGhlIGVsZW1lbnRcblx0XHRPdmVybGF5LnN5bmModGhpcyk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0fSk7XG5cblx0Ly8kKCd1bCcpLnNvcnRhYmxlKCk7XG5cdCQoJ2xpIHN0cm9uZycpLmNsaWNrKCk7XG5cblxufSkoKTtcblxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=