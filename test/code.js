'use strict'

global.WEB_AUDIO_TEST_API_IGNORE=true

const assert=require('assert')
const vm=require('vm')
const jsdom=require('jsdom').jsdom
const WebAudioTestAPI=require('web-audio-test-api')
const i18n=require('../src/i18n.js')('en')
const Options=require('../src/options.js')
const Code=require('../src/code.js')

WebAudioTestAPI.setState('AudioContext#createStereoPanner','enabled')

describe("Code",()=>{
	function getAudioContext(optionsData) {
		const options=new Options(optionsData)
		const code=new Code(options.fix(),i18n)
		const sections=code.extractSections({html:'body',css:'paste',js:'paste'})
		const document=jsdom(sections.html.get().join("\n"),{
			features:{FetchExternalResources:false}
		})
		const window=document.defaultView
		const sandbox={
			AudioContext,
			document: {
				getElementById: id=>{
					const element=document.getElementById(id)
					if (element instanceof window.HTMLMediaElement) {
						return new WebAudioTestAPI.HTMLMediaElement()
					} else {
						//return element // WebAudioTestAPI doesn't like strings as parameter values
						return {value: Number(element.value)}
					}
				}
			},
		}
		vm.runInNewContext(
			sections.js.get().join("\n"),
			sandbox
		)
		return sandbox.ctx
	}
	beforeEach(()=>{
		WebAudioTestAPI.use()
	})
	afterEach(()=>{
		WebAudioTestAPI.unuse()
	})
	it("ignores gain node with default gain",()=>{
		const ctx=getAudioContext({
			sources: [
				{
					source: 'audio',
				}
			],
			filters: [
				{
					filter: 'gain',
				}
			],
		})
		assert.strictEqual(ctx,undefined)
	})
	it("adds gain node",()=>{
		const ctx=getAudioContext({
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
		})
		assert.deepEqual(ctx.toJSON(),{
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
		})
	})
	it("adds gain node with input",()=>{
		const ctx=getAudioContext({
			sources: [
				{
					source: 'audio',
				}
			],
			filters: [
				{
					filter: 'gain',
					gain: {
						input: true,
					},
				}
			],
		})
		assert.deepEqual(ctx.toJSON(),{
			"name": "AudioDestinationNode",
			"inputs": [
				{
					"name": "GainNode",
					"gain": {
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
		})
	})
	it("adds panner node",()=>{
		const ctx=getAudioContext({
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
		})
		assert.deepEqual(ctx.toJSON(),{
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
		})
	})
	it("adds equalizer with 1 input",()=>{
		const ctx=getAudioContext({
			sources: [
				{
					source: 'audio',
				}
			],
			filters: [
				{
					filter: 'equalizer',
					gain60: {
						input: true,
					},
				}
			],
		})
		assert.deepEqual(ctx.toJSON(),{
			"name": "AudioDestinationNode",
			"inputs": [
				{
					"name": "BiquadFilterNode",
					"type": "peaking",
					"frequency": {
						"value": 60,
						"inputs": []
					},
					"detune": {
						"value": 0,
						"inputs": []
					},
					"Q": {
						"value": 1,
						"inputs": []
					},
					"gain": {
						"value": 0,
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
		})
	})
})
