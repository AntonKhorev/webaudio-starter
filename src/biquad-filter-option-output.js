'use strict'

const FilterOptionOutput=require('./filter-option-output')

class BiquadFilterOptionOutput extends FilterOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		this.$output.append(
			$("<div class='option'>").append(
				"<label>"+"Clone as IIR filter"+":</label> ", // TODO i18n
				$("<button type='button' class='clone'>"+"Clone with pre-2016-04-15 coefficients"+"</button>")
					.data('feedforward',[1,2,3])
					.data('feedback',[4,5,6])
					/* TODO clone as IIR
					// LPF
					const Q=Math.pow(10,option.entries[2].value)
					const G=Math.pow(10,Q/20)
					const omega_0=2*Math.PI*option.entries[1].value/audioContext.sampleRate
					const alpha_Q=Math.sin(omega_0)/(2*Q)
					const alpha_B=Math.sin(omega_0)/2*Math.sqrt((4-Math.sqrt(16-16/(G*G)))/2)
					const alpha=alpha_B
					const c=Math.cos(omega_0)
					biquadNode=audioContext.createIIRFilter([(1-c)/2,1-c,(1-c)/2],[1+alpha,-2*c,1-alpha])
					*/
			)
		).on('input change',function(){
			// TODO update clone coefs
		})
	}
	getFilterNode(audioContext) {
		const biquadNode=audioContext.createBiquadFilter()
		biquadNode.type=this.option.entries[0].value
		biquadNode.frequency.value=this.option.entries[1].value
		biquadNode.Q.value=Math.pow(10,this.option.entries[2].value)
		biquadNode.gain.value=this.option.entries[3].value
		biquadNode.detune.value=this.option.entries[4].value
		return biquadNode
	}
}

module.exports=BiquadFilterOptionOutput
