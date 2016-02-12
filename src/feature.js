'use strict';

const Lines=require('./html-lines.js');

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return new Lines;
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		return new Lines;
	}
	getJsLoopLines(featureContext,i18n) {
		return new Lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		return prevNodeJsNames;
	}
}

module.exports=Feature;
