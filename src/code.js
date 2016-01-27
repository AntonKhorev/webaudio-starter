'use strict';

const Lines=require('../base/lines.js');
const Audio=require('./audio.js');
const FilterSequence=require('./filter-sequence.js');
const AudioDestination=require('./audio-destination.js');

module.exports=function(options,i18n){
	const featureContext={};
	const features=[];
	features.push(new Audio(options.source));
	features.push(new FilterSequence(options.filters));
	features.push(new AudioDestination(options.destination));
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
			let prevNodeJsNames;
			lines.interleave(...features.map(feature=>{
				const lines=feature.getJsLines(featureContext,i18n,prevNodeJsNames);
				prevNodeJsNames=feature.getNodeJsNames(featureContext,prevNodeJsNames);
				return lines;
			}));
			return lines.wrapIfNotEmpty("<script>","</script>");
		})(),
		"</body>",
		"</html>"
	);
	return lines.join('\t');
};
