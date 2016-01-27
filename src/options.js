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
			['Array','filters',[
				['Group','gain',[
					['LiveFloat','gain',[0,10,0,1],1],
				]],
				['Group','panner',[
					['LiveFloat','pan',[-1,1],0],
				]],
				['Group','biquad',[
					['LiveSelect','filtertype',[ // can't have array entry with suboption 'type'
						'lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch','allpass'
					]],
					['LiveInt','frequency',[0,22050],350],
					['LiveInt','detune',[0,100]],
					['LiveFloat','Q',[-4,4],0], // log Q
				]],
				['Group','convolver',[
					['LiveFloat','reverb',[0,1]],
					['Text','url',[
						'http://mainline.i3s.unice.fr/mooc/Scala-Milan-Opera-Hall.wav',
					]],
				]],
				['Void','compressor'],
			]],
		];
	}
	get optionClasses() {
		return require('./option-classes.js');
	}
}

module.exports=Options;
