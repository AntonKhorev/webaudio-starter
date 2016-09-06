// TODO remove this module

'use strict'

const Lines=require('crnx-base/lines')
const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
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
	get useDirectAnalyser() {
		return this.options.waveform.enabled || this.options.frequencies.enabled || (this.options.volume.enabled && !this.options.volume.stereo)
	}
	get useSplitAnalyser() {
		return this.options.volume.enabled && this.options.volume.stereo
	}
	requestFeatureContext(featureContext) {
		if (!featureContext.audioProcessing) return
		if (this.options.compressor.enabled || this.options.waveform.enabled || this.options.frequencies.enabled || this.options.volume.enabled) {
			featureContext.audioContext=true
		}
		if (this.options.waveform.enabled || this.options.frequencies.enabled || this.options.volume.enabled) {
			featureContext.canvas=true
		}
		if (this.options.volume.enabled) {
			featureContext.canvasVolumeGradient=true
		}
		if (featureContext.connectSampleToJsNames===undefined) {
			if (this.options.compressor.enabled) {
				featureContext.connectSampleToCompressor=true
			}
			featureContext.connectSampleToJsNames=[]
			if (this.useDirectAnalyser) {
				featureContext.connectSampleToJsNames.push("analyserNode")
			}
			if (this.useSplitAnalyser) {
				featureContext.connectSampleToJsNames.push("channelSplitterNode")
			}
			if (featureContext.connectSampleToJsNames.length==0) {
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
		const getAnalyserNodeLines=(jsName,prevNodeJsNames,connectArgs)=>{
			const a=JsLines.b()
			a(featureContext.getJsConnectAssignLines("var",jsName,"ctx.createAnalyser()",prevNodeJsNames,connectArgs))
			if (this.options.analyser.logFftSize!=11) { // default FFT size is 2048
				a(jsName+".fftSize="+(1<<this.options.analyser.logFftSize)+";")
			}
			return a.e()
		}
		const getCompressorLines=()=>{
			const a=JsLines.b()
			let nextNodeJsName=((this.options.waveform.enabled || this.options.frequencies.enabled || this.options.volume.enabled) ? 'analyserNode' : 'ctx.destination')
			a(
				RefLines.parse("// "+i18n('comment.destination.compressor')),
				featureContext.getJsConnectAssignLines("var","compressorNode","ctx.createDynamicsCompressor()",prevNodeJsNames)
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
					"};"
				)
			}
			return a.e()
		}
		const getDirectAnalyserLines=()=>{
			const a=JsLines.b()
			let comment=''
			if (this.options.waveform.enabled && !this.options.frequencies.enabled) {
				comment='.waveform'
			} else if (!this.options.waveform.enabled && this.options.frequencies.enabled) {
				comment='.frequencies'
			} else if (this.options.waveform.enabled && this.options.frequencies.enabled) {
				comment='.waveform+frequencies'
			}
			a(
				RefLines.parse("// "+i18n('comment.destination.analyser'+comment)),
				getAnalyserNodeLines("analyserNode",prevNodeJsNames),
				"var analyserData=new Uint8Array(analyserNode.frequencyBinCount);"
			)
			return a.e()
		}
		const getSplitAnalyserLines=()=>{
			const a=JsLines.b()
			a(
				RefLines.parse("// "+i18n('comment.destination.analyser.split')),
				featureContext.getJsConnectAssignLines("var","channelSplitterNode","ctx.createChannelSplitter()",prevNodeJsNames),
				getAnalyserNodeLines("leftAnalyserNode",["channelSplitterNode"],"0"),
				getAnalyserNodeLines("rightAnalyserNode",["channelSplitterNode"],"1")
			)
			if (!this.useDirectAnalyser) { // need to create analyserData once
				a("var analyserData=new Uint8Array(leftAnalyserNode.frequencyBinCount);")
			}
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
			if (this.useDirectAnalyser || this.useSplitAnalyser) {
				if (this.useDirectAnalyser) {
					a(getDirectAnalyserLines())
				}
				if (this.useSplitAnalyser) {
					a(getSplitAnalyserLines())
				}
				if (this.useDirectAnalyser) {
					prevNodeJsNames=['analyserNode']
				}
				// split analyser doesn't change prevNodeJsNames b/c its output is not connected to anything
			}
			a(getDestinationLines())
		}
		return a.e()
	}
	get pushContextForEach() { // when stroke style is altered in two different places
		return this.options.frequencies.enabled && this.options.frequencies.outline.enabled && this.options.waveform.enabled
	}
	get pushContextForAll() { // when fill style is altered and not pushing for each
		return !this.pushContextForEach && (this.options.frequencies.enabled || this.options.volume.enabled)
	}
	getJsLoopPreLines(featureContext,i18n) {
		if (!featureContext.audioProcessing) return Lines.be()
		const getEnterFunctionLines=()=>{
			if (this.pushContextForEach) {
				return JsLines.bae("canvasContext.save();")
			} else {
				return Lines.be()
			}
		}
		const getExitFunctionLines=()=>{
			if (this.pushContextForEach) {
				return JsLines.bae("canvasContext.restore();")
			} else {
				return Lines.be()
			}
		}
		const getVisualizeVolumeLines=()=>{
			const getVolumeMeterLines=(analyserNodeJsName,xOffset)=>{
				return JsLines.bae(
					analyserNodeJsName+".getByteFrequencyData(analyserData);", // TODO reuse in frequencies when in non-stereo mode
					"var sumAmplitudes=0;",
					"for (var i=0;i<analyserData.length;i++) {",
					"	sumAmplitudes+=analyserData[i];",
					"}",
					"var meanAmplitude=sumAmplitudes/analyserData.length;",
					"var barHeight=meanAmplitude*canvas.height/256;",
					"canvasContext.fillStyle=canvasVolumeGradient;",
					"canvasContext.fillRect("+xOffset+",canvas.height-barHeight,25,barHeight);"
				)
			}
			if (!this.options.volume.stereo) {
				return getVolumeMeterLines("analyserNode","0")
			} else {
				return WrapLines.b(
					JsLines.bae(";[leftAnalyserNode,rightAnalyserNode].forEach(function(channelAnalyserNode,channelNumber){"),
					JsLines.bae("});")
				).ae(
					getVolumeMeterLines("channelAnalyserNode","channelNumber*26")
				)
			}
		}
		const getVisualizeFrequenciesLines=()=>{
			const a=JsLines.b()
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
					a(WrapLines.b(
						JsLines.bae(";[-1,+1].forEach(function(aboveOrBelow){"),
						JsLines.bae("});")
					).ae(
						writeOutline("(canvas.height+aboveOrBelow*barHeight)/2")
					))
				}
				a("canvasContext.stroke();")
			}
			return a.e()
		}
		const getVisualizeWaveformLines=()=>{
			const a=JsLines.b()
			if (this.options.waveform.width!=1.0) {
				a("canvasContext.lineWidth="+this.options.waveform.width+";")
			}
			a(
				Canvas.getStyleLines('strokeStyle',this.options.waveform.color),
				"analyserNode.getByteTimeDomainData(analyserData);",
				"canvasContext.beginPath();",
				"for (var i=0;i<analyserData.length;i++) {",
				"	var x=i*canvas.width/(analyserData.length-1);",
				"	var y=analyserData[i]*canvas.height/256;",
				"	if (i==0) {",
				"		canvasContext.moveTo(x,y);",
				"	} else {",
				"		canvasContext.lineTo(x,y);",
				"	}",
				"}",
				"canvasContext.stroke();"
			)
			return a.e()
		}
		return JsLines.bae(...[
			[this.options.volume.enabled,'visualizeVolume',getVisualizeVolumeLines],
			[this.options.frequencies.enabled,'visualizeFrequencies',getVisualizeFrequenciesLines],
			[this.options.waveform.enabled,'visualizeWaveform',getVisualizeWaveformLines],
		].map(conditionAndNameAndFn=>{
			const condition=conditionAndNameAndFn[0]
			const name=conditionAndNameAndFn[1]
			const fn=conditionAndNameAndFn[2]
			if (condition) {
				return WrapLines.b(
					JsLines.bae("function "+name+"() {"),
					JsLines.bae("}")
				).ae(
					getEnterFunctionLines(),
					fn(),
					getExitFunctionLines()
				)
			} else {
				return Lines.be()
			}
		}))
	}
	getJsLoopVisLines(featureContext,i18n) {
		if (!featureContext.audioProcessing) return Lines.be()
		const a=JsLines.b()
		if (this.pushContextForAll) {
			a("canvasContext.save();")
		}
		if (this.options.volume.enabled) {
			a("visualizeVolume();")
		}
		if (this.options.frequencies.enabled) {
			a("visualizeFrequencies();")
		}
		if (this.options.waveform.enabled) {
			a("visualizeWaveform();")
		}
		if (this.pushContextForAll) {
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
