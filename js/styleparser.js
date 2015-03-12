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