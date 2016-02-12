'use strict';

const Lines=require('crnx-base/lines');
const CollectionFeature=require('./collection-feature.js');

function capitalize(s) {
	return s.charAt(0).toUpperCase()+s.slice(1);
}
function toCamelCase(s) {
	return s.split('.').map((w,i)=>i>0?capitalize(w):w).join('');
}

class Filter {
	constructor(options,n) {
		this.options=options;
		this.n=n;
	}
	get nSuffix() {
		if (this.n!==undefined) {
			return '.'+this.n;
		} else {
			return '';
		}
	}
	getPropertyOption(property) {
		return this.options[property.name];
	}
	getPropertyOptionName(property) {
		return 'options.filters.'+this.type+'.'+property.name;
	}
	get nodeJsName() {
		return toCamelCase(this.type+this.nSuffix+'.node');
	}
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.type+this.nSuffix+'.'+propertyName;
	}
	//getPropertyInputJsName(propertyName) {
	//	return toCamelCase(this.type+this.nSuffix+'.'+propertyName+'.input');
	//}
	requestFeatureContext(featureContext) {
	}
	getHtmlPropertyLines(i18n,property) {
		const lines=new Lines;
		const option=this.getPropertyOption(property);
		const inputHtmlName=this.getPropertyInputHtmlName(property.name);
		if (property.type=='range' && option.input) {
			lines.a(
				"<label for='"+inputHtmlName+"'>"+i18n(this.getPropertyOptionName(property))+"</label>",
				"<input id='"+inputHtmlName+"' type='range' value='"+option+"' min='"+option.min+"' max='"+option.max+"'"+(option.step!=1?" step='"+option.step+"'":"")+" />"
			);
		} else if (property.type=='select' && option.input) {
			lines.a(
				"<label for='"+inputHtmlName+"'>"+i18n(this.getPropertyOptionName(property))+"</label>",
				(
					new Lines(...option.availableValues.map(value=>"<option>"+value+"</option>"))
				).wrap(
					"<select id='"+inputHtmlName+"'>","</select>"
				)
			);
		} else if (property.type=='xhr') {
			lines.a(
				"<span id='"+inputHtmlName+"'>"+i18n(this.getPropertyOptionName(property)+'.loading')+"</span>"
			);
		}
		return lines;
	}
	getHtmlLines(featureContext,i18n) {
		const lines=new Lines(
			...this.nodeProperties.map(property=>this.getHtmlPropertyLines(i18n,property))
		);
		return lines.wrapIfNotEmpty("<div>","</div>");
	}
	getJsLines(i18n,prevNodeJsNames) {
		return new Lines(
			"// "+i18n('options.filters.'+this.type+'.comment'),
			"var "+this.nodeJsName+"=ctx."+this.ctxCreateMethodName+"();",
			...prevNodeJsNames.map(
				prevNodeJsName=>prevNodeJsName+".connect("+this.nodeJsName+");"
			)
		);
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
			const option=this.getPropertyOption(property);
			const nodePropertyJsName=this.nodeJsName+"."+property.name+(property.type=='range'?".value":"");
			//if (property.type=='range' || property.type=='select') {
				let value=option.value;
				if (property.type=='select') {
					value="'"+value+"'";
				}
				if (property.fn) {
					value=property.fn(value);
				}
				if (option.value!=option.defaultValue) {
					lines.a(
						nodePropertyJsName+"="+value+";"
					);
				}
			//}
			if (option.input) {
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
				"	document.getElementById('"+messageHtmlName+"').textContent='"+i18n('options.filters.convolver.buffer.error')+"';",
				"};",
				"xhr.send();"
			);
			return lines;
		}
	},
	equalizer: class extends Filter {
		get type()                { return 'equalizer'; }
		get ctxCreateMethodName() { return 'createBiquadFilter'; }
		get frequencies()         { return [60,170,350,1000,3500,10000]; }
		get allGainsConstant() {
			return this.nodeProperties.every(prop=>this.getPropertyOption(prop).input==false);
		}
		get nodeProperties() {
			return this.frequencies.map(freq=>({
				name:'gain'+freq,
				type:'range',
			}));
		}
		get nodeJsNames() {
			return [this.nodeJsName];
		}
		requestFeatureContext(featureContext) {
			if (!this.allGainsConstant) {
				featureContext.alignedInputs=true;
			}
		}
		getHtmlPropertyLines(i18n,property) {
			const lines=super.getHtmlPropertyLines(i18n,property);
			return lines.wrapIfNotEmpty("<div class='aligned'>","</div>");
		}
		getJsLines(i18n,prevNodeJsNames) {
			const getJsDataLines=()=>{
				const lines=new Lines;
				lines.a(
					this.frequencies.map((freq,i)=>{
						const option=this.getPropertyOption(this.nodeProperties[i]);
						if (this.allGainsConstant) {
							return "["+freq+","+option.value+"]";
						} else {
							return "["+freq+","+option.value+","+option.input+"]";
						}
					}).join()
				);
				return lines;
			};
			const getJsLoopLines=()=>{
				const nodeJsName=(this.allGainsConstant ? this.nodeJsName : 'node');
				const lines=new Lines;
				lines.a("var freq=freqData[0], gain=freqData[1]");
				if (!this.allGainsConstant) {
					lines.t(", editable=freqData[2]");
				}
				lines.t(";");
				if (this.allGainsConstant) {
					lines.a("");
				} else {
					lines.a("var ");
				}
				lines.t(nodeJsName+"=ctx."+this.ctxCreateMethodName+"();");
				if (prevNodeJsNames.length==1) {
					lines.a("prevNode.connect("+nodeJsName+");");
				} else {
					lines.a(
						"prevNodes.forEach(function(prevNode){",
						"	prevNode.connect("+nodeJsName+");",
						"});"
					);
				}
				lines.a(
					nodeJsName+".type='peaking';",
					nodeJsName+".frequency.value=freq;",
					nodeJsName+".gain.value=gain;"
				);
				if (!this.allGainsConstant) {
					const inputHtmlNamePrefix=this.getPropertyInputHtmlName('gain');
					lines.a(
						"if (editable) {",
						"	document.getElementById('"+inputHtmlNamePrefix+"'+freq).oninput=function(){",
						"		"+nodeJsName+".gain.value=this.value;",
						"	};",
						"}"
					);
				}
				const outerNodeJsName=(this.allGainsConstant ? nodeJsName : this.nodeJsName+"="+nodeJsName);
				if (prevNodeJsNames.length==1) {
					lines.a("prevNode="+outerNodeJsName+";");
				} else {
					lines.a("prevNodes=["+outerNodeJsName+"];");
				}
				return lines;
			};
			const lines=new Lines;
			lines.a("// "+i18n('options.filters.'+this.type+'.comment'));
			if (prevNodeJsNames.length==1) {
				lines.a("var prevNode="+prevNodeJsNames[0]+";");
			} else {
				lines.a("var prevNodes=["+prevNodeJsNames.join()+"];");
			}
			lines.a(
				"var "+this.nodeJsName+";",
				"[",
				getJsDataLines().indent(),
				"].forEach(function(freqData){",
				getJsLoopLines().indent(),
				"});"
			);
			return lines;
		}
	},
};

class FilterSequence extends CollectionFeature {
	getEntryClass(entryOption) {
		return filterClasses[entryOption.filter];
	}
	requestFeatureContext(featureContext) {
		if (this.entries.length>0) {
			featureContext.audioContext=true;
		}
		this.entries.forEach(entry=>{
			entry.requestFeatureContext(featureContext);
		});
	}
	getJsLines(featureContext,i18n,prevNodeJsNames) {
		const lines=super.getJsLines(...arguments);
		if (this.entries.length==0) {
			return lines;
		}
		lines.interleave(...this.entries.map(entry=>{
			const lines=entry.getJsLines(i18n,prevNodeJsNames);
			prevNodeJsNames=entry.nodeJsNames;
			return lines;
		}));
		return lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		if (this.entries.length>0) {
			return this.entries[this.entries.length-1].nodeJsNames;
		} else {
			return prevNodeJsNames;
		}
	}
}

module.exports=FilterSequence;
