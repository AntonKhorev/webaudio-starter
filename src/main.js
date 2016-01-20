'use strict';

let idCounter=0;
function generateId() {
	return 'webaudio-starter-id-'+(idCounter++);
}

const i18n=require('./i18n.js')('en');
const Options=require('./options.js');
const generateCode=require('./code.js');
const CodeOutput=require('./code-output');
const OptionsOutput=require('./options-output');

$(function(){
	$('.webaudio-starter').each(function(){
		const $container=$(this);
		const options=new Options();
		const codeOutput=new CodeOutput(()=>generateCode(options.fix(),i18n));
		options.updateCallback=codeOutput.update;
		const optionsOutput=new OptionsOutput(options,generateId,i18n);
		$container.empty()
			.append(optionsOutput.$output)
			.append(codeOutput.$output);
	})
});
