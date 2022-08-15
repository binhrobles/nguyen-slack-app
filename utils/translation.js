import cld from 'cld';

import axios from 'axios';
const TRANSLATE_API_KEY = process.env.TRANSLATE_API_KEY;

const translationClient = axios.create({
  baseURL: 'https://translation.googleapis.com/language/translate/v2',
});

export const createGoogleTranslateLink = (source, target, text) =>
	`https://translate.google.com/?sl=${source}&tl=${target}&text=${encodeURIComponent(text)}&op=translate`;

export const detectLanguage = async (text) => {
	const recognition = await cld.detect(text);

	// pull the first (or most confident) language
	return recognition.languages[0].code;
};

// https://cloud.google.com/translate/docs/reference/rest/v2/translate
export const translate = async ({ source, target, text }) => {
	const response = await translationClient.get(
      `?key=${TRANSLATE_API_KEY}&source=${source}&target=${target}&q=${encodeURIComponent(text)}`
    );

	return response.data.data.translations[0].translatedText;
}

export default {
	createGoogleTranslateLink,
	detectLanguage,
	translate,
};
