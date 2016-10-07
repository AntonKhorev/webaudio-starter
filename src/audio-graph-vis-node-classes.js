'use strict'

// classes like GenNodes, but w/o inputs/outputs; to be aggregated by GenNode.analyser

const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const Feature=require('./feature')
const Canvas=require('./canvas')

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
		return [/*'analyserDataLength',*/'waveformWidth','waveformColor']
	}
	getBodyJsLines(canvasContext) {
		const a=canvasContext.b()
		a(
			a.setProp('lineWidth',this.getArgValue('waveformWidth')),
			a.setProp('strokeStyle',this.getArgValue('waveformColor'))
		)
		return a.e()

		/*
		const canvasContextFrame=canvasContext.enter()
		canvasContextFrame.JsLines.b(
			canvasContextFrame.set('lineWidth',this.getArgValue('waveformWidth')),
			canvasContextFrame.set('strokeStyle',this.getArgValue('waveformColor')),
		)

		canvasContext.JsLines.b(
			canvasContext.set('lineWidth',this.getArgValue('waveformWidth')),
			canvasContext.set('strokeStyle',this.getArgValue('waveformColor')),
			// ...
		)
		*/

		/*
		const a=CanvasContextJsLines.b()
		a.prop('lineWidth',this.getArgValue('waveformWidth'))
		a.prop('strokeStyle',this.getArgValue('waveformColor'))
		a(
			// ...
		)
		return a.e()


		return CanvasLines.bae(
			CanvasLines.ctx`canvasContext.lineWidth=${this.getArgValue('waveformWidth')};`,
			CanvasLines.ctx`canvasContext.strokeStyle=${this.getArgValue('waveformColor')}`,
			// ...
		)


		return CanvasContextLines.b().setProperty('lineWidth',
			this.getArgValue('waveformWidth')
		).setProperty('strokeStyle',
			this.getArgValue('waveformColor')
		).a(
			// ...
		).e()

		return CanvasContextLines.b(canvasContext).ae(
			canvasContext.propertyJsLines('lineWidth',this.getArgValue('waveformWidth')),
			canvasContext.propertyJsLines('strokeStyle',this.getArgValue('waveformColor')),
			// ...
		)
		*/

		/*
		const a=JsLines.b()
		if (this.getArgValue('waveformWidth')!=1.0) {
			a("canvasContext.lineWidth="+this.getArgValue('waveformWidth')+";")
		}
		*/
		/*
		a(
			Canvas.getStyleLines('strokeStyle',this.options.waveform.color),
			"analyserNode.getByteTimeDomainData(analyserData);",
			"canvasContext.beginPath();",
			"for (var i=0;i<analyserData.length;i++) {",
			"	var x=i*canvas.width/(analyserData.length-1);",
			"	var y=analyserData[i]*canvas.height/256;",
			"	if (i==0) {",
			"		canvasContext.moveTo(x,y);",
			"	} else {",
			"		canvasContext.lineTo(x,y);",
			"	}",
			"}",
			"canvasContext.stroke();"
		)
		*/
		/*
		return a.e()
		*/
	}
}

const VisNode={}

//// abstract classes (not exported)

class Node extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
}

//// concrete classes

VisNode.waveform = class extends Node {
	requestFeatureContext(featureContext) {
		if (featureContext.visualizeWaveformFn===undefined) {
			featureContext.visualizeWaveformFn=new WaveformVisFunction()
		}
		featureContext.visualizeWaveformFn.addArgValues(
			//this.options.logFftSize,
			this.options.width,
			Canvas.getStyle(this.options.color)
		)
	}
	getVisJsLines(featureContext,i18n) {
		return featureContext.visualizeWaveformFn.getCallJsLines(
			//this.options.logFftSize,
			this.options.width,
			Canvas.getStyle(this.options.color)
		)
	}
}

module.exports=VisNode
