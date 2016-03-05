'use strict'

const JsLines=require('crnx-base/js-lines')
const RefLines=require('crnx-base/ref-lines')
const Feature=require('./feature')

class AudioContext extends Feature {
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const a=JsLines.b()
		if (featureContext.audioContext) {
			a(
				RefLines.parse("// "+i18n('comment.context')),
				"var ctx=new (AudioContext || webkitAudioContext);"
			)
		}
		return a.e()
	}
}

module.exports=AudioContext
