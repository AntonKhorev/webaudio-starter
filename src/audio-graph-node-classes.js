// TODO remove this module

'use strict'

const NodeClasses={}

// abstract classes (not exported)

class Node extends Feature {
	constructor(options) {
		super()
		this.options=options
		// set/modified by graph constructor:
		this.nextNodes=new Set
		this.prevNodes=new Set
		//this._n=undefined
	}
	getPropertyInputHtmlName(propertyName) {
		return 'my.'+this.type+this.nSuffix+'.'+propertyName
	}
	getPropertyInputJsName(propertyName) {
		return camelCase(this.type+this.nSuffix+'.'+propertyName+'.input')
	}
	// abstract get type() // required for n-assignment, can't do it by class with aggregation nodes like Node.bypass
}

class SingleNode extends Node { // corresponds to single web audio node
	get fixedInput() {
		return true
	}
	get fixedOutput() {
		return true
	}
	get nOutputJsNames() {
		return 1
	}
	get nodeJsName() {
		return camelCase(this.type+this.nSuffix+'.node')
	}
	getInputJsNames() {
		return [this.nodeJsName] // was wrong b/c media elements have no inputs
	}
	getOutputJsNames() {
		return [this.nodeJsName]
	}
	getInitJsLines(featureContext,i18n) {
		return JsLines.bae(
			RefLines.parse("// "+i18n('comment.graph.'+this.type)),
			this.getCreateNodeJsLines(featureContext)
		)
	}
	// abstract:
	// getCreateNodeJsLines(featureContext)
}

class FilterNode extends SingleNode {
	get nInputJsNames() {
		return 1
	}
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true
	}
	getHtmlLines(featureContext,i18n) {
		const getPropertyHtmlLines=(property)=>{
			if (property.skip) {
				return Lines.be()
			}
			const option=this.options[property.name]
			const inputHtmlName=this.getPropertyInputHtmlName(property.name)
			const propertyOptionName='options.graph.'+this.type+'.'+property.name
			const a=Lines.b()
			if (property.type=='range' && option.input) {
				const p=option.precision
				const fmtAttrs=formatNumbers.html({ min:option.min, max:option.max, value:option.value },p)
				const fmtLabels=formatNumbers({ min:option.min, max:option.max },p)
				const minMax=n=>i18n.numberWithUnits(n,option.unit,(a,e)=>Lines.html`<abbr title=${e}>`+a+`</abbr>`)
				a(
					Lines.html`<label for=${inputHtmlName}>${i18n(propertyOptionName)}:</label>`,
					"<span class=min>"+minMax(fmtLabels.min)+"</span>",
					Lines.html`<input id=${inputHtmlName} type=range value=${fmtAttrs.value} min=${fmtAttrs.min} max=${fmtAttrs.max} step=${p?Math.pow(0.1,p).toFixed(p):false}>`,
					"<span class=max>"+minMax(fmtLabels.max)+"</span>"
				)
			} else if (property.type=='select' && option.input) {
				a(
					Lines.html`<label for=${inputHtmlName}>${i18n(propertyOptionName)}:</label>`,
					WrapLines.b(
						Lines.html`<select id=${inputHtmlName}>`,`</select>`
					).ae(
						...option.availableValues.map(value=>{
							const title=i18n(propertyOptionName+'.'+value)
							return Lines.html`<option selected=${option.value==value} value=${value!=title && value}>${title}</option>`
						})
					)
				)
			} else if (property.type=='xhr') {
				a(
					Lines.html`<span id=${inputHtmlName}>${i18n(this.getPropertyOptionName(property)+'.loading')}</span>`
				)
			}
			return a.e()
		}
		return Lines.bae(
			...this.nodeProperties.map(
				property=>NoseWrapLines.b(
					"<div>","</div>"
				).ae(
					getPropertyHtmlLines(property)
				)
			)
		)
	}
	getInitJsLines(featureContext,i18n) {
		return Lines.bae(
			super.getInitJsLines(featureContext,i18n),
			...this.nodeProperties.map(property=>{
				if (property.skip) {
					return Lines.be()
				}
				const option=this.options[property.name]
				const nodePropertyJsName=this.nodeJsName+"."+property.name+(property.type=='range'?".value":"")
				const a=JsLines.b()
				if (option.input) {
					const inputJsName=this.getPropertyInputJsName(property.name)
					const inputHtmlName=this.getPropertyInputHtmlName(property.name)
					let value=inputJsName+".value"
					if (property.fn) {
						value=property.fn(value)
					}
					const eventProp=(property.type=='range'?'oninput':'onchange')
					a(
						"var "+inputJsName+"=document.getElementById('"+inputHtmlName+"');",
						// was for IE11 compat (but IE11 has no Web Audio): (property.type=='range'?inputJsName+".oninput=":"")+inputJsName+".onchange=function(){",
						";("+inputJsName+"."+eventProp+"=function(){",
						"	"+nodePropertyJsName+"="+value+";",
						"})();"
					)
				} else if (option.value!=option.defaultValue) {
					let value=option.value
					if (property.type=='select') {
						value="'"+value+"'"
					}
					if (property.fn) {
						value=property.fn(value)
					}
					a(
						nodePropertyJsName+"="+value+";"
					)
				}
				return a.e()
			})
		)
	}
	getCreateNodeJsLines(featureContext) {
		return featureContext.getConnectAssignJsLines(
			"var",this.nodeJsName,
			"ctx."+this.ctxCreateMethodName+"()",
			this.getPrevNodeJsNames()
		)
	}
	// abstract:
	get nodeProperties() {
		return []
	}
	// get ctxCreateMethodName()
}

// concrete classes

// TODO fix bug with parallel bypasses
// TODO fix bug with non-fixed inner element
// 	by insulating it with junctions - can't do it now b/c can't ask for junctions to be generated - graph has to do it
// 	(currently it's impossible to get this bug through options)
NodeClasses.bypass = class extends Node { // used when enableInput is set
	constructor(options,innerNode) {
		super(options)
		this.innerNode=innerNode
		if (this.options.enabled) {
			this.innerNode.prevNodes=this.prevNodes
			this.innerNode.nextNodes=this.nextNodes
		}
		// { passed to GenNode ctor
		this.rewireInput=(this.innerNode.upstreamEffect || !this.innerNode.downstreamEffect) // prefer to rewire inputs
		this.rewireOutput=this.innerNode.downstreamEffect
		// TODO rewire smaller side
		// } passed to GenNode ctor
	}
	set n(n) {
		super.n=n
		this.innerNode.n=n
	}
	get type() {
		return this.innerNode.type
	}
	get downstreamEffect() {
		return this.innerNode.downstreamEffect
	}
	get upstreamEffect() {
		return this.innerNode.upstreamEffect
	}
	get nInputJsNames() {
		return 100 // "infinity", can't use infinity directly b/c have to multiply by it
	}
	get nOutputJsNames() {
		return 100 // "infinity", can't use infinity directly b/c have to multiply by it
	}
	get passive() {
		return this.innerNode.passive
	}
	get fixedInput() {
		return this.passive
	}
	get fixedOutput() {
		return this.passive
	}
	getInputJsNames() {
		const names=[]
		if (this.options.enabled || !this.rewireInput) {
			names.push(...this.innerNode.getInputJsNames())
		}
		if (!this.options.enabled) {
			names.push(...this.getNextNodeJsNames())
		}
		return names
	}
	getOutputJsNames() {
		const names=[]
		if (this.options.enabled || !this.rewireOutput) {
			names.push(...this.innerNode.getOutputJsNames())
		}
		if (!this.options.enabled) {
			names.push(...this.getPrevNodeJsNames())
		}
		return names
	}
	requestFeatureContext(featureContext) {
		featureContext.audioContext=true
		this.innerNode.requestFeatureContext(featureContext)
	}
	getHtmlLines(featureContext,i18n) {
		const inputHtmlName=this.getPropertyInputHtmlName('enabled')
		return JsLines.bae(
			NoseWrapLines.b("<div>","</div>").ae(
				Lines.html`<input id=${inputHtmlName} type=checkbox checked=${this.options.enabled}>`,
				Lines.html`<label for=${inputHtmlName}>${i18n('options-output.enabled')}</label>` // TODO correct i18n
			),
			this.innerNode.getHtmlLines(featureContext,i18n)
		)
	}
	getInitJsLines(featureContext,i18n) {
		const inputHtmlName=this.getPropertyInputHtmlName('enabled')
		const a=JsLines.b()
		const rewire=(method,fromNames,toNames)=>{
			for (const fromName of fromNames) {
				for (const toName of toNames) {
					a(`\t\t${fromName}.${method}(${toName});`)
				}
			}
		}
		a(
			this.innerNode.getInitJsLines(featureContext,i18n),
			`document.getElementById('${inputHtmlName}').onchange=function(){`,
			`	if (this.checked) {`
		)
		rewire('disconnect',this.getPrevNodeJsNames(),this.getNextNodeJsNames())
		if (this.rewireInput) {
			rewire('connect',this.getPrevNodeJsNames(),this.innerNode.getInputJsNames())
		}
		if (this.rewireOutput) {
			rewire('connect',this.innerNode.getOutputJsNames(),this.getNextNodeJsNames())
		}
		a(
			`	} else {`
		)
		if (this.rewireOutput) {
			rewire('disconnect',this.innerNode.getOutputJsNames(),this.getNextNodeJsNames())
		}
		if (this.rewireInput) {
			rewire('disconnect',this.getPrevNodeJsNames(),this.innerNode.getInputJsNames())
		}
		rewire('connect',this.getPrevNodeJsNames(),this.getNextNodeJsNames())
		a(
			`	}`,
			`};`
		)
		return a.e()
	}
	getPreVisJsLines(featureContext,i18n) {
		return this.innerNode.getPreVisJsLines(featureContext,i18n)
	}
	getVisJsLines(featureContext,i18n) {
		return this.innerNode.getVisJsLines(featureContext,i18n)
	}
}

NodeClasses.junction = class extends FilterNode { // special node used as summator/junction
	get type() {
		return 'junction'
	}
	get ctxCreateMethodName() {
		return 'createGain'
	}
	get passive() {
		return true
	}
}

NodeClasses.activeJunction = class extends NodeClasses.junction { // to be inserted between non-fixed i/o nodes
	get passive() {
		return false // can't optimize away (TODO allow parallel merging)
	}
}

NodeClasses.compressor = class extends FilterNode {
	get type() {
		return 'compressor'
	}
	get ctxCreateMethodName() {
		return 'createDynamicsCompressor'
	}
}

module.exports=NodeClasses
