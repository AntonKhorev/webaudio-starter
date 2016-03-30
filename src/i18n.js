'use strict'

const langStrings={
	en:{
		'options.sources': "Sources",
		'options.sources.{audio,video}': "{Audio,Video} element",
		'options.sources.{audio,video}.add': "Add {} element",
		'options.sources.{audio,video}.url': "Source URL",
		'options.sources.video.{width,height}': "Player {}",

		'options.filters': "Filters",
		'options.filters.gain': "Gain",
		'options.filters.gain.add': "Add gain",
		'options.filters.gain.gain': "Gain",
		'options.filters.panner': "Stereo panner",
		'options.filters.panner.add': "Add stereo panner",
		'options.filters.panner.pan': "Pan",
		'options.filters.biquad': "Biquad filter", // [[Digital biquad filter]]
		'options.filters.biquad.add': "Add biquad filter",
		'options.filters.biquad.type': "Filter type",
		'options.filters.biquad.type.{lowpass,highpass,bandpass,lowshelf,highshelf,peaking,notch,allpass}': "{}",
		'options.filters.biquad.frequency': "Frequency",
		'options.filters.biquad.Q': "log(Q)",
		'options.filters.biquad.detune': "Detune",
		'options.filters.biquad.gain': "Gain",
		'options.filters.iir': "IIR filter",
		'options.filters.iir.add': "Add IIR filter",
		'options.filters.iir.feedforward': "Feedforward coefficients", // Transfer fn numerator coefs
		'options.filters.iir.feedforward.b': "b",
		'options.filters.iir.feedforward.b.add': "Add coefficient",
		'options.filters.iir.feedback': "Feedback coefficients", // Transfer fn denominator coefs
		'options.filters.iir.feedback.a': "a",
		'options.filters.iir.feedback.a.add': "Add coefficient",
		'options.filters.convolver': "Convolver",
		'options.filters.convolver.add': "Add convolver",
		'options.filters.convolver.url': "Impulse responce URL",
		'options.filters.convolver.reverb': "Reverb (dry/wet)",
		'options.filters.convolver.buffer.loading': "Loading and decoding the impulse response",
		'options.filters.convolver.buffer.error': "Error while loading the impulse response",
		'options.filters.equalizer': "Equalizer",
		'options.filters.equalizer.add': "Add equalizer",
		'options.filters.equalizer.gain{60,170,350,1000,3500,10000}': "{} Hz gain",

		'options.destination': "Destination",
		'options.destination.compressor': "Add dynamics compressor before the destination",
		'options.destination.compressor.enable': "Enable dynamics compressor",
		'options.destination.waveform': "Add waveform visualization",

		'options.canvas': "Canvas",
		'options.canvas.{width,height}': "Canvas {}",
		'options.canvas.line': "Waveform line",
		'options.canvas.line.width': "Waveform line width",
		'options.canvas.line.color': "Waveform line color",
		'options.canvas.line.color.{r,g,b,a}': "Waveform line {red,green,blue,opacity}",
		'options.canvas.background': "Background",
		'options.canvas.background.type': "Background type",
		'options.canvas.background.type.{clear,filled}': "{}",
		'options.canvas.background.color': "Background fill color",
		'options.canvas.background.color.{r,g,b,a}': "Background fill {red,green,blue,opacity (blur)}",

		'options-output.input': "Editable",
		'options-output.range': "with range",
		'options-output.biquadFilter.frequencyResponse': "Frequency response",
		'options-output.biquadFilter.magnitude': "Magnitude",
		'options-output.biquadFilter.phase': "Phase",
		'options-output.biquadFilter.error': "Error creating audio context. Browser likely doesn't support Web Audio API.",
		'options-output.show': "Show",
		'options-output.hide': "Hide",

		'code-output.warning.jsfiddle-run': "You may have to click <kbd>Run</kbd> in JSFiddle to get sound output working",

		'code.title': "Web Audio API example — generated code",

		'comment.context': "create [audio context][context]",
		'comment.sources.audio': "create [audio source node][source]",
		'comment.sources.video': "create [video source node][source]",
		'comment.filters.gain': "create [gain node][gain]",
		'comment.filters.panner': "create [stereo panner node][panner]",
		'comment.filters.biquad': "create [biquad filter node][biquad]",
		'comment.filters.iir': "create [IIR filter node][iir]",
		'comment.filters.convolver': "create dry and wet routes with [convolver node][convolver]",
		'comment.filters.convolver.single': "create [convolver node][convolver]",
		'comment.filters.equalizer': "create equalizer as a sequence of [peaking][peaking] [biquad filter nodes][biquad]",
		'comment.filters.equalizer.single': "create equalizer as a [peaking][peaking] [biquad filter node][biquad]",
		'comment.destination': "connect last node to [destination][destination]",
		'comment.destination.compressor': "create [dynamics compressor node][compressor]",
		'comment.destination.waveform': "create [analyser node][analyser] for waveform visualization",

		'units.pixel.a': "px",
		'units.pixel.{1,2}': "pixel{,s}",
		'units.hertz.a': "Hz",
		'units.hertz.{1,2}': "Hertz",
		'units.decibel.a': "dB",
		'units.decibel.{1,2}': "decibel{,s}",
	},
	ru:{
		'options.sources': "Источники",
		'options.sources.{audio,video}': "Элемент <code>{}</code>",
		'options.sources.{audio,video}.add': "Добавить элемент <code>{}</code>",
		'options.sources.{audio,video}.url': "URL источника",
		'options.sources.video.{width,height}': "{Ширина,Высота} проигрывателя",

		'options.filters': "Фильтры",
		'options.filters.gain': "Усилитель",
		'options.filters.gain.add': "Добавить усилитель",
		'options.filters.gain.gain': "Коэффициент усиления",
		'options.filters.panner': "Панорамирование",
		'options.filters.panner.add': "Добавить панорамирование",
		'options.filters.panner.pan': "Баланс",
		'options.filters.biquad': "Биквадратичный фильтр",
		'options.filters.biquad.add': "Добавить биквадратичный фильтр",
		'options.filters.biquad.type': "Тип фильтра",
		'options.filters.biquad.type.lowpass': "нижних частот",
		'options.filters.biquad.type.highpass': "верхних частот",
		'options.filters.biquad.type.bandpass': "полосовой",
		'options.filters.biquad.type.{lowshelf,highshelf,peaking}': "{}", // TODO
		'options.filters.biquad.type.notch': "полосно-заграждающий",
		'options.filters.biquad.type.allpass': "всепропускающий", // http://www.dsplib.ru/content/allpass/allpass.html
		'options.filters.biquad.frequency': "Частота",
		'options.filters.biquad.Q': "Логарифм добротности",
		'options.filters.biquad.detune': "Detune",
		'options.filters.biquad.gain': "Усиление",
		'options.filters.iir': "БИХ-фильтр",
		'options.filters.iir.add': "Добавить БИХ-фильтр",
		'options.filters.iir.feedforward': "Коэффициенты прямой связи", // Transfer fn numerator coefs
		'options.filters.iir.feedforward.b': "b",
		'options.filters.iir.feedforward.b.add': "Добавить коэффициент",
		'options.filters.iir.feedback': "Коэффициенты обратной связи", // Transfer fn denominator coefs
		'options.filters.iir.feedback.a': "a",
		'options.filters.iir.feedback.a.add': "Добавить коэффициент",
		'options.filters.convolver': "Свёртка",
		'options.filters.convolver.add': "Добавить свёртку",
		'options.filters.convolver.url': "URL импульсной характеристики",
		'options.filters.convolver.reverb': "Соотношение прямого/обработанного звука", // http://www.ixbt.com/proaudio/theory-of-reverb.shtml
		'options.filters.convolver.buffer.loading': "Идёт загрузка и декодирование импульсной характеристики",
		'options.filters.convolver.buffer.error': "Ошибка загрузки импульсной характеристики",
		'options.filters.equalizer': "Эквалайзер",
		'options.filters.equalizer.add': "Добавить эквалайзер",
		'options.filters.equalizer.gain{60,170,350,1000,3500,10000}': "Усиление частоты {} Гц",

		'options.destination': "Выход",
		'options.destination.compressor': "Добавить компрессор перед выходом",
		'options.destination.compressor.enable': "Включить компрессор",
		'options.destination.waveform': "Добавить визуализацию формы волны",

		'options.canvas': "Элемент <code>canvas</code>",
		'options.canvas.{width,height}': "{Ширина,Высота} элемента <code>canvas</code>",
		'options.canvas.line': "Линия волны",
		'options.canvas.line.width': "Ширина линии волны",
		'options.canvas.line.color': "Цвет линии волны",
		'options.canvas.line.color.{r,g,b,a}': "{Красный ,Зелёный ,Синий ,Альфа-}канал линии волны",
		'options.canvas.background': "Фон",
		'options.canvas.background.type': "Тип фона",
		'options.canvas.background.type.{clear,filled}': "{прозрачный,закрашенный}",
		'options.canvas.background.color': "Цвет фона",
		'options.canvas.background.color.{r,g,b,a}': "{Красный ,Зелёный ,Синий ,Альфа-}канал фона",

		'options-output.input': "Значение изменяемо",
		'options-output.range': "в диапазоне",
		'options-output.biquadFilter.frequencyResponse': "Частотная характеристика",
		'options-output.biquadFilter.magnitude': "Амплитуда",
		'options-output.biquadFilter.phase': "Фаза",
		'options-output.biquadFilter.error': "Ошибка создания аудио-контекста. Вероятно, браузер не поддерживает Web Audio API.",
		'options-output.show': "Показать",
		'options-output.hide': "Скрыть",

		'code-output.warning.jsfiddle-run': "Для корректного вывода звука в JSFiddle может потребоваться нажатие кнопки <kbd>Run</kbd>",

		'code.title': "Пример использования Web Audio API — сгенерированный код",

		'comment.context': "создаём [аудио-контекст][context]",
		'comment.sources.audio': "создаём [узел источника аудио][source]",
		'comment.sources.video': "создаём [узел источника видео][source]",
		'comment.filters.gain': "создаём [узел усилителя][gain]",
		'comment.filters.panner': "создаём [узел панорамирования][panner]",
		'comment.filters.biquad': "создаём [узел биквадратичного фильтра][biquad]",
		'comment.filters.iir': "создаём [узел БИХ-фильтра][iir]",
		'comment.filters.convolver': "создаём прямой путь и путь через [узел свёртки][convolver]",
		'comment.filters.convolver.single': "создаём [узел свёртки][convolver]",
		'comment.filters.equalizer': "создаём эквалайзер в виде последовательности [peaking][peaking] [биквадратичных фильтров][biquad]",
		'comment.filters.equalizer.single': "создаём эквалайзер в виде [peaking][peaking] [биквадратичного фильтра][biquad]",
		'comment.destination': "соединяем последний узел с [выходом][destination]",
		'comment.destination.compressor': "создаём [узел компрессора][compressor]",
		'comment.destination.waveform': "создаём [узел анализатора][analyser] для визуализации формы волны",

		'units.pixel.a': "px",
		'units.pixel.{1,2,5}': "пиксел{ь,я,ей}",
		'units.hertz.a': "Гц",
		'units.hertz.{1,2,5}': "Герц{,а,}",
		'units.decibel.a': "дБ",
		'units.decibel.{1,2,5}': "децибел{,а,ов}",
	},
}

/*
function i18nLinkFilter(inStrings) {
	const linkRegexp=/\[(\S+)\s+([^\]]+)]/g
	const outStrings={}
	for (let id in inStrings) {
		outStrings[id]=inStrings[id].replace(linkRegexp,(match,url,text)=>"<a href='"+url+"'>"+text+"</a>")
	}
	return outStrings
}
strings=i18nLinkFilter(strings)
*/

for (let lang in langStrings) {
	let strings=langStrings[lang]
	strings=require('crnx-base/i18n-expand-curly')(strings)
	//strings=require('crnx-base/i18n-link-wikipedia')(lang)(strings)
	strings=require('crnx-base/options-output-i18n')(lang)(strings)
	strings=require('crnx-base/code-output-i18n')(lang)(strings)
	langStrings[lang]=strings
}

module.exports=require('crnx-base/i18n')(langStrings)
