'use strict';

const gulp=require('gulp');
const gulpTasks=require('crnx-build/gulp-tasks');

gulpTasks(
	gulp,
	"WebAudio demo",
	['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/styles/default.min.css'],
	['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.7/highlight.min.js']
);
