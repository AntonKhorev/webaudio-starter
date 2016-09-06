'use strict'

const Node=require('./audio-graph-node-classes')
const Lines=require('crnx-base/lines')
const Feature=require('./feature')

class AudioGraph extends Feature {
	constructor(options) {
		super()
		const sourceNodes=new Set
		const destinationNode=new Node.destination
		// create nodes
		const indexedNodes=options.nodes.map(nodeOptions=>{
			let node=new Node[nodeOptions.nodeType](nodeOptions)
			if (node.isSource) {
				sourceNodes.add(node)
			}
			if (node.isDestination) {
				node=destinationNode
			}
			return node
		})
		// connect nodes
		for (let i=0;i<options.nodes.length;i++) {
			for (const j of options.nodes[i].next) {
				indexedNodes[i].nextNodes.add(indexedNodes[j])
				indexedNodes[j].prevNodes.add(indexedNodes[i])
			}
		}
		/*
		// TODO keep only nodes that are connected to both source and (destination or analyser)
		// 	can try to combine it with assignNumbersToNodes
		const liveNodes=new Set
		const liveNodesRec=(node)=>{
		}
		*/
		// TODO optimize out source elements connected directly to destination
		this.nodes=[]
		const sortNodes=()=>{
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
				this.nodes.push(node)
			}
			rec(destinationNode)
			classCounts.forEach((n,proto)=>{
				if (n==1) {
					delete classLastNodes.get(proto).n
				}
			})
		}
		sortNodes()
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(...this.nodes.map(node=>node.getHtmlLines(featureContext,i18n)))
	}
}

module.exports=AudioGraph
