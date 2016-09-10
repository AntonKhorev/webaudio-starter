'use strict'

const assert=require('assert')
const Options=require('../src/options')

describe("Option.Graph",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['Graph','filters',[
					['Int','lod',[0,10],6],
					['Float','angle',[-180,180]],
					['Group','stuff',[
						['Checkbox','thing'],
					]],
				]],
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
				{type:'lod',x:10,y:3,value:7},
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
		assert.equal(n1.entry.value,7)
	})
	it("imports data without next shortcut",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:2,y:1,next:[1,2]},
				{type:'lod',x:10,y:3,value:7},
				{type:'angle',x:10,y:7,value:90},
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
				{type:'not-lod',x:10,y:3,value:7},
				{type:'angle',x:10,y:7,value:90},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.nodes.length,2)
		const [n0,n1]=graphEntry.nodes
		assert.deepEqual(n0.next,[1])
		assert.equal(n1.entry.name,'angle')
	})
	it("exports data",()=>{
		const options=new TestOptions
		const graphEntry=options.root.entries[0]
		const e0=graphEntry.makeEntry('angle')
		e0.value=42
		const e1=graphEntry.makeEntry('lod')
		graphEntry.nodes=[
			{entry:e0,next:[],x:2,y:4},
			{entry:e1,next:[0],x:7,y:8},
		]
		assert.deepEqual(options.export(),{
			filters: [
				{type:'angle',x:2,y:4,value:42},
				{next:0,x:7,y:8},
			],
		})
	})
	it("fixes data",()=>{
		const options=new TestOptions
		const graphEntry=options.root.entries[0]
		const e0=graphEntry.makeEntry('angle')
		e0.value=42
		const e1=graphEntry.makeEntry('lod')
		graphEntry.nodes=[
			{entry:e0,next:[],x:2,y:4},
			{entry:e1,next:[0],x:7,y:8},
		]
		const fixed=options.fix()
		assert.equal(fixed.filters.nodes.length,2)
		assert.equal(fixed.filters.nodes[0].type,'angle')
		assert.equal(fixed.filters.nodes[0].value,42)
		assert.deepEqual(fixed.filters.nodes[0].next,[])
		assert.equal(fixed.filters.nodes[1].type,'lod')
		assert.equal(fixed.filters.nodes[1].value,6)
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
				{type:'lod',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),true)
	})
	it("can't connect two connected nodes",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'lod',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),false)
	})
	it("can create a cycle",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'lod',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(1,0),true)
	})
})

describe("Option.AcyclicGraph",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['AcyclicGraph','filters',[
					['Int','lod',[0,10],6],
					['Float','angle',[-180,180]],
					['Group','stuff',[
						['Checkbox','thing'],
					]],
				]],
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
				{type:'lod',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),true)
	})
	it("can't connect two connected nodes",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'lod',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(0,1),false)
	})
	it("can't create a cycle",()=>{
		const options=new TestOptions({
			filters: [
				{type:'stuff',x:0,y:0,next:1},
				{type:'lod',x:10,y:0},
			],
		})
		const graphEntry=options.root.entries[0]
		assert.equal(graphEntry.canConnect(1,0),false)
	})
})
