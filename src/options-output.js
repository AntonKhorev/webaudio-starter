'use strict'

const Option=require('./option-classes')
const BaseOptionsOutput=require('crnx-base/options-output')
//const ArrayOptionOutput=require('crnx-base/array-option-output')
const GraphOptionOutput=require('./graph-option-output')
const BiquadFilterOptionOutput=require('./biquad-filter-option-output')
const IIRFilterOptionOutput=require('./iir-filter-option-output')
const EqualizerFilterOptionOutput=require('./equalizer-filter-option-output')

/*
class IIRFilterCoefsOptionOutput extends ArrayOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		this.updateArrayEntryLabels()
	}
	canDeleteEntry($entry) {
		return this.option.entries.length>1
	}
	updateArrayEntries() {
		super.updateArrayEntries()
		this.updateArrayEntryLabels()
	}
	updateArrayEntryLabels() {
		this.$entries.children().each(function(i){
			const c=$(this).data('option').name
			$(this).find('label').addClass('short').html(`${c}<sub>${i}</sub>:`)
		})
	}
}
*/

class OptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		super.setOptionClassWriters(optionClassWriters)
		optionClassWriters.set(Option.LiveSelect,(option,writeOption,i18n,generateId)=>{
			const id=generateId()
			let $select,$inputCheckbox
			return option.$=$("<div class='option'>").append( // not inheriting Option.Select b/c don't know how to handle reset button
				this.getLeadLabel(id,i18n,option),
				$select=$("<select id='"+id+"'>").append(
					option.availableValues.map(function(availableValue){
						return $("<option>").val(availableValue).html(i18n('options.'+option.fullName+'.'+availableValue))
					})
				).val(option.value).change(function(){
					option.value=this.value
				}),
				" ",
				$("<label class='nowrap'>").append(
					$inputCheckbox=$("<input type='checkbox'>")
						.prop('checked',option.input)
						.change(function(){
							option.input=$(this).prop('checked')
						}),
					" "+i18n('options-output.input')
				),
				" ",
				$("<button type='button'>"+i18n('options-output.reset')+"</button>").click(function(){
					$select.val(option.defaultValue).change()
					$inputCheckbox.prop('checked',false).change()
				})
			)
		})
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
		//optionClassWriters.set(Option.IIRFilterCoefs,function(){
		//	return new IIRFilterCoefsOptionOutput(...arguments).$output
		//})
		//optionClassWriters.set(Option.BiquadFilter,function(){
		//	return new BiquadFilterOptionOutput(...arguments).$output
		//})
		//optionClassWriters.set(Option.IIRFilter,function(){
		//	return new IIRFilterOptionOutput(...arguments).$output
		//})
		//optionClassWriters.set(Option.EqualizerFilter,function(){
		//	return new EqualizerFilterOptionOutput(...arguments).$output
		//})
		optionClassWriters.set(Option.Graph,function(){
			return new GraphOptionOutput(...arguments).$output
		})
	}
}

module.exports=OptionsOutput
