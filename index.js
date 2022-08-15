import 'dotenv/config';

// Slack configuration
// https://slack.dev/bolt-js/reference
import Bolt from '@slack/bolt';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

const receiver = new Bolt.AwsLambdaReceiver({
    signingSecret: SLACK_SIGNING_SECRET,
});

const app = new Bolt.App({
	token: SLACK_BOT_TOKEN,
	receiver,
});

// App logic

import { isParent, respondInThread, detectLanguage, createTranslationMessage, translate } from './utils.js';

app.message(async ({ message }) => {
	// only want to do translations on parent messages
	if (isParent(message)) {
		console.log(`heard parent: ${message.text}`);

		// if message text is less than ~20 chars, CLD will have issues
		// https://github.com/dachev/node-cld/issues/33
		if (message.text > 0 && message.text.length < 20) {
			// so we're just not gonna
			return;
		}

		const { detected, target } = await detectLanguage(message.text);
		console.log(`detected: ${detected} target: ${target}`);

		const translation = await translate({ 
			source: detected, 
			target, 
			text: message.text 
		});
		console.log(`translation: ${translation}`);

		await respondInThread({
			app,
			messageObj: message,
			text: translation,
			blocks: createTranslationMessage({
				detected, 
				target, 
				original: message.text,
				translation,
			}),
		});
	}
});

app.action('translate-click', async ({ ack }) => ack);

app.error((error) => {
  console.error(error);
});

export const handler = async (event, context, callback) => {
    const handler = await receiver.start();
    return handler(event, context, callback);
}
