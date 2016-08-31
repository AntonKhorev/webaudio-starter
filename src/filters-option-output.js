'use strict'

const Option=require('./option-classes')
const ArrayOptionOutput=require('crnx-base/array-option-output')

class FiltersOptionOutput extends ArrayOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		const gridSize=32
		const gridHeight=15
		this.$output.prepend(
			$("<div class='graph'>").height(gridSize*gridHeight).append(
				$("<div class='node'>").append(
					$("<div class='node-section node-section-head'>").html(
						i18n('options.sources')
					),
					$("<div class='node-section'>")
				),
				$("<div class='node'>").append(
					$("<div class='node-section node-section-head'>").html(
						i18n('options.destination')
					),
					$("<div class='node-section'>")
				)
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
