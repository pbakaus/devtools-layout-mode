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