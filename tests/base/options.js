'use strict';

const assert=require('assert');
const Option=require('../../base/option-classes.js');
const Options=require('../../base/options.js');

/*
// unused for now
var VisiCheck=function(){
	this.visible=true;
};
VisiCheck.prototype.toggle=function(visibility){
	if (visibility===true || visibility===false) {
		this.visible=visibility;
	} else {
		throw "visibility value neither true nor false";
	}
};

describe("Visibility test utility",function(){
	it("works",function(){
		var $=new VisiCheck;
		assert($.visible);
		$.toggle(false);
		assert(!$.visible);
		$.toggle(true);
		assert($.visible);
		assert.throws(function(){
			$.toggle();
		});
	});
});
*/

describe("Base/Options",()=>{
	context("empty",()=>{
		it("has root",()=>{
			const options=new Options;
			assert(options.root instanceof Option.Root);
		});
		it("root is visible",()=>{
			const options=new Options;
			assert(options.root.isVisible());
		});
		it("exports data",()=>{
			const options=new Options;
			assert.deepEqual(options.export(),{
			});
		});
	});
	context("selects",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Select','foobar',['foo','bar','baz']],
					['Select','letter',['a','b','c','d','e'],'c'],
				];
			}
		}
		it("has root",()=>{
			const options=new TestOptions;
			assert(options.root instanceof Option.Root);
		});
		it("traverses entries",()=>{
			const options=new TestOptions;
			const fullNames=['foobar','letter'];
			const values=['foo','c'];
			const availableValues=[['foo','bar','baz'],['a','b','c','d','e']];
			options.root.entries.forEach((option,i)=>{
				assert(option instanceof Option.Select,"option entry type isn't Select");
				assert.equal(option.fullName,fullNames[i]);
				assert.equal(option.value,values[i]);
				assert.deepEqual(option.availableValues,availableValues[i]);
			});
		});
		it("imports data",()=>{
			const options=new TestOptions({
				letter: 'e',
			});
			const values=['foo','e'];
			options.root.entries.forEach((option,i)=>{
				assert.equal(option.value,values[i]);
			});
		});
		it("exports unchanged data",()=>{
			const options=new TestOptions;
			assert.deepEqual(options.export(),{
			});
		});
		it("exports changed data",()=>{
			const options=new TestOptions;
			options.root.entries[0].value='bar';
			assert.deepEqual(options.export(),{
				foobar: 'bar',
			});
		});
		it("fixes data",()=>{
			const options=new TestOptions;
			options.root.entries[0].value='bar';
			const fixed=options.fix();
			assert.equal(fixed.foobar,'bar');
			assert.equal(fixed.foobar.value,'bar');
			assert.equal(fixed.foobar.name,'foobar');
			assert.equal(fixed.letter,'c');
			assert.equal(fixed.letter.value,'c');
			assert.equal(fixed.letter.name,'letter');
			assert.equal(fixed.entries.length,2,"has wrong length");
			assert.deepEqual(fixed.entries.map(entry=>String(entry)),['bar','c']);
			assert.deepEqual(fixed.entries.map(entry=>entry.value),['bar','c']);
			assert.deepEqual(fixed.entries.map(entry=>entry.name),['foobar','letter']);
		});
	});
	context("groups and selects",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Group','silly',[
						['Select','foobar',['foo','bar','baz']],
						['Select','letter',['a','b','c','d','e'],'c'],
					]],
					['Group','stupid',[
						['Select','what',['nothing','something']],
					]],
				];
			}
		}
		it("has root",()=>{
			const options=new TestOptions;
			assert(options.root instanceof Option.Root);
		});
		it("traverses entries",()=>{
			const options=new TestOptions;
			const fullGroupNames=['silly','stupid'];
			const fullNames=[
				['silly.foobar','silly.letter'],
				['stupid.what'],
			];
			const values=[
				['foo','c'],
				['nothing']
			];
			const availableValues=[
				[['foo','bar','baz'],['a','b','c','d','e']],
				[['nothing','something']]
			];
			options.root.entries.forEach((option,i)=>{
				assert(option instanceof Option.Group,"option entry type isn't Group");
				assert.equal(option.fullName,fullGroupNames[i]);
				option.entries.forEach((option,j)=>{
					assert(option instanceof Option.Select,"option entry type isn't Select");
					assert.equal(option.fullName,fullNames[i][j]);
					assert.equal(option.value,values[i][j]);
					assert.deepEqual(option.availableValues,availableValues[i][j]);
				});
			});
		});
		it("imports data",()=>{
			const options=new TestOptions({
				silly: {
					foobar: 'baz'
				},
				stupid: {
					what: 'something'
				}
			});
			const values=[
				['baz','c'],
				['something']
			];
			options.root.entries.forEach((option,i)=>{
				option.entries.forEach((option,j)=>{
					assert.equal(option.value,values[i][j]);
				});
			});
		});
		it("exports unchanged data",()=>{
			const options=new TestOptions;
			assert.deepEqual(options.export(),{
			});
		});
		it("exports changed data",()=>{
			const options=new TestOptions;
			options.root.entries[0].entries[0].value='bar';
			options.root.entries[1].entries[0].value='something';
			assert.deepEqual(options.export(),{
				silly: {
					foobar: 'bar',
				},
				stupid: {
					what: 'something'
				}
			});
		});
		it("fixes data",()=>{
			const options=new TestOptions;
			options.root.entries[0].entries[0].value='bar';
			options.root.entries[1].entries[0].value='something';
			const fixed=options.fix();
			assert.equal(fixed.silly.foobar,'bar');
			assert.equal(fixed.silly.letter,'c');
			assert.equal(fixed.stupid.what,'something');
		});
	});
	context("checkbox and array of selects",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Checkbox','chk'],
					['Array','arr',[
						['Select','shape',['square','triangle','gasket','cube','hat','terrain']],
						['Select','scope',['global','vertex','face']],
						['Select','projection',['ortho','perspective']],
					]],
				];
			}
		}
		it("has default entries",()=>{
			const options=new TestOptions;
			assert.equal(options.root.entries.length,2);
			assert.equal(options.root.entries[0].value,false);
			assert.equal(options.root.entries[1].entries.length,0);
		});
		it("imports data",()=>{
			const options=new TestOptions({
				chk: true,
				arr: [
					{type:'scope', value:'face'},
					{type:'shape', value:'cube'},
					{type:'projection'},
					'hat',
					{},
				]
			});
			assert.equal(options.root.entries.length,2);
			assert.equal(options.root.entries[0].value,true);
			assert.equal(options.root.entries[1].entries.length,5);
			const names=['scope','shape','projection','shape','shape'];
			const fullNames=['arr.scope','arr.shape','arr.projection','arr.shape','arr.shape'];
			const values=['face','cube','ortho','hat','square'];
			options.root.entries[1].entries.forEach((option,i)=>{
				assert.equal(option.name,names[i]);
				assert.equal(option.fullName,fullNames[i]);
				assert.equal(option.value,values[i]);
			});
		});
		it("exports changed data",()=>{
			const options=new TestOptions;
			options.root.entries[0].value=true;
			options.root.entries[1].addEntry('scope');
			options.root.entries[1].addEntry('shape');
			options.root.entries[1].entries[1].value='triangle';
			options.root.entries[1].addEntry('shape');
			options.root.entries[1].addEntry('projection');
			options.root.entries[1].entries[3].value='perspective';
			assert.deepEqual(options.export(),{
				chk: true,
				arr: [
					{type:'scope'},
					'triangle',
					{},
					{type:'projection', value:'perspective'},
				],
			});
		});
		it("fixes data",()=>{
			const options=new TestOptions;
			options.root.entries[0].value=true;
			options.root.entries[1].addEntry('scope');
			options.root.entries[1].addEntry('shape');
			options.root.entries[1].entries[1].value='triangle';
			const fixed=options.fix();
			assert.equal(fixed.chk,true);
			assert.equal(fixed.arr.entries.length,2);
			assert.equal(fixed.arr.entries[0].type,'scope');
			assert.equal(fixed.arr.entries[0],'global');
			assert.equal(fixed.arr.entries[0].value,'global');
			assert.equal(fixed.arr.entries[1].type,'shape');
			assert.equal(fixed.arr.entries[1],'triangle');
			assert.equal(fixed.arr.entries[1].value,'triangle');
		});
		it("calls update when adding entry to array",()=>{
			const options=new TestOptions;
			let updated=false;
			options.updateCallback=()=>{
				updated=true;
			};
			options.root.entries[1].addEntry('shape');
			assert.equal(updated,true,"didn't call update");
		});
		it("calls update when rewriting array entries",()=>{
			const options=new TestOptions;
			options.root.entries[1].addEntry('shape');
			options.root.entries[1].addEntry('scope');
			let updated=false;
			options.updateCallback=()=>{
				updated=true;
			};
			options.root.entries[1].entries=[
				options.root.entries[1].entries[1],
				options.root.entries[1].entries[0],
			];
			assert.equal(updated,true,"didn't call update");
		});
	});
	context("array of groups",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Array','arr',[
						['Group','grp',[
							['Text','txt',['blabla']]
						]],
					]],
				];
			}
		}
		it("adds array entry",()=>{
			const options=new TestOptions;
			const arrayEntry=options.root.entries[0];
			assert.equal(arrayEntry.entries.length,0);
			arrayEntry.addEntry('grp');
			assert.equal(arrayEntry.entries.length,1);
			assert.equal(arrayEntry.entries[0].entries[0].name,'txt');
			assert.equal(arrayEntry.entries[0].entries[0].value,'blabla');
		});
	});
	context("array of groups with member named 'type'",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Array','arr',[
						['Group','gain',[
							// ['Float','gain',[0,10],1],
							['Text','gain',['0','10'],'1'],
						]],
						['Group','biquad',[
							['Select','type',[
								'lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch','allpass'
							]],
						]],
					],'filter'],
				];
			}
		}
		it("has empty array by default",()=>{
			const options=new TestOptions;
			const arrayEntry=options.root.entries[0];
			assert.equal(arrayEntry.entries.length,0);
		});
		it("returns available array types",()=>{
			const options=new TestOptions;
			const arrayEntry=options.root.entries[0];
			assert.deepEqual(arrayEntry.availableTypes,[
				'gain','biquad'
			]);
		});
		it("adds array entry",()=>{
			const options=new TestOptions;
			const arrayEntry=options.root.entries[0];
			arrayEntry.addEntry('biquad');
			assert.equal(arrayEntry.entries.length,1);
			assert.equal(arrayEntry.entries[0].entries[0].name,'type');
			assert.equal(arrayEntry.entries[0].entries[0].value,'lowpass');
		});
		it("imports data",()=>{
			const options=new TestOptions({
				arr: [
					{filter:'gain', gain:'2'},
					{filter:'biquad', type:'bandpass'},
					{filter:'gain'},
					{filter:'biquad'},
					{gain:'3'},
					{},
				],
			});
			const arrayEntry=options.root.entries[0];
			assert.equal(arrayEntry.entries.length,6);
			const names=['gain','biquad','gain','biquad','gain','gain'];
			const subNames=['gain','type','gain','type','gain','gain'];
			const subValues=['2','bandpass','1','lowpass','3','1'];
			arrayEntry.entries.forEach((option,i)=>{
				assert.equal(option.name,names[i]);
				assert.equal(option.entries[0].name,subNames[i]);
				assert.equal(option.entries[0].value,subValues[i]);
			});
		});
		it("exports changed data",()=>{
			const options=new TestOptions;
			const arrayEntry=options.root.entries[0];
			arrayEntry.addEntry('gain');
			arrayEntry.entries[0].entries[0].value='4';
			arrayEntry.addEntry('biquad');
			arrayEntry.entries[1].entries[0].value='notch';
			arrayEntry.addEntry('gain');
			arrayEntry.addEntry('biquad');
			assert.deepEqual(options.export(),{
				arr: [
					{gain:'4'},
					{filter:'biquad', type:'notch'},
					{},
					{filter:'biquad'},
				],
			});
		});
		it("fixes data",()=>{
			const options=new TestOptions;
			const arrayEntry=options.root.entries[0];
			arrayEntry.addEntry('gain');
			arrayEntry.entries[0].entries[0].value='4';
			arrayEntry.addEntry('biquad');
			arrayEntry.entries[1].entries[0].value='notch';
			arrayEntry.addEntry('gain');
			arrayEntry.addEntry('biquad');
			const fixed=options.fix();
			assert.equal(fixed.arr.entries.length,4);
			assert.equal(fixed.arr.entries[0].filter,'gain');
			assert.equal(fixed.arr.entries[0].gain,'4');
			assert.equal(fixed.arr.entries[1].filter,'biquad');
			assert.equal(fixed.arr.entries[1].type,'notch');
			assert.equal(fixed.arr.entries[2].filter,'gain');
			assert.equal(fixed.arr.entries[2].gain,'1');
			assert.equal(fixed.arr.entries[3].filter,'biquad');
			assert.equal(fixed.arr.entries[3].type,'lowpass');
		});
	});
	context("array of groups in reverse order with member named 'type'",()=>{
		class TestOptions extends Options {
			get entriesDescription() {
				return [
					['Array','arr',[
						['Group','biquad',[
							['Select','type',[
								'lowpass','highpass','bandpass','lowshelf','highshelf','peaking','notch','allpass'
							]],
						]],
						['Group','gain',[
							// ['Float','gain',[0,10],1],
							['Text','gain',['0','10'],'1'],
						]],
					],'filter'],
				];
			}
		}
		it("returns available array types",()=>{
			const options=new TestOptions;
			const arrayEntry=options.root.entries[0];
			assert.deepEqual(arrayEntry.availableTypes,[
				'biquad','gain'
			]);
		});
	});
});
