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
			const a=JsLines.b()
			a(
				RefLines.parse("// "+i18n('comment.sources.'+this.type)),
				"loadSample('"+this.options.url+"',function(buffer){",
				"	var button=document.getElementById('"+this.elementHtmlName+"');",
				"	button.onclick=function(){",
				"		var bufferSourceNode=ctx.createBufferSource();",
				"		bufferSourceNode.buffer=buffer;",
				"		bufferSourceNode.connect(ctx.destination);", // TODO connect to first filter
				"		bufferSourceNode.start();",
				"	}",
				"	button.disabled=false;",
				"	document.getElementById('"+messageHtmlName+"').textContent='';",
				"}"
			)
			if (featureContext.loaderOnError) {
				a.t(
					",function(){",
					"	document.getElementById('"+messageHtmlName+"').textContent='"+i18n('options.sources.sample.buffer.error')+"';",
					"}"
				)
			}
			a.t(
				");"
			)
			return a.e()
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
		if (featureContext.audioContext) {
			return this.entries.map(entry=>entry.nodeJsName)
		} else {
			return prevNodeJsNames
		}
	}
}

module.exports=SourceSet
