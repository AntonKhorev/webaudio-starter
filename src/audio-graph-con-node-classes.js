'use strict'

const ConNode={}

//// abstract classes (not exported)

class Node {
	constructor() {
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
	toGenNode(GenNodeClass,jsName) {
		return new GenNodeClass(jsName)
	}
	// public helpers:
	get estimatedNPrevNodeOutputs() {
		let count=0
		this.prevNodes.forEach(node=>{
			count+=node.nOutputJsNames
		})
		return count
	}
	get estimatedNNextNodeInputs() {
		let count=0
		this.nextNodes.forEach(node=>{
			count+=node.nInputJsNames
		})
		return count
	}
}

class RequestedNode extends Node {
	constructor(options) {
		super()
		this.options=options
	}
	toGenNode(GenNodeClass,name) {
		return new GenNodeClass(name,this.options)
	}
}

class MediaElementNode extends RequestedNode {
	get downstreamEffect() {
		return true
	}
	get estimatedNOutputs() {
		return 1
	}
}

//// concrete classes

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

ConNode.gain = class extends RequestedNode {
	get type() {
		return 'gain'
	}
	get passive() {
		return this.propertyNames.every(propertyName=>{
			const option=this.options[propertyName]
			return option.value==option.defaultValue && !option.input
		})
	}
	get estimatedNInputs() {
		return 1
	}
	get estimatedNOutputs() {
		return 1
	}
	// protected:
	get propertyNames() {
		return ['gain']
	}
}

ConNode.destination = class extends RequestedNode {
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