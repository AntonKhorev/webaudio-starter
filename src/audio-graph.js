'use strict'

const ConNode=require('./audio-graph-con-node-classes')
const Lines=require('crnx-base/lines')
const InterleaveLines=require('crnx-base/interleave-lines')
const NoseWrapLines=require('crnx-base/nose-wrap-lines')
const JsLines=require('crnx-base/js-lines')
const RefLines=require('crnx-base/ref-lines')
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
			const createNodesAndScores=()=>options.nodes.map((nodeOptions)=>{
				let destinationScore=0
				let node=new ConNode[nodeOptions.nodeType](nodeOptions)
				if (node instanceof ConNode.destination) {
					destinationScore=1
				}
				if (node instanceof ConNode.convolver) {
					if (nodeOptions.wet==0 && !nodeOptions.wet.input) {
						node=new ConNode.junction
						destinationScore=0
					} else if (nodeOptions.wet!=1 || nodeOptions.wet.input) {
						node=new ConNode.drywet(nodeOptions,node)
					}
				}
				if (node.bypassable) {
					if (!nodeOptions.enabled && !nodeOptions.enabledInput) {
						node=new ConNode.junction
						destinationScore=0
					} else if (nodeOptions.enabledInput) {
						node=new ConNode.bypass(nodeOptions,node)
						destinationScore*=2+nodeOptions.enabled
					}
				}
				return [node,destinationScore]
			})
			const keepBestNodes=(nodesAndScores)=>{ // got to have only one "best" destination node
				let bestNode=null
				let bestScore=0 // interested only in scores above 0
				for (let i=0;i<nodesAndScores.length;i++) {
					let [node,score]=nodesAndScores[i]
					if (score>bestScore) {
						bestNode=node
						bestScore=score
					}
				}
				return nodesAndScores.map(([node,score])=>{
					if (bestNode!=null && score>0) {
						return bestNode
					} else {
						return node
					}
				})
			}
			const linkNodes=(nodes)=>{
				for (let i=0;i<options.nodes.length;i++) {
					for (const j of options.nodes[i].next) {
						nodes[i].nextNodes.add(nodes[j])
						nodes[j].prevNodes.add(nodes[i])
					}
				}
				return nodes
			}
			const keepDistinctNodes=(inputNodes)=>{
				const outputNodes=[]
				const visited=new Set
				for (const node of inputNodes) {
					if (visited.has(node)) continue
					visited.add(node)
					outputNodes.push(node)
				}
				return outputNodes
			}
			return keepDistinctNodes(linkNodes(keepBestNodes(createNodesAndScores())))
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
		const wrapVisualizationNodes=(inputNodes)=>{
			return inputNodes.map(node=>{
				if (node.toVisNode) {
					const analyserNode=new ConNode.analyser(node.options,[node])
					replaceNode(node,analyserNode)
					return analyserNode
				} else {
					return node
				}
			})
		}
		const combineAnalyserNodes=(inputNodes)=>{
			const outputNodes=[]
			const visited=new Set
			const rec=(node)=>{
				if (visited.has(node)) return
				visited.add(node)
				if (
					node instanceof ConNode.analyser &&
					node.nextNodes.size==1 // can relax this condition with output nonintersection check
				) {
					let nextNodesToCombine=[]
					node.nextNodes.forEach(nextNode=>{
						if (
							nextNode instanceof ConNode.analyser &&
							node.options.logFftSize.value==nextNode.options.logFftSize.value
						) {
							nextNodesToCombine.push(nextNode)
						}
					})
					for (const nextNode of nextNodesToCombine) {
						visited.add(nextNode)
						node.innerNodes.push(...nextNode.innerNodes)
						deleteNode(nextNode)
					}
				}
				// TODO while loop to combine more than two analysers
				outputNodes.push(node)
			}
			for (const node of inputNodes) {
				rec(node)
			}
			return outputNodes
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
		const conNodes=[
			insertActiveJunctions,removePassiveNodes,removeUnaffectedNodes,
			wrapVisualizationNodes,combineAnalyserNodes,
			sortNodes
		].reduce(
			(nodes,transform)=>transform(nodes),
			createNodes()
		)
		const conToGenMap=new Map
		const genNodes=conNodes.map(node=>{
			let name=node.type
			if (node.n!==undefined) {
				name+='.'+node.n
			}
			const genNode=node.toGenNode(name)
			conToGenMap.set(node,genNode)
			return genNode
		})
		for (let i=0;i<conNodes.length;i++) {
			const translateConToGen=(conNodesSet)=>{
				const genNodes=[]
				conNodesSet.forEach(conNode=>{
					genNodes.push(conToGenMap.get(conNode))
				})
				return genNodes
			}
			genNodes[i].initEdges(
				translateConToGen(conNodes[i].prevNodes),
				translateConToGen(conNodes[i].nextNodes)
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
		if (!featureContext.audioContext) return JsLines.be()
		return InterleaveLines.bae(...this.nodes.map(node=>{
			const nodeJsLines=node.getInitJsLines(featureContext,i18n)
			if (nodeJsLines.isEmpty()) {
				return nodeJsLines
			} else {
				return JsLines.bae(
					RefLines.parse("// "+i18n('comment.graph.'+node.jsCommentType)),
					nodeJsLines
				)
			}
		}))
	}
	getPreVisJsLines(featureContext,i18n) {
		if (!featureContext.audioContext) return JsLines.be()
		return JsLines.bae(
			...this.nodes.map(node=>node.getPreVisJsLines(featureContext,i18n))
		)
	}
	getVisJsLines(featureContext,i18n) {
		if (!featureContext.audioContext) return JsLines.be()
		return JsLines.bae(
			...this.nodes.map(node=>node.getVisJsLines(featureContext,i18n))
		)
	}
}

module.exports=AudioGraph
