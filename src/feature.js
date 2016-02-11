'use strict';

const Lines=require('crnx-base/lines');

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return new Lines;
	}
	getJsLines(featureContext,i18n,prevNodeJsNames) {
		return new Lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		return prevNodeJsNames;
	}
}

module.exports=Feature;
