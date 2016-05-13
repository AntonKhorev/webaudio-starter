'use strict'

const debounce=require('crnx-base/fake-lodash/debounce')
const formatNumbers=require('crnx-base/format-numbers')
const GroupOptionOutput=require('crnx-base/group-option-output')

const width=300
const height=300
const pad=30
const maxNGridLines=10
const fontSize=10
const fontOffset=3
const minFrequencyInLogMode=10
let audioContext
let linearFrequencyArray,logFrequencyArray
let logFrequencyArrayLinearLimit0,logFrequencyArrayLinearLimit1
let magnitudeArray,phaseArray
let magnitudeArray0,phaseArray0

const log10=x=>Math.log(x)/Math.LN10
const mix=(a,b,x)=>a*(1-x)+b*x

class FilterOptionOutput extends GroupOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		let $freqResponseUi=$()
		const isFreqResponseUiShown=()=>$freqResponseUi.length>0
		let magnitudeCanvasContext, phaseCanvasContext // TODO remove loitering on hide - but have to cancel update
		let magnitudeLogScale=true, frequencyLogScale=false
		const updatePlots=(filterNodes)=>{
			const removeNans=array=>{
				const interpolate=(i0,i1)=>{
					const hasStartValue=i0>=0
					const hasEndValue=i1<array.length
					let v0,v1
					if (!hasStartValue && !hasEndValue) {
						v0=v1=0
					} else {
						if (hasStartValue) {
							v0=array[i0]
						} else {
							v0=array[i1]
						}
						if (hasEndValue) {
							v1=array[i1]
						} else {
							v1=array[i0]
						}
					}
					for (let i=i0+1;i<i1;i++) {
						const x=(i-i0)/(i1-i0)
						array[i]=mix(v0,v1,x)
					}
				}
				let nanStart=-1
				for (let i=0;i<array.length;i++) {
					if (!isFinite(array[i])) {
						if (nanStart<0) {
							nanStart=i
						}
					} else {
						if (nanStart>=0) {
							interpolate(nanStart-1,i)
							nanStart=-1
						}
					}
				}
				if (nanStart>=0) {
					interpolate(nanStart-1,array.length)
				}
			}
			const frequencyArray=(frequencyLogScale
				? logFrequencyArray
				: linearFrequencyArray
			)
			for (let i=0;i<magnitudeArray.length;i++) {
				magnitudeArray[i]=1
			}
			for (let i=0;i<phaseArray.length;i++) {
				phaseArray[i]=0
			}
			filterNodes.forEach(filterNode=>{
				filterNode.getFrequencyResponse(frequencyArray,magnitudeArray0,phaseArray0)
				removeNans(magnitudeArray0)
				removeNans(phaseArray0)
				for (let i=0;i<magnitudeArray.length;i++) {
					magnitudeArray[i]*=magnitudeArray0[i]
				}
				for (let i=0;i<phaseArray.length;i++) {
					phaseArray[i]+=phaseArray0[i]
				}
			})
			if (magnitudeLogScale) {
				for (let i=0;i<width;i++) { // convert to decibels
					magnitudeArray[i]=20*Math.log(magnitudeArray[i])/Math.LN10
				}
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
			const plotResponse=(canvasContext,array,units,enforcedCenter,enforcedRange,enforcedFloor,majorGridLineTest)=>{
				let min,max
				const setPlotRange=(min0,max0)=>{
					const ph=pad/height
					min=((min0+max0)*ph-min0)/(2*ph-1)
					max=((min0+max0)*ph-max0)/(2*ph-1)
				}
				const minArr=Math.min(...array)
				const maxArr=Math.max(...array)
				const minArrCentered=Math.max(minArr,enforcedFloor)-enforcedCenter
				const maxArrCentered=Math.max(maxArr,enforcedFloor)-enforcedCenter
				setPlotRange(
					enforcedCenter+Math.min(0,-enforcedRange+Math.max(0,maxArrCentered-enforcedRange),minArrCentered),
					enforcedCenter+Math.max(0,enforcedRange-Math.max(0,-enforcedRange-minArrCentered),maxArrCentered)
				)
				const calcY=v=>height*(1-(v-min)/(max-min))
				const getGridNumbers=(min,max)=>{
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
					return [numbers,p<0?-p:0]
				}
				const drawGrid=(numbers,visibleNumbers,calcPosition,labelLimit,units,majorGridLineTest)=>{
					canvasContext.save()
					canvasContext.translate(0,0.5) // don't translate along x to keep dashes sharp
					canvasContext.fillStyle='#444'
					canvasContext.font=`${fontSize}px`
					canvasContext.textAlign='right'
					const getLabel=n=>`${i18n.number(n)}${units}`
					const labelWidth=Math.max(...visibleNumbers.map(n=>canvasContext.measureText(getLabel(n)).width))
					for (let i=0;i<numbers.length;i++) {
						const y=Math.round(calcPosition(numbers[i]))
						const drawLine=()=>{
							canvasContext.beginPath()
							canvasContext.moveTo(0,y)
							canvasContext.lineTo(width,y)
							canvasContext.stroke()
						}
						const majorGridLine=majorGridLineTest(Number(visibleNumbers[i]))
						if (majorGridLine) {
							canvasContext.strokeStyle='rgba(70%,70%,100%,0.3)'
							canvasContext.setLineDash([])
							canvasContext.lineWidth=3
							drawLine()
						}
						canvasContext.strokeStyle=(majorGridLine ? '#000' : '#888')
						canvasContext.setLineDash([1])
						canvasContext.lineWidth=1
						drawLine()
						if (y-fontOffset-fontSize>labelLimit) {
							canvasContext.fillText(getLabel(visibleNumbers[i]),fontOffset+labelWidth,y-fontOffset)
						}
					}
					canvasContext.restore()
					return labelWidth
				}
				const drawYGrid=()=>{
					const yGridNumbersAndPrecision=getGridNumbers(min,max)
					const yVisibleGridNumbers=formatNumbers(...yGridNumbersAndPrecision)
					return drawGrid(yGridNumbersAndPrecision[0],yVisibleGridNumbers,calcY,0,units,majorGridLineTest)
				}
				const drawXGrid=(yLabelWidth)=>{
					canvasContext.save()
					canvasContext.rotate(-Math.PI/2)
					canvasContext.translate(-height,0)
					let calcX,xGridNumbersAndPrecision,xVisibleGridNumbers
					if (frequencyLogScale) {
						calcX=v=>width*(v-logFrequencyArrayLinearLimit0)/(logFrequencyArrayLinearLimit1-logFrequencyArrayLinearLimit0)
						xGridNumbersAndPrecision=getGridNumbers(logFrequencyArrayLinearLimit0,logFrequencyArrayLinearLimit1)
						xVisibleGridNumbers=formatNumbers(xGridNumbersAndPrecision[0].map(n=>Math.pow(10,n)),0)
					} else {
						calcX=v=>width*(v-frequencyArray[0])/(frequencyArray[width-1]-frequencyArray[0])
						xGridNumbersAndPrecision=getGridNumbers(frequencyArray[0],frequencyArray[width-1])
						xVisibleGridNumbers=formatNumbers(...xGridNumbersAndPrecision)
					}
					drawGrid(xGridNumbersAndPrecision[0],xVisibleGridNumbers,calcX,fontOffset+yLabelWidth,' '+i18n('units.hertz.a'),v=>false)
					canvasContext.restore()
				}
				const drawGraph=()=>{
					canvasContext.save()
					canvasContext.translate(0.5,0.5) // aim at centers of pixels
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
				canvasContext.clearRect(0,0,width,height)
				const yLabelWidth=drawYGrid()
				drawXGrid(yLabelWidth)
				drawGraph()
			}
			if (magnitudeLogScale) {
				plotResponse(magnitudeCanvasContext,magnitudeArray,' '+i18n('units.decibel.a'),0,1,-100,v=>v==0)
			} else {
				plotResponse(magnitudeCanvasContext,magnitudeArray,'',1,0.1,0,v=>(v==0 || v==1))
			}
			plotResponse(phaseCanvasContext,phaseArray,'π',0,0.1,-Infinity,v=>v%2==0)
		}
		const delayedUpdate=debounce(()=>{
			try {
				updatePlots(this.getFilterNodes(audioContext))
			} catch (e) {}
		},50)
		let $frOption
		const This=this
		this.$output.append(
			$frOption=$("<div class='option only-buttons'>").append(
				"<label>"+i18n('options-output.filter.frequencyResponse')+":</label><span class='space'> </span>",
				$("<button type='button'>"+i18n('options-output.show')+"</button>").click(function(){
					const $button=$(this)
					if (!isFreqResponseUiShown()) {
						This.runIfCanCreateAudioContext(audioContext=>{
							let filterNodes
							try {
								filterNodes=This.getFilterNodes(audioContext)
							} catch (e) {
								$button.replaceWith(i18n('options-output.filter.nodeError'))
								return
							}
							let $magnitudeCanvas, $phaseCanvas
							$freqResponseUi=$freqResponseUi.add(
								" "
							).add(
								$("<label>").append(
									$("<input type='checkbox'>").prop('checked',magnitudeLogScale).change(function(){
										magnitudeLogScale=$(this).prop('checked')
										delayedUpdate()
									}),
									" "+i18n('options-output.filter.logMagnitude')
								)
							).add(
								" "
							).add(
								$("<label>").append(
									$("<input type='checkbox'>").prop('checked',frequencyLogScale).change(function(){
										frequencyLogScale=$(this).prop('checked')
										delayedUpdate()
									}),
									" "+i18n('options-output.filter.logFrequency')
								)
							).add(
								" "
							).add(
								$("<div>").append(
									$("<figure>").append(
										"<figcaption>"+i18n('options-output.filter.magnitude')+"</figcaption>",
										$magnitudeCanvas=$(`<canvas width='${width}' height='${height}'></canvas>`)
									),
									$("<figure>").append(
										"<figcaption>"+i18n('options-output.filter.phase')+"</figcaption>",
										$phaseCanvas=$(`<canvas width='${width}' height='${height}'></canvas>`)
									)
								)
							)
							$button.after($freqResponseUi).text(i18n('options-output.hide'))
							magnitudeCanvasContext=$magnitudeCanvas[0].getContext('2d')
							phaseCanvasContext=$phaseCanvas[0].getContext('2d')
							updatePlots(filterNodes)
							$frOption.removeClass('only-buttons')
						},$button,i18n('options-output.filter.contextError'))
					} else {
						// TODO cancel scheduled update
						$freqResponseUi.remove()
						$freqResponseUi=$()
						$button.text(i18n('options-output.show'))
						$frOption.addClass('only-buttons')
					}
				})
			)
		)
		option.addUpdateCallback(()=>{
			if (isFreqResponseUiShown()) {
				delayedUpdate()
			}
		})
	}
	runIfCanCreateAudioContext(fn,$ui,errorMessage) {
		const initAudioContext=()=>{
			audioContext=new (AudioContext || webkitAudioContext)
			linearFrequencyArray=new Float32Array(width)
			logFrequencyArray=new Float32Array(width)
			magnitudeArray=new Float32Array(width)
			phaseArray=new Float32Array(width)
			magnitudeArray0=new Float32Array(width)
			phaseArray0=new Float32Array(width)
			const maxFrequency=audioContext.sampleRate/2
			const log10minFrequency=log10(minFrequencyInLogMode)
			const log10maxFrequency=log10(maxFrequency)
			for (let i=0;i<width;i++) {
				const x=(i+0.5)/width
				linearFrequencyArray[i]=maxFrequency*x
				logFrequencyArray[i]=Math.pow(10,mix(log10minFrequency,log10maxFrequency,x))
			}
			logFrequencyArrayLinearLimit0=mix(log10minFrequency,log10maxFrequency,0.5/width)
			logFrequencyArrayLinearLimit1=mix(log10minFrequency,log10maxFrequency,1-0.5/width)
		}
		if (!audioContext) {
			try {
				initAudioContext()
			} catch (e) {
				$ui.replaceWith(errorMessage)
				return
			}
		}
		fn(audioContext)
	}
	// abstract
	// getFilterNodes(audioContext)
}

module.exports=FilterOptionOutput
