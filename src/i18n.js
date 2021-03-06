'use strict'

const webaudioSpec='https://webaudio.github.io/web-audio-api/'
const webaudioIssue=n=>`<a href='https://github.com/WebAudio/web-audio-api/issues/${n}'>${n}</a>`
const webaudioDetect='https://github.com/GoogleChrome/web-audio-samples/wiki/Detection-of-lowpass-BiquadFilter-implementation'

const enColors="{<span style='color:#800'>Red</span>,<span style='color:#080'>Green</span>,<span style='color:#008'>Blue</span>,Opacity}"
const ruColors="{<span style='color:#800'>Красный</span>,<span style='color:#080'>Зелёный</span>,<span style='color:#008'>Синий</span>,Альфа-канал}"

const langStrings={
	en:{
		'options.graph': "Audio graph",
		'options.graph.{audio,video}': "{Audio,Video} element",
		'options.graph.{audio,video}.add': "Add {} element",
		'options.graph.sample': "Sample",
		'options.graph.sample.add': "Add sample",
		'options.graph.sample.repeat': "Repeat sample",
		'options.graph.sample.interval': "Repeat interval",
		'options.graph.sample.randomShift': "Random start time",
		'options.graph.sample.pitch': "Pitch",
		'options.graph.sample.randomPitch': "Random pitch",
		'options.graph.sample.gain': "Gain",
		'options.graph.sample.randomGain': "Random gain",
		'options.graph.{audio,video,sample}.url': "URL",
		'options.graph.video.{width,height}': "Player {}",
		'options.graph.gain': "Gain",
		'options.graph.gain.add': "Add gain",
		'options.graph.gain.gain': "Gain",
		'options.graph.panner': "Stereo panner",
		'options.graph.panner.add': "Add stereo panner",
		'options.graph.panner.pan': "Pan",
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
		'options.graph.iir.feedback': "Feedback coefficients", // Transfer fn denominator coefs
		'options.graph.convolver': "Convolver",
		'options.graph.convolver.add': "Add convolver",
		'options.graph.convolver.url': "Impulse response URL",
		'options.graph.convolver.wet': "Reverb (dry/wet)",
		'options.graph.equalizer': "Equalizer",
		'options.graph.equalizer.add': "Add equalizer",
		'options.graph.equalizer.gain{60,170,350,1000,3500,10000}': "{} Hz gain",
		'options.graph.compressor': "Dynamics compressor",
		'options.graph.compressor.add': "Add dynamics compressor",
		'options.graph.{waveform,frequencyBars,frequencyOutline}': "Draw {waveform,frequency bars,frequency outline}",
		'options.graph.{waveform,frequencyBars,frequencyOutline}.add': "Add {waveform,frequency bars,frequency outline} visualization",
		'options.graph.volume': "Volume meter",
		'options.graph.volume.add': "Add volume meter",
		'options.graph.stereoVolume': "Stereo volume meter",
		'options.graph.stereoVolume.add': "Add stereo volume meter",
		'options.graph.{waveform,frequencyBars,frequencyOutline,volume,stereoVolume}.logFftSize': "log(FFT size)",
		'options.graph.{waveform,frequencyOutline}.width': "Line width",
		'options.graph.{waveform,frequencyOutline}.color': "Line color",
		'options.graph.{waveform,frequencyOutline}.color.{r,g,b,a}': "{,}"+enColors,
		'options.graph.{frequencyBars,frequencyOutline}.cutoff': "<abbr title='Frequency'>Freq.</abbr> cutoff",
		'options.graph.{frequencyBars,frequencyOutline}.base': "Frequency {bars extend from,outline centered at}",
		'options.graph.{frequencyBars,frequencyOutline}.base.{bottom,middle}': "{,}{} of canvas",
		'options.graph.frequencyBars.coloring': "Frequency bars coloring",
		'options.graph.frequencyBars.coloring.component': "with single color component",
		'options.graph.frequencyBars.coloring.spectral': "spectral",
		'options.graph.frequencyBars.coloringInput': "Color depends on",
		'options.graph.frequencyBars.coloringInput.{amplitude,frequency}': "{}",
		'options.graph.destination': "Destination",
		'options.graph.destination.add': "Add destination",
		'options.graph.junction': "Junction", // not used
		'options.graph.analyser': "Analyser", // not used

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

		'options-info.graph.{waveform,frequencyBars,frequencyOutline}.logFftSize': "[[Fast Fourier transform]] size. Use a larger size to get {a wider time window for the waveform,thinner frequency bars,more details on frequency outline}.",
		'options-info.graph.{volume,stereoVolume}.logFftSize': "[[Fast Fourier transform]] size.",
		'options-info.graph.{frequencyBars,frequencyOutline}.cutoff': "Limit plot to a fraction of low frequences.",
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
		'options-output.filter.biquad.clone': "Clone as IIR",
		'options-output.filter.biquad.clone.newCoefs': "following new API spec",
		'options-output.filter.biquad.clone.info': `<a href='${webaudioSpec}'>The API specification</a> was self-contradictory and implementations weren't following it. Additionally, it was discovered that filter coefficient formulas need to be changed to accomodate a wider range of lowpass and highpass filters. See Web Audio API issues ${webaudioIssue(769)}, ${webaudioIssue(771)} and ${webaudioIssue(791)} for details. A possible method to check if an implementation has switched to the updated formulas is offered <a href='${webaudioDetect}'>here</a>.`,
		'options-output.iir-filter-coefs.invalid': "comma-separated numbers required",
		'options-output.show': "Show",
		'options-output.hide': "Hide",
		'options-output.enabled': "Enabled",

		'code-output.warning.jsfiddle-run': "You may have to click <kbd>Run</kbd> in JSFiddle to get sound output working.",
		'code-output.warning.interesting': "You need at least one source, one active filter and one destination node connected together to get interesting JavaScript code.",

		'code.title': "Web Audio API example — generated code",

		'label.graph.sample.play': "Play sample",
		'label.graph.sample.buffer.loading': "Loading and decoding the sample",
		'label.graph.sample.buffer.error': "Error while loading the sample",
		'label.graph.convolver.buffer.loading': "Loading and decoding the impulse response",
		'label.graph.convolver.buffer.error': "Error while loading the impulse response",

		'comment.context': "create [audio context][context]",
		'comment.graph.junction': "create junction node as [gain node][gain]",
		'comment.graph.audio': "create [audio source node][source]",
		'comment.graph.video': "create [video source node][source]",
		'comment.graph.sample': "load [sample][buffer]",
		'comment.graph.gain': "create [gain node][gain]",
		'comment.graph.panner': "create [stereo panner node][panner]",
		'comment.graph.convolver': "create [convolver node][convolver]",
		'comment.graph.convolver.drywet': "create dry and wet routes with [convolver node][convolver]",
		'comment.graph.compressor': "create [dynamics compressor node][compressor]",
		'comment.graph.analyser': "create [analyser node][analyser]",
		'comment.graph.stereoVolume': "create [channel splitter node][splitter] connected to two [analyser nodes][analyser]",
		'comment.graph.biquad': "create [biquad filter node][biquad]",
		'comment.graph.iir': "create [IIR filter node][iir]",
		'comment.graph.equalizer': "create equalizer as a sequence of [peaking][peaking] [biquad filter nodes][biquad]",
		'comment.graph.equalizer.single': "create equalizer as a [peaking][peaking] [biquad filter node][biquad]",
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
		'options.graph.sample': "Сэмпл",
		'options.graph.sample.add': "Добавить сэмпл",
		'options.graph.sample.repeat': "Повторить сэмпл",
		'options.graph.sample.interval': "Интервал повторов",
		'options.graph.sample.randomShift': "Случ. сдвиг начала",
		'options.graph.sample.pitch': "Высота",
		'options.graph.sample.randomPitch': "Случайная высота",
		'options.graph.sample.gain': "Громкость",
		'options.graph.sample.randomGain': "Случайная громкость",
		'options.graph.{audio,video,sample}.url': "URL",
		'options.graph.video.{width,height}': "{Ширина,Высота}",
		'options.graph.gain': "Усилитель",
		'options.graph.gain.add': "Добавить усилитель",
		'options.graph.gain.gain': "Усиление",
		'options.graph.panner': "Панорамирование",
		'options.graph.panner.add': "Добавить панорамирование",
		'options.graph.panner.pan': "Баланс",
		'options.graph.biquad': "Биквадратный фильтр", // "Биквадратичный фильтр"
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
		'options.graph.biquad.Q': "Log добротности",
		'options.graph.biquad.gain': "Усиление",
		'options.graph.iir': "БИХ-фильтр",
		'options.graph.iir.add': "Добавить БИХ-фильтр",
		'options.graph.iir.feedforward': "Коэффициенты прямой связи", // Transfer fn numerator coefs
		'options.graph.iir.feedback': "Коэффициенты обратной связи", // Transfer fn denominator coefs
		'options.graph.convolver': "Свёртка",
		'options.graph.convolver.add': "Добавить свёртку",
		'options.graph.convolver.url': "URL импульсной <abbr title='характеристики'>хар-ки</abbr>",
		'options.graph.convolver.wet': "Dry/wet",
		'options.graph.equalizer': "Эквалайзер",
		'options.graph.equalizer.add': "Добавить эквалайзер",
		'options.graph.equalizer.gain{60,170,350,1000,3500,10000}': "{} Гц",
		'options.graph.compressor': "Компрессор",
		'options.graph.compressor.add': "Добавить компрессор",
		'options.graph.{waveform,frequencyBars,frequencyOutline}': "Вид {волны,полос частот,контура частот}",
		'options.graph.{waveform,frequencyBars,frequencyOutline}.add': "Добавить визуализацию {волны,полос частот,контура частот}",
		'options.graph.volume': "Индикатор громкости",
		'options.graph.volume.add': "Добавить индикатор громкости",
		'options.graph.stereoVolume': "Стерео-громкость",
		'options.graph.stereoVolume.add': "Добавить стерео-индикатор громкости",
		'options.graph.{waveform,frequencyBars,frequencyOutline,volume,stereoVolume}.logFftSize': "log размера БПФ",
		'options.graph.{waveform,frequencyOutline}.width': "Ширина линии",
		'options.graph.{waveform,frequencyOutline}.color': "Цвет линии",
		'options.graph.{waveform,frequencyOutline}.color.{r,g,b,a}': "{,}"+ruColors,
		'options.graph.{frequencyBars,frequencyOutline}.cutoff': "Верх частот",
		'options.graph.frequencyBars.base': "Полосы частот растут от",
		'options.graph.frequencyBars.base.{bottom,middle}': "{низа,середины} элемента <code>canvas</code>",
		'options.graph.frequencyOutline.base': "Контур частот центрирован по",
		'options.graph.frequencyOutline.base.{bottom,middle}': "{низу,середине} элемента <code>canvas</code>",
		'options.graph.frequencyBars.coloring': "Раскраска полос частот",
		'options.graph.frequencyBars.coloring.component': "одним цветовым каналом",
		'options.graph.frequencyBars.coloring.spectral': "спектральная",
		'options.graph.frequencyBars.coloringInput': "Цвет полос зависит от",
		'options.graph.frequencyBars.coloringInput.{amplitude,frequency}': "{амплитуды,частоты}",
		'options.graph.destination': "Выход",
		'options.graph.destination.add': "Добавить выход",
		'options.graph.junction': "Узел для соединения", // not used
		'options.graph.analyser': "Анализатор", // not used

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

		'options-info.graph.convolver.wet': "Соотношение прямого/обработанного звука.", // http://www.ixbt.com/proaudio/theory-of-reverb.shtml
		'options-info.graph.{waveform,frequencyBars,frequencyOutline}.logFftSize': "Размер [[Быстрое преобразование Фурье|Быстрого преобразования Фурье]]. Больший размер даёт {более широкое окно для формы волны,более тонкие полосы частот,более подробный контур частот}.",
		'options-info.graph.{volume,stereoVolume}.logFftSize': "Размер [[Быстрое преобразование Фурье|Быстрого преобразования Фурье]].",
		'options-info.graph.{frequencyBars,frequencyOutline}.cutoff': "Ограничить рисование долей низких частот.",
		'options-info.canvas.background.color.a': "Низкие значения альфа-канала приводят к эффекту размывания.",

		'options-output.input': "Изменяемо",
		'options-output.range': "от и до",
		'options-output.filter.frequencyResponse': "Частотная характеристика",
		'options-output.filter.magnitude': "Амплитуда",
		'options-output.filter.phase': "Фаза",
		'options-output.filter.logMagnitude': "log-шкала амплитуды",
		'options-output.filter.logFrequency': "log-шкала частоты",
		'options-output.filter.contextError': "Ошибка создания аудио-контекста. Вероятно, браузер не поддерживает Web Audio API.",
		'options-output.filter.nodeError': "Ошибка создания узла фильтра. Вероятно, браузер не поддерживает данный тип фильтров.",
		'options-output.filter.biquad.clone': "БИХ-клон",
		'options-output.filter.biquad.clone.newCoefs': "по новой версии API",
		'options-output.filter.biquad.clone.info': `<a href='${webaudioSpec}'>Спецификация API</a> была противоречива и реализации ей не следовали. Также было обнаружено, что формулы для коэффициентов фильтров должны быть изменены, чтобы стало возможно задавать некоторые фильтры низких и высоких частот, которые ранее задать было невозможно. Подробности можно узнать из Web Audio API issues ${webaudioIssue(769)}, ${webaudioIssue(771)} и ${webaudioIssue(791)}. Возможный метод обнаружения, перешла ли реализация на новые формулы, приводится <a href='${webaudioDetect}'>здесь</a>.`,
		'options-output.iir-filter-coefs.invalid': "требуются числа, разделённые запятой",
		'options-output.show': "Показать",
		'options-output.hide': "Скрыть",
		'options-output.enabled': "Включен",

		'code-output.warning.jsfiddle-run': "Для корректного вывода звука в JSFiddle может потребоваться нажатие кнопки <kbd>Run</kbd>.",
		'code-output.warning.interesting': "Для нетривиального JavaScript-кода нужны по крайней мере один источник, один активный фильтр и один выход, соединённые вместе.",

		'code.title': "Пример использования Web Audio API — сгенерированный код",

		'label.graph.sample.play': "Играть сэмпл",
		'label.graph.sample.buffer.loading': "Идёт загрузка и декодирование сэмпла",
		'label.graph.sample.buffer.error': "Ошибка загрузки сэмпла",
		'label.graph.convolver.buffer.loading': "Идёт загрузка и декодирование импульсной характеристики",
		'label.graph.convolver.buffer.error': "Ошибка загрузки импульсной характеристики",

		'comment.context': "создаём [аудио-контекст][context]",
		'comment.graph.junction': "создаём узел для соединения в виде [узла усилителя][gain]",
		'comment.graph.audio': "создаём [узел источника аудио][source]",
		'comment.graph.video': "создаём [узел источника видео][source]",
		'comment.graph.sample': "загружаем [сэмпл][buffer]",
		'comment.graph.gain': "создаём [узел усилителя][gain]",
		'comment.graph.panner': "создаём [узел панорамирования][panner]",
		'comment.graph.convolver': "создаём [узел свёртки][convolver]",
		'comment.graph.convolver.drywet': "создаём прямой путь и путь через [узел свёртки][convolver]",
		'comment.graph.compressor': "создаём [узел компрессора][compressor]",
		'comment.graph.analyser': "создаём [узел анализатора][analyser]",
		'comment.graph.stereoVolume': "создаём [узел разделения каналов][splitter], соединённый с двумя [узлами анализатора][analyser]",
		'comment.graph.biquad': "создаём [узел биквадратичного фильтра][biquad]",
		'comment.graph.iir': "создаём [узел БИХ-фильтра][iir]",
		'comment.graph.equalizer': "создаём эквалайзер в виде последовательности [peaking][peaking] [биквадратичных фильтров][biquad]",
		'comment.graph.equalizer.single': "создаём эквалайзер в виде [peaking][peaking] [биквадратичного фильтра][biquad]",
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

langStrings['ru']['options-output.reset']="Сброс" // глагол "Сбросить" слишком длинный для кнопки в редакторе графа; TODO apply only to graph ui

module.exports=require('crnx-base/i18n')(langStrings)
