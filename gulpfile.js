'use strict'

const gulp=require('gulp')
const gulpTasks=require('crnx-build/gulp-tasks')

gulpTasks(
	gulp,
	{
		en: "Web Audio API example generator",
		ru: "Генератор примеров Web Audio API",
	},
	['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/styles/default.min.css'],
	['http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.3.0/highlight.min.js'],
	[require.resolve('crnx-base')]
)
