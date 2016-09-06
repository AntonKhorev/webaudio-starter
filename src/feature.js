'use strict'

const Lines=require('crnx-base/lines')

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.be()
	}
	getJsInitLines(featureContext,i18n) {
		return Lines.be()
	}
	getJsLoopPreLines(featureContext,i18n) {
		return Lines.be()
	}
	getJsLoopVisLines(featureContext,i18n) {
		return Lines.be()
	}
}

module.exports=Feature
