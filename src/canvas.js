'use strict';

const Lines=require('./html-lines.js');
const Feature=require('./feature.js');

class Canvas extends Feature {
	getHtmlLines(featureContext,i18n) {
		const lines=super.getHtmlLines(...arguments);
		if (featureContext.canvas) {
			lines.a(
				"<div>",
				"	<canvas id='my.canvas' width='300' height='100'></canvas>",
				"</div>"
			);
		}
		return lines;
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const lines=super.getJsInitLines(...arguments);
		if (featureContext.canvas) {
			lines.a(
				"var canvas=document.getElementById('my.canvas');",
				"var canvasContext=canvas.getContext('2d');"
			);
		}
		return lines;
	}
}

module.exports=Canvas;
