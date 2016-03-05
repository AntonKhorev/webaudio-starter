'use strict'

const camelCase=require('crnx-base/fake-lodash/camelcase')
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
	getJsInitLines(i18n) {
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
}

class SourceSet extends CollectionFeature {
	getEntryClass(entryOption) {
		return sourceClasses[entryOption.source]
	}
	requestFeatureContext(featureContext) {
		if (this.entries.length>0) {
			featureContext.audioProcessing=true
		}
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const a=InterleaveLines.b()
		if (featureContext.audioContext) {
			a(...this.entries.map(entry=>entry.getJsInitLines(i18n)))
		}
		return a.e()
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (featureContext.audioContext) {
			return this.entries.map(entry=>entry.nodeJsName)
		} else {
			return prevNodeJsNames
		}
	}
}

module.exports=SourceSet
