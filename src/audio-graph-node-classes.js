'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const formatNumbers=require('crnx-base/format-numbers')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const RefLines=require('crnx-base/ref-lines')
const Feature=require('./feature')

// TODO naming conventions for two graphs: user-entered and web audio api
// TODO consider two classes for each node type:
// 	ConNode.* = graph construction nodes - can be rewired, have .toGenNode(genNodeClass) method, not subclasses of Feature
// 	GenNode.* = code generation nodes - connot be rewired, can create them after node sorting, subclasses of Feature

const NodeClasses={}

// abstract classes (not exported)

class Node extends Feature {
	constructor(options) {
		super()
		this.options=options
		// set/modified by graph constructor:
		this.nextNodes=new Set
		this.prevNodes=new Set
		//this._n=undefined
	}
	get n() {
		return this._n
	}
	set n(n) {
		this._n=n
	}
	get nSuffix() {
		if (this._n!==undefined) {
			return '.'+this._n
		} else {
			return ''
		}
	}
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.type+this.nSuffix+'.'+propertyName
	}
	getPropertyInputJsName(propertyName) {
		return camelCase(this.type+this.nSuffix+'.'+propertyName+'.input')
	}
	// abstract get type() // required for n-assignment, can't do it by class with aggregation nodes like Node.bypass
	get passive() {
		return false
	}
	get downstreamEffect() {
		return false // source node
	}
	get upstreamEffect() {
		return false // destination or visualization node
	}
	get fixedInput() {
		return false // TODO set to true by default
	}
	get fixedOutput() {
		return false
	}
	get nInputJsNames() { // estimate number of inputs, ok to overestimate
		return 0
	}
	get nOutputJsNames() { // estimate number of outputs, ok to overestimate
		return 0
	}
	get prevNodeJsNameCount() {
		let count=0
		this.prevNodes.forEach(node=>{
			count+=node.nOutputJsNames
		})
		return count
	}
	get nextNodeJsNameCount() {
		let count=0
		this.nextNodes.forEach(node=>{
			count+=node.nInputJsNames
		})
		return count
	}
	// { GenNode interface
	getInputJsNames() {
		return []
	}
	getOutputJsNames() {
		return []
	}
	getPrevNodeJsNames() {
		const names=[]
		this.prevNodes.forEach(node=>{
			names.push(...node.getOutputJsNames())
		})
		return names
	}
	getNextNodeJsNames() {
		const names=[]
		this.nextNodes.forEach(node=>{
			names.push(...node.getInputJsNames())
		})
		return names
	}
	// } GenNode interface
}

class SingleNode extends Node { // corresponds to single web audio node
	get fixedInput() {
		return true
	}
	get fixedOutput() {
		return true
	}
	get nOutputJsNames() {
		return 1
	}
	get nodeJsName() {
		return camelCase(this.type+this.nSuffix+'.node')
	}
	getInputJsNames() {
		return [this.nodeJsName]
	}
	getOutputJsNames() {
		return [this.nodeJsName]
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.'+this.type)),
			this.getCreateNodeJsLines(featureContext)
		)
	}
	// abstract:
	// getCreateNodeJsLines(featureContext)
}

class MediaElementNode extends SingleNode {
	get downstreamEffect() {
		return true
	}
	get elementHtmlName() {
		return 'my.'+this.type+this.nSuffix
	}
	getHtmlLines(featureContext,i18n) {
		return NoseWrapLines.b("<div>","</div>").ae(
			this.getElementHtmlLines(featureContext,i18n)
		)
	}
	getCreateNodeJsLines(featureContext) {
		return JsLines.bae(
			"var "+this.nodeJsName+"=ctx.createMediaElementSource(document.getElementById('"+this.elementHtmlName+"'));"
		)
	}
	// abstract:
	// getElementHtmlLines()
}

class FilterNode extends SingleNode {
	get nInputJsNames() {
		return 1
	}
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true
	}
	getHtmlLines(featureContext,i18n) {
		const getPropertyHtmlLines=(property)=>{
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
					Lines.html`<span id=${inputHtmlName}>${i18n(this.getPropertyOptionName(property)+'.loading')}</span>`
				)
			}
			return a.e()
		}
		return Lines.bae(
			...this.nodeProperties.map(
				property=>NoseWrapLines.b(
					"<div>","</div>"
				).ae(
					getPropertyHtmlLines(property)
				)
			)
		)
	}
	getInitJsLines(featureContext,i18n) {
		return Lines.bae(
			super.getInitJsLines(featureContext,i18n),
			...this.nodeProperties.map(property=>{
				if (property.skip) {
					return Lines.be()
				}
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
	getCreateNodeJsLines(featureContext) {
		return featureContext.getConnectAssignJsLines(
			"var",this.nodeJsName,
			"ctx."+this.ctxCreateMethodName+"()",
			this.getPrevNodeJsNames()
		)
	}
	// abstract:
	get nodeProperties() {
		return []
	}
	// get ctxCreateMethodName()
}

class PassiveByDefaultFilterNode extends FilterNode {
	get passive() {
		return this.nodeProperties.every(property=>{
			const option=this.options[property.name]
			return option.value==option.defaultValue && !option.input
		})
	}
}

// concrete classes

// TODO fix bug with parallel bypasses
// TODO fix bug with non-fixed inner element
// 	by insulating it with junctions - can't do it now b/c can't ask for junctions to be generated - graph has to do it
// 	(currently it's impossible to get this bug through options)
NodeClasses.bypass = class extends Node { // used when enableInput is set
	constructor(options,innerNode) {
		super(options)
		this.innerNode=innerNode
		if (this.options.enabled) {
			this.innerNode.prevNodes=this.prevNodes
			this.innerNode.nextNodes=this.nextNodes
		}
	}
	set n(n) {
		super.n=n
		this.innerNode.n=n
	}
	get type() {
		return this.innerNode.type
	}
	get downstreamEffect() {
		return this.innerNode.downstreamEffect
	}
	get upstreamEffect() {
		return this.innerNode.upstreamEffect
	}
	get nInputJsNames() { // estimate number of inputs, ok to overestimate
		return this.innerNode.nInputJsNames
		// TODO max(^,sum of next nodes inputs) or maybe infinity?
	}
	get nOutputJsNames() { // estimate number of outputs, ok to overestimate
		return this.innerNode.nOutputJsNames
		// TODO max(^,sum of prev nodes outputs) or maybe infinity?
	}
	get passive() {
		return this.innerNode.passive
	}
	get fixedInput() {
		return this.passive
	}
	get fixedOutput() {
		return this.passive
	}
	getInputJsNames() {
		if (this.options.enabled) {
			return this.innerNode.getInputJsNames()
		} else {
			return this.getNextNodeJsNames()
		}
	}
	getOutputJsNames() {
		if (this.options.enabled) {
			return this.innerNode.getOutputJsNames()
		} else {
			return this.getPrevNodeJsNames()
		}
	}
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true
		this.innerNode.requestFeatureContext(featureContext)
	}
	getHtmlLines(featureContext,i18n) {
		const inputHtmlName=this.getPropertyInputHtmlName('enabled')
		return JsLines.bae(
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
		a(
			this.innerNode.getInitJsLines(featureContext,i18n),
			`document.getElementById('${inputHtmlName}').onchange=function(){`,
			`	if (this.checked) {`
		)
		// TODO don't (dis)connect both inputs and outputs
		// 	e.g. if inner node is not a source, can keep it always connected
		// 	check this by up/downstream effect - have to disconnect the effect
		// 	prefer to disconnect input
		for (const prevName of this.getPrevNodeJsNames()) {
			for (const nextName of this.getNextNodeJsNames()) {
				a(`\t\t${prevName}.disconnect(${nextName});`)
			}
		}
		for (const prevName of this.getPrevNodeJsNames()) {
			for (const inputName of this.innerNode.getInputJsNames()) {
				a(`\t\t${prevName}.connect(${inputName});`)
			}
		}
		for (const outputName of this.innerNode.getOutputJsNames()) {
			for (const nextName of this.getNextNodeJsNames()) {
				a(`\t\t${outputName}.connect(${nextName});`)
			}
		}
		a(
			`	} else {`
		)
		for (const outputName of this.innerNode.getOutputJsNames()) {
			for (const nextName of this.getNextNodeJsNames()) {
				a(`\t\t${outputName}.disconnect(${nextName});`)
			}
		}
		for (const prevName of this.getPrevNodeJsNames()) {
			for (const inputName of this.innerNode.getInputJsNames()) {
				a(`\t\t${prevName}.disconnect(${inputName});`)
			}
		}
		for (const prevName of this.getPrevNodeJsNames()) {
			for (const nextName of this.getNextNodeJsNames()) {
				a(`\t\t${prevName}.connect(${nextName});`)
			}
		}
		a(
			`	}`,
			`};`
		)
		return a.e()
	}
	getPreVisJsLines(featureContext,i18n) {
		return this.innerNode.getPreVisJsLines(featureContext,i18n)
	}
	getVisJsLines(featureContext,i18n) {
		return this.innerNode.getVisJsLines(featureContext,i18n)
	}
}

NodeClasses.junction = class extends FilterNode { // special node used as summator/junction
	get type() {
		return 'junction'
	}
	get ctxCreateMethodName() {
		return 'createGain'
	}
	get passive() {
		return true
	}
}

NodeClasses.activeJunction = class extends NodeClasses.junction { // to be inserted between non-fixed i/o nodes
	get passive() {
		return false // can't optimize away (TODO allow parallel merging)
	}
}

NodeClasses.audio = class extends MediaElementNode {
	get type() {
		return 'audio'
	}
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<audio src=${this.options.url} id=${this.elementHtmlName} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></audio>`
		)
	}
}

NodeClasses.video = class extends MediaElementNode {
	get type() {
		return 'video'
	}
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<video src=${this.options.url} id=${this.elementHtmlName} width=${this.options.width} height=${this.options.height} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></video>`
		)
	}
}

NodeClasses.gain = class extends PassiveByDefaultFilterNode {
	get type() {
		return 'gain'
	}
	get ctxCreateMethodName() {
		return 'createGain'
	}
	get nodeProperties() {
		return [
			{
				name:'gain',
				type:'range',
			}
		]
	}
}

NodeClasses.panner = class extends PassiveByDefaultFilterNode {
	get type() {
		return 'panner'
	}
	get ctxCreateMethodName() {
		return 'createStereoPanner'
	}
	get nodeProperties() {
		return [
			{
				name:'pan',
				type:'range',
			}
		]
	}
}

NodeClasses.compressor = class extends FilterNode {
	get type() {
		return 'compressor'
	}
	get ctxCreateMethodName() {
		return 'createDynamicsCompressor'
	}
}

NodeClasses.destination = class extends Node {
	get type() {
		return 'destination'
	}
	get upstreamEffect() {
		return true
	}
	get fixedInput() {
		return true
	}
	get fixedOutput() {
		return true
	}
	get nInputJsNames() {
		return 1
	}
	getInputJsNames() {
		return ['ctx.destination']
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.destination')),
			...this.getPrevNodeJsNames().map(name=>name+".connect(ctx.destination);")
		)
	}
}

module.exports=NodeClasses
