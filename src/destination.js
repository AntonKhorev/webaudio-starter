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
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const getAnalyserNodeLines=(jsName,prevNodeJsNames,connectArgs)=>{
			const a=JsLines.b()
			a(featureContext.getJsConnectAssignLines("var",jsName,"ctx.createAnalyser()",prevNodeJsNames,connectArgs))
			if (this.options.analyser.logFftSize!=11) { // default FFT size is 2048
				a(jsName+".fftSize="+(1<<this.options.analyser.logFftSize)+";")
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
