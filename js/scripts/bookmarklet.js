var link = document.createElement('link');
link.href = '//pbakaus.github.io/devtools-layout-mode/build/css/layoutmode.css';
link.setAttribute('rel', 'stylesheet');
document.head.appendChild(link);

var script = document.createElement('script');
script.src = '//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js';
script.type = 'text/javascript';
script.onload = function() {

	var script = document.createElement('script');
	script.src = '//pbakaus.github.io/devtools-layout-mode/build/js/all.js';
	script.type = 'text/javascript';
	script.onload = function() {
		LayoutMode.enable();
	};
	document.body.appendChild(script);

};
document.body.appendChild(script);