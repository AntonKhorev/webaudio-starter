'use strict';

const Lines=require('../base/lines.js');

function capitalize(s) {
	return s.charAt(0).toUpperCase()+s.slice(1);
}
function toCamelCase(s) {
	return s.split('.').map((w,i)=>i>0?capitalize(w):w).join('');
}

class Feature {
	requestFeatureContext(featureContext) {
	}
	getHtmlLines(featureContext,i18n) {
		return new Lines;
	}
	getJsLines(featureContext,i18n) {
		return new Lines;
	}
}

class Audio extends Feature {
	constructor(source,crossorigin) {
		super();
		this.source=source;
		this.crossorigin=crossorigin;
	}
	getHtmlLines(featureContext,i18n) {
		return (new Lines(
			"<audio src='"+this.source+"' id='my.source' controls loop"+(this.crossorigin?" crossorigin='anonymous'":"")+"></audio>" // TODO html escape
		)).wrap("<div>","</div>");
	}
	getJsLines(featureContext,i18n) {
		const lines=super.getJsLines(featureContext,i18n);
		if (featureContext.audioContext) {
			lines.a(
				"var ctx=new (AudioContext || webkitAudioContext);",
				"var sourceElement=document.getElementById('my.source');",
				"var sourceNode=ctx.createMediaElementSource(sourceElement);"
			);
		}
		return lines;
	}
}

class Filter {
	constructor(n) {
		this.n=n;
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
		return 'options.filters.'+this.type+'.properties.'+propertyName;
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
			const inputHtmlName=this.getPropertyInputHtmlName(property.name);
			lines.a(
				"<label for='"+inputHtmlName+"'>"+i18n(this.getPropertyOptionName(property.name))+"</label>"
			);
			if (property.type=='range') {
				lines.a(
					"<input id='"+inputHtmlName+"' type='range' value='"+property.value+"' min='"+property.min+"' max='"+property.max+"'"+(property.step?" step='"+property.step+"'":"")+" />"
				);
			} else if (property.type=='select') {
				lines.a(
					(
						new Lines(...property.options.map(option=>"<option>"+option+"</option>"))
					).wrap(
						"<select id='"+inputHtmlName+"'>","</select>"
					)
				);
			}
		});
		return lines.wrap("<div>","</div>");
	}
	getJsLines(prevNodeJsNames) {
		const lines=new Lines;
		lines.a(
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
	getJsLines(prevNodeJsNames) {
		const lines=super.getJsLines(prevNodeJsNames);
		this.nodeProperties.forEach(property=>{
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
				"	"+this.nodeJsName+"."+property.name+(property.type=='range'?".value":"")+"="+value+";",
				"};"
			);
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
					value:'1', min:'0', max:'1', step:'0.01',
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
					value:'0', min:'-1', max:'1', step:'0.01',
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
					value:'350', min:'0', max:'22050',
				},{
					name:'detune',
					type:'range',
					value:'0', min:'0', max:'100',
				},{
					name:'Q',
					type:'range',
					value:'0', min:'-4', max:'4', step:'0.01', fn:x=>`Math.pow(10,${x})`,
				}
			];
		}
	},
	convolver: class extends Filter {
		constructor(n,options) {
			super(n);
			this.url=options.url;
		}
		get type()                { return 'convolver'; }
		get ctxCreateMethodName() { return 'createConvolver'; }
		get nodeProperties() {
			return [
				{
					name:'reverb',
					type:'range',
					value:'0', min:'0', max:'1', step:'0.01',
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
		getJsLines(prevNodeJsNames) {
			const lines=super.getJsLines(prevNodeJsNames);
			lines.a(
				"var "+this.wetGainNodeJsName+"=ctx.createGain();",
				this.wetGainNodeJsName+".gain.value=0;",
				this.nodeJsName+".connect("+this.wetGainNodeJsName+");",
				"var "+this.dryGainNodeJsName+"=ctx.createGain();",
				// this.wetGainNodeJsName+".gain.value=1;", // default
				...prevNodeJsNames.map(
					prevNodeJsName=>prevNodeJsName+".connect("+this.dryGainNodeJsName+");"
				)
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
		this.filters.forEach(filter=>{
			lines.a(filter.getJsLines(prevNodeJsNames));
			prevNodeJsNames=filter.nodeJsNames;
		});
		lines.a(
			...prevNodeJsNames.map(prevNodeJsNames=>prevNodeJsNames+".connect(ctx.destination);")
		);
		return lines;
	}
}

module.exports=function(options,i18n){
	const featureContext={};
	const features=[];
	features.push(new Audio(options.source,options.crossorigin));
	features.push(new FilterSequence(options.filters));
	features.forEach(feature=>{
		feature.requestFeatureContext(featureContext);
	});
	const lines=new Lines(
		"<!DOCTYPE html>",
		"<html lang='en'>",
		"<head>",
		"<meta charset='utf-8' />",
		"<title>WebAudio example - Generated code</title>",
		"</head>",
		"<body>",
		(()=>{
			const lines=new Lines;
			lines.a(...features.map(feature=>feature.getHtmlLines(featureContext,i18n)));
			return lines;
		})(),
		(()=>{
			const lines=new Lines;
			lines.a(...features.map(feature=>feature.getJsLines(featureContext,i18n)));
			return lines.wrapIfNotEmpty("<script>","</script>");
		})(),
		"</body>",
		"</html>"
	);
	return lines.join('\t');
};
