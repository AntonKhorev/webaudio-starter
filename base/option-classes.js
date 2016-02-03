'use strict';

// constructors typically called from Options class
// to call them manually, use the following args:
//	name,contents/availableValues,defaultValue,data - similar to entriesDescription()
// the rest of arguments' order is not settled, don't use them
// 	+ TODO not sure about data

/*
fixed options spec:
	input option returns its value in primitive context (possibly with valueOf() method)
		value has primitive type
	options have the following properties in order of priority (most important first)
		type property (defaults to 'type') if option is an array member
			why need type property if there's name? - because name is not imported/exported
		suboption-named properties equal to suboptions for collections
		'entries' array of suboptions for array and collection
		'value' and 'name' properties for non-boolean options
	TODO decide on: boolean option cannot be an array member (where to store it's type?)
*/

const Option={};

// abstract classes

Option.Base = class {
	constructor(name,_1,_2,_3,fullName,isVisible,updateCallback) {
		this.name=name;
		this.isVisible=isVisible;
		this.updateCallback=updateCallback;
		this.fullName=fullName;
		this._$=null;
	}
	get $() {
		return this._$;
	}
	set $($) {
		this._$=$;
		this.updateVisibility();
	}
	updateVisibility() {
		if (this.$) this.$.toggle(this.isVisible());
	}
	shortenExport(data) { // used by parent
		const dataKeys=Object.keys(data);
		if (dataKeys.length==1 && dataKeys[0]=='value') {
			return data.value;
		} else {
			return data;
		}
	}
	shortenExportAssign(data,parentData,name) {
		const dataKeys=Object.keys(data);
		if (dataKeys.length==1 && dataKeys[0]=='value') {
			parentData[name]=data.value;
		} else if (dataKeys.length>0) {
			parentData[name]=data;
		}
	}
};

Option.Input = class extends Option.Base {
	constructor(name,availableValues,defaultValue,data,fullName,isVisible,updateCallback) {
		super(...arguments);
		if (defaultValue!==undefined) {
			this.defaultValue=defaultValue;
		} else {
			this.defaultValue=availableValues[0];
		}
		if (typeof data == 'object') {
			data=data.value;
		}
		if (data!==undefined) {
			this._value=data;
		} else {
			this._value=this.defaultValue;
		}
	}
	get value() {
		return this._value;
	}
	set value(value) {
		this._value=value;
		this.updateCallback();
	}
	export() {
		const data={};
		if (this.value!=this.defaultValue) data.value=this.value;
		return data;
	}
};

Option.BooleanInput = class extends Option.Input {
	fix() {
		return this.value;
	}
};

Option.NonBooleanInput = class extends Option.Input {
	fix() {
		const value=this.value;
		return { // can't use fixed value in boolean context
			name: this.name,
			value,
			valueOf() { return value; },
			toString() { return String(value); },
		};
	}
};

Option.FactorInput = class extends Option.NonBooleanInput {
	constructor(name,availableValues,defaultValue,data,fullName,isVisible,updateCallback) {
		super(...arguments);
		this.availableValues=availableValues;
	}
};

Option.RangeInput = class extends Option.NonBooleanInput {
	constructor(name,availableRange,defaultValue,data,fullName,isVisible,updateCallback) {
		super(...arguments);
		this.availableMin=availableRange[0];
		this.availableMax=availableRange[1];
	}
};

Option.Collection = class extends Option.Base {
	constructor(name,entries,_1,_2,fullName,isVisible,updateCallback) {
		super(...arguments);
		this.entries=entries;
	}
	export() {
		const data={};
		this.entries.forEach(entry=>{
			entry.shortenExportAssign(entry.export(),data,entry.name);
		});
		return data;
	}
	fix() {
		const fixedEntries=[];
		const fixed={
			name: this.name,
			entries: fixedEntries,
		};
		this.entries.forEach(entry=>{
			fixedEntries.push(fixed[entry.name]=entry.fix());
		});
		return fixed;
	}
};

// concrete classes

Option.Void = class extends Option.Base { // useful as array entry w/o settings
	export() {
		return {};
	}
	fix() {
		return {
			name: this.name,
		};
	}
}

Option.Checkbox = class extends Option.BooleanInput {
	constructor(name,_,defaultValue,data,fullName,isVisible,updateCallback) {
		super(name,undefined,!!defaultValue,data,fullName,isVisible,updateCallback);
	}
};

Option.Select = class extends Option.FactorInput {};

Option.Text = class extends Option.FactorInput {};

Option.Root = class extends Option.Collection {};

Option.Group = class extends Option.Collection {};

Option.Array = class extends Option.Base {
	constructor(name,availableConstructors,typePropertyName,data,fullName,isVisible,updateCallback) {
		super(name,undefined,undefined,undefined,fullName,isVisible,updateCallback);
		this.availableConstructors=availableConstructors; // Map {type:constructor}
		if (typePropertyName===undefined) typePropertyName='type';
		this.typePropertyName=typePropertyName;
		this._entries=[];
		let subDatas=[];
		if (Array.isArray(data)) {
			subDatas=data;
		} else if (typeof data == 'object') {
			subDatas=data.value;
		}
		let defaultType=this.availableTypes[0];
		for (let i=0;i<subDatas.length;i++) {
			const subData=subDatas[i];
			let subType=defaultType;
			if (typeof subData == 'object' && subData[typePropertyName]!==undefined) {
				subType=subData[typePropertyName];
			}
			let subCtor=this.availableConstructors.get(subType);
			if (subCtor) {
				this._entries.push(subCtor(subData));
			}
		}
	}
	get availableTypes() {
		const types=[];
		this.availableConstructors.forEach((_,type)=>{
			types.push(type);
		});
		return types;
	}
	get entries() {
		return this._entries;
	}
	set entries(entries) {
		this._entries=entries;
		this.updateCallback();
	}
	addEntry(type) {
		const entry=this.availableConstructors.get(type)();
		this._entries.push(entry);
		this.updateCallback();
		return entry;
	}
	export() {
		let defaultType=this.availableTypes[0];
		return {
			value: this._entries.map(entry=>{
				const subData=entry.export();
				const subType=entry.name;
				if (subType!=defaultType) subData[this.typePropertyName]=subType;
				return entry.shortenExport(subData);
			}),
		};
	}
	fix() {
		return {
			name: this.name,
			entries: this._entries.map(entry=>{
				const subFixed=entry.fix();
				if (typeof subFixed == 'object') subFixed[this.typePropertyName]=entry.name;
				return subFixed;
			}),
		};
	}
};

module.exports=Option;
