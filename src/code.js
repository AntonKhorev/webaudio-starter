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
	constructor(source) {
		super();
		this.source=source;
	}
	getHtmlLines(featureContext,i18n) {
		return (new Lines(
			"<audio src='"+this.source+"' id='my.source' controls loop crossorigin='anonymous'></audio>" // TODO html escape
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
	getPropertyInputJsName(propertyName) {
		return toCamelCase(this.type+this.nSuffix+'.'+propertyName+'.input');
	}
	getJsLines(prevNodeJsName) {
		const lines=new Lines;
		lines.a(
			"var "+this.nodeJsName+"=ctx."+this.ctxCreateMethodName+"();",
			prevNodeJsName+".connect("+this.nodeJsName+")"
		);
		this.nodeProperties.forEach(property=>{
			const inputJsName=this.getPropertyInputJsName(property.name);
			const inputHtmlName=this.getPropertyInputHtmlName(property.name);
			lines.a(
				"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
				inputJsName+".oninput="+inputJsName+".onchange=function(){",
				"	"+this.nodeJsName+"."+property.name+".value=this.value;",
				"};"
			);
		});
		return lines;
	}
	getHtmlLines(i18n) {
		const lines=new Lines;
		this.nodeProperties.forEach(property=>{
			const inputHtmlName=this.getPropertyInputHtmlName(property.name);
			lines.a(
				"<label for='"+inputHtmlName+"'>"+i18n(this.getPropertyOptionName(property.name))+"</label>"
			);
			if (property.type=='range') {
				lines.a(
					"<input id='"+inputHtmlName+"' type='range' value='"+property.value+"' min='"+property.min+"' max='"+property.max+"'"+(property.step!='1'?" step='"+property.step+"'":"")+" />"
				);
			}
		});
		return lines.wrap("<div>","</div>");
	}
}

const filterClasses={
	gain: class extends Filter {
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
	panner: class extends Filter {
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
	biquad: class extends Filter {
		get type()                { return 'biquad'; }
		get ctxCreateMethodName() { return 'createBiquadFilter'; }
		get nodeProperties() {
			return [
				{
					name:'frequency',
					type:'range',
					value:'350', min:'0', max:'22050', step:'1',
				},{
					name:'detune',
					type:'range',
					value:'0', min:'0', max:'100', step:'1',
				},{
					name:'Q',
					type:'range',
					value:'1', min:'0.0001', max:'1000', step:'0.01',
				}
			];
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
				return new filterClass(filterCounts2[entry.type]++);
			} else {
				return new filterClass;
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
		let prevNodeJsName='sourceNode';
		this.filters.forEach(filter=>{
			lines.a(filter.getJsLines(prevNodeJsName));
			prevNodeJsName=filter.nodeJsName;
		});
		lines.a(
			prevNodeJsName+".connect(ctx.destination);"
		);
		return lines;
	}
}

module.exports=function(options,i18n){
	const featureContext={};
	const features=[];
	features.push(new Audio(options.source));
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
