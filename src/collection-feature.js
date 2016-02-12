'use strict';

const Lines=require('./html-lines.js');
const Feature=require('./feature.js');

class CollectionFeature extends Feature {
	constructor(entryOptions) {
		super();
		const entryCounts=new Map;
		entryOptions.entries.forEach(entryOption=>{
			const entryClass=this.getEntryClass(entryOption);
			entryCounts.set(entryClass,entryCounts.get(entryClass)+1||1);
		});
		const entryCounts2=new Map;
		this.entries=entryOptions.entries.map(entryOption=>{
			const entryClass=this.getEntryClass(entryOption);
			if (entryCounts.get(entryClass)>1) {
				const n=entryCounts2.get(entryClass)||0;
				entryCounts2.set(entryClass,n+1);
				return new entryClass(entryOption,n);
			} else {
				return new entryClass(entryOption);
			}
		});
	}
	getHtmlLines(featureContext,i18n) {
		return new Lines(...this.entries.map(entry=>entry.getHtmlLines(featureContext,i18n)));
	}
	// abstract:
	// getEntryClass(entryOption) {}
}

module.exports=CollectionFeature;
