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

	'comment.context': "create [https://www.w3.org/TR/webaudio/#AudioContext audio context]",
	'comment.sources.audio': "create [https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode audio source node]",
	'comment.sources.video': "create [https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode video source node]",
	'comment.filters.gain': "create [https://www.w3.org/TR/webaudio/#GainNode gain node]",
	'comment.filters.panner': "create [https://www.w3.org/TR/webaudio/#the-stereopannernode-interface stereo panner node]",
	'comment.filters.biquad': "create [https://www.w3.org/TR/webaudio/#the-biquadfilternode-interface biquad filter node]",
	'comment.filters.convolver': "create dry and wet routes with [https://www.w3.org/TR/webaudio/#ConvolverNode convolver node]",
	'comment.filters.convolver.single': "create [https://www.w3.org/TR/webaudio/#ConvolverNode convolver node]",
	'comment.filters.equalizer': "create equalizer as a sequence of [https://www.w3.org/TR/webaudio/#idl-def-BiquadFilterType.peaking peaking] [https://www.w3.org/TR/webaudio/#the-biquadfilternode-interface biquad filter nodes]",
	'comment.filters.equalizer.single': "create equalizer as a [https://www.w3.org/TR/webaudio/#idl-def-BiquadFilterType.peaking peaking] [https://www.w3.org/TR/webaudio/#the-biquadfilternode-interface biquad filter node]",
	'comment.destination': "connect last node to [https://www.w3.org/TR/webaudio/#AudioDestinationNode destination]",
	'comment.destination.compressor': "create [https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface dynamics compressor node]",
	'comment.destination.waveform': "create [https://www.w3.org/TR/webaudio/#the-analysernode-interface analyser node] for waveform visualization",
};

function i18nLinkFilter(inStrings) {
	const linkRegexp=/\[(\S+)\s+([^\]]+)]/g;
	const outStrings={};
	for (let id in inStrings) {
		outStrings[id]=inStrings[id].replace(linkRegexp,(match,url,text)=>"<a href='"+url+"'>"+text+"</a>");
	}
	return outStrings;
}

strings=i18nLinkFilter(strings);

module.exports=function(lang){
	// TODO use lang to pick strings
	const i18n=function(id){
		return strings[id];
	};
	i18n.lang=lang;
	return i18n;
};
