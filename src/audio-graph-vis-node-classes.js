'use strict'

// classes like GenNodes, but w/o inputs/outputs; to be aggregated by GenNode.analyser

const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const Feature=require('./feature')
const CanvasContext=require('./canvas-context')

class VisFunction {
	constructor() {
		this.data={}
	}
	addArgValues(...values) {
		for (let i=0;i<values.length;i++) {
			const arg=this.args[i]
			const value=values[i]
			if (this.data[arg]===undefined) {
				this.data[arg]=value
			} else if (!Array.isArray(this.data[arg]) && this.data[arg]!=value) {
				this.data[arg]=[]
			}
		}
	}
	getArgValue(arg) {
		if (Array.isArray(this.data[arg])) {
			return arg
		} else {
			return this.data[arg]
		}
	}
	getDeclJsLines(canvasContext) {
		const declArgs=[]
		for (let i=0;i<this.args.length;i++) {
			if (Array.isArray(this.data[this.args[i]])) {
				declArgs.push(this.args[i])
			}
		}
		return WrapLines.b(
			JsLines.bae("function "+this.name+"("+declArgs.join()+") {"),
			JsLines.bae("}")
		).ae(
			this.getBodyJsLines(canvasContext)
		)
	}
	getCallJsLines(...values) {
		const passValues=[]
		for (let i=0;i<values.length;i++) {
			if (Array.isArray(this.data[this.args[i]])) {
				passValues.push(values[i])
			}
		}
		return JsLines.bae(
			this.name+"("+passValues.join()+");"
		)
	}
	// get name()
	// get args()
	// getBodyJsLines(canvasContext)
}

class WaveformVisFunction extends VisFunction {
	get name() {
		return 'visualizeWaveform'
	}
	get args() {
		return ['analyserNode','waveformWidth','waveformColor']
	}
	getBodyJsLines(canvasContext) {
		const analyserNode=this.getArgValue('analyserNode')
		const a=canvasContext.b()
		a(
			a.setProp('lineWidth',this.getArgValue('waveformWidth')),
			a.setProp('strokeStyle',this.getArgValue('waveformColor')),
			`${analyserNode}.getByteTimeDomainData(analyserData);`,
			`${a.jsName}.beginPath();`,
			`for (var i=0;i<${analyserNode}.frequencyBinCount;i++) {`,
			`	var x=i*canvas.width/(${analyserNode}.frequencyBinCount-1);`,
			`	var y=analyserData[i]*canvas.height/256;`,
			`	if (i==0) {`,
			`		${a.jsName}.moveTo(x,y);`,
			`	} else {`,
			`		${a.jsName}.lineTo(x,y);`,
			`	}`,
			`}`,
			`${a.jsName}.stroke();`
		)
		return a.e()
	}
}

const VisNode={}

//// abstract classes (not exported)

class Node extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	initParent(analyserNodeJsName) {
		this.analyserNodeJsName=analyserNodeJsName
	}
}

//// concrete classes

VisNode.waveform = class extends Node {
	requestFeatureContext(featureContext) {
		if (featureContext.visualizeWaveformFn===undefined) {
			featureContext.visualizeWaveformFn=new WaveformVisFunction()
		}
		featureContext.visualizeWaveformFn.addArgValues(
			this.analyserNodeJsName,
			this.options.width.value,
			CanvasContext.getColorStyle(this.options.color)
		)
	}
	getVisJsLines(featureContext,i18n) {
		return featureContext.visualizeWaveformFn.getCallJsLines(
			this.analyserNodeJsName,
			this.options.width.value,
			CanvasContext.getColorStyle(this.options.color)
		)
	}
}

module.exports=VisNode
