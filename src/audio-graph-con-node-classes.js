'use strict'

const ConNode={}

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
	toGenNode(GenNode,name) {
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

class MediaElementNode extends Node {
	get downstreamEffect() {
		return true
	}
	get estimatedNOutputs() {
		return 1
	}
}

class FilterNode extends Node {
	get estimatedNInputs() {
		return 1
	}
	get estimatedNOutputs() {
		return 1
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

//// concrete classes

// TODO fix bug with parallel bypasses
// TODO fix bug with non-fixed inner element
// 	by insulating it with junctions - can't do it now b/c can't ask for junctions to be generated - graph has to do it
// 	(currently it's impossible to get this bug through options)
ConNode.bypass = class extends Node {  // used when enableInput is set
	constructor(options,innerNode) {
		super(options)
		this.innerNode=innerNode
		this.rewireInput=(this.innerNode.upstreamEffect || !this.innerNode.downstreamEffect) // prefer to rewire inputs
		this.rewireOutput=this.innerNode.downstreamEffect
		// TODO rewire smaller side
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
	get fixedInputs() {
		return this.passive
	}
	get fixedOutputs() {
		return this.passive
	}
	get estimatedNInputs() {
		return 100 // "infinity", can't use infinity directly b/c have to multiply by it
	}
	get estimatedNOutputs() {
		return 100 // "infinity", can't use infinity directly b/c have to multiply by it
	}
	toGenNode(GenNode,name) {
		return new GenNode.bypass(
			this.options,name,
			this.innerNode.toGenNode(GenNode,name),
			this.rewireInput,this.rewireOutput
		)
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

ConNode.convolver = class extends FilterNode {
	get type() {
		return 'convolver'
	}
}

ConNode.compressor = class extends FilterNode {
	get type() {
		return 'compressor'
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
}

module.exports=ConNode
