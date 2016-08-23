'use strict'

const AudioContext=require('./audio-context')
const Loader=require('./loader')
const SourceSet=require('./source-set')
const FilterSequence=require('./filter-sequence')
const Destination=require('./destination')
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
			new AudioContext,
			new Loader(options.loader),
			new SourceSet(options.sources),
			new FilterSequence(options.filters),
			new Destination(options.destination),
			new Canvas(options.canvas),
		]
		// possible feature context flags:
		//	loader = Loader has to provide loadSample() function
		//	loaderOnError = loadSample() caller has to pass the error handler
		//	setConnectSampleToJsNames = have a node(s) to connect samples to (some filters like equaliser may not save a refernce to it otherwise)
		//	connectSampleToJsNames = this is a hack: array of strings to connect samples to
		//	connectSampleToCompressor = this is a hack
		//	canvasVolumeGradient = Canvas has to create canvasVolumeGradient
		//	TODO the rest
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
		let prevNodeJsNames=[]
		return InterleaveLines.bae(
			...this.features.map(feature=>{
				const lines=feature.getJsInitLines(this.featureContext,this.i18n,prevNodeJsNames)
				prevNodeJsNames=feature.getNodeJsNames(this.featureContext,prevNodeJsNames)
				return lines
			}),
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
				...this.features.map(feature=>feature.getJsLoopPreLines(this.featureContext,this.i18n)),
				...this.features.map(feature=>feature.getJsLoopVisLines(this.featureContext,this.i18n))
			)
		)
	}
}

module.exports=Code
