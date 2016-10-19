'use strict'

class GroupNodeOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		this.option=option
		this.$output=option.$=$("<fieldset class='node-option'>").append(
			"<legend>"+i18n('options.'+option.fullName)+"</legend>",
			option.entries.map(writeOption)
		)
	}
}

module.exports=GroupNodeOptionOutput
