'use strict'

const BaseCodeOutput=require('crnx-base/code-output')

class CodeOutput extends BaseCodeOutput {
	constructor(generateCode,i18n) {
		super(generateCode,i18n)
		//const interestingWarningText=i18n('code-output.warning.interesting')
		const interestingWarningText="You need at least one source and some processing enabled to get interesting JavaScript code"
		this.$htmlInterestingWarning=$("<span class='tip-warn'><span class='tip-content'>"+interestingWarningText+"</span></span>")
		this.$jsInterestingWarning=$("<span class='tip-warn'><span class='tip-content'>"+interestingWarningText+"</span></span>")
		this.$sections['html'].find('summary').append(" ",this.$htmlInterestingWarning)
		this.$sections['js'].find('summary').append(" ",this.$jsInterestingWarning)
	}
	get refs() {
		return {
			context:     'https://www.w3.org/TR/webaudio/#AudioContext',
			source:      'https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode',
			gain:        'https://www.w3.org/TR/webaudio/#GainNode',
			panner:      'https://www.w3.org/TR/webaudio/#the-stereopannernode-interface',
			biquad:      'https://www.w3.org/TR/webaudio/#the-biquadfilternode-interface',
			iir:         'https://www.w3.org/TR/webaudio/#the-iirfilternode-interface',
			convolver:   'https://www.w3.org/TR/webaudio/#ConvolverNode',
			peaking:     'https://www.w3.org/TR/webaudio/#idl-def-BiquadFilterType.peaking',
			destination: 'https://www.w3.org/TR/webaudio/#AudioDestinationNode',
			compressor:  'https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface',
			analyser:    'https://www.w3.org/TR/webaudio/#the-analysernode-interface',
		}
	}
	writeButtons(getFormatting,i18n) {
		return super.writeButtons(getFormatting,i18n).append(
			" <span class='tip-warn'><span class='tip-content'>"+i18n('code-output.warning.jsfiddle-run')+"</span></span>"
		)
	}
	actualUpdate(generateCode,extractCode) {
		super.actualUpdate(generateCode,extractCode)
		this.$htmlInterestingWarning.toggle(!this.code.isInteresting)
		this.$jsInterestingWarning.toggle(!this.code.isInteresting)
	}
}

module.exports=CodeOutput
