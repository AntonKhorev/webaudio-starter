'use strict'

const Option=require('./option-classes')
const FilterNodeOptionOutput=require('./filter-node-option-output')

class EqualizerFilterNodeOptionOutput extends FilterNodeOptionOutput {
	getFilterNodes(audioContext) {
		const fixedOption=this.option.fix()
		return Option.EqualizerFilter.frequencies.map(freq=>{
			const biquadNode=audioContext.createBiquadFilter()
			biquadNode.type='peaking'
			biquadNode.frequency.value=freq
			biquadNode.gain.value=fixedOption['gain'+freq].value
			return biquadNode
		})
	}
}

module.exports=EqualizerFilterNodeOptionOutput
