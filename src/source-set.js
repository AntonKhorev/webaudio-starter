'use strict';

const Lines=require('crnx-base/lines');
const CollectionFeature=require('./collection-feature.js');

class Source {
	constructor(options,n) {
		this.options=options;
		this.n=n;
	}
	get nSuffix() {
		if (this.n!==undefined) {
			return '.'+this.n;
		} else {
			return '';
		}
	}
	get elementHtmlName() {
		return 'my.'+this.type+this.nSuffix;
	}
	getHtmlLines(featureContext,i18n) {
		return this.getElementHtmlLines(featureContext,i18n).wrap("<div>","</div>");
	}
	// abstract:
	// get type()
	// getElementHtmlLines(featureContext,i18n) // TODO html escape
}

const sourceClasses={
	audio: class extends Source {
		get type() { return 'audio'; }
		getElementHtmlLines(featureContext,i18n) {
			return new Lines(
				"<audio src='"+this.options.url+"' id='"+this.elementHtmlName+"' controls loop"+(featureContext.audioContext?" crossorigin='anonymous'":"")+"></audio>"
			);
		}
	},
	video: class extends Source {
		get type() { return 'video'; }
		getElementHtmlLines(featureContext,i18n) {
			return new Lines(
				"<video src='"+this.options.url+"' id='"+this.elementHtmlName+"' width='"+this.options.width+"' height='"+this.options.height+"' controls loop"+(featureContext.audioContext?" crossorigin='anonymous'":"")+"></video>"
			);
		}
	},
};

class SourceSet extends CollectionFeature {
	getEntryClass(entryOption) {
		return sourceClasses[entryOption.source];
	}
	getJsLines(featureContext,i18n,prevNodeJsNames) {
		const lines=super.getJsLines(...arguments);
		if (featureContext.audioContext) {
			lines.a(
				"// "+i18n('options.source.comment'),
				"var ctx=new (AudioContext || webkitAudioContext);",
				"var sourceElement=document.getElementById('my.source');",
				"var sourceNode=ctx.createMediaElementSource(sourceElement);"
			);
		}
		return lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (featureContext.audioContext) {
			return ["sourceNode"];
		} else {
			return prevNodeJsNames;
		}
	}
}

module.exports=SourceSet;
