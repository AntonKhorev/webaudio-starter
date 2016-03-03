'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const Feature=require('./feature.js')

class Canvas extends Feature {
	getHtmlLines(featureContext,i18n) {
		const a=Lines.b()
		if (featureContext.canvas) {
			a(
				"<div>",
				"	<canvas id=my.canvas width=300 height=100></canvas>",
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
}

module.exports=Canvas
