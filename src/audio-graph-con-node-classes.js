'use strict'

const Option=require('./option-classes')
const GenNode=require('./audio-graph-gen-node-classes')
const VisNode=require('./audio-graph-vis-node-classes')

const ConNode={}

const MANY=100 // "infinity", can't use infinity directly b/c have to multiply by it

//// abstract classes (not exported)

class Node {
	constructor(options={}) {
		this.options=options
		// can be set/modified by graph constructor:
		this.nextNodes=new Set
		this.prevNodes=new Set
		//this.n=undefined
	}
	// public:
	// get type() // required for n-assignment, can't do it by class with aggregation nodes like Node.bypass
	get passive() {
		return false
	}
	get downstreamEffect() {
		return false // source node
	}
	get upstreamEffect() {
		return false // destination or visualization node
	}
	get fixedInputs() {
		return true
	}
	get fixedOutputs() {
		return true
	}
	get estimatedNInputs() { // ok to overestimate
		return 0
	}
	get estimatedNOutputs() { // ok to overestimate
		return 0
	}
	get bypassable() {
		return false
	}
	toGenNode(name) {
		return new GenNode[this.type](this.options,name)
	}
	// public helpers:
	get estimatedNPrevNodeOutputs() {
		let count=0
		this.prevNodes.forEach(node=>{
			count+=node.estimatedNOutputs
		})
		return count
	}
	get estimatedNNextNodeInputs() {
		let count=0
		this.nextNodes.forEach(node=>{
			count+=node.estimatedNInputs
		})
		return count
	}
}

class ContainerNode extends Node {
	constructor(options,innerNode) {
		super(options)
		this.innerNode=innerNode
	}
	get type() {
		return this.innerNode.type
	}
	get passive() {
		return this.innerNode.passive
	}
	get downstreamEffect() {
		return this.innerNode.downstreamEffect
	}
	get upstreamEffect() {
		return this.innerNode.upstreamEffect
	}
}

class MediaElementNode extends Node {
	get downstreamEffect() {
		return true
	}
	get estimatedNOutputs() {
		return 1
	}
	get bypassable() {
		return true
	}
}

class FilterNode extends Node {
	get estimatedNInputs() {
		return 1
	}
	get estimatedNOutputs() {
		return 1
	}
	get bypassable() {
		return true
	}
}

class PassiveByDefaultFilterNode extends FilterNode {
	get passive() {
		return this.propertyNames.every(propertyName=>{
			const option=this.options[propertyName]
			return option.value==option.defaultValue && !option.input
		})
	}
	// protected:
	get propertyNames() {
		return []
	}
}

class VisualizationNode extends Node {
	get upstreamEffect() {
		return true
	}
	get estimatedNInputs() {
		return 1
	}
	get estimatedNOutputs() {
		return 1
	}
	toGenNode(name) {
		throw new Error(`Attempted to make GenNode for visualization ConNode.${this.type}`)
	}
	toVisNode() {
		return new VisNode[this.type](this.options)
	}
}

//// concrete classes

// TODO fix bug with parallel bypasses
// TODO fix bug with non-fixed inner element
// 	by insulating it with junctions - can't do it now b/c can't ask for junctions to be generated - graph has to do it
// 	(currently it's impossible to get this bug through options)
ConNode.bypass = class extends ContainerNode { // used when enableInput is set
	constructor(options,innerNode) {
		super(options,innerNode)
		this.rewireInput=(this.innerNode.upstreamEffect || !this.innerNode.downstreamEffect) // prefer to rewire inputs
		this.rewireOutput=this.innerNode.downstreamEffect
		// TODO rewire smaller side
	}
	get fixedInputs() {
		return this.passive
	}
	get fixedOutputs() {
		return this.passive
	}
	get estimatedNInputs() {
		return MANY
	}
	get estimatedNOutputs() {
		return MANY
	}
	toGenNode(name) {
		return new GenNode.bypass(
			this.options,name,
			this.innerNode.toGenNode(name),
			this.rewireInput,this.rewireOutput
		)
	}
}

ConNode.drywet = class extends ContainerNode {
	get estimatedNInputs() {
		return this.innerNode.estimatedNInputs+1
	}
	get estimatedNOutputs() {
		return 2
	}
	get bypassable() {
		return true
	}
	toGenNode(name) {
		return new GenNode.drywet(
			this.options,name,
			this.innerNode.toGenNode(name)
		)
	}
}

ConNode.analyser = class extends Node {
	constructor(options,innerNodes) { // options come from any inner node - only need options.logFftSize
		super(options)
		this.innerNodes=innerNodes
	}
	get type() {
		return 'analyser'
	}
	get upstreamEffect() {
		return true
	}
	get estimatedNInputs() {
		return 1
	}
	get estimatedNOutputs() {
		return 1
	}
	toGenNode(name) {
		const visNodes=this.innerNodes.map(innerNode=>innerNode.toVisNode())
		const genNode=new GenNode.analyser(this.options,name,visNodes)
		for (const visNode of visNodes) {
			visNode.initParent(genNode.nodeJsName)
		}
		return genNode
	}
	isEquivalentAnalyser(that) {
		return (
			that instanceof ConNode.analyser &&
			this.options.logFftSize.value==that.options.logFftSize.value
		)
	}
}

ConNode.stereoVolume = class extends Node {
	get type() {
		return 'stereoVolume'
	}
	get upstreamEffect() {
		return true
	}
	get estimatedNInputs() {
		return 1
	}
	toGenNode(name) {
		const visNodes=[
			new VisNode.volume(this.options),
			new VisNode.volume(this.options),
		]
		const genNode=new GenNode.stereoVolume(this.options,name,visNodes)
		visNodes[0].initParent(genNode.leftAnalyserNodeJsName)
		visNodes[1].initParent(genNode.rightAnalyserNodeJsName)
		return genNode
	}
}

ConNode.junction = class extends PassiveByDefaultFilterNode { // special node used as summator/junction
	get type() {
		return 'junction'
	}
}

ConNode.activeJunction = class extends ConNode.junction { // to be inserted between non-fixed i/o nodes
	// type is kept unchanged
	get passive() {
		return false // can't optimize away (TODO allow parallel merging)
	}
}

ConNode.audio = class extends MediaElementNode {
	get type() {
		return 'audio'
	}
}

ConNode.video = class extends MediaElementNode {
	get type() {
		return 'video'
	}
}

ConNode.sample = class extends Node {
	get type() {
		return 'sample'
	}
	get downstreamEffect() {
		return true
	}
	get fixedOutputs() {
		return false
	}
	get estimatedNOutputs() {
		return MANY
	}
}

ConNode.gain = class extends PassiveByDefaultFilterNode {
	get type() {
		return 'gain'
	}
	// protected:
	get propertyNames() {
		return ['gain']
	}
}

ConNode.panner = class extends PassiveByDefaultFilterNode {
	get type() {
		return 'panner'
	}
	// protected:
	get propertyNames() {
		return ['pan']
	}
}

ConNode.biquad = class extends FilterNode {
	get type() {
		return 'biquad'
	}
	get passive() {
		// lowshelf, highshelf and peaking are passive when gain==0
		return (
			!this.options.type.input && ['lowshelf','highshelf','peaking'].indexOf(this.options.type.value)>=0 &&
			!this.options.gain.input && this.options.gain==0
		)
	}
}

ConNode.iir = class extends FilterNode {
	get type() {
		return 'iir'
	}
	get passive() {
		// corresponding coefs are equal, sequences are of equal length or differ by trailing zero coefs
		const ff=JSON.parse('['+this.options.feedforward+']')
		const fb=JSON.parse('['+this.options.feedback+']')
		let i=0
		while (i<ff.length && i<fb.length) {
			if (ff[i]!=fb[i]) {
				return false
			}
			i++
		}
		for (let j=i;j<ff.length;j++) {
			if (ff[j]!=0) {
				return false
			}
		}
		for (let j=i;j<fb.length;j++) {
			if (fb[j]!=0) {
				return false
			}
		}
		return true
	}
}

ConNode.convolver = class extends FilterNode {
	get type() {
		return 'convolver'
	}
}

ConNode.equalizer = class extends FilterNode {
	get type() {
		return 'equalizer'
	}
	get passive() {
		return Option.EqualizerFilter.frequencies.every(freq=>{
			const option=this.options['gain'+freq]
			return option.value==0 && !option.input
		})
	}
}

ConNode.compressor = class extends FilterNode {
	get type() {
		return 'compressor'
	}
}

ConNode.waveform = class extends VisualizationNode {
	get type() {
		return 'waveform'
	}
}

ConNode.frequencyBars = class extends VisualizationNode {
	get type() {
		return 'frequencyBars'
	}
}

ConNode.frequencyOutline = class extends VisualizationNode {
	get type() {
		return 'frequencyOutline'
	}
}

ConNode.volume = class extends VisualizationNode {
	get type() {
		return 'volume'
	}
}

ConNode.destination = class extends Node {
	get type() {
		return 'destination'
	}
	get upstreamEffect() {
		return true
	}
	get estimatedNInputs() {
		return 1
	}
	get bypassable() {
		return true
	}
}

module.exports=ConNode
