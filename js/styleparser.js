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

		// fill dropdown with css selectors
		var resolutions = [];

		var parent = trackedElement, parentChain = [];
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

		return resolutions;

	};

	StyleParser.validate = function(paths) {

		var resolved = [];
		for (var i = 0; i < paths.length; i++) {
			if(rules[paths[i]]) {
				resolved.push(rules[paths[i]]);
			}
		}

		return resolved;

	};


	window.StyleParser = StyleParser;

})();