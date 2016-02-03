'use strict';

const strings={
	'options.source': "Source",
	'options.source.comment': "create audio context and source node",
	'options.source.url': "Source URL",

	'options.filters': "Filters",
	'options.filters.gain': "Gain",
	'options.filters.gain.comment': "create gain node",
	'options.filters.gain.add': "Add Gain",
	'options.filters.gain.gain': "Gain",
	'options.filters.panner': "Stereo Panner",
	'options.filters.panner.comment': "create stereo panner node",
	'options.filters.panner.add': "Add Stereo Panner",
	'options.filters.panner.pan': "Pan",
	'options.filters.biquad': "Biquad Filter",
	'options.filters.biquad.comment': "create biquad filter node",
	'options.filters.biquad.add': "Add Biquad Filter",
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
	'options.filters.biquad.detune': "Detune",
	'options.filters.biquad.Q': "Log(Q)",
	'options.filters.convolver': "Convolver",
	'options.filters.convolver.comment': "create dry and wet route with convolver node",
	'options.filters.convolver.add': "Add Convolver",
	'options.filters.convolver.url': "Impulse responce URL",
	'options.filters.convolver.reverb': "Reverb (Dry/Wet)",
	'options.filters.convolver.buffer.loading': "Loading and decoding the impulse response",
	'options.filters.convolver.buffer.error': "Error while loading the impulse response",

	'options.destination': "Destination",
	'options.destination.comment': "connect last filter node to destination",
	'options.destination.compressor': "Add Dynamics Compressor before the destination",
	'options.destination.compressor.comment': "create dynamics compressor node and connect it to destination",
	'options.destination.compressor.enable': "Enable Dynamics Compressor",

	'options-output.drag': "Drag or press up/down while in focus to reorder",
	'options-output.delete': "Delete",
	'options-output.input': "Editable",
	'options-output.range': "with range",
	'options-output.reset': "Reset",
};

module.exports=function(lang){
	// TODO use lang to pick strings
	const i18n=function(id){
		return strings[id];
	};
	i18n.lang=lang;
	return i18n;
};
