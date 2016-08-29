'use strict'

const JsLines=require('crnx-base/js-lines')
const RefLines=require('crnx-base/ref-lines')
const Feature=require('./feature')

class AudioContext extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	//requestFeatureContext(featureContext) {
	//	featureContext.getJsConnectAssignLines=
	//}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const a=JsLines.b()
		if (featureContext.audioContext) {
			a(RefLines.parse("// "+i18n('comment.context')))
			if (this.options.noVendorPrefix) {
				a("var ctx=new AudioContext;")
			} else {
				a("var ctx=new (AudioContext || webkitAudioContext);")
			}
		}
		return a.e()
	}
}

module.exports=AudioContext
