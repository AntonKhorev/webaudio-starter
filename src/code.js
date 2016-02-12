'use strict';

const Lines=require('./html-lines.js');
const AudioContext=require('./audio-context.js');
const SourceSet=require('./source-set.js');
const FilterSequence=require('./filter-sequence.js');
const Destination=require('./destination.js');
const Canvas=require('./canvas.js');

module.exports=function(options,i18n){
	const featureContext={};
	const features=[
		new AudioContext,
		new SourceSet(options.sources),
		new FilterSequence(options.filters),
		new Destination(options.destination),
		new Canvas,
	];
	features.forEach(feature=>{
		feature.requestFeatureContext(featureContext);
	});
	const lines=new Lines(
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>WebAudio example - Generated code</title>",
		(()=>{
			const lines=new Lines;
			if (featureContext.alignedInputs) {
				lines.a(
					".aligned label {",
					"	display: inline-block;",
					"	width: 10em;",
					"	text-align: right;",
					"}"
				);
			}
			if (featureContext.canvas) {
				lines.a(
					"canvas {",
					"	border: 1px solid;",
					"}"
				);
			}
			return lines.wrapIfNotEmpty(
				"<style>",
				"</style>"
			);
		})(),
		"</head>",
		"<body>",
		(()=>{
			const lines=new Lines;
			lines.a(...features.map(feature=>feature.getHtmlLines(featureContext,i18n)));
			return lines;
		})(),
		(()=>{
			let prevNodeJsNames;
			const jsTopLineSets=features.map(feature=>{
				const lines=feature.getJsInitLines(featureContext,i18n,prevNodeJsNames);
				prevNodeJsNames=feature.getNodeJsNames(featureContext,prevNodeJsNames);
				return lines;
			});
			jsTopLineSets.push((()=>{
				//const lines=new Lines;
				//lines.interleave(...features.map(feature=>feature.getJsLoopLines(featureContext,i18n)));
				const lines=new Lines(...features.map(feature=>feature.getJsLoopLines(featureContext,i18n)));
				//
				if (lines.isEmpty()) {
					return lines;
				} else {
					return new Lines(
						"function visualize() {",
						lines.indent(),
						//"	",
						"	requestAnimationFrame(visualize);",
						"}",
						"requestAnimationFrame(visualize);"
					);
				}
			})());
			const lines=new Lines;
			lines.interleave(...jsTopLineSets);
			return lines.wrapIfNotEmpty("<script>","</script>");
		})(),
		"</body>",
		"</html>"
	);
	return lines.join('\t');
};
