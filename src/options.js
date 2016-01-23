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
			['Checkbox','crossorigin',true], // not needed, always set it when audio is used by Web Audio API, don't set otherwise
			['Array','filters',[
				['Void','gain'],
				['Void','panner'],
				['Void','biquad'],
				['Group','convolver',[
					['Text','url',[
						'http://mainline.i3s.unice.fr/mooc/Scala-Milan-Opera-Hall.wav',
					]],
				]],
			]],
		];
	};
}

module.exports=Options;
