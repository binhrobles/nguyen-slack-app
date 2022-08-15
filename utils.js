// determines whether the Slack message is a top-level, parent 
// message by comparing the thread timestamp and the timestamp of
// the message itself.
// https://api.slack.com/messaging/retrieving#finding_threads
export const isParent = ({ thread_ts, ts }) => !thread_ts || thread_ts === ts;

export const respondInThread = async ({ app, message, text }) => {
	await app.client.chat.postMessage({
		token: app.token,
		text,
		channel: message.channel,
		thread_ts: message.ts,
	});
}

import cld from 'cld';
export const detectLanguage = async (text) => {

	const recognition = await cld.detect(text);

	return {
		// pull the first (or most confident) language
		detected: recognition.languages[0].code,

		// target language is vietnamese, unless the message is in viet
		target: detectedLangCode === 'en' ? 'vi' : 'en',
	};
};
