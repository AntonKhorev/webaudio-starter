'use strict';

const Lines=require('../base/lines.js');

class Feature {
	getHtmlLines(i18n) {
		return new Lines;
	}
	getJsLines(i18n) {
		return new Lines;
	}
}

class Gain extends Feature {
	getHtmlLines(i18n) {
		return (new Lines(
			"<label for='my.gain'>"+i18n('options.gain')+"</label>",
			"<input id='my.gain' type='range' min='0' max='1' step='0.01' value='1' />"
		)).wrap("<div>","</div>");
	}
}

module.exports=function(options,i18n){
	const features=[];
	if (options.gain) {
		features.push(new Gain);
	}
	const lines=new Lines(
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>WebAudio example - Generated code</title>",
		"</head>",
		"<body>",
		"<div>",
		"	<audio src='http://mainline.i3s.unice.fr/mooc/drums.mp3' id='my.audio' controls loop crossorigin='anonymous'></audio>",
		"</div>",
		(()=>{
			const lines=new Lines;
			lines.a(...features.map(feature=>feature.getHtmlLines(i18n)));
			return lines;
		})(),
		(()=>{
			const lines=new Lines;
			lines.a(...features.map(feature=>feature.getJsLines(i18n)));
			return lines.wrapIfNotEmpty("<script>","</script>");
		})(),
		"</body>",
		"</html>"
	);
	return lines.join('\t');
};
