'use strict'

const AudioContext=require('./audio-context')
const Loader=require('./loader')
const AudioGraph=require('./audio-graph')
const Canvas=require('./canvas')

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const BaseWebCode=require('crnx-base/web-code')

class Code extends BaseWebCode {
	constructor(options,i18n) {
		super()
		this.i18n=i18n
		this.featureContext={}
		this.features=[
			new AudioContext(options.api),
			new Loader(options.loader),
			new AudioGraph(options.graph),
			new Canvas(options.canvas),
		]
		// possible feature context flags:
		//	audioContext =
		//		AudioContext has to assign the audio context to var ctx
		//		AudioGraph has to output the js
		//		media elements of AudioGraph have to have crossorigin enabled
		//	canvas = Canvas has to output <canvas> element and create var canvas and var canvasContext
		//	canvasVolumeGradient = Canvas has to create var canvasVolumeGradient
		//	loader = Loader has to provide loadSample() function
		//	loaderOnError = loadSample() caller has to pass the error handler
		//	maxLogFftSize = max log(fft size) of all analysers
		//	maxLogFftSizeNodeJsName = name of analyser node with max log(fft size); if set, Canvas has to allocate analyserData array
		// visualization functions, either undefined or set to VisFunction object
		//	visualizeWaveformFn
		//	visualizeFrequencyBarsFn
		// helpers:
		//	getConnectAssignJsLines = set by AudioContext
		for (const feature of this.features) {
			feature.requestFeatureContext(this.featureContext)
		}
		this.isInteresting=!!this.featureContext.audioContext
	}
	get basename() {
		return 'webaudio'
	}
	get lang() {
		return this.i18n.lang
	}
	get title() {
		return this.i18n('code.title')
	}
	get styleLines() {
		const a=Lines.b()
		if (this.featureContext.alignedInputs) {
			a(
				"label {",
				"	display: inline-block;",
				"	width: 15em;",
				"	text-align: right;",
				"	line-height: 0.8em;",
				"}",
				".min {",
				"	display: inline-block;",
				"	width: 5em;",
				"	text-align: right;",
				"}",
				".max {",
				"	display: inline-block;",
				"	width: 5em;",
				"	text-align: left;",
				"}"
			)
		}
		if (this.featureContext.canvas) {
			a(
				"canvas {",
				"	border: 1px solid;",
				"}"
			)
		}
		return a.e()
	}
	get bodyLines() {
		return Lines.bae(
			...this.features.map(feature=>feature.getHtmlLines(this.featureContext,this.i18n))
		)
	}
	get scriptLines() {
		return InterleaveLines.bae(
			...this.features.map(feature=>feature.getInitJsLines(this.featureContext,this.i18n)),
			NoseWrapLines.b(
				JsLines.bae(
					"function visualize() {"
				),
				JsLines.bae(
					"	requestAnimationFrame(visualize);",
					"}",
					"requestAnimationFrame(visualize);"
				)
			).ae(
				...this.features.map(feature=>feature.getPreVisJsLines(this.featureContext,this.i18n)),
				...this.features.map(feature=>feature.getVisJsLines(this.featureContext,this.i18n))
			)
		)
	}
}

module.exports=Code
