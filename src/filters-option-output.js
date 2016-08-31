'use strict'

const Option=require('./option-classes')
const ArrayOptionOutput=require('crnx-base/array-option-output')

class FiltersOptionOutput extends ArrayOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		const gridSize=32
		const gridHeight=15
		let $lines,$nodes
		let $movedNode=null
		let movedX,movedY
		//const animations=new Map // can jQuery animations do it?
		const writeLine=(x1,y1,x2,y2)=>$(
			document.createElementNS("http://www.w3.org/2000/svg","line")
		).attr({stroke:'#000',x1,y1,x2,y2})
		const writeNode=(nodeName,x,y)=>$("<div class='node'>").append(
			$("<div class='node-section node-section-head'>").html(
				i18n(nodeName)
			),
			$("<div class='node-section'>")
		).css({
			left: x*gridSize,
			top: y*gridSize,
		}).mousedown(function(ev){
			const $node=$(this)
			$nodes.append($node)
			$movedNode=$node
			movedX=ev.pageX
			movedY=ev.pageY
		})
		this.$output.find('legend').after(
			$("<div class='graph'>").height(gridSize*gridHeight).append(
				$lines=$("<svg xmlns='http://www.w3.org/2000/svg' version='1.1'></svg>").append(
					writeLine(100,100,400,200)
				),
				$nodes=$("<div class='nodes'>").append(
					writeNode('options.sources',2,5),
					writeNode('options.destination',12,6)
				).mousemove(function(ev){
					if (!$movedNode) return
					const dx=ev.pageX-movedX
					const dy=ev.pageY-movedY
					const pos=$movedNode.position()
					$movedNode.css({
						left: pos.left+dx,
						top: pos.top+dy,
					})
					movedX+=dx
					movedY+=dy
				}).mouseup(function(){
					$movedNode=null
				})
			)
		)
	}
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
}

module.exports=FiltersOptionOutput
