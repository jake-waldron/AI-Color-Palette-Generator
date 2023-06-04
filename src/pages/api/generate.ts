// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, CreateChatCompletionResponse, OpenAIApi } from 'openai';
import 'dotenv/config';

type API_RESPONSE = {
	colors: {
		code: string;
		description: string;
	}[];
};

const config = new Configuration({
	apiKey: process.env.apiKey,
});

const openai = new OpenAIApi(config);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	console.log(req.method);

	if (req.method !== 'POST') {
		console.log('invalid method');
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}
	const { input } = req.body;
	if (!input) {
		console.log('invalid input');
		return res.status(400).json({ error: 'Invalid input' });
	}
	console.log(input);
	const colors = await generateColors(input);
	return res.status(200).json(colors);
}

async function generateColors(input: string) {
	const completion = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'user',
				// content: 'The top 10 best cities, and one sentence why, to live in America are: ',
				content: `Generate at least four colors based on the input: "${input}". The colors should be in the format of hex codes. The descritpion should be a sentence that describes the color. Return a json object with the format of {colors: [{code: '#000000', description: "...."}]}`,
			},
		],
		max_tokens: 1000,
	});

	const response = completion?.data?.choices[0]?.message?.content;
	if (!response || !isJSON(response)) {
		console.log('invalid response');
		return;
	}

	const parsedResponse = JSON.parse(response);
	const colorCodes = parsedResponse.colors.map((color: { code: string; description: string }) => color.code);
	console.log(colorCodes);
	return colorCodes;
}

function isJSON(str: string) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
