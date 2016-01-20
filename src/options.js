'use strict';

const BaseOptions=require('../base/options.js');

class Options extends BaseOptions {
	get entriesDescription() {
		return [
			['Checkbox','gain'],
		]
	};
}

module.exports=Options;
