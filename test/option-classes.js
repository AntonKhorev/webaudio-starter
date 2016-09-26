'use strict'

const assert=require('assert')
const Options=require('../src/options')

const graphInsides=[
	['GraphNode','mesh',[
		['Int','lod',[0,10],6],
	]],
	['GraphNode','rotate',[
		['Float','angle',[-180,180]],
	]],
	['GraphNode','stuff',[
		['Checkbox','thing'],
	]],
	['GraphSource','src'],
	['GraphSink','dst'],
]

describe("Option.Graph",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['Graph','filters',graphInsides],
			]
		}
	}
	it("creates empty graph",()=>{
		const options=new TestOptions
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.nodes.length,0)
	})
	it("imports data with next shortcut",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:2,y:1,next:1},
				{type:'mesh',x:10,y:3,lod:7},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.nodes.length,2)
		const [n0,n1]=graphEntry.nodes
		assert.deepEqual(n0.next,[1])
		assert.equal(n0.x,2)
		assert.equal(n0.y,1)
		assert.equal(n0.entry.entries[0].value,false)
		assert.deepEqual(n1.next,[])
		assert.equal(n1.x,10)
		assert.equal(n1.y,3)
		assert.equal(n1.entry.entries[0].value,7)
	})
	it("imports data without next shortcut",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:2,y:1,next:[1,2]},
				{type:'mesh',x:10,y:3,lod:7},
				{type:'rotate',x:10,y:7,angle:90},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.nodes.length,3)
		const [n0,n1,n2]=graphEntry.nodes
		assert.deepEqual(n0.next,[1,2])
	})
	it("imports data with bogus entry",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:2,y:1,next:[1,2]},
				{type:'not-mesh',x:10,y:3,lod:7},
				{type:'rotate',x:10,y:7,angle:90},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.nodes.length,2)
		const [n0,n1]=graphEntry.nodes
		assert.deepEqual(n0.next,[1])
		assert.equal(n1.entry.name,'rotate')
	})
	it("exports data",()=>{
		const options=new TestOptions
		const graphEntry=options.root.entries[0]
		const e0=graphEntry.makeEntry('rotate')
		e0.entries[0].value=42
		const e1=graphEntry.makeEntry('mesh')
		graphEntry.nodes=[
			{entry:e0,next:[],x:2,y:4},
			{entry:e1,next:[0],x:7,y:8},
		]
		assert.deepEqual(options.export(),{
			filters: [
				{type:'rotate',x:2,y:4,angle:42},
				{next:0,x:7,y:8},
			],
		})
	})
	it("fixes data",()=>{
		const options=new TestOptions
		const graphEntry=options.root.entries[0]
		const e0=graphEntry.makeEntry('rotate')
		e0.entries[0].value=42
		const e1=graphEntry.makeEntry('mesh')
		graphEntry.nodes=[
			{entry:e0,next:[],x:2,y:4},
			{entry:e1,next:[0],x:7,y:8},
		]
		const fixed=options.fix()
		assert.equal(fixed.filters.nodes.length,2)
		assert.equal(fixed.filters.nodes[0].type,'rotate')
		assert.equal(fixed.filters.nodes[0].angle.value,42)
		assert.deepEqual(fixed.filters.nodes[0].next,[])
		assert.equal(fixed.filters.nodes[1].type,'mesh')
		assert.equal(fixed.filters.nodes[1].lod.value,6)
		assert.deepEqual(fixed.filters.nodes[1].next,[0])
	})
	it("can connect a node to itself",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,0),true)
	})
	it("can connect two unconnected nodes",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0},
				{type:'mesh',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),true)
	})
	it("can't connect two connected nodes",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'mesh',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),false)
	})
	it("can create a cycle",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'mesh',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(1,0),true)
	})
	it("can't connect to a source",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0},
				{type:'src',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),false)
	})
	it("can't connect a sink to anything",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0},
				{type:'dst',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(1,0),false)
	})
	it("doesn't connnect to a source when asked by import data",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'src',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.deepEqual(graphEntry.nodes[0].next,[])
	})
	it("doesn't connnect to a source when asked by editing",()=>{
		const options=new TestOptions
		const graphEntry=options.root.entries[0]
		const e0=graphEntry.makeEntry('stuff')
		const e1=graphEntry.makeEntry('src')
		graphEntry.nodes=[
			{entry:e0,next:[1],x:2,y:4},
			{entry:e1,next:[],x:7,y:8},
		]
		assert.deepEqual(graphEntry.nodes[0].next,[])
	})
})

describe("Option.AcyclicGraph",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['AcyclicGraph','filters',graphInsides],
			]
		}
	}
	it("can't connect a node to itself",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:2,y:2},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,0),false)
	})
	it("can connect two unconnected nodes",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0},
				{type:'mesh',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),true)
	})
	it("can't connect two connected nodes",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'mesh',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),false)
	})
	it("can't create a cycle",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'mesh',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(1,0),false)
	})
	it("doesn't create a cycle when asked by editing",()=>{
		const options=new TestOptions
		const graphEntry=options.root.entries[0]
		const e0=graphEntry.makeEntry('stuff')
		const e1=graphEntry.makeEntry('mesh')
		graphEntry.nodes=[
			{entry:e0,next:[1],x:2,y:4},
			{entry:e1,next:[0],x:7,y:8},
		]
		assert.deepEqual(graphEntry.nodes[0].next,[1])
		assert.deepEqual(graphEntry.nodes[1].next,[])
	})
})
