'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const formatNumbers=require('crnx-base/format-numbers')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const RefLines=require('crnx-base/ref-lines')
const CollectionFeature=require('./collection-feature')

class Source {
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
	get elementHtmlName() {
		return 'my.'+this.type+this.nSuffix
	}
	get nodeJsName() {
		return camelCase(this.type+this.nSuffix+'.node')
	}
	getHtmlLines(featureContext,i18n) {
		return WrapLines.b("<div>","</div>").ae(
			this.getElementHtmlLines(featureContext,i18n)
		)
	}
	getJsInitLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.sources.'+this.type)),
			"var "+this.nodeJsName+"=ctx.createMediaElementSource(document.getElementById('"+this.elementHtmlName+"'));"
		)
	}
	// abstract:
	// get type()
	// getElementHtmlLines(featureContext,i18n)
}

const sourceClasses={
	audio: class extends Source {
		get type() { return 'audio' }
		getElementHtmlLines(featureContext,i18n) {
			return Lines.bae(
				Lines.html`<audio src=${this.options.url} id=${this.elementHtmlName} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></audio>`
			)
		}
	},
	video: class extends Source {
		get type() { return 'video' }
		getElementHtmlLines(featureContext,i18n) {
			return Lines.bae(
				Lines.html`<video src=${this.options.url} id=${this.elementHtmlName} width=${this.options.width} height=${this.options.height} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></video>`
			)
		}
	},
	sample: class extends Source {
		get type() { return 'sample' }
		getElementHtmlLines(featureContext,i18n) {
			const messageHtmlName=this.elementHtmlName+'.buffer'
			return Lines.bae(
				Lines.html`<button id=${this.elementHtmlName} disabled>${i18n('label.sources.sample.play')}</button> <span id=${messageHtmlName}>${i18n('options.sources.sample.buffer.loading')}</span>`
			)
		}
		getJsInitLines(featureContext,i18n) {
			const messageHtmlName=this.elementHtmlName+'.buffer'
			const fmtMul=(fmtNum)=>{
				if (fmtNum==1) {
					return ""
				} else {
					return "*"+fmtNum
				}
			}
			const getSampleLines=(startOptions)=>{
				const randomValue=(baseOption,randomOption)=>{
					const numbers={}
					numbers.base=baseOption
					if (randomOption>0) {
						numbers.random=randomOption
					}
					const fmt=formatNumbers.js(numbers)
					let value=fmt.base
					if (randomOption>0) {
						value+="+Math.random()"+fmtMul(fmt.random)
					}
					return value
				}
				const a=JsLines.b()
				let lastNodeName="bufferSourceNode"
				a(
					"var bufferSourceNode=ctx.createBufferSource();",
					"bufferSourceNode.buffer=buffer;"
				)
				if (this.options.pitch!=1 || this.options.randomPitch>0) {
					a(
						"bufferSourceNode.playbackRate.value="+randomValue(this.options.pitch,this.options.randomPitch)+";"
					)
				}
				if (this.options.gain!=1 || this.options.randomGain>0) {
					lastNodeName="bufferSourceGainNode"
					a(
						"var bufferSourceGainNode=bufferSourceNode.connect(ctx.createGain());",
						"bufferSourceGainNode.gain.value="+randomValue(this.options.gain,this.options.randomGain)+";"
					)
				}
				if (featureContext.connectSampleToCompressor) {
					a(
						"if (document.getElementById('my.compressor').checked) {",
						"	"+lastNodeName+".connect(compressorNode);",
						"} else {",
						...featureContext.connectSampleToJsNames.map(
							nodeJsName=>"	"+lastNodeName+".connect("+nodeJsName+");"
						),
						"}"
					)
				} else {
					a(
						...featureContext.connectSampleToJsNames.map(
							nodeJsName=>lastNodeName+".connect("+nodeJsName+");"
						)
					)
				}
				a(
					"bufferSourceNode.start("+startOptions+");"
				)
				return a.e()
			}
			const getOnClickLines=()=>{
				let startOptions=""
				const numbers={}
				if (this.options.repeat!=1) {
					numbers.interval=this.options.interval
				}
				if (this.options.randomShift>0) {
					numbers.randomShift=this.options.randomShift
				}
				const fmt=formatNumbers.js(numbers)
				if (this.options.repeat!=1) {
					startOptions+="+i"+fmtMul(fmt.interval)
				}
				if (this.options.randomShift>0) {
					startOptions+="+Math.random()"+fmtMul(fmt.randomShift)
				}
				if (startOptions.length>0) {
					startOptions="ctx.currentTime"+startOptions
				}
				if (this.options.repeat==1) {
					return getSampleLines(startOptions)
				} else {

					return WrapLines.b(
						JsLines.bae("for (var i=0;i<"+this.options.repeat+";i++) {"),
						JsLines.bae("}")
					).ae(
						getSampleLines(startOptions)
					)
				}
			}
			const getOnDecodeLines=()=>{
				const a=JsLines.b()
				a(
					"var button=document.getElementById('"+this.elementHtmlName+"');"
				)
				a(WrapLines.b(
					JsLines.bae("button.onclick=function(){"),
					JsLines.bae("};")
				).ae(
					getOnClickLines()
				))
				a(
					"button.disabled=false;",
					"document.getElementById('"+messageHtmlName+"').textContent='';"
				)
				return a.e()
			}
			const getOnErrorLines=()=>{
				return JsLines.bae(
					"document.getElementById('"+messageHtmlName+"').textContent='"+i18n('options.sources.sample.buffer.error')+"';"
				)
			}
			const leadLines=JsLines.bae(
				RefLines.parse("// "+i18n('comment.sources.'+this.type)),
				"loadSample('"+this.options.url+"',function(buffer){"
			)
			const midLines=JsLines.bae(
				"},function(){"
			)
			const endLines=JsLines.bae(
				"});"
			)
			if (!featureContext.loaderOnError) {
				return WrapLines.b(leadLines,endLines).ae(
					getOnDecodeLines()
				)
			} else {
				return WrapLines.b(leadLines,midLines,endLines).ae(
					getOnDecodeLines(),
					getOnErrorLines()
				)
			}
		}
	},
}

class SourceSet extends CollectionFeature {
	getEntryClass(entryOption) {
		return sourceClasses[entryOption.source]
	}
	requestFeatureContext(featureContext) {
		if (this.entries.length>0) {
			featureContext.audioProcessing=true
		}
		if (this.entries.some(entry=>entry.type=='sample')) {
			featureContext.audioContext=true
			featureContext.loader=true
			featureContext.setConnectSampleToJsNames=true
		}
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const a=InterleaveLines.b()
		if (featureContext.audioContext) {
			a(...this.entries.map(entry=>entry.getJsInitLines(featureContext,i18n)))
		}
		return a.e()
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		let nodeJsNames=[]
		if (featureContext.audioContext) {
			nodeJsNames=this.entries.filter(entry=>entry.type!='sample').map(entry=>entry.nodeJsName)
		}
		if (nodeJsNames.length>0) {
			return nodeJsNames
		} else {
			return prevNodeJsNames
		}
	}
}

module.exports=SourceSet
