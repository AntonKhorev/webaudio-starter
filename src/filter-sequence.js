'use strict';

const Lines=require('./html-lines.js');
const UnescapedLines=require('crnx-base/lines');
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
	getPropertyOptionName(property) {
		return 'options.filters.'+this.type+'.'+property.name;
	}
	get nodeJsName() {
		return toCamelCase(this.type+this.nSuffix+'.node');
	}
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.type+this.nSuffix+'.'+propertyName;
	}
	getPropertyInputJsName(propertyName) {
		return toCamelCase(this.type+this.nSuffix+'.'+propertyName+'.input');
	}
	requestFeatureContext(featureContext) {
	}
	getHtmlPropertyLines(i18n,property) {
		const lines=new Lines;
		const option=this.options[property.name];
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
	getJsInitLines(i18n,prevNodeJsNames) {
		return new Lines(
			new UnescapedLines("// "+i18n('comment.filters.'+this.type)),
			"var "+this.nodeJsName+"=ctx."+this.ctxCreateMethodName+"();",
			...prevNodeJsNames.map(
				prevNodeJsName=>prevNodeJsName+".connect("+this.nodeJsName+");"
			)
		);
	}
	getNodeJsNames(prevNodeJsNames) {
		return [this.nodeJsName];
	}
	// abstract:
	// get type()
	// get ctxCreateMethodName()
	// getNodeJsNames(prevNodeJsNames)
	// get nodeProperties()
}

class SinglePathFilter extends Filter {
	getJsInitLines(i18n,prevNodeJsNames) {
		const lines=super.getJsInitLines(i18n,prevNodeJsNames);
		this.nodeProperties.forEach(property=>{
			const option=this.options[property.name];
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
		getNodeJsNames(prevNodeJsNames) {
			return [this.wetGainNodeJsName,this.dryGainNodeJsName];
		}
		get dryGainNodeJsName() {
			return toCamelCase(this.type+this.nSuffix+'.dry.gain.node');
		}
		get wetGainNodeJsName() {
			return toCamelCase(this.type+this.nSuffix+'.wet.gain.node');
		}
		getJsInitLines(i18n,prevNodeJsNames) {
			const lines=super.getJsInitLines(i18n,prevNodeJsNames);
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
		get nodeProperties() {
			return this.frequencies.map(freq=>({
				name:'gain'+freq,
				type:'range',
			}));
		}
		getFrequencyOption(i) {
			return this.options[this.nodeProperties[i].name];
		}
		get affectedFreqsAndOptions() {
			return this.frequencies.map((freq,i)=>{
				const option=this.getFrequencyOption(i);
				return {freq,option};
			}).filter(fo=>(fo.option.input!=false || fo.option.value!=0));
		}
		getNodeJsNames(prevNodeJsNames) {
			if (this.affectedFreqsAndOptions.length>0) {
				return [this.nodeJsName];
			} else {
				return prevNodeJsNames;
			}
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
		getJsInitLines(i18n,prevNodeJsNames) {
			if (this.affectedFreqsAndOptions.length==0) {
				return new Lines;
			}
			const singleFreq=this.affectedFreqsAndOptions.length==1;
			const allGainsConstant=this.affectedFreqsAndOptions.every(fo=>fo.option.input==false);
			const noGainsConstant=this.affectedFreqsAndOptions.every(fo=>fo.option.input==true);
			const getJsData=()=>{
				return this.affectedFreqsAndOptions.map(fo=>{
					if (noGainsConstant) {
						return fo.freq;
					} else {
						return "["+fo.freq+","+(fo.option.input ? 'null' : fo.option.value)+"]";
					}
				}).join();
			};
			const getJsDataItem=()=>{
				if (noGainsConstant) {
					return "freq";
				} else {
					return "freqData";
				}
			};
			const getJsLoopLines=()=>{
				const nodeJsName=((allGainsConstant || singleFreq) ? this.nodeJsName : 'node');
				const freq=(singleFreq ? this.affectedFreqsAndOptions[0].freq : 'freq');
				const gain=(singleFreq ? this.affectedFreqsAndOptions[0].option.value : 'gain');
				const lines=new Lines;
				if (!(noGainsConstant || singleFreq)) {
					lines.a("var freq=freqData[0], gain=freqData[1];");
				}
				if (allGainsConstant && !singleFreq) {
					lines.a("");
				} else {
					lines.a("var ");
				}
				lines.t(nodeJsName+"=ctx."+this.ctxCreateMethodName+"();");
				if (singleFreq) {
					lines.a(
						...prevNodeJsNames.map(
							prevNodeJsName=>prevNodeJsName+".connect("+nodeJsName+");"
						)
					);
				} else {
					if (prevNodeJsNames.length==1) {
						lines.a("prevNode.connect("+nodeJsName+");");
					} else {
						lines.a(
							"prevNodes.forEach(function(prevNode){",
							"	prevNode.connect("+nodeJsName+");",
							"});"
						);
					}
				}
				lines.a(
					nodeJsName+".type='peaking';",
					nodeJsName+".frequency.value="+freq+";"
				);
				if (!noGainsConstant) {
					let gainLines=new Lines(nodeJsName+".gain.value="+gain+";");
					if (!allGainsConstant) {
						gainLines.wrap("if (gain!==null) {","}");
					}
					lines.a(gainLines);
				}
				if (!allGainsConstant) {
					const inputJsName=(singleFreq
						? this.getPropertyInputJsName('gain'+freq)
						: 'input'
					);
					const inputHtmlNameExpr=(singleFreq
						? "'"+this.getPropertyInputHtmlName('gain'+freq)+"'"
						: "'"+this.getPropertyInputHtmlName('gain')+"'+freq"
					);
					let listenerLines=new Lines(
						"var "+inputJsName+"=document.getElementById("+inputHtmlNameExpr+");",
						"("+inputJsName+".oninput=function(){",
						"	"+nodeJsName+".gain.value="+inputJsName+".value;",
						"})();"
					);
					if (!noGainsConstant) {
						listenerLines.wrap("if (gain===null) {","}");
					}
					lines.a(listenerLines);
				}
				if (!singleFreq) {
					const outerNodeJsName=(allGainsConstant ? nodeJsName : this.nodeJsName+"="+nodeJsName);
					if (prevNodeJsNames.length==1) {
						lines.a("prevNode="+outerNodeJsName+";");
					} else {
						lines.a("prevNodes=["+outerNodeJsName+"];");
					}
				}
				return lines;
			};
			const lines=new Lines(
				new UnescapedLines("// "+i18n('comment.filters.'+this.type))
			);
			if (singleFreq) {
				lines.a(
					getJsLoopLines()
				);
			} else {
				if (prevNodeJsNames.length==1) {
					lines.a("var prevNode="+prevNodeJsNames[0]+";");
				} else {
					lines.a("var prevNodes=["+prevNodeJsNames.join()+"];");
				}
				lines.a(
					"var "+this.nodeJsName+";",
					"["+getJsData()+"].forEach(function("+getJsDataItem()+"){",
					getJsLoopLines().indent(),
					"});"
				);
			}
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
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const lines=super.getJsInitLines(...arguments);
		if (this.entries.length==0) {
			return lines;
		}
		lines.interleave(...this.entries.map(entry=>{
			const lines=entry.getJsInitLines(i18n,prevNodeJsNames);
			prevNodeJsNames=entry.getNodeJsNames(prevNodeJsNames);
			return lines;
		}));
		return lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		this.entries.forEach(entry=>{
			prevNodeJsNames=entry.getNodeJsNames(prevNodeJsNames);
		});
		return prevNodeJsNames;
	}
}

module.exports=FilterSequence;
