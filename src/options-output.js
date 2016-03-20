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
				option.$range=$("<span class='range'>").append(
					i18n('options-output.range')+" ",
					$rangeMinInput=writeMinMaxInput('min'),
					" .. ",
					$rangeMaxInput=writeMinMaxInput('max')
				),
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
			return option.$=$("<div class='option'>").append(
				"<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label> ",
				$select=$("<select id='"+id+"'>").append(
					option.availableValues.map(function(availableValue){
						return $("<option>").val(availableValue).html(i18n('options.'+option.fullName+'.'+availableValue))
					})
				).val(option.value).change(function(){
					option.value=this.value
				}),
				" ",
				$inputCheckbox=$("<input type='checkbox' id='"+inputCheckboxId+"'>")
					.prop('checked',option.input)
					.change(function(){
						option.input=$(this).prop('checked')
					}),
				" <label for='"+inputCheckboxId+"'>"+i18n('options-output.input')+"</label> ",
				$("<button type='button'>"+i18n('options-output.reset')+"</button>").click(function(){
					$select.val(option.defaultValue).change()
					$inputCheckbox.prop('checked',false).change()
				})
			)
		})
		optionClassWriters.set(Option.BiquadFilter,(option,writeOption,i18n,generateId)=>{
			const width=300
			const height=300
			const maxFreq=22050
			const frequencyArray=new Float32Array(width)
			const magnitudeArray=new Float32Array(width)
			const phaseArray=new Float32Array(width)
			for (let i=0;i<width;i++) {
				frequencyArray[i]=maxFreq/width*i
			}
			let shown=false
			let ctx,biquadNode
			let $magnitudeFigure, $phaseFigure
			let $magnitudeCanvas, $phaseCanvas
			return option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>").append(
				option.entries.map(writeOption),
				$("<div class='option'>").append(
					"<label>Frequency response:</label> ",
					$("<button type='button'>Show</button>").click(function(){
						if (!shown) {
							$(this).before(
								$magnitudeFigure=$("<figure>").append(
									"<figcaption>Magnitude</figcaption>",
									$magnitudeCanvas=$(`<canvas width='${width}' height='${height}'></canvas>`)
								),
								$phaseFigure=$("<figure>").append(
									"<figcaption>Phase</figcaption>",
									$phaseCanvas=$(`<canvas width='${width}' height='${height}'></canvas>`)
								)
							).text('Hide')
							shown=true
							if (!ctx) {
								ctx=new (AudioContext || webkitAudioContext)
								biquadNode=ctx.createBiquadFilter()
							}
							biquadNode.getFrequencyResponse(frequencyArray,magnitudeArray,phaseArray)
							const maxMagnitude=Math.max(...magnitudeArray)
							let magnitudeCanvasContext=$magnitudeCanvas[0].getContext('2d')
							magnitudeCanvasContext.beginPath()
							for (let i=0;i<width;i++) {
								const x=i
								const y=height*(1-magnitudeArray[i]/maxMagnitude)
								if (i==0) {
									magnitudeCanvasContext.moveTo(x,y)
								} else {
									magnitudeCanvasContext.lineTo(x,y)
								}
							}
							magnitudeCanvasContext.stroke()
						} else {
							$magnitudeFigure.remove()
							$phaseFigure.remove()
							$(this).text('Show')
							shown=false
						}
					})
				)
			)
		})
	}
}

module.exports=OptionsOutput
