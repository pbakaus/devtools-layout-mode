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

					if(that.currentElement === this)
						return false;

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
				if(!that.currentElement || that.hidden) {
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



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdob3N0LmpzIiwiU3R5bGVQYXJzZXIuanMiLCJMYXlvdXRNb2RlLmpzIiwiVGl0bGUuanMiLCJHdWlkZXMuanMiLCJHaG9zdHMuanMiLCJDb250ZW50RWRpdGFibGUuanMiLCJDb21wYXJlQW5kUHJldmlldy5qcyIsImluaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbC9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgR2hvc3QgPSBmdW5jdGlvbihlbGVtKSB7XG5cblx0dGhpcy5vdmVybGF5RWxlbWVudCA9IHRoaXMuY3JlYXRlKCk7XG5cdHRoaXMuY3VycmVudEVsZW1lbnQgPSBlbGVtO1xuXG59O1xuXG4kLmV4dGVuZChHaG9zdC5wcm90b3R5cGUsIHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGdob3N0ID0gJCgnPGRpdiBjbGFzcz1cIm92ZXJsYXkgZ2hvc3RcIj48L2Rpdj4nKTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItbWFyZ2luIGxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhnaG9zdCk7XG5cdFx0JCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1wYWRkaW5nIHRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblx0XHQkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8oZ2hvc3QpO1xuXHRcdCQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKGdob3N0KTtcblxuXHRcdGdob3N0LmFwcGVuZFRvKCdib2R5Jyk7XG5cdFx0cmV0dXJuIGdob3N0WzBdO1xuXG5cdH0sXG5cblx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vdmVybGF5RWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHR9LFxuXG5cdHJlbGF5b3V0OiBmdW5jdGlvbihuZXdFbGVtKSB7XG5cblx0XHRpZihuZXdFbGVtKSB7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbmV3RWxlbTtcblx0XHR9XG5cblx0XHR2YXIgb3ZlcmxheUVsZW1lbnQgPSB0aGlzLm92ZXJsYXlFbGVtZW50O1xuXHRcdHZhciBlbGVtID0gJCh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblx0XHR2YXIgb2Zmc2V0ID0gZWxlbS5vZmZzZXQoKTtcblxuXHRcdHZhciBjb21wdXRlZFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdHZhciBpbm5lcldpZHRoID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS53aWR0aCk7XG5cdFx0dmFyIGlubmVySGVpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5oZWlnaHQpO1xuXG5cdFx0dmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nTGVmdCk7XG5cdFx0dmFyIHBhZGRpbmdUb3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdUb3ApO1xuXHRcdHZhciBwYWRkaW5nUmlnaHQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdSaWdodCk7XG5cdFx0dmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdCb3R0b20pO1xuXG5cdFx0dmFyIG1hcmdpbkxlZnQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkxlZnQpO1xuXHRcdHZhciBtYXJnaW5Ub3AgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpblRvcCk7XG5cdFx0dmFyIG1hcmdpblJpZ2h0ID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5SaWdodCk7XG5cdFx0dmFyIG1hcmdpbkJvdHRvbSA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luQm90dG9tKTtcblxuXHRcdHZhciBvdXRlcldpZHRoID0gaW5uZXJXaWR0aCArIHBhZGRpbmdMZWZ0ICsgcGFkZGluZ1JpZ2h0O1xuXHRcdHZhciBvdXRlckhlaWdodCA9IGlubmVySGVpZ2h0ICsgcGFkZGluZ1RvcCArIHBhZGRpbmdCb3R0b207XG5cblx0XHQvLyBwbGFjZSBhbmQgcmVzaXplIG92ZXJsYXlcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS53aWR0aCA9IGlubmVyV2lkdGggKyAncHgnO1xuXHRcdG92ZXJsYXlFbGVtZW50LnN0eWxlLmhlaWdodCA9IGlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAob2Zmc2V0LmxlZnQgKyBwYWRkaW5nTGVmdCkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCArIHBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cblx0XHQvLyBtb2RpZnkgcGFkZGluZyBib3hcblxuXHRcdC8vIGxlZnRcblx0XHQkKCcuY29udGFpbmVyLXBhZGRpbmcubGVmdCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IHBhZGRpbmdMZWZ0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCxcblx0XHRcdHRvcDogLXBhZGRpbmdUb3AsXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHRcdC8vIHJpZ2h0XG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLnJpZ2h0Jywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogcGFkZGluZ1JpZ2h0LFxuXHRcdFx0aGVpZ2h0OiBvdXRlckhlaWdodCxcblx0XHRcdHRvcDogLXBhZGRpbmdUb3AsXG5cdFx0XHRyaWdodDogLXBhZGRpbmdSaWdodFxuXHRcdH0pO1xuXG5cdFx0Ly8gdG9wXG5cdFx0JCgnLmNvbnRhaW5lci1wYWRkaW5nLnRvcCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IGlubmVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHBhZGRpbmdUb3AsXG5cdFx0XHR0b3A6IC1wYWRkaW5nVG9wXG5cdFx0fSk7XG5cblx0XHQvLyBib3R0b21cblx0XHQkKCcuY29udGFpbmVyLXBhZGRpbmcuYm90dG9tJywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogaW5uZXJXaWR0aCxcblx0XHRcdGhlaWdodDogcGFkZGluZ0JvdHRvbSxcblx0XHRcdGJvdHRvbTogLXBhZGRpbmdCb3R0b21cblx0XHR9KTtcblxuXHRcdC8vIG1vZGlmeSBtYXJnaW4gYm94XG5cblx0XHQvLyBsZWZ0XG5cdFx0JCgnLmNvbnRhaW5lci1tYXJnaW4ubGVmdCcsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG1hcmdpbkxlZnQsXG5cdFx0XHRoZWlnaHQ6IG91dGVySGVpZ2h0ICsgbWFyZ2luVG9wICsgbWFyZ2luQm90dG9tLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0bGVmdDogLShwYWRkaW5nTGVmdCArIG1hcmdpbkxlZnQpXG5cdFx0fSk7XG5cblx0XHQvLyByaWdodFxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLnJpZ2h0Jywgb3ZlcmxheUVsZW1lbnQpLmNzcyh7XG5cdFx0XHR3aWR0aDogbWFyZ2luUmlnaHQsXG5cdFx0XHRoZWlnaHQ6IG91dGVySGVpZ2h0ICsgbWFyZ2luVG9wICsgbWFyZ2luQm90dG9tLFxuXHRcdFx0dG9wOiAtKHBhZGRpbmdUb3AgKyBtYXJnaW5Ub3ApLFxuXHRcdFx0cmlnaHQ6IC0ocGFkZGluZ1JpZ2h0ICsgbWFyZ2luUmlnaHQpXG5cdFx0fSk7XG5cblx0XHQvLyB0b3Bcblx0XHQkKCcuY29udGFpbmVyLW1hcmdpbi50b3AnLCBvdmVybGF5RWxlbWVudCkuY3NzKHtcblx0XHRcdHdpZHRoOiBvdXRlcldpZHRoLFxuXHRcdFx0aGVpZ2h0OiBtYXJnaW5Ub3AsXG5cdFx0XHR0b3A6IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCksXG5cdFx0XHRsZWZ0OiAtcGFkZGluZ0xlZnRcblx0XHR9KTtcblxuXHRcdC8vIGJvdHRvbVxuXHRcdCQoJy5jb250YWluZXItbWFyZ2luLmJvdHRvbScsIG92ZXJsYXlFbGVtZW50KS5jc3Moe1xuXHRcdFx0d2lkdGg6IG91dGVyV2lkdGgsXG5cdFx0XHRoZWlnaHQ6IG1hcmdpbkJvdHRvbSxcblx0XHRcdGJvdHRvbTogLShwYWRkaW5nQm90dG9tICsgbWFyZ2luQm90dG9tKSxcblx0XHRcdGxlZnQ6IC1wYWRkaW5nTGVmdFxuXHRcdH0pO1xuXG5cdH1cblxufSk7IiwiLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcGVjaWZpY2l0eSBvZiBDU1Mgc2VsZWN0b3JzXG4gKiBodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXNlbGVjdG9ycy8jc3BlY2lmaWNpdHlcbiAqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAgLSBzZWxlY3RvcjogdGhlIGlucHV0XG4gKiAgLSBzcGVjaWZpY2l0eTogZS5nLiAwLDEsMCwwXG4gKiAgLSBwYXJ0czogYXJyYXkgd2l0aCBkZXRhaWxzIGFib3V0IGVhY2ggcGFydCBvZiB0aGUgc2VsZWN0b3IgdGhhdCBjb3VudHMgdG93YXJkcyB0aGUgc3BlY2lmaWNpdHlcbiAqL1xudmFyIFNQRUNJRklDSVRZID0gKGZ1bmN0aW9uKCkge1xuXHR2YXIgY2FsY3VsYXRlLFxuXHRcdGNhbGN1bGF0ZVNpbmdsZTtcblxuXHRjYWxjdWxhdGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdHZhciBzZWxlY3RvcnMsXG5cdFx0XHRzZWxlY3Rvcixcblx0XHRcdGksXG5cdFx0XHRsZW4sXG5cdFx0XHRyZXN1bHRzID0gW107XG5cblx0XHQvLyBTZXBhcmF0ZSBpbnB1dCBieSBjb21tYXNcblx0XHRzZWxlY3RvcnMgPSBpbnB1dC5zcGxpdCgnLCcpO1xuXG5cdFx0Zm9yIChpID0gMCwgbGVuID0gc2VsZWN0b3JzLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKSB7XG5cdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yc1tpXTtcblx0XHRcdGlmIChzZWxlY3Rvci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHJlc3VsdHMucHVzaChjYWxjdWxhdGVTaW5nbGUoc2VsZWN0b3IpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0cztcblx0fTtcblxuXHQvLyBDYWxjdWxhdGUgdGhlIHNwZWNpZmljaXR5IGZvciBhIHNlbGVjdG9yIGJ5IGRpdmlkaW5nIGl0IGludG8gc2ltcGxlIHNlbGVjdG9ycyBhbmQgY291bnRpbmcgdGhlbVxuXHRjYWxjdWxhdGVTaW5nbGUgPSBmdW5jdGlvbihpbnB1dCkge1xuXHRcdHZhciBzZWxlY3RvciA9IGlucHV0LFxuXHRcdFx0ZmluZE1hdGNoLFxuXHRcdFx0dHlwZUNvdW50ID0ge1xuXHRcdFx0XHQnYSc6IDAsXG5cdFx0XHRcdCdiJzogMCxcblx0XHRcdFx0J2MnOiAwXG5cdFx0XHR9LFxuXHRcdFx0cGFydHMgPSBbXSxcblx0XHRcdC8vIFRoZSBmb2xsb3dpbmcgcmVndWxhciBleHByZXNzaW9ucyBhc3N1bWUgdGhhdCBzZWxlY3RvcnMgbWF0Y2hpbmcgdGhlIHByZWNlZGluZyByZWd1bGFyIGV4cHJlc3Npb25zIGhhdmUgYmVlbiByZW1vdmVkXG5cdFx0XHRhdHRyaWJ1dGVSZWdleCA9IC8oXFxbW15cXF1dK1xcXSkvZyxcblx0XHRcdGlkUmVnZXggPSAvKCNbXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0Y2xhc3NSZWdleCA9IC8oXFwuW15cXHNcXCs+flxcLlxcWzpdKykvZyxcblx0XHRcdHBzZXVkb0VsZW1lbnRSZWdleCA9IC8oOjpbXlxcc1xcKz5+XFwuXFxbOl0rfDpmaXJzdC1saW5lfDpmaXJzdC1sZXR0ZXJ8OmJlZm9yZXw6YWZ0ZXIpL2dpLFxuXHRcdFx0Ly8gQSByZWdleCBmb3IgcHNldWRvIGNsYXNzZXMgd2l0aCBicmFja2V0cyAtIDpudGgtY2hpbGQoKSwgOm50aC1sYXN0LWNoaWxkKCksIDpudGgtb2YtdHlwZSgpLCA6bnRoLWxhc3QtdHlwZSgpLCA6bGFuZygpXG5cdFx0XHRwc2V1ZG9DbGFzc1dpdGhCcmFja2V0c1JlZ2V4ID0gLyg6W1xcdy1dK1xcKFteXFwpXSpcXCkpL2dpLFxuXHRcdFx0Ly8gQSByZWdleCBmb3Igb3RoZXIgcHNldWRvIGNsYXNzZXMsIHdoaWNoIGRvbid0IGhhdmUgYnJhY2tldHNcblx0XHRcdHBzZXVkb0NsYXNzUmVnZXggPSAvKDpbXlxcc1xcKz5+XFwuXFxbOl0rKS9nLFxuXHRcdFx0ZWxlbWVudFJlZ2V4ID0gLyhbXlxcc1xcKz5+XFwuXFxbOl0rKS9nO1xuXG5cdFx0Ly8gRmluZCBtYXRjaGVzIGZvciBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBpbiBhIHN0cmluZyBhbmQgcHVzaCB0aGVpciBkZXRhaWxzIHRvIHBhcnRzXG5cdFx0Ly8gVHlwZSBpcyBcImFcIiBmb3IgSURzLCBcImJcIiBmb3IgY2xhc3NlcywgYXR0cmlidXRlcyBhbmQgcHNldWRvLWNsYXNzZXMgYW5kIFwiY1wiIGZvciBlbGVtZW50cyBhbmQgcHNldWRvLWVsZW1lbnRzXG5cdFx0ZmluZE1hdGNoID0gZnVuY3Rpb24ocmVnZXgsIHR5cGUpIHtcblx0XHRcdHZhciBtYXRjaGVzLCBpLCBsZW4sIG1hdGNoLCBpbmRleCwgbGVuZ3RoO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaChyZWdleCk7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdFx0XHR0eXBlQ291bnRbdHlwZV0gKz0gMTtcblx0XHRcdFx0XHRtYXRjaCA9IG1hdGNoZXNbaV07XG5cdFx0XHRcdFx0aW5kZXggPSBzZWxlY3Rvci5pbmRleE9mKG1hdGNoKTtcblx0XHRcdFx0XHRsZW5ndGggPSBtYXRjaC5sZW5ndGg7XG5cdFx0XHRcdFx0cGFydHMucHVzaCh7XG5cdFx0XHRcdFx0XHRzZWxlY3RvcjogbWF0Y2gsXG5cdFx0XHRcdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0XHRcdFx0aW5kZXg6IGluZGV4LFxuXHRcdFx0XHRcdFx0bGVuZ3RoOiBsZW5ndGhcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBSZXBsYWNlIHRoaXMgc2ltcGxlIHNlbGVjdG9yIHdpdGggd2hpdGVzcGFjZSBzbyBpdCB3b24ndCBiZSBjb3VudGVkIGluIGZ1cnRoZXIgc2ltcGxlIHNlbGVjdG9yc1xuXHRcdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZShtYXRjaCwgQXJyYXkobGVuZ3RoICsgMSkuam9pbignICcpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBSZW1vdmUgdGhlIG5lZ2F0aW9uIHBzdWVkby1jbGFzcyAoOm5vdCkgYnV0IGxlYXZlIGl0cyBhcmd1bWVudCBiZWNhdXNlIHNwZWNpZmljaXR5IGlzIGNhbGN1bGF0ZWQgb24gaXRzIGFyZ3VtZW50XG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZ2V4ID0gLzpub3RcXCgoW15cXCldKilcXCkvZztcblx0XHRcdGlmIChyZWdleC50ZXN0KHNlbGVjdG9yKSkge1xuXHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UocmVnZXgsICcgICAgICQxICcpO1xuXHRcdFx0fVxuXHRcdH0oKSk7XG5cblx0XHQvLyBSZW1vdmUgYW55dGhpbmcgYWZ0ZXIgYSBsZWZ0IGJyYWNlIGluIGNhc2UgYSB1c2VyIGhhcyBwYXN0ZWQgaW4gYSBydWxlLCBub3QganVzdCBhIHNlbGVjdG9yXG5cdFx0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHJlZ2V4ID0gL3tbXl0qL2dtLFxuXHRcdFx0XHRtYXRjaGVzLCBpLCBsZW4sIG1hdGNoO1xuXHRcdFx0aWYgKHJlZ2V4LnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdG1hdGNoZXMgPSBzZWxlY3Rvci5tYXRjaChyZWdleCk7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGxlbiA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcblx0XHRcdFx0XHRtYXRjaCA9IG1hdGNoZXNbaV07XG5cdFx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG1hdGNoLCBBcnJheShtYXRjaC5sZW5ndGggKyAxKS5qb2luKCcgJykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSgpKTtcblxuXHRcdC8vIEFkZCBhdHRyaWJ1dGUgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2goYXR0cmlidXRlUmVnZXgsICdiJyk7XG5cblx0XHQvLyBBZGQgSUQgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYSlcblx0XHRmaW5kTWF0Y2goaWRSZWdleCwgJ2EnKTtcblxuXHRcdC8vIEFkZCBjbGFzcyBzZWxlY3RvcnMgdG8gcGFydHMgY29sbGVjdGlvbiAodHlwZSBiKVxuXHRcdGZpbmRNYXRjaChjbGFzc1JlZ2V4LCAnYicpO1xuXG5cdFx0Ly8gQWRkIHBzZXVkby1lbGVtZW50IHNlbGVjdG9ycyB0byBwYXJ0cyBjb2xsZWN0aW9uICh0eXBlIGMpXG5cdFx0ZmluZE1hdGNoKHBzZXVkb0VsZW1lbnRSZWdleCwgJ2MnKTtcblxuXHRcdC8vIEFkZCBwc2V1ZG8tY2xhc3Mgc2VsZWN0b3JzIHRvIHBhcnRzIGNvbGxlY3Rpb24gKHR5cGUgYilcblx0XHRmaW5kTWF0Y2gocHNldWRvQ2xhc3NXaXRoQnJhY2tldHNSZWdleCwgJ2InKTtcblx0XHRmaW5kTWF0Y2gocHNldWRvQ2xhc3NSZWdleCwgJ2InKTtcblxuXHRcdC8vIFJlbW92ZSB1bml2ZXJzYWwgc2VsZWN0b3IgYW5kIHNlcGFyYXRvciBjaGFyYWN0ZXJzXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC9bXFwqXFxzXFwrPn5dL2csICcgJyk7XG5cblx0XHQvLyBSZW1vdmUgYW55IHN0cmF5IGRvdHMgb3IgaGFzaGVzIHdoaWNoIGFyZW4ndCBhdHRhY2hlZCB0byB3b3Jkc1xuXHRcdC8vIFRoZXNlIG1heSBiZSBwcmVzZW50IGlmIHRoZSB1c2VyIGlzIGxpdmUtZWRpdGluZyB0aGlzIHNlbGVjdG9yXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC9bI1xcLl0vZywgJyAnKTtcblxuXHRcdC8vIFRoZSBvbmx5IHRoaW5ncyBsZWZ0IHNob3VsZCBiZSBlbGVtZW50IHNlbGVjdG9ycyAodHlwZSBjKVxuXHRcdGZpbmRNYXRjaChlbGVtZW50UmVnZXgsICdjJyk7XG5cblx0XHQvLyBPcmRlciB0aGUgcGFydHMgaW4gdGhlIG9yZGVyIHRoZXkgYXBwZWFyIGluIHRoZSBvcmlnaW5hbCBzZWxlY3RvclxuXHRcdC8vIFRoaXMgaXMgbmVhdGVyIGZvciBleHRlcm5hbCBhcHBzIHRvIGRlYWwgd2l0aFxuXHRcdHBhcnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0cmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yOiBpbnB1dCxcblx0XHRcdHNwZWNpZmljaXR5OiAnMCwnICsgdHlwZUNvdW50LmEudG9TdHJpbmcoKSArICcsJyArIHR5cGVDb3VudC5iLnRvU3RyaW5nKCkgKyAnLCcgKyB0eXBlQ291bnQuYy50b1N0cmluZygpLFxuXHRcdFx0cGFydHM6IHBhcnRzXG5cdFx0fTtcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGNhbGN1bGF0ZTogY2FsY3VsYXRlXG5cdH07XG59KCkpO1xuXG5cbihmdW5jdGlvbigpIHtcblxuXHR2YXIgU3R5bGVQYXJzZXIgPSB7fTtcblxuXHR2YXIgcnVsZXMgPSB7fTtcblx0dmFyIHNoZWV0cyA9IGRvY3VtZW50LnN0eWxlU2hlZXRzO1xuXG5cdHZhciBzaGVldCwgcnVsZTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzaGVldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcblx0XHRzaGVldCA9IHNoZWV0c1tpXTtcblx0XHRpZighc2hlZXQuY3NzUnVsZXMpIGNvbnRpbnVlO1xuXG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzaGVldC5jc3NSdWxlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0cnVsZSA9IHNoZWV0LmNzc1J1bGVzW2pdO1xuXHRcdFx0cnVsZXNbcnVsZS5zZWxlY3RvclRleHRdID0gcnVsZTtcblx0XHR9XG5cdH1cblxuXHRTdHlsZVBhcnNlci5yZXNvbHZlID0gZnVuY3Rpb24odHJhY2tlZEVsZW1lbnQpIHtcblxuXHRcdHZhciBtYXRjaGVkUnVsZXMgPSB3aW5kb3cuZ2V0TWF0Y2hlZENTU1J1bGVzKHRyYWNrZWRFbGVtZW50KSB8fCBbXTtcblx0XHR2YXIgcnVsZXMgPSBbXTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cnVsZXMucHVzaChbbWF0Y2hlZFJ1bGVzW2ldLCBwYXJzZUludChTUEVDSUZJQ0lUWS5jYWxjdWxhdGUobWF0Y2hlZFJ1bGVzW2ldLnNlbGVjdG9yVGV4dClbMF0uc3BlY2lmaWNpdHkucmVwbGFjZSgvXFwsL2csICcnKSwgMTApICsgMC4wMSAqIGldKTtcblx0XHR9XG5cblxuXG5cdFx0cnVsZXMgPSBydWxlc1xuXHRcdFx0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuXHRcdFx0XHRyZXR1cm4gYlsxXSAtIGFbMV07XG5cdFx0XHR9KVxuXHRcdFx0Lm1hcChmdW5jdGlvbihhKSB7XG5cdFx0XHRcdHJldHVybiBhWzBdO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcnVsZXM7XG5cblx0fTtcblxuXHR3aW5kb3cuU3R5bGVQYXJzZXIgPSBTdHlsZVBhcnNlcjtcblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0dmFyIExheW91dE1vZGUgPSBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMub3ZlcmxheUVsZW1lbnQgPSBudWxsOyAvLyB0aGUgYWN0dWFsIG92ZXJsYXkgZGl2XG5cdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG51bGw7IC8vIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudFxuXHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDsgLy8gd2hlbiBkZWZpbmVkLCB3ZSdyZSBpbiBydWxlIG1vZGVcblx0XHR0aGlzLmhvdmVyR2hvc3QgPSBuZXcgR2hvc3QoKTsgLy8gdGhlIGhvdmVyIGdob3N0XG5cdFx0dGhpcy5vdmVyID0gZmFsc2U7IC8vIG9uIHdoZXRoZXIgd2UncmUgY3VycmVubHkgaG92ZXJpbmcgYSBjZXJ0YWluIHBhcnQgb2YgdGhlIG92ZXJsYXlcblx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdHRoaXMub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLmludGVyYWN0aW5nID0gZmFsc2U7IC8vIHdoZXRoZXIgd2UncmUgY3VycmVudGx5IGludGVyYWN0aW5nIHdpdGggdGhlIGVsZW1lbnRcblxuXHRcdC8vIGluaXRpYWxpemVcblx0XHR0aGlzLmNyZWF0ZSgpO1xuXG5cdH07XG5cblx0JC5leHRlbmQoTGF5b3V0TW9kZS5wcm90b3R5cGUsIHtcblxuXHRcdHBsdWdpbnM6IFtdLFxuXG5cdFx0cmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbikge1xuXHRcdFx0dGhpcy5wbHVnaW5zLnB1c2gocGx1Z2luKTtcblx0XHRcdGlmKHBsdWdpbi5jcmVhdGUpIHtcblx0XHRcdFx0cGx1Z2luLmNyZWF0ZS5jYWxsKHBsdWdpbik7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGNhbGxQbHVnaW46IGZ1bmN0aW9uKGV2ZW50TmFtZSwgYSwgYiwgYywgZCwgZSwgZikge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsdWdpbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYodGhpcy5wbHVnaW5zW2ldW2V2ZW50TmFtZV0pIHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbnNbaV1bZXZlbnROYW1lXS5jYWxsKHRoaXMucGx1Z2luc1tpXSwgYSwgYiwgYywgZCwgZSwgZik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZW5hYmxlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBtYWtlIGFsbCBlbGVtZW50cyBvbiBwYWdlIGluc3BlY3RhYmxlXG5cdFx0XHQkKCdib2R5ICo6bm90KC5vdmVybGF5LC5vdmVybGF5ICosLm92ZXJsYXktdGl0bGUsLm92ZXJsYXktdGl0bGUgKiknKVxuXHRcdFx0XHQub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblxuXHRcdFx0XHRcdHZhciB0YXJnZXRDaGFuZ2VkID0gdGhhdC5ob3ZlckVsZW1lbnQgIT09IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5ob3ZlckVsZW1lbnQgPSB0aGlzO1xuXG5cdFx0XHRcdFx0aWYodGFyZ2V0Q2hhbmdlZCkge1xuXHRcdFx0XHRcdFx0dGhhdC5jYWxsUGx1Z2luKCdob3ZlclRhcmdldENoYW5nZScsIGUpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIGluIG5vcm1hbCBtb2RlLCBkb24ndCBhY3RpdmF0ZSB0aGUgaG92ZXIgZ2hvc3Qgd2hlbiBpbnRlcmFjdGluZyBvciBvdmVyIHRoZSBjdXJyZW50IGVsXG5cdFx0XHRcdFx0aWYodGhhdC5ob3Zlckdob3N0LmN1cnJlbnRFbGVtZW50ID09PSB0aGlzIHx8IHRoYXQuaW50ZXJhY3RpbmcgfHwgdGhhdC5vdmVyKVxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRcdFx0dGhhdC5ob3Zlckdob3N0LnJlbGF5b3V0KHRoaXMpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdGlmKHRoYXQuY3VycmVudEVsZW1lbnQgPT09IHRoaXMpXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdFx0XHRpZih0aGF0LmN1cnJlbnRFbGVtZW50KSB7XG5cdFx0XHRcdFx0XHR0aGF0LmRlYWN0aXZhdGUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBzeW5jIG9uIHRoZSBlbGVtZW50XG5cdFx0XHRcdFx0dGhhdC5hY3RpdmF0ZSh0aGlzKTtcblxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHR9KTtcdFx0XG5cblx0XHR9LFxuXG5cdFx0Y3JlYXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY3JlYXRlT3ZlcmxheSgpO1xuXHRcdFx0XG5cdFx0fSxcblxuXHRcdGNyZWF0ZU92ZXJsYXk6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50ID0gJCgnPGRpdiBpZD1cIm92ZXJsYXlcIiBjbGFzcz1cIm92ZXJsYXlcIj48L2Rpdj4nKVswXTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3AgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLW1hcmdpbiBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNvbnRhaW5lck1hcmdpblJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImNvbnRhaW5lci1tYXJnaW4gcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ1RvcCA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyB0b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJjb250YWluZXItcGFkZGluZyBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0xlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY29udGFpbmVyLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdFxuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBib3R0b20gaGFuZGxlLXNpemVcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIGhlaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSBib3R0b20gaGFuZGxlLXBhZGRpbmdcIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIHBhZGRpbmctYm90dG9tXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgYm90dG9tIGhhbmRsZS1tYXJnaW5cIiB0aXRsZT1cIkRyYWcgdG8gY2hhbmdlIG1hcmdpbi1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlU2l6ZVJpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtc2l6ZVwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2Ugd2lkdGhcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSByaWdodCBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy1yaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgcmlnaHQgaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLXJpZ2h0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIHRvcCBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImhhbmRsZSB0b3AgaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLXRvcFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJoYW5kbGUgbGVmdCBoYW5kbGUtcGFkZGluZ1wiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgcGFkZGluZy1sZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudCk7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnQgPSAkKCc8ZGl2IGNsYXNzPVwiaGFuZGxlIGxlZnQgaGFuZGxlLW1hcmdpblwiIHRpdGxlPVwiRHJhZyB0byBjaGFuZ2UgbWFyZ2luLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KTtcblxuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGggPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXdpZHRoXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLWhlaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJjYXB0aW9uIGNhcHRpb24tcGFkZGluZyBsZWZ0XCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdUb3AgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLXBhZGRpbmcgdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1wYWRkaW5nIGJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0ID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1tYXJnaW4gbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQgPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiByaWdodFwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMub3ZlcmxheUVsZW1lbnQpWzBdO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImNhcHRpb24gY2FwdGlvbi1tYXJnaW4gdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8odGhpcy5vdmVybGF5RWxlbWVudClbMF07XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Cb3R0b20gPSAkKCc8ZGl2IGNsYXNzPVwiY2FwdGlvbiBjYXB0aW9uLW1hcmdpbiBib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyh0aGlzLm92ZXJsYXlFbGVtZW50KVswXTtcblxuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVTaXplUmlnaHQpXG5cdFx0XHRcdC5ob3ZlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHRoYXQub3ZlclNpemVIYW5kbGUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0aWYoIXRoYXQuaW50ZXJhY3RpbmcpIHtcblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlU2l6ZVJpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvbldpZHRoLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5zZWxlY3RSdWxlKCd3aWR0aCcpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVNpemVCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uSGVpZ2h0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdoZWlnaHQnKTsgfVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSBudWxsO1xuXHRcdFx0XHRcdHRoYXQub3ZlclNpemVIYW5kbGUgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdFx0XHR2YXIgcmVtb3ZlU3BhbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVTaXplUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uV2lkdGguY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZVNpemVCb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uSGVpZ2h0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVx0XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGlmKCF0aGF0LmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0XHRyZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCF0aGF0Ll9fY2F0Y2hNb3VzZVVwKSB7XG5cdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gJChkb2N1bWVudCkub25lKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGlmKCF0aGF0Lm92ZXJTaXplSGFuZGxlKSByZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0XHRcdHRoYXQuX19jYXRjaE1vdXNlVXAgPSBudWxsO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdCb3R0b21cblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVBhZGRpbmdUb3ApXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVQYWRkaW5nTGVmdClcblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZVBhZGRpbmdSaWdodClcblx0XHRcdFx0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5vdmVyUGFkZGluZ0hhbmRsZSA9IHRydWU7XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nUmlnaHRbMF0pIHsgdGhhdC5jYXB0aW9uUGFkZGluZ1JpZ2h0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLXJpZ2h0Jyk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlUGFkZGluZ0JvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nQm90dG9tLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLWJvdHRvbScpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdMZWZ0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdwYWRkaW5nLWxlZnQnKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nVG9wWzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdUb3AuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnNlbGVjdFJ1bGUoJ3BhZGRpbmctdG9wJyk7IH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhhdC5jdXJyZW50SGFuZGxlID0gbnVsbDtcblx0XHRcdFx0XHR0aGF0Lm92ZXJQYWRkaW5nSGFuZGxlID0gZmFsc2U7XG5cblx0XHRcdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRcdFx0dmFyIHJlbW92ZVNwYW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvblBhZGRpbmdSaWdodC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ0JvdHRvbVswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nQm90dG9tLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVQYWRkaW5nTGVmdFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3QucmVtb3ZlKCdvdmVyJyk7IHRoYXQuZGVzZWxlY3RSdWxlKCk7IHRoYXQucmVmcmVzaENhcHRpb25zKCk7IH1cblx0XHRcdFx0XHRcdGlmKHNlbGYgPT09IHRoYXQuaGFuZGxlUGFkZGluZ1RvcFswXSkgeyB0aGF0LmNhcHRpb25QYWRkaW5nVG9wLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZighdGhhdC5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdFx0cmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZighdGhhdC5fX2NhdGNoTW91c2VVcCkge1xuXHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9ICQoZG9jdW1lbnQpLm9uZSgnbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpZighdGhhdC5vdmVyUGFkZGluZ0hhbmRsZSkgcmVtb3ZlU3BhbigpO1xuXHRcdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gbnVsbDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21cblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZU1hcmdpblRvcClcblx0XHRcdFx0LmFkZCh0aGlzLmhhbmRsZU1hcmdpbkxlZnQpXG5cdFx0XHRcdC5hZGQodGhpcy5oYW5kbGVNYXJnaW5SaWdodClcblx0XHRcdFx0LmhvdmVyKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQuY3VycmVudEhhbmRsZSA9IHRoaXM7XG5cdFx0XHRcdFx0dGhhdC5vdmVyTWFyZ2luSGFuZGxlID0gdHJ1ZTtcblxuXHRcdFx0XHRcdGlmKCF0aGF0LmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpblJpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpblJpZ2h0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tcmlnaHQnKTsgfVxuXHRcdFx0XHRcdFx0aWYodGhpcyA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Cb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luQm90dG9tLmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tYm90dG9tJyk7IH1cblx0XHRcdFx0XHRcdGlmKHRoaXMgPT09IHRoYXQuaGFuZGxlTWFyZ2luTGVmdFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdC5hZGQoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5zZWxlY3RSdWxlKCdtYXJnaW4tbGVmdCcpOyB9XG5cdFx0XHRcdFx0XHRpZih0aGlzID09PSB0aGF0LmhhbmRsZU1hcmdpblRvcFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5Ub3AuY2xhc3NMaXN0LmFkZCgnb3ZlcicpOyB0aGF0LnNlbGVjdFJ1bGUoJ21hcmdpbi10b3AnKTsgfVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9LCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGF0LmN1cnJlbnRIYW5kbGUgPSBudWxsO1xuXHRcdFx0XHRcdHRoYXQub3Zlck1hcmdpbkhhbmRsZSA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0XHRcdHZhciByZW1vdmVTcGFuID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZU1hcmdpblJpZ2h0WzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpblJpZ2h0LmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5yZWZyZXNoQ2FwdGlvbnMoKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5Cb3R0b21bMF0pIHsgdGhhdC5jYXB0aW9uTWFyZ2luQm90dG9tLmNsYXNzTGlzdC5yZW1vdmUoJ292ZXInKTsgdGhhdC5kZXNlbGVjdFJ1bGUoKTsgfVxuXHRcdFx0XHRcdFx0aWYoc2VsZiA9PT0gdGhhdC5oYW5kbGVNYXJnaW5MZWZ0WzBdKSB7IHRoYXQuY2FwdGlvbk1hcmdpbkxlZnQuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LnJlZnJlc2hDYXB0aW9ucygpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0XHRpZihzZWxmID09PSB0aGF0LmhhbmRsZU1hcmdpblRvcFswXSkgeyB0aGF0LmNhcHRpb25NYXJnaW5Ub3AuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcicpOyB0aGF0LmRlc2VsZWN0UnVsZSgpOyB9XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGlmKCF0aGF0LmludGVyYWN0aW5nKSB7XG5cdFx0XHRcdFx0XHRyZW1vdmVTcGFuKCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCF0aGF0Ll9fY2F0Y2hNb3VzZVVwKSB7XG5cdFx0XHRcdFx0XHR0aGF0Ll9fY2F0Y2hNb3VzZVVwID0gJChkb2N1bWVudCkub25lKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGlmKCF0aGF0Lm92ZXJNYXJnaW5IYW5kbGUpIHJlbW92ZVNwYW4oKTtcblx0XHRcdFx0XHRcdFx0dGhhdC5fX2NhdGNoTW91c2VVcCA9IG51bGw7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSk7XG5cblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5vdmVybGF5RWxlbWVudCk7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBFdmVudHMgJiBCZWhhdmlvdXIgaW5pdGlhbGl6YXRpb25cblx0XHQgKi9cblxuXHRcdGluaXQ6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmluaXRIb3ZlcigpO1xuXHRcdFx0dGhpcy5pbml0SGFuZGxlcygpO1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR0aGlzLl9fa2V5dXAgPSBmdW5jdGlvbihlKSB7XG5cblx0XHRcdFx0aWYoZS53aGljaCA9PT0gMTYpIHtcblx0XHRcdFx0XHR0aGF0LnNoaWZ0UHJlc3NlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoZS5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0XHRcdHRoYXQuZGVhY3RpdmF0ZSgpO1xuXHRcdFx0XHR9XHRcdFxuXHRcdFx0fTtcblx0XHRcdHRoaXMuX19rZXlkb3duID0gZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRcdGlmKGUud2hpY2ggPT09IDE2KSB7XG5cdFx0XHRcdFx0dGhhdC5zaGlmdFByZXNzZWQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdH07XG5cdFx0XHQkKGRvY3VtZW50KS5vbigna2V5dXAnLCB0aGlzLl9fa2V5dXApO1xuXHRcdFx0JChkb2N1bWVudCkub24oJ2tleWRvd24nLCB0aGlzLl9fa2V5ZG93bik7XG5cblx0XHR9LFxuXG5cdFx0cHJvY2Vzc092ZXJMb2dpYzogZnVuY3Rpb24oZSkge1xuXG5cdFx0XHR2YXIgZXh0cmFNYXJnaW4gPSAxMDtcblx0XHRcdHZhciBvZmZzZXQgPSB0aGlzLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHRcdC8vIGdlbmVyYWwgb3Zlci9vdXRcblxuXHRcdFx0aWYoXG5cdFx0XHRcdGUucGFnZVggPiBvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRcdGUucGFnZVkgPiBvZmZzZXQudG9wIC0gdGhpcy5tYXJnaW5Ub3AgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCArIGV4dHJhTWFyZ2luKSAmJlxuXHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0ICsgdGhpcy5tYXJnaW5Cb3R0b20gKyBleHRyYU1hcmdpbilcblx0XHRcdCkge1xuXG5cdFx0XHRcdGlmKCF0aGlzLm92ZXIpIHtcblx0XHRcdFx0XHR0aGlzLm92ZXIgPSB0cnVlO1xuXHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXInKTtcblx0XHRcdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGlmKHRoaXMub3ZlciAmJiAhdGhpcy5pbnRlcmFjdGluZykge1xuXHRcdFx0XHRcdHRoaXMub3ZlciA9IGZhbHNlO1xuXHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXInKTtcblx0XHRcdFx0XHR0aGlzLmhvdmVyR2hvc3Qub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBvdmVyIGlubmVyIGJveFxuXG5cdFx0XHRpZighdGhpcy5pbnRlcmFjdGluZykge1xuXG5cdFx0XHRcdGlmKFxuXHRcdFx0XHRcdCgoZS5wYWdlWCA+IG9mZnNldC5sZWZ0ICsgdGhpcy5wYWRkaW5nTGVmdCAmJlxuXHRcdFx0XHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgKyB0aGlzLnBhZGRpbmdUb3AgJiZcblx0XHRcdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGggLSB0aGlzLnBhZGRpbmdSaWdodCkgJiZcblx0XHRcdFx0XHRcdGUucGFnZVkgPCAob2Zmc2V0LnRvcCArIHRoaXMub3V0ZXJIZWlnaHQgLSB0aGlzLnBhZGRpbmdCb3R0b20pKSB8fFxuXHRcdFx0XHRcdHRoaXMub3ZlclNpemVIYW5kbGUpICYmXG5cdFx0XHRcdFx0IXRoaXMub3ZlclBhZGRpbmdIYW5kbGUgJiYgLy8gY2Fubm90IGJlIG92ZXIgcGFkZGluZyBoYW5kbGVcblx0XHRcdFx0XHQhdGhpcy5vdmVyTWFyZ2luSGFuZGxlXG5cdFx0XHRcdCkge1xuXG5cdFx0XHRcdFx0aWYoIXRoaXMub3ZlcklubmVyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLWlubmVyJyk7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJJbm5lciA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRpZih0aGlzLm92ZXJJbm5lcikge1xuXHRcdFx0XHRcdFx0dGhpcy5vdmVySW5uZXIgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItaW5uZXInKTtcdFx0XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBvdmVyIHBhZGRpbmcgYm94XG5cblx0XHRcdGlmKCF0aGlzLmludGVyYWN0aW5nKSB7XG5cblx0XHRcdFx0aWYoXG5cdFx0XHRcdFx0KChlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgJiYgZS5wYWdlWSA+IG9mZnNldC50b3AgJiZcblx0XHRcdFx0XHRcdGUucGFnZVggPCAob2Zmc2V0LmxlZnQgKyB0aGlzLm91dGVyV2lkdGgpICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0KSAmJlxuXHRcdFx0XHRcdFx0IXRoaXMub3ZlcklubmVyKSB8fFxuXHRcdFx0XHRcdHRoaXMub3ZlclBhZGRpbmdIYW5kbGUpICYmXG5cdFx0XHRcdFx0IXRoaXMub3ZlclNpemVIYW5kbGUgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyTWFyZ2luSGFuZGxlXG5cdFx0XHRcdCkge1xuXG5cdFx0XHRcdFx0aWYoIXRoaXMub3ZlclBhZGRpbmcpIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItcGFkZGluZycpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJQYWRkaW5nID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmcpIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlclBhZGRpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItcGFkZGluZycpO1x0XHRcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIG92ZXIgbWFyZ2luIGJveFxuXG5cdFx0XHRpZighdGhpcy5pbnRlcmFjdGluZykge1xuXG5cdFx0XHRcdGlmKFxuXHRcdFx0XHRcdCgoZS5wYWdlWCA+IG9mZnNldC5sZWZ0IC0gdGhpcy5tYXJnaW5MZWZ0ICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZID4gb2Zmc2V0LnRvcCAtIHRoaXMubWFyZ2luVG9wICYmIFxuXHRcdFx0XHRcdFx0ZS5wYWdlWCA8IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIHRoaXMubWFyZ2luUmlnaHQpICYmXG5cdFx0XHRcdFx0XHRlLnBhZ2VZIDwgKG9mZnNldC50b3AgKyB0aGlzLm91dGVySGVpZ2h0ICsgdGhpcy5tYXJnaW5Cb3R0b20pICYmXG5cdFx0XHRcdFx0XHQhdGhpcy5vdmVySW5uZXIgJiZcblx0XHRcdFx0XHRcdCF0aGlzLm92ZXJQYWRkaW5nKSB8fFxuXHRcdFx0XHRcdFx0XHR0aGlzLm92ZXJNYXJnaW5IYW5kbGUpICYmXG5cdFx0XHRcdFx0IXRoaXMub3ZlclBhZGRpbmdIYW5kbGUgJiZcblx0XHRcdFx0XHQhdGhpcy5vdmVyU2l6ZUhhbmRsZVxuXHRcdFx0XHQpIHtcblxuXHRcdFx0XHRcdGlmKCF0aGlzLm92ZXJNYXJnaW4pIHtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItbWFyZ2luJyk7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJNYXJnaW4gPSB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm92ZXJNYXJnaW4gPSBmYWxzZTtcblx0XHRcdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaG92ZXItbWFyZ2luJyk7XHRcdFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRpbml0SG92ZXI6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRcdCQoJ2JvZHknKS5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRcdHRoYXQuX19sYXN0TW91c2VNb3ZlRXZlbnQgPSBlO1xuXHRcdFx0XHRpZighdGhhdC5jdXJyZW50RWxlbWVudCB8fCB0aGF0LmhpZGRlbikge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoYXQucHJvY2Vzc092ZXJMb2dpYyhlKTtcblxuXHRcdFx0fSk7XG5cblx0XHR9LFxuXG5cdFx0aW5pdEhhbmRsZXM6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0XHR2YXIgaGFuZGxlT2Zmc2V0ID0gMztcblxuXHRcdFx0dmFyIGFwcGx5UHJlY2lzaW9uID0gZnVuY3Rpb24ob3JpZywgY3VycmVudCkge1xuXHRcdFx0XHRpZih0aGF0LnNoaWZ0UHJlc3NlZCkge1xuXHRcdFx0XHRcdHZhciBkZWx0YSA9IG9yaWcgLSBjdXJyZW50O1xuXHRcdFx0XHRcdHZhciBwcmVjaXNpb25EZWx0YSA9IGRlbHRhIC8gNDtcblx0XHRcdFx0XHRyZXR1cm4gY3VycmVudCArIE1hdGgucm91bmQoZGVsdGEgLSBwcmVjaXNpb25EZWx0YSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGN1cnJlbnQ7XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyByZXNpemUgaGFuZGxlc1xuXG5cdFx0XHQoZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIHN0YXJ0ID0gZnVuY3Rpb24oKSB7IHRoYXQuaW50ZXJhY3RpbmcgPSAnc2l6ZSc7IHRoaXMuX194ID0gJCh0aGlzKS5kcmFnZ2FibGUoJ29wdGlvbicsICdheGlzJykgPT09ICd4JzsgfTtcblx0XHRcdFx0dmFyIGRyYWcgPSBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHR2YXIgeCA9IHRoaXMuX194O1xuXHRcdFx0XHRcdHZhciBwcm9wID0geCA/ICdsZWZ0JyA6ICd0b3AnO1xuXG5cdFx0XHRcdFx0Ly8gYXBwbHkgcHJlY2lzaW9uIGRyYWdcblx0XHRcdFx0XHR1aS5wb3NpdGlvbltwcm9wXSA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb25bcHJvcF0sIHVpLnBvc2l0aW9uW3Byb3BdKTtcblxuXHRcdFx0XHRcdC8vIGNhbGN1bGF0ZSBub3JtYWwgaGFuZGxlIHBvc2l0aW9uXG5cdFx0XHRcdFx0dWkucG9zaXRpb25bcHJvcF0gPSBNYXRoLm1heCgwIC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbltwcm9wXSk7XG5cblx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGVbeCA/ICd3aWR0aCcgOiAnaGVpZ2h0J10gPSAodWkucG9zaXRpb25bcHJvcF0gKyBoYW5kbGVPZmZzZXQpICsgJ3B4Jztcblx0XHRcdFx0XHR0aGF0LnJlbGF5b3V0KCk7XG5cblx0XHRcdFx0fTtcblx0XHRcdFx0dmFyIHN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQvL3RoaXMucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUuaGVpZ2h0ID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS53aWR0aCA9ICcnO1xuXHRcdFx0XHRcdHRoaXMuc3R5bGUuYm90dG9tID0gJyc7XG5cdFx0XHRcdFx0dGhpcy5zdHlsZS50b3AgPSAnJztcblx0XHRcdFx0XHR0aGlzLnN0eWxlLmxlZnQgPSAnJztcblx0XHRcdFx0XHR0aGlzLnN0eWxlLnJpZ2h0ID0gJyc7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlU2l6ZUJvdHRvbS5kcmFnZ2FibGUoeyBkaXN0YW5jZTogMCwgYXhpczogJ3knLCBjdXJzb3I6ICdzLXJlc2l6ZScsIHN0YXJ0OiBzdGFydCwgZHJhZzogZHJhZywgc3RvcDogc3RvcCB9KTtcblx0XHRcdFx0dGhhdC5oYW5kbGVTaXplUmlnaHQuZHJhZ2dhYmxlKHsgZGlzdGFuY2U6IDAsIGF4aXM6ICd4JywgY3Vyc29yOiAnZS1yZXNpemUnLCBzdGFydDogc3RhcnQsIGRyYWc6IGRyYWcsIHN0b3A6IHN0b3AgfSk7XG5cblx0XHRcdH0pKCk7XG5cblxuXHRcdFx0Ly8gcmVzaXplIHBhZGRpbmdcblxuXHRcdFx0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZHJhZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQucmVsYXlvdXQoKTtcdFx0XHRcdFx0XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dGhhdC5oYW5kbGVQYWRkaW5nQm90dG9tLmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3knLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3MtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVySGVpZ2h0ID0gJCh0aGF0LmN1cnJlbnRFbGVtZW50KS5oZWlnaHQoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyUGFkZGluZ0JvdHRvbSA9IHRoYXQucGFkZGluZ0JvdHRvbTtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAncGFkZGluZyc7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb24udG9wLCB1aS5wb3NpdGlvbi50b3ApO1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gTWF0aC5tYXgodGhpcy5jdXJJbm5lckhlaWdodCAtIGhhbmRsZU9mZnNldCwgdWkucG9zaXRpb24udG9wKTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nQm90dG9tID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJQYWRkaW5nQm90dG9tICsgKCh1aS5wb3NpdGlvbi50b3ApIC0gdWkub3JpZ2luYWxQb3NpdGlvbi50b3ApKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlUGFkZGluZ1JpZ2h0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDAsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ2UtcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1cklubmVyV2lkdGggPSAkKHRoYXQuY3VycmVudEVsZW1lbnQpLndpZHRoKCk7XG5cdFx0XHRcdFx0XHR0aGlzLmN1clBhZGRpbmdSaWdodCA9IHRoYXQucGFkZGluZ1JpZ2h0O1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdwYWRkaW5nJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCwgdWkucG9zaXRpb24ubGVmdCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gTWF0aC5tYXgodGhpcy5jdXJJbm5lcldpZHRoIC0gaGFuZGxlT2Zmc2V0LCB1aS5wb3NpdGlvbi5sZWZ0KTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nUmlnaHQgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdSaWdodCArICgodWkucG9zaXRpb24ubGVmdCkgLSB1aS5vcmlnaW5hbFBvc2l0aW9uLmxlZnQpKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlUGFkZGluZ1RvcC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAxLFxuXHRcdFx0XHRcdGF4aXM6ICd5Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICduLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJPZmZzZXQgPSB1aS5vZmZzZXQudG9wO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nVG9wID0gdGhhdC5wYWRkaW5nVG9wO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdwYWRkaW5nJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQudG9wIC0gdGhpcy5jdXJPZmZzZXQpO1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSB0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLnBhZGRpbmdUb3AgPSBNYXRoLm1heCgwLCB0aGlzLmN1clBhZGRpbmdUb3AgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZVBhZGRpbmdMZWZ0LmRyYWdnYWJsZSh7XG5cdFx0XHRcdFx0ZGlzdGFuY2U6IDEsXG5cdFx0XHRcdFx0YXhpczogJ3gnLFxuXHRcdFx0XHRcdGN1cnNvcjogJ3ctcmVzaXplJyxcblx0XHRcdFx0XHRzdGFydDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck9mZnNldCA9IHVpLm9mZnNldC5sZWZ0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nTGVmdCA9IHRoYXQucGFkZGluZ0xlZnQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ3BhZGRpbmcnO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQubGVmdCAtIHRoaXMuY3VyT2Zmc2V0KTtcblx0XHRcdFx0XHRcdGRlbHRhID0gdGhhdC5zaGlmdFByZXNzZWQgPyBNYXRoLnJvdW5kKGRlbHRhIC8gNCkgOiBkZWx0YTtcblx0XHRcdFx0XHRcdCh0aGF0LnNlbGVjdGVkUnVsZSB8fCB0aGF0LmN1cnJlbnRFbGVtZW50KS5zdHlsZS5wYWRkaW5nTGVmdCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyUGFkZGluZ0xlZnQgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcdFx0XHRcdFxuXG5cdFx0XHR9KSgpO1xuXG5cblx0XHRcdC8vIHJlc2l6ZSBtYXJnaW5cblxuXHRcdFx0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdHZhciBzdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG5cdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR2YXIgZHJhZyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRoYXQucmVsYXlvdXQoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpbkJvdHRvbS5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd5Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICdzLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJJbm5lckhlaWdodCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkuaGVpZ2h0KCk7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpbkJvdHRvbSA9IHRoYXQubWFyZ2luQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nQm90dG9tID0gdGhhdC5wYWRkaW5nQm90dG9tO1xuXHRcdFx0XHRcdFx0dGhhdC5pbnRlcmFjdGluZyA9ICdtYXJnaW4nO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZHJhZzogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBhcHBseVByZWNpc2lvbih1aS5vcmlnaW5hbFBvc2l0aW9uLnRvcCwgdWkucG9zaXRpb24udG9wKTtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IE1hdGgubWF4KHRoaXMuY3VySW5uZXJIZWlnaHQgKyB0aGlzLmN1clBhZGRpbmdCb3R0b20gLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLnRvcCk7XG5cdFx0XHRcdFx0XHQodGhhdC5zZWxlY3RlZFJ1bGUgfHwgdGhhdC5jdXJyZW50RWxlbWVudCkuc3R5bGUubWFyZ2luQm90dG9tID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5Cb3R0b20gKyAodWkucG9zaXRpb24udG9wIC0gdWkub3JpZ2luYWxQb3NpdGlvbi50b3ApKSArICdweCc7XG5cdFx0XHRcdFx0XHRkcmFnKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzdG9wOiBzdG9wXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoYXQuaGFuZGxlTWFyZ2luUmlnaHQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAnZS1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VySW5uZXJXaWR0aCA9ICQodGhhdC5jdXJyZW50RWxlbWVudCkud2lkdGgoKTtcblx0XHRcdFx0XHRcdHRoaXMuY3VyTWFyZ2luUmlnaHQgPSB0aGF0Lm1hcmdpblJpZ2h0O1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJQYWRkaW5nUmlnaHQgPSB0aGF0LnBhZGRpbmdSaWdodDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IGFwcGx5UHJlY2lzaW9uKHVpLm9yaWdpbmFsUG9zaXRpb24ubGVmdCwgdWkucG9zaXRpb24ubGVmdCk7XG5cdFx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gTWF0aC5tYXgodGhpcy5jdXJJbm5lcldpZHRoICsgdGhpcy5jdXJQYWRkaW5nUmlnaHQgLSBoYW5kbGVPZmZzZXQsIHVpLnBvc2l0aW9uLmxlZnQpO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpblJpZ2h0ID0gTWF0aC5tYXgoMCwgdGhpcy5jdXJNYXJnaW5SaWdodCArICh1aS5wb3NpdGlvbi5sZWZ0IC0gdWkub3JpZ2luYWxQb3NpdGlvbi5sZWZ0KSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpbkxlZnQuZHJhZ2dhYmxlKHtcblx0XHRcdFx0XHRkaXN0YW5jZTogMCxcblx0XHRcdFx0XHRheGlzOiAneCcsXG5cdFx0XHRcdFx0Y3Vyc29yOiAndy1yZXNpemUnLFxuXHRcdFx0XHRcdHN0YXJ0OiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHRoaXMuY3VyT2Zmc2V0ID0gdWkub2Zmc2V0LmxlZnQ7XG5cdFx0XHRcdFx0XHR0aGlzLmN1ck1hcmdpbkxlZnQgPSB0aGF0Lm1hcmdpbkxlZnQ7XG5cdFx0XHRcdFx0XHR0aGF0LmludGVyYWN0aW5nID0gJ21hcmdpbic7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkcmFnOiBmdW5jdGlvbihldmVudCwgdWkpIHtcblx0XHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSAtaGFuZGxlT2Zmc2V0O1xuXHRcdFx0XHRcdFx0dmFyIGRlbHRhID0gKHVpLm9mZnNldC5sZWZ0IC0gdGhpcy5jdXJPZmZzZXQpO1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSB0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpbkxlZnQgPSBNYXRoLm1heCgwLCB0aGlzLmN1ck1hcmdpbkxlZnQgLSBkZWx0YSkgKyAncHgnO1xuXHRcdFx0XHRcdFx0ZHJhZygpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3RvcDogc3RvcFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGF0LmhhbmRsZU1hcmdpblRvcC5kcmFnZ2FibGUoe1xuXHRcdFx0XHRcdGRpc3RhbmNlOiAwLFxuXHRcdFx0XHRcdGF4aXM6ICd5Jyxcblx0XHRcdFx0XHRjdXJzb3I6ICduLXJlc2l6ZScsXG5cdFx0XHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJPZmZzZXQgPSB1aS5vZmZzZXQudG9wO1xuXHRcdFx0XHRcdFx0dGhpcy5jdXJNYXJnaW5Ub3AgPSB0aGF0Lm1hcmdpblRvcDtcblx0XHRcdFx0XHRcdHRoYXQuaW50ZXJhY3RpbmcgPSAnbWFyZ2luJztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRyYWc6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuXHRcdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gLWhhbmRsZU9mZnNldDtcblx0XHRcdFx0XHRcdHZhciBkZWx0YSA9ICh1aS5vZmZzZXQudG9wIC0gdGhpcy5jdXJPZmZzZXQpO1xuXHRcdFx0XHRcdFx0ZGVsdGEgPSB0aGF0LnNoaWZ0UHJlc3NlZCA/IE1hdGgucm91bmQoZGVsdGEgLyA0KSA6IGRlbHRhO1xuXHRcdFx0XHRcdFx0KHRoYXQuc2VsZWN0ZWRSdWxlIHx8IHRoYXQuY3VycmVudEVsZW1lbnQpLnN0eWxlLm1hcmdpblRvcCA9IE1hdGgubWF4KDAsIHRoaXMuY3VyTWFyZ2luVG9wIC0gZGVsdGEpICsgJ3B4Jztcblx0XHRcdFx0XHRcdGRyYWcoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0b3A6IHN0b3Bcblx0XHRcdFx0fSk7XG5cblx0XHRcdH0pKCk7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBDb3JlIHJ1bnRpbWUgZnVuY3Rpb25hbGl0eVxuXHRcdCAqL1xuXG5cdFx0cmVsYXlvdXQ6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR2YXIgY29tcHV0ZWRTdHlsZSA9IHRoaXMuY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cblx0XHRcdHZhciBvdmVybGF5RWxlbWVudCA9IHRoaXMub3ZlcmxheUVsZW1lbnQ7XG5cdFx0XHR2YXIgZWxlbSA9ICQodGhpcy5jdXJyZW50RWxlbWVudCk7XG5cdFx0XHR2YXIgb2Zmc2V0ID0gZWxlbS5vZmZzZXQoKTtcblxuXHRcdFx0Ly8gd2UgbmVlZCB0byBzdG9yZSBvdXRlciBoZWlnaHQsIGJvdHRvbS9yaWdodCBwYWRkaW5nIGFuZCBtYXJnaW5zIGZvciBob3ZlciBkZXRlY3Rpb25cblx0XHRcdHZhciBwYWRkaW5nTGVmdCA9IHRoaXMucGFkZGluZ0xlZnQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLnBhZGRpbmdMZWZ0KTtcblx0XHRcdHZhciBwYWRkaW5nVG9wID0gdGhpcy5wYWRkaW5nVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nVG9wKTtcblx0XHRcdHZhciBwYWRkaW5nUmlnaHQgPSB0aGlzLnBhZGRpbmdSaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUucGFkZGluZ1JpZ2h0KTtcblx0XHRcdHZhciBwYWRkaW5nQm90dG9tID0gdGhpcy5wYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5wYWRkaW5nQm90dG9tKTtcblxuXHRcdFx0dmFyIG1hcmdpbkxlZnQgPSB0aGlzLm1hcmdpbkxlZnQgPSBwYXJzZUludChjb21wdXRlZFN0eWxlLm1hcmdpbkxlZnQpO1xuXHRcdFx0dmFyIG1hcmdpblRvcCA9IHRoaXMubWFyZ2luVG9wID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Ub3ApO1xuXHRcdFx0dmFyIG1hcmdpblJpZ2h0ID0gdGhpcy5tYXJnaW5SaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUubWFyZ2luUmlnaHQpO1xuXHRcdFx0dmFyIG1hcmdpbkJvdHRvbSA9IHRoaXMubWFyZ2luQm90dG9tID0gcGFyc2VJbnQoY29tcHV0ZWRTdHlsZS5tYXJnaW5Cb3R0b20pO1xuXG5cdFx0XHR2YXIgaW5uZXJXaWR0aCA9IHRoaXMuaW5uZXJXaWR0aCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUud2lkdGgpIHx8ICh0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHQpO1xuXHRcdFx0dmFyIGlubmVySGVpZ2h0ID0gdGhpcy5pbm5lckhlaWdodCA9IHBhcnNlSW50KGNvbXB1dGVkU3R5bGUuaGVpZ2h0KSB8fCAodGhpcy5jdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLSBwYWRkaW5nVG9wIC0gcGFkZGluZ0JvdHRvbSk7XG5cblx0XHRcdHZhciBvdXRlcldpZHRoID0gdGhpcy5vdXRlcldpZHRoID0gaW5uZXJXaWR0aCArIHBhZGRpbmdMZWZ0ICsgcGFkZGluZ1JpZ2h0O1xuXHRcdFx0dmFyIG91dGVySGVpZ2h0ID0gdGhpcy5vdXRlckhlaWdodCA9IGlubmVySGVpZ2h0ICsgcGFkZGluZ1RvcCArIHBhZGRpbmdCb3R0b207XG5cblx0XHRcdC8vIGNhbGN1bGF0ZSBoYW5kbGUgc2l6ZVxuXHRcdFx0dmFyIGhhbmRsZVNpemVYID0gMTY7XG5cdFx0XHR2YXIgaGFuZGxlU2l6ZVkgPSAxNjtcblx0XHRcdGlmKGlubmVyV2lkdGggPCAxMDApIHtcblx0XHRcdFx0aGFuZGxlU2l6ZVggPSBNYXRoLm1heCg4LCBNYXRoLm1pbigxNiwgaGFuZGxlU2l6ZVggKiAoaW5uZXJXaWR0aCAvIDYwKSkpO1xuXHRcdFx0fVxuXHRcdFx0aWYoaW5uZXJIZWlnaHQgPCAxMDApIHtcblx0XHRcdFx0aGFuZGxlU2l6ZVkgPSBNYXRoLm1heCg4LCBNYXRoLm1pbigxNiwgaGFuZGxlU2l6ZVkgKiAoaW5uZXJIZWlnaHQgLyA2MCkpKTtcblx0XHRcdH1cblx0XHRcdHRoaXMucmVmcmVzaEhhbmRsZXMoaGFuZGxlU2l6ZVgsIGhhbmRsZVNpemVZKTtcblxuXHRcdFx0Ly8gcGxhY2UgYW5kIHJlc2l6ZSBvdmVybGF5XG5cdFx0XHRvdmVybGF5RWxlbWVudC5zdHlsZS53aWR0aCA9IGlubmVyV2lkdGggKyAncHgnO1xuXHRcdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdFx0b3ZlcmxheUVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKG9mZnNldC50b3AgKyBwYWRkaW5nVG9wKSArICdweCknO1xuXG5cdFx0XHQvLyBtb2RpZnkgcGFkZGluZyBib3hcblx0XHRcdHRoaXMuY29udGFpbmVyUGFkZGluZ0xlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLXBhZGRpbmdUb3ApICsgJ3B4KSBzY2FsZSgnICsgcGFkZGluZ0xlZnQgKyAnLCAnICsgb3V0ZXJIZWlnaHQgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdSaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCkgKyAncHgsICcgKyAoLXBhZGRpbmdUb3ApICsgJ3B4KSBzY2FsZSgnICsgcGFkZGluZ1JpZ2h0ICsgJywgJyArIG91dGVySGVpZ2h0ICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJQYWRkaW5nVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgwKSArICdweCwgJyArICgtcGFkZGluZ1RvcCkgKyAncHgpIHNjYWxlKCcgKyBpbm5lcldpZHRoICsgJywgJyArIHBhZGRpbmdUb3AgKyAnKSc7XG5cdFx0XHR0aGlzLmNvbnRhaW5lclBhZGRpbmdCb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKDApICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0KSArICdweCkgc2NhbGUoJyArIGlubmVyV2lkdGggKyAnLCAnICsgcGFkZGluZ0JvdHRvbSArICcpJztcblxuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAtcGFkZGluZ0xlZnQgKyAncHgsIDBweCknO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luUmlnaHQgPSAtcGFkZGluZ1JpZ2h0ICsgJ3B4JzsgLy8gVE9ETzogZmluZCBvdXQgd2h5IGNvbnZlcnRpbmcgdGhlc2UgdG8gdHJhbnNmb3JtcyBtZXNzZXMgd2l0aCBkcmFnZ2luZ1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nVG9wWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgLXBhZGRpbmdUb3AgKyAncHgpJztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5Cb3R0b20gPSAgLXBhZGRpbmdCb3R0b20gKyAncHgnOyAgLy8gVE9ETzogZmluZCBvdXQgd2h5IGNvbnZlcnRpbmcgdGhlc2UgdG8gdHJhbnNmb3JtcyBtZXNzZXMgd2l0aCBkcmFnZ2luZ1xuXG5cdFx0XHQvLyBtb2RpZnkgbWFyZ2luIGJveFxuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5MZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkpICsgJ3B4LCAnICsgKC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkpICsgJ3B4KSBzY2FsZSgnICsgbWFyZ2luTGVmdCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoaW5uZXJXaWR0aCArIHBhZGRpbmdSaWdodCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBtYXJnaW5SaWdodCArICcsICcgKyAob3V0ZXJIZWlnaHQgKyBtYXJnaW5Ub3AgKyBtYXJnaW5Cb3R0b20pICsgJyknO1xuXHRcdFx0dGhpcy5jb250YWluZXJNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wYWRkaW5nTGVmdCkgKyAncHgsICcgKyAoLShwYWRkaW5nVG9wICsgbWFyZ2luVG9wKSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpblRvcCArICcpJztcblx0XHRcdHRoaXMuY29udGFpbmVyTWFyZ2luQm90dG9tLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcGFkZGluZ0xlZnQpICsgJ3B4LCAnICsgKGlubmVySGVpZ2h0ICsgcGFkZGluZ0JvdHRvbSkgKyAncHgpIHNjYWxlKCcgKyBvdXRlcldpZHRoICsgJywgJyArIG1hcmdpbkJvdHRvbSArICcpJztcblxuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAtKHBhZGRpbmdMZWZ0ICsgbWFyZ2luTGVmdCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5tYXJnaW5SaWdodCA9IC0ocGFkZGluZ1JpZ2h0ICsgbWFyZ2luUmlnaHQpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpblRvcCA9IC0ocGFkZGluZ1RvcCArIG1hcmdpblRvcCkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5Cb3R0b21bMF0uc3R5bGUubWFyZ2luQm90dG9tID0gLShwYWRkaW5nQm90dG9tICsgbWFyZ2luQm90dG9tKSArICdweCc7XG5cblx0XHRcdC8vIG9mZnNldCBtYWdpY1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5MZWZ0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5MZWZ0IDwgMjAgPyAoLSgoKGhhbmRsZVNpemVZIC8gNCkgKiBtYXJnaW5MZWZ0KSAvIDUpICsgKGhhbmRsZVNpemVZIC8gMikpIDogLShoYW5kbGVTaXplWSAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luTGVmdCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luTGVmdCkgLyA1KSAtIDggKyBoYW5kbGVTaXplWSkgOiAtOCkgKyAncHgnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblJpZ2h0WzBdLnN0eWxlLm1hcmdpblRvcCA9IChtYXJnaW5SaWdodCA8IDIwID8gKC0oKChoYW5kbGVTaXplWSAvIDQpICogbWFyZ2luUmlnaHQpIC8gNSkgKyAoaGFuZGxlU2l6ZVkgLyAyKSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5zdHlsZS5tYXJnaW5Ub3AgPSAobWFyZ2luUmlnaHQgPCAyMCA/ICgtKCgoaGFuZGxlU2l6ZVkgLyA0KSAqIG1hcmdpblJpZ2h0KSAvIDUpIC0gOCArIGhhbmRsZVNpemVZKSA6IC04KSArICdweCc7XG5cdFx0XHRcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luVG9wWzBdLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luVG9wIDwgMjAgPyAoLSgoKGhhbmRsZVNpemVYIC8gNCkgKiBtYXJnaW5Ub3ApIC8gNSkgKyAoaGFuZGxlU2l6ZVggLyAyKSkgOiAtKGhhbmRsZVNpemVYIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUubWFyZ2luTGVmdCA9IChtYXJnaW5Ub3AgPCAyMCA/ICgoaGFuZGxlU2l6ZVgpICsgKC0oaGFuZGxlU2l6ZVgpICogKG1hcmdpblRvcCAvIDIwKSkgLSA4KSA6IC0xMSkgKyAncHgnO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkJvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKG1hcmdpbkJvdHRvbSA8IDIwID8gKC0oKChoYW5kbGVTaXplWCAvIDQpICogbWFyZ2luQm90dG9tKSAvIDUpICsgKGhhbmRsZVNpemVYIC8gMikpIDogLShoYW5kbGVTaXplWCAvIDIpKSArICdweCc7IC8vICgtOCAqIChtYXJnaW5MZWZ0IC8gMjApKSArICg4IC0gOCAqIChtYXJnaW5MZWZ0IC8gMjApKVxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLm1hcmdpbkxlZnQgPSAobWFyZ2luQm90dG9tIDwgMjAgPyAoKGhhbmRsZVNpemVYKSArICgtKGhhbmRsZVNpemVYKSAqIChtYXJnaW5Cb3R0b20gLyAyMCkpIC0gOCkgOiAtMTEpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gKHBhZGRpbmdSaWdodCA8IDIwID8gKCsoKChoYW5kbGVTaXplWSAvIDQpICogcGFkZGluZ1JpZ2h0KSAvIDUpIC0gKGhhbmRsZVNpemVZICogMS41KSkgOiAtKGhhbmRsZVNpemVZIC8gMikpICsgJ3B4JzsgLy8gKC04ICogKG1hcmdpbkxlZnQgLyAyMCkpICsgKDggLSA4ICogKG1hcmdpbkxlZnQgLyAyMCkpXG5cdFx0XHR0aGlzLmNhcHRpb25XaWR0aC5zdHlsZS5tYXJnaW5Ub3AgPSAocGFkZGluZ1JpZ2h0IDwgMjAgPyAoKygoKGhhbmRsZVNpemVZIC8gNCkgKiBwYWRkaW5nUmlnaHQpIC8gNSkgLSAoaGFuZGxlU2l6ZVkgKiAxLjUpKSA6IC04KSArICdweCc7XG5cblx0XHRcdHRoaXMuaGFuZGxlU2l6ZUJvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gKHBhZGRpbmdCb3R0b20gPCAyMCA/ICgrKCgoaGFuZGxlU2l6ZVggLyA0KSAqIHBhZGRpbmdCb3R0b20pIC8gNSkgLSAoaGFuZGxlU2l6ZVggKiAxLjUpKSA6IC0oaGFuZGxlU2l6ZVggLyAyKSkgKyAncHgnO1xuXHRcdFx0dGhpcy5jYXB0aW9uSGVpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAocGFkZGluZ0JvdHRvbSA8IDIwID8gKChoYW5kbGVTaXplWCAqIChwYWRkaW5nQm90dG9tIC8gMjApKSAtIGhhbmRsZVNpemVYICogMiArIGhhbmRsZVNpemVYIC0gOSkgOiAtMTApICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nTGVmdFswXS5zdHlsZS5tYXJnaW5Ub3AgPSAtKGhhbmRsZVNpemVZIC8gMikgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVQYWRkaW5nUmlnaHRbMF0uc3R5bGUubWFyZ2luVG9wID0gLShoYW5kbGVTaXplWSAvIDIpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplWCAvIDIpICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS5tYXJnaW5MZWZ0ID0gLShoYW5kbGVTaXplWCAvIDIpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5yZWZyZXNoSGFuZGxlcygpO1xuXHRcdFx0dGhpcy5yZWZyZXNoQ2FwdGlvbnMoKTtcblxuXHRcdFx0dGhpcy5jdXJyZW50T2Zmc2V0ID0gb2Zmc2V0O1xuXG5cdFx0XHQvLyBpbmZvcm0gcGx1Z2lucyB0aGF0IGEgcmVsYXlvdXQgaGFzIGhhcHBlbmVkXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ3JlbGF5b3V0Jywge1xuXG5cdFx0XHRcdGNvbXB1dGVkU3R5bGU6IGNvbXB1dGVkU3R5bGUsXG5cdFx0XHRcdG9mZnNldDogb2Zmc2V0LFxuXG5cdFx0XHRcdHBhZGRpbmdMZWZ0OiBwYWRkaW5nTGVmdCxcblx0XHRcdFx0cGFkZGluZ1RvcDogcGFkZGluZ1RvcCxcblx0XHRcdFx0cGFkZGluZ1JpZ2h0OiBwYWRkaW5nUmlnaHQsXG5cdFx0XHRcdHBhZGRpbmdCb3R0b206IHBhZGRpbmdCb3R0b20sXG5cblx0XHRcdFx0bWFyZ2luTGVmdDogbWFyZ2luTGVmdCxcblx0XHRcdFx0bWFyZ2luVG9wOiBtYXJnaW5Ub3AsXG5cdFx0XHRcdG1hcmdpblJpZ2h0OiBtYXJnaW5SaWdodCxcblx0XHRcdFx0bWFyZ2luQm90dG9tOiBtYXJnaW5Cb3R0b20sXG5cblx0XHRcdFx0aW5uZXJXaWR0aDogaW5uZXJXaWR0aCxcblx0XHRcdFx0aW5uZXJIZWlnaHQ6IGlubmVySGVpZ2h0LFxuXHRcdFx0XHRvdXRlcldpZHRoOiBvdXRlcldpZHRoLFxuXHRcdFx0XHRvdXRlckhlaWdodDogb3V0ZXJIZWlnaHRcblxuXHRcdFx0fSk7XG5cblx0XHR9LFxuXG5cdFx0cmVmcmVzaEhhbmRsZXM6IGZ1bmN0aW9uKGhhbmRsZVNpemVYLCBoYW5kbGVTaXplWSkge1xuXG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpbkxlZnRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVNYXJnaW5SaWdodFswXS5zdHlsZS5oZWlnaHQgPSBoYW5kbGVTaXplWSArICdweCc7XG5cdFx0XHR0aGlzLmhhbmRsZU1hcmdpblRvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlTWFyZ2luQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0XHR0aGlzLmhhbmRsZVBhZGRpbmdMZWZ0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1JpZ2h0WzBdLnN0eWxlLmhlaWdodCA9IGhhbmRsZVNpemVZICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ1RvcFswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4Jztcblx0XHRcdHRoaXMuaGFuZGxlUGFkZGluZ0JvdHRvbVswXS5zdHlsZS53aWR0aCA9IGhhbmRsZVNpemVYICsgJ3B4JztcblxuXHRcdFx0dGhpcy5oYW5kbGVTaXplUmlnaHRbMF0uc3R5bGUuaGVpZ2h0ID0gaGFuZGxlU2l6ZVkgKyAncHgnO1xuXHRcdFx0dGhpcy5oYW5kbGVTaXplQm90dG9tWzBdLnN0eWxlLndpZHRoID0gaGFuZGxlU2l6ZVggKyAncHgnO1xuXG5cdFx0fSxcblxuXHRcdHJlZnJlc2hDYXB0aW9uczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHZhciBvZmZzZXQgPSB7IGxlZnQ6IHRoaXMuY3VycmVudEVsZW1lbnQub2Zmc2V0TGVmdCwgdG9wOiB0aGlzLmN1cnJlbnRFbGVtZW50Lm9mZnNldFRvcCB9O1xuXG5cdFx0XHQvLyBjYXB0aW9uc1xuXHRcdFx0dmFyIGhpdHNSaWdodEVkZ2UsIGhpdHNMZWZ0RWRnZTtcblxuXHRcdFx0aGl0c1JpZ2h0RWRnZSA9IChvZmZzZXQubGVmdCArIHRoaXMub3V0ZXJXaWR0aCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguaW5uZXJIVE1MID0gJzxzcGFuPndpZHRoOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCd3aWR0aCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uV2lkdGguc3R5bGUucmlnaHQgPSAoaGl0c1JpZ2h0RWRnZSA/IDE2IDogLSh0aGlzLmNhcHRpb25XaWR0aC5vZmZzZXRXaWR0aCArIDEzKSkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25IZWlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPmhlaWdodDogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnaGVpZ2h0Jyk7XG5cblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LmlubmVySFRNTCA9ICc8c3Bhbj5wYWRkaW5nLWxlZnQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdMZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctcmlnaHQ6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdSaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1RvcC5pbm5lckhUTUwgPSAnPHNwYW4+cGFkZGluZy10b3A6IDwvc3Bhbj4nICsgdGhpcy5nZXRDYXB0aW9uUHJvcGVydHkoJ3BhZGRpbmdUb3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdCb3R0b20uaW5uZXJIVE1MID0gJzxzcGFuPnBhZGRpbmctYm90dG9tOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdwYWRkaW5nQm90dG9tJyk7XG5cblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkxlZnQuaW5uZXJIVE1MID0gJzxzcGFuPm1hcmdpbi1sZWZ0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5MZWZ0Jyk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5SaWdodC5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLXJpZ2h0OiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5SaWdodCcpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luVG9wLmlubmVySFRNTCA9ICc8c3Bhbj5tYXJnaW4tdG9wOiA8L3NwYW4+JyArIHRoaXMuZ2V0Q2FwdGlvblByb3BlcnR5KCdtYXJnaW5Ub3AnKTtcblx0XHRcdHRoaXMuY2FwdGlvbk1hcmdpbkJvdHRvbS5pbm5lckhUTUwgPSAnPHNwYW4+bWFyZ2luLWJvdHRvbTogPC9zcGFuPicgKyB0aGlzLmdldENhcHRpb25Qcm9wZXJ0eSgnbWFyZ2luQm90dG9tJyk7XG5cblx0XHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIDgwIDwgMCk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5jbGFzc0xpc3RbaGl0c0xlZnRFZGdlID8gJ2FkZCcgOiAncmVtb3ZlJ10oJ2VkZ2UnKTtcblx0XHRcdHRoaXMuY2FwdGlvblBhZGRpbmdMZWZ0LnN0eWxlLm1hcmdpblJpZ2h0ID0gKGhpdHNMZWZ0RWRnZSA/IHRoaXMucGFkZGluZ0xlZnQgLSB0aGlzLmNhcHRpb25QYWRkaW5nTGVmdC5vZmZzZXRXaWR0aC0xNiA6IHRoaXMucGFkZGluZ0xlZnQgKyAxNCkgKyAncHgnO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgODAgPiB3aW5kb3cuaW5uZXJXaWR0aCk7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0LnN0eWxlLm1hcmdpbkxlZnQgPSAoaGl0c1JpZ2h0RWRnZSA/IHRoaXMucGFkZGluZ1JpZ2h0IC0gdGhpcy5jYXB0aW9uUGFkZGluZ1JpZ2h0Lm9mZnNldFdpZHRoLTE2IDogdGhpcy5wYWRkaW5nUmlnaHQgKyAxNCkgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nQm90dG9tLnN0eWxlLmJvdHRvbSA9IC0odGhpcy5wYWRkaW5nQm90dG9tICArIDI0KSArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25QYWRkaW5nVG9wLnN0eWxlLnRvcCA9IC0odGhpcy5wYWRkaW5nVG9wICArIDI0KSArICdweCc7XG5cblx0XHRcdGhpdHNMZWZ0RWRnZSA9IChvZmZzZXQubGVmdCAtIHRoaXMubWFyZ2luTGVmdCAtIDgwIDwgMCk7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5MZWZ0LmNsYXNzTGlzdFtoaXRzTGVmdEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luTGVmdC5zdHlsZS5tYXJnaW5SaWdodCA9IHRoaXMucGFkZGluZ0xlZnQgKyB0aGlzLm1hcmdpbkxlZnQgKyAoaGl0c0xlZnRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpbkxlZnQub2Zmc2V0V2lkdGgtMTcgOiAxNCkgKyAncHgnO1xuXG5cdFx0XHRoaXRzUmlnaHRFZGdlID0gKG9mZnNldC5sZWZ0ICsgdGhpcy5vdXRlcldpZHRoICsgdGhpcy5tYXJnaW5SaWdodCArIDgwID4gd2luZG93LmlubmVyV2lkdGgpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuY2xhc3NMaXN0W2hpdHNSaWdodEVkZ2UgPyAnYWRkJyA6ICdyZW1vdmUnXSgnZWRnZScpO1xuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luUmlnaHQuc3R5bGUubWFyZ2luTGVmdCA9IHRoaXMucGFkZGluZ1JpZ2h0ICsgdGhpcy5tYXJnaW5SaWdodCArIChoaXRzUmlnaHRFZGdlID8gLXRoaXMuY2FwdGlvbk1hcmdpblJpZ2h0Lm9mZnNldFdpZHRoLTE3IDogMTQpICsgJ3B4JztcblxuXHRcdFx0dGhpcy5jYXB0aW9uTWFyZ2luQm90dG9tLnN0eWxlLmJvdHRvbSA9IC10aGlzLm1hcmdpbkJvdHRvbSAtdGhpcy5wYWRkaW5nQm90dG9tIC0yNCArICdweCc7XG5cdFx0XHR0aGlzLmNhcHRpb25NYXJnaW5Ub3Auc3R5bGUudG9wID0gLXRoaXMubWFyZ2luVG9wIC10aGlzLnBhZGRpbmdUb3AgLTI0ICsgJ3B4JztcblxuXHRcdH0sXG5cblx0XHRnZXRDYXB0aW9uUHJvcGVydHk6IGZ1bmN0aW9uKGNzc1Byb3BlcnR5KSB7XG5cblx0XHRcdC8vIGNoZWNrIGluIGlubGluZSBzdHlsZXNcblx0XHRcdGlmKHRoaXMuY3VycmVudEVsZW1lbnQuc3R5bGVbY3NzUHJvcGVydHldKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmN1cnJlbnRFbGVtZW50LnN0eWxlW2Nzc1Byb3BlcnR5XS5yZXBsYWNlKC8oZW18cHgpLywgJ+KAiTxzcGFuPiQxPC9zcGFuPicpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjaGVjayBpbiBydWxlc1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXRjaGVkUnVsZXNbaV0uc3R5bGVbY3NzUHJvcGVydHldLnJlcGxhY2UoLyhlbXxweCkvLCAn4oCJPHNwYW4+JDE8L3NwYW4+Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHJldFZhbCA9ICcnO1xuXG5cdFx0XHRpZihjc3NQcm9wZXJ0eS5pbmRleE9mKCdtYXJnaW4nKSA+IC0xIHx8IGNzc1Byb3BlcnR5LmluZGV4T2YoJ3BhZGRpbmcnKSA+IC0xKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXNbY3NzUHJvcGVydHldO1xuXHRcdFx0fSBlbHNlIGlmKGNzc1Byb3BlcnR5ID09PSAnaGVpZ2h0Jykge1xuXHRcdFx0XHRyZXRWYWwgPSB0aGlzLmlubmVySGVpZ2h0O1xuXHRcdFx0fSBlbHNlIGlmKGNzc1Byb3BlcnR5ID09PSAnd2lkdGgnKSB7XG5cdFx0XHRcdHJldFZhbCA9IHRoaXMuaW5uZXJXaWR0aDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaW1wbGljaXQgdmFsdWVcblx0XHRcdHJldHVybiAnKCcgKyByZXRWYWwgKyAn4oCJPHNwYW4+cHg8L3NwYW4+KSc7XG5cblx0XHR9LFxuXG5cdFx0YWN0aXZhdGU6IGZ1bmN0aW9uKG5ld0VsZW0pIHtcblxuXHRcdFx0dGhpcy5jdXJyZW50RWxlbWVudCA9IG5ld0VsZW07XG5cdFx0XHR0aGlzLmNvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuY3VycmVudEVsZW1lbnQpO1xuXG5cdFx0XHQvLyBpbml0aWFsIGhvdmVyXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyJyk7XG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0dGhpcy5vdmVyID0gdHJ1ZTtcblxuXHRcdFx0aWYodGhpcy5jb21wdXRlZFN0eWxlLmRpc3BsYXkgPT09ICdpbmxpbmUnKSB7XG5cdFx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5saW5lJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hvdmVyLWlubGluZScpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBoaWRlIHRoZSBob3ZlciBnaG9zdCBmb3IgaW5zcGVjdGlvblxuXHRcdFx0dGhpcy5ob3Zlckdob3N0Lm92ZXJsYXlFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cblx0XHRcdC8vIGZpbmQgbWF0Y2hpbmcgcnVsZXNcblx0XHRcdHRoaXMubWF0Y2hlZFJ1bGVzID0gU3R5bGVQYXJzZXIucmVzb2x2ZSh0aGlzLmN1cnJlbnRFbGVtZW50KTtcblxuXHRcdFx0Ly8gZXhlY3V0ZSBwbHVnaW5zXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2FjdGl2YXRlJyk7XG5cblx0XHRcdC8vIGluaXQgZXZlbnRzXG5cdFx0XHR0aGlzLmluaXQoKTtcblxuXHRcdFx0Ly8gcmVsYXlvdXRcblx0XHRcdHRoaXMucmVsYXlvdXQoKTtcblxuXHRcdH0sXG5cblx0XHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUpIHtcblx0XHRcdFx0dGhpcy5leGl0UnVsZU1vZGUoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdob3Zlci1pbm5lcicsICdob3Zlci1wYWRkaW5nJywgJ2hvdmVyLW1hcmdpbicsICdoaWRkZW4nKTtcblx0XHRcdHRoaXMub3ZlcmxheUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuXHRcdFx0Ly8gZXhlY3V0ZSBwbHVnaW5zXG5cdFx0XHR0aGlzLmNhbGxQbHVnaW4oJ2RlYWN0aXZhdGUnKTtcblxuXHRcdFx0dGhpcy5vdmVyID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJJbm5lciA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyUGFkZGluZyA9IGZhbHNlO1xuXHRcdFx0dGhpcy5vdmVyTWFyZ2luID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXJDb21tYW5kID0gZmFsc2U7XG5cdFx0XHR0aGlzLmN1cnJlbnRFbGVtZW50ID0gbnVsbDtcblxuXHRcdFx0JChkb2N1bWVudCkub2ZmKCdrZXl1cCcsIHRoaXMuX19rZXl1cCk7XG5cdFx0XHQkKGRvY3VtZW50KS5vZmYoJ2tleWRvd24nLCB0aGlzLl9fa2V5ZG93bik7XG5cblx0XHR9LFxuXG5cdFx0Lypcblx0XHQgKiBGdW5jdGlvbnMgcmVsYXRlZCB0byBydWxlLWJhc2VkIGVkaXRpbmdcblx0XHQgKi9cblxuXHRcdGVudGVyUnVsZU1vZGU6IGZ1bmN0aW9uKGNzc1J1bGUsIGluZGV4KSB7XG5cblx0XHRcdC8vIGlmIHNlbGVjdGVkUnVsZSBhbmQgbmV3IGNzc1J1bGUgYXJlIHRoZSBzYW1lLCBkb24ndCBkbyBhbnl0aGluZ1xuXHRcdFx0aWYodGhpcy5zZWxlY3RlZFJ1bGUgPT09IGNzc1J1bGUpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiBzZWxlY3RlZFJ1bGUgd2Fzbid0IGVtcHR5LCB3ZSBzaW1wbHkgY2hhbmdlIHRoZSBydWxlXG5cdFx0XHRpZih0aGlzLnNlbGVjdGVkUnVsZSkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGVkUnVsZSA9IGNzc1J1bGU7XG5cdFx0XHRcdHRoaXMuY2FsbFBsdWdpbignY2hhbmdlUnVsZScsIGluZGV4KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gY3NzUnVsZTtcblx0XHRcdFx0dGhpcy5jYWxsUGx1Z2luKCdlbnRlclJ1bGUnLCBpbmRleCk7XG5cdFx0XHR9XG5cblx0XHR9LFxuXG5cdFx0ZXhpdFJ1bGVNb2RlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY2FsbFBsdWdpbignZXhpdFJ1bGUnKTtcblx0XHRcdHRoaXMuc2VsZWN0ZWRSdWxlID0gbnVsbDtcblx0XHR9LFxuXG5cdFx0c2VsZWN0UnVsZTogZnVuY3Rpb24oY3NzUHJvcGVydHkpIHtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZWRSdWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZih0aGlzLm1hdGNoZWRSdWxlc1tpXS5zdHlsZVtjc3NQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHR0aGlzLmVudGVyUnVsZU1vZGUodGhpcy5tYXRjaGVkUnVsZXNbaV0sIGkpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBubyBydWxlIG1hdGNoaW5nPyBleGl0IHJ1bGUgbW9kZSB0aGVuXG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXG5cdFx0fSxcblxuXHRcdGRlc2VsZWN0UnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmV4aXRSdWxlTW9kZSgpO1xuXHRcdH0sXG5cblx0XHQvKiBcblx0XHQgKiBmdW5jdGlvbnMgdG8gdGVtcG9yYXJpbHkgZGlzYWJsZVxuXHRcdCAqIGxheW91dCBtb2RlLCBpLmUuIGZvciBwcmV2aWV3aW5nLlxuXHRcdCAqL1xuXG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cblx0XHRcdHRoaXMuaGlkZGVuID0gZmFsc2U7XG5cdFx0XHR0aGlzLm92ZXIgPSB0aGlzLl9fbGFzdE92ZXI7XG5cblx0XHRcdGlmKHRoaXMub3ZlcikgdGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdob3ZlcicpO1xuXHRcdFx0aWYodGhpcy5vdmVySW5uZXIpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItaW5uZXInKTtcblx0XHRcdGlmKHRoaXMub3ZlclBhZGRpbmcpIHRoaXMub3ZlcmxheUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaG92ZXItcGFkZGluZycpO1xuXHRcdFx0aWYodGhpcy5vdmVyTWFyZ2luKSB0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hvdmVyLW1hcmdpbicpO1xuXG5cdFx0XHR0aGlzLm92ZXJsYXlFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuXG5cdFx0XHQvLyBlZGdlIGNhc2U6IHVzZXIgaG9sZHMgY29tbWFuZCwgbW92ZXMgb3V0LCByZWxlYXNlcyBjb21tYW5kXG5cdFx0XHRpZih0aGlzLl9fbGFzdE1vdXNlTW92ZUV2ZW50KVxuXHRcdFx0XHR0aGlzLnByb2Nlc3NPdmVyTG9naWModGhpcy5fX2xhc3RNb3VzZU1vdmVFdmVudCk7XG5cblx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG5cblx0XHRcdHRoaXMuY2FsbFBsdWdpbignc2hvdycpO1xuXG5cdFx0fSxcblxuXHRcdGhpZGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHR0aGlzLmhpZGRlbiA9IHRydWU7XG5cdFx0XHR0aGlzLl9fbGFzdE92ZXIgPSB0aGlzLm92ZXI7XG5cdFx0XHR0aGlzLm92ZXIgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdob3ZlcicsICdob3Zlci1pbm5lcicsICdob3Zlci1tYXJnaW4nLCAnaG92ZXItcGFkZGluZycpO1xuXHRcdFx0dGhpcy5vdmVybGF5RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcblx0XHRcdHRoaXMuaG92ZXJHaG9zdC5vdmVybGF5RWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG5cblx0XHRcdHRoaXMuY2FsbFBsdWdpbignaGlkZScpO1xuXG5cdFx0fVxuXG5cblx0fSk7XG5cblx0Ly8gQ3JlYXRlIExheW91dCBNb2RlIChzaW5nbGV0b24pXG5cdHdpbmRvdy5MYXlvdXRNb2RlID0gbmV3IExheW91dE1vZGUoKTtcblxufSkoKTtcblxuXG4iLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy50aXRsZUJveCA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5LXRpdGxlXCI+PGRpdiBjbGFzcz1cInRpdGxlLXJ1bGVcIj48c3BhbiBjbGFzcz1cInNlbGVjdGVkXCI+aW5saW5lIHN0eWxlPC9zcGFuPiA8c3BhbiBjbGFzcz1cInRvZ2dsZVwiPuKWvjwvc3Bhbj48dWwgY2xhc3M9XCJkcm9wZG93blwiPjxsaT5pbmxpbmUgc3R5bGU8L2xpPjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cInRpdGxlLXByb3BvcnRpb25zXCI+MTAwIHggMTAwPC9kaXY+PC9kaXY+Jylcblx0XHRcdC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KVswXTtcblxuXHRcdHRoaXMudGl0bGVQcm9wb3J0aW9ucyA9ICQoJy50aXRsZS1wcm9wb3J0aW9ucycsIHRoaXMudGl0bGVCb3gpWzBdO1xuXHRcdHRoaXMudGl0bGVEcm9wZG93biA9ICQoJy5kcm9wZG93bicsIHRoaXMudGl0bGVCb3gpO1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly8gaW5pdGlhbGl6ZSB0aXRsZSBib3ggYmVoYXZpb3VyXG5cdFx0dmFyIHRpdGxlQm94ID0gdGhpcy50aXRsZUJveDtcblx0XHR2YXIgdGl0bGVEcm9wZG93biA9IHRoaXMudGl0bGVEcm9wZG93bjtcblxuXHRcdCQoJ3NwYW4nLCB0aXRsZUJveCkuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0XHQkKCcuZHJvcGRvd24nLCB0aXRsZUJveCkudG9nZ2xlKCk7XG5cdFx0fSk7XG5cblxuXHRcdHRpdGxlRHJvcGRvd24ub24oJ2NsaWNrJywgJ2xpJywgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aXRsZURyb3Bkb3duLmhpZGUoKTtcblx0XHRcdCQoJy5zZWxlY3RlZCcsIHRpdGxlQm94KS5odG1sKHRoaXMuaW5uZXJIVE1MKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuZmlsbFJ1bGVzKCk7XG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdCQoJ3NwYW4nLCB0aGlzLnRpdGxlQm94KS5vZmYoJ2NsaWNrJyk7XG5cdFx0JCgnc3BhbicsIHRoaXMudGl0bGVEcm9wZG93bikub2ZmKCdjbGljaycpO1xuXHR9LFxuXG5cdGVudGVyUnVsZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR0aGlzLnRpdGxlQm94LmNsYXNzTGlzdC5hZGQoJ3J1bGUnKTtcblx0XHRMYXlvdXRNb2RlLm92ZXJsYXlFbGVtZW50LnN0eWxlLnpJbmRleCA9IDEwMDAyO1xuXHRcdHRoaXMuY2hhbmdlUnVsZShpbmRleCk7XG5cdH0sXG5cblx0Y2hhbmdlUnVsZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR0aGlzLnRpdGxlRHJvcGRvd24uZmluZCgnbGk6ZXEoJyArIChpbmRleCArIDEpICsgJyknKS5jbGljaygpO1xuXHR9LFxuXG5cdGV4aXRSdWxlOiBmdW5jdGlvbigpIHtcblx0XHQkKCdzcGFuLnNlbGVjdGVkJywgdGhpcy50aXRsZUJveCkuaHRtbCgnaW5saW5lIHN0eWxlJyk7XG5cdFx0dGhpcy50aXRsZUJveC5jbGFzc0xpc3QucmVtb3ZlKCdydWxlJyk7XG5cdFx0TGF5b3V0TW9kZS5vdmVybGF5RWxlbWVudC5zdHlsZS56SW5kZXggPSAnJztcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMpIHtcblxuXHRcdHZhciBvZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cblx0XHQvLyBwbGFjZSB0aXRsZSBib3hcblx0XHR0aGlzLnRpdGxlQm94LnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdHRoaXMudGl0bGVCb3guc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKG9mZnNldC5sZWZ0ICsgKChwcm9wcy5vdXRlcldpZHRoIC0gdGhpcy50aXRsZUJveC5vZmZzZXRXaWR0aCkgLyAyKSkgKyAncHgsICcgKyAob2Zmc2V0LnRvcCAtIHByb3BzLm1hcmdpblRvcCAtIDU1KSArICdweCknO1xuXHRcdHRoaXMudGl0bGVQcm9wb3J0aW9ucy5pbm5lckhUTUwgPSBwcm9wcy5vdXRlcldpZHRoICsgJyB4ICcgKyBwcm9wcy5vdXRlckhlaWdodDtcblxuXHR9LFxuXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudGl0bGVCb3guc3R5bGUub3BhY2l0eSA9IDE7XG5cdH0sXG5cblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50aXRsZUJveC5zdHlsZS5vcGFjaXR5ID0gMDtcblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0ZmlsbFJ1bGVzOiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciByZXNvbHZlZCA9IExheW91dE1vZGUubWF0Y2hlZFJ1bGVzO1xuXG5cdFx0dGhpcy50aXRsZURyb3Bkb3duLmVtcHR5KCk7XG5cdFx0JCgnPGxpPmlubGluZSBzdHlsZTwvbGk+JykuYXBwZW5kVG8odGhpcy50aXRsZURyb3Bkb3duKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJlc29sdmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQkKCc8bGk+JyArIHJlc29sdmVkW2ldLnNlbGVjdG9yVGV4dCArICc8L2xpPicpXG5cdFx0XHRcdC5kYXRhKCdjc3NSdWxlJywgcmVzb2x2ZWRbaV0pXG5cdFx0XHRcdC5hcHBlbmRUbyh0aGlzLnRpdGxlRHJvcGRvd24pO1xuXHRcdH1cblxuXHR9XG5cbn0pOyIsIkxheW91dE1vZGUucmVnaXN0ZXJQbHVnaW4oe1xuXG5cdGNyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgb3ZlcmxheSA9IExheW91dE1vZGUub3ZlcmxheUVsZW1lbnQ7XG5cblx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tbGVmdFwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1tYXJnaW4tcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luQm90dG9tID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi1ib3R0b21cIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLW1hcmdpbi10b3BcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdCA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWxlZnRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ1JpZ2h0ID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctcmlnaHRcIj48L2Rpdj4nKS5hcHBlbmRUbyhvdmVybGF5KVswXTtcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbSA9ICQoJzxkaXYgY2xhc3M9XCJndWlkZSBndWlkZS1wYWRkaW5nLWJvdHRvbVwiPjwvZGl2PicpLmFwcGVuZFRvKG92ZXJsYXkpWzBdO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wID0gJCgnPGRpdiBjbGFzcz1cImd1aWRlIGd1aWRlLXBhZGRpbmctdG9wXCI+PC9kaXY+JykuYXBwZW5kVG8ob3ZlcmxheSlbMF07XG5cblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24ocHJvcHMpIHtcblxuXHRcdC8vIHBhZGRpbmcgZ3VpZGVzXG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdMZWZ0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoMHB4LCAnICsgKC1wcm9wcy5vZmZzZXQudG9wIC1wcm9wcy5wYWRkaW5nVG9wKSArICdweCknO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nTGVmdC5zdHlsZS5sZWZ0ID0gLXByb3BzLnBhZGRpbmdMZWZ0ICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdSaWdodC5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nUmlnaHQuc3R5bGUucmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0LTEgKyAncHgnO1xuXG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdCb3R0b20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlUGFkZGluZ0JvdHRvbS5zdHlsZS5ib3R0b20gPSAtcHJvcHMucGFkZGluZ0JvdHRvbS0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVQYWRkaW5nVG9wLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoJyArICgtcHJvcHMub2Zmc2V0LmxlZnQgLXByb3BzLnBhZGRpbmdMZWZ0KSArICdweCwgMHB4KSc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZVBhZGRpbmdUb3Auc3R5bGUudG9wID0gLXByb3BzLnBhZGRpbmdUb3AtMSArICdweCc7XG5cblx0XHQvLyBtYXJnaW4gZ3VpZGVzXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgwcHgsICcgKyAoLXByb3BzLm9mZnNldC50b3AgLXByb3BzLnBhZGRpbmdUb3ApICsgJ3B4KSc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkxlZnQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luTGVmdC5zdHlsZS5sZWZ0ID0gLXByb3BzLnBhZGRpbmdMZWZ0IC1wcm9wcy5tYXJnaW5MZWZ0ICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5SaWdodC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKDBweCwgJyArICgtcHJvcHMub2Zmc2V0LnRvcCAtcHJvcHMucGFkZGluZ1RvcCkgKyAncHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4Jztcblx0XHR0aGlzLmd1aWRlTWFyZ2luUmlnaHQuc3R5bGUucmlnaHQgPSAtcHJvcHMucGFkZGluZ1JpZ2h0IC1wcm9wcy5tYXJnaW5SaWdodCAtIDEgKyAncHgnO1xuXG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKCcgKyAoLXByb3BzLm9mZnNldC5sZWZ0IC1wcm9wcy5wYWRkaW5nTGVmdCkgKyAncHgsIDBweCknO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Cb3R0b20uc3R5bGUud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCArICdweCc7XG5cdFx0dGhpcy5ndWlkZU1hcmdpbkJvdHRvbS5zdHlsZS5ib3R0b20gPSAtcHJvcHMucGFkZGluZ0JvdHRvbSAtcHJvcHMubWFyZ2luQm90dG9tIC0xICsgJ3B4JztcblxuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3Auc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgnICsgKC1wcm9wcy5vZmZzZXQubGVmdCAtcHJvcHMucGFkZGluZ0xlZnQpICsgJ3B4LCAwcHgpJztcblx0XHR0aGlzLmd1aWRlTWFyZ2luVG9wLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggKyAncHgnO1xuXHRcdHRoaXMuZ3VpZGVNYXJnaW5Ub3Auc3R5bGUudG9wID0gLXByb3BzLnBhZGRpbmdUb3AgLXByb3BzLm1hcmdpblRvcCAtMSArICdweCc7XG5cblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cblx0fSxcblxuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuXHR9LFxuXG5cdGVudGVyUnVsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jcmVhdGVHaG9zdHMoKTtcblx0fSxcblxuXHRjaGFuZ2VSdWxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3lHaG9zdHMoKTtcblx0XHR0aGlzLmNyZWF0ZUdob3N0cygpO1xuXHR9LFxuXG5cdGV4aXRSdWxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRlc3Ryb3lHaG9zdHMoKTtcblx0fSxcblxuXHRyZWxheW91dDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy51cGRhdGVHaG9zdHMoKTtcblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0Z2hvc3RzOiBbXSxcblxuXHRjcmVhdGVHaG9zdHM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBnaG9zdHMgPSB0aGlzLmdob3N0cztcblx0XHQkKExheW91dE1vZGUuc2VsZWN0ZWRSdWxlLnNlbGVjdG9yVGV4dCkubm90KExheW91dE1vZGUuY3VycmVudEVsZW1lbnQpLm5vdCgnLm92ZXJsYXksIC5vdmVybGF5IConKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGdob3N0ID0gbmV3IEdob3N0KHRoaXMpO1xuXHRcdFx0Z2hvc3QucmVsYXlvdXQoKTtcblx0XHRcdGdob3N0cy5wdXNoKGdob3N0KTtcblx0XHR9KTtcblx0fSxcblxuXHRkZXN0cm95R2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmdob3N0c1tpXS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdHRoaXMuZ2hvc3RzID0gW107XG5cdH0sXG5cblx0dXBkYXRlR2hvc3RzOiBmdW5jdGlvbigpIHtcblx0XHRpZighdGhpcy5naG9zdHMpIHJldHVybjtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2hvc3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmdob3N0c1tpXS5yZWxheW91dCgpO1xuXHRcdH1cdFx0XG5cdH1cblxufSk7IiwiTGF5b3V0TW9kZS5yZWdpc3RlclBsdWdpbih7XG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScsIHRydWUpO1xuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICdub25lJztcblxuXHRcdExheW91dE1vZGUuY3VycmVudEVsZW1lbnQuZm9jdXMoKTtcblxuXHRcdCQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuXG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJyk7XG5cdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudC5zdHlsZS5vdXRsaW5lID0gJyc7XG5cblx0XHQkKGRvY3VtZW50KS5vZmYoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG5cblx0fSxcblxuXHQvKiBtZW1iZXIgZnVuY3Rpb25zICovXG5cblx0a2V5dXA6IGZ1bmN0aW9uKCkge1xuXHRcdExheW91dE1vZGUucmVsYXlvdXQoKTtcblx0fVxuXG59KTsiLCJMYXlvdXRNb2RlLnJlZ2lzdGVyUGx1Z2luKHtcblxuXHRjcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0JChkb2N1bWVudClcblx0XHRcdC5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0aWYoZS5rZXlDb2RlID09PSA5MSkgeyAvLyBjbWQga2V5XG5cdFx0XHRcdFx0dGhhdC5lbmFibGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5vbigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmKGUua2V5Q29kZSA9PT0gOTEpIHsgLy8gY21kIGtleVxuXHRcdFx0XHRcdHRoYXQuZGlzYWJsZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZGlzYWJsZSgpO1xuXHR9LFxuXG5cdGhvdmVyVGFyZ2V0Q2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cblx0XHRpZih0aGlzLmVuYWJsZWQpXG5cdFx0XHR0aGlzLnByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljKGUpO1xuXG5cdFx0Ly8gaWYgd2UncmUgaG9sZGluZyBzaGlmdCBhbmQgaG92ZXIgYW5vdGhlciBlbGVtZW50LCBzaG93IGd1aWRlc1xuXHRcdGlmKHRoaXMuZW5hYmxlZCAmJlxuXHRcdFx0TGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCAmJlxuXHRcdFx0TGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQgIT09IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuaG92ZXJFbGVtZW50LCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KSAmJlxuXHRcdFx0ISQuY29udGFpbnMoTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCwgTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpXG5cdFx0KSB7XG5cdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG8oTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHR9LFxuXG5cdC8qIG1lbWJlciBmdW5jdGlvbnMgKi9cblxuXHRlbmFibGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHRcdExheW91dE1vZGUuaGlkZSgpO1xuXG5cdFx0Ly9MYXlvdXRNb2RlLm92ZXIgPSBmYWxzZTtcblxuXHRcdC8vIHByb2Nlc3Mgb3ZlciBsb2dpYyBvbmNlXG5cdFx0aWYoTGF5b3V0TW9kZS5fX2xhc3RNb3VzZU1vdmVFdmVudClcblx0XHRcdHRoaXMucHJvY2Vzc0NvbW1hbmRPdmVyTG9naWMoTGF5b3V0TW9kZS5fX2xhc3RNb3VzZU1vdmVFdmVudCk7XG5cblx0XHQvLyB2aXN1YWxpemUgcmlnaHQgYXdheSB3aXRoIHdoYXQgd2UgcHJldmlvdXNseSBob3ZlcmVkXG5cdFx0aWYoTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQgIT09IExheW91dE1vZGUuY3VycmVudEVsZW1lbnQgJiZcblx0XHRcdCEkLmNvbnRhaW5zKExheW91dE1vZGUuaG92ZXJFbGVtZW50LCBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50KSAmJlxuXHRcdFx0ISQuY29udGFpbnMoTGF5b3V0TW9kZS5jdXJyZW50RWxlbWVudCwgTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpXG5cdFx0KSB7XG5cdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG8oTGF5b3V0TW9kZS5ob3ZlckVsZW1lbnQpO1xuXHRcdH1cblxuXHR9LFxuXG5cdGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuXHRcdHRoaXMuY29tbWFuZE92ZXIgPSBmYWxzZTtcblx0XHRpZih0aGlzLnZMaW5lWCkgdGhpcy52TGluZVguc3R5bGUub3BhY2l0eSA9IDA7XG5cdFx0aWYodGhpcy52TGluZVkpIHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdExheW91dE1vZGUuc2hvdygpO1xuXHR9LFxuXG5cdHByb2Nlc3NDb21tYW5kT3ZlckxvZ2ljOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgZXh0cmFNYXJnaW4gPSAxMDtcblx0XHR2YXIgb2Zmc2V0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0O1xuXG5cdFx0Ly8gY29tbWFuZCBvdmVyL291dFxuXG5cdFx0aWYoXG5cdFx0XHRlLnBhZ2VYID4gb2Zmc2V0LmxlZnQgLSBMYXlvdXRNb2RlLm1hcmdpbkxlZnQgLSBleHRyYU1hcmdpbiAmJlxuXHRcdFx0ZS5wYWdlWSA+IG9mZnNldC50b3AgLSBMYXlvdXRNb2RlLm1hcmdpblRvcCAtIGV4dHJhTWFyZ2luICYmXG5cdFx0XHRlLnBhZ2VYIDwgKG9mZnNldC5sZWZ0ICsgTGF5b3V0TW9kZS5vdXRlcldpZHRoICsgTGF5b3V0TW9kZS5tYXJnaW5SaWdodCArIGV4dHJhTWFyZ2luKSAmJlxuXHRcdFx0ZS5wYWdlWSA8IChvZmZzZXQudG9wICsgTGF5b3V0TW9kZS5vdXRlckhlaWdodCArIExheW91dE1vZGUubWFyZ2luQm90dG9tICsgZXh0cmFNYXJnaW4pXG5cdFx0KSB7XG5cblx0XHRcdGlmKCF0aGlzLmNvbW1hbmRPdmVyKSB7XG5cdFx0XHRcdHRoaXMuY29tbWFuZE92ZXIgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLnZpc3VhbGl6ZVJlbGF0aW9uVG9XaW5kb3coKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGlmKHRoaXMuY29tbWFuZE92ZXIpIHtcblx0XHRcdFx0dGhpcy5jb21tYW5kT3ZlciA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0Y3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzOiBmdW5jdGlvbigpIHtcblxuXHRcdGlmKCF0aGlzLnZMaW5lWCkge1xuXHRcdFx0dGhpcy52TGluZVggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdHRoaXMudkxpbmVYLmNsYXNzTmFtZSA9ICd2bGluZS14Jztcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVgpO1xuXG5cdFx0XHR0aGlzLnZMaW5lWENhcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5jbGFzc05hbWUgPSAnY2FwdGlvbic7XG5cdFx0XHR0aGlzLnZMaW5lWC5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWENhcHRpb24pO1xuXG5cdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLmNsYXNzTmFtZSA9ICdjcm9zc2Jhcic7XG5cdFx0XHR0aGlzLnZMaW5lWC5hcHBlbmRDaGlsZCh0aGlzLnZMaW5lWENyb3NzQmFyKTtcblx0XHR9XG5cblx0XHRpZighdGhpcy52TGluZVkpIHtcblx0XHRcdHRoaXMudkxpbmVZID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWS5jbGFzc05hbWUgPSAndmxpbmUteSc7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudkxpbmVZKTtcblxuXHRcdFx0dGhpcy52TGluZVlDYXB0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHR0aGlzLnZMaW5lWUNhcHRpb24uY2xhc3NOYW1lID0gJ2NhcHRpb24nO1xuXHRcdFx0dGhpcy52TGluZVkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVlDYXB0aW9uKTtcblxuXHRcdFx0dGhpcy52TGluZVlDcm9zc0JhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5jbGFzc05hbWUgPSAnY3Jvc3NiYXInO1xuXHRcdFx0dGhpcy52TGluZVkuYXBwZW5kQ2hpbGQodGhpcy52TGluZVlDcm9zc0Jhcik7XG5cdFx0fVxuXG5cdH0sXG5cblx0dmlzdWFsaXplUmVsYXRpb25Ub1dpbmRvdzogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgY3VycmVudEVsZW1lbnQgPSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50O1xuXG5cdFx0dGhpcy5jcmVhdGVWaXN1YWxpemF0aW9uTGluZXMoKTtcblxuXHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IChMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQudG9wICsgKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpKSArICdweCc7XG5cdFx0dGhpcy52TGluZVguc3R5bGUubGVmdCA9IDAgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVYLnN0eWxlLndpZHRoID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LmxlZnQgKyAncHgnO1xuXHRcdHRoaXMudkxpbmVYQ2FwdGlvbi5pbm5lckhUTUwgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQubGVmdCArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUubGVmdCA9IChMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpKSArICdweCc7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUudG9wID0gMCArICdweCc7XG5cdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gTGF5b3V0TW9kZS5jdXJyZW50T2Zmc2V0LnRvcCArICdweCc7XG5cdFx0dGhpcy52TGluZVlDYXB0aW9uLmlubmVySFRNTCA9IExheW91dE1vZGUuY3VycmVudE9mZnNldC50b3AgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHR9LFxuXG5cdHZpc3VhbGl6ZVJlbGF0aW9uVG86IGZ1bmN0aW9uKHJlbGF0ZWRFbGVtZW50KSB7XG5cblx0XHR2YXIgY3VycmVudEVsZW1lbnQgPSBMYXlvdXRNb2RlLmN1cnJlbnRFbGVtZW50LCB0b3AsIGxlZnQ7XG5cdFx0dmFyIGN1cnJlbnRPZmZzZXQgPSBMYXlvdXRNb2RlLmN1cnJlbnRPZmZzZXQ7XG5cdFx0dmFyIHJlbGF0ZWRPZmZzZXQgPSAkKHJlbGF0ZWRFbGVtZW50KS5vZmZzZXQoKTtcblxuXHRcdHRoaXMuY3JlYXRlVmlzdWFsaXphdGlvbkxpbmVzKCk7XG5cblx0XHR2YXIgcmVSaWdodEVkZ2UgPSByZWxhdGVkT2Zmc2V0LmxlZnQgKyByZWxhdGVkRWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHR2YXIgY2VSaWdodEVkZ2UgPSBjdXJyZW50T2Zmc2V0LmxlZnQgKyBjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcblx0XHR2YXIgcmVMZWZ0RWRnZSA9IHJlbGF0ZWRPZmZzZXQubGVmdDtcblx0XHR2YXIgY2VMZWZ0RWRnZSA9IGN1cnJlbnRPZmZzZXQubGVmdDtcblxuXHRcdHZhciByZUJvdHRvbUVkZ2UgPSByZWxhdGVkT2Zmc2V0LnRvcCArIHJlbGF0ZWRFbGVtZW50Lm9mZnNldEhlaWdodDtcblx0XHR2YXIgY2VCb3R0b21FZGdlID0gY3VycmVudE9mZnNldC50b3AgKyBjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQ7XG5cdFx0dmFyIHJlVG9wRWRnZSA9IHJlbGF0ZWRPZmZzZXQudG9wO1xuXHRcdHZhciBjZVRvcEVkZ2UgPSBjdXJyZW50T2Zmc2V0LnRvcDtcblx0XHRcblx0XHQvLyBob3Jpem9udGFsIGNvbm5lY3Rpb25cblx0XHRpZihyZVJpZ2h0RWRnZSA8IGNlTGVmdEVkZ2UpIHtcblxuXHRcdFx0dG9wID0gY3VycmVudE9mZnNldC50b3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gcmVSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSBjZUxlZnRFZGdlIC0gcmVSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCB0b3ApIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSBpZih0b3AgPCByZVRvcEVkZ2UpIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmhlaWdodCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLyAyKSArIChyZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZihjZVJpZ2h0RWRnZSA8IHJlTGVmdEVkZ2UpIHtcblxuXHRcdFx0dG9wID0gY3VycmVudE9mZnNldC50b3AgKyAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMik7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5vcGFjaXR5ID0gMTtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLnRvcCA9IHRvcCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWC5zdHlsZS5sZWZ0ID0gY2VSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVguc3R5bGUud2lkdGggPSByZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVhDYXB0aW9uLmlubmVySFRNTCA9IHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSArICfigIk8c3Bhbj5weDwvc3Bhbj4nO1xuXG5cdFx0XHRpZihyZUJvdHRvbUVkZ2UgPCB0b3ApIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLmJvdHRvbSA9ICcwcHgnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWENyb3NzQmFyLnN0eWxlLnRvcCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5oZWlnaHQgPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC8gMikgKyAoY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2UgaWYodG9wIDwgcmVUb3BFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICcxMDAlJztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5ib3R0b20gPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVYQ3Jvc3NCYXIuc3R5bGUuaGVpZ2h0ID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAvIDIpICsgKHJlVG9wRWRnZSAtIGNlQm90dG9tRWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52TGluZVhDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudkxpbmVYLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdH1cblxuXHRcdC8vIHZlcnRpY2FsIGNvbm5lY3Rpb25cblx0XHRpZihyZUJvdHRvbUVkZ2UgPCBjZVRvcEVkZ2UpIHtcblxuXHRcdFx0bGVmdCA9IGN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSByZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gY2VUb3BFZGdlIC0gcmVCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSBjZVRvcEVkZ2UgLSByZUJvdHRvbUVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVSaWdodEVkZ2UgPCBsZWZ0KSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJ2F1dG8nO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLndpZHRoID0gKGN1cnJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC8gMikgKyAoY2VMZWZ0RWRnZSAtIHJlUmlnaHRFZGdlKSArICdweCc7XG5cdFx0XHR9IGVsc2UgaWYobGVmdCA8IHJlTGVmdEVkZ2UpIHtcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS50b3AgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5sZWZ0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUucmlnaHQgPSAnYXV0byc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUud2lkdGggPSAoY3VycmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLyAyKSArIChyZUxlZnRFZGdlIC0gY2VSaWdodEVkZ2UpICsgJ3B4Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZihjZUJvdHRvbUVkZ2UgPCByZVRvcEVkZ2UpIHtcblxuXHRcdFx0bGVmdCA9IGN1cnJlbnRPZmZzZXQubGVmdCArIChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG5cdFx0XHR0aGlzLnZMaW5lWS5zdHlsZS50b3AgPSBjZUJvdHRvbUVkZ2UgKyAncHgnO1xuXHRcdFx0dGhpcy52TGluZVkuc3R5bGUuaGVpZ2h0ID0gcmVUb3BFZGdlIC0gY2VCb3R0b21FZGdlICsgJ3B4Jztcblx0XHRcdHRoaXMudkxpbmVZQ2FwdGlvbi5pbm5lckhUTUwgPSByZVRvcEVkZ2UgLSBjZUJvdHRvbUVkZ2UgKyAn4oCJPHNwYW4+cHg8L3NwYW4+JztcblxuXHRcdFx0aWYocmVSaWdodEVkZ2UgPCBsZWZ0KSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLnJpZ2h0ID0gJzBweCc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUubGVmdCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKGNlTGVmdEVkZ2UgLSByZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIGlmKGxlZnQgPCByZUxlZnRFZGdlKSB7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdHRoaXMudkxpbmVZQ3Jvc3NCYXIuc3R5bGUudG9wID0gJzEwMCUnO1xuXHRcdFx0XHR0aGlzLnZMaW5lWUNyb3NzQmFyLnN0eWxlLmxlZnQgPSAnMHB4Jztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5yaWdodCA9ICdhdXRvJztcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS53aWR0aCA9IChjdXJyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAvIDIpICsgKHJlTGVmdEVkZ2UgLSBjZVJpZ2h0RWRnZSkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52TGluZVlDcm9zc0Jhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudkxpbmVZLnN0eWxlLm9wYWNpdHkgPSAwO1xuXHRcdH1cblxuXHR9XG5cbn0pOyIsIihmdW5jdGlvbigpIHtcblxuXHRMYXlvdXRNb2RlLmVuYWJsZSgpO1xuXG5cdC8vJCgndWwnKS5zb3J0YWJsZSgpO1xuXHQkKCcjdGVzdGJveCcpLmNsaWNrKCk7XG5cbn0pKCk7XG5cblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
