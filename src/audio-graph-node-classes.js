'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const formatNumbers=require('crnx-base/format-numbers')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const RefLines=require('crnx-base/ref-lines')
const Feature=require('./feature')

const NodeClasses={}

// abstract classes (not exported)

class Node extends Feature {
	constructor(options) {
		super()
		this.options=options
		// set/modified by graph constructor:
		this.nextNodes=new Set
		this.prevNodes=new Set
		//this.n=undefined
	}
	get nSuffix() {
		if (this.n!==undefined) {
			return '.'+this.n
		} else {
			return ''
		}
	}
	get hasDownstreamEffect() {
		return false // source node
	}
	get hasUpstreamEffect() {
		return false // destination or visualization node
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
}

class SingleNode extends Node { // corresponds to single web audio node
	get nodeJsName() {
		return camelCase(this.type+this.nSuffix+'.node')
	}
	getOutputJsNames() {
		return [this.nodeJsName]
	}
	getJsInitLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.'+this.type)),
			this.getCreateNodeJsLines(featureContext)
		)
	}
	// abstract:
	// get type()
	// getCreateNodeJsLines(featureContext)
}

class MediaElementNode extends SingleNode {
	get hasDownstreamEffect() { return true }
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
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.type+this.nSuffix+'.'+propertyName
	}
	getPropertyInputJsName(propertyName) {
		return camelCase(this.type+this.nSuffix+'.'+propertyName+'.input')
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
							const title=i18n('options.graph.'+this.type+'.'+property.name+'.'+value)
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
	getCreateNodeJsLines(featureContext) {
		return featureContext.getConnectAssignJsLines(
			"var",this.nodeJsName,
			"ctx."+this.ctxCreateMethodName+"()",
			this.getPrevNodeJsNames()
		)
	}
	// abstract:
	// get nodeProperties()
	// get ctxCreateMethodName()
}

// concrete classes

NodeClasses.audio = class extends MediaElementNode {
	get type() { return 'audio' }
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<audio src=${this.options.url} id=${this.elementHtmlName} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></audio>`
		)
	}
}

NodeClasses.video = class extends MediaElementNode {
	get type() { return 'video' }
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<video src=${this.options.url} id=${this.elementHtmlName} width=${this.options.width} height=${this.options.height} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></video>`
		)
	}
}

NodeClasses.gain = class extends FilterNode {
	get type() { return 'gain' }
	get nodeProperties() {
		return [
			{
				name:'gain',
				type:'range',
			}
		]
	}
	get ctxCreateMethodName() { return 'createGain' }
}

NodeClasses.panner = class extends FilterNode {
	get type() { return 'panner' }
	get nodeProperties() {
		return [
			{
				name:'pan',
				type:'range',
			}
		]
	}
	get ctxCreateMethodName() { return 'createStereoPanner' }
}

NodeClasses.destination = class extends Node {
	get hasUpstreamEffect() { return true }
	getJsInitLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.destination')),
			...this.getPrevNodeJsNames().map(name=>name+".connect(ctx.destination);")
		)
	}
}

module.exports=NodeClasses
