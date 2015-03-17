(function() {

	var link = document.createElement('link');
	link.href = "//paulbakaus.com/labs/layoutmode/css/overlay.css";
	link.setAttribute('rel', 'stylesheet');
	document.head.appendChild(link);

	var link = document.createElement('link');
	link.href = "//ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/themes/smoothness/jquery-ui.css";
	link.setAttribute('rel', 'stylesheet');
	document.head.appendChild(link);

	var script = document.createElement('script');
	script.src = "//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js";
	script.type = "text/javascript";
	script.onload = function() {

		var script = document.createElement('script');
		script.src = "//ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js";
		script.type = "text/javascript";
		script.onload = function() {

			var script = document.createElement('script');
			script.src = "//paulbakaus.com/labs/layoutmode/js/StyleParser.js";
			script.type = "text/javascript";
			script.onload = function() {

				var script = document.createElement('script');
				script.src = "//paulbakaus.com/labs/layoutmode/js/main.js";
				script.type = "text/javascript";
				document.body.appendChild(script);

			};
			document.body.appendChild(script);

		};
		document.body.appendChild(script);

	};
	document.body.appendChild(script);

})();