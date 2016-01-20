'use strict';

const Lines=require('../base/lines.js');

module.exports=function(){
	const lines=new Lines(
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>WebAudio example - Generated code</title>",
		"</head>",
		"<body>",
		"<div>",
		"	<audio src='http://mainline.i3s.unice.fr/mooc/drums.mp3' id='myAudio' controls loop crossorigin='anonymous'></audio>",
		"</div>",
		"</body>",
		"</html>"
	);
	return lines.join('\t');
};
