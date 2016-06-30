'use strict'

const writeTip=require('crnx-base/tip')
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
		this.$warnings.css('display',this.code.isInteresting?'none':'') // .toggle() won't work right with inline-block
	}
	writeButtons(i18n) {
		const $warning=writeTip('warn',i18n('code-output.warning.jsfiddle-run'))
		return super.writeButtons(i18n).append(" ",$warning)
	}
	writeSectionSummary(sectionName,i18n) {
		const $section=super.writeSectionSummary(sectionName,i18n)
		if (sectionName=='html' || sectionName=='js') {
			const $warning=writeTip('warn',i18n('code-output.warning.interesting'))
			$section.append(" ",$warning)
			this.$warnings=this.$warnings.add($warning)
		}
		return $section
	}
}

module.exports=CodeOutput
