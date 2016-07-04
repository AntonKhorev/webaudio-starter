'use strict'

const WrapLines=require('crnx-base/wrap-lines')
const JsLines=require('crnx-base/js-lines')
const Feature=require('./feature')

class Loader extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		if (!featureContext.loader) return JsLines.be()
		return WrapLines.b(
			JsLines.bae("function loadSample(url,onDecode,onError) {"),
			JsLines.bae("}")
		).ae(
			"var xhr=new XMLHttpRequest();",
			"xhr.open('GET',url);", // TODO html escape
			"xhr.responseType='arraybuffer';",
			"xhr.onload=function(){",
			"	if (this.status==200) {", // TODO we are checking status here, but what if <audio>'s status is an error?
			"		ctx.decodeAudioData(this.response,onDecode);",
			"	} else {",
			"		this.onerror();",
			"	}",
			"};",
			"xhr.onerror=onError;",
			"xhr.send();"
		)
	}
}

module.exports=Loader
