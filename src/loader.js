'use strict'

const WrapLines=require('crnx-base/wrap-lines')
const JsLines=require('crnx-base/js-lines')
const Feature=require('./feature')

class Loader extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	requestFeatureContext(featureContext) {
		if (this.options.errors!='none') {
			featureContext.loaderOnError=true
		}
	}
	getJsInitLines(featureContext,i18n) {
		if (!featureContext.loader) return JsLines.be()
		const a=JsLines.b()
		a(
			"var xhr=new XMLHttpRequest();",
			"xhr.open('GET',url);", // TODO html escape
			"xhr.responseType='arraybuffer';",
			"xhr.onload=function(){"
		)
		if (this.options.errors=='http') {
			a(
				"	if (this.status==200) {",
				"		ctx.decodeAudioData(this.response,onDecode);", // TODO decoding error handling
				"	} else {",
				"		this.onerror();",
				"	}"
			)
		} else {
			a(
				"	ctx.decodeAudioData(this.response,onDecode);"
			)
		}
		a(
			"};"
		)
		if (this.options.errors!='none') {
			a(
				"xhr.onerror=onError;"
			)
		}
		a(
			"xhr.send();"
		)
		return WrapLines.b(
			JsLines.bae("function loadSample(url,onDecode"+(this.options.errors!='none' ? ",onError" : "")+") {"),
			JsLines.bae("}")
		).ae(a.e())
	}
}

module.exports=Loader
