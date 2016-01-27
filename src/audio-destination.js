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
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(compressorNode);"),
					"compressorNode.connect(ctx.destination);",
					"document.getElementById('my.compressor').onchange=function(){",
					"	if (this.checked) {",
					...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".disconnect(ctx.destination);"),
					...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".connect(compressorNode);"),
					"	} else {",
					...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".disconnect(compressorNode);"),
					...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".connect(ctx.destination);"),
					"	}",
					"};"
				);
			} else {
				lines.a(
					"// "+i18n('options.destination.comment'),
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(ctx.destination);")
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
