'use strict'

const formatNumbers=require('crnx-base/format-numbers')
const writeTip=require('crnx-base/tip')
const Option=require('./option-classes')
const BaseOptionsOutput=require('crnx-base/options-output')
const GroupNodeOptionOutput=require('./group-node-option-output')
const BiquadFilterNodeOptionOutput=require('./biquad-filter-node-option-output')

// has .node-option option class name instead of .option
class NodeOptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		const writeMoreButton=($extraSection)=>{ // TODO i18n
			const $moreButtonText=$("<span>").html("More")
			return $("<button class='more' title='Show more options'>").append($moreButtonText).click(function(){
				const $button=$(this)
				if ($button.hasClass('more')) {
					$button.addClass('less').removeClass('more').attr('title',"Show less options")
					$moreButtonText.html("Less")
					$extraSection.show()
				} else {
					$button.addClass('more').removeClass('less').attr('title',"Show more options")
					$moreButtonText.html("More")
					$extraSection.hide()
				}
			})
		}
		optionClassWriters.set(Option.Select,(option,writeOption,i18n,generateId)=>{
			const valueId=value=>'options.'+option.fullName+'.'+value
			const id=generateId()
			return option.$=$("<div class='node-option'>").append(
				$("<span class='node-option-section node-option-section-text'>").append(
					this.getLeadLabel(id,i18n,option),
					$("<select id='"+id+"'>").append(
						option.availableValues.map(availableValue=>
							$("<option>").val(availableValue).html(i18n(valueId(availableValue)))
						)
					).val(option.value).change(function(){
						option.value=this.value
					})
				)
			)
		})
		optionClassWriters.set(Option.LiveSelect,(option,writeOption,i18n,generateId)=>{
			const $output=optionClassWriters.get(Option.Select)(option,writeOption,i18n,generateId)
			const $mainSection=$output.children('.node-option-section-text')
			const $select=$mainSection.children('select')
			const inputCheckboxId=generateId()
			const $inputCheckbox=$("<input type='checkbox' class='editable' id='"+inputCheckboxId+"'>").prop('checked',option.input).change(function(){
				option.input=$(this).prop('checked')
			})
			const $extraSection=$("<span class='node-option-section node-option-section-extra'>").append(
				$inputCheckbox,
				" <label class='editable-middle' for='"+inputCheckboxId+"'>"+i18n('options-output.input')+"</label> ",
				$("<button class='reset'>"+i18n('options-output.reset')+"</button>").click(function(){
					$select.val(option.defaultValue).change()
					$inputCheckbox.prop('checked',false).change()
				})
			).hide()
			$mainSection.append(
				" ",writeMoreButton($extraSection)
			)
			return $output.append(" ",$extraSection)
		})
		optionClassWriters.set(Option.Text,(option,writeOption,i18n,generateId)=>{
			const id=generateId()
			const listId=generateId()
			return option.$=$("<div class='node-option'>").append(
				$("<span class='node-option-section node-option-section-text'>").append(
					$(this.getLeadLabel(id,i18n,option)),
					$("<input type='text' id='"+id+"' list='"+listId+"' />")
						.val(option.value)
						.on('input change',function(){
							option.value=this.value
						}),
					" ",
					$("<datalist id='"+listId+"'>").append(
						option.availableValues.map(availableValue=>$("<option>").text(availableValue))
					)
				)
			) // TODO expand on focus
		})
		optionClassWriters.set(Option.Number,(option,writeOption,i18n,generateId)=>{
			const p=option.precision
			const inputAttrs={
				min: option.availableMin,
				max: option.availableMax,
				step: Math.pow(0.1,p).toFixed(p),
			}
			const setInputAttrsAndListeners=($input,$that)=>$input
				.attr(inputAttrs)
				.val(option.value)
				.on('input change',function(){
					if (this.checkValidity()) {
						$that.val(this.value)
						option.value=parseFloat(this.value)
					}
				})
			const id=generateId()
			const $sliderInput=$("<input type='range' id='"+id+"'>")
			const $numberInput=$("<input type='number' required>")
			const fmt=formatNumbers({
				min: option.availableMin,
				max: option.availableMax
			},option.precision)
			const $mainSection=$("<span class='node-option-section node-option-section-number'>").append(
				$("<span class='range-label'>").append(
					"<span class='min'>"+i18n.numberWithoutUnits(fmt.min,option.unit)+"</span> ",
					$("<label for='"+id+"'>"+i18n('options.'+option.fullName)+"</label>"),
					" <span class='max'>"+i18n.numberWithoutUnits(fmt.max,option.unit)+"</span>"
				),
				" <span class='units'>"+i18n.numberUnits(fmt.max,option.unit)+"</span> ",
				setInputAttrsAndListeners($sliderInput,$numberInput),
				" ",
				setInputAttrsAndListeners($numberInput,$sliderInput)
			)
			if (i18n.has('options-info.'+option.fullName)) {
				$mainSection.append(
					" ",writeTip('info',i18n('options-info.'+option.fullName))
				)
			}
			const $extraSection=$("<span class='node-option-section node-option-section-extra'>").append(
				$("<button class='reset'>"+i18n('options-output.reset')+"</button>").click(function(){
					$sliderInput.val(option.defaultValue).change()
				})
			).hide()
			$mainSection.append(
				" ",writeMoreButton($extraSection)
			)
			return option.$=$("<div class='node-option'>").append(
				$mainSection," ",$extraSection
			)
		})
		optionClassWriters.set(Option.LiveNumber,(option,writeOption,i18n,generateId)=>{
			const p=option.precision
			const inputAttrs={
				min: option.availableMin,
				max: option.availableMax,
				step: Math.pow(0.1,p).toFixed(p),
			}
			const writeMinMaxInput=minOrMax=>$("<input type='number' class='"+minOrMax+"' required>")
				.attr(inputAttrs)
				.val(option[minOrMax])
				.on('input change',function(){
					if (this.checkValidity()) {
						option[minOrMax]=parseFloat(this.value)
					}
				})
			const $output=optionClassWriters.get(Option.Number)(option,writeOption,i18n,generateId)
			const inputCheckboxId=generateId()
			const $inputCheckbox=$("<input type='checkbox' class='editable' id='"+inputCheckboxId+"'>").prop('checked',option.input).change(function(){
				option.input=$(this).prop('checked')
			})
			const $rangeMinInput=writeMinMaxInput('min')
			const $rangeMaxInput=writeMinMaxInput('max')
			const $rangeSpan1=$("<span>"+i18n('options-output.range')+"</span>")
			const $rangeSpan2=$("<span class='editable-bottom'>").append(
				$rangeMinInput," <span class='dots'>..</span> ",$rangeMaxInput
			)
			option.$range=$rangeSpan1.add($rangeSpan2)
			$output.find('button.reset').before(
				$inputCheckbox,
				" ",
				$("<span class='editable-top'>").append(
					"<label for='"+inputCheckboxId+"'>"+i18n('options-output.input')+"</label> ",
					$rangeSpan1
				),
				" ",
				$rangeSpan2,
				" "
			).click(function(){
				$inputCheckbox.prop('checked',false).change()
				$rangeMinInput.val(option.defaultMin).change()
				$rangeMaxInput.val(option.defaultMax).change()
			})
			return $output
		})
		optionClassWriters.set(Option.Group,function(){
			return new GroupNodeOptionOutput(...arguments).$output
		})
		optionClassWriters.set(Option.BiquadFilter,function(){
			return new BiquadFilterNodeOptionOutput(...arguments).$output
		})
	}
}

module.exports=NodeOptionsOutput
