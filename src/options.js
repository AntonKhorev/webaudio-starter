'use strict'

const BaseOptions=require('crnx-base/options')

class Options extends BaseOptions {
	get entriesDescription() {
		return [
			['Graph','graph',[
				['Group','audio',[
					['Text','url',[
						// original w3c mooc
						'http://mainline.i3s.unice.fr/mooc/guitarRiff1.mp3',
						'http://mainline.i3s.unice.fr/mooc/drums.mp3',
						'http://mainline.i3s.unice.fr/mooc/LaSueur.mp3',
						// Web Audio Playground via RawGit
						'https://cdn.rawgit.com/cwilso/WebAudio/9ece1787cede81ddcd26f2a78d4fb3ba0812379a/sounds/bass.ogg',
						'https://cdn.rawgit.com/cwilso/WebAudio/9ece1787cede81ddcd26f2a78d4fb3ba0812379a/sounds/drums.ogg',
						'https://cdn.rawgit.com/cwilso/WebAudio/9ece1787cede81ddcd26f2a78d4fb3ba0812379a/sounds/guitar.ogg',
					]],
				]],
				/*
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
				['Group','sample',[
					['Text','url',[
						'http://mainline.i3s.unice.fr/mooc/shoot1.mp3',
						'http://mainline.i3s.unice.fr/mooc/shoot2.mp3',
					]],
					['Int','repeat',[1,20]],
					['Float','interval',[0,1],0.1,{ unit: 'second' }],
					['Float','randomShift',[0,1],{ unit: 'second' }],
					['Float','pitch',[0,2],1],
					['Float','randomPitch',[0,1]],
					['Float','gain',[0,2],1],
					['Float','randomGain',[0,1]],
				]],
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
						// original w3c mooc
						'http://mainline.i3s.unice.fr/mooc/Scala-Milan-Opera-Hall.wav',
						// Web Audio Playground via RawGit
						'https://cdn.rawgit.com/cwilso/WebAudio/9ece1787cede81ddcd26f2a78d4fb3ba0812379a/sounds/irHall.ogg',
					]],
				]],
				['EqualizerFilter','equalizer'],
				*/
				['Group','destination',[]],
			],'nodeType'],
			/*
			['Group','destination',[
				['Group','compressor',[
					['Checkbox','enabled'], // Firefox compresses automatically?
				]],
				['Group','waveform',[
					['Checkbox','enabled'],
					['Float','width',[0,10],1,{
						unit: 'pixel',
						visibilityData: {'destination.waveform.enabled':[true]},
					}],
					['Group','color',[
						['Int','r',[0,100],0,{ unit: '%' }],
						['Int','g',[0,100],0,{ unit: '%' }],
						['Int','b',[0,100],0,{ unit: '%' }],
						['Int','a',[0,100],100,{ unit: '%' }],
					],{
						visibilityData: {'destination.waveform.enabled':[true]},
					}],
				]],
				['Group','frequencies',[
					['Checkbox','enabled'],
					['Int','cutoff',[10,100],100,{
						unit: '%',
						visibilityData: {'destination.frequencies.enabled':[true]},
					}],
					['Select','base',['bottom','middle'],{
						visibilityData: {'destination.frequencies.enabled':[true]},
					}],
					['Select','coloring',['component','spectral'],{
						visibilityData: {'destination.frequencies.enabled':[true]},
					}],
					['Select','coloringInput',['amplitude','frequency'],{
						visibilityData: {'destination.frequencies.enabled':[true]},
					}],
					['Group','outline',[
						['Checkbox','enabled'],
						['Float','width',[0,10],1,{
							unit: 'pixel',
							visibilityData: {'destination.frequencies.outline.enabled':[true]},
						}],
						['Group','color',[
							['Int','r',[0,100],0,{ unit: '%' }],
							['Int','g',[0,100],0,{ unit: '%' }],
							['Int','b',[0,100],0,{ unit: '%' }],
							['Int','a',[0,100],100,{ unit: '%' }],
						],{
							visibilityData: {'destination.frequencies.outline.enabled':[true]},
						}],
					],{
						visibilityData: {'destination.frequencies.enabled':[true]},
					}]
				]],
				['Group','volume',[
					['Checkbox','enabled'],
					['Checkbox','stereo',{
						visibilityData: {'destination.volume.enabled':[true]},
					}],
				]],
				['Group','analyser',[
					['Int','logFftSize',[5,12],8],
				],{
					visibilityData: {'destination.waveform.enabled':[true],'destination.frequencies.enabled':[true],'destination.volume.enabled':[true]},
					visibilityDataLogic: 'or',
				}],
			]],
			*/
			['Group','canvas',[
				['Int','width',[1,1920],300,{ unit: 'pixel' }],
				['Int','height',[1,1080],100,{ unit: 'pixel' }],
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
			]/*,{
				visibilityData: {'destination.waveform.enabled':[true],'destination.frequencies.enabled':[true],'destination.volume.enabled':[true]},
				visibilityDataLogic: 'or',
			}*/],
			['Group','loader',[
				['Select','errors',['none','network','http']],
			]], // TODO visibility depending on sources and filters
			['Group','api',[
				['Checkbox','noVendorPrefix'], // won't work on Safari
				['Checkbox','connectReturnValue'], // won't work on Safari as long as this is the interface:
					// https://trac.webkit.org/browser/trunk/Source/WebCore/Modules/webaudio/AudioNode.idl
					// https://trac.webkit.org/browser/trunk/Source/WebCore/Modules/webaudio/AudioNode.h
					// (github mirror) https://github.com/WebKit/webkit/blob/66e68cd8d7bf4ea1cf52f31ed9cb242f83ea5b57/Source/WebCore/Modules/webaudio/AudioNode.h
			]],
		]
	}
	get optionClasses() {
		return require('./option-classes')
	}
}

module.exports=Options
