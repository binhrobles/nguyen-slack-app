import 'dotenv/config';

// Slack configuration
// https://slack.dev/bolt-js/reference
import Bolt from '@slack/bolt';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

const app = new Bolt.App({
	signingSecret: SLACK_SIGNING_SECRET,
	token: SLACK_BOT_TOKEN,
});

// Translation configuration
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-translate/index.html
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import cld from 'cld';

const translateClient = new TranslateClient({ region: 'us-west-2' });

// App logic

import { isParent, respondInThread } from './utils.js';

app.message(async ({ message }) => {
	try {
		// only want to do translations on parent messages
		if (isParent(message)) {
			console.log(`heard parent: ${message.text}`);

			// detect english vs viet
			
			// if message text is less than 20, CLD will have issues
			// https://github.com/dachev/node-cld/issues/33
			let detectionInput = message.text;
			if (detectionInput > 0 && detectionInput.length < 20) {
				// so we're just not gonna
				return;
			}

			const recognition = await cld.detect(detectionInput);

			// pull the first (or most confident) language
			const detectedLangCode = recognition.languages[0].code;

			// target language is vietnamese, unless the message is in viet
			const targetLangCode = detectedLangCode === 'en' ? 'vi' : 'en';

			const translation = await translateClient.send(new TranslateTextCommand({
				SourceLanguageCode: detectedLangCode,
				TargetLanguageCode: targetLangCode,
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

(async () => {
	// Start the app
	await app.start(process.env.PORT || 3000);

	console.log('⚡️ Bolt app is running!');
})();
