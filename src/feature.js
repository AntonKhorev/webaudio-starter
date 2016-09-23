'use strict'

const Lines=require('crnx-base/lines')

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.be()
	}
	getInitJsLines(featureContext,i18n) {
		return Lines.be()
	}
	getPreVisJsLines(featureContext,i18n) {
		return Lines.be()
	}
	getVisJsLines(featureContext,i18n) {
		return Lines.be()
	}
}

module.exports=Feature
