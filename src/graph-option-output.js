'use strict'

const formatNumbers=require('crnx-base/format-numbers')
const BaseOptionsOutput=require('crnx-base/options-output')
const Option=require('./option-classes')

// has .node-option option class name instead of .option
class NodeOptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		optionClassWriters.set(Option.Group,(option,writeOption,i18n,generateId)=>{
			return option.$=$("<div class='node-fieldset-container'>").append(
				$("<fieldset class='node-option'>").append(
					"<legend>"+i18n('options.'+option.fullName)+"</legend>",
					option.entries.map(writeOption)
				)
			)
		})
		optionClassWriters.set(Option.Text,(option,writeOption,i18n,generateId)=>{ // TODO fix mostly copypaste from crnx-base
			const id=generateId()
			const listId=generateId()
			return option.$=$("<div class='node-option'>").append(
				$("<span class='node-option-section node-option-section-text'>").append(
					$(this.getLeadLabel(id,i18n,option)),
					$("<input type='text' id='"+id+"' list='"+listId+"' />")
						.val(option.value)
						.on('input change',function(){
							option.value=this.value
						}),
					" ",
					$("<datalist id='"+listId+"'>").append(
						option.availableValues.map(availableValue=>$("<option>").text(availableValue))
					)
				)
			) // TODO expand on focus
		})
		optionClassWriters.set(Option.Number,(option,writeOption,i18n,generateId)=>{
			const p=option.precision
			const inputAttrs={
				min: option.availableMin,
				max: option.availableMax,
				step: Math.pow(0.1,p).toFixed(p),
			}
			const setInputAttrsAndListeners=($input,$that)=>$input
				.attr(inputAttrs)
				.val(option.value)
				.on('input change',function(){
					if (this.checkValidity()) {
						$that.val(this.value)
						option.value=parseFloat(this.value)
					}
				})
			const id=generateId()
			const $sliderInput=$("<input type='range' id='"+id+"'>")
			const $numberInput=$("<input type='number' required>")
			const fmt=formatNumbers({
				min: option.availableMin,
				max: option.availableMax
			},option.precision)
			const $moreButtonText=$("<span>").html("More")
			const $mainSection=$("<span class='node-option-section node-option-section-number'>").append(
				$("<span class='range-label'>").append(
					"<span class='min'>"+i18n.numberWithoutUnits(fmt.min,option.unit)+"</span> ",
					$("<label for='"+id+"'>"+i18n('options.'+option.fullName)+"</label>"),
					" <span class='max'>"+i18n.numberWithoutUnits(fmt.max,option.unit)+"</span>"
				),
				" <span class='units'>"+i18n.numberUnits(fmt.max,option.unit)+"</span> ",
				setInputAttrsAndListeners($sliderInput,$numberInput),
				" ",
				setInputAttrsAndListeners($numberInput,$sliderInput),
				" ",
				$("<button class='more' title='Show more options'>").append($moreButtonText).click(function(){ // TODO i18n
					const $button=$(this)
					if ($button.hasClass('more')) {
						$button.addClass('less').removeClass('more').attr('title',"Show less options")
						$moreButtonText.html("Less")
						$extraSection.show()
					} else {
						$button.addClass('more').removeClass('less').attr('title',"Show more options")
						$moreButtonText.html("More")
						$extraSection.hide()
					}
				})
			)
			const $extraSection=$("<span class='node-option-section node-option-section-extra'>").append(
				$("<button class='reset'>"+i18n('options-output.reset')+"</button>").click(function(){
					$sliderInput.val(option.defaultValue).change()
				})
			).hide()
			return option.$=$("<div class='node-option'>").append(
				$mainSection," ",$extraSection
			)
		})
		optionClassWriters.set(Option.LiveNumber,(option,writeOption,i18n,generateId)=>{
			const p=option.precision
			const inputAttrs={
				min: option.availableMin,
				max: option.availableMax,
				step: Math.pow(0.1,p).toFixed(p),
			}
			const writeMinMaxInput=minOrMax=>$("<input type='number' class='"+minOrMax+"' required>")
				.attr(inputAttrs)
				.val(option[minOrMax])
				.on('input change',function(){
					if (this.checkValidity()) {
						option[minOrMax]=parseFloat(this.value)
					}
				})
			const $output=optionClassWriters.get(Option.Number)(option,writeOption,i18n,generateId)
			const id=generateId()
			const $inputCheckbox=$("<input type='checkbox' class='editable' id='"+id+"'>").prop('checked',option.input).change(function(){
				option.input=$(this).prop('checked')
			})
			const $rangeMinInput=writeMinMaxInput('min')
			const $rangeMaxInput=writeMinMaxInput('max')
			const $rangeSpan1=$("<span>"+i18n('options-output.range')+"</span>")
			const $rangeSpan2=$("<span class='editable-bottom'>").append(
				$rangeMinInput," <span class='dots'>..</span> ",$rangeMaxInput
			)
			option.$range=$rangeSpan1.add($rangeSpan2)
			$output.find('button.reset').before(
				$inputCheckbox,
				" ",
				$("<span class='editable-top'>").append(
					"<label for='"+id+"'>"+i18n('options-output.input')+"</label> ",
					$rangeSpan1
				),
				" ",
				$rangeSpan2,
				" "
			).click(function(){
				$inputCheckbox.prop('checked',false).change()
				$rangeMinInput.val(option.defaultMin).change()
				$rangeMaxInput.val(option.defaultMax).change()
			})
			return $output
		})
	}
}

class GraphOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		const gridSize=32
		const nodeWidth=6
		const inactiveColor='#444';
		const closeColor='#C44';
		const $lines=$(
			"<svg xmlns='http://www.w3.org/2000/svg' version='1.1'>"+
			"<defs>"+
				"<marker id='circleMarker' markerWidth='8' markerHeight='8' refX='4' refY='4'>"+
					"<circle cx='4' cy='4' r='2' fill='"+inactiveColor+"' stroke='none' />"+
				"</marker>"+
			"</defs>"+
			"</svg>"
		)
		const $nodes=$("<div class='nodes'>") // TODO populate with default/imported entries
		let maxZIndex=0
		let outputPad // can hardwire to 11 (11px)
		const g2pCoord=(gCoord)=>{
			if (outputPad==null) outputPad=parseInt(this.$output.css('padding-left'))
			return outputPad+gridSize*gCoord
		}
		const p2gCoord=(pCoord)=>{
			if (outputPad==null) outputPad=parseInt(this.$output.css('padding-left'))
			return Math.round((pCoord-outputPad)/gridSize)
		}
		const writeVisibleLine=(x1,y1,x2,y2)=>$(
			document.createElementNS("http://www.w3.org/2000/svg","line")
		).attr({
			'marker-start': 'url(#circleMarker)', // TODO multiple overlaid markers look bad, scrap them
			'marker-end': 'url(#circleMarker)',
			stroke: inactiveColor,
			'stroke-width': 2,
			x1,y1,x2,y2
		})
		const writeInvisibleLine=(x1,y1,x2,y2)=>$(
			document.createElementNS("http://www.w3.org/2000/svg","line")
		).attr({
			stroke: inactiveColor,
			'stroke-width': 10,
			'stroke-opacity': 0,
			x1,y1,x2,y2
		})
		const moveLine=($line,coords)=>{
			$line.attr(coords)
			$lines.append($line.detach()) // ie bug: this is required once markers are used; see http://stackoverflow.com/questions/15693178/svg-line-markers-not-updating-when-line-moves-in-ie10
		}
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
				$node.data('outs').forEach(($line,thatNode)=>{
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
				$node.data('ins').forEach(($line,thatNode)=>{
					$inList.append(writeLi($(thatNode),0))
				})
				const $outList=$node.find('.node-port-out .node-port-controls ul').empty()
				$node.data('outs').forEach(($line,thatNode)=>{
					$outList.append(writeLi($(thatNode),1))
				})
				const $inSelect=$node.find('.node-port-in .node-port-controls select').empty()
				const $outSelect=$node.find('.node-port-out .node-port-controls select').empty()
				for (let j=0;j<$selectOptions.length;j++) {
					if (option.canConnectNodes(j,i)) {
						$inSelect.append($selectOptions[j])
					}
					if (option.canConnectNodes(i,j)) {
						$outSelect.append($selectOptions[j])
					}
				}
			})
			// jquery has problems with appending several detached element at once like this:
			// 	$nodes.find('.node-port-controls select').empty().append($options)
		}
		const disconnectNodes=($thisNode,$thatNode,dirIndex)=>{
			const disconnectInToOut=($outNode,$inNode)=>{ // remove edge: $outNode -> $inNode
				const $line=$outNode.data('outs').get($inNode[0])
				$outNode.data('outs').delete($inNode[0])
				$inNode.data('ins').delete($outNode[0])
				$line.remove()
			}
			if (dirIndex) {
				disconnectInToOut($thisNode,$thatNode)
			} else {
				disconnectInToOut($thatNode,$thisNode)
			}
			updateNodeSequence()
		}
		const connectNodes=($thisNode,$thatNode,dirIndex)=>{
			const connectInToOut=($outNode,$inNode)=>{ // add edge: $outNode -> $inNode
				const xy1=getNodePortCoords($outNode,1)
				const xy2=getNodePortCoords($inNode,0)
				const $vLine=writeVisibleLine(...xy1,...xy2)
				const $iLine=writeInvisibleLine(...xy1,...xy2)
				const $line=$vLine.add($iLine)
				$lines.append($line)
				$outNode.data('outs').set($inNode[0],$line)
				$inNode.data('ins').set($outNode[0],$line)
				$iLine.mouseover(function(){
					$vLine.attr('stroke',closeColor)
				}).mouseout(function(){
					$vLine.attr('stroke',inactiveColor)
				}).click(function(){
					disconnectNodes($thisNode,$thatNode,dirIndex)
				})
			}
			if (dirIndex) {
				connectInToOut($thisNode,$thatNode)
			} else {
				connectInToOut($thatNode,$thisNode)
			}
			updateNodeSequence()
		}
		const deleteNode=($node)=>{
			$node.data('ins').forEach(($line,thatNode)=>{
				$(thatNode).data('outs').delete($node[0])
				$line.remove()
			})
			$node.data('outs').forEach(($line,thatNode)=>{
				$(thatNode).data('ins').delete($node[0])
				$line.remove()
			})
			$node.remove()
			updateNodeSequence()
		}
		const addNode=(nodeOption,gx0,gy0)=>{
			const nodeOptionsOutput=new NodeOptionsOutput({root: nodeOption},generateId,i18n)
			const $node=nodeOptionsOutput.$output.children('fieldset')
			const id=generateId()
			let dragAnimationId=null
			let snapAnimationId=null
			const writePort=(dirIndex,isClosed)=>{
				const dirNames=['in','out'] // TODO i18n?
				const thisDir=dirNames[dirIndex]
				if (isClosed) {
					return $(`<div class='node-port node-port-${thisDir} node-port-closed'>`)
				}
				const $select=$("<select>")
				const $hole=$("<div class='node-port-hole'>").mousedown(function(ev){
					const fromNodeIndex=$node.data('index')
					const canConnectTo=($thatNode)=>{
						const toNodeIndex=$thatNode.data('index')
						return (dirIndex
							? option.canConnectNodes(fromNodeIndex,toNodeIndex)
							: option.canConnectNodes(toNodeIndex,fromNodeIndex)
						)
					}
					const [x1,y1]=getNodePortCoords($node,dirIndex)
					const $line=writeVisibleLine(x1,y1,x1,y1)
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
							if (canConnectTo($thatNode)) {
								connectNodes($node,$thatNode,dirIndex)
							}
							// let documentHandlers.mouseup() do the clean up
						},
						mousemove(ev) {
							const $thatNode=$(this)
							if (canConnectTo($thatNode)) {
								const [x2,y2]=getNodePortCoords($thatNode,1-dirIndex)
								moveLine($line,{x2,y2}) // TODO update in animation (?)
								ev.stopPropagation()
							}
						},
					}
					documentHandlers.mousemove(ev)
					$(document).on(documentHandlers)
					$nodes.children().on(nodeHandlers)
					return false // prevent text selection
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
			const writeBox=()=>{
				const $box=$("<div class='node-box'>")
				if (nodeOption.enableSwitch) {
					const enableSwitchId=generateId()
					$box.append(
						$(`<input type='checkbox' id='${enableSwitchId}'>`).prop('checked',nodeOption.enabled).change(function(){
							nodeOption.enabled=$(this).prop('checked')
						}),
						` <label for='${enableSwitchId}'>`+i18n('options-output.enabled')+`</label>`
					)
				}
				return $box
			}
			const writeAdditionalControls=()=>{
				// webaudio-starter specific code
				if (nodeOption.enableSwitch) {
					const enableInputSwitchId=generateId()
					return $("<div class='node-under-box-switch'>").append(
						$(`<input type='checkbox' id='${enableInputSwitchId}'>`).prop('checked',nodeOption.enabledInput).change(function(){
							nodeOption.enabledInput=$(this).prop('checked')
						}),
						` <label for='${enableInputSwitchId}'>switch</label>` // TODO i18n
					)
				}
			}
			$node.attr({
				id,
			}).css({
				left: g2pCoord(gx0),
				top: g2pCoord(gy0),
				'z-index': ++maxZIndex,
			}).data({
				option: nodeOption,
				ins: new Map(), // dom element -> line dom element
				outs: new Map(), // dom element -> line dom element
				// also has 'index' set by updateNodeSequence()
			})
			$node.children('legend').append(
				` <span class='number-mark'>#<span class='number'></span></span>`
			).after(
				$("<div class='node-head-controls'>").append(
					// TODO controls for keyboard movement
					$("<button class='delete' title='"+i18n('options-output.delete.tip')+"'>").append(
						"<span>"+i18n('options-output.delete')+"</span>"
					).click(function(){
						cancelAnimationFrame(dragAnimationId)
						cancelAnimationFrame(snapAnimationId)
						deleteNode($node)
					})
				),
				$("<div class='node-ports'>").append(
					writePort(0,!nodeOption.inEdges),
					writePort(1,!nodeOption.outEdges),
					writeBox(),
					writeAdditionalControls()
				)
			)
			$node.mousedown(function(ev){
				cancelAnimationFrame(snapAnimationId)
				let dragX1=ev.pageX
				let dragY1=ev.pageY
				const setNodePosition=(x,y)=>{
					$node.css({
						left: x,
						top: y,
					})
					const [x2,y2]=getNodePortCoords($node,0)
					$node.data('ins').forEach($line=>{
						moveLine($line,{x2,y2})
					})
					const [x1,y1]=getNodePortCoords($node,1)
					$node.data('outs').forEach($line=>{
						moveLine($line,{x1,y1})
					})
				}
				const handlers={
					mouseup() { // IE doesn't receive this event when the button is released outside the window (?)
						cancelAnimationFrame(dragAnimationId)
						dragAnimationId=null
						$(document).off(handlers)
						const pos=$node.position()
						const snapX1=pos.left
						const snapY1=pos.top
						let gx=p2gCoord(snapX1)
						if (gx<0) gx=0
						let gy=p2gCoord(snapY1)
						if (gy<0) gy=0
						// TODO store new grid positions, update options
						const snapX2=g2pCoord(gx)
						const snapY2=g2pCoord(gy)
						const snapDuration=150
						const snapStartTime=performance.now()
						const snapAnimationHandler=time=>{
							const t=time-snapStartTime
							if (t>=snapDuration) {
								setNodePosition(snapX2,snapY2)
								snapAnimationId=null
							} else {
								setNodePosition(
									snapX1+(snapX2-snapX1)*t/snapDuration,
									snapY1+(snapY2-snapY1)*t/snapDuration
								)
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
								setNodePosition(
									pos.left+dragX2-dragX1,
									pos.top +dragY2-dragY1
								)
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
			}).on('mousedown','input, button',function(ev){
				ev.stopPropagation() // don't run the handler defined above when using inputs
			})
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
					addNode(nodeOption,0,0)
				})
			)
		})
		// }
		const $legend=$("<legend>"+i18n('options.'+option.fullName)+"</legend>")
		const $graph=$("<div class='graph'>").append(
			$lines,$nodes
		)
		this.$output=option.$=$("<fieldset class='option'>").append(
			$legend,
			$buttons, // TODO buttons for reordering/renumbering with toposort
			$graph
		)
		const resizeAnimationHandler=()=>{ // would have done $graph.on('scroll resize',...), but there's no resize event for elements
			$lines.width($graph[0].clientWidth+$graph.scrollLeft())
			$lines.height($graph[0].clientHeight+$graph.scrollTop())
			requestAnimationFrame(resizeAnimationHandler)
		}
		resizeAnimationHandler()
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
