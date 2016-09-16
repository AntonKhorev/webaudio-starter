'use strict'

const Lines=require('crnx-base/lines')

const NodeClasses={}

// abstract classes (not exported)

class Node {
	constructor(options) {
		this.options=options
		this.nextNodes=new Set
		this.prevNodes=new Set
		//this.n=undefined
	}
	get isSource() {
		return false
	}
	get isDestination() {
		return false
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.be()
	}
}

class Source extends Node {
	get isSource() {
		return true
	}
}

class Destination extends Node {
	get isDestination() {
		return true
	}
}

//class Filter extends Node {
//	get isSource() {
//		return false
//	}
//	get isDestination() {
//		return false
//	}
//}

// concrete classes

NodeClasses.audio = class extends Source {
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<audio src=${this.options.url} id=${this.elementHtmlName} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></audio>`
		)
	}
}

NodeClasses.video = class extends Source {
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(
			Lines.html`<video src=${this.options.url} id=${this.elementHtmlName} width=${this.options.width} height=${this.options.height} controls loop crossorigin=${featureContext.audioContext?'anonymous':false}></video>`
		)
	}
}

NodeClasses.destination = Destination

module.exports=NodeClasses
