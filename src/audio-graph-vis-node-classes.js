'use strict'

// classes like GenNodes, but w/o inputs/outputs; to be aggregated by GenNode.analyser

const JsLines=require('crnx-base/js-lines')
const WrapLines=require('crnx-base/wrap-lines')
const Feature=require('./feature')
const CanvasContext=require('./canvas-context')

class VisFunction {
	constructor() {
		this.data={}
	}
	addArgValues(...values) {
		for (let i=0;i<values.length;i++) {
			const arg=this.args[i]
			const value=values[i]
			if (this.data[arg]===undefined) {
				this.data[arg]=value
			} else if (!Array.isArray(this.data[arg]) && this.data[arg]!=value) {
				this.data[arg]=[]
			}
		}
	}
	getArgValue(arg) {
		if (Array.isArray(this.data[arg])) {
			return arg
		} else {
			return this.data[arg]
		}
	}
	getTernaryOpArgValue(arg,cases) {
		const argValue=this.getArgValue(arg)
		for (const [caseArgValue,caseResultValue] of cases) {
			if (`'${caseArgValue}'`==argValue) {
				return caseResultValue
			}
		}
		return `(${arg}=='${cases[0][0]}' ? ${cases[0][1]} : ${cases[1][1]})`
	}
	getConditionalArgLines(arg,cases) {
		const argValue=this.getArgValue(arg)
		for (const [caseArgValue,caseResultLines] of cases) {
			if (`'${caseArgValue}'`==argValue) {
				return caseResultLines
			}
		}
		return WrapLines.b(
			JsLines.bae(`if (${arg}=='${cases[0][0]}') {`),
			JsLines.bae(`} else {`),
			JsLines.bae(`}`)
		).ae(
			cases[0][1],
			cases[1][1]
		)
	}
	getDeclJsLines(canvasContext) {
		const declArgs=[]
		for (let i=0;i<this.args.length;i++) {
			if (Array.isArray(this.data[this.args[i]])) {
				declArgs.push(this.args[i])
			}
		}
		return WrapLines.b(
			JsLines.bae("function "+this.name+"("+declArgs.join()+") {"),
			JsLines.bae("}")
		).ae(
			this.getBodyJsLines(canvasContext)
		)
	}
	getCallJsLines(...values) {
		const passValues=[]
		for (let i=0;i<values.length;i++) {
			if (Array.isArray(this.data[this.args[i]])) {
				passValues.push(values[i])
			}
		}
		return JsLines.bae(
			this.name+"("+passValues.join()+");"
		)
	}
	// get name()
	// get args()
	// getBodyJsLines(canvasContext)
}

class WaveformVisFunction extends VisFunction {
	get name() {
		return 'visualizeWaveform'
	}
	get args() {
		return ['analyserNode','waveformWidth','waveformColor']
	}
	getBodyJsLines(canvasContext) {
		const analyserNode=this.getArgValue('analyserNode')
		const a=canvasContext.b()
		a(
			a.setProp('lineWidth',this.getArgValue('waveformWidth')),
			a.setProp('strokeStyle',this.getArgValue('waveformColor')),
			`${analyserNode}.getByteTimeDomainData(analyserData);`,
			`${a.jsName}.beginPath();`,
			`for (var i=0;i<${analyserNode}.frequencyBinCount;i++) {`,
			`	var x=i*canvas.width/(${analyserNode}.frequencyBinCount-1);`,
			`	var y=analyserData[i]*canvas.height/256;`,
			`	if (i==0) {`,
			`		${a.jsName}.moveTo(x,y);`,
			`	} else {`,
			`		${a.jsName}.lineTo(x,y);`,
			`	}`,
			`}`,
			`${a.jsName}.stroke();`
		)
		return a.e()
	}
}

class FrequencyBarsVisFunction extends VisFunction {
	get name() {
		return 'visualizeFrequencyBars'
	}
	get args() {
		return ['analyserNode','frequencyCutoff','barsBase','barsColoring','barsColoringInput']
	}
	getBodyJsLines(canvasContext) {
		const analyserNode=this.getArgValue('analyserNode')
		const frequencyCutoff=this.getArgValue('frequencyCutoff')
		const a=canvasContext.b()
		let nBars=`${analyserNode}.frequencyBinCount`
		if (frequencyCutoff!=100) {
			a(`var nBars=Math.floor(${nBars}*${(frequencyCutoff/100).toFixed(2)});`)
			nBars="nBars"
		}
		const y=this.getTernaryOpArgValue('barsBase',[
			['bottom',`canvas.height-barHeight`],
			['middle',`(canvas.height-barHeight)/2`],
		])
		const colorInput=this.getTernaryOpArgValue('barsColoringInput',[
			['amplitude',`analyserData[i]`],
			['frequency',`Math.round(i*255/${nBars})`],
		])
		const fillStyle=this.getTernaryOpArgValue('barsColoring',[
			['component',`'rgb('+(${colorInput}+100)+',50,50)'`],
			['spectral',`'hsl('+(255-${colorInput})+',100%,50%)'`],
		])
		a.setProp('fillStyle',fillStyle) // throwaway setProp to force style save/restore
		a(
			`var barWidth=canvas.width/${nBars}*0.8;`,
			`${analyserNode}.getByteFrequencyData(analyserData);`,
			`for (var i=0;i<${nBars};i++) {`,
			`	var x=i*canvas.width/${nBars};`,
			`	${a.jsName}.fillStyle=${fillStyle};`,
			`	var barHeight=analyserData[i]*canvas.height/256;`,
			`	var y=${y};`,
			`	${a.jsName}.fillRect(x,y,barWidth,barHeight);`,
			`}`
		)
		return a.e()
	}
}

class FrequencyOutlineVisFunction extends VisFunction {
	get name() {
		return 'visualizeFrequencyOutline'
	}
	get args() {
		return ['analyserNode','frequencyCutoff','outlineBase','outlineWidth','outlineColor']
	}
	getBodyJsLines(canvasContext) {
		// TODO remove residual "bars" naming
		// { copypaste from bars
		const analyserNode=this.getArgValue('analyserNode')
		const frequencyCutoff=this.getArgValue('frequencyCutoff')
		const a=canvasContext.b()
		let nBars=`${analyserNode}.frequencyBinCount`
		if (frequencyCutoff!=100) {
			a(`var nBars=Math.floor(${nBars}*${(frequencyCutoff/100).toFixed(2)});`)
			nBars="nBars"
		}
		// }
		const getOutlineLines=y=>JsLines.bae(
			`for (var i=0;i<${nBars};i++) {`,
			`	var x=i*canvas.width/${nBars};`,
			`	var barHeight=analyserData[i]*canvas.height/256;`,
			`	var y=${y};`,
			`	if (i==0) {`,
			`		${a.jsName}.moveTo(0,y);`,
			`	}`,
			`	${a.jsName}.lineTo(x+barWidth/2,y);`,
			`	if (i==${nBars}-1) {`,
			`		${a.jsName}.lineTo(canvas.width,y);`,
			`	}`,
			`}`
		)
		a(
			a.setProp('lineWidth',this.getArgValue('outlineWidth')),
			a.setProp('strokeStyle',this.getArgValue('outlineColor')),
			`var barWidth=canvas.width/${nBars}*0.8;`,
			`${analyserNode}.getByteFrequencyData(analyserData);`, // TODO optimize out repeated calls to analyser
			`${a.jsName}.beginPath();`,
			this.getConditionalArgLines('outlineBase',[ // TODO if-else case is too verbose, make another function to shorten it
				['bottom',getOutlineLines(`canvas.height-barHeight`)],
				['middle',WrapLines.b(
					JsLines.bae(`;[-1,+1].forEach(function(aboveOrBelow){`),
					JsLines.bae(`});`)
				).ae(
					getOutlineLines(`(canvas.height+aboveOrBelow*barHeight)/2`)
				)],
			]),
			`${a.jsName}.stroke();`
		)
		return a.e()
	}
}

const VisNode={}

//// abstract classes (not exported)

class Node extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
	initParent(analyserNodeJsName) {
		this.analyserNodeJsName=analyserNodeJsName
	}
	requestFeatureContext(featureContext) {
		if (featureContext[this.featureContextProp]===undefined) {
			featureContext[this.featureContextProp]=this.makeVisFunction()
		}
		featureContext[this.featureContextProp].addArgValues(...this.listVisFunctionArgValues())
	}
	getVisJsLines(featureContext,i18n) {
		return featureContext[this.featureContextProp].getCallJsLines(...this.listVisFunctionArgValues())
	}
	// protected:
	// get featureContextProp()
	// makeVisFunction()
	// listVisFunctionArgValues()
}

//// concrete classes

VisNode.waveform = class extends Node {
	get featureContextProp() {
		return 'visualizeWaveformFn'
	}
	makeVisFunction() {
		return new WaveformVisFunction()
	}
	listVisFunctionArgValues() {
		return [
			this.analyserNodeJsName,
			this.options.width.value,
			CanvasContext.getColorStyle(this.options.color)
		]
	}
}

VisNode.frequencyBars = class extends Node {
	get featureContextProp() {
		return 'visualizeFrequencyBarsFn'
	}
	makeVisFunction() {
		return new FrequencyBarsVisFunction()
	}
	listVisFunctionArgValues() {
		return [
			this.analyserNodeJsName,
			this.options.cutoff.value,
			"'"+this.options.base+"'",
			"'"+this.options.coloring+"'",
			"'"+this.options.coloringInput+"'"
		]
	}
}

VisNode.frequencyOutline = class extends Node {
	get featureContextProp() {
		return 'visualizeFrequencyOutlineFn'
	}
	makeVisFunction() {
		return new FrequencyOutlineVisFunction()
	}
	listVisFunctionArgValues() {
		return [
			this.analyserNodeJsName,
			this.options.cutoff.value,
			"'"+this.options.base+"'",
			this.options.width.value,
			CanvasContext.getColorStyle(this.options.color)
		]
	}
}

module.exports=VisNode
