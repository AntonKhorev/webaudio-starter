'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const formatNumbers=require('crnx-base/format-numbers')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const RefLines=require('crnx-base/ref-lines')
const CollectionFeature=require('./collection-feature')

class Filter {
	constructor(options,n) {
		this.options=options
		this.n=n
	}
	get nSuffix() {
		if (this.n!==undefined) {
			return '.'+this.n
		} else {
			return ''
		}
	}
	getPropertyOptionName(property) {
		return 'options.filters.'+this.type+'.'+property.name
	}
	get nodeJsName() {
		return camelCase(this.type+this.nSuffix+'.node')
	}
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.type+this.nSuffix+'.'+propertyName
	}
	getPropertyInputJsName(propertyName) {
		return camelCase(this.type+this.nSuffix+'.'+propertyName+'.input')
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
	getHtmlPropertyLines(i18n,property) {
		const option=this.options[property.name]
		const inputHtmlName=this.getPropertyInputHtmlName(property.name)
		const a=Lines.b()
		if (property.type=='range' && option.input) {
			const p=option.precision
			const fmtAttrs=formatNumbers.html({ min:option.min, max:option.max, value:option.value },p)
			const fmtLabels=formatNumbers({ min:option.min, max:option.max },p)
			const minMax=n=>i18n.numberWithUnits(n,option.unit,(a,e)=>Lines.html`<abbr title=${e}>`+a+`</abbr>`)
			a(
				Lines.html`<label for=${inputHtmlName}>${i18n(this.getPropertyOptionName(property))}:</label>`,
				"<span class=min>"+minMax(fmtLabels.min)+"</span>",
				Lines.html`<input id=${inputHtmlName} type=range value=${fmtAttrs.value} min=${fmtAttrs.min} max=${fmtAttrs.max} step=${p?Math.pow(0.1,p).toFixed(p):false}>`,
				"<span class=max>"+minMax(fmtLabels.max)+"</span>"
			)
		} else if (property.type=='select' && option.input) {
			a(
				Lines.html`<label for=${inputHtmlName}>${i18n(this.getPropertyOptionName(property))}:</label>`,
				WrapLines.b(
					Lines.html`<select id=${inputHtmlName}>`,`</select>`
				).ae(
					...option.availableValues.map(value=>{
						const title=i18n(this.getPropertyOptionName(property)+'.'+value)
						return Lines.html`<option selected=${option.value==value} value=${value!=title && value}>${title}</option>`
					})
				)
			)
		} else if (property.type=='xhr') {
			a(
				Lines.html`<span id=${inputHtmlName}>${i18n(this.getPropertyOptionName(property)+'.loading')}</span>`
			)
		}
		return a.e()
	}
	get skipNode() {
		return false
	}
	// { not called if skipNode is set
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(
			...this.nodeProperties.map(
				property=>NoseWrapLines.b(
					"<div>","</div>"
				).ae(
					this.getHtmlPropertyLines(i18n,property)
				)
			)
		)
	}
	getJsInitLines(i18n,prevNodeJsNames) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.filters.'+this.type)),
			"var "+this.nodeJsName+"=ctx."+this.ctxCreateMethodName+"();",
			...prevNodeJsNames.map(
				prevNodeJsName=>prevNodeJsName+".connect("+this.nodeJsName+");"
			)
		)
	}
	get nodeJsNames() {
		return [this.nodeJsName]
	}
	// }
	// abstract:
	// get type()
	// get ctxCreateMethodName()
	// get nodeProperties()
}

class SinglePathFilter extends Filter {
	getJsInitLines(i18n,prevNodeJsNames) {
		return Lines.bae(
			super.getJsInitLines(i18n,prevNodeJsNames),
			...this.nodeProperties.map(property=>{
				const option=this.options[property.name]
				const nodePropertyJsName=this.nodeJsName+"."+property.name+(property.type=='range'?".value":"")
				const a=JsLines.b()
				if (option.input) {
					const inputJsName=this.getPropertyInputJsName(property.name)
					const inputHtmlName=this.getPropertyInputHtmlName(property.name)
					let value=inputJsName+".value"
					if (property.fn) {
						value=property.fn(value)
					}
					const eventProp=(property.type=='range'?'oninput':'onchange')
					a(
						"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
						// was for IE11 compat (but IE11 has no Web Audio): (property.type=='range'?inputJsName+".oninput=":"")+inputJsName+".onchange=function(){",
						";("+inputJsName+"."+eventProp+"=function(){",
						"	"+nodePropertyJsName+"="+value+";",
						"})();"
					)
				} else if (option.value!=option.defaultValue) {
					let value=option.value
					if (property.type=='select') {
						value="'"+value+"'"
					}
					if (property.fn) {
						value=property.fn(value)
					}
					a(
						nodePropertyJsName+"="+value+";"
					)
				}
				return a.e()
			})
		)
	}
}

class PassiveByDefaultSinglePathFilter extends SinglePathFilter {
	get skipNode() {
		return this.nodeProperties.every(property=>{
			const option=this.options[property.name]
			return option.value==option.defaultValue && !option.input
		})
	}
}

const filterClasses={
	gain: class extends PassiveByDefaultSinglePathFilter {
		get type()                { return 'gain' }
		get ctxCreateMethodName() { return 'createGain' }
		get nodeProperties() {
			return [
				{
					name:'gain',
					type:'range',
				}
			]
		}
	},
	panner: class extends PassiveByDefaultSinglePathFilter {
		get type()                { return 'panner' }
		get ctxCreateMethodName() { return 'createStereoPanner' }
		get nodeProperties() {
			return [
				{
					name:'pan',
					type:'range',
				}
			];
		}
	},
	biquad: class extends SinglePathFilter {
		get type()                { return 'biquad' }
		get ctxCreateMethodName() { return 'createBiquadFilter' }
		get nodeProperties() {
			return [
				{
					name:'type',
					type:'select',
				},{
					name:'frequency',
					type:'range',
				},{
					name:'detune',
					type:'range',
				},{
					name:'Q',
					type:'range',
					fn:x=>`Math.pow(10,${x})`,
				},{
					name:'gain',
					type:'range',
				}
			]
		}
		get skipNode() {
			// lowshelf, highshelf and peaking are passive when gain==0
			return (
				!this.options.type.input && ['lowshelf','highshelf','peaking'].indexOf(this.options.type.value)>=0 &&
				!this.options.gain.input && this.options.gain==0
			)
		}
	},
	iir: class extends SinglePathFilter {
		get type()                { return 'iir' }
		get ctxCreateMethodName() { return 'createIIRFilter' }
		get nodeProperties() {
			return []
		}
		getJsInitLines(i18n,prevNodeJsNames) {
			return JsLines.bae(
				RefLines.parse("// "+i18n('comment.filters.'+this.type)),
				"var "+this.nodeJsName+"=ctx."+this.ctxCreateMethodName+"(["+this.options.feedforward.entries+"],["+this.options.feedback.entries+"]);",
				...prevNodeJsNames.map(
					prevNodeJsName=>prevNodeJsName+".connect("+this.nodeJsName+");"
				)
			)
		}
	},
	convolver: class extends Filter {
		get type()                { return 'convolver' }
		get ctxCreateMethodName() { return 'createConvolver' }
		get nodeProperties() {
			return [
				{
					name:'reverb',
					type:'range',
				},{
					name:'buffer',
					type:'xhr',
				}
			]
		}
		get dryGainNodeJsName() {
			return camelCase(this.type+this.nSuffix+'.dry.gain.node')
		}
		get wetGainNodeJsName() {
			return camelCase(this.type+this.nSuffix+'.wet.gain.node')
		}
		get skipNode() {
			return this.options.reverb==0 && !this.options.reverb.input
		}
		getJsInitLines(i18n,prevNodeJsNames) {
			const messageHtmlName=this.getPropertyInputHtmlName('buffer')
			const a=JsLines.b()
			if (this.options.reverb.input || this.options.reverb!=1) {
				a(RefLines.parse("// "+i18n('comment.filters.'+this.type)))
			} else {
				a(RefLines.parse("// "+i18n('comment.filters.'+this.type+'.single')))
			}
			a(
				"var "+this.nodeJsName+"=ctx."+this.ctxCreateMethodName+"();",
				...prevNodeJsNames.map(
					prevNodeJsName=>prevNodeJsName+".connect("+this.nodeJsName+");"
				)
			)
			if (this.options.reverb.input || this.options.reverb!=1) {
				a(
					"var "+this.wetGainNodeJsName+"=ctx.createGain();",
					this.nodeJsName+".connect("+this.wetGainNodeJsName+");",
					"var "+this.dryGainNodeJsName+"=ctx.createGain();",
					...prevNodeJsNames.map(
						prevNodeJsName=>prevNodeJsName+".connect("+this.dryGainNodeJsName+");"
					)
				)
				if (this.options.reverb.input) {
					const inputHtmlName=this.getPropertyInputHtmlName('reverb')
					const inputJsName=this.getPropertyInputJsName('reverb')
					a(
						"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
						";("+inputJsName+".oninput=function(){",
						"	"+this.wetGainNodeJsName+".gain.value="+inputJsName+".value;",
						"	"+this.dryGainNodeJsName+".gain.value=1-"+inputJsName+".value;",
						"})();"
					)
				}
			}
			a(
				"var xhr=new XMLHttpRequest();",
				"xhr.open('GET','"+this.options.url+"');", // TODO html escape
				"xhr.responseType='arraybuffer';",
				"xhr.onload=function(){",
				"	if (this.status==200) {", // TODO we are checking status here, but what if <audio>'s status is an error?
				"		ctx.decodeAudioData(this.response,function(buffer){",
				"			"+this.nodeJsName+".buffer=buffer;",
				"			document.getElementById('"+messageHtmlName+"').textContent='';",
				"		});",
				"	} else {",
				"		this.onerror();",
				"	}",
				"};",
				"xhr.onerror=function(){",
				"	document.getElementById('"+messageHtmlName+"').textContent='"+i18n('options.filters.convolver.buffer.error')+"';",
				"};",
				"xhr.send();"
			)
			return a.e()
		}
		get nodeJsNames() {
			if (this.options.reverb.input || this.options.reverb!=1) {
				return [this.wetGainNodeJsName,this.dryGainNodeJsName]
			} else {
				return [this.nodeJsName]
			}
		}
	},
	equalizer: class extends Filter {
		get type()                { return 'equalizer' }
		get ctxCreateMethodName() { return 'createBiquadFilter' }
		get frequencies()         { return [60,170,350,1000,3500,10000] }
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
			if (!this.allGainsConstant) {
				featureContext.alignedInputs=true
			}
		}
		get skipNode() {
			return this.affectedFreqsAndOptions.length==0
		}
		getJsInitLines(i18n,prevNodeJsNames) {
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
				if (allGainsConstant && !singleFreq) {
					a("")
				} else {
					a("var ")
				}
				a.t(nodeJsName+"=ctx."+this.ctxCreateMethodName+"();")
				if (singleFreq) {
					a(
						...prevNodeJsNames.map(
							prevNodeJsName=>prevNodeJsName+".connect("+nodeJsName+");"
						)
					)
				} else {
					if (prevNodeJsNames.length==1) {
						a("prevNode.connect("+nodeJsName+");")
					} else {
						a(
							"prevNodes.forEach(function(prevNode){",
							"	prevNode.connect("+nodeJsName+");",
							"});"
						)
					}
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
	getEntryClass(entryOption) {
		return filterClasses[entryOption.filter]
	}
	requestFeatureContext(featureContext) {
		if (!featureContext.audioProcessing) return
		this.entries.forEach(entry=>{
			if (!entry.skipNode) {
				featureContext.audioContext=true
				entry.requestFeatureContext(featureContext)
			}
		})
	}
	getHtmlLines(featureContext,i18n) {
		if (!featureContext.audioProcessing) return Lines.be()
		return Lines.bae(...this.entries.filter(entry=>!entry.skipNode).map(entry=>entry.getHtmlLines(featureContext,i18n)))
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		if (!featureContext.audioProcessing) return Lines.be()
		return InterleaveLines.bae(...this.entries.filter(entry=>!entry.skipNode).map(entry=>{
			const lines=entry.getJsInitLines(i18n,prevNodeJsNames)
			prevNodeJsNames=entry.nodeJsNames
			return lines
		}))
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (!featureContext.audioProcessing) return prevNodeJsNames
		this.entries.forEach(entry=>{
			if (!entry.skipNode) {
				prevNodeJsNames=entry.nodeJsNames
			}
		})
		return prevNodeJsNames
	}
}

module.exports=FilterSequence
