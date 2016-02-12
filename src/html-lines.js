'use strict';

const Lines=require('crnx-base/lines');

class HtmlLines extends Lines {
	preprocessString(str) { // http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
		return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}
}

module.exports=HtmlLines;
