'use strict';

const strings={
	'options.audio.comment': "create audio context and source node",
	'options.source': "Source URL", // TODO audio.source

	'options.filters': "Filters",
	'options.filters.comment': "connect last filter node to destination",
	'options.filters.gain': "Gain",
	'options.filters.gain.comment': "create gain node",
	'options.filters.gain.add': "Add Gain",
	'options.filters.gain.properties.gain': "Gain",
	'options.filters.panner': "Stereo Panner",
	'options.filters.panner.comment': "create stereo panner node",
	'options.filters.panner.add': "Add Stereo Panner",
	'options.filters.panner.properties.pan': "Pan",
	'options.filters.biquad': "Biquad Filter",
	'options.filters.biquad.comment': "create biquad filter node",
	'options.filters.biquad.add': "Add Biquad Filter",
	'options.filters.biquad.properties.type': "Type",
	'options.filters.biquad.properties.frequency': "Frequency",
	'options.filters.biquad.properties.detune': "Detune",
	'options.filters.biquad.properties.Q': "Q",
	'options.filters.convolver': "Convolver",
	'options.filters.convolver.comment': "create dry and wet route with convolver node",
	'options.filters.convolver.add': "Add Convolver",
	'options.filters.convolver.url': "Impulse responce URL",
	'options.filters.convolver.properties.reverb': "Reverb (Dry/Wet)",
	'options.filters.convolver.properties.buffer.loading': "Loading and decoding the impulse response",
	'options.filters.convolver.properties.buffer.error': "Error while loading the impulse response",

	'options-output.drag': "Drag or press up/down while in focus to reorder",
	'options-output.delete': "Delete",
};

module.exports=function(lang){
	// TODO use lang to pick strings
	const i18n=function(id){
		return strings[id];
	};
	i18n.lang=lang;
	return i18n;
};
