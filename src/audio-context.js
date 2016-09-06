'use strict'

const JsLines=require('crnx-base/js-lines')
const RefLines=require('crnx-base/ref-lines')
const Feature=require('./feature')

class AudioContext extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	requestFeatureContext(featureContext) {
		featureContext.getJsConnectAssignLines=(decl,target,value,connectors,connectArgs)=>{
			let declTarget=target
			if (decl!='') {
				declTarget=decl+" "+target
			}
			let connectArgsConcat=""
			if (connectArgs!==undefined) {
				connectArgsConcat=","+connectArgs
			}
			const a=JsLines.b()
			if (this.options.connectReturnValue && Array.isArray(connectors) && connectors.length==1) {
				const connector=connectors[0]
				a(declTarget+"="+connector+".connect("+value+connectArgsConcat+");")
			} else {
				a(declTarget+"="+value+";")
				if (Array.isArray(connectors)) {
					a(...connectors.map(connector=>connector+".connect("+target+connectArgsConcat+");"))
				} else {
					const connector=connectors.slice(0,-1) // hack to get singular name form plural
					a(
						connectors+".forEach(function("+connector+"){",
						"	"+connector+".connect("+target+connectArgsConcat+");",
						"});"
					)
				}
			}
			return a.e()
		}
	}
	getJsInitLines(featureContext,i18n) {
		const a=JsLines.b()
		if (featureContext.audioContext) {
			a(RefLines.parse("// "+i18n('comment.context')))
			if (this.options.noVendorPrefix) {
				a("var ctx=new AudioContext;")
			} else {
				a("var ctx=new (AudioContext || webkitAudioContext);")
			}
		}
		return a.e()
	}
}

module.exports=AudioContext
