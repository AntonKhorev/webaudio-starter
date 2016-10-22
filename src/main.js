'use strict'

let idCounter=0
function generateId() {
	return 'webaudio-starter-id-'+(idCounter++)
}

const i18ns=require('./i18n')
const Options=require('./options')
const Code=require('./code')
const OptionsOutput=require('./options-output')
const CodeOutput=require('./code-output')

$(function(){
	$('.webaudio-starter').each(function(){
		const $container=$(this)
		const lang=$container.closest('[lang]').attr('lang')
		const i18n=i18ns(lang)
		const options=new Options({
			graph: [
				{
					nodeType: 'audio',
					x: 1,
					y: 1,
					next: 1,
				},{
					nodeType: 'biquad',
					x: 9,
					y: 1,
					next: 2,
				},{
					nodeType: 'destination',
					x: 17,
					y: 1,
				}
			],
		})
		const codeOutput=new CodeOutput(()=>new Code(options.fix(),i18n),i18n)
		options.addUpdateCallback(codeOutput.update)
		const optionsOutput=new OptionsOutput(options,generateId,i18n)
		$container.empty().append(
			optionsOutput.$output,
			codeOutput.$output
		)
	})
})
