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
	static getStyle(colorOption) { // TODO move to canvas context
		const a=JsLines.b()
		const cs=['r','g','b']
		const color=cs.map(c=>colorOption[c]+"%").join()
		if (colorOption.a==100) {
			if (cs.every(c=>colorOption[c]==0)) {
				return "'#000'"
			} else if (cs.every(c=>colorOption[c]==100)) {
				return "'#FFF'"
			} else {
				return `'rgb(${color})'`
			}
		} else {
			return `rgba(${color},${(colorOption.a/100).toFixed(2)})`
		}
	}
	static getStyleLines(canvasContextProperty,colorOption) { // TODO remove
		const style=Canvas.getStyle(colorOption)
		if (style=='#000') {
			return JsLines.be()
		} else {
			return JsLines.bae(
				`canvasContext.${canvasContextProperty}='${style}';`
			)
		}
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
		const a=canvasContext.b()
		if (featureContext.visualizeWaveformFn) {
			a(featureContext.visualizeWaveformFn.getDeclJsLines(canvasContext))
		}
		if (this.options.background.type=='clear') {
			a(a.jsName+".clearRect(0,0,canvas.width,canvas.height);")
		} else {
			a(a.setProp('fillStyle',Canvas.getStyle(this.options.background.color)))
			a(a.jsName+".fillRect(0,0,canvas.width,canvas.height);")
		}
		return a.e()
	}
}

module.exports=Canvas
