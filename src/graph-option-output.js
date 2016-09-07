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
		const graphHeight=15
		const nodeWidth=6
		const $lines=$("<svg xmlns='http://www.w3.org/2000/svg' version='1.1'></svg>")
		const $nodes=$("<div class='nodes'>") // TODO populate with default/imported entries
		const writeConnectionLine=(gx1,gy1,gx2,gy2)=>{
			const writeLine=(x1,y1,x2,y2)=>$(
				document.createElementNS("http://www.w3.org/2000/svg","line")
			).attr({stroke:'#000',x1,y1,x2,y2})
			return writeLine(
				(gx1+nodeWidth)*gridSize,
				(gy1+1.5)*gridSize,
				gx2*gridSize,
				(gy2+1.5)*gridSize
			)
		}
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
		const addNode=(nodeOption,gx0,gy0)=>{
			let dragAnimationId=null
			let snapAnimationId=null
			const $node=$("<fieldset class='node'>").append(
				$("<legend class='node-section'>").append(
					i18n('options.'+nodeOption.fullName)
				),
				$("<div class='node-section node-head-controls'>").append(
					// TODO top-left burger button for keyboard movement
					$("<button class='delete' title='"+i18n('options-output.delete.tip')+"'>").append(
						"<span>"+i18n('options-output.delete')+"</span>"
					).mousedown(function(){
						return false // block $node.mousedown()
					}).click(function(){
						cancelAnimationFrame(dragAnimationId)
						cancelAnimationFrame(snapAnimationId)
						$node.remove()
						// TODO update option.nodes
					})
				),
				$("<div class='node-section'>").append(
					// TODO input port
					'audio signal' // TODO i18n
					// TODO output port
				)
			).css({
				left: gx0*gridSize,
				top: gy0*gridSize,
			}).mousedown(function(ev){
				cancelAnimationFrame(snapAnimationId)
				let dragX1=ev.pageX
				let dragY1=ev.pageY
				const handlers={
					mouseup() { // IE doesn't receive this event when the button is released outside the window
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
						if (gy>graphHeight-2) gy=graphHeight-2
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
				$nodes.append($node)
				$(document).on(handlers)
				return false
			})
			$nodes.append($node)
			// TODO update option.nodes
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
		this.$output=option.$=$("<fieldset>").append(
			"<legend>"+i18n('options.'+option.fullName)+"</legend>",
			$("<div class='graph'>").height(gridSize*graphHeight).append(
				$lines,$nodes
			),
			$buttons
		)
		//$lines.append($line=writeConnectionLine(2,5,12,6))
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
