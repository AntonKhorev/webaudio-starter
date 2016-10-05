'use strict'

// classes like GenNodes, but w/o inputs/outputs; to be aggregated by GenNode.analyser

const Feature=require('./feature')

const VisNode={}

//// abstract classes (not exported)

class Node extends Feature {
	constructor(options) {
		super()
		this.options=options
	}
}

//// concrete classes

VisNode.waveform = class extends Node {
}

module.exports=VisNode
