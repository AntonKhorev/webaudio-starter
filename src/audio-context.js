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
		featureContext.getJsConnectAssignLines=(decl,target,value,connectors,connector)=>{
			let declTarget=target
			if (decl!='') {
				declTarget=decl+" "+target
			}
			const a=JsLines.b()
			if (this.options.connectReturnValue && !connector && connectors.length==1) {
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
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
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
