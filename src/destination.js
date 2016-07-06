'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const InterleaveLines=require('crnx-base/interleave-lines')
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
		if (this.options.compressor.enabled || this.options.waveform.enabled || this.options.frequencies.enabled || this.options.volume.enabled) {
			featureContext.audioContext=true
		}
		if (this.options.waveform.enabled || this.options.frequencies.enabled || this.options.volume.enabled) {
			featureContext.canvas=true
		}
		if (featureContext.connectSampleToJsNames===undefined) {
			if (this.options.compressor.enabled) {
				featureContext.connectSampleToCompressor=true
			}
			if (this.options.waveform.enabled || this.options.frequencies.enabled || this.options.volume.enabled) {
				featureContext.connectSampleToJsNames=["analyserNode"]
			} else {
				featureContext.connectSampleToJsNames=["ctx.destination"]
			}
		}
	}
	getHtmlLines(featureContext,i18n) {
		const a=NoseWrapLines.b("<div>","</div>")
		if (featureContext.audioProcessing && this.options.compressor.enabled) {
			a(
				"<input id=my.compressor type=checkbox checked>",
				Lines.html`<label for=my.compressor>${i18n('label.destination.compressor')}</label>`
			)
		}
		return a.e()
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const getCompressorLines=()=>{
			const a=JsLines.b()
			let nextNodeJsName=((this.options.waveform.enabled || this.options.frequencies.enabled || this.options.volume.enabled) ? 'analyserNode' : 'ctx.destination')
			a(
				RefLines.parse("// "+i18n('comment.destination.compressor')),
				"var compressorNode=ctx.createDynamicsCompressor();",
				...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(compressorNode);")
			)
			if (prevNodeJsNames.length>0) { // TODO make this affect sample playback
				a(
					"document.getElementById('my.compressor').onchange=function(){",
					"	if (this.checked) {",
					...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".disconnect("+nextNodeJsName+");"),
					...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".connect(compressorNode);"),
					"	} else {",
					...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".disconnect(compressorNode);"),
					...prevNodeJsNames.map(prevNodeJsName=>"\t\t"+prevNodeJsName+".connect("+nextNodeJsName+");"),
					"	}",
					"};"
				)
			}
			return a.e()
		}
		const getAnalyserLines=()=>{
			const a=JsLines.b()
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
			if (this.options.analyser.logFftSize!=11) { // default FFT size is 2048
				a("analyserNode.fftSize="+(Math.pow(2,this.options.analyser.logFftSize))+";")
			}
			a(
				"var analyserData=new Uint8Array(analyserNode.frequencyBinCount);"
			)
			return a.e()
		}
		const getDestinationLines=()=>{
			const a=JsLines.b()
			if (prevNodeJsNames.length>0) {
				a(
					RefLines.parse("// "+i18n('comment.destination')),
					...prevNodeJsNames.map(prevNodeJsName=>prevNodeJsName+".connect(ctx.destination);")
				)
			}
			return a.e()
		}
		const a=InterleaveLines.b()
		if (featureContext.audioProcessing && featureContext.audioContext) {
			if (this.options.compressor.enabled) {
				a(getCompressorLines())
				prevNodeJsNames=['compressorNode']
			}
			if (this.options.waveform.enabled || this.options.frequencies.enabled || this.options.volume.enabled) {
				a(getAnalyserLines())
				prevNodeJsNames=['analyserNode']
			}
			a(getDestinationLines())
		}
		return a.e()
	}
	getJsLoopVisLines(featureContext,i18n) {
		if (!featureContext.audioProcessing) return Lines.be()
		const pushAll=(this.options.frequencies.enabled || this.options.volume.enabled) // when fill style is altered
		const pushEach=(this.options.frequencies.enabled && this.options.frequencies.outline.enabled && this.options.waveform.enabled) // when stroke style is altered in two different places
		const a=JsLines.b()
		if (pushAll || pushEach) {
			a("canvasContext.save();")
		}
		if (this.options.volume.enabled) {
			a(
				"analyserNode.getByteFrequencyData(analyserData);", // TODO reuse in frequencies
				"var sumAmplitudes=0;",
				"for (var i=0;i<analyserData.length;i++) {",
				"	sumAmplitudes+=analyserData[i];",
				"}",
				"var meanAmplitude=sumAmplitudes/analyserData.length",
				"var barHeight=meanAmplitude*canvas.height/256;",
				"canvasContext.fillRect(0,canvas.height-barHeight,25,barHeight);"
			)
		}
		if (pushEach) {
			a("canvasContext.restore();")
			a("canvasContext.save();")
		}
		if (this.options.frequencies.enabled) {
			let nBars="analyserData.length"
			if (this.options.frequencies.cutoff!=100) {
				a("var nBars=Math.floor(analyserData.length*"+(this.options.frequencies.cutoff/100).toFixed(2)+");")
				nBars="nBars"
			}
			const y=(this.options.frequencies.base=='bottom'
				? "canvas.height-barHeight"
				: "(canvas.height-barHeight)/2"
			)
			const colorInput=(this.options.frequencies.coloringInput=='amplitude'
				? "analyserData[i]"
				: "Math.round(i*255/"+nBars+")"
			)
			const fillStyle=(this.options.frequencies.coloring=='component'
				? "'rgb('+("+colorInput+"+100)+',50,50)'"
				: "'hsl('+(255-"+colorInput+")+',100%,50%)'"
			)
			a(
				"var barWidth=canvas.width/"+nBars+"*0.8;",
				"analyserNode.getByteFrequencyData(analyserData);",
				"for (var i=0;i<"+nBars+";i++) {",
				"	var x=i*canvas.width/"+nBars+";",
				"	canvasContext.fillStyle="+fillStyle+";",
				"	var barHeight=analyserData[i]*canvas.height/256;",
				"	var y="+y+";",
				"	canvasContext.fillRect(x,y,barWidth,barHeight);",
				"}"
			)
			if (this.options.frequencies.outline.enabled) {
				const writeOutline=y=>JsLines.bae(
					"for (var i=0;i<"+nBars+";i++) {",
					"	var x=i*canvas.width/"+nBars+";",
					"	var barHeight=analyserData[i]*canvas.height/256;",
					"	var y="+y+";",
					"	if (i==0) {",
					"		canvasContext.moveTo(0,y);",
					"	}",
					"	canvasContext.lineTo(x+barWidth/2,y);",
					"	if (i=="+nBars+"-1) {",
					"		canvasContext.lineTo(canvas.width,y);",
					"	}",
					"}"
				)
				if (this.options.frequencies.outline.width!=1.0) {
					a("canvasContext.lineWidth="+this.options.frequencies.outline.width+";")
				}
				a(Canvas.getStyleLines('strokeStyle',this.options.frequencies.outline.color))
				a("canvasContext.beginPath();")
				if (this.options.frequencies.base=='bottom') {
					a(writeOutline(y))
				} else {
					a(NoseWrapLines.b(
						JsLines.bae(";[-1,+1].forEach(function(aboveOrBelow){"),
						JsLines.bae("});")
					).ae(
						writeOutline("(canvas.height+aboveOrBelow*barHeight)/2")
					))
				}
				a("canvasContext.stroke();")
			}
		}
		if (pushEach) {
			a("canvasContext.restore();")
			a("canvasContext.save();")
		}
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
		if (pushAll || pushEach) { // altered fill color
			a("canvasContext.restore();")
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
