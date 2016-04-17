'use strict'

const FilterOptionOutput=require('./filter-option-output')

class BiquadFilterOptionOutput extends FilterOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		let $cloneButton
		const computeCoefs=(type,frequency,detune,Q,gain)=>{
			//const F_s=audioContext.sampleRate // TODO pass audioContext
			const F_s=48000
			//
			const f_0=frequency*Math.pow(2,detune/1200)
			const G=gain
			const A=Math.pow(10,G/40)
			const omega_0=2*Math.PI*f_0/F_s
			const alpha_Q=Math.sin(omega_0)/(2*Q)
			const Q_B=Math.pow(10,Q/20) // fix for incorrect alpha_B
			const alpha_B=Math.sin(omega_0)/2*Math.sqrt((4-Math.sqrt(16-16/(Q_B*Q_B)))/2) // was incorrect in the spec
			const c=Math.cos(omega_0)
			switch (type) {
			case 'lowpass':
				return {
					feedforward: [(1-c)/2,1-c,(1-c)/2],
					feedback: [1+alpha_B,-2*c,1-alpha_B],
				}
			}
		}
		this.$output.append(
			$("<div class='option'>").append(
				"<label>"+"Clone as IIR filter"+":</label> ", // TODO i18n
				$("<button type='button' class='clone'>"+"Clone with pre-2016-04-15 coefficients"+"</button>").click(function(){
					const fixedOption=option.fix()
					const coefs=computeCoefs(
						fixedOption.type.value,
						fixedOption.frequency.value,
						fixedOption.detune.value,
						Math.pow(10,fixedOption.Q.value),
						fixedOption.gain.value
					)
					if (coefs) {
						$(this).data('coefs',coefs)
					} else {
						$(this).removeData('coefs')
					}
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
