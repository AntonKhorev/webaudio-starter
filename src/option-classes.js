'use strict'

const Option=Object.create(require('crnx-base/option-classes'))

// differs from webgl-starter:
//	input is a boolean
// 	float subclasses have a fixed precision of 2
//	no speed
//	can specify defaultMin, defaultMax
//	fixed has defaultValue - although it's potentially confusing: user input default vs Web Audio Node property default - they are currently the same
Option.LiveNumber = class extends Option.Number {
	constructor(name,settings,data,path,optionByFullName,updateCallback,makeEntry) {
		let dataValue,dataMin,dataMax,dataInput
		if (typeof data == 'object') {
			dataValue=data.value
			dataMin  =data.min
			dataMax  =data.max
			dataInput=data.input
		} else {
			dataValue=data
		}
		super(...arguments)
		if (settings.defaultMin!==undefined) {
			this.defaultMin=settings.defaultMin
		} else {
			this.defaultMin=this.availableMin
		}
		if (settings.defaultMax!==undefined) {
			this.defaultMax=settings.defaultMax
		} else {
			this.defaultMax=this.availableMax
		}
		this._min=(dataMin!==undefined)?dataMin:this.defaultMin
		this._max=(dataMax!==undefined)?dataMax:this.defaultMax
		this._input=!!dataInput
		this._$range=null
	}
	updateInternalVisibility() {
		if (this._$range) this._$range.toggle(this._input)
	}
	get input() {
		return this._input
	}
	set input(input) {
		this._input=input
		this.updateInternalVisibility()
		this.updateCallback()
	}
	get min() {
		return this._min
	}
	set min(min) {
		this._min=min
		this.updateCallback()
	}
	get max() {
		return this._max
	}
	set max(max) {
		this._max=max
		this.updateCallback()
	}
	get $range() {
		return this._$range
	}
	set $range($range) {
		this._$range=$range
		this.updateInternalVisibility()
	}
	exportHelper(src) {
		const data={}
		if (src.value!=src.defaultValue) data.value=src.value
		if (src.min!=src.availableMin) data.min=src.min
		if (src.max!=src.availableMax) data.max=src.max
		if (src.input) data.input=src.input
		return data
	}
	export() {
		return this.exportHelper(this)
	}
	fix() {
		const fixed=super.fix()
		fixed.min=this.min
		fixed.max=this.max
		fixed.input=this.input
		fixed.defaultValue=this.defaultValue
		return fixed
	}
}

Option.LiveInt = class extends Option.LiveNumber {
	get precision() {
		return 0
	}
}

Option.LiveFloat = class extends Option.LiveNumber {
	get precision() {
		return 2
	}
}

class FixedLiveSelect {
	constructor(src) {
		this.value=src.value
		this.input=src.input
		this.defaultValue=src.defaultValue
		this.availableValues=src.availableValues
		this.name=src.name
	}
	valueOf() {
		return this.value
	}
	toString() {
		return this.value
	}
}

Option.LiveSelect = class extends Option.Select {
	constructor(name,settings,data,path,optionByFullName,updateCallback,makeEntry) {
		let dataValue,dataInput
		if (typeof data == 'object') {
			dataValue=data.value
			dataInput=data.input
		} else {
			dataValue=data
		}
		super(...arguments)
		this._input=!!dataInput
	}
	get input() {
		return this._input
	}
	set input(input) {
		this._input=input
		this.updateCallback()
	}
	export() {
		const data={}
		if (this.value!=this.defaultValue) data.value=this.value
		if (this.input) data.input=this.input
		return data
	}
	fix() {
		return new FixedLiveSelect(this)
	}
}

Option.AnyFloat = class extends Option.NonBoolean {
}

Option.BiquadFilter = class extends Option.Group {
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		settings.descriptions=[
			['LiveSelect','type',[
				'lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch','allpass'
			]],
			['LiveInt','frequency',[0,22050],350,{ unit: 'hertz' }],
			['LiveInt','detune',[0,100],{ unit: '¢' }],
			['LiveFloat','Q',[-4,4],0], // log Q
			['LiveInt','gain',[-30,30],0,{ unit: 'decibel' }],
		]
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
}

Option.IIRFilterCoefs = class extends Option.Array {
}

Option.IIRFilter = class extends Option.Group {
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		settings.descriptions=[
			['IIRFilterCoefs','feedforward',[
				['AnyFloat','b',1],
			]],
			['IIRFilterCoefs','feedback',[
				['AnyFloat','a',1],
			]],
		]
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
}

Option.Filters = class extends Option.Array {
}

module.exports=Option
