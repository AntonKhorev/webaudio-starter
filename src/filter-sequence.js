// TODO remove this module

'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const formatNumbers=require('crnx-base/format-numbers')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const RefLines=require('crnx-base/ref-lines')
const Option=require('./option-classes')
const CollectionFeature=require('./collection-feature')

class Filter {
	constructor(options,n) {
		this.options=options
		this.n=n
	}
	requestFeatureContext(featureContext) {
		const hasRangeInputs=this.nodeProperties.some(property=>{
			if (property.type=='range') {
				const option=this.options[property.name]
				return option.input
			} else {
				return false
			}
		})
		if (hasRangeInputs) {
			featureContext.alignedInputs=true
		}
	}
	get skipNode() {
		return false
	}
}

const filterClasses={
	iir: class extends SinglePathFilter {
		get type()                { return 'iir' }
		get ctxCreateMethodName() { return 'createIIRFilter' }
		get nodeProperties() {
			return []
		}
		getJsInitLines(featureContext,i18n,prevNodeJsNames) {
			return JsLines.bae(
				RefLines.parse("// "+i18n('comment.filters.'+this.type)),
				featureContext.getJsConnectAssignLines(
					"var",this.nodeJsName,
					"ctx."+this.ctxCreateMethodName+"(["+this.options.feedforward.entries+"],["+this.options.feedback.entries+"])",
					prevNodeJsNames
				)
			)
		}
	},
	equalizer: class extends Filter {
		get type()                { return 'equalizer' }
		get ctxCreateMethodName() { return 'createBiquadFilter' }
		get frequencies()         { return Option.EqualizerFilter.frequencies }
		get nodeProperties() {
			return this.frequencies.map(freq=>({
				name:'gain'+freq,
				type:'range',
			}))
		}
		getFrequencyOption(i) {
			return this.options[this.nodeProperties[i].name]
		}
		get affectedFreqsAndOptions() {
			return this.frequencies.map((freq,i)=>{
				const option=this.getFrequencyOption(i)
				return {freq,option}
			}).filter(fo=>(fo.option.input!=false || fo.option.value!=0))
		}
		requestFeatureContext(featureContext) {
			if (!this.allGainsConstant) { // TODO this check is likely not needed, this.allGainsConstant is not set
				featureContext.alignedInputs=true
			}
		}
		get skipNode() {
			return this.affectedFreqsAndOptions.length==0
		}
		get connectToNodeJsName() {
			if (this.affectedFreqsAndOptions.length==1) {
				return this.nodeJsName
			} else {
				return camelCase('connect.to.'+this.type+this.nSuffix+'.node')
			}
		}
		get connectToNodeJsNames() {
			return [this.connectToNodeJsName]
		}
		getJsInitLines(featureContext,i18n,prevNodeJsNames) {
			const singleFreq=this.affectedFreqsAndOptions.length==1
			const allGainsConstant=this.affectedFreqsAndOptions.every(fo=>fo.option.input==false)
			const noGainsConstant=this.affectedFreqsAndOptions.every(fo=>fo.option.input==true)
			const getJsData=()=>{
				return this.affectedFreqsAndOptions.map(fo=>{
					if (noGainsConstant) {
						return fo.freq
					} else {
						return "["+fo.freq+","+(fo.option.input ? 'null' : fo.option.value)+"]"
					}
				}).join()
			}
			const getJsDataItem=()=>{
				if (noGainsConstant) {
					return "freq"
				} else {
					return "freqData"
				}
			}
			const getJsLoopLines=()=>{
				const freq=(singleFreq ? this.affectedFreqsAndOptions[0].freq : 'freq')
				const gain=(singleFreq ? this.affectedFreqsAndOptions[0].option.value : 'gain')
				const nodeJsName=((allGainsConstant || singleFreq) ? this.nodeJsName : 'node')
				const inputJsName=(singleFreq
					? this.getPropertyInputJsName('gain'+freq)
					: 'input'
				)
				const inputHtmlNameExpr=(singleFreq
					? "'"+this.getPropertyInputHtmlName('gain'+freq)+"'"
					: "'"+this.getPropertyInputHtmlName('gain')+"'+freq"
				)
				const a=JsLines.b()
				if (!(noGainsConstant || singleFreq)) {
					a("var freq=freqData[0], gain=freqData[1];")
				}
				let connectors
				if (singleFreq) {
					connectors=prevNodeJsNames
				} else {
					if (prevNodeJsNames.length==1) {
						connectors=["prevNode"]
					} else {
						connectors="prevNodes"
					}
				}
				a(featureContext.getJsConnectAssignLines(
					((allGainsConstant && !singleFreq) ? "" : "var"),nodeJsName,
					"ctx."+this.ctxCreateMethodName+"()",
					connectors
				))
				if (featureContext.setConnectSampleToJsNames && !singleFreq) {
					a(
						"if ("+this.connectToNodeJsName+"===undefined) {",
						"	"+this.connectToNodeJsName+"="+nodeJsName+";",
						"}"
					)
				}
				a(
					nodeJsName+".type='peaking';",
					nodeJsName+".frequency.value="+freq+";"
				)
				const constLines=JsLines.bae(
					nodeJsName+".gain.value="+gain+";"
				)
				const varLines=JsLines.bae(
					"var "+inputJsName+"=document.getElementById("+inputHtmlNameExpr+");",
					";("+inputJsName+".oninput=function(){",
					"	"+nodeJsName+".gain.value="+inputJsName+".value;",
					"})();"
				)
				if (!noGainsConstant && allGainsConstant) {
					a(constLines)
				} else if (noGainsConstant && !allGainsConstant) {
					a(varLines)
				} else if (!noGainsConstant && !allGainsConstant) {
					a(WrapLines.b("if (gain!==null) {","} else {","}").ae(constLines,varLines))
				}
				if (!singleFreq) {
					const outerNodeJsName=(allGainsConstant ? nodeJsName : this.nodeJsName+"="+nodeJsName)
					if (prevNodeJsNames.length==1) {
						a("prevNode="+outerNodeJsName+";")
					} else {
						a("prevNodes=["+outerNodeJsName+"];")
					}
				}
				return a.e()
			}
			if (singleFreq) {
				return JsLines.bae(
					RefLines.parse("// "+i18n('comment.filters.'+this.type+'.single')),
					getJsLoopLines()
				)
			} else {
				const a=JsLines.b()
				a(
					RefLines.parse("// "+i18n('comment.filters.'+this.type))
				)
				if (prevNodeJsNames.length==1) {
					a("var prevNode="+prevNodeJsNames[0]+";")
				} else {
					a("var prevNodes=["+prevNodeJsNames.join()+"];")
				}
				if (featureContext.setConnectSampleToJsNames) {
					a("var "+this.connectToNodeJsName+";")
				}
				a(
					"var "+this.nodeJsName+";",
					WrapLines.b(
						JsLines.bae(";["+getJsData()+"].forEach(function("+getJsDataItem()+"){"),JsLines.bae("});")
					).ae(
						getJsLoopLines()
					)
				)
				return a.e()
			}
		}
	},
}

class FilterSequence extends CollectionFeature {
	constructor(entryOptions) {
		super({entries:entryOptions.nodes})
	}
	getEntryClass(entryOption) {
		return filterClasses[entryOption.filter]
	}
	requestFeatureContext(featureContext) {
		if (!featureContext.audioProcessing) return
		for (const entry of this.entries) {
			if (!entry.skipNode) {
				featureContext.audioContext=true
				entry.requestFeatureContext(featureContext)
				if (featureContext.connectSampleToJsNames===undefined) {
					featureContext.connectSampleToJsNames=entry.connectToNodeJsNames
				}
			}
		}
	}
	getHtmlLines(featureContext,i18n) {
		if (!featureContext.audioProcessing) return Lines.be()
		return Lines.bae(...this.entries.filter(entry=>!entry.skipNode).map(entry=>entry.getHtmlLines(featureContext,i18n)))
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		if (!featureContext.audioProcessing) return Lines.be()
		return InterleaveLines.bae(...this.entries.filter(entry=>!entry.skipNode).map(entry=>{
			const lines=entry.getJsInitLines(featureContext,i18n,prevNodeJsNames)
			prevNodeJsNames=entry.nodeJsNames
			return lines
		}))
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (!featureContext.audioProcessing) return prevNodeJsNames
		for (const entry of this.entries) {
			if (!entry.skipNode) {
				prevNodeJsNames=entry.nodeJsNames
			}
		}
		return prevNodeJsNames
	}
}

module.exports=FilterSequence
