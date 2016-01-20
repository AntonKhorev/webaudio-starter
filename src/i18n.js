'use strict';

const strings={
	'options.source': "Source URL",
	'options.filters': "Filters",
	'options.filters.gain': "Gain",
	'options.filters.gain.add': "Add Gain",
	'options.filters.panner': "Stereo Panner",
	'options.filters.panner.add': "Add Stereo Panner",

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
