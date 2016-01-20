'use strict';

const Option=require('../base/option-classes.js');

class OptionsOutput {
	constructor(options,generateId,i18n) {
		const optionClassWriters=this.optionClassWriters;
		function write(option) {
			for (let i=optionClassWriters.length-1;i>=0;i--) { // most specific options at the end need to be checked first
				const optionClass=optionClassWriters[i][0];
				const optionClassWriter=optionClassWriters[i][1];
				if (option instanceof optionClass) {
					return optionClassWriter(option,write,i18n,generateId);
				}
			}
		}
		// public prop:
		this.$output=write(options.root);
	}
	// override this fn for custom writers
	get optionClassWriters() {
		// TODO use Map and superclass chain instead
		return [
			[Option.Root,(option,write,i18n,generateId)=>{
				return option.$=$("<div class='options-output'>").append(
					option.entries.map(write)
				);
			}],
			[Option.Checkbox,(option,write,i18n,generateId)=>{
				const id=generateId();
				return option.$=$("<div>")
					.append(
						$("<input type='checkbox' id='"+id+"'>")
							.prop('checked',option.value)
							.change(function(){
								option.value=$(this).prop('checked');
							})
					)
					.append(" <label for='"+id+"'>"+i18n('options.'+option.fullName)+"</label>");
			}],
		];
	}
}

module.exports=OptionsOutput;
