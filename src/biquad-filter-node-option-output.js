'use strict'

const writeTip=require('crnx-base/tip')
const FilterNodeOptionOutput=require('./filter-node-option-output')

class BiquadFilterNodeOptionOutput extends FilterNodeOptionOutput {
	getFilterNodes(audioContext) {
		const biquadNode=audioContext.createBiquadFilter()
		const fixedOption=this.option.fix()
		biquadNode.type=fixedOption.type.value
		biquadNode.frequency.value=fixedOption.frequency.value
		biquadNode.detune.value=fixedOption.detune.value
		biquadNode.Q.value=Math.pow(10,fixedOption.Q.value)
		biquadNode.gain.value=fixedOption.gain.value
		return [biquadNode]
	}
	writeExtraSection(audioContext,i18n) {
		const computeCoefs=(sampleRate,type,frequency,detune,Q,gain,post20160415)=>{
			// constants defined in the spec
			const F_s=sampleRate
			const f_0=frequency*Math.pow(2,detune/1200)
			const G=gain
			const A=Math.pow(10,G/40)
			const omega_0=2*Math.PI*f_0/F_s
			const alpha_Q=Math.sin(omega_0)/(2*Q)
			const Q_dB=Math.pow(10,Q/20) // fix for incorrect alpha_B
			const alpha_B=Math.sin(omega_0)/2*Math.sqrt((4-Math.sqrt(16-16/(Q_dB*Q_dB)))/2) // was incorrect in the spec
			const alpha_Q_dB=Math.sin(omega_0)/(2*Q_dB) // introduced on 2016-04-15
			const S=1
			const alpha_S=Math.sin(omega_0)/2*Math.sqrt((A+1/A)*(1/S-1)+2)

			// shortcuts
			const c=Math.cos(omega_0)
			const aSA2=2*alpha_S*Math.sqrt(A)

			switch (type) {
			case 'lowpass':
				return [
					[(1-c)/2,   1-c, (1-c)/2],
					(post20160415
						? [1+alpha_Q_dB, -2*c, 1-alpha_Q_dB]
						: [1+alpha_B   , -2*c, 1-alpha_B   ]
					),
				]
			case 'highpass':
				return [
					[(1+c)/2, -(1+c), (1+c)/2],
					(post20160415
						? [1+alpha_Q_dB, -2*c, 1-alpha_Q_dB]
						: [1+alpha_B   , -2*c, 1-alpha_B   ]
					),
				]
			case 'bandpass':
				return [
					[alpha_Q, 0, -alpha_Q],
					[1+alpha_Q, -2*c, 1-alpha_Q],
				]
			case 'notch':
				return [
					[1, -2*c, 1],
					[1+alpha_Q, -2*c, 1-alpha_Q],
				]
			case 'allpass':
				return [
					[1-alpha_Q, -2*c, 1+alpha_Q],
					[1+alpha_Q, -2*c, 1-alpha_Q],
				]
			case 'peaking':
				return [
					[1+alpha_Q*A, -2*c, 1-alpha_Q*A],
					[1+alpha_Q/A, -2*c, 1-alpha_Q/A],
				]
			case 'lowshelf':
				return [
					[
						   A*( (A+1) - (A-1)*c + aSA2 ),
						 2*A*( (A-1) - (A+1)*c ),
						   A*( (A+1) - (A-1)*c - aSA2 ),
					],
					[
						       (A+1) + (A-1)*c + aSA2,
						  -2*( (A-1) + (A+1)*c ),
						       (A+1) + (A-1)*c - aSA2,
					],
				]
			case 'highshelf':
				return [
					[
						   A*( (A+1) + (A-1)*c + aSA2 ),
						-2*A*( (A-1) + (A+1)*c ),
						   A*( (A+1) + (A-1)*c - aSA2 ),
					],
					[
						       (A+1) - (A-1)*c + aSA2,
						   2*( (A-1) - (A+1)*c ),
						       (A+1) - (A-1)*c - aSA2,
					],
				]
			}
		}
		const This=this
		const writeCloneButton=(post20160415)=>{
			return $("<button type='button' class='clone'>"+i18n(
				'options-output.filter.biquad.clone.'+(post20160415?'post':'pre')
			)+"</button>").click(function(){
				const fixedOption=This.option.fix()
				const coefs=computeCoefs(
					audioContext.sampleRate,
					fixedOption.type.value,
					fixedOption.frequency.value,
					fixedOption.detune.value,
					Math.pow(10,fixedOption.Q.value),
					fixedOption.gain.value,
					post20160415
				)
				if (coefs) {
					const [ff,fb]=coefs
					$(this).data('coefs',{
						feedforward: ff.join(),
						feedback: fb.join(),
					})
				} else {
					$(this).removeData('coefs')
				}
			})
		}
		return $("<span class='node-option-section node-option-section-clone'>").append(
			//i18n('options-output.filter.biquad.clone'),
			//" ",
			writeCloneButton(false)//,
			//" ",
			//writeCloneButton(true),
			//" ",
			//writeTip('info',i18n('options-output.filter.biquad.clone.info'))
		)
	}
}

module.exports=BiquadFilterNodeOptionOutput
