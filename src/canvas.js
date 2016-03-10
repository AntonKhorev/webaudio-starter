'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
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
			if (this.options.background=='clear') {
				a("canvasContext.clearRect(0,0,canvas.width,canvas.height);")
			} else {
				const color=['r','g','b'].map(c=>this.options.fill[c]+"%").join()
				if (this.options.fill.a==100) {
					a("canvasContext.fillStyle='rgb("+color+")';")
				} else {
					a("canvasContext.fillStyle='rgba("+color+","+(this.options.fill.a/100).toFixed(2)+")';")
				}
				a("canvasContext.fillRect(0,0,canvas.width,canvas.height);")
			}
		}
		return a.e()
	}
}

module.exports=Canvas
