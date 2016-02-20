'use strict';

const Lines=require('crnx-base/lines');
const RefLines=require('crnx-base/ref-lines');
const Feature=require('./feature.js');

class AudioContext extends Feature {
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const a=Lines.b();
		if (featureContext.audioContext) {
			a(
				RefLines.parse("// "+i18n('comment.context')),
				"var ctx=new (AudioContext || webkitAudioContext);"
			);
		}
		return a.e();
	}
}

module.exports=AudioContext;
