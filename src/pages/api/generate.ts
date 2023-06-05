// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import openai from "@/lib/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("invalid method");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { input } = req.body;
  if (!input || input.trim() === "") {
    console.log("invalid input");
    return res.status(400).json({ error: "Invalid input" });
  }

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
				Generate a palette of colors based on the input. 
        
				Each color should have a color code and a description.
				The colors should be in the format of hex codes. The descritpion should include an inventive name and a short sentence that describes the color.
        
        Input: dark igloo
        Response: [
          {"code": "#404040", "description": "Slate Shadow - a dark, cool grey reminiscent of the icy landscape surrounding an igloo"},
          {"code": "#1F1F1F", "description": "Midnight Frost - a rich black hue commonly found in the dark depths of an igloo"},
          {"code": "#8498A5", "description": "Glacier Mist - a soft, muted blue-grey inspired by the frosty Arctic landscape"},
        ]

        Input: cyberpunk daydream
        Response: [
          {"code": "#00FFFF", "description": "Neon Oasis - a bright, electric blue associated with the futuristic and dreamlike elements of cyberpunk"},
          {"code": "#FF4500", "description": "Synthwave Sunset - a bold and vibrant orange-red reminiscent of the glowing sunsets often portrayed in cyberpunk art"},
          {"code": "#FF00FF", "description": "Digital Dreams - a vivid, magenta purple that reflects the surreal and fantastical imagery of cyberpunk"},
          {"code": "#00FF00", "description": "Cybernetic Lime - a bright green that represents the electronic and technological aspects of cyberpunk"},
          {"code": "#800080", "description": "Neon Nightshade - a rich shade of purple that invokes the darker and more mysterious elements of cyberpunk"},
          {"code": "#FFFFFF", "description": "Holographic Haze - a cool and iridescent white that evokes the futuristic and technologically advanced world of cyberpunk"}
        ]

        Input: ${input}
				Response: 
				`,
      },
    ],
    max_tokens: 1000,
  });

  const response = completion?.data?.choices[0]?.message?.content;

  if (!response) {
    return {
      code: "ERROR",
      description: "Error generating colors. Please try again.",
    };
  }

  // this feels hacky, but it seems to work if the response isn't formatted correctly
  const colors = JSON.parse(response) || JSON.parse(JSON.stringify(response));

  if (colors.length === 0) {
    return {
      code: "ERROR",
      description: response,
    };
  }

  return colors;
}
