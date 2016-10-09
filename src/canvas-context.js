'use strict'

const JsLines=require('crnx-base/js-lines')

class CanvasContextJsLines extends JsLines {
	constructor(data,jsName,flags) {
		super(data)
		if (flags.modified) {
			data.unshift(`${jsName}.save();`)
			data.push(`${jsName}.restore();`)
		}
	}
}

class CanvasContext {
	constructor(jsName) {
		this.jsName=jsName
	}
	static getColorStyle(colorOption) {
		const a=JsLines.b()
		const cs=['r','g','b']
		const color=cs.map(c=>colorOption[c]+"%").join()
		if (colorOption.a==100) {
			if (cs.every(c=>colorOption[c]==0)) {
				return "'#000'" // TODO #F00 #0F0 etc
			} else if (cs.every(c=>colorOption[c]==100)) {
				return "'#FFF'"
			} else {
				return `'rgb(${color})'`
			}
		} else {
			return `'rgba(${color},${(colorOption.a/100).toFixed(2)})'`
		}
	}
	b() {
		const props={
			lineWidth: 1,
			strokeStyle: "'#000'",
			fillStyle: "'#000'",
		}
		const flags={
			modified: false
		}
		const a=CanvasContextJsLines.b(this.jsName,flags)
		a.setProp=(prop,value)=>{
			if (props[prop]==value) {
				return JsLines.be()
			} else {
				flags.modified=true
				delete props[prop]
				return JsLines.bae(
					`${this.jsName}.${prop}=${value};`
				)
			}
		}
		a.getColorStyle=(colorOption)=>CanvasContext.getColorStyle(colorOption)
		a.jsName=this.jsName
		return a
	}
}

module.exports=CanvasContext
