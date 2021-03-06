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
			XMLHttpRequest: class {
				open() {}
				send() {}
			},
			requestAnimationFrame() {},
			document: {
				getElementById: id=>{
					const element=document.getElementById(id)
					if (element instanceof window.HTMLMediaElement) {
						return new WebAudioTestAPI.HTMLMediaElement()
					} else if (element instanceof window.HTMLCanvasElement) {
						return {
							getContext() {},
						}
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
	const makeSourceFilterDestinationGraph=(filterName,filterProperty,filterPropertyValue)=>({
		"name": "AudioDestinationNode",
		"inputs": [
			{
				"name": filterName,
				[filterProperty]: {
					"value": filterPropertyValue,
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
	const makeSourceGainDestinationGraph=(gainValue)=>makeSourceFilterDestinationGraph("GainNode","gain",gainValue)
	const makeSourcePannerDestinationGraph=(panValue)=>makeSourceFilterDestinationGraph("StereoPannerNode","pan",panValue)
	const assertGraphIsChain=(graph,chain)=>{
		for (let i=chain.length-1;i>=0;i--) {
			assert.equal(graph.name,chain[i],"node name mismatch")
			if (i>0) {
				assert.equal(graph.inputs.length,1,`input number mismatch for ${graph.name}`)
				graph=graph.inputs[0]
			} else {
				assert.equal(graph.inputs.length,0,`input number mismatch for ${graph.name}`)
			}
		}
	}
	const assertGraphIsTree=(graph,tree)=>{
		assert.equal(graph.name,tree.name,"node name mismatch")
		assert.equal(graph.inputs.length,tree.inputs.length,`input number mismatch for ${graph.name}`)
		const inputs=[...graph.inputs].sort((a,b)=>a.name<b.name?-1:a.name==b.name?0:1)
		for (let i=0;i<inputs.length;i++) {
			assertGraphIsTree(inputs[i],tree.inputs[i])
		}
	}

	beforeEach(()=>{
		WebAudioTestAPI.use()
	})
	afterEach(()=>{
		WebAudioTestAPI.unuse()
	})
	it("makes simplest possible audio output",()=>{
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
		assert.deepEqual(ctx.toJSON(),makeSourceGainDestinationGraph(0.5))
	})
	it("adds gain node for video element",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'video',
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
		assert.deepEqual(ctx.toJSON(),makeSourceGainDestinationGraph(0.5))
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
		assert.deepEqual(ctx.toJSON(),makeSourceGainDestinationGraph(1))
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
		assert.deepEqual(ctx.toJSON(),makeSourceGainDestinationGraph(0.5))
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
		assert.deepEqual(ctx.toJSON(),makeSourcePannerDestinationGraph(1))
	})
	it("adds compressor node",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'compressor',
					next: 2,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assert.equal(graph.name,"AudioDestinationNode")
		assert.equal(graph.inputs.length,1)
		assert.equal(graph.inputs[0].name,"DynamicsCompressorNode")
	})
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
	it("places junction between bypassable nodes",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					enabledInput: true,
					next: 1,
				},{
					nodeType: 'destination',
					enabledInput: true,
				}
			],
		}).ctx
		assert.deepEqual(ctx.toJSON(),makeSourceGainDestinationGraph(1))
	})
	it("places junction between dry/wet-bypassable nodes",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					enabledInput: true,
					next: 1,
				},{
					nodeType: 'convolver',
					wet: 0.5,
					enabledInput: true,
					next: 2,
				},{
					nodeType: 'destination',
					enabledInput: true,
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assert.equal(graph.name,"AudioDestinationNode")
		assert.equal(graph.inputs.length,1)
		assert.equal(graph.inputs[0].name,"GainNode")
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
	it("keeps 2 analyser nodes because fft size is different",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'waveform',
					logFftSize: 7,
					next: 2,
				},{
					nodeType: 'frequencyBars',
					logFftSize: 9,
					next: 3,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assertGraphIsChain(graph,["MediaElementAudioSourceNode","AnalyserNode","AnalyserNode","AudioDestinationNode"])
	})
	it("keeps 2 analyser nodes because second analyser has extra input",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'waveform',
					logFftSize: 8,
					next: 2,
				},{
					nodeType: 'frequencyBars',
					logFftSize: 8,
					next: 3,
				},{
					nodeType: 'destination',
				},{
					nodeType: 'audio',
					next: 2,
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assertGraphIsTree(graph,{
			name: "AudioDestinationNode",
			inputs: [{
				name: "AnalyserNode",
				inputs: [{
					name: "AnalyserNode",
					inputs: [{
						name: "MediaElementAudioSourceNode",
						inputs: []
					}]
				},{
					name: "MediaElementAudioSourceNode",
					inputs: []
				}]
			}]
		})
	})
	it("combines 2 analyser nodes into 1",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'waveform',
					logFftSize: 8,
					next: 2,
				},{
					nodeType: 'frequencyBars',
					logFftSize: 8,
					next: 3,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assertGraphIsChain(graph,["MediaElementAudioSourceNode","AnalyserNode","AudioDestinationNode"])
	})
	it("combines 3 analyser nodes into 1",()=>{
		const ctx=getSandbox({
			graph: [
				{
					nodeType: 'audio',
					next: 1,
				},{
					nodeType: 'waveform',
					logFftSize: 8,
					next: 2,
				},{
					nodeType: 'frequencyBars',
					logFftSize: 8,
					next: 3,
				},{
					nodeType: 'frequencyOutline',
					logFftSize: 8,
					next: 4,
				},{
					nodeType: 'destination',
				}
			],
		}).ctx
		const graph=ctx.toJSON()
		assertGraphIsChain(graph,["MediaElementAudioSourceNode","AnalyserNode","AudioDestinationNode"])
	})
})
