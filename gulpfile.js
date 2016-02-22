'use strict';

const gulp=require('gulp');
const gulpTasks=require('crnx-build/gulp-tasks');

gulpTasks(
	gulp,
	"WebAudio demo",
	['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.1.0/styles/default.min.css'],
	['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.1.0/highlight.min.js']
);
