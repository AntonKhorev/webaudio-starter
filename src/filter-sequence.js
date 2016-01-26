'use strict';

const Lines=require('../base/lines.js');
const Feature=require('./feature.js');

function capitalize(s) {
	return s.charAt(0).toUpperCase()+s.slice(1);
}
function toCamelCase(s) {
	return s.split('.').map((w,i)=>i>0?capitalize(w):w).join('');
}

class Filter {
	constructor(n,options) {
		this.n=n;
		this.options=options;
	}
	get nSuffix() {
		if (this.n!==undefined) {
			return '.'+this.n;
		} else {
			return '';
		}
	}
	get nodeJsName() {
		return toCamelCase(this.type+this.nSuffix+'.node');
	}
	getPropertyOptionName(propertyName) {
		return 'options.filters.'+this.type+'.'+propertyName;
	}
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.type+this.nSuffix+'.'+propertyName;
	}
	//getPropertyInputJsName(propertyName) {
	//	return toCamelCase(this.type+this.nSuffix+'.'+propertyName+'.input');
	//}
	getHtmlLines(i18n) {
		const lines=new Lines;
		this.nodeProperties.forEach(property=>{
			const option=this.options[property.name];
			const inputHtmlName=this.getPropertyInputHtmlName(property.name);
			if (property.type=='range' && option.input) {
				lines.a(
					"<label for='"+inputHtmlName+"'>"+i18n(this.getPropertyOptionName(property.name))+"</label>",
					"<input id='"+inputHtmlName+"' type='range' value='"+option+"' min='"+option.min+"' max='"+option.max+"'"+(option.step!=1?" step='"+option.step+"'":"")+" />"
				);
			} else if (property.type=='select') {
				lines.a(
					"<label for='"+inputHtmlName+"'>"+i18n(this.getPropertyOptionName(property.name))+"</label>",
					(
						new Lines(...property.options.map(option=>"<option>"+option+"</option>"))
					).wrap(
						"<select id='"+inputHtmlName+"'>","</select>"
					)
				);
			} else if (property.type=='xhr') {
				lines.a(
					"<span id='"+inputHtmlName+"'>"+i18n(this.getPropertyOptionName(property.name)+'.loading')+"</span>"
				);
			}
		});
		return lines.wrap("<div>","</div>");
	}
	getJsLines(i18n,prevNodeJsNames) {
		const lines=new Lines;
		lines.a(
			"// "+i18n('options.filters.'+this.type+'.comment'),
			"var "+this.nodeJsName+"=ctx."+this.ctxCreateMethodName+"();",
			...prevNodeJsNames.map(
				prevNodeJsName=>prevNodeJsName+".connect("+this.nodeJsName+");"
			)
		);
		return lines;
	}
	// abstract:
	// get type()
	// get ctxCreateMethodName()
	// get nodeJsNames()
	// get nodeProperties()
}

class SinglePathFilter extends Filter {
	get nodeJsNames() {
		return [this.nodeJsName];
	}
	getJsLines(i18n,prevNodeJsNames) {
		const lines=super.getJsLines(i18n,prevNodeJsNames);
		this.nodeProperties.forEach(property=>{
			const option=this.options[property.name];
			const nodePropertyJsName=this.nodeJsName+"."+property.name+(property.type=='range'?".value":"");
			if (property.type=='range') {
				let value=option.value;
				if (property.fn) {
					value=property.fn(value);
				}
				if (option.value!=option.defaultValue) {
					lines.a(
						nodePropertyJsName+"="+value+";"
					);
				}
			}
			if (property.type!='range' || option.input) {
				//const inputJsName=this.getPropertyInputJsName(property.name);
				const inputHtmlName=this.getPropertyInputHtmlName(property.name);
				let value="this.value";
				if (property.fn) {
					value=property.fn(value);
				}
				const eventProp=(property.type=='range'?'oninput':'onchange'); //
				lines.a(
					//"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
					//(property.type=='range'?inputJsName+".oninput=":"")+inputJsName+".onchange=function(){",
					"document.getElementById('"+inputHtmlName+"')."+eventProp+"=function(){",
					//
					"	"+nodePropertyJsName+"="+value+";",
					"};"
				);
			}
		});
		return lines;
	}
}

const filterClasses={
	gain: class extends SinglePathFilter {
		get type()                { return 'gain'; }
		get ctxCreateMethodName() { return 'createGain'; }
		get nodeProperties() {
			return [
				{
					name:'gain',
					type:'range',
				}
			];
		}
	},
	panner: class extends SinglePathFilter {
		get type()                { return 'panner'; }
		get ctxCreateMethodName() { return 'createStereoPanner'; }
		get nodeProperties() {
			return [
				{
					name:'pan',
					type:'range',
				}
			];
		}
	},
	biquad: class extends SinglePathFilter {
		get type()                { return 'biquad'; }
		get ctxCreateMethodName() { return 'createBiquadFilter'; }
		get nodeProperties() {
			return [
				{
					name:'type',
					type:'select',
					options:['lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch','allpass'],
				},{
					name:'frequency',
					type:'range',
				},{
					name:'detune',
					type:'range',
				},{
					name:'Q',
					type:'range',
					fn:x=>`Math.pow(10,${x})`,
				}
			];
		}
	},
	convolver: class extends Filter {
		get type()                { return 'convolver'; }
		get ctxCreateMethodName() { return 'createConvolver'; }
		get nodeProperties() {
			return [
				{
					name:'reverb',
					type:'range',
				},{
					name:'buffer',
					type:'xhr',
				}
			];
		}
		get nodeJsNames() {
			return [this.wetGainNodeJsName,this.dryGainNodeJsName];
		}
		get dryGainNodeJsName() {
			return toCamelCase(this.type+this.nSuffix+'.dry.gain.node');
		}
		get wetGainNodeJsName() {
			return toCamelCase(this.type+this.nSuffix+'.wet.gain.node');
		}
		getJsLines(i18n,prevNodeJsNames) {
			const lines=super.getJsLines(i18n,prevNodeJsNames);
			const inputHtmlName=this.getPropertyInputHtmlName('reverb');
			const messageHtmlName=this.getPropertyInputHtmlName('buffer');
			lines.a(
				"var "+this.wetGainNodeJsName+"=ctx.createGain();",
				this.nodeJsName+".connect("+this.wetGainNodeJsName+");",
				"var "+this.dryGainNodeJsName+"=ctx.createGain();",
				...prevNodeJsNames.map(
					prevNodeJsName=>prevNodeJsName+".connect("+this.dryGainNodeJsName+");"
				)
			);
			if (this.options.reverb!=1) {
				lines.a(
					this.wetGainNodeJsName+".gain.value="+this.options.reverb+";"
				);
			}
			if (this.options.reverb!=0) {
				lines.a(
					this.dryGainNodeJsName+".gain.value="+(1-this.options.reverb)+";"
				);
			}
			if (this.options.reverb.input) {
				lines.a(
					"document.getElementById('"+inputHtmlName+"').oninput=function(){",
					"	"+this.wetGainNodeJsName+".gain.value=this.value;",
					"	"+this.dryGainNodeJsName+".gain.value=1-this.value;",
					"};"
				);
			}
			lines.a(
				"var xhr=new XMLHttpRequest();",
				"xhr.open('GET','"+this.options.url+"');", // TODO html escape
				"xhr.responseType='arraybuffer';",
				"xhr.onload=function(){",
				"	if (this.status==200) {", // TODO we are checking status here, but what if <audio>'s status is an error?
				"		ctx.decodeAudioData(this.response,function(buffer){",
				"			"+this.nodeJsName+".buffer=buffer;",
				"			document.getElementById('"+messageHtmlName+"').textContent='';",
				"		});",
				"	} else {",
				"		this.onerror();",
				"	}",
				"};",
				"xhr.onerror=function(){",
				"	document.getElementById('"+messageHtmlName+"').textContent='"+i18n(this.getPropertyOptionName('buffer')+'.error')+"';",
				"};",
				"xhr.send();"
			);
			return lines;
		}
	},
};

class FilterSequence extends Feature {
	constructor(filterOptions) {
		super();
		const filterCounts={};
		filterOptions.entries.forEach(entry=>{
			if (!filterCounts[entry.type]) {
				filterCounts[entry.type]=0;
			}
			filterCounts[entry.type]++;
		});
		const filterCounts2={};
		this.filters=filterOptions.entries.map(entry=>{
			const filterClass=filterClasses[entry.type];
			if (filterCounts[entry.type]>1) {
				if (!filterCounts2[entry.type]) {
					filterCounts2[entry.type]=0;
				}
				return new filterClass(filterCounts2[entry.type]++,entry);
			} else {
				return new filterClass(undefined,entry);
			}
		});
	}
	requestFeatureContext(featureContext) {
		if (this.filters.length>0) {
			featureContext.audioContext=true;
		}
	}
	getHtmlLines(featureContext,i18n) {
		return new Lines(...this.filters.map(filter=>filter.getHtmlLines(i18n)));
	}
	getJsLines(featureContext,i18n) {
		const lines=super.getJsLines(featureContext,i18n);
		if (this.filters.length==0) {
			return lines;
		}
		let prevNodeJsNames=['sourceNode'];
		lines.interleave(...this.filters.map(filter=>{
			const lines=filter.getJsLines(i18n,prevNodeJsNames);
			prevNodeJsNames=filter.nodeJsNames;
			return lines;
		}),new Lines(
			"// "+i18n('options.filters.comment'),
			...prevNodeJsNames.map(prevNodeJsNames=>prevNodeJsNames+".connect(ctx.destination);")
		));
		return lines;
	}
}

module.exports=FilterSequence;
