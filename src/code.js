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
	get htmlName()      { return 'my.'+this.type+this.nSuffix; }
	get optionsName()   { return 'options.filters.'+this.type; }
	get jsNodeName()    { return toCamelCase(this.type+this.nSuffix+'.node'); }
	get jsElementName() { return toCamelCase(this.type+this.nSuffix+'.element'); }
	getJsLines(prevJsNodeName) {
		return new Lines(
			"var "+this.jsNodeName+"=ctx."+this.ctxCreateMethodName+"();",
			prevJsNodeName+".connect("+this.jsNodeName+")",
			"var "+this.jsElementName+"=document.getElementById('"+this.htmlName+"');",
			this.jsElementName+".oninput="+this.jsElementName+".onchange=function(){",
			"	"+this.jsNodeName+"."+this.nodePropertyName+".value=this.value;",
			"};"
		);
	}
}

const filterClasses={
	gain: class extends Filter {
		get type()                { return 'gain'; }
		get ctxCreateMethodName() { return 'createGain'; }
		get nodePropertyName()    { return 'gain'; }
		getHtmlLines(i18n) {
			return (new Lines(
				"<label for='"+this.htmlName+"'>"+i18n(this.optionsName)+"</label>",
				"<input id='"+this.htmlName+"' type='range' min='0' max='1' step='0.01' value='1' />"
			)).wrap("<div>","</div>");
		}
	},
	panner: class extends Filter {
		get type()                { return 'panner'; }
		get ctxCreateMethodName() { return 'createStereoPanner'; }
		get nodePropertyName()    { return 'pan'; }
		getHtmlLines(i18n) {
			return (new Lines(
				"<label for='"+this.htmlName+"'>"+i18n(this.optionsName)+"</label>",
				"<input id='"+this.htmlName+"' type='range' min='-1' max='1' step='0.01' value='0' />"
			)).wrap("<div>","</div>");
		}
	}
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
		let prevJsNodeName='sourceNode';
		this.filters.forEach(filter=>{
			lines.a(filter.getJsLines(prevJsNodeName));
			prevJsNodeName=filter.jsNodeName;
		});
		lines.a(
			prevJsNodeName+".connect(ctx.destination);"
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
