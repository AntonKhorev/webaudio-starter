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
		let moving=true
		let $movedNode=null
		let movedX1,movedY1,movedX2,movedY2
		let isAnimated=false
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
			movedX1=ev.pageX
			movedY1=ev.pageY
			moving=true
			return false
		})
		let $node1,$node2,$line // temp vars
		const animate=()=>{
			isAnimated=false
			if ($movedNode) {
				const pos=$movedNode.position()
				$movedNode.css({
					left: pos.left+movedX2-movedX1,
					top: pos.top+movedY2-movedY1,
				})
				movedX1=movedX2
				movedY1=movedY2
				updateConnectionLine($line,$node1,$node2)
			}
			if (!moving) {
				$movedNode=null
			}
		}
		this.$output.find('legend').after(
			$("<div class='graph'>").height(gridSize*gridHeight).append(
				$lines=$("<svg xmlns='http://www.w3.org/2000/svg' version='1.1'></svg>"),
				$nodes=$("<div class='nodes'>").append(
					$node1=writeNode('options.sources',2,5),
					$node2=writeNode('options.destination',12,6)
				).mousemove(function(ev){
					if (!moving) return
					movedX2=ev.pageX
					movedY2=ev.pageY
					if (!isAnimated) {
						isAnimated=true
						requestAnimationFrame(animate)
					}
				}).mouseup(function(){
					moving=false
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
