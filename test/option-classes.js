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
})
