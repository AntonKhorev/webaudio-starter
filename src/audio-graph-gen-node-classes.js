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
	constructor(name) {
		super()
		this.name=name
		// set those before calling any public methods:
		//this.prevNodes=prevNodes // array of nodes
		//this.nextNodes=nextNodes // array of nodes
	}
	// public:
	// get type()
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
	getNextNodeJsNames() {
		const names=[]
		this.nextNodes.forEach(node=>{
			names.push(...node.getInputJsNames())
		})
		return names
	}
}

class RequestedNode extends Node {
	constructor(name,options) {
		super(name)
		this.options=options
	}
}

//// concrete classes

GenNode.audio = class extends RequestedNode {
	get type() {
		return 'audio'
	}
	getOutputs() {
		return [this.nodeJsName]
	}
	getHtmlLines(featureContext,i18n) {
		return NoseWrapLines.b("<div>","</div>").ae(
			this.getElementHtmlLines(featureContext,i18n)
		)
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.'+this.type)),
			this.getCreateNodeJsLines(featureContext)
		)
	}
	// protected:
	get nodeJsName() {
		return camelCase(this.name+'.node')
	}
	get elementHtmlName() {
		return 'my.'+this.name
	}
	getElementHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<audio src=${this.options.url} id=${this.elementHtmlName} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></audio>`
		)
	}
	getCreateNodeJsLines(featureContext) {
		return JsLines.bae(
			"var "+this.nodeJsName+"=ctx.createMediaElementSource(document.getElementById('"+this.elementHtmlName+"'));"
		)
	}
}

GenNode.destination = class extends RequestedNode {
	get type() {
		return 'destination'
	}
	getInputs() {
		return ['ctx.destination']
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.destination')),
			...this.getPrevNodeJsNames().map(name=>name+".connect(ctx.destination);")
		)
	}
}

module.exports=GenNode
