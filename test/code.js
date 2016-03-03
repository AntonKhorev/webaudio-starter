'use strict';

global.WEB_AUDIO_TEST_API_IGNORE=true;

const assert=require('assert');
const vm=require('vm');
const WebAudioTestAPI=require('web-audio-test-api');
const i18n=require('../src/i18n.js')('en');
const Options=require('../src/options.js');
const Code=require('../src/code.js');

// can't test panner b/c web-audio-test-api uses deprecated panner method
// no, wait, can use it: https://github.com/mohayonao/web-audio-test-api/issues/20
describe("Code",()=>{
	beforeEach(()=>{
		WebAudioTestAPI.use();
	});
	afterEach(()=>{
		WebAudioTestAPI.unuse();
	});
	it("has gain node",()=>{
		const options=new Options({
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
		});
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
		assert.deepEqual(sandbox.ctx.toJSON(),{
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
});
