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
let audioContext
let frequencyArray,magnitudeArray,phaseArray

class FilterOptionOutput extends GroupOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		super(option,writeOption,i18n,generateId)
		let shown=false
		let $magnitudeFigure, $phaseFigure
		let magnitudeCanvasContext, phaseCanvasContext
		const updatePlots=(filterNodes)=>{
			const filterNode=filterNodes[0] // TODO the rest
			filterNode.getFrequencyResponse(frequencyArray,magnitudeArray,phaseArray)
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
						const y=Math.round(calcY(v))
						const drawLine=()=>{
							canvasContext.beginPath()
							canvasContext.moveTo(0,y)
							canvasContext.lineTo(width,y)
							canvasContext.stroke()
						}
						const majorGridLine=majorGridLineTest(Number(fmt[i]))
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
		const delayedUpdate=debounce(()=>{
			try {
				updatePlots(this.getFilterNodes(audioContext))
			} catch (e) {}
		},50)
		const This=this
		this.$output.append(
			$("<div class='option'>").append(
				"<label>"+i18n('options-output.filter.frequencyResponse')+":</label> ",
				$("<button type='button'>"+i18n('options-output.show')+"</button>").click(function(){
					const $button=$(this)
					if (!shown) {
						This.runIfCanCreateAudioContext(audioContext=>{
							let filterNodes
							try {
								filterNodes=This.getFilterNodes(audioContext)
							} catch (e) {
								$button.replaceWith(i18n('options-output.filter.nodeError'))
								return
							}
							let $magnitudeCanvas, $phaseCanvas
							$button.before(
								$magnitudeFigure=$("<figure>").append(
									"<figcaption>"+i18n('options-output.filter.magnitude')+"</figcaption>",
									$magnitudeCanvas=$(`<canvas width='${width}' height='${height}'></canvas>`)
								),
								$phaseFigure=$("<figure>").append(
									"<figcaption>"+i18n('options-output.filter.phase')+"</figcaption>",
									$phaseCanvas=$(`<canvas width='${width}' height='${height}'></canvas>`)
								)
							).text(i18n('options-output.hide'))
							magnitudeCanvasContext=$magnitudeCanvas[0].getContext('2d')
							phaseCanvasContext=$phaseCanvas[0].getContext('2d')
							updatePlots(filterNodes)
							shown=true
						},$button,i18n('options-output.filter.contextError'))
					} else {
						$magnitudeFigure.remove()
						$phaseFigure.remove()
						$button.text(i18n('options-output.show'))
						shown=false
					}
				})
			)
		)
		option.addUpdateCallback(()=>{
			if (shown) {
				delayedUpdate()
			}
		})
	}
	runIfCanCreateAudioContext(fn,$ui,errorMessage) {
		const initAudioContext=()=>{
			audioContext=new (AudioContext || webkitAudioContext)
			frequencyArray=new Float32Array(width)
			magnitudeArray=new Float32Array(width)
			phaseArray=new Float32Array(width)
			const maxFreq=audioContext.sampleRate/2
			for (let i=0;i<width;i++) {
				frequencyArray[i]=maxFreq/width*(i+0.5)
			}
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
