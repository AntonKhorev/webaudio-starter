'use strict';

const Lines=require('../base/lines.js');

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return new Lines;
	}
	getJsLines(featureContext,i18n) {
		return new Lines;
	}
}

class Audio extends Feature {
	getHtmlLines(featureContext,i18n) {
		return (new Lines(
			"<audio src='http://mainline.i3s.unice.fr/mooc/drums.mp3' id='my.source' controls loop crossorigin='anonymous'></audio>"
		)).wrap("<div>","</div>");
	}
	getJsLines(featureContext,i18n) {
		const lines=super.getJsLines(featureContext,i18n);
		if (featureContext.audioContext) {
			lines.a(
				"var ctx=new (AudioContext || webkitAudioContext);",
				"var sourceElement=document.getElementById('my.source');",
				"var sourceNode=ctx.createMediaElementSource(sourceElement);"
			);
		}
		return lines;
	}
}

class Gain extends Feature {
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true;
	}
	getHtmlLines(featureContext,i18n) {
		return (new Lines(
			"<label for='my.gain'>"+i18n('options.gain')+"</label>",
			"<input id='my.gain' type='range' min='0' max='1' step='0.01' value='1' />"
		)).wrap("<div>","</div>");
	}
	getJsLines(featureContext,i18n) {
		const lines=super.getJsLines(featureContext,i18n);
		lines.a(
			"var gainNode=ctx.createGain();",
			"sourceNode.connect(gainNode)",
			"gainNode.connect(ctx.destination);",
			"var gainElement=document.getElementById('my.gain');",
			"gainElement.oninput=gainElement.onchange=function(){",
			"	gainNode.gain.value=this.value;",
			"};"
		);
		return lines;
	}
}

module.exports=function(options,i18n){
	const featureContext={};
	const features=[];
	features.push(new Audio);
	if (options.gain) {
		features.push(new Gain);
	}
	features.forEach(feature=>{
		feature.requestFeatureContext(featureContext);
	});
	const lines=new Lines(
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>WebAudio example - Generated code</title>",
		"</head>",
		"<body>",
		(()=>{
			const lines=new Lines;
			lines.a(...features.map(feature=>feature.getHtmlLines(featureContext,i18n)));
			return lines;
		})(),
		(()=>{
			const lines=new Lines;
			lines.a(...features.map(feature=>feature.getJsLines(featureContext,i18n)));
			return lines.wrapIfNotEmpty("<script>","</script>");
		})(),
		"</body>",
		"</html>"
	);
	return lines.join('\t');
};
