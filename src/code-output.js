'use strict'

const BaseCodeOutput=require('crnx-base/code-output')

class CodeOutput extends BaseCodeOutput {
	get refs() {
		return {
			context:     'https://www.w3.org/TR/webaudio/#AudioContext',
			source:      'https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode',
			gain:        'https://www.w3.org/TR/webaudio/#GainNode',
			panner:      'https://www.w3.org/TR/webaudio/#the-stereopannernode-interface',
			biquad:      'https://www.w3.org/TR/webaudio/#the-biquadfilternode-interface',
			convolver:   'https://www.w3.org/TR/webaudio/#ConvolverNode',
			peaking:     'https://www.w3.org/TR/webaudio/#idl-def-BiquadFilterType.peaking',
			destination: 'https://www.w3.org/TR/webaudio/#AudioDestinationNode',
			compressor:  'https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface',
			analyser:    'https://www.w3.org/TR/webaudio/#the-analysernode-interface',
		}
	}
}

module.exports=CodeOutput
