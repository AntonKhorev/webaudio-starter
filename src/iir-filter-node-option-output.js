'use strict'

const FilterNodeOptionOutput=require('./filter-node-option-output')

class IIRFilterNodeOptionOutput extends FilterNodeOptionOutput {
	getFilterNodes(audioContext) {
		return [audioContext.createIIRFilter(
			JSON.parse('['+this.option.entries[0].value+']'),
			JSON.parse('['+this.option.entries[1].value+']')
		)]
	}
}

module.exports=IIRFilterNodeOptionOutput
