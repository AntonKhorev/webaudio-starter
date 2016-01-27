'use strict';

const Lines=require('../base/lines.js');
const Feature=require('./feature.js');

class AudioDestination extends Feature {
	constructor(options) {
		super();
		this.compressor=options.compressor;
	}
	requestFeatureContext(featureContext) {
		if (this.compressor) {
			featureContext.audioContext=true;
		}
	}
	getHtmlLines(featureContext,i18n) {
		const lines=new Lines;
		if (this.compressor) {
			lines.a(
				"<input id='my.compressor' type='checkbox' checked />",
				"<label for='my.compressor'>"+i18n('options.destination.compressor.enable')+"</label>"
			);
		}
		return lines.wrapIfNotEmpty("<div>","</div>");
	}
	getJsLines(featureContext,i18n,prevNodeJsNames) {
		const lines=super.getJsLines(...arguments);
		if (featureContext.audioContext) {
			if (this.compressor) {
				lines.a(
					"// "+i18n('options.destination.compressor.comment'),
					"var compressorNode=ctx.createDynamicsCompressor();",
					...prevNodeJsNames.map(prevNodeJsNames=>prevNodeJsNames+".connect(compressorNode);"),
					"compressorNode.connect(ctx.destination);"
				);
			} else {
				lines.a(
					"// "+i18n('options.destination.comment'),
					...prevNodeJsNames.map(prevNodeJsNames=>prevNodeJsNames+".connect(ctx.destination);")
				);
			}
		}
		return lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (featureContext.audioContext) {
			return ["ctx.destination"];
		} else {
			return prevNodeJsNames;
		}
	}
}

module.exports=AudioDestination;
