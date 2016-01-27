'use strict';

const Option=Object.create(require('../base/option-classes.js'));

// differs from webgl-starter:
//	has defaultValue - although it's potentially confusing: user input default vs Web Audio Node property default - they are currently the same
//	no setToDefault, which is needed only if speed is present
//	name is set, b/c it wasn't needed only for speed
class FixedLiveNumber {
	constructor(src) {
		this.value=src.value;
		this.min=src.min;
		this.max=src.max;
		this.input=src.input;
		this.defaultValue=src.defaultValue;
		this.availableMin=src.availableMin;
		this.availableMax=src.availableMax;
		this.step=src.step;
		this.name=src.name;
	}
	valueOf() {
		return this.value;
	}
	toString() {
		return String(this.value);
	}
}

// differs from webgl-starter:
//	input is a boolean
// 	float subclasses have a fixed step of 0.01
//	no speed
//	has range specified as [availableMin,availableMax,defaultMin,defaultMax]
Option.LiveNumber = class extends Option.RangeInput {
	constructor(name,availableRange,defaultValue,data,fullName,isVisible,updateCallback) {
		let dataValue,dataMin,dataMax,dataInput;
		if (typeof data == 'object') {
			dataValue=data.value;
			dataMin  =data.min;
			dataMax  =data.max;
			dataInput=data.input;
		} else {
			dataValue=data;
		}
		super(name,availableRange,defaultValue,dataValue,fullName,isVisible,updateCallback);
		this._min=(dataMin!==undefined)?dataMin:(availableRange[2]!==undefined?availableRange[2]:this.availableMin);
		this._max=(dataMax!==undefined)?dataMax:(availableRange[3]!==undefined?availableRange[3]:this.availableMax);
		this._input=!!dataInput;
		this._$range=null;
	}
	updateInternalVisibility() {
		if (this._$range) this._$range.toggle(this._input);
	}
	get input() {
		return this._input;
	}
	set input(input) {
		this._input=input;
		this.updateInternalVisibility();
		this.updateCallback();
	}
	get min() {
		return this._min;
	}
	set min(min) {
		this._min=min;
		this.updateCallback();
	}
	get max() {
		return this._max;
	}
	set max(max) {
		this._max=max;
		this.updateCallback();
	}
	get $range() {
		return this._$range;
	}
	set $range($range) {
		this._$range=$range;
		this.updateInternalVisibility();
	}
	exportHelper(src) {
		const data={};
		if (src.value!=src.defaultValue) data.value=src.value;
		if (src.min!=src.availableMin) data.min=src.min;
		if (src.max!=src.availableMax) data.max=src.max;
		if (src.input) data.input=src.input;
		return data;
	}
	export() {
		return this.exportHelper(this);
	}
	fix() {
		return new FixedLiveNumber(this);
	}
};

Option.LiveInt = class extends Option.LiveNumber {
	get step() {
		return 1;
	}
};

Option.LiveFloat = class extends Option.LiveNumber {
	get step() {
		return 0.01;
	}
};

class FixedLiveSelect {
	constructor(src) {
		this.value=src.value;
		this.input=src.input;
		this.defaultValue=src.defaultValue;
		this.availableValues=src.availableValues;
		this.name=src.name;
	}
	valueOf() {
		return this.value;
	}
	toString() {
		return this.value;
	}
}

Option.LiveSelect = class extends Option.Select {
	constructor(name,availableValues,defaultValue,data,fullName,isVisible,updateCallback) {
		let dataValue,dataInput;
		if (typeof data == 'object') {
			dataValue=data.value;
			dataInput=data.input;
		} else {
			dataValue=data;
		}
		super(name,availableValues,defaultValue,dataValue,fullName,isVisible,updateCallback);
		this._input=!!dataInput;
	}
	get input() {
		return this._input;
	}
	set input(input) {
		this._input=input;
		this.updateCallback();
	}
	export() {
		const data={};
		if (this.value!=this.defaultValue) data.value=this.value;
		if (this.input) data.input=this.input;
		return data;
	}
	fix() {
		return new FixedLiveSelect(this);
	}
};

module.exports=Option;
