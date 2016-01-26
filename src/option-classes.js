'use strict';

const Option=Object.create(require('../base/option-classes.js'));

// differs from webgl-starter:
//	has defaultValue - although it's potentially confusing: user input default vs Web Audio Node property default - they are currently the same
class FixedLiveNumber {
	constructor(src,setToDefault) {
		if (!setToDefault) {
			this.value=src.value;
			this.min=src.min;
			this.max=src.max;
			//this.input=Input.createFromString(src.input);
			this.input=src.input;
		} else {
			this.value=src.defaultValue;
			this.min=src.availableMin;
			this.max=src.availableMax;
			//this.input=Input.createFromString('constant');
			this.input=false;
		}
		this.defaultValue=src.defaultValue;
		this.availableMin=src.availableMin;
		this.availableMax=src.availableMax;
		this.step=src.step;
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
		const fixed=new FixedLiveNumber(this);
		fixed.name=this.name;
		return fixed;
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

module.exports=Option;
