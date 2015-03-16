(function() {

	var inFocus = null;
	var inInspect = false;
	var overlay = null;
	var focusOffset = null;
	var over = false;
	var interacting = false;
	var handleOffset = 7;
	var dropdown = null;
	var selectedRule = null;
	var ghosts = [];

	var focusOuterWidth, focusOuterHeight,
		focusMarginLeft, focusMarginTop, focusMarginBottom, focusMarginRight;

	var containerPaddingLeft, containerPaddingRight, containerPaddingTop, containerPaddingBottom,
		containerMarginLeft, containerMarginRight, containerMarginTop, containerMarginBottom;

	var handlePaddingLeft, handlePaddingRight, handlePaddingTop, handlePaddingBottom,
		handleMarginLeft, handleMarginRight, handleMarginTop, handleMarginBottom;

	var captionWidth, captionHeight;

	var guideLeft, guideRight, guideTop, guideBottom;

	var enterRuleMode = function(cssRule) {

		console.log('entering rule mode..');
		selectedRule = cssRule;
		$('.title', overlay).addClass('rule');
		overlay.css('zIndex', 10002);

		$(selectedRule.selectorText).not(inFocus).not('.overlay, .overlay *').each(function() {

			var ghost = createGhost();
			setOverlay(ghost, this, true);
			ghosts.push([this, ghost]);

		});

	};

	var exitRuleMode = function() {

		console.log('exiting rule mode..');
		
		$('.title span.selected', overlay).html('inline style');
		$('.title', overlay).removeClass('rule');
		overlay.css('zIndex', '');

		for (var i = 0; i < ghosts.length; i++) {
			ghosts[i][1].remove();
		}

		selectedRule = null;
		ghosts = [];

	};

	var updateGhosts = function() {
		if(!ghosts) return;
		for (var i = 0; i < ghosts.length; i++) {
			setOverlay(ghosts[i][1], ghosts[i][0], true);
		}		
	};

	var createGhost = function() {

		var ghost = $('<div class="overlay ghost"></div>');
		containerMarginTop = $('<div class="container-margin top"></div>').appendTo(ghost);
		containerMarginBottom = $('<div class="container-margin bottom"></div>').appendTo(ghost);
		containerMarginLeft = $('<div class="container-margin left"></div>').appendTo(ghost);
		containerMarginRight = $('<div class="container-margin right"></div>').appendTo(ghost);
		containerPaddingTop = $('<div class="container-padding top"></div>').appendTo(ghost);
		containerPaddingBottom = $('<div class="container-padding bottom"></div>').appendTo(ghost);
		containerPaddingLeft = $('<div class="container-padding left"></div>').appendTo(ghost);
		containerPaddingRight = $('<div class="container-padding right"></div>').appendTo(ghost);

		ghost.appendTo('body');
		return ghost;

	};

	var createOverlay = function() {

		overlay = $('<div id="overlay" class="overlay"></div>');

		guideLeft = $('<div class="guide-left"></div>').appendTo(overlay);
		guideRight = $('<div class="guide-right"></div>').appendTo(overlay);
		guideBottom = $('<div class="guide-bottom"></div>').appendTo(overlay);
		guideTop = $('<div class="guide-top"></div>').appendTo(overlay);
		
		containerMarginTop = $('<div class="container-margin top"><div class="title"><span class="selected">inline style</span> <span class="toggle">▾</span><ul class="dropdown"><li>inline style</li><li>.box {}</li><li>div {}</li></ul></div></div>').appendTo(overlay);
		containerMarginBottom = $('<div class="container-margin bottom"></div>').appendTo(overlay);
		containerMarginLeft = $('<div class="container-margin left"></div>').appendTo(overlay);
		containerMarginRight = $('<div class="container-margin right"></div>').appendTo(overlay);
		containerPaddingTop = $('<div class="container-padding top"></div>').appendTo(overlay);
		containerPaddingBottom = $('<div class="container-padding bottom"></div>').appendTo(overlay);
		containerPaddingLeft = $('<div class="container-padding left"></div>').appendTo(overlay);
		containerPaddingRight = $('<div class="container-padding right"></div>').appendTo(overlay);
		$('<div class="handle bottom handle-size" title="Drag to change height"></div>').appendTo(overlay);
		handlePaddingBottom = $('<div class="handle bottom handle-padding" title="Drag to change padding"></div>').appendTo(overlay);
		handleMarginBottom = $('<div class="handle bottom handle-margin" title="Drag to change margin"></div>').appendTo(overlay);
		$('<div class="handle right handle-size" title="Drag to change width"></div>').appendTo(overlay);
		handlePaddingRight = $('<div class="handle right handle-padding" title="Drag to change padding"></div>').appendTo(overlay);
		handleMarginRight = $('<div class="handle right handle-margin" title="Drag to change margin"></div>').appendTo(overlay);
		handlePaddingTop = $('<div class="handle top handle-padding" title="Drag to change padding"></div>').appendTo(overlay);
		handleMarginTop = $('<div class="handle top handle-margin" title="Drag to change margin"></div>').appendTo(overlay);
		handlePaddingLeft = $('<div class="handle left handle-padding" title="Drag to change padding"></div>').appendTo(overlay);
		handleMarginLeft = $('<div class="handle left handle-margin" title="Drag to change margin"></div>').appendTo(overlay);

		captionWidth = $('<div class="caption caption-width"></div>').appendTo(overlay);
		captionHeight = $('<div class="caption caption-height"></div>').appendTo(overlay);



		overlay.appendTo('body');

	};

	var initializeOverlay = function() {

		$('.title span', overlay).click(function() {
			$(".title .dropdown", overlay).toggle();
		});

		dropdown = $('.title .dropdown', overlay);
		dropdown.on('click', 'li', function() {

			$(".title .dropdown", overlay).hide();
			$(".title .selected", overlay).html(this.innerHTML);
			
			var cssRule = $(this).data('cssRule');
			if(cssRule) {
				enterRuleMode(cssRule);
			} else {
				exitRuleMode();
			}

		});

		$('body').on('mousemove', function(e) {

			var extraMargin = 10;
			if(!inFocus || !inInspect) {
				return;
			}

			if(
				e.pageX > focusOffset.left - focusMarginLeft - extraMargin
				&& e.pageY > focusOffset.top - focusMarginTop - extraMargin
				&& e.pageX < (focusOffset.left + focusOuterWidth + focusMarginRight + extraMargin)
				&& e.pageY < (focusOffset.top + focusOuterHeight + focusMarginBottom + extraMargin)
			) {

				if(!over) {
					overlay.addClass('hover');
					over = true;
				}

			} else {

				if(over && !interacting) {
					over = false;
					overlay.removeClass('hover');				
				}

			}
		});

		$(document).on('keydown', function(e) {
			if(e.which === 16) {
				dropdown.find('li:eq(1)').click();
			}
		});

		$(document).on('keyup', function(e) {
			if(e.which === 16) {
				dropdown.find('li:eq(0)').click();
			}
		});

		// resize handles

		$('.handle-size.bottom').draggable({
			axis: 'y',
			cursor: 's-resize',
			start: function() {
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.top = Math.max(0 - handleOffset, ui.position.top);
				(selectedRule || inFocus[0]).style.height = (ui.position.top + handleOffset) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
			}
		});

		$('.handle-size.right').draggable({
			axis: 'x',
			cursor: 'e-resize',
			start: function() {
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.left = Math.max(0 - handleOffset, ui.position.left);
				(selectedRule || inFocus[0]).style.width = (ui.position.left + handleOffset) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
			}
		});

		// resize padding

		handlePaddingBottom.draggable({
			axis: 'y',
			cursor: 's-resize',
			start: function() {
				this.curInnerHeight = $(inFocus).height();
				this.curPaddingBottom = parseInt(inFocus.css('padding-bottom'));
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.top = Math.max(this.curInnerHeight - handleOffset, ui.position.top);
				(selectedRule || inFocus[0]).style.paddingBottom = Math.max(0, this.curPaddingBottom + (ui.position.top - ui.originalPosition.top)) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
				setOverlay(overlay, inFocus);
				updateGhosts();
			}
		});

		handlePaddingRight.draggable({
			axis: 'x',
			cursor: 'e-resize',
			start: function() {
				this.curInnerWidth = $(inFocus).width();
				this.curPaddingRight = parseInt(inFocus.css('padding-right'));
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.left = Math.max(this.curInnerWidth - handleOffset, ui.position.left);
				(selectedRule || inFocus[0]).style.paddingRight = Math.max(0, this.curPaddingRight + (ui.position.left - ui.originalPosition.left)) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
				setOverlay(overlay, inFocus);
				updateGhosts();
			}
		});

		handlePaddingTop.draggable({
			axis: 'y',
			cursor: 'n-resize',
			start: function(event, ui) {
				this.curOffset = ui.offset.top;
				this.curPaddingTop = parseInt(inFocus.css('padding-top'));
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.top = -handleOffset + 2;
				(selectedRule || inFocus[0]).style.paddingTop = Math.max(0, this.curPaddingTop - (ui.offset.top - this.curOffset)) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
				setOverlay(overlay, inFocus);
				updateGhosts();
			}
		});

		handlePaddingLeft.draggable({
			axis: 'x',
			cursor: 'w-resize',
			start: function(event, ui) {
				this.curOffset = ui.offset.left;
				this.curPaddingLeft = parseInt(inFocus.css('padding-left'));
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.left = -handleOffset + 2;
				(selectedRule || inFocus[0]).style.paddingLeft = Math.max(0, this.curPaddingLeft - (ui.offset.left - this.curOffset)) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
				setOverlay(overlay, inFocus);
				updateGhosts();
			}
		});

		// resize padding

		handleMarginBottom.draggable({
			axis: 'y',
			cursor: 's-resize',
			start: function() {
				this.curInnerHeight = $(inFocus).height();
				this.curMarginBottom = parseInt(inFocus.css('margin-bottom'));
				this.curPaddingBottom = parseInt(inFocus.css('padding-bottom'));
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.top = Math.max(this.curInnerHeight + this.curPaddingBottom - handleOffset, ui.position.top);
				(selectedRule || inFocus[0]).style.marginBottom = Math.max(0, this.curMarginBottom + (ui.position.top - ui.originalPosition.top)) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
				setOverlay(overlay, inFocus);
				updateGhosts();
			}
		});

		handleMarginRight.draggable({
			axis: 'x',
			cursor: 'e-resize',
			start: function() {
				this.curInnerWidth = $(inFocus).width();
				this.curMarginRight = parseInt(inFocus.css('margin-right'));
				this.curPaddingRight = parseInt(inFocus.css('padding-right'));
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.left = Math.max(this.curInnerWidth + this.curPaddingRight - handleOffset, ui.position.left);
				(selectedRule || inFocus[0]).style.marginRight = Math.max(0, this.curMarginRight + (ui.position.left - ui.originalPosition.left)) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
				setOverlay(overlay, inFocus);
				updateGhosts();
			}
		});

		handleMarginLeft.draggable({
			axis: 'x',
			cursor: 'w-resize',
			start: function(event, ui) {
				this.curOffset = ui.offset.left;
				this.curMarginLeft = parseInt(inFocus.css('margin-left'));
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.left = -handleOffset + 2;
				(selectedRule || inFocus[0]).style.marginLeft = Math.max(0, this.curMarginLeft - (ui.offset.left - this.curOffset)) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
				setOverlay(overlay, inFocus);
				updateGhosts();
			}
		});

		handleMarginTop.draggable({
			axis: 'y',
			cursor: 'n-resize',
			start: function(event, ui) {
				this.curOffset = ui.offset.top;
				this.curMarginTop = parseInt(inFocus.css('margin-top'));
				interacting = true;
			},
			drag: function(event, ui) {
				ui.position.top = -handleOffset + 2;
				(selectedRule || inFocus[0]).style.marginTop = Math.max(0, this.curMarginTop - (ui.offset.top - this.curOffset)) + 'px';
				setOverlay(overlay, inFocus);
				updateGhosts();
			},
			stop: function() {
				this.removeAttribute('style');
				interacting = false;
				setOverlay(overlay, inFocus);
				updateGhosts();
			}
		});

	};

	var buildStyleResolutionList = function(trackedElement) {

		// fill dropdown with css selectors
		var resolutions = [];

		var parent = trackedElement[0], parentChain = [];
		while(parent && parent.tagName) {

			//resolutions.push(parent.tagName + parentChain);
			var parentChainItem = [parent.tagName.toLowerCase()];

			if(parent.id) {
				parentChainItem.push('#' + parent.id);
				parentChainItem.push(parent.tagName.toLowerCase() + '#' + parent.id);
			}

			if(parent.classList && parent.classList.length) {
				for (var i = 0; i < parent.classList.length; i++) {
					parentChainItem.push('.' + parent.classList[i]);
					parentChainItem.push(parent.tagName.toLowerCase() + '.' + parent.classList[i]);
				}
			}

			parentChain.push(parentChainItem);
			parent = parent.parentNode;

		}

		var fn = function(set, chain) {

			var newSet = [];
			var chainItem = chain.shift();

			for (var i = 0; i < set.length; i++) {
				for (var j = 0; j < chainItem.length; j++) {
					newSet.push(chainItem[j] + (set[i] ? ' ' + set[i] : ''));
					resolutions.push(chainItem[j] + (set[i] ? ' ' + set[i] : ''));
				}
			}

			if(chain.length) {
				fn(newSet, chain);
			}

		};

		fn([''], parentChain);


		var resolved = StyleParser.validate(resolutions);
		dropdown.empty();
		$('<li>inline style</li>').appendTo(dropdown);
		for (var i = 0; i < resolved.length; i++) {
			$('<li>' + resolved[i].selectorText + '</li>')
				.data('cssRule', resolved[i])
				.appendTo(dropdown);
		}

		return resolved;

	};


	var setOverlay = function(overlayElement, trackedElement, ghost) {

		var elem = $(trackedElement);
		var offset = elem.offset();

		if(!ghost) {
			focusOffset = offset;
		}

		// add hover class initially
		if(!ghost && inInspect) {
			overlay.addClass('hover');
			over = true;
		}

		var innerWidth = elem.width();
		var innerHeight = elem.height();

		var outerWidth = elem[0].offsetWidth;
		var outerHeight = elem[0].offsetHeight;

		if(!ghost) {
			focusOuterWidth = outerWidth;
			focusOuterHeight = outerHeight;
		}

		var paddingLeft = parseInt(elem.css('padding-left'));
		var paddingTop = parseInt(elem.css('padding-top'));
		var paddingRight = parseInt(elem.css('padding-right'));
		var paddingBottom = parseInt(elem.css('padding-bottom'));

		var marginLeft = parseInt(elem.css('margin-left'));
		var marginTop = parseInt(elem.css('margin-top'));
		var marginRight = parseInt(elem.css('margin-right'));
		var marginBottom = parseInt(elem.css('margin-bottom'));

		if(!ghost) {
			focusMarginLeft = marginLeft;
			focusMarginTop = marginTop;
			focusMarginRight = marginRight;
			focusMarginBottom = marginBottom;
		}

		// place overlay
		overlayElement
			.css({
				display: 'block',
				width: innerWidth,
				height: innerHeight,
				top: offset.top + paddingTop,
				left: offset.left + paddingLeft
			});


		// modify padding box

		// left
		$(".container-padding.left", overlayElement).css({
			width: paddingLeft,
			height: outerHeight,
			top: -paddingTop,
			left: -paddingLeft
		});

		// right
		$(".container-padding.right", overlayElement).css({
			width: paddingRight,
			height: outerHeight,
			top: -paddingTop,
			right: -paddingRight
		});

		// top
		$(".container-padding.top", overlayElement).css({
			width: innerWidth,
			height: paddingTop,
			top: -paddingTop
		});

		// bottom
		$(".container-padding.bottom", overlayElement).css({
			width: innerWidth,
			height: paddingBottom,
			bottom: -paddingBottom
		});

		if(!ghost) {
			handlePaddingLeft.css({
				marginLeft: -paddingLeft
			});

			handlePaddingRight.css({
				marginRight: -paddingRight
			});

			handlePaddingTop.css({
				marginTop: -paddingTop
			});

			handlePaddingBottom.css({
				marginBottom: -paddingBottom
			});
		}

		// modify margin box

		// left
		$(".container-margin.left", overlayElement).css({
			width: marginLeft,
			height: outerHeight + marginTop + marginBottom,
			top: -(paddingTop + marginTop),
			left: -(paddingLeft + marginLeft)
		});

		// right
		$(".container-margin.right", overlayElement).css({
			width: marginRight,
			height: outerHeight + marginTop + marginBottom,
			top: -(paddingTop + marginTop),
			right: -(paddingRight + marginRight)
		});

		// top
		$(".container-margin.top", overlayElement).css({
			width: outerWidth,
			height: marginTop,
			top: -(paddingTop + marginTop),
			left: -paddingLeft
		});

		// bottom
		$(".container-margin.bottom", overlayElement).css({
			width: outerWidth,
			height: marginBottom,
			bottom: -(paddingBottom + marginBottom),
			left: -paddingLeft
		});

		if(!ghost) {
			handleMarginLeft.css({
				marginLeft: -(paddingLeft + marginLeft)
			});

			handleMarginRight.css({
				marginRight: -(paddingRight + marginRight)
			});

			handleMarginTop.css({
				marginTop: -(paddingTop + marginTop)
			});

			handleMarginBottom.css({
				marginBottom: -(paddingBottom + marginBottom)
			});




			// guides

			guideLeft.css({ top: -offset.top -paddingTop, height: window.innerHeight });
			guideRight.css({ top: -offset.top -paddingTop, height: window.innerHeight });
			guideBottom.css({ left: -offset.left -paddingLeft, width: window.innerWidth });
			guideTop.css({ left: -offset.left -paddingLeft, width: window.innerWidth });



			// captions


			var hitsRightEdge = (offset.left + outerWidth + 40 > window.innerWidth);
			captionWidth[(hitsRightEdge ? 'add' : 'remove') + 'Class']('edge');
			captionWidth
				.html(innerWidth)
				.css({
					right: hitsRightEdge ? 13 : -(captionWidth[0].offsetWidth+13)
				});

			captionHeight
				.html(innerHeight)
				.css({
					bottom: 1
				});

		}

	};

	createOverlay();

	initializeOverlay();

	// make all elements on page inspectable
	$("body *:not(.overlay,.overlay *)").on('mouseover', function() {

		if(inFocus === this || inInspect)
			return;

		// focus the element
		inFocus = $(this);

		// create overlay
		setOverlay(overlay, inFocus);

		return false;

	});

	// make all elements on page inspectable
	$("body *:not(.overlay,.overlay *)").on('click', function() {

		if(inFocus === this && inInspect)
			return;

		// focus the element
		inFocus = $(this);
		inInspect = true;

		// create overlay
		setOverlay(overlay, inFocus);

		// fill dropdown with correct CSS rules
		buildStyleResolutionList(inFocus);
		exitRuleMode();

		return false;

	});

	$(document).on('keyup', function(e) {
		if(e.keyCode === 27) {
			inInspect = false;
		}
	});


	$(".box").click();


})();


