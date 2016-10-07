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
		a.jsName=this.jsName
		return a
	}
}

module.exports=CanvasContext
