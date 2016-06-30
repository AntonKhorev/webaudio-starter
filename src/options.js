'use strict'

const BaseOptions=require('crnx-base/options')

class Options extends BaseOptions {
	get entriesDescription() {
		return [
			['Array','sources',[
				['Group','audio',[
					['Text','url',[
						// original w3c mooc - is down now
						/*
						'http://mainline.i3s.unice.fr/mooc/guitarRiff1.mp3',
						'http://mainline.i3s.unice.fr/mooc/drums.mp3',
						'http://mainline.i3s.unice.fr/mooc/LaSueur.mp3',
						*/
						// Web Audio Playground via RawGit
						'https://cdn.rawgit.com/cwilso/WebAudio/9ece1787cede81ddcd26f2a78d4fb3ba0812379a/sounds/bass.ogg',
						'https://cdn.rawgit.com/cwilso/WebAudio/9ece1787cede81ddcd26f2a78d4fb3ba0812379a/sounds/drums.ogg',
						'https://cdn.rawgit.com/cwilso/WebAudio/9ece1787cede81ddcd26f2a78d4fb3ba0812379a/sounds/guitar.ogg',
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
			['Filters','filters',[
				['Group','gain',[
					['LiveFloat','gain',[0,10],1,{
						defaultMax: 1,
					}],
				]],
				['Group','panner',[
					['LiveFloat','pan',[-1,1],0],
				]],
				['BiquadFilter','biquad'],
				['IIRFilter','iir'],
				['Group','convolver',[
					['LiveFloat','reverb',[0,1]],
					['Text','url',[
						// original w3c mooc - is down now
						/*
						'http://mainline.i3s.unice.fr/mooc/Scala-Milan-Opera-Hall.wav',
						*/
						// Web Audio Playground via RawGit
						'https://cdn.rawgit.com/cwilso/WebAudio/9ece1787cede81ddcd26f2a78d4fb3ba0812379a/sounds/irHall.ogg',
					]],
				]],
				['EqualizerFilter','equalizer'],
			],'filter'],
			['Group','destination',[
				['Checkbox','compressor'], // Firefox compresses automatically?
				['Checkbox','waveform'],
				['Checkbox','frequencies'],
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
				visibilityData: {'destination.waveform':[true],'destination.frequencies':[true]},
				visibilityDataLogic: 'or',
			}],
		]
	}
	get optionClasses() {
		return require('./option-classes')
	}
}

module.exports=Options
