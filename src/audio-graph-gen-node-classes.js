'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const formatNumbers=require('crnx-base/format-numbers')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const RefLines=require('crnx-base/ref-lines')
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
		this.prevNodes=prevNodes
		this.nextNodes=nextNodes
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
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.name+'.'+propertyName
	}
	getPropertyInputJsName(propertyName) {
		return camelCase(this.name+'.'+propertyName+'.input')
	}
}

class SingleNode extends Node { // corresponds to single web audio node
	getOutputs() {
		return [this.nodeJsName]
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.'+this.type)),
			this.getCreateNodeJsLines(featureContext)
		)
	}
	// protected:
	// get type()
	get nodeJsName() {
		return camelCase(this.name+'.node')
	}
	// getCreateNodeJsLines(featureContext)
}

class MediaElementNode extends SingleNode {
	getHtmlLines(featureContext,i18n) {
		return NoseWrapLines.b("<div>","</div>").ae(
			this.getElementHtmlLines(featureContext,i18n)
		)
	}
	// protected:
	get elementHtmlName() {
		return 'my.'+this.name
	}
	getCreateNodeJsLines(featureContext) {
		return JsLines.bae(
			"var "+this.nodeJsName+"=ctx.createMediaElementSource(document.getElementById('"+this.elementHtmlName+"'));"
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
			...this.properties.map(
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
			...this.properties.map(property=>{
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
	// protected:
	get properties() {
		return []
	}
	getCreateNodeJsLines(featureContext) {
		return featureContext.getConnectAssignJsLines(
			"var",this.nodeJsName,
			"ctx."+this.ctxCreateMethodName+"()",
			this.getPrevNodeOutputs()
		)
	}
}

//// concrete classes

GenNode.bypass = class extends Node {  // used when enableInput is set
	constructor(options,name,innerNode,rewireInput,rewireOutput) {
		super(options,name)
		this.innerNode=innerNode
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
	getPreVisJsLines(featureContext,i18n) {
		return this.innerNode.getPreVisJsLines(featureContext,i18n)
	}
	getVisJsLines(featureContext,i18n) {
		return this.innerNode.getVisJsLines(featureContext,i18n)
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
	// protected:
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<audio src=${this.options.url} id=${this.elementHtmlName} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></audio>`
		)
	}
}

GenNode.video = class extends MediaElementNode {
	get type() {
		return 'video'
	}
	// protected:
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<video src=${this.options.url} id=${this.elementHtmlName} width=${this.options.width} height=${this.options.height} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></video>`
		)
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

GenNode.compressor = class extends FilterNode {
	get type() {
		return 'compressor'
	}
	get ctxCreateMethodName() {
		return 'createDynamicsCompressor'
	}
}

GenNode.destination = class extends Node {
	getInputs() {
		return ['ctx.destination']
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.destination')),
			...this.getPrevNodeOutputs().map(name=>name+".connect(ctx.destination);")
		)
	}
}

module.exports=GenNode
