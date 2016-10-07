'use strict'

const assert=require('assert')
const CanvasContext=require('../src/canvas-context')

describe("CanvasContext",()=>{
	it("writes simple expressions",()=>{
		const canvasContext=new CanvasContext('canvasContext')
		const a=canvasContext.b()
		a(
			"42;"
		)
		const lines=a.e()
		assert.deepEqual(lines.get(),[
			"42"
		])
	})
	it("ignores default line width",()=>{
		const canvasContext=new CanvasContext('canvasContext')
		const a=canvasContext.b()
		a(
			a.setProp('lineWidth',1),
			"doStuff();"
		)
		const lines=a.e()
		assert.deepEqual(lines.get(),[
			"doStuff()"
		])
	})
	it("sets line width",()=>{
		const canvasContext=new CanvasContext('canvasContext')
		const a=canvasContext.b()
		a(
			a.setProp('lineWidth',2),
			"doStuff();"
		)
		const lines=a.e()
		assert.deepEqual(lines.get(),[
			"canvasContext.save()",
			"canvasContext.lineWidth=2",
			"doStuff()",
			"canvasContext.restore()"
		])
	})
})
