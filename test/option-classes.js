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
		assert.equal(graphEntry.entries.length,0)
	})
})
