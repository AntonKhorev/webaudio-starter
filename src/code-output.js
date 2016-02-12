'use strict';

class CodeOutput {
	constructor(generateCodeFn) {
		let $code;
		const getHtmlDataUri=(html)=>'data:text/html;charset=utf-8,'+encodeURIComponent(html);
		const writeControls=()=>{
			return $("<div>").append(
				$("<a download='source.html'><button type='button'>Save source code</button></a>").click(function(){
					// yes I want a button, but download attr is only available for links
					$(this).attr('href',getHtmlDataUri($code.text()));
				})
			).append(
				" "
			).append(
				$("<button type='button'>Run in new window</button>").click(function(){
					window.open(getHtmlDataUri($code.text()),"generatedCode");
				})
			).append(
				" these buttons don't work in Internet Explorer, copy-paste the code manually"
			)
		};
		const $output=$("<div class='code-output'>").append(writeControls()).append(
			$("<pre>").append($code=$("<code>").html(generateCodeFn()))
		);
		if (window.hljs) {
			hljs.highlightBlock($code[0]);
		} else {
			//$output.append("<p>"+i18n('message.hljs')+"</p>"); // TODO i18n
		}
		$output.append(writeControls());

		const delay=200;
		let timeoutId=null;
		const update=()=>{
			clearTimeout(timeoutId);
			timeoutId=setTimeout(()=>{
				$code.html(generateCodeFn());
				if (window.hljs) hljs.highlightBlock($code[0]);
			},delay);
		};

		// public props:
		this.$output=$output;
		this.update=update;
	}
}

module.exports=CodeOutput;
