'use strict';

const Lines=require('./html-lines.js');
const UnescapedLines=require('crnx-base/lines');
const Feature=require('./feature.js');

class AudioContext extends Feature {
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const lines=super.getJsInitLines(...arguments);
		if (featureContext.audioContext) {
			lines.a(
				new UnescapedLines("// "+i18n('comment.context')),
				"var ctx=new (AudioContext || webkitAudioContext);"
			);
		}
		return lines;
	}
}

module.exports=AudioContext;
