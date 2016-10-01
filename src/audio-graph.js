'use strict'

const ConNode=require('./audio-graph-con-node-classes')
const GenNode=require('./audio-graph-gen-node-classes')
const Lines=require('crnx-base/lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const Feature=require('./feature')

// con-node = node used for graph construction
// gen-node = node used after graph construction
// input, output = web audio api node represented as js expression

class AudioGraph extends Feature {
	constructor(options) {
		super()
		const replaceNode=(oldNode,newNode)=>{
			newNode.prevNodes=oldNode.prevNodes
			newNode.nextNodes=oldNode.nextNodes
			oldNode.prevNodes.forEach(prevNode=>{
				prevNode.nextNodes.delete(oldNode)
				prevNode.nextNodes.add(newNode)
			})
			oldNode.nextNodes.forEach(nextNode=>{
				nextNode.prevNodes.delete(oldNode)
				nextNode.prevNodes.add(newNode)
			})
		}
		const deleteNode=(node)=>{
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
		}
		const createNodes=()=>{
			const distinctNodes=new Set()
			const destinationNode=new ConNode.destination
			const indexedNodes=options.nodes.map(nodeOptions=>{
				let node
				if (nodeOptions.enabled || nodeOptions.enabledInput) {
					node=new ConNode[nodeOptions.nodeType](nodeOptions)
				} else {
					node=new ConNode.junction
				}
				if (node instanceof ConNode.destination) {
					node=destinationNode
				}
				if (nodeOptions.enabledInput) {
					node=new ConNode.bypass(nodeOptions,node)
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
		const insertActiveJunctions=(inputNodes)=>{
			const outputNodes=[]
			for (const node of inputNodes) {
				outputNodes.push(node)
				if (node.fixedOutputs) continue
				const rewireNodes=[]
				node.nextNodes.forEach(nextNode=>{
					if (nextNode.fixedInputs) return
					rewireNodes.push(nextNode)
				})
				for (const nextNode of rewireNodes) {
					const junctionNode=new ConNode.activeJunction
					// { TODO insertNode(junctionNode,node,nextNode)
					node.nextNodes.delete(nextNode)
					node.nextNodes.add(junctionNode)
					junctionNode.prevNodes.add(node)
					nextNode.prevNodes.delete(node)
					nextNode.prevNodes.add(junctionNode)
					junctionNode.nextNodes.add(nextNode)
					// }
					outputNodes.push(junctionNode)
				}
			}
			return outputNodes
		}
		// TODO gain = 0 breaks, have to do before effect propagation
		const removePassiveNodes=(inputNodes)=>{
			const outputNodes=[]
			for (const node of inputNodes) {
				if (!node.passive) {
					outputNodes.push(node)
				} else {
					const removingWouldCreateTooManyConnections=()=>{
						const nInputs=node.estimatedNPrevNodeOutputs
						const nOutputs=node.estimatedNNextNodeInputs
						return nInputs*nOutputs>nInputs+nOutputs+1
					}
					const hasDirectParallelConnections=()=>{
						let parallel=false
						node.prevNodes.forEach(prevNode=>{
							prevNode.nextNodes.forEach(prevNextNode=>{
								parallel=parallel||node.nextNodes.has(prevNextNode)
							})
						})
						return parallel
					}
					if (removingWouldCreateTooManyConnections() || hasDirectParallelConnections()) {
						const junctionNode=new ConNode.junction
						replaceNode(node,junctionNode)
						outputNodes.push(junctionNode)
					} else {
						deleteNode(node)
					}
				}
			}
			return outputNodes
		}
		const removeUnaffectedNodes=(inputNodes)=>{
			const propagateEffect=(effectPropertyName,nodesPropertyName)=>{
				const visited=new Set
				const rec=(node)=>{
					if (visited.has(node)) return
					visited.add(node)
					node[nodesPropertyName].forEach(rec)
				}
				for (const node of inputNodes) {
					if (node[effectPropertyName]) {
						rec(node)
					}
				}
				return visited
			}
			const visitedDownstream=propagateEffect('downstreamEffect','nextNodes')
			const visitedUpstream=propagateEffect('upstreamEffect','prevNodes')
			return inputNodes.filter(node=>{
				if (visitedDownstream.has(node) && visitedUpstream.has(node)) {
					return true
				} else {
					deleteNode(node)
					return false
				}
			})
		}
		const sortNodes=(inputNodes)=>{
			const outputNodes=[]
			const visited=new Set
			const typeCounts={}
			const typeLastNodes={}
			const rec=(node)=>{
				if (visited.has(node)) return
				visited.add(node)
				node.prevNodes.forEach(rec)
				const n=typeCounts[node.type]+1||1
				typeCounts[node.type]=n
				typeLastNodes[node.type]=node
				node.n=n
				outputNodes.push(node)
			}
			inputNodes.forEach(rec)
			for (const type in typeCounts) {
				if (typeCounts[type]==1) {
					typeLastNodes[type].n=undefined
				}
			}
			return outputNodes
		}
		const createdNodes=insertActiveJunctions(createNodes())
		const filteredNodes=removeUnaffectedNodes(removePassiveNodes(createdNodes))
		const sortedNodes=sortNodes(filteredNodes)
		const conToGenMap=new Map
		const genNodes=sortedNodes.map(node=>{
			let name=node.type
			if (node.n!==undefined) {
				name+='.'+node.n
			}
			const genNode=node.toGenNode(GenNode,name)
			conToGenMap.set(node,genNode)
			return genNode
		})
		for (let i=0;i<sortedNodes.length;i++) {
			const translateConToGen=(conNodesSet)=>{
				const genNodes=[]
				conNodesSet.forEach(conNode=>{
					genNodes.push(conToGenMap.get(conNode))
				})
				return genNodes
			}
			genNodes[i].initEdges(
				translateConToGen(sortedNodes[i].prevNodes),
				translateConToGen(sortedNodes[i].nextNodes)
			)
		}
		this.nodes=genNodes
	}
	requestFeatureContext(featureContext) {
		for (const node of this.nodes) {
			node.requestFeatureContext(featureContext)
		}
	}
	getHtmlLines(featureContext,i18n) {
		return Lines.bae(
			...this.nodes.map(node=>NoseWrapLines.b(
				Lines.bae(
					"<fieldset>",
					"	<legend>"+i18n('options.graph.'+node.type)+"</legend>"
				),
				Lines.bae(
					"</fieldset>"
				)
			).ae(
				node.getHtmlLines(featureContext,i18n)
			))
		)
	}
	getInitJsLines(featureContext,i18n) {
		if (featureContext.audioContext) {
			return InterleaveLines.bae(...this.nodes.map(node=>node.getInitJsLines(featureContext,i18n)))
		}
	}
}

module.exports=AudioGraph
