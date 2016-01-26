'use strict';

const Lines=require('../base/lines.js');
const Feature=require('./feature.js');

class Audio extends Feature {
	constructor(source) {
		super();
		this.source=source;
	}
	getHtmlLines(featureContext,i18n) {
		return (new Lines(
			"<audio src='"+this.source+"' id='my.source' controls loop"+(featureContext.audioContext?" crossorigin='anonymous'":"")+"></audio>" // TODO html escape
		)).wrap("<div>","</div>");
	}
	getJsLines(featureContext,i18n) {
		const lines=super.getJsLines(featureContext,i18n);
		if (featureContext.audioContext) {
			lines.a(
				"// "+i18n('options.audio.comment'),
				"var ctx=new (AudioContext || webkitAudioContext);",
				"var sourceElement=document.getElementById('my.source');",
				"var sourceNode=ctx.createMediaElementSource(sourceElement);"
			);
		}
		return lines;
	}
}

module.exports=Audio;
