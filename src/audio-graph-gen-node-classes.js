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
	constructor(jsName) {
		super()
		this.jsName=jsName
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

//// concrete classes

GenNode.destination = class extends Node {
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
