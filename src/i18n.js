'use strict'

const webaudioSpec='https://webaudio.github.io/web-audio-api/'
const webaudioIssue=n=>`<a href='https://github.com/WebAudio/web-audio-api/issues/${n}'>${n}</a>`
const webaudioDetect='https://github.com/GoogleChrome/web-audio-samples/wiki/Detection-of-lowpass-BiquadFilter-implementation'

const enColors="{<span style='color:#800'>red</span>,<span style='color:#080'>green</span>,<span style='color:#008'>blue</span>,opacity}"
const ruColors="{<span style='color:#800'>Красный</span> ,<span style='color:#080'>Зелёный</span> ,<span style='color:#008'>Синий</span> ,Альфа-}канал"

const langStrings={
	en:{
		'options.graph': "Audio graph",
		'options.graph.{audio,video}': "{Audio,Video} element",
		'options.graph.{audio,video}.add': "Add {} element",
		/*
		'options.graph.sample': "Sample",
		'options.graph.sample.add': "Add sample",
		'options.graph.sample.buffer.loading': "Loading and decoding the sample",
		'options.graph.sample.buffer.error': "Error while loading the sample",
		'options.graph.sample.repeat': "Repeat sample",
		'options.graph.sample.interval': "Interval between repeats",
		'options.graph.sample.randomShift': "Random shift of a start time",
		'options.graph.sample.pitch': "Pitch",
		'options.graph.sample.randomPitch': "Random pitch",
		'options.graph.sample.gain': "Gain",
		'options.graph.sample.randomGain': "Random gain",
		*/
		'options.graph.{audio,video,sample}.url': "URL",
		'options.graph.video.{width,height}': "Player {}",
		'options.graph.gain': "Gain",
		'options.graph.gain.add': "Add gain",
		'options.graph.gain.gain': "Gain",
		'options.graph.panner': "Stereo panner",
		'options.graph.panner.add': "Add stereo panner",
		'options.graph.panner.pan': "Pan",
		/*
		'options.graph.biquad': "Biquad filter", // [[Digital biquad filter]]
		'options.graph.biquad.add': "Add biquad filter",
		'options.graph.biquad.type': "Filter type",
		'options.graph.biquad.type.{lowpass,highpass,bandpass,lowshelf,highshelf,peaking,notch,allpass}': "{}",
		'options.graph.biquad.frequency': "Frequency",
		'options.graph.biquad.detune': "Detune",
		'options.graph.biquad.Q': "log(Q)",
		'options.graph.biquad.gain': "Gain",
		'options.graph.iir': "IIR filter",
		'options.graph.iir.add': "Add IIR filter",
		'options.graph.iir.feedforward': "Feedforward coefficients", // Transfer fn numerator coefs
		'options.graph.iir.feedforward.b': "b",
		'options.graph.iir.feedforward.b.add': "Add coefficient",
		'options.graph.iir.feedback': "Feedback coefficients", // Transfer fn denominator coefs
		'options.graph.iir.feedback.a': "a",
		'options.graph.iir.feedback.a.add': "Add coefficient",
		'options.graph.convolver': "Convolver",
		'options.graph.convolver.add': "Add convolver",
		'options.graph.convolver.url': "Impulse responce URL",
		'options.graph.convolver.reverb': "Reverb (dry/wet)",
		'options.graph.convolver.buffer.loading': "Loading and decoding the impulse response",
		'options.graph.convolver.buffer.error': "Error while loading the impulse response",
		'options.graph.equalizer': "Equalizer",
		'options.graph.equalizer.add': "Add equalizer",
		'options.graph.equalizer.gain{60,170,350,1000,3500,10000}': "{} Hz gain",
		*/
		'options.graph.compressor': "Dynamics compressor",
		'options.graph.compressor.add': "Add dynamics compressor",
		'options.graph.destination': "Destination",
		'options.graph.destination.add': "Add destination",

		/*
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
		*/

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

		'options.api': "Web Audio API support",
		'options.api.noVendorPrefix': "Can create an audio context without a vendor prefix",
		'options.api.connectReturnValue': "Can use a return value of <code>AudioNode.connect()</code>",

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
		'comment.graph.junction': "create junction node as [gain node][gain]",
		'comment.graph.audio': "create [audio source node][source]",
		'comment.graph.video': "create [video source node][source]",
		'comment.graph.sample': "load [sample][buffer]",
		'comment.graph.gain': "create [gain node][gain]",
		'comment.graph.panner': "create [stereo panner node][panner]",
		'comment.graph.compressor': "create [dynamics compressor node][compressor]",
		/*
		'comment.filters.biquad': "create [biquad filter node][biquad]",
		'comment.filters.iir': "create [IIR filter node][iir]",
		'comment.filters.convolver': "create dry and wet routes with [convolver node][convolver]",
		'comment.filters.convolver.single': "create [convolver node][convolver]",
		'comment.filters.equalizer': "create equalizer as a sequence of [peaking][peaking] [biquad filter nodes][biquad]",
		'comment.filters.equalizer.single': "create equalizer as a [peaking][peaking] [biquad filter node][biquad]",
		'comment.destination.analyser': "create [analyser node][analyser]",
		'comment.destination.analyser.{waveform,frequencies,waveform+frequencies}': "create [analyser node][analyser] for {waveform,frequencies,waveform and frequencies} visualization",
		'comment.destination.analyser.split': "create [channel splitter node][splitter] connected to two [analyser nodes][analyser]",
		*/
		'comment.graph.destination': "connect to [destination][destination]",

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
		'options.graph': "Аудио-граф",
		'options.graph.{audio,video}': "Элемент <code>{}</code>",
		'options.graph.{audio,video}.add': "Добавить элемент <code>{}</code>",
		/*
		'options.graph.sample': "Сэмпл",
		'options.graph.sample.add': "Добавить сэмпл",
		'options.graph.sample.buffer.loading': "Идёт загрузка и декодирование сэмпла",
		'options.graph.sample.buffer.error': "Ошибка загрузки сэмпла",
		'options.graph.sample.repeat': "Повторить сэмпл",
		'options.graph.sample.interval': "Интервал между повторами",
		'options.graph.sample.randomShift': "Случайный сдвиг начала проигрывания",
		'options.graph.sample.pitch': "Высота",
		'options.graph.sample.randomPitch': "Случайная высота",
		'options.graph.sample.gain': "Громкость",
		'options.graph.sample.randomGain': "Случайная громкость",
		*/
		'options.graph.{audio,video,sample}.url': "URL",
		'options.graph.video.{width,height}': "{Ширина,Высота}",
		'options.graph.gain': "Усилитель",
		'options.graph.gain.add': "Добавить усилитель",
		'options.graph.gain.gain': "Усиление",
		'options.graph.panner': "Панорамирование",
		'options.graph.panner.add': "Добавить панорамирование",
		'options.graph.panner.pan': "Баланс",
		/*
		'options.graph.biquad': "Биквадратичный фильтр",
		'options.graph.biquad.add': "Добавить биквадратичный фильтр",
		'options.graph.biquad.type': "Тип фильтра",
		'options.graph.biquad.type.lowpass': "нижних частот",
		'options.graph.biquad.type.highpass': "верхних частот",
		'options.graph.biquad.type.bandpass': "полосовой",
		'options.graph.biquad.type.{lowshelf,highshelf,peaking}': "{}", // TODO
		'options.graph.biquad.type.notch': "полосно-заграждающий",
		'options.graph.biquad.type.allpass': "всепропускающий", // http://www.dsplib.ru/content/allpass/allpass.html
		'options.graph.biquad.frequency': "Частота",
		'options.graph.biquad.detune': "Detune",
		'options.graph.biquad.Q': "Логарифм добротности",
		'options.graph.biquad.gain': "Усиление",
		'options.graph.iir': "БИХ-фильтр",
		'options.graph.iir.add': "Добавить БИХ-фильтр",
		'options.graph.iir.feedforward': "Коэффициенты прямой связи", // Transfer fn numerator coefs
		'options.graph.iir.feedforward.b': "b",
		'options.graph.iir.feedforward.b.add': "Добавить коэффициент",
		'options.graph.iir.feedback': "Коэффициенты обратной связи", // Transfer fn denominator coefs
		'options.graph.iir.feedback.a': "a",
		'options.graph.iir.feedback.a.add': "Добавить коэффициент",
		'options.graph.convolver': "Свёртка",
		'options.graph.convolver.add': "Добавить свёртку",
		'options.graph.convolver.url': "URL импульсной характеристики",
		'options.graph.convolver.reverb': "Соотношение прямого/обработанного звука", // http://www.ixbt.com/proaudio/theory-of-reverb.shtml
		'options.graph.convolver.buffer.loading': "Идёт загрузка и декодирование импульсной характеристики",
		'options.graph.convolver.buffer.error': "Ошибка загрузки импульсной характеристики",
		'options.graph.equalizer': "Эквалайзер",
		'options.graph.equalizer.add': "Добавить эквалайзер",
		'options.graph.equalizer.gain{60,170,350,1000,3500,10000}': "Усиление частоты {} Гц",
		*/
		'options.graph.compressor': "Компрессор",
		'options.graph.compressor.add': "Добавить компрессор",
		'options.graph.destination': "Выход",
		'options.graph.destination.add': "Добавить выход",

		/*
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
		*/

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

		'options.api': "Поддержка Web Audio API",
		'options.api.noVendorPrefix': "Можно создавать аудио-контекст без префиксов производителей",
		'options.api.connectReturnValue': "Можно использовать значение, возвращаемое <code>AudioNode.connect()</code>",

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
		'comment.graph.junction': "создаём узел для соединения в виде [узла усилителя][gain]",
		'comment.graph.audio': "создаём [узел источника аудио][source]",
		'comment.graph.video': "создаём [узел источника видео][source]",
		'comment.graph.sample': "загружаем [сэмпл][buffer]",
		'comment.graph.gain': "создаём [узел усилителя][gain]",
		'comment.graph.panner': "создаём [узел панорамирования][panner]",
		'comment.graph.compressor': "создаём [узел компрессора][compressor]",
		/*
		'comment.filters.biquad': "создаём [узел биквадратичного фильтра][biquad]",
		'comment.filters.iir': "создаём [узел БИХ-фильтра][iir]",
		'comment.filters.convolver': "создаём прямой путь и путь через [узел свёртки][convolver]",
		'comment.filters.convolver.single': "создаём [узел свёртки][convolver]",
		'comment.filters.equalizer': "создаём эквалайзер в виде последовательности [peaking][peaking] [биквадратичных фильтров][biquad]",
		'comment.filters.equalizer.single': "создаём эквалайзер в виде [peaking][peaking] [биквадратичного фильтра][biquad]",
		'comment.destination.analyser': "создаём [узел анализатора][analyser]",
		'comment.destination.analyser.{waveform,frequencies,waveform+frequencies}': "создаём [узел анализатора][analyser] для визуализации {формы волны,частот,формы волны и частот}",
		'comment.destination.analyser.split': "создаём [узел разделения каналов][splitter], соединённый с двумя [узлами анализатора][analyser]",
		*/
		'comment.graph.destination': "соединяем с [выходом][destination]",

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
