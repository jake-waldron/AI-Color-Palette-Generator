import { Configuration, OpenAIApi } from "openai";
import "dotenv/config";

const config = new Configuration({
  apiKey: process.env.apiKey,
});

const openai = new OpenAIApi(config);

export default openai;
