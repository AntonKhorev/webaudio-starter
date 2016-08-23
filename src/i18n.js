'use strict'

const webaudioSpec='https://webaudio.github.io/web-audio-api/'
const webaudioIssue=n=>`<a href='https://github.com/WebAudio/web-audio-api/issues/${n}'>${n}</a>`
const webaudioDetect='https://github.com/GoogleChrome/web-audio-samples/wiki/Detection-of-lowpass-BiquadFilter-implementation'

const enColors="{<span style='color:#800'>red</span>,<span style='color:#080'>green</span>,<span style='color:#008'>blue</span>,opacity}"
const ruColors="{<span style='color:#800'>Красный</span> ,<span style='color:#080'>Зелёный</span> ,<span style='color:#008'>Синий</span> ,Альфа-}канал"

const langStrings={
	en:{
		'options.sources': "Sources",
		'options.sources.{audio,video}': "{Audio,Video} element",
		'options.sources.{audio,video}.add': "Add {} element",
		'options.sources.sample': "Sample",
		'options.sources.sample.add': "Add sample",
		'options.sources.sample.buffer.loading': "Loading and decoding the sample",
		'options.sources.sample.buffer.error': "Error while loading the sample",
		'options.sources.sample.repeat': "Repeat sample",
		'options.sources.sample.interval': "Interval between repeats",
		'options.sources.sample.randomShift': "Random shift of a start time",
		'options.sources.sample.pitch': "Pitch",
		'options.sources.sample.randomPitch': "Random pitch",
		'options.sources.sample.gain': "Gain",
		'options.sources.sample.randomGain': "Random gain",
		'options.sources.{audio,video,sample}.url': "Source URL",
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
		'options.filters.biquad.detune': "Detune",
		'options.filters.biquad.Q': "log(Q)",
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
		'options.destination.compressor': "Dynamics compressor",
		'options.destination.compressor.enabled': "Add dynamics compressor before the destination",
		'options.destination.{waveform,frequencies}': "{Waveform,Frequencies} visualization",
		'options.destination.{waveform,frequencies}.enabled': "Enable {} visualization",
		'options.destination.waveform.width': "Waveform line width",
		'options.destination.waveform.color': "Waveform line color",
		'options.destination.waveform.color.{r,g,b,a}': `Waveform line ${enColors}`,
		'options.destination.frequencies.cutoff': "Limit plot to a fraction of low frequences",
		'options.destination.frequencies.base': "Frequency bars extend from",
		'options.destination.frequencies.base.{bottom,middle}': "{} of canvas",
		'options.destination.frequencies.coloring': "Frequency bars coloring",
		'options.destination.frequencies.coloring.component': "with single color component",
		'options.destination.frequencies.coloring.spectral': "spectral",
		'options.destination.frequencies.coloringInput': "Frequency bars color depends on",
		'options.destination.frequencies.coloringInput.{amplitude,frequency}': "{}",
		'options.destination.frequencies.outline': "Frequency bars outline",
		'options.destination.frequencies.outline.enabled': "Enable frequency bars outline",
		'options.destination.frequencies.outline.width': "Frequency bars outline width",
		'options.destination.frequencies.outline.color': "Frequency bars outline color",
		'options.destination.frequencies.outline.color.{r,g,b,a}': `Frequency bars outline ${enColors}`,
		'options.destination.volume': "Volume meter",
		'options.destination.volume.enabled': "Enable volume meter",
		'options.destination.volume.stereo': "Meters for left and right stereo channels",
		'options.destination.analyser': "Analyser",
		'options.destination.analyser.logFftSize': "FFT size (power of 2)",

		'options.canvas': "Canvas",
		'options.canvas.{width,height}': "Canvas {}",
		'options.canvas.background': "Background",
		'options.canvas.background.type': "Background type",
		'options.canvas.background.type.{clear,filled}': "{}",
		'options.canvas.background.color': "Background fill color",
		'options.canvas.background.color.{r,g,b,a}': `Background fill ${enColors}`,

		'options.loader': "Sample loader",
		'options.loader.errors': "Error handling",
		'options.loader.errors.none': "disabled",
		'options.loader.errors.network': "network errors",
		'options.loader.errors.http': "network and HTTP errors",

		'options-info.destination.analyser.logFftSize': "[[Fast Fourier transform]] size for the waveform/frequency visualization. Use a larger size to get a wider time window for the waveform and thinner frequency bars.",
		'options-info.canvas.background.color.a': "Lower opacity values lead to a blur effect.",

		'options-output.input': "Editable",
		'options-output.range': "with range",
		'options-output.filter.frequencyResponse': "Frequency response",
		'options-output.filter.magnitude': "Magnitude",
		'options-output.filter.phase': "Phase",
		'options-output.filter.logMagnitude': "log magnitude scale",
		'options-output.filter.logFrequency': "log frequency scale",
		'options-output.filter.contextError': "Error creating audio context. Your browser likely doesn't support Web Audio API.",
		'options-output.filter.nodeError': "Error creating filter node. Your browser likely doesn't support this filter type.",
		'options-output.filter.biquad.clone': "Clone as IIR filter",
		'options-output.filter.biquad.clone.{pre,post}': "Clone with {}-2016-04-15 coefficients",
		'options-output.filter.biquad.clone.info': `<a href='${webaudioSpec}'>The API specification</a> was self-contradictory and implementations weren't following it. Additionally, it was discovered that filter coefficient formulas need to be changed to accomodate a wider range of lowpass and highpass filters. See Web Audio API issues ${webaudioIssue(769)}, ${webaudioIssue(771)} and ${webaudioIssue(791)} for details. A possible method to check if an implementation has switched to the updated formulas is offered <a href='${webaudioDetect}'>here</a>.`,
		'options-output.show': "Show",
		'options-output.hide': "Hide",

		'code-output.warning.jsfiddle-run': "You may have to click <kbd>Run</kbd> in JSFiddle to get sound output working",
		'code-output.warning.interesting': "You need at least one source and some processing enabled to get interesting JavaScript code",

		'code.title': "Web Audio API example — generated code",

		'label.sources.sample.play': "Play sample",
		'label.destination.compressor': "Enable dynamics compressor",

		'comment.context': "create [audio context][context]",
		'comment.sources.audio': "create [audio source node][source]",
		'comment.sources.video': "create [video source node][source]",
		'comment.sources.sample': "load [sample][buffer]",
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
		'comment.destination.analyser': "create [analyser node][analyser]",
		'comment.destination.analyser.{waveform,frequencies,waveform+frequencies}': "create [analyser node][analyser] for {waveform,frequencies,waveform and frequencies} visualization",
		'comment.destination.analyser.split': "create [channel splitter node][splitter] connected to two [analyser nodes][analyser]",

		'units.pixel.a': "px",
		'units.pixel.{1,2}': "pixel{,s}",
		'units.hertz.a': "Hz",
		'units.hertz.{1,2}': "Hertz",
		'units.decibel.a': "dB",
		'units.decibel.{1,2}': "decibel{,s}",
		'units.second.a': "s",
		'units.second.{1,2}': "second{,s}",
	},
	ru:{
		'options.sources': "Источники",
		'options.sources.{audio,video}': "Элемент <code>{}</code>",
		'options.sources.{audio,video}.add': "Добавить элемент <code>{}</code>",
		'options.sources.sample': "Сэмпл",
		'options.sources.sample.add': "Добавить сэмпл",
		'options.sources.sample.buffer.loading': "Идёт загрузка и декодирование сэмпла",
		'options.sources.sample.buffer.error': "Ошибка загрузки сэмпла",
		'options.sources.sample.repeat': "Повторить сэмпл",
		'options.sources.sample.interval': "Интервал между повторами",
		'options.sources.sample.randomShift': "Случайный сдвиг начала проигрывания",
		'options.sources.sample.pitch': "Высота",
		'options.sources.sample.randomPitch': "Случайная высота",
		'options.sources.sample.gain': "Громкость",
		'options.sources.sample.randomGain': "Случайная громкость",
		'options.sources.{audio,video,sample}.url': "URL источника",
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
		'options.filters.biquad.detune': "Detune",
		'options.filters.biquad.Q': "Логарифм добротности",
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
		'options.destination.compressor': "Компрессор",
		'options.destination.compressor.enabled': "Добавить компрессор перед выходом",
		'options.destination.{waveform,frequencies}': "Визуализация {формы волны,частот}",
		'options.destination.{waveform,frequencies}.enabled': "Включить визуализацию {формы волны,частот}",
		'options.destination.waveform.width': "Ширина линии волны",
		'options.destination.waveform.color': "Цвет линии волны",
		'options.destination.waveform.color.{r,g,b,a}': `${ruColors} линии волны`,
		'options.destination.frequencies.cutoff': "Ограничить рисование долей низких частот",
		'options.destination.frequencies.base': "Полосы частот растут от",
		'options.destination.frequencies.base.{bottom,middle}': "{низа,середины} элемента <code>canvas</code>",
		'options.destination.frequencies.coloring': "Раскраска полос частот",
		'options.destination.frequencies.coloring.component': "одним цветовым каналом",
		'options.destination.frequencies.coloring.spectral': "спектральная",
		'options.destination.frequencies.coloringInput': "Цвет полос зависит от",
		'options.destination.frequencies.coloringInput.{amplitude,frequency}': "{амплитуды,частоты}",
		'options.destination.frequencies.outline': "Контур полос частот",
		'options.destination.frequencies.outline.enabled': "Включить рисование контура частот",
		'options.destination.frequencies.outline.width': "Ширина контура частот",
		'options.destination.frequencies.outline.color': "Цвет контура частот",
		'options.destination.frequencies.outline.color.{r,g,b,a}': `${ruColors} контура частот`,
		'options.destination.volume': "Индикатор громкости",
		'options.destination.volume.enabled': "Включить индикатор громкости",
		'options.destination.volume.stereo': "Отдельные индикаторы для левого и правого каналов",
		'options.destination.analyser': "Анализатор",
		'options.destination.analyser.logFftSize': "Размер БПФ (степень 2)",

		'options.canvas': "Элемент <code>canvas</code>",
		'options.canvas.{width,height}': "{Ширина,Высота} элемента <code>canvas</code>",
		'options.canvas.background': "Фон",
		'options.canvas.background.type': "Тип фона",
		'options.canvas.background.type.{clear,filled}': "{прозрачный,закрашенный}",
		'options.canvas.background.color': "Цвет фона",
		'options.canvas.background.color.{r,g,b,a}': `${ruColors} фона`,

		'options.loader': "Загрузчик сэмплов",
		'options.loader.errors': "Обработка ошибок загрузки",
		'options.loader.errors.none': "отключена",
		'options.loader.errors.network': "для сетевых ошибок",
		'options.loader.errors.http': "для сетевых ошибок и ошибок HTTP",

		'options-info.destination.analyser.logFftSize': "Размер [[Быстрое преобразование Фурье|Быстрого преобразования Фурье]] для визуализаций формы волны и частот. Больший размер даёт более широкое окно для формы волны и более тонкие полосы частот.",
		'options-info.canvas.background.color.a': "Низкие значения альфа-канала приводят к эффекту размывания.",

		'options-output.input': "Значение изменяемо",
		'options-output.range': "в диапазоне",
		'options-output.filter.frequencyResponse': "Частотная характеристика",
		'options-output.filter.magnitude': "Амплитуда",
		'options-output.filter.phase': "Фаза",
		'options-output.filter.logMagnitude': "логарифмическая шкала амплитуды",
		'options-output.filter.logFrequency': "логарифмическая шкала частоты",
		'options-output.filter.contextError': "Ошибка создания аудио-контекста. Вероятно, браузер не поддерживает Web Audio API.",
		'options-output.filter.nodeError': "Ошибка создания узла фильтра. Вероятно, браузер не поддерживает данный тип фильтров.",
		'options-output.filter.biquad.clone': "Клонировать в виде БИХ-фильтра",
		'options-output.filter.biquad.clone.{pre,post}': "Клонировать с коэффициентами по версиям {до,после} 2016-04-15",
		'options-output.filter.biquad.clone.info': `<a href='${webaudioSpec}'>Спецификация API</a> была противоречива и реализации ей не следовали. Также было обнаружено, что формулы для коэффициентов фильтров должны быть изменены, чтобы стало возможно задавать некоторые фильтры низких и высоких частот, которые ранее задать было невозможно. Подробности можно узнать из Web Audio API issues ${webaudioIssue(769)}, ${webaudioIssue(771)} и ${webaudioIssue(791)}. Возможный метод обнаружения, перешла ли реализация на новые формулы, приводится <a href='${webaudioDetect}'>здесь</a>.`,
		'options-output.show': "Показать",
		'options-output.hide': "Скрыть",

		'code-output.warning.jsfiddle-run': "Для корректного вывода звука в JSFiddle может потребоваться нажатие кнопки <kbd>Run</kbd>",
		'code-output.warning.interesting': "Для нетривиального JavaScript-кода нужно включить по крайней мере один источник и последующую обработку звука",

		'code.title': "Пример использования Web Audio API — сгенерированный код",

		'label.sources.sample.play': "Играть сэмпл",
		'label.destination.compressor': "Включить компрессор",

		'comment.context': "создаём [аудио-контекст][context]",
		'comment.sources.audio': "создаём [узел источника аудио][source]",
		'comment.sources.video': "создаём [узел источника видео][source]",
		'comment.sources.sample': "загружаем [сэмпл][buffer]",
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
		'comment.destination.analyser': "создаём [узел анализатора][analyser]",
		'comment.destination.analyser.{waveform,frequencies,waveform+frequencies}': "создаём [узел анализатора][analyser] для визуализации {формы волны,частот,формы волны и частот}",
		'comment.destination.analyser.split': "создаём [узел разделения каналов][splitter], соединённый с двумя [узлами анализатора][analyser]",

		'units.pixel.a': "px",
		'units.pixel.{1,2,5}': "пиксел{ь,я,ей}",
		'units.hertz.a': "Гц",
		'units.hertz.{1,2,5}': "Герц{,а,}",
		'units.decibel.a': "дБ",
		'units.decibel.{1,2,5}': "децибел{,а,ов}",
		'units.second.a': "с",
		'units.second.{1,2,5}': "секунд{а,ы,}",
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
	strings=require('crnx-base/i18n-link-wikipedia')(lang)(strings)
	strings=require('crnx-base/options-output-i18n')(lang)(strings)
	strings=require('crnx-base/code-output-i18n')(lang)(strings)
	langStrings[lang]=strings
}

module.exports=require('crnx-base/i18n')(langStrings)
