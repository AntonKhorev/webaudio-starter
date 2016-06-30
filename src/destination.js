'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const RefLines=require('crnx-base/ref-lines')
const Feature=require('./feature')
const Canvas=require('./canvas')

class Destination extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	requestFeatureContext(featureContext) {
		if (!featureContext.audioProcessing) return
		if (this.options.compressor || this.options.waveform.enabled || this.options.frequencies.enabled) {
			featureContext.audioContext=true
		}
		if (this.options.waveform.enabled || this.options.frequencies.enabled) {
			featureContext.canvas=true
		}
	}
	getHtmlLines(featureContext,i18n) {
		const a=NoseWrapLines.b("<div>","</div>")
		if (featureContext.audioProcessing && this.options.compressor) {
			a(
				"<input id=my.compressor type=checkbox checked>",
				Lines.html`<label for=my.compressor>${i18n('label.destination.compressor')}</label>`
			)
		}
		return a.e()
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const a=JsLines.b()
		if (featureContext.audioProcessing && featureContext.audioContext) {
			if (this.options.compressor) {
				let nextNodeJsName=((this.options.waveform.enabled || this.options.frequencies.enabled) ? 'analyserNode' : 'ctx.destination')
				a(
					RefLines.parse("// "+i18n('comment.destination.compressor')),
					"var compressorNode=ctx.createDynamicsCompressor();",
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(compressorNode);")
				)
				if (prevNodeJsNames.length>0) {
					a(
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
					)
				}
				prevNodeJsNames=['compressorNode']
			}
			if (this.options.waveform.enabled || this.options.frequencies.enabled) {
				let comment
				if (!this.options.frequencies.enabled) {
					comment='waveform'
				} else if (!this.options.waveform.enabled) {
					comment='frequencies'
				} else {
					comment='waveform+frequencies'
				}
				a(
					RefLines.parse("// "+i18n('comment.destination.'+comment)),
					"var analyserNode=ctx.createAnalyser();",
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(analyserNode);")
				)
				if (this.options.logFftSize!=11) { // default FFT size is 2048
					a("analyserNode.fftSize="+(Math.pow(2,this.options.logFftSize))+";")
				}
				a(
					"var analyserData=new Uint8Array(analyserNode.frequencyBinCount);",
					""
				)
				prevNodeJsNames=['analyserNode']
			}
			a(
				RefLines.parse("// "+i18n('comment.destination')),
				...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(ctx.destination);")
			)
		}
		return a.e()
	}
	getJsLoopVisLines(featureContext,i18n) {
		const a=JsLines.b()
		if (featureContext.audioProcessing) {
			if (this.options.waveform.enabled) {
				if (this.options.waveform.width!=1.0) {
					a("canvasContext.lineWidth="+this.options.waveform.width+";")
				}
				a(
					Canvas.getStyleLines('strokeStyle',this.options.waveform.color),
					"analyserNode.getByteTimeDomainData(analyserData);",
					"canvasContext.beginPath();",
					"for (var i=0;i<analyserData.length;i++) {",
					"	var x=i*canvas.width/analyserData.length;",
					"	var y=analyserData[i]*canvas.height/256;",
					"	if (i==0) {",
					"		canvasContext.moveTo(x,y);",
					"	} else {",
					"		canvasContext.lineTo(x,y);",
					"	}",
					"}",
					"canvasContext.stroke();"
				)
			}
			if (this.options.frequencies.enabled) {
				let nBars="analyserData.length"
				if (this.options.frequencies.cutoff!=100) {
					a("var nBars=Math.floor(analyserData.length*"+(this.options.frequencies.cutoff/100).toFixed(2)+");")
					nBars="nBars"
				}
				a(
					"var barWidth=canvas.width/"+nBars+"*0.8;",
					"analyserNode.getByteFrequencyData(analyserData);",
					"for (var i=0;i<"+nBars+";i++) {",
					"	var x=i*canvas.width/"+nBars+";",
					"	canvasContext.fillStyle='rgb('+(analyserData[i]+100)+',50,50)';",
					"	var barHeight=analyserData[i]*canvas.height/256;",
					"	canvasContext.fillRect(x,canvas.height-barHeight,barWidth,barHeight);",
					"}"
				)
			}
		}
		return a.e()
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (!featureContext.audioProcessing) return prevNodeJsNames
		if (featureContext.audioContext) {
			return ["ctx.destination"]
		} else {
			return prevNodeJsNames
		}
	}
}

module.exports=Destination
