'use strict'

const debounce=require('crnx-base/fake-lodash/debounce')
const formatNumbers=require('crnx-base/format-numbers')
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
			const pad=30
			const maxNGridLines=10
			const fontSize=10
			const fontOffset=3
			let audioContext,biquadNode
			let frequencyArray,magnitudeArray,phaseArray
			const initAudioContext=()=>{
				try {
					audioContext=new (AudioContext || webkitAudioContext)
					biquadNode=audioContext.createBiquadFilter()
					frequencyArray=new Float32Array(width)
					magnitudeArray=new Float32Array(width)
					phaseArray=new Float32Array(width)
					const maxFreq=audioContext.sampleRate/2
					for (let i=0;i<width;i++) {
						frequencyArray[i]=maxFreq/width*(i+0.5)
					}
				} catch (e) {
					audioContext=undefined
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
				for (let i=0;i<width;i++) { // convert to decibels
					magnitudeArray[i]=20*Math.log(magnitudeArray[i])/Math.LN10
				}
				function wrap(v,maxAbs) {
					v%=maxAbs*2
					if (Math.abs(v)<=maxAbs) return v
					return v-(v>0?1:-1)*maxAbs*2
				}
				let k=0
				let v0=0
				for (let i=0;i<width;i++) { // unwrap phase
					let v1=wrap(phaseArray[i]/Math.PI,1)
					k+=(v1<v0 && (v0-v1)>((v1+2)-v0))
					k-=(v1>v0 && (v1-v0)>(v0-(v1-2)))
					v0=v1
					phaseArray[i]=v0+2*k
				}
				const plotResponse=(canvasContext,array,units,enforcedRange,majorGridLineTest)=>{
					let min,max
					const setPlotRange=(min0,max0)=>{
						const ph=pad/height
						min=((min0+max0)*ph-min0)/(2*ph-1)
						max=((min0+max0)*ph-max0)/(2*ph-1)
					}
					const minArr=Math.min(...array)
					const maxArr=Math.max(...array)
					setPlotRange(
						Math.min(0,-enforcedRange+Math.max(0,maxArr-enforcedRange),minArr),
						Math.max(0,enforcedRange-Math.max(0,-enforcedRange-minArr),maxArr)
					)
					const calcX=v=>width*(v-frequencyArray[0])/(frequencyArray[width-1]-frequencyArray[0])
					const calcY=v=>height*(1-(v-min)/(max-min))
					const drawGrid=(min,max,calcY,labelLimit,units,majorGridLineTest)=>{
						canvasContext.save()
						canvasContext.translate(0,0.5) // don't translate along x to keep dashes sharp
						canvasContext.setLineDash([1,1])
						canvasContext.fillStyle='#444'
						canvasContext.font=`${fontSize}px`
						canvasContext.textAlign='right'
						const numLogs=Math.log(max-min)-Math.log(maxNGridLines)
						let k
						let p=Infinity
						;[1,2,5].forEach(tk=>{
							const tp=Math.ceil((numLogs-Math.log(tk))/Math.LN10)
							if (tp<p) {
								p=tp
								k=tk
							}
						})
						const dv=k*Math.pow(10,p)
						const v0=Math.ceil(min/dv)*dv
						const numbers=[]
						for (let v=v0;v<max;v+=dv) {
							numbers.push(v)
						}
						const fmt=formatNumbers(numbers,p<0?-p:0)
						const getLabel=n=>`${i18n.number(n)}${units}`
						const labelWidth=Math.max(...fmt.map(n=>canvasContext.measureText(getLabel(n)).width))
						for (let v=v0,i=0;v<max;v+=dv,i++) {
							canvasContext.strokeStyle=(majorGridLineTest(Number(fmt[i])) ? '#000' : '#888')
							const y=Math.round(calcY(v))
							canvasContext.beginPath()
							canvasContext.moveTo(0,y)
							canvasContext.lineTo(width,y)
							canvasContext.stroke()
							if (y-fontOffset-fontSize>labelLimit) {
								canvasContext.fillText(getLabel(fmt[i]),fontOffset+labelWidth,y-fontOffset)
							}
						}
						canvasContext.restore()
						return labelWidth
					}
					canvasContext.clearRect(0,0,width,height)
					const yLabelWidth=drawGrid(min,max,calcY,0,units,majorGridLineTest)
					canvasContext.save()
					canvasContext.rotate(-Math.PI/2)
					canvasContext.translate(-height,0)
					drawGrid(frequencyArray[0],frequencyArray[width-1],calcX,fontOffset+yLabelWidth,' '+i18n('units.hertz.a'),v=>false)
					canvasContext.restore()
					canvasContext.save()
					canvasContext.translate(0.5,0.5)
					canvasContext.strokeStyle='#F00'
					canvasContext.beginPath()
					for (let i=0;i<width;i++) {
						const x=i
						const y=calcY(array[i])
						if (i==0) {
							canvasContext.moveTo(x,y)
						} else {
							canvasContext.lineTo(x,y)
						}
					}
					canvasContext.stroke()
					canvasContext.restore()
				}
				plotResponse(magnitudeCanvasContext,magnitudeArray,' '+i18n('units.decibel.a'),1,v=>v==0)
				plotResponse(phaseCanvasContext,phaseArray,'π',0.1,v=>v%2==0)
			}
			const delayedUpdatePlots=debounce(updatePlots,50)
			return option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>").append(
				option.entries.map(writeOption),
				$("<div class='option'>").append(
					"<label>"+i18n('options-output.biquadFilter.frequencyResponse')+":</label> ",
					$("<button type='button'>"+i18n('options-output.show')+"</button>").click(function(){
						if (!shown) {
							const $button=$(this)
							if (!audioContext) {
								initAudioContext()
							}
							if (!audioContext) {
								$button.replaceWith(i18n('options-output.biquadFilter.error'))
								return
							}
							let $magnitudeCanvas, $phaseCanvas
							$button.before(
								$magnitudeFigure=$("<figure>").append(
									"<figcaption>"+i18n('options-output.biquadFilter.magnitude')+"</figcaption>",
									$magnitudeCanvas=$(`<canvas width='${width}' height='${height}'></canvas>`)
								),
								$phaseFigure=$("<figure>").append(
									"<figcaption>"+i18n('options-output.biquadFilter.phase')+"</figcaption>",
									$phaseCanvas=$(`<canvas width='${width}' height='${height}'></canvas>`)
								)
							).text(i18n('options-output.hide'))
							magnitudeCanvasContext=$magnitudeCanvas[0].getContext('2d')
							phaseCanvasContext=$phaseCanvas[0].getContext('2d')
							updatePlots()
							shown=true
						} else {
							$magnitudeFigure.remove()
							$phaseFigure.remove()
							$button.text(i18n('options-output.show'))
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
