'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const CanvasContext=require('./canvas-context')
const Feature=require('./feature')

class Canvas extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	getHtmlLines(featureContext,i18n) {
		const a=Lines.b()
		if (featureContext.canvas) {
			a(
				"<div>",
				Lines.html`	<canvas id=my.canvas width=${this.options.width} height=${this.options.height}></canvas>`,
				"</div>"
			)
		}
		return a.e()
	}
	getInitJsLines(featureContext,i18n) {
		const a=JsLines.b()
		if (featureContext.canvas) {
			a(
				"var canvas=document.getElementById('my.canvas');",
				"var canvasContext=canvas.getContext('2d');"
			)
		}
		if (featureContext.canvasVolumeGradient) {
			a(
				"var canvasVolumeGradient=canvasContext.createLinearGradient(0,0,0,canvas.height);",
				"canvasVolumeGradient.addColorStop(1.00,'#000');",
				"canvasVolumeGradient.addColorStop(0.75,'#F00');",
				"canvasVolumeGradient.addColorStop(0.25,'#FF0');",
				"canvasVolumeGradient.addColorStop(0.00,'#FFF');"
			)
		}
		if (featureContext.maxLogFftSizeNodeJsName!==undefined) {
			a(
				"var analyserData=new Uint8Array("+featureContext.maxLogFftSizeNodeJsName+".frequencyBinCount);"
			)
		}
		return a.e()
	}
	getPreVisJsLines(featureContext,i18n) {
		if (!featureContext.canvas) return JsLines.be()
		const canvasContext=new CanvasContext('canvasContext')
		const getClearLines=()=>{
			const a=canvasContext.b()
			if (this.options.background.type=='clear') {
				a(a.jsName+".clearRect(0,0,canvas.width,canvas.height);")
			} else {
				a(a.setProp('fillStyle',a.getColorStyle(this.options.background.color)))
				a(a.jsName+".fillRect(0,0,canvas.width,canvas.height);")
			}
			return a.e()
		}
		const a=JsLines.b()
		if (featureContext.visualizeWaveformFn) {
			a(featureContext.visualizeWaveformFn.getDeclJsLines(canvasContext))
		}
		if (featureContext.visualizeFrequencyBarsFn) {
			a(featureContext.visualizeFrequencyBarsFn.getDeclJsLines(canvasContext))
		}
		if (featureContext.visualizeFrequencyOutlineFn) {
			a(featureContext.visualizeFrequencyOutlineFn.getDeclJsLines(canvasContext))
		}
		if (featureContext.visualizeVolumeFn) {
			a(featureContext.visualizeVolumeFn.getDeclJsLines(canvasContext))
		}
		a(getClearLines())
		return a.e()
	}
}

module.exports=Canvas
