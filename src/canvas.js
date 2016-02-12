'use strict';

const Lines=require('./html-lines.js');
const Feature=require('./feature.js');

class Canvas extends Feature {
	getHtmlLines(featureContext,i18n) {
		const lines=super.getJsLines(...arguments);
		if (featureContext.canvas) {
			lines.a(
				"<div>",
				"	<canvas id='my.canvas' width='300' height='100'></canvas>",
				"</div>"
			);
		}
		return lines;
	}
}

module.exports=Canvas;
