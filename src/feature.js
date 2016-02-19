'use strict';

const Lines=require('crnx-base/lines');

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.be();
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		return Lines.be();
	}
	getJsLoopLines(featureContext,i18n) {
		return Lines.be();
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		return prevNodeJsNames;
	}
}

module.exports=Feature;
