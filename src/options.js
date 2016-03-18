'use strict'

const BaseOptions=require('crnx-base/options')

class Options extends BaseOptions {
	get entriesDescription() {
		return [
			['Array','sources',[ // urls are from w3c mooc
				['Group','audio',[
					['Text','url',[
						'http://mainline.i3s.unice.fr/mooc/guitarRiff1.mp3',
						'http://mainline.i3s.unice.fr/mooc/drums.mp3',
						'http://mainline.i3s.unice.fr/mooc/LaSueur.mp3',
					]],
				]],
				['Group','video',[
					['Text','url',[
						'http://mainline.i3s.unice.fr/mooc/elephants-dream-medium.webm',
						'http://mainline.i3s.unice.fr/mooc/elephants-dream-medium.mp4',
						'http://mainline.i3s.unice.fr/mooc/sintel.webm',
						'http://mainline.i3s.unice.fr/mooc/sintel.mp4',
					]],
					['Int','width',[1,1920],320,{ unit: 'pixel' }],
					['Int','height',[1,1080],240,{ unit: 'pixel' }],
				]],
			],'source'],
			['Array','filters',[
				['Group','gain',[
					['LiveFloat','gain',[0,10],1,{
						defaultMax: 1,
					}],
				]],
				['Group','panner',[
					['LiveFloat','pan',[-1,1],0],
				]],
				['Group','biquad',[
					['LiveSelect','type',[
						'lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch','allpass'
					]],
					['LiveInt','frequency',[0,22050],350,{ unit: 'hertz' }],
					['LiveFloat','Q',[-4,4],0], // log Q
					['LiveInt','gain',[-30,30],0,{ unit: 'decibel' }],
					['LiveInt','detune',[0,100],{ unit: '¢' }],
				]],
				['Group','convolver',[
					['LiveFloat','reverb',[0,1]],
					['Text','url',[
						'http://mainline.i3s.unice.fr/mooc/Scala-Milan-Opera-Hall.wav',
					]],
				]],
				['Group','equalizer',[60,170,350,1000,3500,10000].map(
					freq=>['LiveInt','gain'+freq,[-30,30],0,{ unit: 'decibel' }]
				)],
			],'filter'],
			['Group','destination',[
				['Checkbox','compressor'], // Firefox compresses automatically?
				['Checkbox','waveform'],
			]],
			['Group','canvas',[
				['Int','width',[1,1920],300,{ unit: 'pixel' }],
				['Int','height',[1,1080],100,{ unit: 'pixel' }],
				['Group','line',[
					['Float','width',[0,10],1,{ unit: 'pixel' }],
					['Group','color',[
						['Int','r',[0,100],0,{ unit: '%' }],
						['Int','g',[0,100],0,{ unit: '%' }],
						['Int','b',[0,100],0,{ unit: '%' }],
						['Int','a',[0,100],100,{ unit: '%' }],
					]],
				]],
				['Group','background',[
					['Select','type',['clear','filled']],
					['Group','color',[
						['Int','r',[0,100],100,{ unit: '%' }],
						['Int','g',[0,100],100,{ unit: '%' }],
						['Int','b',[0,100],100,{ unit: '%' }],
						['Int','a',[0,100],100,{ unit: '%' }],
					],{
						visibilityData: {'canvas.background.type':['filled']}
					}],
				]],
			],{
				visibilityData: {'destination.waveform':[true]}
			}],
		]
	}
	get optionClasses() {
		return require('./option-classes')
	}
}

module.exports=Options
