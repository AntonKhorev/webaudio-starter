'use strict';

global.WEB_AUDIO_TEST_API_IGNORE=true;

const assert=require('assert');
const vm=require('vm');
const WebAudioTestAPI=require('web-audio-test-api');
const i18n=require('../src/i18n.js')('en');
const Options=require('../src/options.js');
const Code=require('../src/code.js');

WebAudioTestAPI.setState('AudioContext#createStereoPanner','enabled');

describe("Code",()=>{
	function getAudioGraph(optionsData) {
		const options=new Options(optionsData);
		const code=new Code(options.fix(),i18n);
		const sections=code.extractSections({html:'body',css:'paste',js:'paste'});
		const sandbox={
			AudioContext,
			document: {
				getElementById: id=>new WebAudioTestAPI.HTMLMediaElement(),
			},
		};
		vm.runInNewContext(
			sections.js.get().join("\n"),
			sandbox
		);
		return sandbox.ctx.toJSON();
	}
	beforeEach(()=>{
		WebAudioTestAPI.use();
	});
	afterEach(()=>{
		WebAudioTestAPI.unuse();
	});
	it("has gain node",()=>{
		assert.deepEqual(getAudioGraph({
			sources: [
				{
					source: 'audio',
				}
			],
			filters: [
				{
					filter: 'gain',
					gain: 0.5,
				}
			],
		}),{
			"name": "AudioDestinationNode",
			"inputs": [
				{
					"name": "GainNode",
					"gain": {
						"value": 0.5,
						"inputs": []
					},
					"inputs": [
						{
							"name": "MediaElementAudioSourceNode",
							"inputs": []
						}
					]
				}
			]
		});
	});
	it("has panner node",()=>{
		assert.deepEqual(getAudioGraph({
			sources: [
				{
					source: 'audio',
				}
			],
			filters: [
				{
					filter: 'panner',
					pan: 1,
				}
			],
		}),{
			"name": "AudioDestinationNode",
			"inputs": [
				{
					"name": "StereoPannerNode",
					"pan": {
						"value": 1,
						"inputs": []
					},
					"inputs": [
						{
							"name": "MediaElementAudioSourceNode",
							"inputs": []
						}
					]
				}
			]
		});
	});
});
