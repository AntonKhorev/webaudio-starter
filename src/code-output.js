'use strict'

const BaseCodeOutput=require('crnx-base/code-output')

class CodeOutput extends BaseCodeOutput {
	get defaultFormatting() {
		const formatting=super.defaultFormatting
		formatting.refs={
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
		return formatting
	}
	initDomProps() {
		super.initDomProps()
		this.$warnings=$()
	}
	applyUpdatedCode(i18n) {
		super.applyUpdatedCode(i18n)
		this.$warnings.toggle(!this.code.isInteresting)
	}
	writeButtons(i18n) {
		return super.writeButtons(i18n).append(
			" <span class='tip-warn'><span class='tip-content'>"+i18n('code-output.warning.jsfiddle-run')+"</span></span>"
		)
	}
	writeSectionSummary(sectionName,i18n) {
		const $section=super.writeSectionSummary(sectionName,i18n)
		const interestingWarningText="You need at least one source and some processing enabled to get interesting JavaScript code" // TODO i18n
		if (sectionName=='html' || sectionName=='js') {
			let $warning
			$section.append(
				" ",
				$warning=$("<span class='tip-warn'><span class='tip-content'>"+interestingWarningText+"</span></span>")
			)
			this.$warnings=this.$warnings.add($warning)
		}
		return $section
	}
}

module.exports=CodeOutput
