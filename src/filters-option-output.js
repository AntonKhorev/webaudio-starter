'use strict'

const Option=require('./option-classes')
const ArrayOptionOutput=require('crnx-base/array-option-output')

class FiltersOptionOutput extends ArrayOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		const gridSize=32
		const gridHeight=15
		let $nodes
		let $movedNode=null
		let movedX,movedY
		const writeNode=(nodeName,x,y)=>$("<div class='node'>").append(
			$("<div class='node-section node-section-head'>").html(
				i18n(nodeName)
			),
			$("<div class='node-section'>")
		).css({
			left: x,
			top: y,
		}).mousedown(function(ev){
			const $node=$(this)
			$nodes.append($node)
			$movedNode=$node
			movedX=ev.pageX
			movedY=ev.pageY
		})
		this.$output.prepend(
			$("<div class='graph'>").height(gridSize*gridHeight).append(
				$nodes=$("<div class='nodes'>").append(
					writeNode('options.sources',2*gridSize,5*gridSize),
					writeNode('options.destination',12*gridSize,6*gridSize)
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
