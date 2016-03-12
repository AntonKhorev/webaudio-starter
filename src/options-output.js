'use strict'

const Option=require('./option-classes')
const BaseOptionsOutput=require('crnx-base/options-output')

class OptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		super.setOptionClassWriters(optionClassWriters)
		optionClassWriters.set(Option.LiveNumber,(option,writeOption,i18n,generateId)=>{
			const p=option.precision
			const setInputAttrs=$input=>$input
				.attr('min',option.availableMin)
				.attr('max',option.availableMax)
				.attr('step',Math.pow(0.1,p).toFixed(p))
			const writeMinMaxInput=minOrMax=>setInputAttrs($("<input type='number' required>"))
				.val(option[minOrMax])
				.on('input change',function(){
					if (this.checkValidity()) {
						option[minOrMax]=parseFloat(this.value)
					}
				})
			const inputCheckboxId=generateId()
			let $inputCheckbox,$rangeMinInput,$rangeMaxInput
			const $output=optionClassWriters.get(Option.Number)(option,writeOption,i18n,generateId)
			$output.find('button').before(
				$inputCheckbox=$("<input type='checkbox' id='"+inputCheckboxId+"'>")
					.prop('checked',option.input)
					.change(function(){
						option.input=$(this).prop('checked')
					}),
				" <label for='"+inputCheckboxId+"'>"+i18n('options-output.input')+"</label> ",
				option.$range=$("<span class='range'>")
					.append(i18n('options-output.range')+" ")
					.append($rangeMinInput=writeMinMaxInput('min'))
					.append(" .. ")
					.append($rangeMaxInput=writeMinMaxInput('max')),
				" "
			).click(function(){
				$inputCheckbox.prop('checked',false).change()
				$rangeMinInput.val(option.defaultMin).change()
				$rangeMaxInput.val(option.defaultMax).change()
			})
			return $output
		})
		optionClassWriters.set(Option.LiveSelect,(option,writeOption,i18n,generateId)=>{
			const id=generateId()
			const inputCheckboxId=generateId()
			let $select,$inputCheckbox
			return option.$=$("<div class='option'>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
				.append(" ")
				.append(
					$select=$("<select id='"+id+"'>").append(
						option.availableValues.map(function(availableValue){
							return $("<option>").val(availableValue).html(i18n('options.'+option.fullName+'.'+availableValue))
						})
					).val(option.value).change(function(){
						option.value=this.value
					})
				)
				.append(" ")
				.append(
					$inputCheckbox=$("<input type='checkbox' id='"+inputCheckboxId+"'>")
						.prop('checked',option.input)
						.change(function(){
							option.input=$(this).prop('checked')
						})
				)
				.append(" <label for='"+inputCheckboxId+"'>"+i18n('options-output.input')+"</label> ")
				.append(
					$("<button type='button'>"+i18n('options-output.reset')+"</button>").click(function(){
						$select.val(option.defaultValue).change()
						$inputCheckbox.prop('checked',false).change()
					})
				)
		})
	}
}

module.exports=OptionsOutput
