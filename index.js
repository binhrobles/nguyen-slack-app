import 'dotenv/config';
import Bolt from '@slack/bolt';

import { isParent, respondInThread } from './utils.js';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

const app = new Bolt.App({
	signingSecret: SLACK_SIGNING_SECRET,
	token: SLACK_BOT_TOKEN,
});

app.message(async ({ message }) => {
	try {
		// only want to do translations on parent messages
		if (isParent(message)) {
			console.log('heard parent');

			await respondInThread({
				app,
				message,
				text: `:speaking_head_in_silhouette: ${message.text}`,
			});
		}
	} catch (e) {
		console.error(e);
	}
});

(async () => {
	// Start the app
	await app.start(process.env.PORT || 3000);

	console.log('⚡️ Bolt app is running!');
})();
