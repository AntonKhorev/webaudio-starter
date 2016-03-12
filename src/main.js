'use strict'

let idCounter=0
function generateId() {
	return 'webaudio-starter-id-'+(idCounter++)
}

const i18n=require('./i18n')('en')
const Options=require('./options')
const Code=require('./code')
const OptionsOutput=require('./options-output')
const CodeOutput=require('./code-output')

$(function(){
	$('.webaudio-starter').each(function(){
		const $container=$(this)
		const options=new Options()
		const codeOutput=new CodeOutput(()=>new Code(options.fix(),i18n),i18n)
		options.updateCallback=codeOutput.update
		const optionsOutput=new OptionsOutput(options,generateId,i18n)
		$container.empty().append(
			optionsOutput.$output,
			codeOutput.$output
		)
	})
})
