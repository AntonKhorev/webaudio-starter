'use strict';

const Lines=require('../base/lines.js');

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return new Lines;
	}
	getJsLines(featureContext,i18n) {
		return new Lines;
	}
}

module.exports=Feature;
