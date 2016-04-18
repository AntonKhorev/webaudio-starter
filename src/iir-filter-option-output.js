'use strict'

const FilterOptionOutput=require('./filter-option-output')

class IIRFilterOptionOutput extends FilterOptionOutput {
	getFilterNodes(audioContext) {
		return [audioContext.createIIRFilter(
			this.option.entries[0].entries.map(entry=>entry.value),
			this.option.entries[1].entries.map(entry=>entry.value)
		)]
	}
}

module.exports=IIRFilterOptionOutput
