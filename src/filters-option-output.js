'use strict'

const Option=require('./option-classes')
const ArrayOptionOutput=require('crnx-base/array-option-output')

class FiltersOptionOutput extends ArrayOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		const gridSize=32
		const gridHeight=15
		const nodeWidth=6
		let $lines,$nodes
		let $movedNode=null
		let movedX,movedY
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
		const writeNode=(nodeName,gx,gy)=>$("<div class='node'>").append(
			$("<div class='node-section node-section-head'>").html(
				i18n(nodeName)
			),
			$("<div class='node-section'>")
		).css({
			left: gx*gridSize,
			top: gy*gridSize,
		}).mousedown(function(ev){
			const $node=$(this)
			$nodes.append($node)
			$movedNode=$node
			movedX=ev.pageX
			movedY=ev.pageY
		})
		let $node1,$node2,$line // temp vars
		this.$output.find('legend').after(
			$("<div class='graph'>").height(gridSize*gridHeight).append(
				$lines=$("<svg xmlns='http://www.w3.org/2000/svg' version='1.1'></svg>"),
				$nodes=$("<div class='nodes'>").append(
					$node1=writeNode('options.sources',2,5),
					$node2=writeNode('options.destination',12,6)
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
					updateConnectionLine($line,$node1,$node2)
				}).mouseup(function(){
					$movedNode=null
				})
			)
		)
		$lines.append($line=writeConnectionLine(2,5,12,6))
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
