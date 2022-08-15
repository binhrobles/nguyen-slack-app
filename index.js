import 'dotenv/config';

import SlackUtils from './utils/slack.js';
import TranslationUtils from './utils/translation.js';

const { app, receiver } = SlackUtils.configureSlackApp();

app.message(async ({ message }) => {
	// only want to do translations on parent messages
	if (SlackUtils.isParentMessage(message)) {
		console.log(`heard parent: ${message.text}`);

		// if message text is less than ~20 chars, CLD will have issues
		// https://github.com/dachev/node-cld/issues/33
		if (message.text > 0 && message.text.length < 20) {
			// so we're just not gonna
			return;
		}

		const { detected, target } = await TranslationUtils.detectLanguage(message.text);
		console.log(`detected: ${detected} target: ${target}`);

		const translation = await TranslationUtils.translate({ 
			source: detected, 
			target, 
			text: message.text 
		});
		console.log(`translation: ${translation}`);

		await SlackUtils.respondInThread({
			app,
			messageObj: message,
			text: translation,
			blocks: TranslationUtils.createTranslationMessage({
				detected, 
				target, 
				original: message.text,
				translation,
			}),
		});
	}
});

app.action('translate-click', async ({ ack }) => ack);

export const handler = async (event, context, callback) => {
    const handler = await receiver.start();
    return handler(event, context, callback);
}
