'use strict';

const Lines=require('./html-lines.js');
const UnescapedLines=require('crnx-base/lines');
const Feature=require('./feature.js');

class Destination extends Feature {
	constructor(options) {
		super();
		this.options=options;
	}
	requestFeatureContext(featureContext) {
		if (this.options.compressor || this.options.waveform) {
			featureContext.audioContext=true;
		}
		if (this.options.waveform) {
			featureContext.canvas=true;
		}
	}
	getHtmlLines(featureContext,i18n) {
		const lines=new Lines;
		if (this.options.compressor) {
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
			if (this.options.compressor) {
				lines.a(
					new UnescapedLines("// "+i18n('options.destination.compressor.comment')),
					"var compressorNode=ctx.createDynamicsCompressor();",
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(compressorNode);")
				);
				if (prevNodeJsNames.length>0) {
					lines.a(
						"document.getElementById('my.compressor').onchange=function(){",
						"	if (this.checked) {",
						...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".disconnect(ctx.destination);"),
						...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".connect(compressorNode);"),
						"	} else {",
						...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".disconnect(compressorNode);"),
						...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".connect(ctx.destination);"),
						"	}",
						"};",
						""
					);
				}
				prevNodeJsNames=['compressorNode'];
			}
			if (this.options.waveform) {
				lines.a(
					new UnescapedLines("// "+i18n('options.destination.waveform.comment')),
					"var analyserNode=ctx.createAnalyser();",
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(analyserNode);"),
					"analyserNode.fftSize=1024;",
					"var analyserData=new Uint8Array(analyserNode.frequencyBinCount);",
					""
				);
				prevNodeJsNames=['analyserNode'];
			}
			lines.a(
				new UnescapedLines("// "+i18n('options.destination.comment')),
				...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(ctx.destination);")
			);
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

module.exports=Destination;
