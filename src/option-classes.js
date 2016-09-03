'use strict'

const Option=Object.create(require('crnx-base/option-classes'))

// differs from webgl-starter:
//	input is a boolean
// 	float subclasses have a fixed precision of 2
//	no speed
//	can specify defaultMin, defaultMax
//	fixed has defaultValue - although it's potentially confusing: user input default vs Web Audio Node property default - they are currently the same
Option.LiveNumber = class extends Option.Number {
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
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
		this.update()
	}
	get min() {
		return this._min
	}
	set min(min) {
		this._min=min
		this.update()
	}
	get max() {
		return this._max
	}
	set max(max) {
		this._max=max
		this.update()
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
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
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
		this.update()
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
	static typeUsesQ(type) {
		return !!{
			'lowpass': true,
			'highpass': true,
			'bandpass': true,
			'peaking': true,
			'notch': true,
			'allpass': true,
		}[type]
	}
	static typeUsesGain(type) {
		return !!{
			'lowshelf': true,
			'highshelf': true,
			'peaking': true,
		}[type]
	}
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
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
		super(...arguments)
		const type=this.entries[0]
		const Q=this.entries[3]
		const gain=this.entries[4]
		Q.isVisible=()=>(type.input || Option.BiquadFilter.typeUsesQ(type.value))
		gain.isVisible=()=>(type.input || Option.BiquadFilter.typeUsesGain(type.value))
		type.addUpdateCallback(()=>{
			Q.updateVisibility()
			gain.updateVisibility()
		})
	}
}

Option.IIRFilterCoefs = class extends Option.Array {
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
		super(...arguments)
		if (this._entries.length==0) {
			const type=this.availableTypes[0]
			this._entries.push(this.makeEntry(type))
		}
	}
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

Option.EqualizerFilter = class extends Option.Group {
	static get frequencies() {
		return [60,170,350,1000,3500,10000]
	}
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		settings.descriptions=Option.EqualizerFilter.frequencies.map(
			freq=>['LiveInt','gain'+freq,[-30,30],0,{ unit: 'decibel' }]
		)
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
}

Option.Filters = class extends Option.Array {
}

Option.Graph = class extends Option.Collection {
	populateEntries(datas,entries) {
		const subtracts=Array(entries.length)
		let sub=0
		for (let i=0;i<entries.length;i++) {
			sub+=!entries[i]
			subtracts[i]=sub
		}
		this._nodes=[]
		for (let i=0;i<entries.length;i++) {
			const data=datas[i]
			const entry=entries[i]
			if (!entry) continue
			const node={ entry, next:[], x:0, y:0 }
			if (data.x!==undefined) node.x=data.x
			if (data.y!==undefined) node.y=data.y
			if (data.next!==undefined) {
				let next=data.next
				if (!Array.isArray(next)) next=[next]
				for (let j of next) {
					j=parseInt(j)
					if (!entries[j]) continue
					node.next.push(j-subtracts[j])
				}
			}
			this._nodes.push(node)
		}
	}
	map(fn) {
		return this._nodes.map(fn)
	}
	getEntryFromElement(node) {
		return node.entry
	}
	setElementExportData(node,data) {
		if (node.next.length>1) {
			data.next=node.next
		} else if (node.next.length==1) {
			data.next=node.next[0]
		}
		data.x=node.x
		data.y=node.y
	}
	get nodes() {
		return this._nodes
	}
	set nodes(nodes) {
		this._nodes=nodes
		this.update()
	}
}

module.exports=Option
