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
	static getJsConnectAssignLines(decl,target,value,connectors,connector) {
		let declTarget=target
		if (decl!='') {
			declTarget=decl+" "+target
		}
		const a=JsLines.b()
		if (!connector && connectors.length==1) {
			connector=connectors[0]
			a(declTarget+"="+connector+".connect("+value+");")
		} else {
			a(declTarget+"="+value+";")
			if (!connector) {
				a(...connectors.map(connector=>connector+".connect("+target+");"))
			} else {
				a(
					connectors+".forEach(function("+connector+"){",
					"	"+connector+".connect("+target+");",
					"});"
				)
			}
		}
		return a.e()
	}
}

module.exports=Feature
