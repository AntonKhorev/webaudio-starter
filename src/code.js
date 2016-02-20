'use strict';

//const AudioContext=require('./audio-context.js');
const SourceSet=require('./source-set.js');
const FilterSequence=require('./filter-sequence.js');
//const Destination=require('./destination.js');
//const Canvas=require('./canvas.js');

const Lines=require('crnx-base/lines');
const InterleaveLines=require('crnx-base/interleave-lines');
const NoseWrapLines=require('crnx-base/nose-wrap-lines');
const BaseWebCode=require('crnx-base/web-code');

class Code extends BaseWebCode {
	constructor(options,i18n) {
		super();
		this.i18n=i18n;
		this.featureContext={};
		this.features=[
			//new AudioContext,
			new SourceSet(options.sources),
			new FilterSequence(options.filters),
			//new Destination(options.destination),
			//new Canvas,
		];
		this.features.forEach(feature=>{
			feature.requestFeatureContext(this.featureContext);
		});
	}
	get basename() {
		return 'webaudio';
	}
	get lang() {
		return 'en';
	}
	get title() {
		return "WebAudio example - Generated code";
	}
	get styleLines() {
		const a=Lines.b();
		if (this.featureContext.alignedInputs) {
			a(
				".aligned label {",
				"	display: inline-block;",
				"	width: 10em;",
				"	text-align: right;",
				"}"
			);
		}
		if (this.featureContext.canvas) {
			a(
				"canvas {",
				"	border: 1px solid;",
				"}"
			);
		}
		return a.e();
	}
	get bodyLines() {
		return Lines.bae(
			...this.features.map(feature=>feature.getHtmlLines(this.featureContext,this.i18n))
		);
	}
	get scriptLines() {
		let prevNodeJsNames;
		return InterleaveLines.bae(
			...this.features.map(feature=>{
				const lines=feature.getJsInitLines(this.featureContext,this.i18n,prevNodeJsNames);
				prevNodeJsNames=feature.getNodeJsNames(this.featureContext,prevNodeJsNames);
				return lines;
			}),
			NoseWrapLines.b(
				Lines.bae(
					"function visualize() {"
				),
				Lines.bae(
					"	requestAnimationFrame(visualize);",
					"}",
					"requestAnimationFrame(visualize);"
				)
			).ae(
				...this.features.map(feature=>feature.getJsLoopLines(this.featureContext,this.i18n))
			)
		);
	}
}

module.exports=Code;
