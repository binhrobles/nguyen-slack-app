// determines whether the Slack message is a top-level, parent 
// message by comparing the thread timestamp and the timestamp of
// the message itself.
// https://api.slack.com/messaging/retrieving#finding_threads
export const isParent = ({ thread_ts, ts }) => !thread_ts || thread_ts === ts;

export const respondInThread = async ({ app, messageObj, text, blocks = [] }) => {
	await app.client.chat.postMessage({
		token: app.token,
		text,
		blocks,
		channel: messageObj.channel,
		thread_ts: messageObj.ts,
	});
}

export const createGoogleTranslateLink = (detected, target, text) =>
	`https://translate.google.com/?sl=${detected}&tl=${target}&text=${encodeURIComponent(text)}&op=translate`;

export const createTranslationMessage = ({ detected, target, original, translation }) => ([{
	type: "section",
	text: {
		type: "plain_text",
		text: `:ba: ${translation}`,
	},
	accessory: {
		action_id: 'translate-click',
		type: "button",
		text: {
			type: "plain_text",
			text: ":translate-icon:"
		},
		url: createGoogleTranslateLink(detected, target, original),
	}
}]);

import cld from 'cld';
export const detectLanguage = async (text) => {

	const recognition = await cld.detect(text);

	// pull the first (or most confident) language
	const detectedLangCode = recognition.languages[0].code;

	return {
		detected: detectedLangCode,

		// target language is vietnamese, unless the message is in viet
		target: detectedLangCode === 'en' ? 'vi' : 'en',
	};
};


// Translation configuration
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-translate/index.html
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
const translateClient = new TranslateClient({ region: 'us-west-2' });

export const translate = async ({ source, target, text }) => {
	const translation = await translateClient.send(new TranslateTextCommand({
		SourceLanguageCode: source,
		TargetLanguageCode: target,
		Text: text,
	}));

	return translation.TranslatedText;
}
