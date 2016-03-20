'use strict'

const debounce=require('crnx-base/fake-lodash/debounce')
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
			let audioContext,biquadNode
			let frequencyArray,magnitudeArray,phaseArray
			const initAudioContext=()=>{
				audioContext=new (AudioContext || webkitAudioContext)
				biquadNode=audioContext.createBiquadFilter()
				frequencyArray=new Float32Array(width)
				magnitudeArray=new Float32Array(width)
				phaseArray=new Float32Array(width)
				const maxFreq=audioContext.sampleRate/2
				for (let i=0;i<width;i++) {
					frequencyArray[i]=maxFreq/width*i
				}
			}
			let shown=false
			let $magnitudeFigure, $phaseFigure
			let magnitudeCanvasContext, phaseCanvasContext
			const updatePlots=()=>{
				biquadNode.type=option.entries[0].value
				biquadNode.frequency.value=option.entries[1].value
				biquadNode.Q.value=Math.pow(10,option.entries[2].value)
				biquadNode.gain.value=option.entries[3].value
				biquadNode.detune.value=option.entries[4].value
				biquadNode.getFrequencyResponse(frequencyArray,magnitudeArray,phaseArray)
				const plotResponse=(canvasContext,array)=>{
					const min=Math.min(...array)
					const max=Math.max(...array)
					canvasContext.clearRect(0,0,width,height)
					canvasContext.strokeStyle='#F00'
					canvasContext.beginPath()
					for (let i=0;i<width;i++) {
						const x=i
						//const y=height*(1-array[i]/max)
						const y=height*(1-(array[i]-min)/(max-min))
						if (i==0) {
							canvasContext.moveTo(x,y)
						} else {
							canvasContext.lineTo(x,y)
						}
					}
					canvasContext.stroke()
				}
				plotResponse(magnitudeCanvasContext,magnitudeArray)
				plotResponse(phaseCanvasContext,phaseArray)
			}
			const delayedUpdatePlots=debounce(updatePlots,50)
			return option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>").append(
				option.entries.map(writeOption),
				$("<div class='option'>").append(
					"<label>Frequency response:</label> ",
					$("<button type='button'>Show</button>").click(function(){
						if (!shown) {
							let $magnitudeCanvas, $phaseCanvas
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
							magnitudeCanvasContext=$magnitudeCanvas[0].getContext('2d')
							phaseCanvasContext=$phaseCanvas[0].getContext('2d')
							if (!audioContext) {
								initAudioContext()
							}
							updatePlots()
						} else {
							$magnitudeFigure.remove()
							$phaseFigure.remove()
							$(this).text('Show')
							shown=false
						}
					})
				)
			).on('input change',function(){
				if (shown) {
					delayedUpdatePlots()
				}
			})
		})
	}
}

module.exports=OptionsOutput
