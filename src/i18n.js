'use strict'

let strings={
	'options.sources': "Sources",
	'options.sources.{audio,video}': "{Audio,Video} element",
	'options.sources.{audio,video}.add': "Add {} element",
	'options.sources.{audio,video}.url': "Source URL",
	'options.sources.video.{width,height}': "Player {}",

	'options.filters': "Filters",
	'options.filters.gain': "Gain",
	'options.filters.gain.add': "Add gain",
	'options.filters.gain.gain': "Gain",
	'options.filters.panner': "Stereo panner",
	'options.filters.panner.add': "Add stereo panner",
	'options.filters.panner.pan': "Pan",
	'options.filters.biquad': "Biquad filter",
	'options.filters.biquad.add': "Add biquad filter",
	'options.filters.biquad.type': "Filter type",
	'options.filters.biquad.type.{lowpass,highpass,bandpass,lowshelf,highshelf,peaking,notch,allpass}': "{}",
	'options.filters.biquad.frequency': "Frequency",
	'options.filters.biquad.Q': "Log(Q)",
	'options.filters.biquad.detune': "Detune",
	'options.filters.biquad.gain': "Gain",
	'options.filters.convolver': "Convolver",
	'options.filters.convolver.add': "Add convolver",
	'options.filters.convolver.url': "Impulse responce URL",
	'options.filters.convolver.reverb': "Reverb (dry/wet)",
	'options.filters.convolver.buffer.loading': "Loading and decoding the impulse response",
	'options.filters.convolver.buffer.error': "Error while loading the impulse response",
	'options.filters.equalizer': "Equalizer",
	'options.filters.equalizer.add': "Add equalizer",
	'options.filters.equalizer.gain{60,170,350,1000,3500,10000}': "{} Hz gain",

	'options.destination': "Destination",
	'options.destination.compressor': "Add dynamics compressor before the destination",
	'options.destination.compressor.enable': "Enable dynamics compressor",
	'options.destination.waveform': "Add waveform visualization",

	'options.canvas': "Canvas",
	'options.canvas.{width,height}': "Canvas {}",
	'options.canvas.line': "Waveform line",
	'options.canvas.line.width': "Waveform line width",
	'options.canvas.line.color': "Waveform line color",
	'options.canvas.line.color.{r,g,b,a}': "Waveform line {red,green,blue,opacity}",
	'options.canvas.background': "Background",
	'options.canvas.background.type': "Background type",
	'options.canvas.background.type.{clear,filled}': "{}",
	'options.canvas.background.color': "Background fill color",
	'options.canvas.background.color.{r,g,b,a}': "Background fill {red,green,blue,opacity (blur)}",

	'options-output.drag': "Drag or press up/down while in focus to reorder",
	'options-output.delete': "Delete",
	'options-output.input': "Editable",
	'options-output.range': "with range",
	'options-output.reset': "Reset",

	'code-output.warning.jsfiddle-run': "You may have to click <kbd>Run</kbd> in JSFiddle to get sound output working",

	'comment.context': "create [audio context][context]",
	'comment.sources.audio': "create [audio source node][source]",
	'comment.sources.video': "create [video source node][source]",
	'comment.filters.gain': "create [gain node][gain]",
	'comment.filters.panner': "create [stereo panner node][panner]",
	'comment.filters.biquad': "create [biquad filter node][biquad]",
	'comment.filters.convolver': "create dry and wet routes with [convolver node][convolver]",
	'comment.filters.convolver.single': "create [convolver node][convolver]",
	'comment.filters.equalizer': "create equalizer as a sequence of [peaking][peaking] [biquad filter nodes][biquad]",
	'comment.filters.equalizer.single': "create equalizer as a [peaking][peaking] [biquad filter node][biquad]",
	'comment.destination': "connect last node to [destination][destination]",
	'comment.destination.compressor': "create [dynamics compressor node][compressor]",
	'comment.destination.waveform': "create [analyser node][analyser] for waveform visualization",

	'units.pixel.a': "px",
	'units.pixel.{1,2}': "pixel{,s}",
	'units.hertz.a': "Hz",
	'units.hertz.{1,2}': "Hertz",
	'units.decibel.a': "dB",
	'units.decibel.{1,2}': "decibel{,s}",
}

/*
function i18nLinkFilter(inStrings) {
	const linkRegexp=/\[(\S+)\s+([^\]]+)]/g
	const outStrings={}
	for (let id in inStrings) {
		outStrings[id]=inStrings[id].replace(linkRegexp,(match,url,text)=>"<a href='"+url+"'>"+text+"</a>")
	}
	return outStrings
}
strings=i18nLinkFilter(strings)
*/

strings=require('crnx-base/i18n-expand-curly')(strings)
strings=require('crnx-base/code-output-i18n')(strings)

module.exports=require('crnx-base/i18n')({en:strings})
