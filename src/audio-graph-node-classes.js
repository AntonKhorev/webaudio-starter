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

module.exports=NodeClasses
