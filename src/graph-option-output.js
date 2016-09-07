'use strict'

const Option=require('./option-classes')

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
			let x1=ev.pageX
			let y1=ev.pageY
			let x2,y2
			let animated=false
			const animate=()=>{
				animated=false
				const pos=$node.position() // TODO what if it's deleted?
				$node.css({
					left: pos.left+x2-x1,
					top: pos.top+y2-y1,
				})
				x1=x2
				y1=y2
			}
			$nodes.append($node).mousemove(function(ev){
				x2=ev.pageX
				y2=ev.pageY
				if (!animated) {
					animated=true
					requestAnimationFrame(animate)
				}
			}).mouseup(function(){
				$nodes.off('mousemove mouseup')
				// TODO request snap animation
			})
			return false
		})
		// { copypasted from array-option-output
		const $buttons=$("<div class='buttons'>")
		option.availableTypes.forEach((type,i)=>{
			if (i) $buttons.append(" ")
			$buttons.append(
				$("<button type='button'>").html(
					i18n('options.'+option.fullName+'.'+type+'.add')
				).click(()=>{
					const subOption=option.makeEntry(type)
					$nodes.append(
						writeNode('options.'+subOption.fullName,0,0)
					)
					// TODO update option.nodes
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
