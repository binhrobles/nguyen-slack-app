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

// Translation configuration
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-translate/index.html
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

const translateClient = new TranslateClient({ region: 'us-west-2' });

// App logic

import { isParent, respondInThread } from './utils.js';

app.message(async ({ message }) => {
	try {
		// only want to do translations on parent messages
		if (isParent(message)) {
			console.log(`heard parent: ${message.text}`);

			// if message text is less than ~20 chars, CLD will have issues
			// https://github.com/dachev/node-cld/issues/33
			if (message.text > 0 && message.text.length < 20) {
				// so we're just not gonna
				return;
			}

			const { detected, target } = utils.detectLanguage(message.text);

			const translation = await translateClient.send(new TranslateTextCommand({
				SourceLanguageCode: detected,
				TargetLanguageCode: target,
				Text: message.text,
			}));

			await respondInThread({
				app,
				message,
				text: `:ba: ${translation.TranslatedText}`,
			});
		}
	} catch (e) {
		console.error(e);
	}
});

export const handler = async (event, context, callback) => {
    const handler = await receiver.start();
    return handler(event, context, callback);
}
