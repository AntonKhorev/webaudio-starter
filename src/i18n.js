'use strict';

let strings={
	'options.sources': "Sources",
	'options.sources.audio': "Audio element",
	'options.sources.audio.add': "Add audio element",
	'options.sources.audio.url': "Source URL",
	'options.sources.video': "Video element",
	'options.sources.video.add': "Add video element",
	'options.sources.video.url': "Source URL",
	'options.sources.video.width': "Player width",
	'options.sources.video.height': "Player height",

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
	'options.filters.biquad.type.lowpass': "lowpass",
	'options.filters.biquad.type.highpass': "highpass",
	'options.filters.biquad.type.bandpass': "bandpass",
	'options.filters.biquad.type.lowshelf': "lowshelf",
	'options.filters.biquad.type.highshelf': "highshelf",
	'options.filters.biquad.type.peaking': "peaking",
	'options.filters.biquad.type.notch': "notch",
	'options.filters.biquad.type.allpass': "allpass",
	'options.filters.biquad.frequency': "Frequency",
	'options.filters.biquad.Q': "Log(Q)",
	'options.filters.biquad.detune': "Detune",
	'options.filters.biquad.gain': "Gain [dB]",
	'options.filters.convolver': "Convolver",
	'options.filters.convolver.add': "Add convolver",
	'options.filters.convolver.url': "Impulse responce URL",
	'options.filters.convolver.reverb': "Reverb (dry/wet)",
	'options.filters.convolver.buffer.loading': "Loading and decoding the impulse response",
	'options.filters.convolver.buffer.error': "Error while loading the impulse response",
	'options.filters.equalizer': "Equalizer",
	'options.filters.equalizer.add': "Add equalizer",
	'options.filters.equalizer.gain60': "60 Hz gain", // TODO {,} expansion
	'options.filters.equalizer.gain170': "170 Hz gain",
	'options.filters.equalizer.gain350': "350 Hz gain",
	'options.filters.equalizer.gain1000': "1000 Hz gain",
	'options.filters.equalizer.gain3500': "3500 Hz gain",
	'options.filters.equalizer.gain10000': "10000 Hz gain",

	'options.destination': "Destination",
	'options.destination.compressor': "Add dynamics compressor before the destination",
	'options.destination.compressor.enable': "Enable dynamics compressor",
	'options.destination.waveform': "Add waveform visualization",

	'options-output.drag': "Drag or press up/down while in focus to reorder",
	'options-output.delete': "Delete",
	'options-output.input': "Editable",
	'options-output.range': "with range",
	'options-output.reset': "Reset",

	'code-output.save': "Save source code",
	'code-output.run': "Run in new window",
	'code-output.warning.ie': "this button doesn't work in Internet Explorer, copy-paste the code manually",
	'code-output.warning.no-hljs': "<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.",
	'code-output.section.html': "HTML",
	'code-output.section.css': "CSS",
	'code-output.section.js': "JavaScript",
	'code-output.embedded': "embedded into HTML source code",
	'code-output.mode.embed': "embed in HTML",
	'code-output.mode.paste': "extract to paste into HTML later",
	'code-output.mode.file': "extract to load as external resource",

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
};

/*
function i18nLinkFilter(inStrings) {
	const linkRegexp=/\[(\S+)\s+([^\]]+)]/g;
	const outStrings={};
	for (let id in inStrings) {
		outStrings[id]=inStrings[id].replace(linkRegexp,(match,url,text)=>"<a href='"+url+"'>"+text+"</a>");
	}
	return outStrings;
}
strings=i18nLinkFilter(strings);
*/

module.exports=function(lang){
	// TODO use lang to pick strings
	const i18n=function(id){
		return strings[id];
	};
	i18n.lang=lang;
	return i18n;
};
