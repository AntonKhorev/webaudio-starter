'use strict'

const Option=require('./option-classes')
const FilterOptionOutput=require('./filter-option-output')

class EqualizerFilterOptionOutput extends FilterOptionOutput {
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

module.exports=EqualizerFilterOptionOutput
