'use strict'

const FilterOptionOutput=require('./filter-option-output')

class BiquadFilterOptionOutput extends FilterOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		let $cloneButton
		const computeCoefs=(type,frequency,detune,Q,gain)=>{
			// TODO frequency with detune
			// LPF
			const G=Math.pow(10,Q/20)
			//const omega_0=2*Math.PI*frequency/audioContext.sampleRate // TODO pass audioContext
			const omega_0=2*Math.PI*frequency/48000
			//
			const alpha_Q=Math.sin(omega_0)/(2*Q)
			const alpha_B=Math.sin(omega_0)/2*Math.sqrt((4-Math.sqrt(16-16/(G*G)))/2)
			const alpha=alpha_B
			const c=Math.cos(omega_0)
			return {
				feedforward: [(1-c)/2,1-c,(1-c)/2],
				feedback: [1+alpha,-2*c,1-alpha],
			}
		}
		this.$output.append(
			$("<div class='option'>").append(
				"<label>"+"Clone as IIR filter"+":</label> ", // TODO i18n
				$("<button type='button' class='clone'>"+"Clone with pre-2016-04-15 coefficients"+"</button>").click(function(){
					const fixedOption=option.fix()
					$(this).data('coefs',computeCoefs(
						fixedOption.type.value,
						fixedOption.frequency.value,
						fixedOption.detune.value,
						Math.pow(10,fixedOption.Q.value),
						fixedOption.gain.value
					))
				})
			)
		)
	}
	getFilterNode(audioContext) {
		const biquadNode=audioContext.createBiquadFilter()
		const fixedOption=this.option.fix()
		biquadNode.type=fixedOption.type.value
		biquadNode.frequency.value=fixedOption.frequency.value
		biquadNode.detune.value=fixedOption.detune.value
		biquadNode.Q.value=Math.pow(10,fixedOption.Q.value)
		biquadNode.gain.value=fixedOption.gain.value
		return biquadNode
	}
}

module.exports=BiquadFilterOptionOutput
