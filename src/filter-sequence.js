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
					new Lines(...option.availableValues.map(value=>"<option"+(option.value==value?" selected":"")+">"+value+"</option>"))
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
	get skipNode() {
		return false;
	}
	// { not called if skipNode is set
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
	get nodeJsNames() {
		return [this.nodeJsName];
	}
	// }
	// abstract:
	// get type()
	// get ctxCreateMethodName()
	// get nodeProperties()
}

class SinglePathFilter extends Filter {
	getJsInitLines(i18n,prevNodeJsNames) {
		const lines=super.getJsInitLines(i18n,prevNodeJsNames);
		this.nodeProperties.forEach(property=>{
			const option=this.options[property.name];
			const nodePropertyJsName=this.nodeJsName+"."+property.name+(property.type=='range'?".value":"");
			if (option.input) {
				const inputJsName=this.getPropertyInputJsName(property.name);
				const inputHtmlName=this.getPropertyInputHtmlName(property.name);
				let value=inputJsName+".value";
				if (property.fn) {
					value=property.fn(value);
				}
				const eventProp=(property.type=='range'?'oninput':'onchange');
				lines.a(
					"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
					// was for IE11 compat (but IE11 has no Web Audio): (property.type=='range'?inputJsName+".oninput=":"")+inputJsName+".onchange=function(){",
					"("+inputJsName+"."+eventProp+"=function(){",
					"	"+nodePropertyJsName+"="+value+";",
					"})();"
				);
			} else {
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
			}
		});
		return lines;
	}
}

class PassiveByDefaultSinglePathFilter extends SinglePathFilter {
	get skipNode() {
		return this.nodeProperties.every(property=>{
			const option=this.options[property.name];
			return option.value==option.defaultValue && !option.input;
		});
	}
}

const filterClasses={
	gain: class extends PassiveByDefaultSinglePathFilter {
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
	panner: class extends PassiveByDefaultSinglePathFilter {
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
					name:'Q',
					type:'range',
					fn:x=>`Math.pow(10,${x})`,
				},{
					name:'gain',
					type:'range',
				},{
					name:'detune',
					type:'range',
				}
			];
		}
		get skipNode() {
			// lowshelf, highshelf and peaking are passive when gain==0
			return (
				!this.options.type.input && ['lowshelf','highshelf','peaking'].indexOf(this.options.type.value)>=0 &&
				!this.options.gain.input && this.options.gain==0
			);
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
		get dryGainNodeJsName() {
			return toCamelCase(this.type+this.nSuffix+'.dry.gain.node');
		}
		get wetGainNodeJsName() {
			return toCamelCase(this.type+this.nSuffix+'.wet.gain.node');
		}
		get skipNode() {
			return this.options.reverb==0 && !this.options.reverb.input;
		}
		getJsInitLines(i18n,prevNodeJsNames) {
			const messageHtmlName=this.getPropertyInputHtmlName('buffer');
			const lines=new Lines;
			if (this.options.reverb.input || this.options.reverb!=1) {
				lines.a(new UnescapedLines("// "+i18n('comment.filters.'+this.type)));
			} else {
				lines.a(new UnescapedLines("// "+i18n('comment.filters.'+this.type+'.single')));
			}
			lines.a(
				"var "+this.nodeJsName+"=ctx."+this.ctxCreateMethodName+"();",
				...prevNodeJsNames.map(
					prevNodeJsName=>prevNodeJsName+".connect("+this.nodeJsName+");"
				)
			);
			if (this.options.reverb.input || this.options.reverb!=1) {
				lines.a(
					"var "+this.wetGainNodeJsName+"=ctx.createGain();",
					this.nodeJsName+".connect("+this.wetGainNodeJsName+");",
					"var "+this.dryGainNodeJsName+"=ctx.createGain();",
					...prevNodeJsNames.map(
						prevNodeJsName=>prevNodeJsName+".connect("+this.dryGainNodeJsName+");"
					)
				);
				if (this.options.reverb.input) {
					const inputHtmlName=this.getPropertyInputHtmlName('reverb');
					const inputJsName=this.getPropertyInputJsName('reverb');
					lines.a(
						"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
						"("+inputJsName+".oninput=function(){",
						"	"+this.wetGainNodeJsName+".gain.value="+inputJsName+".value;",
						"	"+this.dryGainNodeJsName+".gain.value=1-"+inputJsName+".value;",
						"})();"
					);
				}
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
		get nodeJsNames() {
			if (this.options.reverb.input || this.options.reverb!=1) {
				return [this.wetGainNodeJsName,this.dryGainNodeJsName];
			} else {
				return [this.nodeJsName];
			}
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
		requestFeatureContext(featureContext) {
			if (!this.allGainsConstant) {
				featureContext.alignedInputs=true;
			}
		}
		getHtmlPropertyLines(i18n,property) {
			const lines=super.getHtmlPropertyLines(i18n,property);
			return lines.wrapIfNotEmpty("<div class='aligned'>","</div>");
		}
		get skipNode() {
			return this.affectedFreqsAndOptions.length==0;
		}
		getJsInitLines(i18n,prevNodeJsNames) {
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
						lines.t(
							// continues "if (gain!==null) {...}"
							listenerLines.wrap(" else {","}")
						);
					} else {
						lines.a(listenerLines);
					}
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
			if (singleFreq) {
				return new Lines(
					new UnescapedLines("// "+i18n('comment.filters.'+this.type+'.single')),
					getJsLoopLines()
				);
			} else {
				const lines=new Lines(
					new UnescapedLines("// "+i18n('comment.filters.'+this.type))
				);
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
				return lines;
			}
		}
	},
};

class FilterSequence extends CollectionFeature {
	getEntryClass(entryOption) {
		return filterClasses[entryOption.filter];
	}
	requestFeatureContext(featureContext) {
		this.entries.forEach(entry=>{
			if (!entry.skipNode) {
				featureContext.audioContext=true;
				entry.requestFeatureContext(featureContext);
			}
		});
	}
	getHtmlLines(featureContext,i18n) {
		return new Lines(...this.entries.filter(entry=>!entry.skipNode).map(entry=>entry.getHtmlLines(featureContext,i18n)));
	}
	getJsInitLines(featureContext,i18n,prevNodeJsNames) {
		const lines=super.getJsInitLines(...arguments);
		lines.interleave(...this.entries.filter(entry=>!entry.skipNode).map(entry=>{
			const lines=entry.getJsInitLines(i18n,prevNodeJsNames);
			prevNodeJsNames=entry.nodeJsNames;
			return lines;
		}));
		return lines;
	}
	getNodeJsNames(featureContext,prevNodeJsNames) {
		this.entries.forEach(entry=>{
			if (!entry.skipNode) {
				prevNodeJsNames=entry.nodeJsNames;
			}
		});
		return prevNodeJsNames;
	}
}

module.exports=FilterSequence;
