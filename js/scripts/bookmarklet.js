javascript:(function() {

	var link = document.createElement('link');
	link.href = '//pbakaus.github.io/devtools-layout-mode/build/css/main.css';
	link.setAttribute('rel', 'stylesheet');
	document.head.appendChild(link);

	var script = document.createElement('script');
	script.src = '//pbakaus.github.io/devtools-layout-mode/build/js/all.js';
	script.type = 'text/javascript';
	document.body.appendChild(script);

})()