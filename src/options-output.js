'use strict'

const Option=require('./option-classes')
const BaseOptionsOutput=require('crnx-base/options-output')
const GraphOptionOutput=require('./graph-option-output')
//const EqualizerFilterOptionOutput=require('./equalizer-filter-option-output')

class OptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		super.setOptionClassWriters(optionClassWriters)
		/*
		// DON'T DELETE
		// TODO copy to crnx-base, here it's only for filter coefs
		optionClassWriters.set(Option.AnyFloat,(option,writeOption,i18n,generateId)=>{
			const id=generateId()
			return option.$=$("<div class='option'>").append(
				this.getLeadLabel(id,i18n,option),
				$("<input type='number' id='"+id+"' step='any' required>")
					.val(option.value)
					.on('input change',function(){
						if (this.checkValidity()) {
							option.value=parseFloat(this.value)
						}
					})
			)
		})
		*/
		//optionClassWriters.set(Option.EqualizerFilter,function(){
		//	return new EqualizerFilterOptionOutput(...arguments).$output
		//})
		optionClassWriters.set(Option.Graph,function(){
			return new GraphOptionOutput(...arguments).$output
		})
	}
}

module.exports=OptionsOutput
