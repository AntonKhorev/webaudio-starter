'use strict';

const Lines=require('./html-lines.js');
const UnescapedLines=require('crnx-base/lines');
const CollectionFeature=require('./collection-feature.js');

function capitalize(s) {
	return s.charAt(0).toUpperCase()+s.slice(1);
}
function toCamelCase(s) {
	return s.split('.').map((w,i)=>i>0?capitalize(w):w).join('');
}

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
	get nodeJsName() {
		return toCamelCase(this.type+this.nSuffix+'.node');
	}
	getHtmlLines(featureContext,i18n) {
		return this.getElementHtmlLines(featureContext,i18n).wrap("<div>","</div>");
	}
	getJsLines(i18n) {
		return new Lines(
			new UnescapedLines("// "+i18n('options.sources.'+this.type+'.comment')),
			"var "+this.nodeJsName+"=ctx.createMediaElementSource(document.getElementById('"+this.elementHtmlName+"'));"
		);
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
		if (!featureContext.audioContext) {
			return lines;
		}
		lines.interleave(...this.entries.map(entry=>entry.getJsLines(i18n)));
		return lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (featureContext.audioContext) {
			return this.entries.map(entry=>entry.nodeJsName);
		} else {
			return prevNodeJsNames;
		}
	}
}

module.exports=SourceSet;
