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

		create: function() {
			this.createOverlay();
			
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

		/*
		 * Events & Behaviour initialization
		 */

		init: function() {

			this.initHover();
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

				that.processOverLogic(e);

			});

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

					(that.selectedRule || that.currentElement).style[x ? 'width' : 'height'] = (ui.position[prop] + handleOffset) + 'px';
					that.relayout();
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
					that.relayout();
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
					that.relayout();
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

			// init events
			this.init();

			// relayout
			this.relayout();

		},

		deactivate: function() {

			if(this.selectedRule) {
				this.exitRuleMode();
			}

			this.overlayElement.classList.remove('hover', 'hover-inner', 'hover-padding', 'hover-margin', 'in-command');
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

	},

	deactivate: function() {

		LayoutMode.currentElement.removeAttribute('contentEditable');
		LayoutMode.currentElement.style.outline = '';

	}

});
(function() {

	// make all elements on page inspectable
	$('body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)').on('mouseover', function() {

		LayoutMode.hoverElement = this;

		// in normal mode, don't activate the hover ghost when interacting or over the current el
		if(LayoutMode.hoverGhost.currentElement === this || LayoutMode.interacting || LayoutMode.over)
			return;

		LayoutMode.hoverGhost.relayout(this);

		return false;

	});

	// make all elements on page inspectable
	$('body *:not(.overlay,.overlay *,.overlay-title,.overlay-title *)').on('click', function() {

		if(LayoutMode.currentElement === this)
			return false;

		if(LayoutMode.currentElement) {
			LayoutMode.deactivate();
		}

		// sync on the element
		LayoutMode.activate(this);

		return false;

	});

	//$('ul').sortable();
	$('#testbox').click();


})();



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiU3R5bGVQYXJzZXIuanMiLCJMYXlvdXRNb2RlLmpzIiwiVGl0bGUuanMiLCJHdWlkZXMuanMiLCJHaG9zdHMuanMiLCJDb250ZW50RWRpdGFibGUuanMiLCJpbml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2o2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEdob3N0ID0gZnVuY3Rpb24oZWxlbSkge1xuXG5cdHRoaXMub3ZlcmxheUVsZW1lbnQgPSB0aGlzLmNyZWF0ZSgpO1xuXHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gZWxlbTtcblxufTtcblxuJC5leHRlbmQoR2hvc3QucHJvdG90eXBlLCB7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBnaG9zdCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5IGdob3N0XCI+PC9kaXY+Jyk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cblx0XHRnaG9zdC5hcHBlbmRUbygnYm9keScpO1xuXHRcdHJldHVybiBnaG9zdFswXTtcblxuXHR9LFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0aWYobmV3RWxlbSkge1xuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG5ld0VsZW07XG5cdFx0fVxuXG5cdFx0dmFyIG92ZXJsYXlFbGVtZW50ID0gdGhpcy5vdmVybGF5RWxlbWVudDtcblx0XHR2YXIgZWxlbSA9ICQodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cdFx0dmFyIG9mZnNldCA9IGVsZW0ub2Zmc2V0KCk7XG5cblx0XHR2YXIgY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHR2YXIgaW5uZXJXaWR0aCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUud2lkdGgpO1xuXHRcdHZhciBpbm5lckhlaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUuaGVpZ2h0KTtcblxuXHRcdHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdHZhciBwYWRkaW5nVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nVG9wKTtcblx0XHR2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuXHRcdHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5MZWZ0KTtcblx0XHR2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Ub3ApO1xuXHRcdHZhciBtYXJnaW5SaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luUmlnaHQpO1xuXHRcdHZhciBtYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHR2YXIgb3V0ZXJXaWR0aCA9IGlubmVyV2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodDtcblx0XHR2YXIgb3V0ZXJIZWlnaHQgPSBpbm5lckhlaWdodCArIHBhZGRpbmdUb3AgKyBwYWRkaW5nQm90dG9tO1xuXG5cdFx0Ly8gcGxhY2UgYW5kIHJlc2l6ZSBvdmVybGF5XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUud2lkdGggPSBpbm5lcldpZHRoICsgJ3B4Jztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgKyBwYWRkaW5nVG9wKSArICdweCknO1xuXG5cdFx0Ly8gbW9kaWZ5IHBhZGRpbmcgYm94XG5cblx0XHQvLyBsZWZ0XG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBwYWRkaW5nTGVmdCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyByaWdodFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IHBhZGRpbmdSaWdodCxcblx0XHRcdGhlaWdodDogb3V0ZXJIZWlnaHQsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wLFxuXHRcdFx0cmlnaHQ6IC1wYWRkaW5nUmlnaHRcblx0XHR9KTtcblxuXHRcdC8vIHRvcFxuXHRcdCQoJy5jb250YWluZXItcGFkZGluZy50b3AnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBwYWRkaW5nVG9wLFxuXHRcdFx0dG9wOiAtcGFkZGluZ1RvcFxuXHRcdH0pO1xuXG5cdFx0Ly8gYm90dG9tXG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLmJvdHRvbScsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHBhZGRpbmdCb3R0b20sXG5cdFx0XHRib3R0b206IC1wYWRkaW5nQm90dG9tXG5cdFx0fSk7XG5cblx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXG5cdFx0Ly8gbGVmdFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLmxlZnQnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBtYXJnaW5MZWZ0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdGxlZnQ6IC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gcmlnaHRcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5yaWdodCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG1hcmdpblJpZ2h0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSxcblx0XHRcdHRvcDogLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSxcblx0XHRcdHJpZ2h0OiAtKHBhZGRpbmdSaWdodCArIG1hcmdpblJpZ2h0KVxuXHRcdH0pO1xuXG5cdFx0Ly8gdG9wXG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4udG9wJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogb3V0ZXJXaWR0aCxcblx0XHRcdGhlaWdodDogbWFyZ2luVG9wLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0bGVmdDogLXBhZGRpbmdMZWZ0XG5cdFx0fSk7XG5cblx0XHQvLyBib3R0b21cblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi5ib3R0b20nLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBvdXRlcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBtYXJnaW5Cb3R0b20sXG5cdFx0XHRib3R0b206IC0ocGFkZGluZ0JvdHRvbSArIG1hcmdpbkJvdHRvbSksXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHR9XG5cbn0pOyIsIi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3BlY2lmaWNpdHkgb2YgQ1NTIHNlbGVjdG9yc1xuICogaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1zZWxlY3RvcnMvI3NwZWNpZmljaXR5XG4gKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3RzIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogIC0gc2VsZWN0b3I6IHRoZSBpbnB1dFxuICogIC0gc3BlY2lmaWNpdHk6IGUuZy4gMCwxLDAsMFxuICogIC0gcGFydHM6IGFycmF5IHdpdGggZGV0YWlscyBhYm91dCBlYWNoIHBhcnQgb2YgdGhlIHNlbGVjdG9yIHRoYXQgY291bnRzIHRvd2FyZHMgdGhlIHNwZWNpZmljaXR5XG4gKi9cbnZhciBTUEVDSUZJQ0lUWSA9IChmdW5jdGlvbigpIHtcblx0dmFyIGNhbGN1bGF0ZSxcblx0XHRjYWxjdWxhdGVTaW5nbGU7XG5cblx0Y2FsY3VsYXRlID0gZnVuY3Rpb24oaW5wdXQpIHtcblx0XHR2YXIgc2VsZWN0b3JzLFxuXHRcdFx0c2VsZWN0b3IsXG5cdFx0XHRpLFxuXHRcdFx0bGVuLFxuXHRcdFx0cmVzdWx0cyA9IFtdO1xuXG5cdFx0Ly8gU2VwYXJhdGUgaW5wdXQgYnkgY29tbWFzXG5cdFx0c2VsZWN0b3JzID0gaW5wdXQuc3BsaXQoJywnKTtcblxuXHRcdGZvciAoaSA9IDAsIGxlbiA9IHNlbGVjdG9ycy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0c2VsZWN0b3IgPSBzZWxlY3RvcnNbaV07XG5cdFx0XHRpZiAoc2VsZWN0b3IubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRyZXN1bHRzLnB1c2goY2FsY3VsYXRlU2luZ2xlKHNlbGVjdG9yKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdHM7XG5cdH07XG5cblx0Ly8gQ2FsY3VsYXRlIHRoZSBzcGVjaWZpY2l0eSBmb3IgYSBzZWxlY3RvciBieSBkaXZpZGluZyBpdCBpbnRvIHNpbXBsZSBzZWxlY3RvcnMgYW5kIGNvdW50aW5nIHRoZW1cblx0Y2FsY3VsYXRlU2luZ2xlID0gZnVuY3Rpb24oaW5wdXQpIHtcblx0XHR2YXIgc2VsZWN0b3IgPSBpbnB1dCxcblx0XHRcdGZpbmRNYXRjaCxcblx0XHRcdHR5cGVDb3VudCA9IHtcblx0XHRcdFx0J2EnOiAwLFxuXHRcdFx0XHQnYic6IDAsXG5cdFx0XHRcdCdjJzogMFxuXHRcdFx0fSxcblx0XHRcdHBhcnRzID0gW10sXG5cdFx0XHQvLyBUaGUgZm9sbG93aW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMgYXNzdW1lIHRoYXQgc2VsZWN0b3JzIG1hdGNoaW5nIHRoZSBwcmVjZWRpbmcgcmVndWxhciBleHByZXNzaW9ucyBoYXZlIGJlZW4gcmVtb3ZlZFxuXHRcdFx0YXR0cmlidXRlUmVnZXggPSAvKFxcW1teXFxdXStcXF0pL2csXG5cdFx0XHRpZFJlZ2V4ID0gLygjW15cXHNcXCs+flxcLlxcWzpdKykvZyxcblx0XHRcdGNsYXNzUmVnZXggPSAvKFxcLlteXFxzXFwrPn5cXC5cXFs6XSspL2csXG5cdFx0XHRwc2V1ZG9FbGVtZW50UmVnZXggPSAvKDo6W15cXHNcXCs+flxcLlxcWzpdK3w6Zmlyc3QtbGluZXw6Zmlyc3QtbGV0dGVyfDpiZWZvcmV8OmFmdGVyKS9naSxcblx0XHRcdC8vIEEgcmVnZXggZm9yIHBzZXVkbyBjbGFzc2VzIHdpdGggYnJhY2tldHMgLSA6bnRoLWNoaWxkKCksIDpudGgtbGFzdC1jaGlsZCgpLCA6bnRoLW9mLXR5cGUoKSwgOm50aC1sYXN0LXR5cGUoKSwgOmxhbmcoKVxuXHRcdFx0cHNldWRvQ2xhc3NXaXRoQnJhY2tldHNSZWdleCA9IC8oOltcXHctXStcXChbXlxcKV0qXFwpKS9naSxcblx0XHRcdC8vIEEgcmVnZXggZm9yIG90aGVyIHBzZXVkbyBjbGFzc2VzLCB3aGljaCBkb24ndCBoYXZlIGJyYWNrZXRzXG5cdFx0XHRwc2V1ZG9DbGFzc1JlZ2V4ID0gLyg6W15cXHNcXCs+flxcLlxcWzpdKykvZyxcblx0XHRcdGVsZW1lbnRSZWdleCA9IC8oW15cXHNcXCs+flxcLlxcWzpdKykvZztcblxuXHRcdC8vIEZpbmQgbWF0Y2hlcyBmb3IgYSByZWd1bGFyIGV4cHJlc3Npb24gaW4gYSBzdHJpbmcgYW5kIHB1c2ggdGhlaXIgZGV0YWlscyB0byBwYXJ0c1xuXHRcdC8vIFR5cGUgaXMgXCJhXCIgZm9yIElEcywgXCJiXCIgZm9yIGNsYXNzZXMsIGF0dHJpYnV0ZXMgYW5kIHBzZXVkby1jbGFzc2VzIGFuZCBcImNcIiBmb3IgZWxlbWVudHMgYW5kIHBzZXVkby1lbGVtZW50c1xuXHRcdGZpbmRNYXRjaCA9IGZ1bmN0aW9uKHJlZ2V4LCB0eXBlKSB7XG5cdFx0XHR2YXIgbWF0Y2hlcywgaSwgbGVuLCBtYXRjaCwgaW5kZXgsIGxlbmd0aDtcblx0XHRcdGlmIChyZWdleC50ZXN0KHNlbGVjdG9yKSkge1xuXHRcdFx0XHRtYXRjaGVzID0gc2VsZWN0b3IubWF0Y2gocmVnZXgpO1xuXHRcdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSBtYXRjaGVzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG5cdFx0XHRcdFx0dHlwZUNvdW50W3R5cGVdICs9IDE7XG5cdFx0XHRcdFx0bWF0Y2ggPSBtYXRjaGVzW2ldO1xuXHRcdFx0XHRcdGluZGV4ID0gc2VsZWN0b3IuaW5kZXhPZihtYXRjaCk7XG5cdFx0XHRcdFx0bGVuZ3RoID0gbWF0Y2gubGVuZ3RoO1xuXHRcdFx0XHRcdHBhcnRzLnB1c2goe1xuXHRcdFx0XHRcdFx0c2VsZWN0b3I6IG1hdGNoLFxuXHRcdFx0XHRcdFx0dHlwZTogdHlwZSxcblx0XHRcdFx0XHRcdGluZGV4OiBpbmRleCxcblx0XHRcdFx0XHRcdGxlbmd0aDogbGVuZ3RoXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ly8gUmVwbGFjZSB0aGlzIHNpbXBsZSBzZWxlY3RvciB3aXRoIHdoaXRlc3BhY2Ugc28gaXQgd29uJ3QgYmUgY291bnRlZCBpbiBmdXJ0aGVyIHNpbXBsZSBzZWxlY3RvcnNcblx0XHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UobWF0Y2gsIEFycmF5KGxlbmd0aCArIDEpLmpvaW4oJyAnKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gUmVtb3ZlIHRoZSBuZWdhdGlvbiBwc3VlZG8tY2xhc3MgKDpub3QpIGJ1dCBsZWF2ZSBpdHMgYXJndW1lbnQgYmVjYXVzZSBzcGVjaWZpY2l0eSBpcyBjYWxjdWxhdGVkIG9uIGl0cyBhcmd1bWVudFxuXHRcdChmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZWdleCA9IC86bm90XFwoKFteXFwpXSopXFwpL2c7XG5cdFx0XHRpZiAocmVnZXgudGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKHJlZ2V4LCAnICAgICAkMSAnKTtcblx0XHRcdH1cblx0XHR9KCkpO1xuXG5cdFx0Ly8gUmVtb3ZlIGFueXRoaW5nIGFmdGVyIGEgbGVmdCBicmFjZSBpbiBjYXNlIGEgdXNlciBoYXMgcGFzdGVkIGluIGEgcnVsZSwgbm90IGp1c3QgYSBzZWxlY3RvclxuXHRcdChmdW5jdGlvbigpIHtcblx0XHRcdHZhciByZWdleCA9IC97W15dKi9nbSxcblx0XHRcdFx0bWF0Y2hlcywgaSwgbGVuLCBtYXRjaDtcblx0XHRcdGlmIChyZWdleC50ZXN0KHNlbGVjdG9yKSkge1xuXHRcdFx0XHRtYXRjaGVzID0gc2VsZWN0b3IubWF0Y2gocmVnZXgpO1xuXHRcdFx0XHRmb3IgKGkgPSAwLCBsZW4gPSBtYXRjaGVzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG5cdFx0XHRcdFx0bWF0Y2ggPSBtYXRjaGVzW2ldO1xuXHRcdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShtYXRjaCwgQXJyYXkobWF0Y2gubGVuZ3RoICsgMSkuam9pbignICcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0oKSk7XG5cblx0XHQvLyBBZGQgYXR0cmlidXRlIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGIpXG5cdFx0ZmluZE1hdGNoKGF0dHJpYnV0ZVJlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gQWRkIElEIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGEpXG5cdFx0ZmluZE1hdGNoKGlkUmVnZXgsICdhJyk7XG5cblx0XHQvLyBBZGQgY2xhc3Mgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2goY2xhc3NSZWdleCwgJ2InKTtcblxuXHRcdC8vIEFkZCBwc2V1ZG8tZWxlbWVudCBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBjKVxuXHRcdGZpbmRNYXRjaChwc2V1ZG9FbGVtZW50UmVnZXgsICdjJyk7XG5cblx0XHQvLyBBZGQgcHNldWRvLWNsYXNzIHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGIpXG5cdFx0ZmluZE1hdGNoKHBzZXVkb0NsYXNzV2l0aEJyYWNrZXRzUmVnZXgsICdiJyk7XG5cdFx0ZmluZE1hdGNoKHBzZXVkb0NsYXNzUmVnZXgsICdiJyk7XG5cblx0XHQvLyBSZW1vdmUgdW5pdmVyc2FsIHNlbGVjdG9yIGFuZCBzZXBhcmF0b3IgY2hhcmFjdGVyc1xuXHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvW1xcKlxcc1xcKz5+XS9nLCAnICcpO1xuXG5cdFx0Ly8gUmVtb3ZlIGFueSBzdHJheSBkb3RzIG9yIGhhc2hlcyB3aGljaCBhcmVuJ3QgYXR0YWNoZWQgdG8gd29yZHNcblx0XHQvLyBUaGVzZSBtYXkgYmUgcHJlc2VudCBpZiB0aGUgdXNlciBpcyBsaXZlLWVkaXRpbmcgdGhpcyBzZWxlY3RvclxuXHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvWyNcXC5dL2csICcgJyk7XG5cblx0XHQvLyBUaGUgb25seSB0aGluZ3MgbGVmdCBzaG91bGQgYmUgZWxlbWVudCBzZWxlY3RvcnMgKHR5cGUgYylcblx0XHRmaW5kTWF0Y2goZWxlbWVudFJlZ2V4LCAnYycpO1xuXG5cdFx0Ly8gT3JkZXIgdGhlIHBhcnRzIGluIHRoZSBvcmRlciB0aGV5IGFwcGVhciBpbiB0aGUgb3JpZ2luYWwgc2VsZWN0b3Jcblx0XHQvLyBUaGlzIGlzIG5lYXRlciBmb3IgZXh0ZXJuYWwgYXBwcyB0byBkZWFsIHdpdGhcblx0XHRwYXJ0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRcdHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcblx0XHR9KTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzZWxlY3RvcjogaW5wdXQsXG5cdFx0XHRzcGVjaWZpY2l0eTogJzAsJyArIHR5cGVDb3VudC5hLnRvU3RyaW5nKCkgKyAnLCcgKyB0eXBlQ291bnQuYi50b1N0cmluZygpICsgJywnICsgdHlwZUNvdW50LmMudG9TdHJpbmcoKSxcblx0XHRcdHBhcnRzOiBwYXJ0c1xuXHRcdH07XG5cdH07XG5cblx0cmV0dXJuIHtcblx0XHRjYWxjdWxhdGU6IGNhbGN1bGF0ZVxuXHR9O1xufSgpKTtcblxuXG4oZnVuY3Rpb24oKSB7XG5cblx0dmFyIFN0eWxlUGFyc2VyID0ge307XG5cblx0dmFyIHJ1bGVzID0ge307XG5cdHZhciBzaGVldHMgPSBkb2N1bWVudC5zdHlsZVNoZWV0cztcblxuXHR2YXIgc2hlZXQsIHJ1bGU7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc2hlZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XG5cdFx0c2hlZXQgPSBzaGVldHNbaV07XG5cdFx0aWYoIXNoZWV0LmNzc1J1bGVzKSBjb250aW51ZTtcblxuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgc2hlZXQuY3NzUnVsZXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdHJ1bGUgPSBzaGVldC5jc3NSdWxlc1tqXTtcblx0XHRcdHJ1bGVzW3J1bGUuc2VsZWN0b3JUZXh0XSA9IHJ1bGU7XG5cdFx0fVxuXHR9XG5cblx0U3R5bGVQYXJzZXIucmVzb2x2ZSA9IGZ1bmN0aW9uKHRyYWNrZWRFbGVtZW50KSB7XG5cblx0XHR2YXIgbWF0Y2hlZFJ1bGVzID0gd2luZG93LmdldE1hdGNoZWRDU1NSdWxlcyh0cmFja2VkRWxlbWVudCkgfHwgW107XG5cdFx0dmFyIHJ1bGVzID0gW107XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGVkUnVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHJ1bGVzLnB1c2goW21hdGNoZWRSdWxlc1tpXSwgcGFyc2VJbnQoU1BFQ0lGSUNJVFkuY2FsY3VsYXRlKG1hdGNoZWRSdWxlc1tpXS5zZWxlY3RvclRleHQpWzBdLnNwZWNpZmljaXR5LnJlcGxhY2UoL1xcLC9nLCAnJyksIDEwKSArIDAuMDEgKiBpXSk7XG5cdFx0fVxuXG5cblxuXHRcdHJ1bGVzID0gcnVsZXNcblx0XHRcdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRcdFx0cmV0dXJuIGJbMV0gLSBhWzFdO1xuXHRcdFx0fSlcblx0XHRcdC5tYXAoZnVuY3Rpb24oYSkge1xuXHRcdFx0XHRyZXR1cm4gYVswXTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJ1bGVzO1xuXG5cdH07XG5cblx0d2luZG93LlN0eWxlUGFyc2VyID0gU3R5bGVQYXJzZXI7XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdHZhciBMYXlvdXRNb2RlID0gZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gbnVsbDsgLy8gdGhlIGFjdHVhbCBvdmVybGF5IGRpdlxuXHRcdHRoaXMuY3VycmVudEVsZW1lbnQgPSBudWxsOyAvLyB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGVsZW1lbnRcblx0XHR0aGlzLnNlbGVjdGVkUnVsZSA9IG51bGw7IC8vIHdoZW4gZGVmaW5lZCwgd2UncmUgaW4gcnVsZSBtb2RlXG5cdFx0dGhpcy5ob3Zlckdob3N0ID0gbmV3IEdob3N0KCk7IC8vIHRoZSBob3ZlciBnaG9zdFxuXHRcdHRoaXMub3ZlciA9IGZhbHNlOyAvLyBvbiB3aGV0aGVyIHdlJ3JlIGN1cnJlbmx5IGhvdmVyaW5nIGEgY2VydGFpbiBwYXJ0IG9mIHRoZSBvdmVybGF5XG5cdFx0dGhpcy5vdmVySW5uZXIgPSBmYWxzZTtcblx0XHR0aGlzLm92ZXJQYWRkaW5nID0gZmFsc2U7XG5cdFx0dGhpcy5pbnRlcmFjdGluZyA9IGZhbHNlOyAvLyB3aGV0aGVyIHdlJ3JlIGN1cnJlbnRseSBpbnRlcmFjdGluZyB3aXRoIHRoZSBlbGVtZW50XG5cblx0XHQvLyBpbml0aWFsaXplXG5cdFx0dGhpcy5jcmVhdGUoKTtcblxuXHR9O1xuXG5cdCQuZXh0ZW5kKExheW91dE1vZGUucHJvdG90eXBlLCB7XG5cblx0XHRwbHVnaW5zOiBbXSxcblxuXHRcdHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pIHtcblx0XHRcdHRoaXMucGx1Z2lucy5wdXNoKHBsdWdpbik7XG5cdFx0XHRpZihwbHVnaW4uY3JlYXRlKSB7XG5cdFx0XHRcdHBsdWdpbi5jcmVhdGUuY2FsbChwbHVnaW4pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRjYWxsUGx1Z2luOiBmdW5jdGlvbihldmVudE5hbWUsIGEsIGIsIGMsIGQsIGUsIGYpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMucGx1Z2luc1tpXVtldmVudE5hbWVdKSB7XG5cdFx0XHRcdFx0dGhpcy5wbHVnaW5zW2ldW2V2ZW50TmFtZV0uY2FsbCh0aGlzLnBsdWdpbnNbaV0sIGEsIGIsIGMsIGQsIGUsIGYpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmNyZWF0ZU92ZXJsYXkoKTtcblx0XHRcdFxuXHRcdH0sXG5cblx0XHRjcmVhdGVPdmVybGF5OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudCA9ICQoJzxkaXYgaWQ9XCJvdmVybGF5XCIgY2xhc3M9XCJvdmVybGF5XCI+PC9kaXY+JylbMF07XG5cdFx0XHRcdFx0XHRcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdCb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdMZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlU2l6ZUJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1zaXplXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBoZWlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1wYWRkaW5nXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBwYWRkaW5nLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGJvdHRvbSBoYW5kbGUtbWFyZ2luXCIgdGl0bGU9XCJEcmFnIHRvIGNoYW5nZSBtYXJnaW4tYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVNpemVSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgcmlnaHQgaGFuZGxlLXNpemVcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIHdpZHRoXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgcmlnaHQgaGFuZGxlLXBhZGRpbmdcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIHBhZGRpbmctcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHJpZ2h0IGhhbmRsZS1tYXJnaW5cIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIG1hcmdpbi1yaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSB0b3AgaGFuZGxlLXBhZGRpbmdcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIHBhZGRpbmctdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgdG9wIGhhbmRsZS1tYXJnaW5cIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIG1hcmdpbi10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGxlZnQgaGFuZGxlLXBhZGRpbmdcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIHBhZGRpbmctbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBsZWZ0IGhhbmRsZS1tYXJnaW5cIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIG1hcmdpbi1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cblx0XHRcdHRoaXMuY2FwdGlvbldpZHRoID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi13aWR0aFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uSGVpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1oZWlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIHJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1tYXJnaW4gcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tbWFyZ2luIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1tYXJnaW4gYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdHRoaXMuaGFuZGxlU2l6ZUJvdHRvbVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlU2l6ZVJpZ2h0KVxuXHRcdFx0XHQuaG92ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gdGhpcztcblx0XHRcdFx0XHR0aGF0Lm92ZXJTaXplSGFuZGxlID0gdHJ1ZTtcblxuXHRcdFx0XHRcdGlmKCF0aGF0LmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVNpemVSaWdodFswXSkgeyB0aGF0LmNhcHRpb25XaWR0aC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnd2lkdGgnKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVTaXplQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbkhlaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgnaGVpZ2h0Jyk7IH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gbnVsbDtcblx0XHRcdFx0XHR0aGF0Lm92ZXJTaXplSGFuZGxlID0gZmFsc2U7XG5cblx0XHRcdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRcdFx0dmFyIHJlbW92ZVNwYW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlU2l6ZVJpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvbldpZHRoLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVTaXplQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbkhlaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cdFxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0cmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZighdGhhdC5fX2NhdGNoTW91c2VVcCkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9ICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpZighdGhhdC5vdmVyU2l6ZUhhbmRsZSkgcmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gbnVsbDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVQYWRkaW5nVG9wKVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlUGFkZGluZ0xlZnQpXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVQYWRkaW5nUmlnaHQpXG5cdFx0XHRcdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHRoYXQub3ZlclBhZGRpbmdIYW5kbGUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1yaWdodCcpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVBhZGRpbmdCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ0JvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1ib3R0b20nKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nTGVmdFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgncGFkZGluZy1sZWZ0Jyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1RvcFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nVG9wLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLXRvcCcpOyB9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IG51bGw7XG5cdFx0XHRcdFx0dGhhdC5vdmVyUGFkZGluZ0hhbmRsZSA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0XHRcdHZhciByZW1vdmVTcGFuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVBhZGRpbmdSaWdodFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVBhZGRpbmdCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ0JvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ0xlZnRbMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ0xlZnQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVBhZGRpbmdUb3BbMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ1RvcC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYoIXRoYXQuX19jYXRjaE1vdXNlVXApIHtcblx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSAkKGRvY3VtZW50KS5vbmUoJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0aWYoIXRoYXQub3ZlclBhZGRpbmdIYW5kbGUpIHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9IG51bGw7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVNYXJnaW5Ub3ApXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVNYXJnaW5MZWZ0KVxuXHRcdFx0XHQuYWRkKHRoaXMuaGFuZGxlTWFyZ2luUmlnaHQpXG5cdFx0XHRcdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHRoYXQub3Zlck1hcmdpbkhhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5SaWdodFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLXJpZ2h0Jyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLWJvdHRvbScpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpbkxlZnRbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luTGVmdC5jbGFzc0xpc3QuYWRkKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuc2VsZWN0UnVsZSgnbWFyZ2luLWxlZnQnKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Ub3BbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luVG9wLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tdG9wJyk7IH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gbnVsbDtcblx0XHRcdFx0XHR0aGF0Lm92ZXJNYXJnaW5IYW5kbGUgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdFx0XHR2YXIgcmVtb3ZlU3BhbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5SaWdodFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tWzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkJvdHRvbS5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlTWFyZ2luTGVmdFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Ub3BbMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luVG9wLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0cmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZighdGhhdC5fX2NhdGNoTW91c2VVcCkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9ICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpZighdGhhdC5vdmVyTWFyZ2luSGFuZGxlKSByZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXG5cdFx0fSxcblxuXHRcdC8qXG5cdFx0ICogRXZlbnRzICYgQmVoYXZpb3VyIGluaXRpYWxpemF0aW9uXG5cdFx0ICovXG5cblx0XHRpbml0OiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dGhpcy5pbml0SG92ZXIoKTtcblx0XHRcdHRoaXMuaW5pdEhhbmRsZXMoKTtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFx0dGhpcy5fX2tleXVwID0gZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRcdGlmKGUud2hpY2ggPT09IDE2KSB7XG5cdFx0XHRcdFx0dGhhdC5zaGlmdFByZXNzZWQgPSBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKGUua2V5Q29kZSA9PT0gMjcpIHtcblx0XHRcdFx0XHR0aGF0LmRlYWN0aXZhdGUoKTtcblx0XHRcdFx0fVx0XHRcblx0XHRcdH07XG5cdFx0XHR0aGlzLl9fa2V5ZG93biA9IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRpZihlLndoaWNoID09PSAxNikge1xuXHRcdFx0XHRcdHRoYXQuc2hpZnRQcmVzc2VkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9O1xuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleXVwJywgdGhpcy5fX2tleXVwKTtcblx0XHRcdCQoZG9jdW1lbnQpLm9uKCdrZXlkb3duJywgdGhpcy5fX2tleWRvd24pO1xuXG5cdFx0fSxcblxuXHRcdHByb2Nlc3NPdmVyTG9naWM6IGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0dmFyIGV4dHJhTWFyZ2luID0gMTA7XG5cdFx0XHR2YXIgb2Zmc2V0ID0gdGhpcy5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0XHQvLyBnZW5lcmFsIG92ZXIvb3V0XG5cblx0XHRcdGlmKFxuXHRcdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSB0aGlzLm1hcmdpbkxlZnQgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAtIHRoaXMubWFyZ2luVG9wIC0gZXh0cmFNYXJnaW4gJiZcblx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIHRoaXMubWFyZ2luUmlnaHQgKyBleHRyYU1hcmdpbikgJiZcblx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCArIHRoaXMubWFyZ2luQm90dG9tICsgZXh0cmFNYXJnaW4pXG5cdFx0XHQpIHtcblxuXHRcdFx0XHRpZighdGhpcy5vdmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5vdmVyID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cdFx0XHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZih0aGlzLm92ZXIgJiYgIXRoaXMuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHR0aGlzLm92ZXIgPSBmYWxzZTtcblx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyJyk7XG5cdFx0XHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1x0XHRcdFxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gb3ZlciBpbm5lciBib3hcblxuXHRcdFx0aWYoIXRoaXMuaW50ZXJhY3RpbmcpIHtcblxuXHRcdFx0XHRpZihcblx0XHRcdFx0XHQoKGUucGFnZVggPiBvZmZzZXQubGVmdCArIHRoaXMucGFkZGluZ0xlZnQgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wICsgdGhpcy5wYWRkaW5nVG9wICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoIC0gdGhpcy5wYWRkaW5nUmlnaHQpICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0IC0gdGhpcy5wYWRkaW5nQm90dG9tKSkgfHxcblx0XHRcdFx0XHR0aGlzLm92ZXJTaXplSGFuZGxlKSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJQYWRkaW5nSGFuZGxlICYmIC8vIGNhbm5vdCBiZSBvdmVyIHBhZGRpbmcgaGFuZGxlXG5cdFx0XHRcdFx0IXRoaXMub3Zlck1hcmdpbkhhbmRsZVxuXHRcdFx0XHQpIHtcblxuXHRcdFx0XHRcdGlmKCF0aGlzLm92ZXJJbm5lcikge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbm5lcicpO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVySW5uZXIgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYodGhpcy5vdmVySW5uZXIpIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcklubmVyID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLWlubmVyJyk7XHRcdFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gb3ZlciBwYWRkaW5nIGJveFxuXG5cdFx0XHRpZighdGhpcy5pbnRlcmFjdGluZykge1xuXG5cdFx0XHRcdGlmKFxuXHRcdFx0XHRcdCgoZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICYmIGUucGFnZVkgPiBvZmZzZXQudG9wICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoKSAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCkgJiZcblx0XHRcdFx0XHRcdCF0aGlzLm92ZXJJbm5lcikgfHxcblx0XHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nSGFuZGxlKSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJTaXplSGFuZGxlICYmXG5cdFx0XHRcdFx0IXRoaXMub3Zlck1hcmdpbkhhbmRsZVxuXHRcdFx0XHQpIHtcblxuXHRcdFx0XHRcdGlmKCF0aGlzLm92ZXJQYWRkaW5nKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLXBhZGRpbmcnKTtcblxuXHRcdFx0XHRcdFx0dGhpcy5vdmVyUGFkZGluZyA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRpZih0aGlzLm92ZXJQYWRkaW5nKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLXBhZGRpbmcnKTtcdFx0XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBvdmVyIG1hcmdpbiBib3hcblxuXHRcdFx0aWYoIXRoaXMuaW50ZXJhY3RpbmcpIHtcblxuXHRcdFx0XHRpZihcblx0XHRcdFx0XHQoKGUucGFnZVggPiBvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSB0aGlzLm1hcmdpblRvcCAmJiBcblx0XHRcdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0KSAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgdGhpcy5vdXRlckhlaWdodCArIHRoaXMubWFyZ2luQm90dG9tKSAmJlxuXHRcdFx0XHRcdFx0IXRoaXMub3ZlcklubmVyICYmXG5cdFx0XHRcdFx0XHQhdGhpcy5vdmVyUGFkZGluZykgfHxcblx0XHRcdFx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luSGFuZGxlKSAmJlxuXHRcdFx0XHRcdCF0aGlzLm92ZXJQYWRkaW5nSGFuZGxlICYmXG5cdFx0XHRcdFx0IXRoaXMub3ZlclNpemVIYW5kbGVcblx0XHRcdFx0KSB7XG5cblx0XHRcdFx0XHRpZighdGhpcy5vdmVyTWFyZ2luKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLW1hcmdpbicpO1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGlmKHRoaXMub3Zlck1hcmdpbikge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLW1hcmdpbicpO1x0XHRcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0aW5pdEhvdmVyOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0XHQkKCdib2R5Jykub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHR0aGF0Ll9fbGFzdE1vdXNlTW92ZUV2ZW50ID0gZTtcblx0XHRcdFx0aWYoIXRoYXQuY3VycmVudEVsZW1lbnQpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGF0LnByb2Nlc3NPdmVyTG9naWMoZSk7XG5cblx0XHRcdH0pO1xuXG5cdFx0fSxcblxuXHRcdGluaXRIYW5kbGVzOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFx0dmFyIGhhbmRsZU9mZnNldCA9IDM7XG5cblx0XHRcdHZhciBhcHBseVByZWNpc2lvbiA9IGZ1bmN0aW9uKG9yaWcsIGN1cnJlbnQpIHtcblx0XHRcdFx0aWYodGhhdC5zaGlmdFByZXNzZWQpIHtcblx0XHRcdFx0XHR2YXIgZGVsdGEgPSBvcmlnIC0gY3VycmVudDtcblx0XHRcdFx0XHR2YXIgcHJlY2lzaW9uRGVsdGEgPSBkZWx0YSAvIDQ7XG5cdFx0XHRcdFx0cmV0dXJuIGN1cnJlbnQgKyBNYXRoLnJvdW5kKGRlbHRhIC0gcHJlY2lzaW9uRGVsdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjdXJyZW50O1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gcmVzaXplIGhhbmRsZXNcblxuXHRcdFx0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBzdGFydCA9IGZ1bmN0aW9uKCkgeyB0aGF0LmludGVyYWN0aW5nID0gJ3NpemUnOyB0aGlzLl9feCA9ICQodGhpcykuZHJhZ2dhYmxlKCdvcHRpb24nLCAnYXhpcycpID09PSAneCc7IH07XG5cdFx0XHRcdHZhciBkcmFnID0gZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0dmFyIHggPSB0aGlzLl9feDtcblx0XHRcdFx0XHR2YXIgcHJvcCA9IHggPyAnbGVmdCcgOiAndG9wJztcblxuXHRcdFx0XHRcdC8vIGFwcGx5IHByZWNpc2lvbiBkcmFnXG5cdFx0XHRcdFx0dWkucG9zaXRpb25bcHJvcF0gPSBhcHBseVByZWNpc2lvbih1aS5vcmlnaW5hbFBvc2l0aW9uW3Byb3BdLCB1aS5wb3NpdGlvbltwcm9wXSk7XG5cblx0XHRcdFx0XHQvLyBjYWxjdWxhdGUgbm9ybWFsIGhhbmRsZSBwb3NpdGlvblxuXHRcdFx0XHRcdHVpLnBvc2l0aW9uW3Byb3BdID0gTWF0aC5tYXgoMCAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb25bcHJvcF0pO1xuXG5cdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlW3ggPyAnd2lkdGgnIDogJ2hlaWdodCddID0gKHVpLnBvc2l0aW9uW3Byb3BdICsgaGFuZGxlT2Zmc2V0KSArICdweCc7XG5cdFx0XHRcdFx0dGhhdC5yZWxheW91dCgpO1xuXHRcdFx0XHRcdHRoYXQudXBkYXRlR2hvc3RzKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly90aGlzLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmhlaWdodCA9ICcnO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUud2lkdGggPSAnJztcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmJvdHRvbSA9ICcnO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUudG9wID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS5sZWZ0ID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS5yaWdodCA9ICcnO1xuXHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVNpemVCb3R0b20uZHJhZ2dhYmxlKHsgZGlzdGFuY2U6IDAsIGF4aXM6ICd5JywgY3Vyc29yOiAncy1yZXNpemUnLCBzdGFydDogc3RhcnQsIGRyYWc6IGRyYWcsIHN0b3A6IHN0b3AgfSk7XG5cdFx0XHRcdHRoYXQuaGFuZGxlU2l6ZVJpZ2h0LmRyYWdnYWJsZSh7IGRpc3RhbmNlOiAwLCBheGlzOiAneCcsIGN1cnNvcjogJ2UtcmVzaXplJywgc3RhcnQ6IHN0YXJ0LCBkcmFnOiBkcmFnLCBzdG9wOiBzdG9wIH0pO1xuXG5cdFx0XHR9KSgpO1xuXG5cblx0XHRcdC8vIHJlc2l6ZSBwYWRkaW5nXG5cblx0XHRcdChmdW5jdGlvbigpIHtcblxuXHRcdFx0XHR2YXIgc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoaXMucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dmFyIGRyYWcgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LnJlbGF5b3V0KCk7XG5cdFx0XHRcdFx0dGhhdC51cGRhdGVHaG9zdHMoKTtcdFx0XHRcdFx0XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nQm90dG9tLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3MtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVySGVpZ2h0ID0gJCh0aGF0LmN1cnJlbnRFbGVtZW50KS5oZWlnaHQoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ0JvdHRvbSA9IHRoYXQucGFkZGluZ0JvdHRvbTtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAncGFkZGluZyc7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb24udG9wLCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gTWF0aC5tYXgodGhpcy5jdXJJbm5lckhlaWdodCAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb24udG9wKTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nQm90dG9tID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJQYWRkaW5nQm90dG9tICsgKCh1aS5wb3NpdGlvbi50b3ApIC0gdWkub3JpZ2luYWxQb3NpdGlvbi50b3ApKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlUGFkZGluZ1JpZ2h0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ2UtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVyV2lkdGggPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLndpZHRoKCk7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdSaWdodCA9IHRoYXQucGFkZGluZ1JpZ2h0O1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdwYWRkaW5nJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCwgdWkucG9zaXRpb24ubGVmdCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gTWF0aC5tYXgodGhpcy5jdXJJbm5lcldpZHRoIC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdSaWdodCArICgodWkucG9zaXRpb24ubGVmdCkgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLmxlZnQpKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlUGFkZGluZ1RvcC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAxLFxuXHRcdFx0XHRcdGF4aXM6ICd5Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICduLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJPZmZzZXQgPSB1aS5vZmZzZXQudG9wO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nVG9wID0gdGhhdC5wYWRkaW5nVG9wO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdwYWRkaW5nJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQudG9wIC0gdGhpcy5jdXJPZmZzZXQpO1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSB0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdUb3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdUb3AgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3ctcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC5sZWZ0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nTGVmdCA9IHRoYXQucGFkZGluZ0xlZnQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQubGVmdCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gdGhhdC5zaGlmdFByZXNzZWQgPyBNYXRoLnJvdW5kKGRlbHRhIC8gNCkgOiBkZWx0YTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nTGVmdCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ0xlZnQgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcdFx0XHRcdFxuXG5cdFx0XHR9KSgpO1xuXG5cblx0XHRcdC8vIHJlc2l6ZSBtYXJnaW5cblxuXHRcdFx0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZHJhZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQucmVsYXlvdXQoKTtcblx0XHRcdFx0XHR0aGF0LnVwZGF0ZUdob3N0cygpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlTWFyZ2luQm90dG9tLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3MtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVySGVpZ2h0ID0gJCh0aGF0LmN1cnJlbnRFbGVtZW50KS5oZWlnaHQoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luQm90dG9tID0gdGhhdC5tYXJnaW5Cb3R0b207XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdCb3R0b20gPSB0aGF0LnBhZGRpbmdCb3R0b207XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb24udG9wLCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gTWF0aC5tYXgodGhpcy5jdXJJbm5lckhlaWdodCArIHRoaXMuY3VyUGFkZGluZ0JvdHRvbSAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb24udG9wKTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5tYXJnaW5Cb3R0b20gPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpbkJvdHRvbSArICh1aS5wb3NpdGlvbi50b3AgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLnRvcCkpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVNYXJnaW5SaWdodC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd4Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICdlLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJJbm5lcldpZHRoID0gJCh0aGF0LmN1cnJlbnRFbGVtZW50KS53aWR0aCgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5SaWdodCA9IHRoYXQubWFyZ2luUmlnaHQ7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdSaWdodCA9IHRoYXQucGFkZGluZ1JpZ2h0O1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdtYXJnaW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gYXBwbHlQcmVjaXNpb24odWkub3JpZ2luYWxQb3NpdGlvbi5sZWZ0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBNYXRoLm1heCh0aGlzLmN1cklubmVyV2lkdGggKyB0aGlzLmN1clBhZGRpbmdSaWdodCAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb24ubGVmdCk7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luUmlnaHQgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpblJpZ2h0ICsgKHVpLnBvc2l0aW9uLmxlZnQgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLmxlZnQpKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlTWFyZ2luTGVmdC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd4Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICd3LXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJPZmZzZXQgPSB1aS5vZmZzZXQubGVmdDtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luTGVmdCA9IHRoYXQubWFyZ2luTGVmdDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IC1oYW5kbGVPZmZzZXQ7XG5cdFx0XHRcdFx0XHR2YXIgZGVsdGEgPSAodWkub2Zmc2V0LmxlZnQgLSB0aGlzLmN1ck9mZnNldCk7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IHRoYXQuc2hpZnRQcmVzc2VkID8gTWF0aC5yb3VuZChkZWx0YSAvIDQpIDogZGVsdGE7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luTGVmdCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyTWFyZ2luTGVmdCAtIGRlbHRhKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlTWFyZ2luVG9wLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ24tcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC50b3A7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpblRvcCA9IHRoYXQubWFyZ2luVG9wO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdtYXJnaW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC50b3AgLSB0aGlzLmN1ck9mZnNldCk7XG5cdFx0XHRcdFx0XHRkZWx0YSA9IHRoYXQuc2hpZnRQcmVzc2VkID8gTWF0aC5yb3VuZChkZWx0YSAvIDQpIDogZGVsdGE7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luVG9wID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5Ub3AgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fSkoKTtcblxuXHRcdH0sXG5cblx0XHQvKlxuXHRcdCAqIENvcmUgcnVudGltZSBmdW5jdGlvbmFsaXR5XG5cdFx0ICovXG5cblx0XHRyZWxheW91dDogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBjb21wdXRlZFN0eWxlID0gdGhpcy5jb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdFx0dmFyIG92ZXJsYXlFbGVtZW50ID0gdGhpcy5vdmVybGF5RWxlbWVudDtcblx0XHRcdHZhciBlbGVtID0gJCh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblx0XHRcdHZhciBvZmZzZXQgPSBlbGVtLm9mZnNldCgpO1xuXG5cdFx0XHQvLyB3ZSBuZWVkIHRvIHN0b3JlIG91dGVyIGhlaWdodCwgYm90dG9tL3JpZ2h0IHBhZGRpbmcgYW5kIG1hcmdpbnMgZm9yIGhvdmVyIGRldGVjdGlvblxuXHRcdFx0dmFyIHBhZGRpbmdMZWZ0ID0gdGhpcy5wYWRkaW5nTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ0xlZnQpO1xuXHRcdFx0dmFyIHBhZGRpbmdUb3AgPSB0aGlzLnBhZGRpbmdUb3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdUb3ApO1xuXHRcdFx0dmFyIHBhZGRpbmdSaWdodCA9IHRoaXMucGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nUmlnaHQpO1xuXHRcdFx0dmFyIHBhZGRpbmdCb3R0b20gPSB0aGlzLnBhZGRpbmdCb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG5cdFx0XHR2YXIgbWFyZ2luTGVmdCA9IHRoaXMubWFyZ2luTGVmdCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luTGVmdCk7XG5cdFx0XHR2YXIgbWFyZ2luVG9wID0gdGhpcy5tYXJnaW5Ub3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblRvcCk7XG5cdFx0XHR2YXIgbWFyZ2luUmlnaHQgPSB0aGlzLm1hcmdpblJpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5SaWdodCk7XG5cdFx0XHR2YXIgbWFyZ2luQm90dG9tID0gdGhpcy5tYXJnaW5Cb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkJvdHRvbSk7XG5cblx0XHRcdHZhciBpbm5lcldpZHRoID0gdGhpcy5pbm5lcldpZHRoID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS53aWR0aCkgfHwgKHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodCk7XG5cdFx0XHR2YXIgaW5uZXJIZWlnaHQgPSB0aGlzLmlubmVySGVpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5oZWlnaHQpIHx8ICh0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tKTtcblxuXHRcdFx0dmFyIG91dGVyV2lkdGggPSB0aGlzLm91dGVyV2lkdGggPSBpbm5lcldpZHRoICsgcGFkZGluZ0xlZnQgKyBwYWRkaW5nUmlnaHQ7XG5cdFx0XHR2YXIgb3V0ZXJIZWlnaHQgPSB0aGlzLm91dGVySGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyBwYWRkaW5nVG9wICsgcGFkZGluZ0JvdHRvbTtcblxuXHRcdFx0Ly8gY2FsY3VsYXRlIGhhbmRsZSBzaXplXG5cdFx0XHR2YXIgaGFuZGxlU2l6ZVggPSAxNjtcblx0XHRcdHZhciBoYW5kbGVTaXplWSA9IDE2O1xuXHRcdFx0aWYoaW5uZXJXaWR0aCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWCA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWCAqIChpbm5lcldpZHRoIC8gNjApKSk7XG5cdFx0XHR9XG5cdFx0XHRpZihpbm5lckhlaWdodCA8IDEwMCkge1xuXHRcdFx0XHRoYW5kbGVTaXplWSA9IE1hdGgubWF4KDgsIE1hdGgubWluKDE2LCBoYW5kbGVTaXplWSAqIChpbm5lckhlaWdodCAvIDYwKSkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcyhoYW5kbGVTaXplWCwgaGFuZGxlU2l6ZVkpO1xuXG5cdFx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLndpZHRoID0gaW5uZXJXaWR0aCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBpbm5lckhlaWdodCArICdweCc7XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHRcdC8vIG1vZGlmeSBwYWRkaW5nIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nTGVmdC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nTGVmdCArICcsICcgKyBvdXRlckhlaWdodCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1JpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBwYWRkaW5nUmlnaHQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdUb3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKC1wYWRkaW5nVG9wKSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ1RvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoMCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQpICsgJ3B4KSBzY2FsZSgnICsgaW5uZXJXaWR0aCArICcsICcgKyBwYWRkaW5nQm90dG9tICsgJyknO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIC1wYWRkaW5nTGVmdCArICdweCwgMHB4KSc7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodFswXS5zdHlsZS5tYXJnaW5SaWdodCA9IC1wYWRkaW5nUmlnaHQgKyAncHgnOyAvLyBUT0RPOiBmaW5kIG91dCB3aHkgY29udmVydGluZyB0aGVzZSB0byB0cmFuc2Zvcm1zIG1lc3NlcyB3aXRoIGRyYWdnaW5nXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdUb3BbMF0uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAtcGFkZGluZ1RvcCArICdweCknO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLm1hcmdpbkJvdHRvbSA9ICAtcGFkZGluZ0JvdHRvbSArICdweCc7ICAvLyBUT0RPOiBmaW5kIG91dCB3aHkgY29udmVydGluZyB0aGVzZSB0byB0cmFuc2Zvcm1zIG1lc3NlcyB3aXRoIGRyYWdnaW5nXG5cblx0XHRcdC8vIG1vZGlmeSBtYXJnaW4gYm94XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkxlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KSkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5MZWZ0ICsgJywgJyArIChvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSkgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblJpZ2h0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChpbm5lcldpZHRoICsgcGFkZGluZ1JpZ2h0KSArICdweCwgJyArICgtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApKSArICdweCkgc2NhbGUoJyArIG1hcmdpblJpZ2h0ICsgJywgJyArIChvdXRlckhlaWdodCArIG1hcmdpblRvcCArIG1hcmdpbkJvdHRvbSkgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblRvcC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXBhZGRpbmdMZWZ0KSArICdweCwgJyArICgtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApKSArICdweCkgc2NhbGUoJyArIG91dGVyV2lkdGggKyAnLCAnICsgbWFyZ2luVG9wICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Cb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoaW5uZXJIZWlnaHQgKyBwYWRkaW5nQm90dG9tKSArICdweCkgc2NhbGUoJyArIG91dGVyV2lkdGggKyAnLCAnICsgbWFyZ2luQm90dG9tICsgJyknO1xuXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUubWFyZ2luTGVmdCA9IC0ocGFkZGluZ0xlZnQgKyBtYXJnaW5MZWZ0KSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLm1hcmdpblJpZ2h0ID0gLShwYWRkaW5nUmlnaHQgKyBtYXJnaW5SaWdodCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3BbMF0uc3R5bGUubWFyZ2luVG9wID0gLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVswXS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAtKHBhZGRpbmdCb3R0b20gKyBtYXJnaW5Cb3R0b20pICsgJ3B4JztcblxuXHRcdFx0Ly8gb2Zmc2V0IG1hZ2ljXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUubWFyZ2luVG9wID0gKG1hcmdpbkxlZnQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIG1hcmdpbkxlZnQpIC8gNSkgKyAoaGFuZGxlU2l6ZVkgLyAyKSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5MZWZ0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5MZWZ0KSAvIDUpIC0gOCArIGhhbmRsZVNpemVZKSA6IC04KSArICdweCc7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gKG1hcmdpblJpZ2h0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5SaWdodCkgLyA1KSArIChoYW5kbGVTaXplWSAvIDIpKSA6IC0oaGFuZGxlU2l6ZVkgLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0LnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luUmlnaHQpIC8gNSkgLSA4ICsgaGFuZGxlU2l6ZVkpIDogLTgpICsgJ3B4Jztcblx0XHRcdFxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Ub3BbMF0uc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Ub3AgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVggLyA0KSAqIG1hcmdpblRvcCkgLyA1KSArIChoYW5kbGVTaXplWCAvIDIpKSA6IC0oaGFuZGxlU2l6ZVggLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5zdHlsZS5tYXJnaW5MZWZ0ID0gKG1hcmdpblRvcCA8IDIwID8gKChoYW5kbGVTaXplWCkgKyAoLShoYW5kbGVTaXplWCkgKiAobWFyZ2luVG9wIC8gMjApKSAtIDgpIDogLTExKSArICdweCc7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luQm90dG9tIDwgMjAgPyAoLSgoKGhhbmRsZVNpemVYIC8gNCkgKiBtYXJnaW5Cb3R0b20pIC8gNSkgKyAoaGFuZGxlU2l6ZVggLyAyKSkgOiAtKGhhbmRsZVNpemVYIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Cb3R0b20uc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Cb3R0b20gPCAyMCA/ICgoaGFuZGxlU2l6ZVgpICsgKC0oaGFuZGxlU2l6ZVgpICogKG1hcmdpbkJvdHRvbSAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVNpemVSaWdodFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAocGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemVZIC8gNCkgKiBwYWRkaW5nUmlnaHQpIC8gNSkgLSAoaGFuZGxlU2l6ZVkgKiAxLjUpKSA6IC0oaGFuZGxlU2l6ZVkgLyAyKSkgKyAncHgnOyAvLyAoLTggKiAobWFyZ2luTGVmdCAvIDIwKSkgKyAoOCAtIDggKiAobWFyZ2luTGVmdCAvIDIwKSlcblx0XHRcdHRoaXMuY2FwdGlvbldpZHRoLnN0eWxlLm1hcmdpblRvcCA9IChwYWRkaW5nUmlnaHQgPCAyMCA/ICgrKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIHBhZGRpbmdSaWdodCkgLyA1KSAtIChoYW5kbGVTaXplWSAqIDEuNSkpIDogLTgpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAocGFkZGluZ0JvdHRvbSA8IDIwID8gKCsoKChoYW5kbGVTaXplWCAvIDQpICogcGFkZGluZ0JvdHRvbSkgLyA1KSAtIChoYW5kbGVTaXplWCAqIDEuNSkpIDogLShoYW5kbGVTaXplWCAvIDIpKSArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IChwYWRkaW5nQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemVYICogKHBhZGRpbmdCb3R0b20gLyAyMCkpIC0gaGFuZGxlU2l6ZVggKiAyICsgaGFuZGxlU2l6ZVggLSA5KSA6IC0xMCkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLm1hcmdpblRvcCA9IC0oaGFuZGxlU2l6ZVkgLyAyKSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdSaWdodFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAtKGhhbmRsZVNpemVZIC8gMikgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKGhhbmRsZVNpemVYIC8gMikgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKGhhbmRsZVNpemVYIC8gMikgKyAncHgnO1xuXG5cdFx0XHR0aGlzLnJlZnJlc2hIYW5kbGVzKCk7XG5cdFx0XHR0aGlzLnJlZnJlc2hDYXB0aW9ucygpO1xuXG5cdFx0XHR0aGlzLmN1cnJlbnRPZmZzZXQgPSBvZmZzZXQ7XG5cblx0XHRcdC8vIGluZm9ybSBwbHVnaW5zIHRoYXQgYSByZWxheW91dCBoYXMgaGFwcGVuZWRcblx0XHRcdHRoaXMuY2FsbFBsdWdpbigncmVsYXlvdXQnLCB7XG5cblx0XHRcdFx0Y29tcHV0ZWRTdHlsZTogY29tcHV0ZWRTdHlsZSxcblx0XHRcdFx0b2Zmc2V0OiBvZmZzZXQsXG5cblx0XHRcdFx0cGFkZGluZ0xlZnQ6IHBhZGRpbmdMZWZ0LFxuXHRcdFx0XHRwYWRkaW5nVG9wOiBwYWRkaW5nVG9wLFxuXHRcdFx0XHRwYWRkaW5nUmlnaHQ6IHBhZGRpbmdSaWdodCxcblx0XHRcdFx0cGFkZGluZ0JvdHRvbTogcGFkZGluZ0JvdHRvbSxcblxuXHRcdFx0XHRtYXJnaW5MZWZ0OiBtYXJnaW5MZWZ0LFxuXHRcdFx0XHRtYXJnaW5Ub3A6IG1hcmdpblRvcCxcblx0XHRcdFx0bWFyZ2luUmlnaHQ6IG1hcmdpblJpZ2h0LFxuXHRcdFx0XHRtYXJnaW5Cb3R0b206IG1hcmdpbkJvdHRvbSxcblxuXHRcdFx0XHRpbm5lcldpZHRoOiBpbm5lcldpZHRoLFxuXHRcdFx0XHRpbm5lckhlaWdodDogaW5uZXJIZWlnaHQsXG5cdFx0XHRcdG91dGVyV2lkdGg6IG91dGVyV2lkdGgsXG5cdFx0XHRcdG91dGVySGVpZ2h0OiBvdXRlckhlaWdodFxuXG5cdFx0XHR9KTtcblxuXHRcdH0sXG5cblx0XHRyZWZyZXNoSGFuZGxlczogZnVuY3Rpb24oaGFuZGxlU2l6ZVgsIGhhbmRsZVNpemVZKSB7XG5cblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luTGVmdFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplWSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplWCArICdweCc7XG5cblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0xlZnRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVNpemVSaWdodFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplWSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZVNpemVCb3R0b21bMF0uc3R5bGUud2lkdGggPSBoYW5kbGVTaXplWCArICdweCc7XG5cblx0XHR9LFxuXG5cdFx0cmVmcmVzaENhcHRpb25zOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIG9mZnNldCA9IHsgbGVmdDogdGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRMZWZ0LCB0b3A6IHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0VG9wIH07XG5cblx0XHRcdC8vIGNhcHRpb25zXG5cdFx0XHR2YXIgaGl0c1JpZ2h0RWRnZSwgaGl0c0xlZnRFZGdlO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5pbm5lckhUTUwgPSAnPHNwYW4+d2lkdGg6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3dpZHRoJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5zdHlsZS5yaWdodCA9IChoaXRzUmlnaHRFZGdlID8gMTYgOiAtKHRoaXMuY2FwdGlvbldpZHRoLm9mZnNldFdpZHRoICsgMTMpKSArICdweCc7XG5cblx0XHRcdHRoaXMuY2FwdGlvbkhlaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+aGVpZ2h0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdoZWlnaHQnKTtcblxuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctbGVmdDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ0xlZnQnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy1yaWdodDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ1JpZ2h0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wLmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLXRvcDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgncGFkZGluZ1RvcCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0JvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy1ib3R0b206IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdCb3R0b20nKTtcblxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWxlZnQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ21hcmdpbkxlZnQnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0LmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tcmlnaHQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ21hcmdpblJpZ2h0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3AuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi10b3A6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ21hcmdpblRvcCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tYm90dG9tOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5Cb3R0b20nKTtcblxuXHRcdFx0aGl0c0xlZnRFZGdlID0gKG9mZnNldC5sZWZ0IC0gODAgPCAwKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdFtoaXRzTGVmdEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ0xlZnQuc3R5bGUubWFyZ2luUmlnaHQgPSAoaGl0c0xlZnRFZGdlID8gdGhpcy5wYWRkaW5nTGVmdCAtIHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0Lm9mZnNldFdpZHRoLTE2IDogdGhpcy5wYWRkaW5nTGVmdCArIDE0KSArICdweCc7XG5cblx0XHRcdGhpdHNSaWdodEVkZ2UgPSAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyA4MCA+IHdpbmRvdy5pbm5lcldpZHRoKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IChoaXRzUmlnaHRFZGdlID8gdGhpcy5wYWRkaW5nUmlnaHQgLSB0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQub2Zmc2V0V2lkdGgtMTYgOiB0aGlzLnBhZGRpbmdSaWdodCArIDE0KSArICdweCc7XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uc3R5bGUuYm90dG9tID0gLSh0aGlzLnBhZGRpbmdCb3R0b20gICsgMjQpICsgJ3B4Jztcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3Auc3R5bGUudG9wID0gLSh0aGlzLnBhZGRpbmdUb3AgICsgMjQpICsgJ3B4JztcblxuXHRcdFx0aGl0c0xlZnRFZGdlID0gKG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0IC0gODAgPCAwKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuY2xhc3NMaXN0W2hpdHNMZWZ0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LnN0eWxlLm1hcmdpblJpZ2h0ID0gdGhpcy5wYWRkaW5nTGVmdCArIHRoaXMubWFyZ2luTGVmdCArIChoaXRzTGVmdEVkZ2UgPyAtdGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5vZmZzZXRXaWR0aC0xNyA6IDE0KSArICdweCc7XG5cblx0XHRcdGhpdHNSaWdodEVkZ2UgPSAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggKyB0aGlzLm1hcmdpblJpZ2h0ICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5jbGFzc0xpc3RbaGl0c1JpZ2h0RWRnZSA/ICdhZGQnIDogJ3JlbW92ZSddKCdlZGdlJyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5zdHlsZS5tYXJnaW5MZWZ0ID0gdGhpcy5wYWRkaW5nUmlnaHQgKyB0aGlzLm1hcmdpblJpZ2h0ICsgKGhpdHNSaWdodEVkZ2UgPyAtdGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQub2Zmc2V0V2lkdGgtMTcgOiAxNCkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Cb3R0b20uc3R5bGUuYm90dG9tID0gLXRoaXMubWFyZ2luQm90dG9tIC10aGlzLnBhZGRpbmdCb3R0b20gLTI0ICsgJ3B4Jztcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpblRvcC5zdHlsZS50b3AgPSAtdGhpcy5tYXJnaW5Ub3AgLXRoaXMucGFkZGluZ1RvcCAtMjQgKyAncHgnO1xuXG5cdFx0fSxcblxuXHRcdGdldENhcHRpb25Qcm9wZXJ0eTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Ly8gY2hlY2sgaW4gaW5saW5lIHN0eWxlc1xuXHRcdFx0aWYodGhpcy5jdXJyZW50RWxlbWVudC5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNoZWNrIGluIHJ1bGVzXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKHRoaXMubWF0Y2hlZFJ1bGVzW2ldLnN0eWxlW2Nzc1Byb3BlcnR5XSkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0ucmVwbGFjZSgvKGVtfHB4KS8sICfigIk8c3Bhbj4kMTwvc3Bhbj4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmV0VmFsID0gJyc7XG5cblx0XHRcdGlmKGNzc1Byb3BlcnR5LmluZGV4T2YoJ21hcmdpbicpID4gLTEgfHwgY3NzUHJvcGVydHkuaW5kZXhPZigncGFkZGluZycpID4gLTEpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpc1tjc3NQcm9wZXJ0eV07XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICdoZWlnaHQnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJIZWlnaHQ7XG5cdFx0XHR9IGVsc2UgaWYoY3NzUHJvcGVydHkgPT09ICd3aWR0aCcpIHtcblx0XHRcdFx0cmV0VmFsID0gdGhpcy5pbm5lcldpZHRoO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpbXBsaWNpdCB2YWx1ZVxuXHRcdFx0cmV0dXJuICcoJyArIHJldFZhbCArICfigIk8c3Bhbj5weDwvc3Bhbj4pJztcblxuXHRcdH0sXG5cblx0XHRhY3RpdmF0ZTogZnVuY3Rpb24obmV3RWxlbSkge1xuXG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbmV3RWxlbTtcblx0XHRcdHRoaXMuY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHRcdC8vIGluaXRpYWwgaG92ZXJcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHR0aGlzLm92ZXIgPSB0cnVlO1xuXG5cdFx0XHRpZih0aGlzLmNvbXB1dGVkU3R5bGUuZGlzcGxheSA9PT0gJ2lubGluZScpIHtcblx0XHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3Zlci1pbmxpbmUnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItaW5saW5lJyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGhpZGUgdGhlIGhvdmVyIGdob3N0IGZvciBpbnNwZWN0aW9uXG5cdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZmluZCBtYXRjaGluZyBydWxlc1xuXHRcdFx0dGhpcy5tYXRjaGVkUnVsZXMgPSBTdHlsZVBhcnNlci5yZXNvbHZlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHQvLyBleGVjdXRlIHBsdWdpbnNcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignYWN0aXZhdGUnKTtcblxuXHRcdFx0Ly8gaW5pdCBldmVudHNcblx0XHRcdHRoaXMuaW5pdCgpO1xuXG5cdFx0XHQvLyByZWxheW91dFxuXHRcdFx0dGhpcy5yZWxheW91dCgpO1xuXG5cdFx0fSxcblxuXHRcdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZih0aGlzLnNlbGVjdGVkUnVsZSkge1xuXHRcdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyJywgJ2hvdmVyLWlubmVyJywgJ2hvdmVyLXBhZGRpbmcnLCAnaG92ZXItbWFyZ2luJywgJ2luLWNvbW1hbmQnKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZXhlY3V0ZSBwbHVnaW5zXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2RlYWN0aXZhdGUnKTtcblxuXHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJDb21tYW5kID0gZmFsc2U7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDtcblxuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdrZXl1cCcsIHRoaXMuX19rZXl1cCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2tleWRvd24nLCB0aGlzLl9fa2V5ZG93bik7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBGdW5jdGlvbnMgcmVsYXRlZCB0byBydWxlLWJhc2VkIGVkaXRpbmdcblx0XHQgKi9cblxuXHRcdGVudGVyUnVsZU1vZGU6IGZ1bmN0aW9uKGNzc1J1bGUsIGluZGV4KSB7XG5cblx0XHRcdC8vIGlmIHNlbGVjdGVkUnVsZSBhbmQgbmV3IGNzc1J1bGUgYXJlIHRoZSBzYW1lLCBkb24ndCBkbyBhbnl0aGluZ1xuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUgPT09IGNzc1J1bGUpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiBzZWxlY3RlZFJ1bGUgd2Fzbid0IGVtcHR5LCB3ZSBzaW1wbHkgY2hhbmdlIHRoZSBydWxlXG5cdFx0XHRpZih0aGlzLnNlbGVjdGVkUnVsZSkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGVkUnVsZSA9IGNzc1J1bGU7XG5cdFx0XHRcdHRoaXMuY2FsbFBsdWdpbignY2hhbmdlUnVsZScsIGluZGV4KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gY3NzUnVsZTtcblx0XHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdlbnRlclJ1bGUnLCBpbmRleCk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0ZXhpdFJ1bGVNb2RlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignZXhpdFJ1bGUnKTtcblx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDtcblx0XHR9LFxuXG5cdFx0c2VsZWN0UnVsZTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHR0aGlzLmVudGVyUnVsZU1vZGUodGhpcy5tYXRjaGVkUnVsZXNbaV0sIGkpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBubyBydWxlIG1hdGNoaW5nPyBleGl0IHJ1bGUgbW9kZSB0aGVuXG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXG5cdFx0fSxcblxuXHRcdGRlc2VsZWN0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXHRcdH1cblxuXG5cdH0pO1xuXG5cdC8vIENyZWF0ZSBMYXlvdXQgTW9kZSAoc2luZ2xldG9uKVxuXHR3aW5kb3cuTGF5b3V0TW9kZSA9IG5ldyBMYXlvdXRNb2RlKCk7XG5cbn0pKCk7XG5cblxuIiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMudGl0bGVCb3ggPSAkKCc8ZGl2IGNsYXNzPVwib3ZlcmxheS10aXRsZVwiPjxkaXYgY2xhc3M9XCJ0aXRsZS1ydWxlXCI+PHNwYW4gY2xhc3M9XCJzZWxlY3RlZFwiPmlubGluZSBzdHlsZTwvc3Bhbj4gPHNwYW4gY2xhc3M9XCJ0b2dnbGVcIj7ilr48L3NwYW4+PHVsIGNsYXNzPVwiZHJvcGRvd25cIj48bGk+aW5saW5lIHN0eWxlPC9saT48L3VsPjwvZGl2PjxkaXYgY2xhc3M9XCJ0aXRsZS1wcm9wb3J0aW9uc1wiPjEwMCB4IDEwMDwvZGl2PjwvZGl2PicpXG5cdFx0XHQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSlbMF07XG5cblx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMgPSAkKCcudGl0bGUtcHJvcG9ydGlvbnMnLCB0aGlzLnRpdGxlQm94KVswXTtcblx0XHR0aGlzLnRpdGxlRHJvcGRvd24gPSAkKCcuZHJvcGRvd24nLCB0aGlzLnRpdGxlQm94KTtcblxuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdC8vIGluaXRpYWxpemUgdGl0bGUgYm94IGJlaGF2aW91clxuXHRcdHZhciB0aXRsZUJveCA9IHRoaXMudGl0bGVCb3g7XG5cdFx0dmFyIHRpdGxlRHJvcGRvd24gPSB0aGlzLnRpdGxlRHJvcGRvd247XG5cblx0XHQkKCdzcGFuJywgdGl0bGVCb3gpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdFx0JCgnLmRyb3Bkb3duJywgdGl0bGVCb3gpLnRvZ2dsZSgpO1xuXHRcdH0pO1xuXG5cblx0XHR0aXRsZURyb3Bkb3duLm9uKCdjbGljaycsICdsaScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGl0bGVEcm9wZG93bi5oaWRlKCk7XG5cdFx0XHQkKCcuc2VsZWN0ZWQnLCB0aXRsZUJveCkuaHRtbCh0aGlzLmlubmVySFRNTCk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmZpbGxSdWxlcygpO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0XHQkKCdzcGFuJywgdGhpcy50aXRsZUJveCkub2ZmKCdjbGljaycpO1xuXHRcdCQoJ3NwYW4nLCB0aGlzLnRpdGxlRHJvcGRvd24pLm9mZignY2xpY2snKTtcblx0fSxcblxuXHRlbnRlclJ1bGU6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dGhpcy50aXRsZUJveC5jbGFzc0xpc3QuYWRkKCdydWxlJyk7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5zdHlsZS56SW5kZXggPSAxMDAwMjtcblx0XHR0aGlzLmNoYW5nZVJ1bGUoaW5kZXgpO1xuXHR9LFxuXG5cdGNoYW5nZVJ1bGU6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dGhpcy50aXRsZURyb3Bkb3duLmZpbmQoJ2xpOmVxKCcgKyAoaW5kZXggKyAxKSArICcpJykuY2xpY2soKTtcblx0fSxcblxuXHRleGl0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0JCgnc3Bhbi5zZWxlY3RlZCcsIHRoaXMudGl0bGVCb3gpLmh0bWwoJ2lubGluZSBzdHlsZScpO1xuXHRcdHRoaXMudGl0bGVCb3guY2xhc3NMaXN0LnJlbW92ZSgncnVsZScpO1xuXHRcdExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQuc3R5bGUuekluZGV4ID0gJyc7XG5cdH0sXG5cblx0cmVsYXlvdXQ6IGZ1bmN0aW9uKHByb3BzKSB7XG5cblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0Ly8gcGxhY2UgdGl0bGUgYm94XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArIChvZmZzZXQubGVmdCArICgocHJvcHMub3V0ZXJXaWR0aCAtIHRoaXMudGl0bGVCb3gub2Zmc2V0V2lkdGgpIC8gMikpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgLSBwcm9wcy5tYXJnaW5Ub3AgLSA1NSkgKyAncHgpJztcblx0XHR0aGlzLnRpdGxlUHJvcG9ydGlvbnMuaW5uZXJIVE1MID0gcHJvcHMub3V0ZXJXaWR0aCArICcgeCAnICsgcHJvcHMub3V0ZXJIZWlnaHQ7XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0ZmlsbFJ1bGVzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciByZXNvbHZlZCA9IExheW91dE1vZGUubWF0Y2hlZFJ1bGVzO1xuXG5cdFx0dGhpcy50aXRsZURyb3Bkb3duLmVtcHR5KCk7XG5cdFx0JCgnPGxpPmlubGluZSBzdHlsZTwvbGk+JykuYXBwZW5kVG8odGhpcy50aXRsZURyb3Bkb3duKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc29sdmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQkKCc8bGk+JyArIHJlc29sdmVkW2ldLnNlbGVjdG9yVGV4dCArICc8L2xpPicpXG5cdFx0XHRcdC5kYXRhKCdjc3NSdWxlJywgcmVzb2x2ZWRbaV0pXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLnRpdGxlRHJvcGRvd24pO1xuXHRcdH1cblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgb3ZlcmxheSA9IExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQ7XG5cblx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMpIHtcblxuXHRcdC8vIHBhZGRpbmcgZ3VpZGVzXG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdMZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1wcm9wcy5vZmZzZXQudG9wIC1wcm9wcy5wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5sZWZ0ID0gLXByb3BzLnBhZGRpbmdMZWZ0ICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUucmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0LTEgKyAncHgnO1xuXG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS5ib3R0b20gPSAtcHJvcHMucGFkZGluZ0JvdHRvbS0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcHJvcHMub2Zmc2V0LmxlZnQgLXByb3BzLnBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudG9wID0gLXByb3BzLnBhZGRpbmdUb3AtMSArICdweCc7XG5cblx0XHQvLyBtYXJnaW4gZ3VpZGVzXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdC5zdHlsZS5sZWZ0ID0gLXByb3BzLnBhZGRpbmdMZWZ0IC1wcm9wcy5tYXJnaW5MZWZ0ICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtcHJvcHMub2Zmc2V0LnRvcCAtcHJvcHMucGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUucmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0IC1wcm9wcy5tYXJnaW5SaWdodCAtIDEgKyAncHgnO1xuXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXByb3BzLm9mZnNldC5sZWZ0IC1wcm9wcy5wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbS5zdHlsZS5ib3R0b20gPSAtcHJvcHMucGFkZGluZ0JvdHRvbSAtcHJvcHMubWFyZ2luQm90dG9tIC0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3Auc3R5bGUudG9wID0gLXByb3BzLnBhZGRpbmdUb3AgLXByb3BzLm1hcmdpblRvcCAtMSArICdweCc7XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXG5cdGVudGVyUnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jcmVhdGVHaG9zdHMoKTtcblx0fSxcblxuXHRjaGFuZ2VSdWxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3lHaG9zdHMoKTtcblx0XHR0aGlzLmNyZWF0ZUdob3N0cygpO1xuXHR9LFxuXG5cdGV4aXRSdWxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3lHaG9zdHMoKTtcblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0Z2hvc3RzOiBbXSxcblxuXHRjcmVhdGVHaG9zdHM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBnaG9zdHMgPSB0aGlzLmdob3N0cztcblx0XHQkKExheW91dE1vZGUuc2VsZWN0ZWRSdWxlLnNlbGVjdG9yVGV4dCkubm90KExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLm5vdCgnLm92ZXJsYXksIC5vdmVybGF5IConKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGdob3N0ID0gbmV3IEdob3N0KHRoaXMpO1xuXHRcdFx0Z2hvc3QucmVsYXlvdXQoKTtcblx0XHRcdGdob3N0cy5wdXNoKGdob3N0KTtcblx0XHR9KTtcblx0fSxcblxuXHRkZXN0cm95R2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmdob3N0c1tpXS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdHRoaXMuZ2hvc3RzID0gW107XG5cdH0sXG5cblx0dXBkYXRlR2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRpZighdGhpcy5naG9zdHMpIHJldHVybjtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmdob3N0c1tpXS5yZWxheW91dCgpO1xuXHRcdH1cdFx0XG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScsIHRydWUpO1xuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICdub25lJztcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScpO1xuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICcnO1xuXG5cdH1cblxufSk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdC8vIG1ha2UgYWxsIGVsZW1lbnRzIG9uIHBhZ2UgaW5zcGVjdGFibGVcblx0JCgnYm9keSAqOm5vdCgub3ZlcmxheSwub3ZlcmxheSAqLC5vdmVybGF5LXRpdGxlLC5vdmVybGF5LXRpdGxlICopJykub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuXG5cdFx0TGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQgPSB0aGlzO1xuXG5cdFx0Ly8gaW4gbm9ybWFsIG1vZGUsIGRvbid0IGFjdGl2YXRlIHRoZSBob3ZlciBnaG9zdCB3aGVuIGludGVyYWN0aW5nIG9yIG92ZXIgdGhlIGN1cnJlbnQgZWxcblx0XHRpZihMYXlvdXRNb2RlLmhvdmVyR2hvc3QuY3VycmVudEVsZW1lbnQgPT09IHRoaXMgfHwgTGF5b3V0TW9kZS5pbnRlcmFjdGluZyB8fCBMYXlvdXRNb2RlLm92ZXIpXG5cdFx0XHRyZXR1cm47XG5cblx0XHRMYXlvdXRNb2RlLmhvdmVyR2hvc3QucmVsYXlvdXQodGhpcyk7XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0fSk7XG5cblx0Ly8gbWFrZSBhbGwgZWxlbWVudHMgb24gcGFnZSBpbnNwZWN0YWJsZVxuXHQkKCdib2R5ICo6bm90KC5vdmVybGF5LC5vdmVybGF5ICosLm92ZXJsYXktdGl0bGUsLm92ZXJsYXktdGl0bGUgKiknKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblxuXHRcdGlmKExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgPT09IHRoaXMpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRpZihMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRMYXlvdXRNb2RlLmRlYWN0aXZhdGUoKTtcblx0XHR9XG5cblx0XHQvLyBzeW5jIG9uIHRoZSBlbGVtZW50XG5cdFx0TGF5b3V0TW9kZS5hY3RpdmF0ZSh0aGlzKTtcblxuXHRcdHJldHVybiBmYWxzZTtcblxuXHR9KTtcblxuXHQvLyQoJ3VsJykuc29ydGFibGUoKTtcblx0JCgnI3Rlc3Rib3gnKS5jbGljaygpO1xuXG5cbn0pKCk7XG5cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
