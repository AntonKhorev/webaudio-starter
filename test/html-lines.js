'use strict';

const assert=require('assert');
const Lines=require('../src/html-lines.js');

describe("HtmlLines",()=>{
	it("constructs escaped html chars",()=>{
		const lines=new Lines("< &");
		assert.deepEqual(lines.data,[
			"&lt; &amp;"
		]);
	});
	it("adds escaped html chars",()=>{
		const lines=new Lines;
		lines.a("< &");
		assert.deepEqual(lines.data,[
			"&lt; &amp;"
		]);
	});
	it("appends escaped html chars",()=>{
		const lines=new Lines;
		lines.a("");
		lines.t("< &");
		assert.deepEqual(lines.data,[
			"&lt; &amp;"
		]);
	});
	it("wraps in escaped chars",()=>{
		const lines=new Lines("contents");
		lines.wrap("<div>","</div>");
		assert.deepEqual(lines.data,[
			"&lt;div&gt;",
			"	contents",
			"&lt;/div&gt;",
		]);
	});
});
