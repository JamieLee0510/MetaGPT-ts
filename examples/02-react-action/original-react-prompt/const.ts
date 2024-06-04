import { config } from "dotenv";
import * as path from "path";

config({ path: path.resolve(__dirname, "../.env") });
console.log(path.resolve(__dirname, "../.env"));
export const SERPER_KEY = process.env.SERPER_KEY;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
