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
	const makeColor=(cs)=>{
		const color={}
		;['r','g','b','a'].forEach((c,i)=>{
			color[c]=cs[i]
		})
		return color
	}
	for (const [name,colorGetter] of [
		['static',(color)=>{
			return CanvasContext.getColorStyle(color)
		}],
		['lines',(color)=>{
			const canvasContext=new CanvasContext('canvasContext')
			const a=canvasContext.b()
			return a.getColorStyle(color)
		}],
	]) {
		const getter=(...cs)=>colorGetter(makeColor(cs))
		it(`returns rgb color style (${name})`,()=>{
			const color=getter(12,34,56,100)
			assert.equal(color,"'rgb(12%,34%,56%)'")
		})
		it(`returns rgba color style (${name})`,()=>{
			const color=getter(12,34,56,78)
			assert.equal(color,"'rgba(12%,34%,56%,0.78)'")
		})
		it(`doesn't return #000 color style for color with alpha (${name})`,()=>{
			const color=getter(0,0,0,99)
			assert.equal(color,"'rgba(0%,0%,0%,0.99)'")
		})
		it(`returns #000 color style (${name})`,()=>{
			const color=getter(0,0,0,100)
			assert.equal(color,"'#000'")
		})
		it(`returns #FFF color style (${name})`,()=>{
			const color=getter(100,100,100,100)
			assert.equal(color,"'#FFF'")
		})
		it(`returns #0F0 color style (${name})`,()=>{
			const color=getter(0,100,0,100)
			assert.equal(color,"'#0F0'")
		})
		it(`returns #369 color style (${name})`,()=>{
			const color=getter(20,40,60,100)
			assert.equal(color,"'#369'")
		})
	}
})
