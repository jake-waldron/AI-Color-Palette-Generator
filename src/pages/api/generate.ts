// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
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

  return res.status(200).json({ colors });
}

async function generateColors(input: string) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `
				Generate a palette of colors based on the input: "${input}". 
				If it is an innapropriate prompt, return a message of "This is an innapropriate prompt. Please try again."

				Each color should have a color code and a description.
				The colors should be in the format of hex codes. The descritpion should include an inventive name and a short sentence that describes the color.
				Response Format: {
					"colors": [
						{"code": "#8B008B", "description": "Unicorn Mystery - a deep and intense shade of purple, associated with the darker elements of cyberpunk culture"}
					]
				}
				`,
      },
    ],
    max_tokens: 1000,
  });

  const response = completion?.data?.choices[0]?.message?.content;
  if (
    !response ||
    !isJSON(response) ||
    response.startsWith("This is an innapropriate prompt. Please try again.")
  ) {
    console.log(response);
    return {
      code: "ERROR",
      description: response,
    };
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
