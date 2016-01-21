'use strict';

const BaseOptions=require('../base/options.js');

class Options extends BaseOptions {
	get entriesDescription() {
		return [
			['Text','source',[
				// w3c mooc:
				'http://mainline.i3s.unice.fr/mooc/guitarRiff1.mp3',
				'http://mainline.i3s.unice.fr/mooc/drums.mp3',
			]],
			['Checkbox','crossorigin',true],
			['Array','filters',[
				['Void','gain'],
				['Void','panner'],
				['Void','biquad'],
			]],
		]
	};
}

module.exports=Options;
