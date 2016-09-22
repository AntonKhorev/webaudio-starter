'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const RefLines=require('crnx-base/ref-lines')

const NodeClasses={}

// abstract classes (not exported)

class Node {
	constructor(options) {
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
	getHtmlLines(featureContext,i18n) {
		return Lines.be()
	}
	getJsInitLines(featureContext,i18n) {
		return Lines.be()
	}
}

//class Source extends Node {
//	get isSource() {
//		return true
//	}
//}
//
//class Destination extends Node {
//	get isDestination() {
//		return true
//	}
//}

//class Filter extends Node {
//	get isSource() {
//		return false
//	}
//	get isDestination() {
//		return false
//	}
//}

class SingleAudioNode extends Node { // corresponds to single web audio node
	get nodeJsName() {
		return camelCase(this.type+this.nSuffix+'.node')
	}
	getOutputJsNames() {
		return [this.nodeJsName]
	}
	getJsInitLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.'+this.type)),
			featureContext.getJsConnectAssignLines(
				"var",this.nodeJsName,
				"ctx."+this.ctxCreateMethodName+"()",
				this.getPrevNodeJsNames()
			)
		)
	}
}

// concrete classes

NodeClasses.audio = class extends SingleAudioNode {
	get hasDownstreamEffect() { return true }
	get type() { return 'audio' }
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<audio src=${this.options.url} id=${this.elementHtmlName} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></audio>`
		)
	}
}

NodeClasses.video = class extends SingleAudioNode {
	get hasDownstreamEffect() { return true }
	get type() { return 'video' }
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<video src=${this.options.url} id=${this.elementHtmlName} width=${this.options.width} height=${this.options.height} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></video>`
		)
	}
}

NodeClasses.gain = class extends SingleAudioNode {
	get type() { return 'gain' }
	get ctxCreateMethodName() { return 'createGain' }
}

NodeClasses.panner = class extends SingleAudioNode {
	get type() { return 'panner' }
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
