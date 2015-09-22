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
				//titleDropdown.find('li:eq(0)').click();
			});

			$(document).on('keyup', function(e) {
				if(e.which !== 16) return;
				that.shiftPressed = false;

				// re-process as if we've just hovered
				if(that.currentHandle) {
					//$(that.currentHandle).trigger('mouseenter');
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
			this.currentElement.setAttribute('contentEditable', true);
			this.currentElement.style.outline = 'none';

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
	$('#testbox').click();


})();



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiU3R5bGVQYXJzZXIuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBHaG9zdCA9IGZ1bmN0aW9uKGVsZW0pIHtcblxuXHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gdGhpcy5jcmVhdGUoKTtcblx0dGhpcy5jdXJyZW50RWxlbWVudCA9IGVsZW07XG5cbn07XG5cbiQuZXh0ZW5kKEdob3N0LnByb3RvdHlwZSwge1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgZ2hvc3QgPSAkKCc8ZGl2IGNsYXNzPVwib3ZlcmxheSBnaG9zdFwiPjwvZGl2PicpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXG5cdFx0Z2hvc3QuYXBwZW5kVG8oJ2JvZHknKTtcblx0XHRyZXR1cm4gZ2hvc3RbMF07XG5cblx0fSxcblxuXHRkZXN0cm95OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdH0sXG5cblx0c3luYzogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0aWYobmV3RWxlbSkge1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG5ld0VsZW07XG5cdFx0fVxuXG5cdFx0dmFyIG92ZXJsYXlFbGVtZW50ID0gdGhpcy5vdmVybGF5RWxlbWVudDtcblx0XHR2YXIgZWxlbSA9ICQodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cdFx0dmFyIG9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHR2YXIgY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHR2YXIgaW5uZXJXaWR0aCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUud2lkdGgpO1xuXHRcdHZhciBpbm5lckhlaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUuaGVpZ2h0KTtcblxuXHRcdHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdHZhciBwYWRkaW5nVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nVG9wKTtcblx0XHR2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuXHRcdHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0KTtcblx0XHR2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Ub3ApO1xuXHRcdHZhciBtYXJnaW5SaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luUmlnaHQpO1xuXHRcdHZhciBtYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHR2YXIgb3V0ZXJXaWR0aCA9IGlubmVyV2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodDtcblx0XHR2YXIgb3V0ZXJIZWlnaHQgPSBpbm5lckhlaWdodCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuXG5cdFx0Ly8gcGxhY2UgYW5kIHJlc2l6ZSBvdmVybGF5XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUud2lkdGggPSBpbm5lcldpZHRoICsgJ3B4Jztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgKyBwYWRkaW5nVG9wKSArICdweCknO1xuXG5cdFx0Ly8gbW9kaWZ5IHBhZGRpbmcgYm94XG5cblx0XHQvLyBsZWZ0XG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBwYWRkaW5nTGVmdCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyByaWdodFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IHBhZGRpbmdSaWdodCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0cmlnaHQ6IC1wYWRkaW5nUmlnaHRcblx0XHR9KTtcblxuXHRcdC8vIHRvcFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy50b3AnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBwYWRkaW5nVG9wLFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcFxuXHRcdH0pO1xuXG5cdFx0Ly8gYm90dG9tXG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmJvdHRvbScsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHBhZGRpbmdCb3R0b20sXG5cdFx0XHRib3R0b206IC1wYWRkaW5nQm90dG9tXG5cdFx0fSk7XG5cblx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXG5cdFx0Ly8gbGVmdFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBtYXJnaW5MZWZ0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdGxlZnQ6IC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gcmlnaHRcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG1hcmdpblJpZ2h0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdHJpZ2h0OiAtKHBhZGRpbmdSaWdodCArIG1hcmdpblJpZ2h0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gdG9wXG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4udG9wJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdGhlaWdodDogbWFyZ2luVG9wLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyBib3R0b21cblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5ib3R0b20nLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBvdXRlcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBtYXJnaW5Cb3R0b20sXG5cdFx0XHRib3R0b206IC0ocGFkZGluZ0JvdHRvbSArIG1hcmdpbkJvdHRvbSksXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3BlY2lmaWNpdHkgb2YgQ1NTIHNlbGVjdG9yc1xuICogaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1zZWxlY3RvcnMvI3NwZWNpZmljaXR5XG4gKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogIC0gc2VsZWN0b3I6IHRoZSBpbnB1dFxuICogIC0gc3BlY2lmaWNpdHk6IGUuZy4gMCwxLDAsMFxuICogIC0gcGFydHM6IGFycmF5IHdpdGggZGV0YWlscyBhYm91dCBlYWNoIHBhcnQgb2YgdGhlIHNlbGVjdG9yIHRoYXQgY291bnRzIHRvd2FyZHMgdGhlIHNwZWNpZmljaXR5XG4gKi9cbnZhciBTUEVDSUZJQ0lUWSA9IChmdW5jdGlvbigpIHtcblx0dmFyIGNhbGN1bGF0ZSxcblx0XHRjYWxjdWxhdGVTaW5nbGU7XG5cblx0Y2FsY3VsYXRlID0gZnVuY3Rpb24oaW5wdXQpIHtcblx0XHR2YXIgc2VsZWN0b3JzLFxuXHRcdFx0c2VsZWN0b3IsXG5cdFx0XHRpLFxuXHRcdFx0bGVuLFxuXHRcdFx0cmVzdWx0cyA9IFtdO1xuXG5cdFx0Ly8gU2VwYXJhdGUgaW5wdXQgYnkgY29tbWFzXG5cdFx0c2VsZWN0b3JzID0gaW5wdXQuc3BsaXQoJywnKTtcblxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHNlbGVjdG9ycy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0c2VsZWN0b3IgPSBzZWxlY3RvcnNbaV07XG5cdFx0XHRpZiAoc2VsZWN0b3IubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRyZXN1bHRzLnB1c2goY2FsY3VsYXRlU2luZ2xlKHNlbGVjdG9yKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH07XG5cblx0Ly8gQ2FsY3VsYXRlIHRoZSBzcGVjaWZpY2l0eSBmb3IgYSBzZWxlY3RvciBieSBkaXZpZGluZyBpdCBpbnRvIHNpbXBsZSBzZWxlY3RvcnMgYW5kIGNvdW50aW5nIHRoZW1cblx0Y2FsY3VsYXRlU2luZ2xlID0gZnVuY3Rpb24oaW5wdXQpIHtcblx0XHR2YXIgc2VsZWN0b3IgPSBpbnB1dCxcblx0XHRcdGZpbmRNYXRjaCxcblx0XHRcdHR5cGVDb3VudCA9IHtcblx0XHRcdFx0J2EnOiAwLFxuXHRcdFx0XHQnYic6IDAsXG5cdFx0XHRcdCdjJzogMFxuXHRcdFx0fSxcblx0XHRcdHBhcnRzID0gW10sXG5cdFx0XHQvLyBUaGUgZm9sbG93aW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMgYXNzdW1lIHRoYXQgc2VsZWN0b3JzIG1hdGNoaW5nIHRoZSBwcmVjZWRpbmcgcmVndWxhciBleHByZXNzaW9ucyBoYXZlIGJlZW4gcmVtb3ZlZFxuXHRcdFx0YXR0cmlidXRlUmVnZXggPSAvKFxcW1teXFxdXStcXF0pL2csXG5cdFx0XHRpZFJlZ2V4ID0gLygjW15cXHNcXCs+flxcLlxcWzpdKykvZyxcblx0XHRcdGNsYXNzUmVnZXggPSAvKFxcLlteXFxzXFwrPn5cXC5cXFs6XSspL2csXG5cdFx0XHRwc2V1ZG9FbGVtZW50UmVnZXggPSAvKDo6W15cXHNcXCs+flxcLlxcWzpdK3w6Zmlyc3QtbGluZXw6Zmlyc3QtbGV0dGVyfDpiZWZvcmV8OmFmdGVyKS9naSxcblx0XHRcdC8vIEEgcmVnZXggZm9yIHBzZXVkbyBjbGFzc2VzIHdpdGggYnJhY2tldHMgLSA6bnRoLWNoaWxkKCksIDpudGgtbGFzdC1jaGlsZCgpLCA6bnRoLW9mLXR5cGUoKSwgOm50aC1sYXN0LXR5cGUoKSwgOmxhbmcoKVxuXHRcdFx0cHNldWRvQ2xhc3NXaXRoQnJhY2tldHNSZWdleCA9IC8oOltcXHctXStcXChbXlxcKV0qXFwpKS9naSxcblx0XHRcdC8vIEEgcmVnZXggZm9yIG90aGVyIHBzZXVkbyBjbGFzc2VzLCB3aGljaCBkb24ndCBoYXZlIGJyYWNrZXRzXG5cdFx0XHRwc2V1ZG9DbGFzc1JlZ2V4ID0gLyg6W15cXHNcXCs+flxcLlxcWzpdKykvZyxcblx0XHRcdGVsZW1lbnRSZWdleCA9IC8oW15cXHNcXCs+flxcLlxcWzpdKykvZztcblxuXHRcdC8vIEZpbmQgbWF0Y2hlcyBmb3IgYSByZWd1bGFyIGV4cHJlc3Npb24gaW4gYSBzdHJpbmcgYW5kIHB1c2ggdGhlaXIgZGV0YWlscyB0byBwYXJ0c1xuXHRcdC8vIFR5cGUgaXMgXCJhXCIgZm9yIElEcywgXCJiXCIgZm9yIGNsYXNzZXMsIGF0dHJpYnV0ZXMgYW5kIHBzZXVkby1jbGFzc2VzIGFuZCBcImNcIiBmb3IgZWxlbWVudHMgYW5kIHBzZXVkby1lbGVtZW50c1xuXHRcdGZpbmRNYXRjaCA9IGZ1bmN0aW9uKHJlZ2V4LCB0eXBlKSB7XG5cdFx0XHR2YXIgbWF0Y2hlcywgaSwgbGVuLCBtYXRjaCwgaW5kZXgsIGxlbmd0aDtcblx0XHRcdGlmIChyZWdleC50ZXN0KHNlbGVjdG9yKSkge1xuXHRcdFx0XHRtYXRjaGVzID0gc2VsZWN0b3IubWF0Y2gocmVnZXgpO1xuXHRcdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSBtYXRjaGVzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG5cdFx0XHRcdFx0dHlwZUNvdW50W3R5cGVdICs9IDE7XG5cdFx0XHRcdFx0bWF0Y2ggPSBtYXRjaGVzW2ldO1xuXHRcdFx0XHRcdGluZGV4ID0gc2VsZWN0b3IuaW5kZXhPZihtYXRjaCk7XG5cdFx0XHRcdFx0bGVuZ3RoID0gbWF0Y2gubGVuZ3RoO1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goe1xuXHRcdFx0XHRcdFx0c2VsZWN0b3I6IG1hdGNoLFxuXHRcdFx0XHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdFx0XHRcdGluZGV4OiBpbmRleCxcblx0XHRcdFx0XHRcdGxlbmd0aDogbGVuZ3RoXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ly8gUmVwbGFjZSB0aGlzIHNpbXBsZSBzZWxlY3RvciB3aXRoIHdoaXRlc3BhY2Ugc28gaXQgd29uJ3QgYmUgY291bnRlZCBpbiBmdXJ0aGVyIHNpbXBsZSBzZWxlY3RvcnNcblx0XHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UobWF0Y2gsIEFycmF5KGxlbmd0aCArIDEpLmpvaW4oJyAnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gUmVtb3ZlIHRoZSBuZWdhdGlvbiBwc3VlZG8tY2xhc3MgKDpub3QpIGJ1dCBsZWF2ZSBpdHMgYXJndW1lbnQgYmVjYXVzZSBzcGVjaWZpY2l0eSBpcyBjYWxjdWxhdGVkIG9uIGl0cyBhcmd1bWVudFxuXHRcdChmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZWdleCA9IC86bm90XFwoKFteXFwpXSopXFwpL2c7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKHJlZ2V4LCAnICAgICAkMSAnKTtcblx0XHRcdH1cblx0XHR9KCkpO1xuXG5cdFx0Ly8gUmVtb3ZlIGFueXRoaW5nIGFmdGVyIGEgbGVmdCBicmFjZSBpbiBjYXNlIGEgdXNlciBoYXMgcGFzdGVkIGluIGEgcnVsZSwgbm90IGp1c3QgYSBzZWxlY3RvclxuXHRcdChmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZWdleCA9IC97W15dKi9nbSxcblx0XHRcdFx0bWF0Y2hlcywgaSwgbGVuLCBtYXRjaDtcblx0XHRcdGlmIChyZWdleC50ZXN0KHNlbGVjdG9yKSkge1xuXHRcdFx0XHRtYXRjaGVzID0gc2VsZWN0b3IubWF0Y2gocmVnZXgpO1xuXHRcdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSBtYXRjaGVzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG5cdFx0XHRcdFx0bWF0Y2ggPSBtYXRjaGVzW2ldO1xuXHRcdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShtYXRjaCwgQXJyYXkobWF0Y2gubGVuZ3RoICsgMSkuam9pbignICcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0oKSk7XG5cblx0XHQvLyBBZGQgYXR0cmlidXRlIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGIpXG5cdFx0ZmluZE1hdGNoKGF0dHJpYnV0ZVJlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gQWRkIElEIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGEpXG5cdFx0ZmluZE1hdGNoKGlkUmVnZXgsICdhJyk7XG5cblx0XHQvLyBBZGQgY2xhc3Mgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2goY2xhc3NSZWdleCwgJ2InKTtcblxuXHRcdC8vIEFkZCBwc2V1ZG8tZWxlbWVudCBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBjKVxuXHRcdGZpbmRNYXRjaChwc2V1ZG9FbGVtZW50UmVnZXgsICdjJyk7XG5cblx0XHQvLyBBZGQgcHNldWRvLWNsYXNzIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGIpXG5cdFx0ZmluZE1hdGNoKHBzZXVkb0NsYXNzV2l0aEJyYWNrZXRzUmVnZXgsICdiJyk7XG5cdFx0ZmluZE1hdGNoKHBzZXVkb0NsYXNzUmVnZXgsICdiJyk7XG5cblx0XHQvLyBSZW1vdmUgdW5pdmVyc2FsIHNlbGVjdG9yIGFuZCBzZXBhcmF0b3IgY2hhcmFjdGVyc1xuXHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvW1xcKlxcc1xcKz5+XS9nLCAnICcpO1xuXG5cdFx0Ly8gUmVtb3ZlIGFueSBzdHJheSBkb3RzIG9yIGhhc2hlcyB3aGljaCBhcmVuJ3QgYXR0YWNoZWQgdG8gd29yZHNcblx0XHQvLyBUaGVzZSBtYXkgYmUgcHJlc2VudCBpZiB0aGUgdXNlciBpcyBsaXZlLWVkaXRpbmcgdGhpcyBzZWxlY3RvclxuXHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvWyNcXC5dL2csICcgJyk7XG5cblx0XHQvLyBUaGUgb25seSB0aGluZ3MgbGVmdCBzaG91bGQgYmUgZWxlbWVudCBzZWxlY3RvcnMgKHR5cGUgYylcblx0XHRmaW5kTWF0Y2goZWxlbWVudFJlZ2V4LCAnYycpO1xuXG5cdFx0Ly8gT3JkZXIgdGhlIHBhcnRzIGluIHRoZSBvcmRlciB0aGV5IGFwcGVhciBpbiB0aGUgb3JpZ2luYWwgc2VsZWN0b3Jcblx0XHQvLyBUaGlzIGlzIG5lYXRlciBmb3IgZXh0ZXJuYWwgYXBwcyB0byBkZWFsIHdpdGhcblx0XHRwYXJ0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRcdHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcblx0XHR9KTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzZWxlY3RvcjogaW5wdXQsXG5cdFx0XHRzcGVjaWZpY2l0eTogJzAsJyArIHR5cGVDb3VudC5hLnRvU3RyaW5nKCkgKyAnLCcgKyB0eXBlQ291bnQuYi50b1N0cmluZygpICsgJywnICsgdHlwZUNvdW50LmMudG9TdHJpbmcoKSxcblx0XHRcdHBhcnRzOiBwYXJ0c1xuXHRcdH07XG5cdH07XG5cblx0cmV0dXJuIHtcblx0XHRjYWxjdWxhdGU6IGNhbGN1bGF0ZVxuXHR9O1xufSgpKTtcblxuXG4oZnVuY3Rpb24oKSB7XG5cblx0dmFyIFN0eWxlUGFyc2VyID0ge307XG5cblx0dmFyIHJ1bGVzID0ge307XG5cdHZhciBzaGVldHMgPSBkb2N1bWVudC5zdHlsZVNoZWV0cztcblxuXHR2YXIgc2hlZXQsIHJ1bGU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2hlZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XG5cdFx0c2hlZXQgPSBzaGVldHNbaV07XG5cdFx0aWYoIXNoZWV0LmNzc1J1bGVzKSBjb250aW51ZTtcblxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgc2hlZXQuY3NzUnVsZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdHJ1bGUgPSBzaGVldC5jc3NSdWxlc1tqXTtcblx0XHRcdHJ1bGVzW3J1bGUuc2VsZWN0b3JUZXh0XSA9IHJ1bGU7XG5cdFx0fVxuXHR9XG5cblx0U3R5bGVQYXJzZXIucmVzb2x2ZSA9IGZ1bmN0aW9uKHRyYWNrZWRFbGVtZW50KSB7XG5cblx0XHR2YXIgbWF0Y2hlZFJ1bGVzID0gd2luZG93LmdldE1hdGNoZWRDU1NSdWxlcyh0cmFja2VkRWxlbWVudCkgfHwgW107XG5cdFx0dmFyIHJ1bGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGVkUnVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHJ1bGVzLnB1c2goW21hdGNoZWRSdWxlc1tpXSwgcGFyc2VJbnQoU1BFQ0lGSUNJVFkuY2FsY3VsYXRlKG1hdGNoZWRSdWxlc1tpXS5zZWxlY3RvclRleHQpWzBdLnNwZWNpZmljaXR5LnJlcGxhY2UoL1xcLC9nLCAnJyksIDEwKSArIDAuMDEgKiBpXSk7XG5cdFx0fVxuXG5cblxuXHRcdHJ1bGVzID0gcnVsZXNcblx0XHRcdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRcdFx0cmV0dXJuIGJbMV0gLSBhWzFdO1xuXHRcdFx0fSlcblx0XHRcdC5tYXAoZnVuY3Rpb24oYSkge1xuXHRcdFx0XHRyZXR1cm4gYVswXTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJ1bGVzO1xuXG5cdH07XG5cblx0d2luZG93LlN0eWxlUGFyc2VyID0gU3R5bGVQYXJzZXI7XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdHZhciBPdmVybGF5ID0gZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gbnVsbDsgLy8gdGhlIGFjdHVhbCBvdmVybGF5IGRpdlxuXHRcdHRoaXMuY3VycmVudEVsZW1lbnQgPSBudWxsOyAvLyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGVsZW1lbnRcblx0XHR0aGlzLnNlbGVjdGVkUnVsZSA9IG51bGw7IC8vIHdoZW4gZGVmaW5lZCwgd2UncmUgaW4gcnVsZSBtb2RlXG5cdFx0dGhpcy5naG9zdHMgPSBbXTsgLy8gZ2hvc3RzIGFyZSBlbGVtZW50cyBjcmVhdGVkIHRvIHZpc3VhbGl6ZSBob3ZlcmluZywgb3Igd2hlbiB3ZSBlZGl0IGJhc2VkIG9uIHJ1bGVcblx0XHR0aGlzLmhvdmVyR2hvc3QgPSBuZXcgR2hvc3QoKTsgLy8gdGhlIGhvdmVyIGdob3N0XG5cdFx0dGhpcy5vdmVyID0gZmFsc2U7IC8vIG9uIHdoZXRoZXIgd2UncmUgY3VycmVubHkgaG92ZXJpbmcgYSBjZXJ0YWluIHBhcnQgb2YgdGhlIG92ZXJsYXlcblx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdHRoaXMub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLmludGVyYWN0aW5nID0gZmFsc2U7IC8vIHdoZXRoZXIgd2UncmUgY3VycmVudGx5IGludGVyYWN0aW5nIHdpdGggdGhlIGVsZW1lbnRcblxuXHRcdC8vIGluaXRpYWxpemVcblx0XHR0aGlzLmNyZWF0ZSgpO1xuXG5cdH07XG5cblx0JC5leHRlbmQoT3ZlcmxheS5wcm90b3R5cGUsIHtcblxuXHRcdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuY3JlYXRlT3ZlcmxheSgpO1xuXHRcdFx0dGhpcy5jcmVhdGVUaXRsZSgpO1xuXG5cdFx0fSxcblxuXHRcdGNyZWF0ZU92ZXJsYXk6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gJCgnPGRpdiBpZD1cIm92ZXJsYXlcIiBjbGFzcz1cIm92ZXJsYXlcIj48L2Rpdj4nKVswXTtcblxuXHRcdFx0Ly90aGlzLmd1aWRlTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHQvL3RoaXMuZ3VpZGVSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1yaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0Ly90aGlzLmd1aWRlQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0Ly90aGlzLmd1aWRlVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5ndWlkZU1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1yaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiZ3VpZGUgZ3VpZGUtcGFkZGluZy10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdFxuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBib3R0b20gaGFuZGxlLXNpemVcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIGhlaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBib3R0b20gaGFuZGxlLXBhZGRpbmdcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIHBhZGRpbmctYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1tYXJnaW5cIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIG1hcmdpbi1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlU2l6ZVJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtc2l6ZVwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2Ugd2lkdGhcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy1yaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgcmlnaHQgaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHRvcCBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSB0b3AgaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgbGVmdCBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGxlZnQgaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblxuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGggPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXdpZHRoXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLWhlaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1tYXJnaW4gbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1tYXJnaW4gdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Cb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVTaXplUmlnaHQpXG5cdFx0XHRcdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHRoYXQub3ZlclNpemVIYW5kbGUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlU2l6ZVJpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvbldpZHRoLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5zZWxlY3RSdWxlKCd3aWR0aCcpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVNpemVCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uSGVpZ2h0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdoZWlnaHQnKTsgfVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSBudWxsO1xuXHRcdFx0XHRcdHRoYXQub3ZlclNpemVIYW5kbGUgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdFx0XHR2YXIgcmVtb3ZlU3BhbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVTaXplUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uV2lkdGguY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVNpemVCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uSGVpZ2h0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVx0XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGlmKCF0aGF0LmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0XHRyZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCF0aGF0Ll9fY2F0Y2hNb3VzZVVwKSB7XG5cdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gJChkb2N1bWVudCkub25lKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGlmKCF0aGF0Lm92ZXJTaXplSGFuZGxlKSByZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVQYWRkaW5nVG9wKVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlUGFkZGluZ0xlZnQpXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVQYWRkaW5nUmlnaHQpXG5cdFx0XHRcdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHRoYXQub3ZlclBhZGRpbmdIYW5kbGUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1yaWdodCcpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVBhZGRpbmdCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ0JvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1ib3R0b20nKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nTGVmdFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1sZWZ0Jyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1RvcFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nVG9wLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLXRvcCcpOyB9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IG51bGw7XG5cdFx0XHRcdFx0dGhhdC5vdmVyUGFkZGluZ0hhbmRsZSA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0XHRcdHZhciByZW1vdmVTcGFuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVBhZGRpbmdSaWdodFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVBhZGRpbmdCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ0JvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ0xlZnRbMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ0xlZnQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVBhZGRpbmdUb3BbMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ1RvcC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYoIXRoYXQuX19jYXRjaE1vdXNlVXApIHtcblx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSAkKGRvY3VtZW50KS5vbmUoJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0aWYoIXRoYXQub3ZlclBhZGRpbmdIYW5kbGUpIHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9IG51bGw7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlTWFyZ2luVG9wKVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlTWFyZ2luTGVmdClcblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZU1hcmdpblJpZ2h0KVxuXHRcdFx0XHQuaG92ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gdGhpcztcblx0XHRcdFx0XHR0aGF0Lm92ZXJNYXJnaW5IYW5kbGUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlTWFyZ2luUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LnNlbGVjdFJ1bGUoJ21hcmdpbi1yaWdodCcpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpbkJvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5Cb3R0b20uY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnNlbGVjdFJ1bGUoJ21hcmdpbi1ib3R0b20nKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5MZWZ0WzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkxlZnQuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LnNlbGVjdFJ1bGUoJ21hcmdpbi1sZWZ0Jyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlTWFyZ2luVG9wWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpblRvcC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLXRvcCcpOyB9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IG51bGw7XG5cdFx0XHRcdFx0dGhhdC5vdmVyTWFyZ2luSGFuZGxlID0gZmFsc2U7XG5cblx0XHRcdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRcdFx0dmFyIHJlbW92ZVNwYW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZU1hcmdpbkJvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5Cb3R0b20uY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZU1hcmdpbkxlZnRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luVG9wWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpblRvcC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYoIXRoYXQuX19jYXRjaE1vdXNlVXApIHtcblx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSAkKGRvY3VtZW50KS5vbmUoJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0aWYoIXRoYXQub3Zlck1hcmdpbkhhbmRsZSkgcmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gbnVsbDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblxuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblxuXHRcdH0sXG5cblx0XHRjcmVhdGVUaXRsZTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMudGl0bGVCb3ggPSAkKCc8ZGl2IGNsYXNzPVwib3ZlcmxheS10aXRsZVwiPjxkaXYgY2xhc3M9XCJ0aXRsZS1ydWxlXCI+PHNwYW4gY2xhc3M9XCJzZWxlY3RlZFwiPmlubGluZSBzdHlsZTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJ0b2dnbGVcIj7ilr48L3NwYW4+PHVsIGNsYXNzPVwiZHJvcGRvd25cIj48bGk+aW5saW5lIHN0eWxlPC9saT48L3VsPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXRsZS1wcm9wb3J0aW9uc1wiPjEwMCB4IDEwMDwvZGl2PjwvZGl2PicpXG5cdFx0XHRcdC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KVswXTtcblxuXHRcdFx0dGhpcy50aXRsZVByb3BvcnRpb25zID0gJCgnLnRpdGxlLXByb3BvcnRpb25zJywgdGhpcy50aXRsZUJveClbMF07XG5cdFx0XHR0aGlzLnRpdGxlRHJvcGRvd24gPSAkKCcuZHJvcGRvd24nLCB0aGlzLnRpdGxlQm94KTtcblxuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIEV2ZW50cyAmIEJlaGF2aW91ciBpbml0aWFsaXphdGlvblxuXHRcdCAqL1xuXG5cdFx0aW5pdDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuaW5pdFRpdGxlQm94KCk7XG5cdFx0XHR0aGlzLmluaXRIb3ZlcigpO1xuXHRcdFx0dGhpcy5pbml0UnVsZVNob3J0Y3V0KCk7XG5cdFx0XHR0aGlzLmluaXREaW1lbnNpb25TaG9ydGN1dCgpO1xuXHRcdFx0dGhpcy5pbml0SGFuZGxlcygpO1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHQkKGRvY3VtZW50KS5vbigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSA9PT0gMjcpIHtcblx0XHRcdFx0XHR0aGF0LnVuc2V0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdGluaXRUaXRsZUJveDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIGluaXRpYWxpemUgdGl0bGUgYm94IGJlaGF2aW91clxuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR2YXIgdGl0bGVCb3ggPSB0aGlzLnRpdGxlQm94O1xuXHRcdFx0dmFyIHRpdGxlRHJvcGRvd24gPSB0aGlzLnRpdGxlRHJvcGRvd247XG5cblx0XHRcdCQoJ3NwYW4nLCB0aXRsZUJveCkuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoJy5kcm9wZG93bicsIHRpdGxlQm94KS50b2dnbGUoKTtcblx0XHRcdH0pO1xuXG5cblx0XHRcdHRpdGxlRHJvcGRvd24ub24oJ2NsaWNrJywgJ2xpJywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dGl0bGVEcm9wZG93bi5oaWRlKCk7XG5cdFx0XHRcdCQoJy5zZWxlY3RlZCcsIHRpdGxlQm94KS5odG1sKHRoaXMuaW5uZXJIVE1MKTtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBjc3NSdWxlID0gJCh0aGlzKS5kYXRhKCdjc3NSdWxlJyk7XG5cdFx0XHRcdGlmKGNzc1J1bGUpIHtcblx0XHRcdFx0XHR0aGF0LmVudGVyUnVsZU1vZGUoY3NzUnVsZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhhdC5leGl0UnVsZU1vZGUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRwcm9jZXNzQ29tbWFuZE92ZXJMb2dpYzogZnVuY3Rpb24oZSkge1xuXG5cdFx0XHR2YXIgZXh0cmFNYXJnaW4gPSAxMDtcblx0XHRcdHZhciBvZmZzZXQgPSB0aGlzLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHRcdC8vIGNvbW1hbmQgb3Zlci9vdXRcblxuXHRcdFx0aWYoXG5cdFx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gdGhpcy5tYXJnaW5Ub3AgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCArIGV4dHJhTWFyZ2luKSAmJlxuXHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0ICsgdGhpcy5tYXJnaW5Cb3R0b20gKyBleHRyYU1hcmdpbilcblx0XHRcdCkge1xuXG5cdFx0XHRcdGlmKCF0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5jb21tYW5kT3ZlciA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy52aXN1YWxpemVSZWxhdGlvblRvV2luZG93KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZih0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5jb21tYW5kT3ZlciA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRwcm9jZXNzT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHRcdHZhciBleHRyYU1hcmdpbiA9IDEwO1xuXHRcdFx0dmFyIG9mZnNldCA9IHRoaXMuY3VycmVudE9mZnNldDtcblxuXHRcdFx0Ly8gZ2VuZXJhbCBvdmVyL291dFxuXG5cdFx0XHRpZihcblx0XHRcdFx0ZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0IC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSB0aGlzLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0ICsgZXh0cmFNYXJnaW4pICYmXG5cdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgKyB0aGlzLm1hcmdpbkJvdHRvbSArIGV4dHJhTWFyZ2luKVxuXHRcdFx0KSB7XG5cblx0XHRcdFx0aWYoIXRoaXMub3Zlcikge1xuXHRcdFx0XHRcdHRoaXMub3ZlciA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0aWYodGhpcy5vdmVyICYmICF0aGlzLmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicpO1xuXHRcdFx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcdFx0XHRcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIG92ZXIgaW5uZXIgYm94XG5cblx0XHRcdGlmKCF0aGlzLmludGVyYWN0aW5nKSB7XG5cblx0XHRcdFx0aWYoXG5cdFx0XHRcdFx0KChlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgKyB0aGlzLnBhZGRpbmdMZWZ0ICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCArIHRoaXMucGFkZGluZ1RvcCAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCAtIHRoaXMucGFkZGluZ1JpZ2h0KSAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCAtIHRoaXMucGFkZGluZ0JvdHRvbSkpIHx8XG5cdFx0XHRcdFx0dGhpcy5vdmVyU2l6ZUhhbmRsZSkgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyUGFkZGluZ0hhbmRsZSAmJiAvLyBjYW5ub3QgYmUgb3ZlciBwYWRkaW5nIGhhbmRsZVxuXHRcdFx0XHRcdCF0aGlzLm92ZXJNYXJnaW5IYW5kbGVcblx0XHRcdFx0KSB7XG5cblx0XHRcdFx0XHRpZighdGhpcy5vdmVySW5uZXIpIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5uZXInKTtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcklubmVyID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGlmKHRoaXMub3ZlcklubmVyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3Zlci1pbm5lcicpO1x0XHRcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIG92ZXIgcGFkZGluZyBib3hcblxuXHRcdFx0aWYoIXRoaXMuaW50ZXJhY3RpbmcpIHtcblxuXHRcdFx0XHRpZihcblx0XHRcdFx0XHQoKGUucGFnZVggPiBvZmZzZXQubGVmdCAmJiBlLnBhZ2VZID4gb2Zmc2V0LnRvcCAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCkgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQpICYmXG5cdFx0XHRcdFx0XHQhdGhpcy5vdmVySW5uZXIpIHx8XG5cdFx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZ0hhbmRsZSkgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyU2l6ZUhhbmRsZSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJNYXJnaW5IYW5kbGVcblx0XHRcdFx0KSB7XG5cblx0XHRcdFx0XHRpZighdGhpcy5vdmVyUGFkZGluZykge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1wYWRkaW5nJyk7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmcpIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItcGFkZGluZycpO1x0XHRcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIG92ZXIgbWFyZ2luIGJveFxuXG5cdFx0XHRpZighdGhpcy5pbnRlcmFjdGluZykge1xuXG5cdFx0XHRcdGlmKFxuXHRcdFx0XHRcdCgoZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0ICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAtIHRoaXMubWFyZ2luVG9wICYmIFxuXHRcdFx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIHRoaXMubWFyZ2luUmlnaHQpICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0ICsgdGhpcy5tYXJnaW5Cb3R0b20pICYmXG5cdFx0XHRcdFx0XHQhdGhpcy5vdmVySW5uZXIgJiZcblx0XHRcdFx0XHRcdCF0aGlzLm92ZXJQYWRkaW5nKSB8fFxuXHRcdFx0XHRcdFx0XHR0aGlzLm92ZXJNYXJnaW5IYW5kbGUpICYmXG5cdFx0XHRcdFx0IXRoaXMub3ZlclBhZGRpbmdIYW5kbGUgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyU2l6ZUhhbmRsZVxuXHRcdFx0XHQpIHtcblxuXHRcdFx0XHRcdGlmKCF0aGlzLm92ZXJNYXJnaW4pIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItbWFyZ2luJyk7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJNYXJnaW4gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJNYXJnaW4gPSBmYWxzZTtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItbWFyZ2luJyk7XHRcdFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRpbml0SG92ZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRcdCQoJ2JvZHknKS5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRcdHRoYXQuX19sYXN0TW91c2VNb3ZlRXZlbnQgPSBlO1xuXHRcdFx0XHRpZighdGhhdC5jdXJyZW50RWxlbWVudCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKHRoYXQuY29tbWFuZFByZXNzZWQpIHtcblx0XHRcdFx0XHR0aGF0LnByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljKGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoYXQucHJvY2Vzc092ZXJMb2dpYyhlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRpbml0UnVsZVNob3J0Y3V0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRpdGxlRHJvcGRvd24gPSB0aGlzLnRpdGxlRHJvcGRvd247XG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRcdCQoZG9jdW1lbnQpLm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRpZihlLndoaWNoICE9PSAxNikgcmV0dXJuO1xuXHRcdFx0XHR0aGF0Ll9fcHJldlNlbGVjdGVkUnVsZSA9IHRoYXQuc2VsZWN0ZWRSdWxlO1xuXHRcdFx0XHR0aGF0LnNoaWZ0UHJlc3NlZCA9IHRydWU7XG5cdFx0XHRcdC8vdGl0bGVEcm9wZG93bi5maW5kKCdsaTplcSgwKScpLmNsaWNrKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRpZihlLndoaWNoICE9PSAxNikgcmV0dXJuO1xuXHRcdFx0XHR0aGF0LnNoaWZ0UHJlc3NlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdC8vIHJlLXByb2Nlc3MgYXMgaWYgd2UndmUganVzdCBob3ZlcmVkXG5cdFx0XHRcdGlmKHRoYXQuY3VycmVudEhhbmRsZSkge1xuXHRcdFx0XHRcdC8vJCh0aGF0LmN1cnJlbnRIYW5kbGUpLnRyaWdnZXIoJ21vdXNlZW50ZXInKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRpbml0RGltZW5zaW9uU2hvcnRjdXQ6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRcdCQoZG9jdW1lbnQpLm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRpZihlLndoaWNoID09PSA5MSkge1xuXHRcdFx0XHRcdHRoYXQuZW50ZXJEaW1lbnNpb25Nb2RlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQkKGRvY3VtZW50KS5vbigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUud2hpY2ggPT09IDkxKSB7XG5cdFx0XHRcdFx0dGhhdC5leGl0RGltZW5zaW9uTW9kZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRlbnRlckRpbWVuc2lvbk1vZGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmNvbW1hbmRQcmVzc2VkID0gdHJ1ZTtcblx0XHRcdHRoaXMuY29tbWFuZE92ZXIgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdob3Zlci1pbm5lcicsICdob3Zlci1tYXJnaW4nLCAnaG92ZXItcGFkZGluZycpO1xuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpbi1jb21tYW5kJyk7XG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXHRcdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMDtcblxuXHRcdFx0aWYodGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudClcblx0XHRcdFx0dGhpcy5wcm9jZXNzQ29tbWFuZE92ZXJMb2dpYyh0aGlzLl9fbGFzdE1vdXNlTW92ZUV2ZW50KTtcblxuXHRcdFx0aWYodGhpcy5ob3ZlckVsZW1lbnQgIT09IHRoaXMuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdFx0ISQuY29udGFpbnModGhpcy5ob3ZlckVsZW1lbnQsIHRoaXMuY3VycmVudEVsZW1lbnQpICYmXG5cdFx0XHRcdCEkLmNvbnRhaW5zKHRoaXMuY3VycmVudEVsZW1lbnQsIHRoaXMuaG92ZXJFbGVtZW50KVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRoaXMudmlzdWFsaXplUmVsYXRpb25Ubyh0aGlzLmhvdmVyRWxlbWVudCk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0ZXhpdERpbWVuc2lvbk1vZGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmNvbW1hbmRQcmVzc2VkID0gZmFsc2U7XG5cblx0XHRcdGlmKHRoaXMub3ZlcikgdGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0aWYodGhpcy5vdmVySW5uZXIpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5uZXInKTtcblx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmcpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItcGFkZGluZycpO1xuXHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luKSB0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLW1hcmdpbicpO1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2luLWNvbW1hbmQnKTtcblxuXHRcdFx0Ly8gZWRnZSBjYXNlOiB1c2VyIGhvbGRzIGNvbW1hbmQsIG1vdmVzIG91dCwgcmVsZWFzZXMgY29tbWFuZFxuXHRcdFx0aWYodGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudClcblx0XHRcdFx0dGhpcy5wcm9jZXNzT3ZlckxvZ2ljKHRoaXMuX19sYXN0TW91c2VNb3ZlRXZlbnQpO1xuXG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuXHRcdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMTtcblxuXHRcdFx0aWYodGhpcy52TGluZVgpIHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdFx0aWYodGhpcy52TGluZVkpIHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAwO1xuXG5cdFx0fSxcblxuXHRcdGlzVmlzaWJsZTogZnVuY3Rpb24obm9kZSwgcmVjdHMpIHtcblxuXHRcdFx0dmFyIG9mZnNldFRvcCA9IHJlY3RzLnRvcCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wO1xuXHRcdFx0dmFyIG9mZnNldExlZnQgPSByZWN0cy50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcblxuXHRcdFx0aWYob2Zmc2V0VG9wID4gd2luZG93LmlubmVySGVpZ2h0IHx8XG5cdFx0XHRcdG9mZnNldExlZnQgPiB3aW5kb3cuaW5uZXJXaWR0aCB8fFxuXHRcdFx0XHRvZmZzZXRUb3AgKyByZWN0cy5oZWlnaHQgPCAwIHx8XG5cdFx0XHRcdG9mZnNldExlZnQgKyByZWN0cy53aWR0aCA8IDApIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdH0sXG5cblx0XHRjYWxjdWxhdGVTbmFwQXJlYXM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR2YXIgc3RhcnQgPSBkb2N1bWVudC5ib2R5O1xuXHRcdFx0dmFyIGNhbmRpZGF0ZXMgPSBbXTtcblxuXHRcdFx0dmFyIGlzRWxpZ2libGUgPSBmdW5jdGlvbihub2RlLCByZWN0cykge1xuXG5cdFx0XHRcdHZhciB3aWR0aCA9IHJlY3RzLndpZHRoO1xuXHRcdFx0XHR2YXIgaGVpZ2h0ID0gcmVjdHMuaGVpZ2h0O1xuXG5cdFx0XHRcdGlmKHdpZHRoIDwgMTAwICYmIGhlaWdodCA8IDEwMCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKG5vZGUuaWQgPT09ICdvdmVybGF5JyB8fFxuXHRcdFx0XHRcdG5vZGUuY2xhc3NOYW1lID09PSAnb3ZlcmxheS10aXRsZScgfHxcblx0XHRcdFx0XHRub2RlID09PSB0aGF0LmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIXRoYXQuaXNWaXNpYmxlKG5vZGUsIHJlY3RzKSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0XHR9O1xuXG5cdFx0XHR2YXIgcmVjdXJzZSA9IGZ1bmN0aW9uKG5vZGUpIHtcblxuXHRcdFx0XHQvLyBubyBjaGlsZHJlbj8gZXhpdFxuXHRcdFx0XHRpZighbm9kZS5jaGlsZHJlbikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBjYW5kaWRhdGUsIHJlY3RzO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjYW5kaWRhdGUgPSBub2RlLmNoaWxkcmVuW2ldO1xuXHRcdFx0XHRcdHJlY3RzID0gY2FuZGlkYXRlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRcdGlmKGlzRWxpZ2libGUoY2FuZGlkYXRlLCByZWN0cykpIHtcblx0XHRcdFx0XHRcdGNhbmRpZGF0ZXMucHVzaChbY2FuZGlkYXRlLCByZWN0c10pO1xuXHRcdFx0XHRcdFx0cmVjdXJzZShjYW5kaWRhdGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXG5cdFx0XHRyZWN1cnNlKHN0YXJ0KTtcblx0XHRcdHRoaXMuY3VycmVudFNuYXBUYXJnZXRzID0gY2FuZGlkYXRlcztcblxuXHRcdH0sXG5cblx0XHRjYWxjdWxhdGVTbmFwOiBmdW5jdGlvbihjdXJyZW50VmFsdWUsIGF4aXMsIGFkZCkge1xuXG5cdFx0XHQvLyB0aGlzIHBhcnQgaXMgc3RpbGwgc29tZXdoYXQgYnJva2VuLlxuXHRcdFx0cmV0dXJuIGN1cnJlbnRWYWx1ZTtcbi8qXG5cdFx0XHR2YXIgb2Zmc2V0ID0gdGhpcy5jdXJyZW50T2Zmc2V0O1xuXHRcdFx0b2Zmc2V0LmxlZnQgPSBwYXJzZUludChvZmZzZXQubGVmdCk7XG5cdFx0XHR2YXIgdGFyZ2V0cyA9IHRoaXMuY3VycmVudFNuYXBUYXJnZXRzO1xuXG5cblx0XHRcdGlmKGF4aXMgPT09IFwieVwiKSB7XG5cblx0XHRcdFx0dmFyIHRhcmdldDtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0c1tpXTtcblxuXHRcdFx0XHRcdGlmKE1hdGguYWJzKHRhcmdldFsxXS5ib3R0b20gLSAob2Zmc2V0LnRvcCArIGFkZCArIGN1cnJlbnRWYWx1ZSkpIDwgMTApIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IHBhcnNlSW50KHRhcmdldFsxXS5ib3R0b20pIC0gb2Zmc2V0LnRvcCAtIGFkZCAtIDM7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZihNYXRoLmFicyh0YXJnZXRbMV0udG9wIC0gKG9mZnNldC50b3AgKyBhZGQgKyBjdXJyZW50VmFsdWUpKSA8IDEwKSB7XG5cdFx0XHRcdFx0XHRjdXJyZW50VmFsdWUgPSBwYXJzZUludCh0YXJnZXRbMV0udG9wKSAtIG9mZnNldC50b3AgLSBhZGQgLSAzO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0dmFyIHRhcmdldDtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dGFyZ2V0ID0gdGFyZ2V0c1tpXTtcblxuXHRcdFx0XHRcdGlmKE1hdGguYWJzKHRhcmdldFsxXS5yaWdodCAtIChvZmZzZXQubGVmdCArIGFkZCArIGN1cnJlbnRWYWx1ZSkpIDwgMTApIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IHBhcnNlSW50KHRhcmdldFsxXS5yaWdodCkgLSBvZmZzZXQubGVmdCAtIGFkZCAtIDM7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZihNYXRoLmFicyh0YXJnZXRbMV0ubGVmdCAtIChvZmZzZXQubGVmdCArIGFkZCArIGN1cnJlbnRWYWx1ZSkpIDwgMTApIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IHBhcnNlSW50KHRhcmdldFsxXS5sZWZ0KSAtIG9mZnNldC5sZWZ0IC0gYWRkIC0gMztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBjdXJyZW50VmFsdWU7XG4qL1xuXHRcdH0sXG5cblx0XHRpbml0SGFuZGxlczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHZhciBoYW5kbGVPZmZzZXQgPSAzO1xuXG5cdFx0XHR2YXIgYXBwbHlQcmVjaXNpb24gPSBmdW5jdGlvbihvcmlnLCBjdXJyZW50KSB7XG5cdFx0XHRcdGlmKHRoYXQuc2hpZnRQcmVzc2VkKSB7XG5cdFx0XHRcdFx0dmFyIGRlbHRhID0gb3JpZyAtIGN1cnJlbnQ7XG5cdFx0XHRcdFx0dmFyIHByZWNpc2lvbkRlbHRhID0gZGVsdGEgLyA0O1xuXHRcdFx0XHRcdHJldHVybiBjdXJyZW50ICsgTWF0aC5yb3VuZChkZWx0YSAtIHByZWNpc2lvbkRlbHRhKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gY3VycmVudDtcblx0XHRcdH07XG5cblx0XHRcdC8vIHJlc2l6ZSBoYW5kbGVzXG5cblx0XHRcdChmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgc3RhcnQgPSBmdW5jdGlvbigpIHsgdGhhdC5pbnRlcmFjdGluZyA9ICdzaXplJzsgdGhpcy5fX3ggPSAkKHRoaXMpLmRyYWdnYWJsZSgnb3B0aW9uJywgJ2F4aXMnKSA9PT0gJ3gnOyB9O1xuXHRcdFx0XHR2YXIgZHJhZyA9IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdHZhciB4ID0gdGhpcy5fX3g7XG5cdFx0XHRcdFx0dmFyIHByb3AgPSB4ID8gJ2xlZnQnIDogJ3RvcCc7XG5cblx0XHRcdFx0XHQvLyBhcHBseSBwcmVjaXNpb24gZHJhZ1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uW3Byb3BdID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbltwcm9wXSwgdWkucG9zaXRpb25bcHJvcF0pO1xuXG5cdFx0XHRcdFx0Ly8gY2FsY3VsYXRlIG5vcm1hbCBoYW5kbGUgcG9zaXRpb25cblx0XHRcdFx0XHR1aS5wb3NpdGlvbltwcm9wXSA9IE1hdGgubWF4KDAgLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uW3Byb3BdKTtcblxuXHRcdFx0XHRcdC8vIGFwcGx5IHBvc3NpYmxlIHNuYXBcblx0XHRcdFx0XHR1aS5wb3NpdGlvbltwcm9wXSA9IHRoYXQuY2FsY3VsYXRlU25hcCh1aS5wb3NpdGlvbltwcm9wXSwgeCA/ICd4JyA6ICd5JywgeCA/IHRoYXQucGFkZGluZ0xlZnQgKyB0aGF0LnBhZGRpbmdSaWdodCA6IHRoYXQucGFkZGluZ1RvcCArIHRoYXQucGFkZGluZ0JvdHRvbSk7XG5cblx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGVbeCA/ICd3aWR0aCcgOiAnaGVpZ2h0J10gPSAodWkucG9zaXRpb25bcHJvcF0gKyBoYW5kbGVPZmZzZXQpICsgJ3B4Jztcblx0XHRcdFx0XHR0aGF0LnN5bmMobnVsbCwgdHJ1ZSk7XG5cdFx0XHRcdFx0dGhhdC51cGRhdGVHaG9zdHMoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0dmFyIHN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvL3RoaXMucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUuaGVpZ2h0ID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS53aWR0aCA9ICcnO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUuYm90dG9tID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS50b3AgPSAnJztcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmxlZnQgPSAnJztcblx0XHRcdFx0XHR0aGlzLnN0eWxlLnJpZ2h0ID0gJyc7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlU2l6ZUJvdHRvbS5kcmFnZ2FibGUoeyBkaXN0YW5jZTogMCwgYXhpczogJ3knLCBjdXJzb3I6ICdzLXJlc2l6ZScsIHN0YXJ0OiBzdGFydCwgZHJhZzogZHJhZywgc3RvcDogc3RvcCB9KTtcblx0XHRcdFx0dGhhdC5oYW5kbGVTaXplUmlnaHQuZHJhZ2dhYmxlKHsgZGlzdGFuY2U6IDAsIGF4aXM6ICd4JywgY3Vyc29yOiAnZS1yZXNpemUnLCBzdGFydDogc3RhcnQsIGRyYWc6IGRyYWcsIHN0b3A6IHN0b3AgfSk7XG5cblx0XHRcdH0pKCk7XG5cblxuXHRcdFx0Ly8gcmVzaXplIHBhZGRpbmdcblxuXHRcdFx0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZHJhZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuc3luYyhudWxsLCB0cnVlKTtcblx0XHRcdFx0XHR0aGF0LnVwZGF0ZUdob3N0cygpO1x0XHRcdFx0XHRcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdCb3R0b20uZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y3Vyc29yOiAncy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJIZWlnaHQgPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLmhlaWdodCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nQm90dG9tID0gdGhhdC5wYWRkaW5nQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdwYWRkaW5nJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi50b3AsIHVpLnBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBNYXRoLm1heCh0aGlzLmN1cklubmVySGVpZ2h0IC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gdGhhdC5jYWxjdWxhdGVTbmFwKHVpLnBvc2l0aW9uLnRvcCwgJ3knLCB0aGF0LnBhZGRpbmdUb3ApO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdCb3R0b20gKyAoKHVpLnBvc2l0aW9uLnRvcCkgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLnRvcCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nUmlnaHQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnZS1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJXaWR0aCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkud2lkdGgoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ1JpZ2h0ID0gdGhhdC5wYWRkaW5nUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi5sZWZ0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCh0aGlzLmN1cklubmVyV2lkdGggLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IHRoYXQuY2FsY3VsYXRlU25hcCh1aS5wb3NpdGlvbi5sZWZ0LCAneCcsIHRoYXQucGFkZGluZ0xlZnQpO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdSaWdodCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ1JpZ2h0ICsgKCh1aS5wb3NpdGlvbi5sZWZ0KSAtIHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nVG9wLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ24tcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC50b3A7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdUb3AgPSB0aGF0LnBhZGRpbmdUb3A7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC50b3AgLSB0aGlzLmN1ck9mZnNldCk7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IHRoYXQuc2hpZnRQcmVzc2VkID8gTWF0aC5yb3VuZChkZWx0YSAvIDQpIDogZGVsdGE7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUucGFkZGluZ1RvcCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ1RvcCAtIGRlbHRhKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlUGFkZGluZ0xlZnQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMSxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAndy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VyT2Zmc2V0ID0gdWkub2Zmc2V0LmxlZnQ7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdMZWZ0ID0gdGhhdC5wYWRkaW5nTGVmdDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAncGFkZGluZyc7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC5sZWZ0IC0gdGhpcy5jdXJPZmZzZXQpO1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSB0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdMZWZ0ID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJQYWRkaW5nTGVmdCAtIGRlbHRhKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1x0XHRcdFx0XG5cblx0XHRcdH0pKCk7XG5cblxuXHRcdFx0Ly8gcmVzaXplIG1hcmdpblxuXG5cdFx0XHQoZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIHN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcblx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHZhciBkcmFnID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5zeW5jKG51bGwsIHRydWUpO1xuXHRcdFx0XHRcdHRoYXQudXBkYXRlR2hvc3RzKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5Cb3R0b20uZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y3Vyc29yOiAncy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJIZWlnaHQgPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLmhlaWdodCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5Cb3R0b20gPSB0aGF0Lm1hcmdpbkJvdHRvbTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ0JvdHRvbSA9IHRoYXQucGFkZGluZ0JvdHRvbTtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi50b3AsIHVpLnBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBNYXRoLm1heCh0aGlzLmN1cklubmVySGVpZ2h0ICsgdGhpcy5jdXJQYWRkaW5nQm90dG9tIC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpbkJvdHRvbSA9IE1hdGgubWF4KDAsIHRoaXMuY3VyTWFyZ2luQm90dG9tICsgKHVpLnBvc2l0aW9uLnRvcCAtIHVpLm9yaWdpbmFsUG9zaXRpb24udG9wKSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpblJpZ2h0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ2UtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVyV2lkdGggPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLndpZHRoKCk7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpblJpZ2h0ID0gdGhhdC5tYXJnaW5SaWdodDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ1JpZ2h0ID0gdGhhdC5wYWRkaW5nUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBhcHBseVByZWNpc2lvbih1aS5vcmlnaW5hbFBvc2l0aW9uLmxlZnQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IE1hdGgubWF4KHRoaXMuY3VySW5uZXJXaWR0aCArIHRoaXMuY3VyUGFkZGluZ1JpZ2h0IC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5SaWdodCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyTWFyZ2luUmlnaHQgKyAodWkucG9zaXRpb24ubGVmdCAtIHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5MZWZ0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3ctcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC5sZWZ0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5MZWZ0ID0gdGhhdC5tYXJnaW5MZWZ0O1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdtYXJnaW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQubGVmdCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gdGhhdC5zaGlmdFByZXNzZWQgPyBNYXRoLnJvdW5kKGRlbHRhIC8gNCkgOiBkZWx0YTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5MZWZ0ID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5MZWZ0IC0gZGVsdGEpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5Ub3AuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneScsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnbi1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VyT2Zmc2V0ID0gdWkub2Zmc2V0LnRvcDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luVG9wID0gdGhhdC5tYXJnaW5Ub3A7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IC1oYW5kbGVPZmZzZXQ7XG5cdFx0XHRcdFx0XHR2YXIgZGVsdGEgPSAodWkub2Zmc2V0LnRvcCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gdGhhdC5zaGlmdFByZXNzZWQgPyBNYXRoLnJvdW5kKGRlbHRhIC8gNCkgOiBkZWx0YTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5Ub3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpblRvcCAtIGRlbHRhKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9KSgpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogQ29yZSBydW50aW1lIGZ1bmN0aW9uYWxpdHlcblx0XHQgKi9cblxuXHRcdHN5bmM6IGZ1bmN0aW9uKG5ld0VsZW0sIGR1cmluZ0ludGVyYWN0aW9uKSB7XG5cblx0XHRcdHZhciBjb21wdXRlZFN0eWxlID0gdGhpcy5jb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShuZXdFbGVtIHx8IHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHRpZihuZXdFbGVtKSB7XG5cdFx0XHRcdHRoaXMuc2V0KG5ld0VsZW0pO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLm92ZXJsYXlFbGVtZW50O1xuXHRcdFx0dmFyIGVsZW0gPSAkKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXHRcdFx0dmFyIG9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHRcdGlmKCFkdXJpbmdJbnRlcmFjdGlvbikge1xuXHRcdFx0XHR0aGlzLm9mZnNldFdpZHRoID0gdGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHRcdFx0dGhpcy5vZmZzZXRIZWlnaHQgPSB0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodDtcdFx0XHRcdFxuXHRcdFx0fVxuXG5cdFx0XHQvLyB3ZSBuZWVkIHRvIHN0b3JlIG91dGVyIGhlaWdodCwgYm90dG9tL3JpZ2h0IHBhZGRpbmcgYW5kIG1hcmdpbnMgZm9yIGhvdmVyIGRldGVjdGlvblxuXHRcdFx0dmFyIHBhZGRpbmdMZWZ0ID0gdGhpcy5wYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdFx0dmFyIHBhZGRpbmdUb3AgPSB0aGlzLnBhZGRpbmdUb3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdUb3ApO1xuXHRcdFx0dmFyIHBhZGRpbmdSaWdodCA9IHRoaXMucGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdFx0dmFyIHBhZGRpbmdCb3R0b20gPSB0aGlzLnBhZGRpbmdCb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG5cdFx0XHR2YXIgbWFyZ2luTGVmdCA9IHRoaXMubWFyZ2luTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luTGVmdCk7XG5cdFx0XHR2YXIgbWFyZ2luVG9wID0gdGhpcy5tYXJnaW5Ub3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblRvcCk7XG5cdFx0XHR2YXIgbWFyZ2luUmlnaHQgPSB0aGlzLm1hcmdpblJpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5SaWdodCk7XG5cdFx0XHR2YXIgbWFyZ2luQm90dG9tID0gdGhpcy5tYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHRcdHZhciBpbm5lcldpZHRoID0gdGhpcy5pbm5lcldpZHRoID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS53aWR0aCkgfHwgKHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodCk7XG5cdFx0XHR2YXIgaW5uZXJIZWlnaHQgPSB0aGlzLmlubmVySGVpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5oZWlnaHQpIHx8ICh0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tKTtcblxuXHRcdFx0dmFyIG91dGVyV2lkdGggPSB0aGlzLm91dGVyV2lkdGggPSBpbm5lcldpZHRoICsgcGFkZGluZ0xlZnQgKyBwYWRkaW5nUmlnaHQ7XG5cdFx0XHR2YXIgb3V0ZXJIZWlnaHQgPSB0aGlzLm91dGVySGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbTtcblxuXHRcdFx0Ly8gY2FsY3VsYXRlIGhhbmRsZSBzaXplXG5cdFx0XHR2YXIgaGFuZGxlU2l6ZVggPSAxNjtcblx0XHRcdHZhciBoYW5kbGVTaXplWSA9IDE2O1xuXHRcdFx0aWYoaW5uZXJXaWR0aCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWCA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWCAqIChpbm5lcldpZHRoIC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHRpZihpbm5lckhlaWdodCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWSA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWSAqIChpbm5lckhlaWdodCAvIDYwKSkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcyhoYW5kbGVTaXplWCwgaGFuZGxlU2l6ZVkpO1xuXG5cdFx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHRcdC8vIHBsYWNlIHRpdGxlIGJveFxuXHRcdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudGl0bGVCb3guc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgKChvdXRlcldpZHRoIC0gdGhpcy50aXRsZUJveC5vZmZzZXRXaWR0aCkgLyAyKSkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCAtIG1hcmdpblRvcCAtIDU1KSArICdweCknO1xuXHRcdFx0dGhpcy50aXRsZVByb3BvcnRpb25zLmlubmVySFRNTCA9IG91dGVyV2lkdGggKyAnIHggJyArIG91dGVySGVpZ2h0O1xuXG5cdFx0XHQvLyBtb2RpZnkgcGFkZGluZyBib3hcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0xlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLXBhZGRpbmdUb3ApICsgJ3B4KSBzY2FsZSgnICsgcGFkZGluZ0xlZnQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdSaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCkgKyAncHgsICcgKyAoLXBhZGRpbmdUb3ApICsgJ3B4KSBzY2FsZSgnICsgcGFkZGluZ1JpZ2h0ICsgJywgJyArIG91dGVySGVpZ2h0ICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgwKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBpbm5lcldpZHRoICsgJywgJyArIHBhZGRpbmdUb3AgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdCb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0KSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ0JvdHRvbSArICcpJztcblxuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAtcGFkZGluZ0xlZnQgKyAncHgsIDBweCknO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luUmlnaHQgPSAtcGFkZGluZ1JpZ2h0ICsgJ3B4JzsgLy8gVE9ETzogZmluZCBvdXQgd2h5IGNvbnZlcnRpbmcgdGhlc2UgdG8gdHJhbnNmb3JtcyBtZXNzZXMgd2l0aCBkcmFnZ2luZ1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgLXBhZGRpbmdUb3AgKyAncHgpJztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAgLXBhZGRpbmdCb3R0b20gKyAncHgnOyAgLy8gVE9ETzogZmluZCBvdXQgd2h5IGNvbnZlcnRpbmcgdGhlc2UgdG8gdHJhbnNmb3JtcyBtZXNzZXMgd2l0aCBkcmFnZ2luZ1xuXG5cdFx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkpICsgJ3B4LCAnICsgKC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkpICsgJ3B4KSBzY2FsZSgnICsgbWFyZ2luTGVmdCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCArIHBhZGRpbmdSaWdodCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5SaWdodCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpblRvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0ICsgcGFkZGluZ0JvdHRvbSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpbkJvdHRvbSArICcpJztcblxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5tYXJnaW5SaWdodCA9IC0ocGFkZGluZ1JpZ2h0ICsgbWFyZ2luUmlnaHQpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpblRvcCA9IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUubWFyZ2luQm90dG9tID0gLShwYWRkaW5nQm90dG9tICsgbWFyZ2luQm90dG9tKSArICdweCc7XG5cblx0XHRcdC8vIG9mZnNldCBtYWdpY1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5MZWZ0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5MZWZ0KSAvIDUpICsgKGhhbmRsZVNpemVZIC8gMikpIDogLShoYW5kbGVTaXplWSAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luTGVmdCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luTGVmdCkgLyA1KSAtIDggKyBoYW5kbGVTaXplWSkgOiAtOCkgKyAncHgnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luUmlnaHQpIC8gNSkgKyAoaGFuZGxlU2l6ZVkgLyAyKSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luUmlnaHQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIG1hcmdpblJpZ2h0KSAvIDUpIC0gOCArIGhhbmRsZVNpemVZKSA6IC04KSArICdweCc7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luVG9wIDwgMjAgPyAoLSgoKGhhbmRsZVNpemVYIC8gNCkgKiBtYXJnaW5Ub3ApIC8gNSkgKyAoaGFuZGxlU2l6ZVggLyAyKSkgOiAtKGhhbmRsZVNpemVYIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Ub3AgPCAyMCA/ICgoaGFuZGxlU2l6ZVgpICsgKC0oaGFuZGxlU2l6ZVgpICogKG1hcmdpblRvcCAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKG1hcmdpbkJvdHRvbSA8IDIwID8gKC0oKChoYW5kbGVTaXplWCAvIDQpICogbWFyZ2luQm90dG9tKSAvIDUpICsgKGhhbmRsZVNpemVYIC8gMikpIDogLShoYW5kbGVTaXplWCAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemVYKSArICgtKGhhbmRsZVNpemVYKSAqIChtYXJnaW5Cb3R0b20gLyAyMCkpIC0gOCkgOiAtMTEpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gKHBhZGRpbmdSaWdodCA8IDIwID8gKCsoKChoYW5kbGVTaXplWSAvIDQpICogcGFkZGluZ1JpZ2h0KSAvIDUpIC0gKGhhbmRsZVNpemVZICogMS41KSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5zdHlsZS5tYXJnaW5Ub3AgPSAocGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemVZIC8gNCkgKiBwYWRkaW5nUmlnaHQpIC8gNSkgLSAoaGFuZGxlU2l6ZVkgKiAxLjUpKSA6IC04KSArICdweCc7XG5cblx0XHRcdHRoaXMuaGFuZGxlU2l6ZUJvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKHBhZGRpbmdCb3R0b20gPCAyMCA/ICgrKCgoaGFuZGxlU2l6ZVggLyA0KSAqIHBhZGRpbmdCb3R0b20pIC8gNSkgLSAoaGFuZGxlU2l6ZVggKiAxLjUpKSA6IC0oaGFuZGxlU2l6ZVggLyAyKSkgKyAncHgnO1xuXHRcdFx0dGhpcy5jYXB0aW9uSGVpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAocGFkZGluZ0JvdHRvbSA8IDIwID8gKChoYW5kbGVTaXplWCAqIChwYWRkaW5nQm90dG9tIC8gMjApKSAtIGhhbmRsZVNpemVYICogMiArIGhhbmRsZVNpemVYIC0gOSkgOiAtMTApICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAtKGhhbmRsZVNpemVZIC8gMikgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gLShoYW5kbGVTaXplWSAvIDIpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplWCAvIDIpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplWCAvIDIpICsgJ3B4JztcblxuXHRcdFx0Ly8gZ3VpZGVzXG5cdFx0XHQvL3RoaXMuZ3VpZGVMZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1vZmZzZXQudG9wIC1wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdFx0Ly90aGlzLmd1aWRlTGVmdC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdFx0Ly90aGlzLmd1aWRlTGVmdC5zdHlsZS5sZWZ0ID0gICcwcHgnO1xuXG5cdFx0XHQvL3RoaXMuZ3VpZGVSaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtb2Zmc2V0LnRvcCAtcGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHRcdC8vdGhpcy5ndWlkZVJpZ2h0LnN0eWxlLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArICdweCc7XG5cdFx0XHQvL3RoaXMuZ3VpZGVSaWdodC5zdHlsZS5yaWdodCA9IC0xICsgJ3B4JztcblxuXHRcdFx0Ly90aGlzLmd1aWRlQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtb2Zmc2V0LmxlZnQgLXBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0XHQvL3RoaXMuZ3VpZGVCb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHQvL3RoaXMuZ3VpZGVCb3R0b20uc3R5bGUuYm90dG9tID0gLTEgKyAncHgnO1xuXG5cdFx0XHQvL3RoaXMuZ3VpZGVUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1vZmZzZXQubGVmdCAtcGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHRcdC8vdGhpcy5ndWlkZVRvcC5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHRcdC8vdGhpcy5ndWlkZVRvcC5zdHlsZS50b3AgPSAtMSArICdweCc7XG5cblx0XHRcdC8vIHBhZGRpbmcgZ3VpZGVzXG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLW9mZnNldC50b3AgLXBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0xlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5sZWZ0ID0gLXBhZGRpbmdMZWZ0ICsgJ3B4JztcblxuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtb2Zmc2V0LnRvcCAtcGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUucmlnaHQgPSAtcGFkZGluZ1JpZ2h0LTEgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLW9mZnNldC5sZWZ0IC1wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS5ib3R0b20gPSAtcGFkZGluZ0JvdHRvbS0xICsgJ3B4JztcblxuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1vZmZzZXQubGVmdCAtcGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudG9wID0gLXBhZGRpbmdUb3AtMSArICdweCc7XG5cblx0XHRcdC8vIG1hcmdpbiBndWlkZXNcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1vZmZzZXQudG9wIC1wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5MZWZ0LnN0eWxlLmxlZnQgPSAtcGFkZGluZ0xlZnQgLW1hcmdpbkxlZnQgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLW9mZnNldC50b3AgLXBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodC5zdHlsZS5yaWdodCA9IC1wYWRkaW5nUmlnaHQgLW1hcmdpblJpZ2h0IC0gMSArICdweCc7XG5cblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1vZmZzZXQubGVmdCAtcGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tLnN0eWxlLmJvdHRvbSA9IC1wYWRkaW5nQm90dG9tIC1tYXJnaW5Cb3R0b20gLTEgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtb2Zmc2V0LmxlZnQgLXBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdFx0dGhpcy5ndWlkZU1hcmdpblRvcC5zdHlsZS50b3AgPSAtcGFkZGluZ1RvcCAtbWFyZ2luVG9wIC0xICsgJ3B4JztcblxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcygpO1xuXHRcdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHRcdFx0dGhpcy5jdXJyZW50T2Zmc2V0ID0gb2Zmc2V0O1xuXG5cdFx0XHRpZighZHVyaW5nSW50ZXJhY3Rpb24pIHtcblx0XHRcdFx0dGhpcy5pbml0KCk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0cmVmcmVzaEhhbmRsZXM6IGZ1bmN0aW9uKGhhbmRsZVNpemVYLCBoYW5kbGVTaXplWSkge1xuXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplWSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0fSxcblxuXHRcdHJlZnJlc2hDYXB0aW9uczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBvZmZzZXQgPSB7IGxlZnQ6IHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCwgdG9wOiB0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCB9O1xuXG5cdFx0XHQvLyBjYXB0aW9uc1xuXHRcdFx0dmFyIGhpdHNSaWdodEVkZ2UsIGhpdHNMZWZ0RWRnZTtcblxuXHRcdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguaW5uZXJIVE1MID0gJzxzcGFuPndpZHRoOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCd3aWR0aCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguc3R5bGUucmlnaHQgPSAoaGl0c1JpZ2h0RWRnZSA/IDE2IDogLSh0aGlzLmNhcHRpb25XaWR0aC5vZmZzZXRXaWR0aCArIDEzKSkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPmhlaWdodDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnaGVpZ2h0Jyk7XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLWxlZnQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdMZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctcmlnaHQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdSaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy10b3A6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdUb3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctYm90dG9tOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdwYWRkaW5nQm90dG9tJyk7XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1sZWZ0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5MZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLXJpZ2h0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5SaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wLmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tdG9wOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5Ub3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWJvdHRvbTogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luQm90dG9tJyk7XG5cblx0XHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIDgwIDwgMCk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3RbaGl0c0xlZnRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LnN0eWxlLm1hcmdpblJpZ2h0ID0gKGhpdHNMZWZ0RWRnZSA/IHRoaXMucGFkZGluZ0xlZnQgLSB0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5vZmZzZXRXaWR0aC0xNiA6IHRoaXMucGFkZGluZ0xlZnQgKyAxNCkgKyAncHgnO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAoaGl0c1JpZ2h0RWRnZSA/IHRoaXMucGFkZGluZ1JpZ2h0IC0gdGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0Lm9mZnNldFdpZHRoLTE2IDogdGhpcy5wYWRkaW5nUmlnaHQgKyAxNCkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tLnN0eWxlLmJvdHRvbSA9IC0odGhpcy5wYWRkaW5nQm90dG9tICArIDI0KSArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wLnN0eWxlLnRvcCA9IC0odGhpcy5wYWRkaW5nVG9wICArIDI0KSArICdweCc7XG5cblx0XHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAtIDgwIDwgMCk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdFtoaXRzTGVmdEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5SaWdodCA9IHRoaXMucGFkZGluZ0xlZnQgKyB0aGlzLm1hcmdpbkxlZnQgKyAoaGl0c0xlZnRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpbkxlZnQub2Zmc2V0V2lkdGgtMTcgOiAxNCkgKyAncHgnO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IHRoaXMucGFkZGluZ1JpZ2h0ICsgdGhpcy5tYXJnaW5SaWdodCArIChoaXRzUmlnaHRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0Lm9mZnNldFdpZHRoLTE3IDogMTQpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLmJvdHRvbSA9IC10aGlzLm1hcmdpbkJvdHRvbSAtdGhpcy5wYWRkaW5nQm90dG9tIC0yNCArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUudG9wID0gLXRoaXMubWFyZ2luVG9wIC10aGlzLnBhZGRpbmdUb3AgLTI0ICsgJ3B4JztcblxuXHRcdH0sXG5cblx0XHRnZXRDYXB0aW9uUHJvcGVydHk6IGZ1bmN0aW9uKGNzc1Byb3BlcnR5KSB7XG5cblx0XHRcdC8vIGNoZWNrIGluIGlubGluZSBzdHlsZXNcblx0XHRcdGlmKHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRFbGVtZW50LnN0eWxlW2Nzc1Byb3BlcnR5XS5yZXBsYWNlKC8oZW18cHgpLywgJ+KAiTxzcGFuPiQxPC9zcGFuPicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjaGVjayBpbiBydWxlc1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkUnVsZXNbaV0uc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHJldFZhbCA9ICcnO1xuXG5cdFx0XHRpZihjc3NQcm9wZXJ0eS5pbmRleE9mKCdtYXJnaW4nKSA+IC0xIHx8IGNzc1Byb3BlcnR5LmluZGV4T2YoJ3BhZGRpbmcnKSA+IC0xKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXNbY3NzUHJvcGVydHldO1xuXHRcdFx0fSBlbHNlIGlmKGNzc1Byb3BlcnR5ID09PSAnaGVpZ2h0Jykge1xuXHRcdFx0XHRyZXRWYWwgPSB0aGlzLmlubmVySGVpZ2h0O1xuXHRcdFx0fSBlbHNlIGlmKGNzc1Byb3BlcnR5ID09PSAnd2lkdGgnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJXaWR0aDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaW1wbGljaXQgdmFsdWVcblx0XHRcdHJldHVybiAnKCcgKyByZXRWYWwgKyAn4oCJPHNwYW4+cHg8L3NwYW4+KSc7XG5cblx0XHR9LFxuXG5cdFx0c2V0OiBmdW5jdGlvbihuZXdFbGVtKSB7XG5cblx0XHRcdHRoaXMuY3VycmVudEVsZW1lbnQgPSBuZXdFbGVtO1xuXG5cdFx0XHQvLyBpbml0aWFsIGhvdmVyXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0dGhpcy5vdmVyID0gdHJ1ZTtcblxuXHRcdFx0Ly8gZmlsbCBkcm9wZG93biB3aXRoIGNvcnJlY3QgQ1NTIHJ1bGVzXG5cdFx0XHR0aGlzLmZpbGxSdWxlcyh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdFx0Ly8gY29udGVudCBlZGl0YWJsZVxuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScsIHRydWUpO1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudC5zdHlsZS5vdXRsaW5lID0gJ25vbmUnO1xuXG5cdFx0XHRpZih0aGlzLmNvbXB1dGVkU3R5bGUuZGlzcGxheSA9PT0gJ2lubGluZScpIHtcblx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbmxpbmUnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItaW5saW5lJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNvbXB1dGUgdGhlIGxpc3Qgb2YgdmlzaWJsZSBlbGVtZW50cyB0byBzbmFwIHRvXG5cdFx0XHR0aGlzLmNhbGN1bGF0ZVNuYXBBcmVhcygpO1xuXG5cdFx0fSxcblxuXHRcdHVuc2V0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUpIHtcblx0XHRcdFx0dGhpcy5leGl0UnVsZU1vZGUoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdob3Zlci1pbm5lcicsICdob3Zlci1wYWRkaW5nJywgJ2hvdmVyLW1hcmdpbicsICdpbi1jb21tYW5kJyk7XG5cblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdHRoaXMudGl0bGVCb3guc3R5bGUub3BhY2l0eSA9IDA7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJyk7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50LnN0eWxlLm91dGxpbmUgPSAnJztcblxuXHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJDb21tYW5kID0gZmFsc2U7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDtcblxuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIEZ1bmN0aW9ucyByZWxhdGVkIHRvIHJ1bGUtYmFzZWQgZWRpdGluZ1xuXHRcdCAqL1xuXG5cdFx0ZW50ZXJSdWxlTW9kZTogZnVuY3Rpb24oY3NzUnVsZSkge1xuXG5cdFx0XHR2YXIgZ2hvc3RzID0gdGhpcy5naG9zdHM7XG5cblx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gY3NzUnVsZTtcblx0XHRcdHRoaXMudGl0bGVCb3guY2xhc3NMaXN0LmFkZCgncnVsZScpO1xuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5zdHlsZS56SW5kZXggPSAxMDAwMjtcblxuXHRcdFx0JCh0aGlzLnNlbGVjdGVkUnVsZS5zZWxlY3RvclRleHQpLm5vdCh0aGlzLmN1cnJlbnRFbGVtZW50KS5ub3QoJy5vdmVybGF5LCAub3ZlcmxheSAqJykuZWFjaChmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgZ2hvc3QgPSBuZXcgR2hvc3QodGhpcyk7XG5cdFx0XHRcdGdob3N0LnN5bmMoKTtcblx0XHRcdFx0Z2hvc3RzLnB1c2goZ2hvc3QpO1xuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRleGl0UnVsZU1vZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XG5cdFx0XHQkKCdzcGFuLnNlbGVjdGVkJywgdGhpcy50aXRsZUJveCkuaHRtbCgnaW5saW5lIHN0eWxlJyk7XG5cdFx0XHR0aGlzLnRpdGxlQm94LmNsYXNzTGlzdC5yZW1vdmUoJ3J1bGUnKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuekluZGV4ID0gJyc7XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5naG9zdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dGhpcy5naG9zdHNbaV0uZGVzdHJveSgpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNlbGVjdGVkUnVsZSA9IG51bGw7XG5cdFx0XHR0aGlzLmdob3N0cyA9IFtdO1xuXG5cdFx0fSxcblxuXHRcdGZpbGxSdWxlczogZnVuY3Rpb24odHJhY2tlZEVsZW1lbnQpIHtcblxuXHRcdFx0dmFyIHJlc29sdmVkID0gU3R5bGVQYXJzZXIucmVzb2x2ZSh0cmFja2VkRWxlbWVudCk7XG5cdFx0XHR0aGlzLm1hdGNoZWRSdWxlcyA9IHJlc29sdmVkO1xuXG5cdFx0XHR0aGlzLnRpdGxlRHJvcGRvd24uZW1wdHkoKTtcblx0XHRcdCQoJzxsaT5pbmxpbmUgc3R5bGU8L2xpPicpLmFwcGVuZFRvKHRoaXMudGl0bGVEcm9wZG93bik7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc29sdmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdCQoJzxsaT4nICsgcmVzb2x2ZWRbaV0uc2VsZWN0b3JUZXh0ICsgJzwvbGk+Jylcblx0XHRcdFx0XHQuZGF0YSgnY3NzUnVsZScsIHJlc29sdmVkW2ldKVxuXHRcdFx0XHRcdC5hcHBlbmRUbyh0aGlzLnRpdGxlRHJvcGRvd24pO1xuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHNlbGVjdFJ1bGU6IGZ1bmN0aW9uKGNzc1Byb3BlcnR5KSB7XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXRjaGVkUnVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYodGhpcy5tYXRjaGVkUnVsZXNbaV0uc3R5bGVbY3NzUHJvcGVydHldKSB7XG5cdFx0XHRcdFx0dGhpcy50aXRsZURyb3Bkb3duLmZpbmQoJ2xpOmVxKCcgKyAoaSsxKSArICcpJykuY2xpY2soKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dGhpcy50aXRsZURyb3Bkb3duLmZpbmQoJ2xpOmVxKDEpJykuY2xpY2soKTtcblxuXHRcdH0sXG5cblx0XHRkZXNlbGVjdFJ1bGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5leGl0UnVsZU1vZGUoKTtcblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBGdW5jdGlvbnMgcmVsYXRlZCB0byBnaG9zdHNcblx0XHQgKi9cblxuXHRcdHVwZGF0ZUdob3N0czogZnVuY3Rpb24oKSB7XG5cdFx0XHRpZighdGhpcy5naG9zdHMpIHJldHVybjtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5naG9zdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dGhpcy5naG9zdHNbaV0uc3luYygpO1xuXHRcdFx0fVx0XHRcblx0XHR9LFxuXG5cdFx0Y3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYoIXRoaXMudkxpbmVYKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHRoaXMudkxpbmVYLmNsYXNzTmFtZSA9ICd2bGluZS14Jztcblx0XHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWCk7XG5cblx0XHRcdFx0dGhpcy52TGluZVhDYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5jbGFzc05hbWUgPSAnY2FwdGlvbic7XG5cdFx0XHRcdHRoaXMudkxpbmVYLmFwcGVuZENoaWxkKHRoaXMudkxpbmVYQ2FwdGlvbik7XG5cblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLmNsYXNzTmFtZSA9ICdjcm9zc2Jhcic7XG5cdFx0XHRcdHRoaXMudkxpbmVYLmFwcGVuZENoaWxkKHRoaXMudkxpbmVYQ3Jvc3NCYXIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighdGhpcy52TGluZVkpIHtcblx0XHRcdFx0dGhpcy52TGluZVkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0dGhpcy52TGluZVkuY2xhc3NOYW1lID0gJ3ZsaW5lLXknO1xuXHRcdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudkxpbmVZKTtcblxuXHRcdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdFx0dGhpcy52TGluZVlDYXB0aW9uLmNsYXNzTmFtZSA9ICdjYXB0aW9uJztcblx0XHRcdFx0dGhpcy52TGluZVkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVlDYXB0aW9uKTtcblxuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuY2xhc3NOYW1lID0gJ2Nyb3NzYmFyJztcblx0XHRcdFx0dGhpcy52TGluZVkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVlDcm9zc0Jhcik7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0dmlzdWFsaXplUmVsYXRpb25Ub1dpbmRvdzogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBjdXJyZW50RWxlbWVudCA9IHRoaXMuY3VycmVudEVsZW1lbnQ7XG5cblx0XHRcdHRoaXMuY3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzKCk7XG5cblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUudG9wID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSkgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IDAgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSBjdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0ICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0ICsgJ+KAiTxzcGFuPnB4PC9zcGFuPic7XG5cblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0ICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikpICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLnRvcCA9IDAgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRUb3AgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdH0sXG5cblx0XHR2aXN1YWxpemVSZWxhdGlvblRvOiBmdW5jdGlvbihyZWxhdGVkRWxlbWVudCkge1xuXG5cdFx0XHR2YXIgY3VycmVudEVsZW1lbnQgPSB0aGlzLmN1cnJlbnRFbGVtZW50LCB0b3AsIGxlZnQ7XG5cblx0XHRcdHRoaXMuY3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzKCk7XG5cblx0XHRcdHZhciByZVJpZ2h0RWRnZSA9IHJlbGF0ZWRFbGVtZW50Lm9mZnNldExlZnQgKyByZWxhdGVkRWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHRcdHZhciBjZVJpZ2h0RWRnZSA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldExlZnQgKyBjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHRcdHZhciByZUxlZnRFZGdlID0gcmVsYXRlZEVsZW1lbnQub2Zmc2V0TGVmdDtcblx0XHRcdHZhciBjZUxlZnRFZGdlID0gY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdDtcblxuXHRcdFx0dmFyIHJlQm90dG9tRWRnZSA9IHJlbGF0ZWRFbGVtZW50Lm9mZnNldFRvcCArIHJlbGF0ZWRFbGVtZW50Lm9mZnNldEhlaWdodDtcblx0XHRcdHZhciBjZUJvdHRvbUVkZ2UgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRUb3AgKyBjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cdFx0XHR2YXIgcmVUb3BFZGdlID0gcmVsYXRlZEVsZW1lbnQub2Zmc2V0VG9wO1xuXHRcdFx0dmFyIGNlVG9wRWRnZSA9IGN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcDtcblx0XHRcdFxuXHRcdFx0Ly8gaG9yaXpvbnRhbCBjb25uZWN0aW9uXG5cdFx0XHRpZihyZVJpZ2h0RWRnZSA8IGNlTGVmdEVkZ2UpIHtcblxuXHRcdFx0XHR0b3AgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRUb3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gcmVSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS53aWR0aCA9IGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSBjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCB0b3ApIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAoY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHRcdH0gZWxzZSBpZih0b3AgPCByZVRvcEVkZ2UpIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAocmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSBpZihjZVJpZ2h0RWRnZSA8IHJlTGVmdEVkZ2UpIHtcblxuXHRcdFx0XHR0b3AgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRUb3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gY2VSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS53aWR0aCA9IHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSByZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCB0b3ApIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcxMDAlJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKGNlVG9wRWRnZSAtIHJlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0XHR9IGVsc2UgaWYodG9wIDwgcmVUb3BFZGdlKSB7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMTAwJSc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChyZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDA7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHZlcnRpY2FsIGNvbm5lY3Rpb25cblx0XHRcdGlmKHJlQm90dG9tRWRnZSA8IGNlVG9wRWRnZSkge1xuXG5cdFx0XHRcdGxlZnQgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0ICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMik7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLnRvcCA9IHJlQm90dG9tRWRnZSArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IGNlVG9wRWRnZSAtIHJlQm90dG9tRWRnZSArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSBjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0XHRpZihyZVJpZ2h0RWRnZSA8IGxlZnQpIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICdhdXRvJztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAoY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHRcdH0gZWxzZSBpZihsZWZ0IDwgcmVMZWZ0RWRnZSkge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJ2F1dG8nO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChyZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIGlmKGNlQm90dG9tRWRnZSA8IHJlVG9wRWRnZSkge1xuXG5cdFx0XHRcdGxlZnQgPSBjdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0ICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMik7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLnRvcCA9IGNlQm90dG9tRWRnZSArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLmhlaWdodCA9IHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSArICdweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSByZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0XHRpZihyZVJpZ2h0RWRnZSA8IGxlZnQpIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzEwMCUnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnMHB4Jztcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0XHR9IGVsc2UgaWYobGVmdCA8IHJlTGVmdEVkZ2UpIHtcblx0XHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzEwMCUnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcwcHgnO1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9KTtcblxuXHQvLyBDcmVhdGUgT3ZlcmxheSAoc2luZ2xldG9uKVxuXHRPdmVybGF5ID0gbmV3IE92ZXJsYXkoKTtcblxuXHQvLyBJbml0aWFsaXplIG92ZXJsYXlcblx0T3ZlcmxheS5pbml0KCk7XG5cblxuXHQvLyBtYWtlIGFsbCBlbGVtZW50cyBvbiBwYWdlIGluc3BlY3RhYmxlXG5cdCQoJ2JvZHkgKjpub3QoLm92ZXJsYXksLm92ZXJsYXkgKiwub3ZlcmxheS10aXRsZSwub3ZlcmxheS10aXRsZSAqKScpLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcblxuXHRcdE92ZXJsYXkuaG92ZXJFbGVtZW50ID0gdGhpcztcblxuXHRcdC8vIGlmIHdlJ3JlIGhvbGRpbmcgc2hpZnQgYW5kIGhvdmVyIGFub3RoZXIgZWxlbWVudCwgc2hvdyBndWlkZXNcblx0XHRpZihPdmVybGF5LmNvbW1hbmRQcmVzc2VkICYmXG5cdFx0XHRPdmVybGF5LmN1cnJlbnRFbGVtZW50ICYmXG5cdFx0XHR0aGlzICE9PSBPdmVybGF5LmN1cnJlbnRFbGVtZW50ICYmXG5cdFx0XHQhJC5jb250YWlucyh0aGlzLCBPdmVybGF5LmN1cnJlbnRFbGVtZW50KSAmJlxuXHRcdFx0ISQuY29udGFpbnMoT3ZlcmxheS5jdXJyZW50RWxlbWVudCwgdGhpcylcblx0XHQpIHtcblx0XHRcdE92ZXJsYXkudmlzdWFsaXplUmVsYXRpb25Ubyh0aGlzKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBpbiBub3JtYWwgbW9kZSwgZG9uJ3QgYWN0aXZhdGUgdGhlIGhvdmVyIGdob3N0IHdoZW4gaW50ZXJhY3Rpbmcgb3Igb3ZlciB0aGUgY3VycmVudCBlbFxuXHRcdGlmKE92ZXJsYXkuaG92ZXJHaG9zdC5jdXJyZW50RWxlbWVudCA9PT0gdGhpcyB8fCBPdmVybGF5LmludGVyYWN0aW5nIHx8IE92ZXJsYXkub3Zlcilcblx0XHRcdHJldHVybjtcblxuXHRcdE92ZXJsYXkuaG92ZXJHaG9zdC5zeW5jKHRoaXMpO1xuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH0pO1xuXG5cdC8vIG1ha2UgYWxsIGVsZW1lbnRzIG9uIHBhZ2UgaW5zcGVjdGFibGVcblx0JCgnYm9keSAqOm5vdCgub3ZlcmxheSwub3ZlcmxheSAqLC5vdmVybGF5LXRpdGxlLC5vdmVybGF5LXRpdGxlICopJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cblx0XHRpZihPdmVybGF5LmN1cnJlbnRFbGVtZW50ID09PSB0aGlzKVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0aWYoT3ZlcmxheS5jdXJyZW50RWxlbWVudCkge1xuXHRcdFx0T3ZlcmxheS51bnNldCgpO1xuXHRcdH1cblxuXHRcdC8vaGlkZSBob3ZlciBnaG9zdFxuXHRcdE92ZXJsYXkuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG5cdFx0Ly8gc3luYyBvbiB0aGUgZWxlbWVudFxuXHRcdE92ZXJsYXkuc3luYyh0aGlzKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblxuXHR9KTtcblxuXHQvLyQoJ3VsJykuc29ydGFibGUoKTtcblx0JCgnI3Rlc3Rib3gnKS5jbGljaygpO1xuXG5cbn0pKCk7XG5cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9