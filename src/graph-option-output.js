'use strict'

const BaseOptionsOutput=require('crnx-base/options-output')
const Option=require('./option-classes')

class GraphOptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		// intentionally not calling super here
		// TODO
	}
}

class GraphOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		const gridSize=32
		const nodeWidth=6
		const $lines=$(
			"<svg xmlns='http://www.w3.org/2000/svg' version='1.1'>"+
			"<defs>"+
				"<marker id='circleMarker' markerWidth='8' markerHeight='8' refX='4' refY='4'>"+
					"<circle cx='4' cy='4' r='2' fill='#000' />"+
				"</marker>"+
			"</defs>"+
			"</svg>"
		)
		const $nodes=$("<div class='nodes'>") // TODO populate with default/imported entries
		let maxZIndex=0
		const writeLine=(x1,y1,x2,y2)=>$(
			document.createElementNS("http://www.w3.org/2000/svg","line")
		).attr({
			'marker-start': 'url(#circleMarker)', // TODO multiple overlaid markers look bad, scrap them
			'marker-end': 'url(#circleMarker)',
			stroke: '#000',
			'stroke-width': 2,
			x1,y1,x2,y2
		})
		const moveLine=($line,coords)=>{
			$line.attr(coords)
			$lines.append($line.detach()) // ie bug: this is required once markers are used; see http://stackoverflow.com/questions/15693178/svg-line-markers-not-updating-when-line-moves-in-ie10
		}
		/*
		const updateConnectionLine=($line,$node1,$node2)=>{
			const pos1=$node1.position()
			const pos2=$node2.position()
			$line.attr({
				x1: pos1.left+$node1.width(),
				y1: pos1.top+gridSize*1.5,
				x2: pos2.left,
				y2: pos2.top+gridSize*1.5
			})
		}
		*/
		const getNodeName=$node=>{
			const nodeOption=$node.data('option')
			const nodeIndex=$node.data('index')
			return i18n('options.'+nodeOption.fullName)+" #"+nodeIndex
		}
		const getNodePortCoords=($node,dirIndex)=>{
			const pos=$node.position()
			const x=pos.left+gridSize/2+dirIndex*gridSize*(nodeWidth-1)
			const y=pos.top+gridSize*1.5
			return [x,y]
		}
		const updateNodeSequence=()=>{
			const $selectOptions=$nodes.children().map(function(i){
				const $node=$(this)
				$node.data('index',i)
				$node.find('.number').text(i)
				return $(`<option value='${i}'>`).append(getNodeName($node))
			})
			option.nodes=$.map($nodes.children(),node=>{
				const $node=$(node)
				const next=[]
				$node.data('outs').forEach((line,thatNode)=>{
					next.push($(thatNode).data('index'))
				})
				return {
					entry: $node.data('option'),
					next,
					x: 0, // TODO real values - have to keep them in .data() too
					y: 0,
				}
			})
			$nodes.children().each(function(i){
				const $node=$(this)
				const writeLi=($toNode,dirIndex)=>$("<li>").append(
					$("<a>").attr('href','#'+$toNode.attr('id')).append(getNodeName($toNode)),
					" ",
					$("<button>Disconnect</button>").click(function(){ // TODO i18n
						disconnectNodes($node,$toNode,dirIndex)
					})
				)
				const $inList=$node.find('.node-port-in .node-port-controls ul').empty()
				$node.data('ins').forEach((line,thatNode)=>{
					$inList.append(writeLi($(thatNode),0))
				})
				const $outList=$node.find('.node-port-out .node-port-controls ul').empty()
				$node.data('outs').forEach((line,thatNode)=>{
					$outList.append(writeLi($(thatNode),1))
				})
				const $inSelect=$node.find('.node-port-in .node-port-controls select').empty()
				const $outSelect=$node.find('.node-port-out .node-port-controls select').empty()
				for (let j=0;j<$selectOptions.length;j++) {
					if (option.canConnect(j,i)) { // TODO optimize, currently it's O(n^3)
						$inSelect.append($selectOptions[j])
					}
					if (option.canConnect(i,j)) {
						$outSelect.append($selectOptions[j])
					}
				}
			})
			// jquery has problems with appending several detached element at once like this:
			// 	$nodes.find('.node-port-controls select').empty().append($options)
		}
		const disconnectNodes=($thisNode,$thatNode,dirIndex)=>{
			// TODO
		}
		const connectNodes=($thisNode,$thatNode,dirIndex)=>{
			const connectInToOut=($outNode,$inNode)=>{ // add edge: $outNode -> $inNode
				const $line=writeLine(
					...getNodePortCoords($outNode,1),
					...getNodePortCoords($inNode,0)
				)
				$lines.append($line)
				$outNode.data('outs').set($inNode[0],$line[0])
				$inNode.data('ins').set($outNode[0],$line[0])
			}
			if (dirIndex) {
				connectInToOut($thisNode,$thatNode)
			} else {
				connectInToOut($thatNode,$thisNode)
			}
			updateNodeSequence()
		}
		const deleteNode=($node)=>{
			$node.data('ins').forEach((line,thatNode)=>{
				$(thatNode).data('outs').delete($node[0])
				$(line).remove()
			})
			$node.data('outs').forEach((line,thatNode)=>{
				$(thatNode).data('ins').delete($node[0])
				$(line).remove()
			})
			$node.remove()
			updateNodeSequence()
		}
		const addNode=(nodeOption,gx0,gy0)=>{
			let $node
			const id=generateId()
			let dragAnimationId=null
			let snapAnimationId=null
			const writePort=(dirIndex)=>{
				const dirNames=['in','out'] // TODO i18n?
				const thisDir=dirNames[dirIndex]
				const $select=$("<select>")
				const $hole=$("<div class='node-port-hole'>").mousedown(function(ev){
					// {
					// doing caching for canConnect here b/c mousemove handler better work fast
					// TODO remove it once it's optimized in Option.AcyclicGraph
					const fromNodeIndex=$node.data('index')
					const canConnectToCache=Array($nodes.length)
					const canConnectTo=toNodeIndex=>{
						const cached=canConnectToCache[toNodeIndex]
						if (cached!=null) return cached
						return canConnectToCache[toNodeIndex]=(dirIndex
							? option.canConnect(fromNodeIndex,toNodeIndex)
							: option.canConnect(toNodeIndex,fromNodeIndex)
						)
					}
					// }
					const [x1,y1]=getNodePortCoords($node,dirIndex)
					const $line=writeLine(x1,y1,x1,y1)
					$lines.append($line)
					const documentHandlers={
						mouseup() {
							$(document).off(documentHandlers)
							$nodes.children().off(nodeHandlers)
							$line.remove()
						},
						mousemove(ev) {
							const nodesPos=$nodes.offset()
							const x2=ev.pageX-nodesPos.left
							const y2=ev.pageY-nodesPos.top
							moveLine($line,{x2,y2}) // TODO update in animation (?)
						},
					}
					const nodeHandlers={
						mouseup() {
							const $thatNode=$(this)
							if (canConnectTo($thatNode.data('index'))) {
								connectNodes($node,$thatNode,dirIndex)
							}
							// let documentHandlers.mouseup() do the clean up
						},
						mousemove(ev) {
							const $thatNode=$(this)
							if (canConnectTo($thatNode.data('index'))) {
								const [x2,y2]=getNodePortCoords($thatNode,1-dirIndex)
								moveLine($line,{x2,y2}) // TODO update in animation (?)
								ev.stopPropagation()
							}
						},
					}
					documentHandlers.mousemove(ev)
					$(document).on(documentHandlers)
					$nodes.children().on(nodeHandlers)
					return false // prevent $node.mousedown() and text selection
				})
				return $(`<div class='node-port node-port-${thisDir}'>`).append(
					$hole,
					$("<div class='node-port-label'>").append(
						`<span>audio </span>${thisDir}<span> connected to:</span>` // TODO i18n
					),
					$("<div class='node-port-controls'>").append(
						$("<ul>"), // connected nodes
						$select, // nodes that are possible to connect to
						$(`<button title='connect audio ${thisDir} to selected node'>`).append( // TODO i18n
							"<span>Connect</span>"
						).click(function(){
							const i=parseInt($select.val())
							if (i in $nodes) {
								connectNodes($node,$node[i],dirIndex)
							}
						})
					)
				)
			}
			$node=$(`<fieldset id='${id}' class='node'>`).data({
				option: nodeOption,
				ins: new Map(), // dom element -> line dom element
				outs: new Map(), // dom element -> line dom element
				// also has 'index' set by updateNodeSequence()
			}).append(
				$("<legend class='node-section'>").append(
					i18n('options.'+nodeOption.fullName),
					" ",
					`<span class='number-mark'>#<span class='number'></span></span>`
				),
				$("<div class='node-head-controls'>").append(
					// TODO top-left burger button for keyboard movement
					$("<button class='delete' title='"+i18n('options-output.delete.tip')+"'>").append(
						"<span>"+i18n('options-output.delete')+"</span>"
					).mousedown(function(ev){
						ev.stopPropagation() // prevent $node.mousedown()
					}).click(function(){
						cancelAnimationFrame(dragAnimationId)
						cancelAnimationFrame(snapAnimationId)
						deleteNode($node)
					})
				),
				$("<div class='node-section node-ports'>").append(
					writePort(0),
					writePort(1)
				)
			).css({
				left: gx0*gridSize,
				top: gy0*gridSize,
			}).mousedown(function(ev){
				cancelAnimationFrame(snapAnimationId)
				let dragX1=ev.pageX
				let dragY1=ev.pageY
				const handlers={
					mouseup() { // IE doesn't receive this event when the button is released outside the window (?)
						cancelAnimationFrame(dragAnimationId)
						dragAnimationId=null
						$(document).off(handlers)
						const pos=$node.position()
						const snapX1=pos.left
						const snapY1=pos.top
						let gx=Math.round(snapX1/gridSize)
						if (gx<0) gx=0
						let gy=Math.round(snapY1/gridSize)
						if (gy<0) gy=0
						// TODO store new grid positions, update options
						const snapX2=gx*gridSize
						const snapY2=gy*gridSize
						const snapDuration=150
						const snapStartTime=performance.now()
						const snapAnimationHandler=time=>{
							const t=time-snapStartTime
							if (t>=snapDuration) {
								$node.css({
									left: snapX2,
									top:  snapY2,
								})
								snapAnimationId=null
							} else {
								$node.css({
									left: snapX1+(snapX2-snapX1)*t/snapDuration,
									top:  snapY1+(snapY2-snapY1)*t/snapDuration,
								})
								snapAnimationId=requestAnimationFrame(snapAnimationHandler)
							}
						}
						snapAnimationId=requestAnimationFrame(snapAnimationHandler)
					},
					mousemove(ev) {
						const dragX2=ev.pageX
						const dragY2=ev.pageY
						if (dragAnimationId==null) {
							dragAnimationId=requestAnimationFrame(()=>{
								const pos=$node.position()
								$node.css({
									left: pos.left+dragX2-dragX1,
									top: pos.top+dragY2-dragY1,
								})
								dragX1=dragX2
								dragY1=dragY2
								dragAnimationId=null
							})
						}
					},
				}
				if ($node.css('z-index')<maxZIndex) {
					$node.css('z-index',++maxZIndex)
				}
				$(document).on(handlers)
				ev.preventDefault() // prevent text selection
			}).css('z-index',++maxZIndex)
			$nodes.append($node)
			updateNodeSequence()
		}
		// { copypasted from array-option-output
		const $buttons=$("<div class='buttons'>")
		option.availableTypes.forEach((type,i)=>{
			if (i) $buttons.append(" ")
			$buttons.append(
				$("<button type='button'>").html(
					i18n('options.'+option.fullName+'.'+type+'.add')
				).click(()=>{
					const nodeOption=option.makeEntry(type)
					addNode(nodeOption,1,1)
				})
			)
		})
		// }
		const $legend=$("<legend>"+i18n('options.'+option.fullName)+"</legend>")
		const $graph=$("<div class='graph'>").append(
			$lines,$nodes
		)
		this.$output=option.$=$("<fieldset>").append(
			$legend,
			$buttons, // TODO buttons for reordering/renumbering with toposort
			$graph
		)
	}
	// make clone button work
	/*
	writeDraggableSubOption(subOption,writeOption,i18n) {
		const $subOutput=super.writeDraggableSubOption(subOption,writeOption,i18n)
		const This=this
		if (subOption instanceof Option.BiquadFilter) {
			$subOutput.find('button.clone').click(function(){
				const $button=$(this)
				const coefs=$button.data('coefs')
				if (coefs) {
					const entry=This.option.makeEntry('iir',coefs)
					This.$entries.append(
						This.writeDraggableSubOption(entry,writeOption,i18n)
					)
					This.updateArrayEntries()
				}
			})
		}
		return $subOutput
	}
	*/
}

module.exports=GraphOptionOutput
