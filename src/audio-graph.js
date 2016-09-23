'use strict'

const Node=require('./audio-graph-node-classes')
const Lines=require('crnx-base/lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const Feature=require('./feature')

class AudioGraph extends Feature {
	constructor(options) {
		super()
		const createNodes=()=>{
			const distinctNodes=new Set()
			const destinationNode=new Node.destination
			const indexedNodes=options.nodes.map(nodeOptions=>{
				let node=new Node[nodeOptions.nodeType](nodeOptions)
				if (node instanceof Node.destination) {
					node=destinationNode
				}
				distinctNodes.add(node)
				return node
			})
			for (let i=0;i<options.nodes.length;i++) {
				for (const j of options.nodes[i].next) {
					indexedNodes[i].nextNodes.add(indexedNodes[j])
					indexedNodes[j].prevNodes.add(indexedNodes[i])
				}
			}
			const outputNodes=[]
			distinctNodes.forEach(node=>{
				outputNodes.push(node)
			})
			return outputNodes
		}
		// TODO propagate upstream/downstream effects, clean up nodes that don't have both
		// 	can try to combine it with assignNumbersToNodes
		//		const liveNodes=new Set
		//		const liveNodesRec=(node)=>{
		//	then will have to assign numbers after cleaning up
		const removePassiveNodes=(inputNodes)=>{
			const outputNodes=[]
			for (const node of inputNodes) {
				if (!node.passive) {
					outputNodes.push(node)
				} else {
					const nInputs=node.prevNodeJsNameCount
					const nOutputs=node.nextNodeJsNameCount
					if (nInputs*nOutputs<=nInputs+nOutputs+1) { // is number of connections that cross-join would create acceptable?
						// delete node, cross-join its inputs and outputs
						node.prevNodes.forEach(prevNode=>{
							prevNode.nextNodes.delete(node)
							node.nextNodes.forEach(nextNode=>{
								prevNode.nextNodes.add(nextNode)
							})
						})
						node.nextNodes.forEach(nextNode=>{
							nextNode.prevNodes.delete(node)
							node.prevNodes.forEach(prevNode=>{
								nextNode.prevNodes.add(prevNode)
							})
						})
					} else {
						// replace node with passive node
						const passiveNode=new Node.passive
						passiveNode.prevNodes=node.prevNodes
						passiveNode.nextNodes=node.nextNodes
						node.prevNodes.forEach(prevNode=>{
							prevNode.nextNodes.delete(node)
							prevNode.nextNodes.add(passiveNode)
						})
						node.nextNodes.forEach(nextNode=>{
							nextNode.prevNodes.delete(node)
							nextNode.prevNodes.add(passiveNode)
						})
						outputNodes.push(passiveNode)
					}
				}
			}
			return outputNodes
		}
		const sortNodes=(inputNodes)=>{
			const outputNodes=[]
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
				outputNodes.push(node)
			}
			inputNodes.forEach(rec)
			classCounts.forEach((n,proto)=>{
				if (n==1) {
					delete classLastNodes.get(proto).n
				}
			})
			return outputNodes
		}
		const createdNodes=createNodes()
		const filteredNodes=removePassiveNodes(createdNodes)
		this.nodes=sortNodes(filteredNodes)
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
