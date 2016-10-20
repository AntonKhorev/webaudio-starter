'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const formatNumber=require('crnx-base/format-number')
const formatNumbers=require('crnx-base/format-numbers')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const Option=require('./option-classes')
const Feature=require('./feature')

const GenNode={}

//// abstract classes (not exported)

class Node extends Feature {
	constructor(options,name) {
		super()
		this.options=options
		this.name=name
	}
	initEdges(prevNodes,nextNodes) { // call it before calling any other methods
		this.prevNodes=prevNodes // need then only for inputs/outputs - could just keep inputs/outputs if not for bypass node
		this.nextNodes=nextNodes
	}
	// get type()
	get jsCommentType() {
		return this.type
	}
	getInputs() {
		return []
	}
	getOutputs() {
		return []
	}
	// public helpers:
	// TODO replace prevNodes.forEach with for-of loop
	getPrevNodeOutputs() {
		// [].concat(prevNodes.map(node=>node.getOutputs())) // ?
		const names=[]
		this.prevNodes.forEach(node=>{
			names.push(...node.getOutputs())
		})
		return names
	}
	getNextNodeInputs() {
		const names=[]
		this.nextNodes.forEach(node=>{
			names.push(...node.getInputs())
		})
		return names
	}
	// protected:
	get nodeHtmlName() { // TODO rename to htmlName
		return 'my.'+this.name
	}
	get nodeJsName() { // TODO rename to jsName
		return camelCase(this.name+'.node')
	}
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.name+'.'+propertyName
	}
	getPropertyInputJsName(propertyName) {
		return camelCase(this.name+'.'+propertyName+'.input')
	}
	getPropertyJsConstant(property,option,value=option.value) {
		if (property.type=='range') {
			value=formatNumber.js(value,option.precision)
		} else if (property.type=='select') {
			value="'"+value+"'"
		}
		if (property.fn) {
			value=property.fn(value)
		}
		return value
	}
	getPropertyHtmlLines(featureContext,i18n,property) {
		if (property.skip) {
			return Lines.be()
		}
		const option=this.options[property.name]
		const inputHtmlName=this.getPropertyInputHtmlName(property.name)
		const propertyOptionName='options.graph.'+this.type+'.'+property.name
		const a=Lines.b()
		if (property.type=='range' && option.input) {
			const p=option.precision
			const fmtAttrs=formatNumbers.html({ min:option.min, max:option.max, value:option.value },p)
			const fmtLabels=formatNumbers({ min:option.min, max:option.max },p)
			const minMax=n=>i18n.numberWithUnits(n,option.unit,(a,e)=>Lines.html`<abbr title=${e}>`+a+`</abbr>`)
			a(
				Lines.html`<label for=${inputHtmlName}>${i18n(propertyOptionName)}:</label>`,
				"<span class=min>"+minMax(fmtLabels.min)+"</span>",
				Lines.html`<input id=${inputHtmlName} type=range value=${fmtAttrs.value} min=${fmtAttrs.min} max=${fmtAttrs.max} step=${p?Math.pow(0.1,p).toFixed(p):false}>`,
				"<span class=max>"+minMax(fmtLabels.max)+"</span>"
			)
		} else if (property.type=='select' && option.input) {
			a(
				Lines.html`<label for=${inputHtmlName}>${i18n(propertyOptionName)}:</label>`,
				WrapLines.b(
					Lines.html`<select id=${inputHtmlName}>`,`</select>`
				).ae(
					...option.availableValues.map(value=>{
						const title=i18n(propertyOptionName+'.'+value)
						return Lines.html`<option selected=${option.value==value} value=${value!=title && value}>${title}</option>`
					})
				)
			)
		} else if (property.type=='xhr') {
			a(
				Lines.html`<span id=${inputHtmlName}>${i18n('label.graph.'+this.type+'.'+property.name+'.loading')}</span>`
			)
		}
		return a.e()
	}
	getXhrJsLines(featureContext,i18n,onDecodeLines,onErrorLines) {
		const leadLines=JsLines.bae(
			"loadSample('"+this.options.url+"',function(buffer){" // TODO html escape
		)
		const midLines=JsLines.bae(
			"},function(){"
		)
		const endLines=JsLines.bae(
			"});"
		)
		if (!featureContext.loaderOnError) {
			return WrapLines.b(leadLines,endLines).ae(onDecodeLines)
		} else {
			return WrapLines.b(leadLines,midLines,endLines).ae(onDecodeLines,onErrorLines)
		}
	}
}

class ContainerNode extends Node {
	constructor(options,name,innerNode) {
		super(options,name)
		this.innerNode=innerNode
	}
	get type() {
		return this.innerNode.type
	}
	get jsCommentType() {
		return this.innerNode.jsCommentType
	}
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true
		this.innerNode.requestFeatureContext(featureContext)
	}
	getPreVisJsLines(featureContext,i18n) {
		return this.innerNode.getPreVisJsLines(featureContext,i18n)
	}
	getVisJsLines(featureContext,i18n) {
		return this.innerNode.getVisJsLines(featureContext,i18n)
	}
}

class SingleNode extends Node { // corresponds to single web audio node
	getOutputs() {
		return [this.nodeJsName]
	}
}

class MediaElementNode extends SingleNode {
	getHtmlLines(featureContext,i18n) {
		return NoseWrapLines.b("<div>","</div>").ae(
			this.getElementHtmlLines(featureContext,i18n)
		)
	}
	// protected:
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			"var "+this.nodeJsName+"=ctx.createMediaElementSource(document.getElementById('"+this.nodeHtmlName+"'));"
		)
	}
}

class FilterNode extends SingleNode {
	getInputs() {
		return [this.nodeJsName]
	}
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(
			...this.properties.map(
				property=>NoseWrapLines.b(
					"<div>","</div>"
				).ae(
					this.getPropertyHtmlLines(featureContext,i18n,property)
				)
			)
		)
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			featureContext.getConnectAssignJsLines(
				"var",this.nodeJsName,
				"ctx."+this.ctxCreateMethodName+"()",
				this.getPrevNodeOutputs()
			),
			...this.properties.map(property=>{
				if (property.skip) {
					return JsLines.be()
				}
				const option=this.options[property.name]
				const propertyJsName=this.nodeJsName+"."+property.name+(property.type=='range'?".value":"")
				const inputJsName=this.getPropertyInputJsName(property.name)
				const inputHtmlName=this.getPropertyInputHtmlName(property.name)
				if (property.type!='xhr' && option.input) {
					let value=inputJsName+".value"
					if (property.fn) {
						value=property.fn(value)
					}
					const eventProp=(property.type=='range'?'oninput':'onchange')
					return JsLines.bae(
						"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
						// was for IE11 compat (but IE11 has no Web Audio): (property.type=='range'?inputJsName+".oninput=":"")+inputJsName+".onchange=function(){",
						";("+inputJsName+"."+eventProp+"=function(){",
						"	"+propertyJsName+"="+value+";",
						"})();"
					)
				} else if (property.type!='xhr' && option.value!=option.defaultValue) {
					return JsLines.bae(
						propertyJsName+"="+this.getPropertyJsConstant(property,option)+";"
					)
				} else if (property.type=='xhr') {
					return this.getXhrJsLines(featureContext,i18n,JsLines.bae(
						propertyJsName+"=buffer;",
						"document.getElementById('"+inputHtmlName+"').textContent='';"
					),JsLines.bae(
						"document.getElementById('"+inputHtmlName+"').textContent='"+i18n('label.graph.'+this.type+'.'+property.name+'.error')+"';"
					))
				}
				return JsLines.be()
			})
		)
	}
	// protected:
	// get ctxCreateMethodName()
	get properties() {
		return []
	}
}

//// concrete classes

GenNode.bypass = class extends ContainerNode { // used when enableInput is set
	constructor(options,name,innerNode,rewireInput,rewireOutput) {
		super(options,name,innerNode)
		this.rewireInput=rewireInput
		this.rewireOutput=rewireOutput
	}
	initEdges(prevNodes,nextNodes) {
		super.initEdges(prevNodes,nextNodes)
		this.innerNode.initEdges(prevNodes,nextNodes)
	}
	getInputs() {
		const names=[]
		if (this.options.enabled || !this.rewireInput) {
			names.push(...this.innerNode.getInputs())
		}
		if (!this.options.enabled) {
			names.push(...this.getNextNodeInputs())
		}
		return names
	}
	getOutputs() {
		const names=[]
		if (this.options.enabled || !this.rewireOutput) {
			names.push(...this.innerNode.getOutputs())
		}
		if (!this.options.enabled) {
			names.push(...this.getPrevNodeOutputs())
		}
		return names
	}
	getHtmlLines(featureContext,i18n) {
		const inputHtmlName=this.getPropertyInputHtmlName('enabled')
		return Lines.bae(
			NoseWrapLines.b("<div>","</div>").ae(
				Lines.html`<input id=${inputHtmlName} type=checkbox checked=${this.options.enabled}>`,
				Lines.html`<label for=${inputHtmlName}>${i18n('options-output.enabled')}</label>` // TODO correct i18n
			),
			this.innerNode.getHtmlLines(featureContext,i18n)
		)
	}
	getInitJsLines(featureContext,i18n) {
		const inputHtmlName=this.getPropertyInputHtmlName('enabled')
		const a=JsLines.b()
		const rewire=(method,fromNames,toNames)=>{
			for (const fromName of fromNames) {
				for (const toName of toNames) {
					a(`\t\t${fromName}.${method}(${toName});`)
				}
			}
		}
		a(
			this.innerNode.getInitJsLines(featureContext,i18n),
			`document.getElementById('${inputHtmlName}').onchange=function(){`,
			`	if (this.checked) {`
		)
		rewire('disconnect',this.getPrevNodeOutputs(),this.getNextNodeInputs())
		if (this.rewireInput) {
			rewire('connect',this.getPrevNodeOutputs(),this.innerNode.getInputs())
		}
		if (this.rewireOutput) {
			rewire('connect',this.innerNode.getOutputs(),this.getNextNodeInputs())
		}
		a(
			`	} else {`
		)
		if (this.rewireOutput) {
			rewire('disconnect',this.innerNode.getOutputs(),this.getNextNodeInputs())
		}
		if (this.rewireInput) {
			rewire('disconnect',this.getPrevNodeOutputs(),this.innerNode.getInputs())
		}
		rewire('connect',this.getPrevNodeOutputs(),this.getNextNodeInputs())
		a(
			`	}`,
			`};`
		)
		return a.e()
	}
}

GenNode.drywet = class extends ContainerNode {
	initEdges(prevNodes,nextNodes) {
		super.initEdges(prevNodes,nextNodes)
		const wetGainDummyNode={
			getInputs() {
				[this.wetGainNodeJsName]
			}
		}
		this.innerNode.initEdges(prevNodes,[wetGainDummyNode])
	}
	get jsCommentType() {
		return this.innerNode.jsCommentType+'.drywet'
	}
	getInputs() {
		return [this.dryGainNodeJsName,...this.innerNode.getInputs()]
	}
	getOutputs() {
		return [this.dryGainNodeJsName,this.wetGainNodeJsName]
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(
			this.getPropertyHtmlLines(featureContext,i18n,this.wetProperty),
			this.innerNode.getHtmlLines(featureContext,i18n)
		)
	}
	getInitJsLines(featureContext,i18n) {
		const a=JsLines.b()
		a(
			this.innerNode.getInitJsLines(featureContext,i18n)
		)
		a(
			featureContext.getConnectAssignJsLines(
				"var",this.dryGainNodeJsName,
				"ctx.createGain()",
				this.getPrevNodeOutputs()
			)
		)
		if (!this.options.wet.input) {
			a(
				this.dryGainNodeJsName+".gain.value="+this.getPropertyJsConstant(this.wetProperty,this.options.wet,1-this.options.wet)+";"
			)
		}
		a(
			featureContext.getConnectAssignJsLines(
				"var",this.wetGainNodeJsName,
				"ctx.createGain()",
				this.innerNode.getOutputs()
			)
		)
		if (!this.options.wet.input) {
			a(
				this.wetGainNodeJsName+".gain.value="+this.getPropertyJsConstant(this.wetProperty,this.options.wet)+";"
			)
		}
		if (this.options.wet.input) {
			const inputHtmlName=this.getPropertyInputHtmlName('wet')
			const inputJsName=this.getPropertyInputJsName('wet')
			a(
				"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
				";("+inputJsName+".oninput=function(){",
				"	"+this.wetGainNodeJsName+".gain.value="+inputJsName+".value;",
				"	"+this.dryGainNodeJsName+".gain.value=1-"+inputJsName+".value;",
				"})();"
			)
		}
		return a.e()
	}
	// protected:
	get dryGainNodeJsName() {
		return camelCase(this.name+'.dry.gain.node')
	}
	get wetGainNodeJsName() {
		return camelCase(this.name+'.wet.gain.node')
	}
	get wetProperty() {
		return {name:'wet',type:'range'}
	}
}

GenNode.analyser = class extends SingleNode {
	constructor(options,name,visNodes) {
		super(options,name)
		this.visNodes=visNodes
	}
	get type() {
		return 'analyser'
	}
	getInputs() {
		return [this.nodeJsName]
	}
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true
		featureContext.canvas=true
		if (featureContext.maxLogFftSize==undefined || featureContext.maxLogFftSize<this.options.logFftSize) {
			featureContext.maxLogFftSize=this.options.logFftSize
			featureContext.maxLogFftSizeNodeJsName=this.nodeJsName
		}
		for (const visNode of this.visNodes) {
			visNode.requestFeatureContext(featureContext)
		}
	}
	getInitJsLines(featureContext,i18n) {
		const getAnalyserNodeLines=(jsName,prevOutputs,connectArgs)=>{
			const a=JsLines.b()
			a(featureContext.getConnectAssignJsLines("var",jsName,"ctx.createAnalyser()",prevOutputs,connectArgs))
			if (this.options.logFftSize!=11) { // default FFT size is 2048
				a(jsName+".fftSize="+(1<<this.options.logFftSize)+";")
			}
			return a.e()
		}
		return getAnalyserNodeLines(this.nodeJsName,this.getPrevNodeOutputs())
	}
	getPreVisJsLines(featureContext,i18n) {
		return JsLines.bae(
			...this.visNodes.map(visNode=>visNode.getPreVisJsLines(featureContext,i18n))
		)
	}
	getVisJsLines(featureContext,i18n) {
		return JsLines.bae(
			...this.visNodes.map(visNode=>visNode.getVisJsLines(featureContext,i18n))
		)
	}
}

GenNode.stereoVolume = class extends Node {
	constructor(options,name,visNodes) {
		super(options,name)
		this.visNodes=visNodes
	}
	get type() {
		return 'stereoVolume'
	}
	get splitterNodeJsName() {
		return camelCase(this.name+'.splitter.node')
	}
	get leftAnalyserNodeJsName() {
		return camelCase(this.name+'.left.analyser.node')
	}
	get rightAnalyserNodeJsName() {
		return camelCase(this.name+'.right.analyser.node')
	}
	getInputs() {
		return [this.splitterNodeJsName]
	}
	requestFeatureContext(featureContext) { // copypaste from analyser except for "leftAnalyserNodeJsName" TODO refactor
		featureContext.audioContext=true
		featureContext.canvas=true
		if (featureContext.maxLogFftSize==undefined || featureContext.maxLogFftSize<this.options.logFftSize) {
			featureContext.maxLogFftSize=this.options.logFftSize
			featureContext.maxLogFftSizeNodeJsName=this.leftAnalyserNodeJsName
		}
		for (const visNode of this.visNodes) {
			visNode.requestFeatureContext(featureContext)
		}
	}
	getInitJsLines(featureContext,i18n) {
		const getAnalyserNodeLines=(jsName,prevOutputs,connectArgs)=>{ // copypaste from analyser TODO refactor
			const a=JsLines.b()
			a(featureContext.getConnectAssignJsLines("var",jsName,"ctx.createAnalyser()",prevOutputs,connectArgs))
			if (this.options.logFftSize!=11) { // default FFT size is 2048
				a(jsName+".fftSize="+(1<<this.options.logFftSize)+";")
			}
			return a.e()
		}
		return JsLines.bae(
			featureContext.getConnectAssignJsLines("var",this.splitterNodeJsName,"ctx.createChannelSplitter()",this.getPrevNodeOutputs()),
			getAnalyserNodeLines(this.leftAnalyserNodeJsName,[this.splitterNodeJsName],"0"),
			getAnalyserNodeLines(this.rightAnalyserNodeJsName,[this.splitterNodeJsName],"1")
		)
	}
	getPreVisJsLines(featureContext,i18n) { // copypaste from analyser TODO refactor
		return JsLines.bae(
			...this.visNodes.map(visNode=>visNode.getPreVisJsLines(featureContext,i18n))
		)
	}
	getVisJsLines(featureContext,i18n) { // copypaste from analyser TODO refactor
		return JsLines.bae(
			...this.visNodes.map(visNode=>visNode.getVisJsLines(featureContext,i18n))
		)
	}
}

GenNode.junction = class extends FilterNode {
	get type() {
		return 'junction'
	}
	get ctxCreateMethodName() {
		return 'createGain'
	}
}

GenNode.audio = class extends MediaElementNode {
	get type() {
		return 'audio'
	}
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<audio src=${this.options.url} id=${this.nodeHtmlName} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></audio>`
		)
	}
}

GenNode.video = class extends MediaElementNode {
	get type() {
		return 'video'
	}
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<video src=${this.options.url} id=${this.nodeHtmlName} width=${this.options.width} height=${this.options.height} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></video>`
		)
	}
}

GenNode.sample = class extends Node {
	get type() {
		return 'sample'
	}
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true
		featureContext.loader=true
	}
	getHtmlLines(featureContext,i18n) {
		const messageHtmlName=this.nodeHtmlName+'.buffer'
		return NoseWrapLines.b("<div>","</div>").ae(
			Lines.html`<button id=${this.nodeHtmlName} disabled>${i18n('label.graph.sample.play')}</button> <span id=${messageHtmlName}>${i18n('label.graph.sample.buffer.loading')}</span>`
		)
	}
	getInitJsLines(featureContext,i18n) {
		const messageHtmlName=this.nodeHtmlName+'.buffer'
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
					featureContext.getConnectAssignJsLines("var","bufferSourceGainNode","ctx.createGain()",["bufferSourceNode"]),
					"bufferSourceGainNode.gain.value="+randomValue(this.options.gain,this.options.randomGain)+";"
				)
			}
			a(
				...this.getNextNodeInputs().map(
					nodeJsName=>lastNodeName+".connect("+nodeJsName+");"
				),
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
			return JsLines.bae(
				"var button=document.getElementById('"+this.nodeHtmlName+"');",
				WrapLines.b(
					JsLines.bae("button.onclick=function(){"),
					JsLines.bae("};")
				).ae(
					getOnClickLines()
				),
				"button.disabled=false;",
				"document.getElementById('"+messageHtmlName+"').textContent='';"
			)
		}
		const getOnErrorLines=()=>{
			return JsLines.bae(
				"document.getElementById('"+messageHtmlName+"').textContent='"+i18n('label.graph.sample.buffer.error')+"';"
			)
		}
		return this.getXhrJsLines(featureContext,i18n,getOnDecodeLines(),getOnErrorLines())
	}
}

GenNode.gain = class extends FilterNode {
	get type() {
		return 'gain'
	}
	get ctxCreateMethodName() {
		return 'createGain'
	}
	get properties() {
		return [
			{
				name:'gain',
				type:'range',
			}
		]
	}
}

GenNode.panner = class extends FilterNode {
	get type() {
		return 'panner'
	}
	get ctxCreateMethodName() {
		return 'createStereoPanner'
	}
	get properties() {
		return [
			{
				name:'pan',
				type:'range',
			}
		]
	}
}

GenNode.biquad = class extends FilterNode {
	get type() {
		return 'biquad'
	}
	get ctxCreateMethodName() {
		return 'createBiquadFilter'
	}
	get properties() {
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
				skip:(!this.options.type.input && !Option.BiquadFilter.typeUsesQ(this.options.type.value)),
			},{
				name:'gain',
				type:'range',
				skip:(!this.options.type.input && !Option.BiquadFilter.typeUsesGain(this.options.type.value)),
			}
		]
	}
}

GenNode.convolver = class extends FilterNode {
	get type() {
		return 'convolver'
	}
	get ctxCreateMethodName() {
		return 'createConvolver'
	}
	get properties() {
		return [
			{
				name:'buffer',
				type:'xhr',
			}
		]
	}
	requestFeatureContext(featureContext) {
		super.requestFeatureContext(featureContext)
		featureContext.loader=true
	}
}

GenNode.compressor = class extends FilterNode {
	get type() {
		return 'compressor'
	}
	get ctxCreateMethodName() {
		return 'createDynamicsCompressor'
	}
}

GenNode.destination = class extends Node {
	get type() {
		return 'destination'
	}
	getInputs() {
		return ['ctx.destination']
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			...this.getPrevNodeOutputs().map(name=>name+".connect(ctx.destination);")
		)
	}
}

module.exports=GenNode
