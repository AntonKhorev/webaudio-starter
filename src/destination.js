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
		if (!featureContext.audioSource) return;
		if (this.options.compressor || this.options.waveform) {
			featureContext.audioContext=true;
		}
		if (this.options.waveform) {
			featureContext.canvas=true;
		}
	}
	getHtmlLines(featureContext,i18n) {
		if (!featureContext.audioSource) return new Lines;
		const lines=new Lines;
		if (this.options.compressor) {
			lines.a(
				"<input id='my.compressor' type='checkbox' checked />",
				"<label for='my.compressor'>"+i18n('options.destination.compressor.enable')+"</label>"
			);
		}
		return lines.wrapIfNotEmpty("<div>","</div>");
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		if (!featureContext.audioSource) return new Lines;
		const lines=super.getJsInitLines(...arguments);
		if (featureContext.audioContext) {
			if (this.options.compressor) {
				let nextNodeJsName=(this.options.waveform ? 'analyserNode' : 'ctx.destination');
				lines.a(
					new UnescapedLines("// "+i18n('comment.destination.compressor')),
					"var compressorNode=ctx.createDynamicsCompressor();",
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(compressorNode);")
				);
				if (prevNodeJsNames.length>0) {
					lines.a(
						"document.getElementById('my.compressor').onchange=function(){",
						"	if (this.checked) {",
						...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".disconnect("+nextNodeJsName+");"),
						...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".connect(compressorNode);"),
						"	} else {",
						...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".disconnect(compressorNode);"),
						...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".connect("+nextNodeJsName+");"),
						"	}",
						"};",
						""
					);
				}
				prevNodeJsNames=['compressorNode'];
			}
			if (this.options.waveform) {
				// TODO need to connect to analyser instead of ctx.destination in event listener above
				lines.a(
					new UnescapedLines("// "+i18n('comment.destination.waveform')),
					"var analyserNode=ctx.createAnalyser();",
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(analyserNode);"),
					"analyserNode.fftSize=1024;",
					"var analyserData=new Uint8Array(analyserNode.frequencyBinCount);",
					""
				);
				prevNodeJsNames=['analyserNode'];
			}
			lines.a(
				new UnescapedLines("// "+i18n('comment.destination')),
				...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(ctx.destination);")
			);
		}
		return lines;
	}
	getJsLoopLines(featureContext,i18n) {
		if (!featureContext.audioSource) return new Lines;
		const lines=super.getJsLoopLines(...arguments);
		if (this.options.waveform) {
			lines.a(
				"analyserNode.getByteTimeDomainData(analyserData);",
				"canvasContext.clearRect(0,0,canvas.width,canvas.height);",
				"canvasContext.beginPath();",
				"for (var i=0;i<analyserData.length;i++) {",
				"	var x=i*canvas.width/analyserData.length;",
				"	var y=analyserData[i]*canvas.height/255;",
				"	if (i==0) {",
				"		canvasContext.moveTo(x,y);",
				"	} else {",
				"		canvasContext.lineTo(x,y);",
				"	}",
				"}",
				"canvasContext.stroke();"
			);
		}
		return lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (!featureContext.audioSource) return prevNodeJsNames;
		if (featureContext.audioContext) {
			return ["ctx.destination"];
		} else {
			return prevNodeJsNames;
		}
	}
}

module.exports=Destination;
