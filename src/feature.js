'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.be()
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		return Lines.be()
	}
	getJsLoopPreLines(featureContext,i18n) {
		return Lines.be()
	}
	getJsLoopVisLines(featureContext,i18n) {
		return Lines.be()
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		return prevNodeJsNames
	}
	static getJsConnectDeclarationLines(nodeJsName,nodeJsValue,prevNodeJsNames) {
		const a=JsLines.b()
		if (prevNodeJsNames.length==1) {
			const prevNodeJsName=prevNodeJsNames[0]
			a("var "+nodeJsName+"="+prevNodeJsName+".connect("+nodeJsValue+");")
		} else {
			a("var "+nodeJsName+"="+nodeJsValue+";")
			a(...prevNodeJsNames.map(
				prevNodeJsName=>prevNodeJsName+".connect("+nodeJsName+");"
			))
		}
		return a.e()
	}
}

module.exports=Feature
