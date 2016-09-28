'use strict'

global.WEB_AUDIO_TEST_API_IGNORE=true

const assert=require('assert')
const vm=require('vm')
const jsdom=require('jsdom').jsdom
const WebAudioTestAPI=require('web-audio-test-api')
const i18n=require('../src/i18n')('en')
const Options=require('../src/options')
const Code=require('../src/code')

WebAudioTestAPI.setState('AudioContext#createStereoPanner','enabled')

describe("Code",()=>{
	function getSandbox(optionsData) {
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
		return sandbox
	}
	beforeEach(()=>{
		WebAudioTestAPI.use()
	})
	afterEach(()=>{
		WebAudioTestAPI.unuse()
	})
	it("makes simplest possible sound output",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		assert.strictEqual(ctx,undefined)
	})
	it("ignores gain node with default gain",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'gain',
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		assert.strictEqual(ctx,undefined)
	})
	it("adds gain node",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'gain',
					gain: 0.5,
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
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
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'gain',
					gain: {
						input: true,
					},
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
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
	it("adds gain node by default when requesting bypass switch",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'gain',
					gain: 0.5,
					enabledInput: true,
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
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
	it("adds panner node",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'panner',
					pan: 1,
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
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
	/*
	it("adds equalizer with 1 input",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'equalizer',
					gain60: {
						input: true,
					},
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
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
	it("adds equalizer with 2 inputs",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'equalizer',
					gain60: {
						input: true,
					},
					gain170: {
						input: true,
					},
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		assert.deepEqual(ctx.toJSON(),{
			"name": "AudioDestinationNode",
			"inputs": [
				{
					"name": "BiquadFilterNode",
					"type": "peaking",
					"frequency": {
						"value": 170,
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
				}
			]
		})
	})
	*/
	it("removes passive panner",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 2,
				},{
					nodeType: 'audio',
					next: 2,
				},{
					nodeType: 'panner',
					next: [3,4],
				},{
					nodeType: 'gain',
					gain: { input: true },
					next: 5,
				},{
					nodeType: 'gain',
					gain: { input: true },
					next: 5,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assert.equal(graph.name,"AudioDestinationNode")
		assert.equal(graph.inputs.length,2)
		assert.equal(graph.inputs[0].name,"GainNode")
		assert.equal(graph.inputs[1].name,"GainNode")
		assert.equal(graph.inputs[0].inputs.length,2)
		assert.equal(graph.inputs[1].inputs.length,2)
		assert.equal(graph.inputs[0].inputs[0].name,"MediaElementAudioSourceNode")
		assert.equal(graph.inputs[1].inputs[0].name,"MediaElementAudioSourceNode")
		assert.equal(graph.inputs[0].inputs[1].name,"MediaElementAudioSourceNode")
		assert.equal(graph.inputs[1].inputs[1].name,"MediaElementAudioSourceNode")
	})
	it("creates junction node in place of passive panner because too many inputs/outputs",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 3,
				},{
					nodeType: 'audio',
					next: 3,
				},{
					nodeType: 'audio',
					next: 3,
				},{
					nodeType: 'panner',
					next: [4,5,6],
				},{
					nodeType: 'gain',
					gain: { input: true },
					next: 7,
				},{
					nodeType: 'gain',
					gain: { input: true },
					next: 7,
				},{
					nodeType: 'gain',
					gain: { input: true },
					next: 7,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assert.equal(graph.name,"AudioDestinationNode")
		assert.equal(graph.inputs.length,3)
		assert.equal(graph.inputs[0].name,"GainNode")
		assert.equal(graph.inputs[1].name,"GainNode")
		assert.equal(graph.inputs[2].name,"GainNode")
		assert.equal(graph.inputs[0].inputs.length,1)
		assert.equal(graph.inputs[1].inputs.length,1)
		assert.equal(graph.inputs[2].inputs.length,1)
		assert.equal(graph.inputs[0].inputs[0].name,"GainNode")
		assert.equal(graph.inputs[1].inputs[0].name,"GainNode")
		assert.equal(graph.inputs[2].inputs[0].name,"GainNode")
		assert.equal(graph.inputs[0].inputs[0].inputs.length,3)
	})
	it("creates junction node in place of passive panner because its inputs have parallel connections to its outputs",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: [1,2],
				},{
					nodeType: 'panner',
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assert.equal(graph.name,"AudioDestinationNode")
		assert.equal(graph.inputs.length,2)
		assert.deepEqual(
			[graph.inputs[0].name,graph.inputs[1].name].sort(),
			["GainNode","MediaElementAudioSourceNode"]
		)
	})
	it("removes panner node because it is not affected by inputs",()=>{
		const sandbox=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'gain',
					gain: { input: true },
					next: 3,
				},{
					nodeType: 'panner',
					pan: { input: true },
					next: 3,
				},{
					nodeType: 'destination',
				}
			],
		})
		assert.strictEqual(sandbox.pannerNode,undefined)
	})
	it("removes panner node because it is not affected by outputs",()=>{
		const sandbox=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: [1,2],
				},{
					nodeType: 'gain',
					gain: { input: true },
					next: 3,
				},{
					nodeType: 'panner',
					pan: { input: true },
				},{
					nodeType: 'destination',
				}
			],
		})
		assert.strictEqual(sandbox.pannerNode,undefined)
	})
})
