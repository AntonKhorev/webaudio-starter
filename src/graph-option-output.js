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
		const gridHeight=15
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
			let animationRequestId=null
			const $node=$("<div class='node'>").append(
				$("<div class='node-section node-section-head'>").append(
					i18n('options.'+nodeOption.fullName)+' ',
					$("<button class='delete' title='"+i18n('options-output.delete.tip')+"'>").append(
						"<span>"+i18n('options-output.delete')+"</span>"
					).mousedown(function(){
						return false // block $node.mousedown()
					}).click(function(){
						cancelAnimationFrame(animationRequestId)
						animationRequestId=null
						$node.remove()
						// TODO update option.nodes
					})
				),
				$("<div class='node-section'>")
			).css({
				left: gx0*gridSize,
				top: gy0*gridSize,
			}).mousedown(function(ev){
				let x1=ev.pageX
				let y1=ev.pageY
				let x2,y2
				const animate=()=>{
					animationRequestId=null
					const pos=$node.position()
					$node.css({
						left: pos.left+x2-x1,
						top: pos.top+y2-y1,
					})
					x1=x2
					y1=y2
				}
				const handlers={
					mouseup: function(){
						$nodes.off(handlers)
						// TODO request snap animation
					},
					mousemove: function(ev){
						if (ev.buttons&1) {
							x2=ev.pageX
							y2=ev.pageY
							if (animationRequestId==null) {
								animationRequestId=requestAnimationFrame(animate)
							}
						} else {
							handlers.mouseup()
						}
					},
				}
				$nodes.append($node).on(handlers)
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
			$("<div class='graph'>").height(gridSize*gridHeight).append(
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
