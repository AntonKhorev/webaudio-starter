'use strict'

const Node=require('./audio-graph-node-classes')
const Lines=require('crnx-base/lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const Feature=require('./feature')

class AudioGraph extends Feature {
	constructor(options) {
		super()
		const createNodes=()=>{ // returns "indexed" nodes = nodes in order of the indexes used by options to represent graph edges
			const destinationNode=new Node.destination
			return options.nodes.map(nodeOptions=>{
				let node=new Node[nodeOptions.nodeType](nodeOptions)
				if (node instanceof Node.destination) {
					node=destinationNode
				}
				return node
			})
		}
		const connectNodes=(indexedNodes)=>{
			for (let i=0;i<options.nodes.length;i++) {
				for (const j of options.nodes[i].next) {
					indexedNodes[i].nextNodes.add(indexedNodes[j])
					indexedNodes[j].prevNodes.add(indexedNodes[i])
				}
			}
		}
		// TODO propagate upstream/downstream effects, clean up nodes that don't have both
		// 	can try to combine it with assignNumbersToNodes
		//		const liveNodes=new Set
		//		const liveNodesRec=(node)=>{
		//	then will have to assign numbers after cleaning up
		const sortNodes=(indexedNodes)=>{
			const sortedNodes=[]
			const visited=new Set
			const classCounts=new Map
			const classLastNodes=new Map
			const rec=(node)=>{
				if (visited.has(node)) return
				visited.add(node)
				node.prevNodes.forEach(rec)
				const proto=Object.getPrototypeOf(node)
				const n=classCounts.get(proto)+1||1
				classCounts.set(proto,n)
				classLastNodes.set(proto,node)
				node.n=n
				sortedNodes.push(node)
			}
			indexedNodes.forEach(rec)
			classCounts.forEach((n,proto)=>{
				if (n==1) {
					delete classLastNodes.get(proto).n
				}
			})
			return sortedNodes
		}
		const indexedNodes=createNodes()
		connectNodes(indexedNodes)
		this.nodes=sortNodes(indexedNodes)
	}
	requestFeatureContext(featureContext) {
		for (const node of this.nodes) {
			node.requestFeatureContext(featureContext)
		}
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(...this.nodes.map(node=>node.getHtmlLines(featureContext,i18n)))
	}
	getInitJsLines(featureContext,i18n) {
		if (featureContext.audioContext) {
			return InterleaveLines.bae(...this.nodes.map(node=>node.getInitJsLines(featureContext,i18n)))
		}
	}
}

module.exports=AudioGraph
