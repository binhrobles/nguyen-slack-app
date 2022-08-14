import 'dotenv/config';
import Bolt from '@slack/bolt';

import { isParent } from './utils.js';

const app = new Bolt.App({
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	token: process.env.SLACK_BOT_TOKEN,
});

app.event('message', async ({ message, client }) => {
	try {
		console.dir(message);

		// only want to do translations on parent messages
		if (isParent(message)) {
			console.log('parent');
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
