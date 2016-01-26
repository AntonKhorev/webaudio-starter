'use strict';

const Option=require('./option-classes.js');
const BaseOptionsOutput=require('../base/options-output.js');

class OptionsOutput extends BaseOptionsOutput {
	setOptionClassWriters(optionClassWriters) {
		super.setOptionClassWriters(optionClassWriters);
		optionClassWriters.set(Option.LiveNumber,(option,writeOption,i18n,generateId)=>{
			const id=generateId();
			return option.$=$("<div class='option'>TODO LiveNumber</div>");
		});
	}
}

module.exports=OptionsOutput;
