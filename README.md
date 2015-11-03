# Layout Mode. Yeah baby.
Layout Mode ftw! This is an experiment. [Try it out in this demo page!](https://pbakaus.github.io/devtools-layout-mode/)

## The bookmarklet

Use this bookmarklet and profit. Change the URL to one on your localhost once you checked out a copy.

```
javascript:void%20function(){var%20e=document.createElement(%22link%22);e.href=%22//pbakaus.github.io/devtools-layout-mode/build/css/layoutmode.css%22,e.setAttribute(%22rel%22,%22stylesheet%22),document.head.appendChild(e);var%20t=document.createElement(%22script%22);t.src=%22//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js%22,t.type=%22text/javascript%22,t.onload=function(){var%20e=document.createElement(%22script%22);e.src=%22//pbakaus.github.io/devtools-layout-mode/build/js/all.js%22,e.type=%22text/javascript%22,e.onload=function(){LayoutMode.enable()},document.body.appendChild(e)},document.body.appendChild(t)}();
```

Or just drag this bookmarklet to your favorites directly:

[LAYOUT MODE](javascript:void%20function(){var%20e=document.createElement(%22link%22);e.href=%22//pbakaus.github.io/devtools-layout-mode/build/css/layoutmode.css%22,e.setAttribute(%22rel%22,%22stylesheet%22),document.head.appendChild(e);var%20t=document.createElement(%22script%22);t.src=%22//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js%22,t.type=%22text/javascript%22,t.onload=function(){var%20e=document.createElement(%22script%22);e.src=%22//pbakaus.github.io/devtools-layout-mode/build/js/all.js%22,e.type=%22text/javascript%22,e.onload=function(){LayoutMode.enable()},document.body.appendChild(e)},document.body.appendChild(t)}();)
