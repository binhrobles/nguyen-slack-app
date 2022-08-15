// Slack configuration
// https://slack.dev/bolt-js/reference
import Bolt from '@slack/bolt';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

import { createGoogleTranslateLink } from './translation.js';

export const configureSlackApp = () => {
	const receiver = new Bolt.AwsLambdaReceiver({
		signingSecret: SLACK_SIGNING_SECRET,
	});

	const app = new Bolt.App({
		token: SLACK_BOT_TOKEN,
		receiver,
	});

	return { app, receiver };
};

// determines whether the Slack message is a top-level, parent 
// message by comparing the thread timestamp and the timestamp of
// the message itself.
// https://api.slack.com/messaging/retrieving#finding_threads
export const isParentMessage = ({ thread_ts, ts }) => !thread_ts || thread_ts === ts;

export const respondInThread = async ({ app, messageObj, text, blocks = [] }) => {
	await app.client.chat.postMessage({
		token: app.token,
		text,
		blocks,
		channel: messageObj.channel,
		thread_ts: messageObj.ts,
	});
}

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

export default {
	configureSlackApp,
	createTranslationMessage,
	isParentMessage,
	respondInThread,
}

