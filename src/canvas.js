'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const Feature=require('./feature')

class Canvas extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	static getStyleLines(canvasContextProperty,colorOption) {
		const a=JsLines.b()
		const cs=['r','g','b']
		const color=cs.map(c=>colorOption[c]+"%").join()
		const isBlack=cs.every(c=>colorOption[c]==0)
		if (colorOption.a==100) {
			if (!isBlack) {
				a("canvasContext."+canvasContextProperty+"='rgb("+color+")';")
			}
		} else {
			a("canvasContext."+canvasContextProperty+"='rgba("+color+","+(colorOption.a/100).toFixed(2)+")';")
		}
		return a.e()
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
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const a=JsLines.b()
		if (featureContext.canvas) {
			a(
				"var canvas=document.getElementById('my.canvas');",
				"var canvasContext=canvas.getContext('2d');"
			)
		}
		return a.e()
	}
	getJsLoopPreLines(featureContext,i18n) {
		const a=JsLines.b()
		if (featureContext.canvas) {
			if (this.options.background.type=='clear') {
				a("canvasContext.clearRect(0,0,canvas.width,canvas.height);")
			} else {
				a(Canvas.getStyleLines('fillStyle',this.options.background.color))
				a("canvasContext.fillRect(0,0,canvas.width,canvas.height);")
			}
		}
		return a.e()
	}
}

module.exports=Canvas
