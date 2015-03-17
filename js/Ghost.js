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

		var overlayElement = $(this.overlayElement);
		var elem = $(this.currentElement);
		var offset = elem.offset();

		var innerWidth = elem.width();
		var innerHeight = elem.height();

		var outerWidth = elem[0].offsetWidth;
		var outerHeight = elem[0].offsetHeight;

		var paddingLeft = parseInt(elem.css('padding-left'));
		var paddingTop = parseInt(elem.css('padding-top'));
		var paddingRight = parseInt(elem.css('padding-right'));
		var paddingBottom = parseInt(elem.css('padding-bottom'));

		var marginLeft = parseInt(elem.css('margin-left'));
		var marginTop = parseInt(elem.css('margin-top'));
		var marginRight = parseInt(elem.css('margin-right'));
		var marginBottom = parseInt(elem.css('margin-bottom'));

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

	}

});