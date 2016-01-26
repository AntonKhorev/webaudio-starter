'use strict';

const Option=require('./option-classes.js');
const BaseOptionsOutput=require('../base/options-output.js');

class OptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		super.setOptionClassWriters(optionClassWriters);
		optionClassWriters.set(Option.LiveNumber,(option,writeOption,i18n,generateId)=>{
			const setInputAttrs=$input=>$input
				.attr('min',option.availableMin)
				.attr('max',option.availableMax)
				.attr('step',option.step);
			const setInputAttrsAndListeners=($input,getOtherInput)=>setInputAttrs($input)
				.val(option.value)
				.on('input change',function(){
					if (this.checkValidity()) {
						const $that=getOtherInput();
						$that.val(this.value);
						option.value=parseFloat(this.value);
					}
				});
			const writeMinMaxInput=minOrMax=>setInputAttrs($("<input type='number' required>"))
				.val(option[minOrMax])
				.on('input change',function(){
					if (this.checkValidity()) {
						option[minOrMax]=parseFloat(this.value);
					}
				});
			const id=generateId();
			const inputCheckboxId=generateId();
			let $sliderInput,$numberInput,$inputSelect;
			let $rangeMinInput,$rangeMaxInput;
			return option.$=$("<div class='option'>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
				.append(" <span class='min'>"+option.availableMin+"</span> ")
				.append($sliderInput=setInputAttrsAndListeners(
					$("<input type='range' id='"+id+"'>"),
					()=>$numberInput
				))
				.append(" <span class='max'>"+option.availableMax+"</span> ")
				.append($numberInput=setInputAttrsAndListeners(
					$("<input type='number' required>"),
					()=>$sliderInput
				))
				/*
				.append(" <label for='"+inputSelectId+"'>"+i18n('ui.inputs')+":</label> ")
				.append(
					$inputSelect=$("<select id='"+inputSelectId+"'>").append(
						option.availableInputTypes.map(availableInputType=>
							$("<option>").val(availableInputType).html(i18n('ui.inputs.'+availableInputType))
						)
					).val(option.input).change(function(){
						option.input=this.value;
					})
				)
				.append(" ")
				*/
				.append(
					$("<input type='checkbox' id='"+inputCheckboxId+"'>")
						.prop('checked',option.input)
						.change(function(){
							option.input=$(this).prop('checked');
						})
				)
				.append(" <label for='"+inputCheckboxId+"'>"+i18n('options-output.input')+"</label> ")
				//
				.append(
					option.$range=$("<span class='range'>")
						.append(i18n('options-output.range')+" ")
						.append($rangeMinInput=writeMinMaxInput('min'))
						.append(" .. ")
						.append($rangeMaxInput=writeMinMaxInput('max'))
				)
				.append(" ")
				.append(
					$("<button type='button'>"+i18n('options-output.reset')+"</button>").click(function(){
						$sliderInput.val(option.defaultValue).change();
						$inputSelect.val('constant').change();
						$rangeMinInput.val(option.availableMin).change();
						$rangeMaxInput.val(option.availableMax).change();
					})
				);
		});
	}
}

module.exports=OptionsOutput;
