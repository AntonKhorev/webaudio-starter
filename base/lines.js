/*
.a = add AFTER last line
.t = add TO last line
*/

var Lines=function(){
	this.data=[];
	this.addFlattenedArgs(
		this.flattenArgs(arguments)
	);
};

// private
Lines.prototype.flattenArgs=function(s){
	var r=[];
	for (var i=0;i<s.length;i++) {
		if (typeof s[i] == 'string') {
			r.push(s[i]);
		} else if (Array.isArray(s[i])) {
			Array.prototype.push.apply(r,s[i]);
		} else if (s[i] instanceof Lines) {
			Array.prototype.push.apply(r,s[i].data);
		}
	}
	return r;
};
Lines.prototype.addFlattenedArgs=function(s){
	Array.prototype.push.apply(this.data,s);
};

// public
Lines.prototype.a=function(){
	this.addFlattenedArgs(
		this.flattenArgs(arguments)
	);
	return this;
};
Lines.prototype.t=function(){
	var lastLine=this.data.pop();
	var s=this.flattenArgs(arguments);
	s[0]=lastLine+s[0];
	this.addFlattenedArgs(s);
	return this;
};
Lines.prototype.indent=function(level){
	if (level===undefined) {
		level=1;
	}
	this.data=this.data.map(function(line){
		return Array(level+1).join('\t')+line;
	});
	return this;
};
Lines.prototype.isEmpty=function(){
	return this.data.length<=0;
};
Lines.prototype.interleave=function(){
	var first=true;
	for (var i=0;i<arguments.length;i++) {
		var r=this.flattenArgs([arguments[i]]);
		if (r.length>0) {
			if (first) {
				first=false;
			} else {
				this.data.push('');
			}
			this.addFlattenedArgs(r);
		}
	}
	return this;
};
Lines.prototype.wrap=function(begin,end){
	this.indent();
	this.data.unshift(begin);
	this.data.push(end);
	return this;
};
Lines.prototype.wrapIfNotEmpty=function(begin,end){
	if (!this.isEmpty()) {
		this.wrap(begin,end);
	}
	return this;
};
/*
Lines.prototype.wrapEachLine=function(begin,end){
	this.data=this.data.map(function(line){
		return begin+line+end;
	});
	return this;
};
Lines.prototype.map=function(fn){
	this.data=this.data.map(fn);
	return this;
};
*/
Lines.prototype.join=function(indent){
	return this.data.map(function(line){
		return line.replace(/^(\t)+/,function(match){
			return Array(match.length+1).join(indent);
		});
	}).join('\n');
};

module.exports=Lines;
