// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, CreateChatCompletionResponse, OpenAIApi } from "openai";
import "dotenv/config";

const config = new Configuration({
  apiKey: process.env.apiKey,
});

const openai = new OpenAIApi(config);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.method);

  if (req.method !== "POST") {
    console.log("invalid method");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { input } = req.body;
  if (!input) {
    console.log("invalid input");
    return res.status(400).json({ error: "Invalid input" });
  }
  console.log(input);
  const colors = await generateColors(input);

  return res.status(200).json(colors);
}

async function generateColors(input: string) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        // content: 'The top 10 best cities, and one sentence why, to live in America are: ',
        content: `
				Generate a palette of colors based on the input: "${input}". 
				Each color should have a color code and a description.
				The colors should be in the format of hex codes. The descritpion should be a sentence that describes the color.
				Return a json object with the format of {colors: [{code: '#000000', description: "...."}]}
				`,
      },
    ],
    max_tokens: 1000,
  });

  const response = completion?.data?.choices[0]?.message?.content;
  if (
    !response ||
    !isJSON(response) ||
    response.startsWith("As an AI langauge model,")
  ) {
    console.log(response);
    console.log("invalid response");
    return { code: "ERROR", description: response };
  }

  const { colors } = JSON.parse(response);
  console.log(colors);
  return colors;
}

function isJSON(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    console.log("NOT JSON");
    return false;
  }
  return true;
}
