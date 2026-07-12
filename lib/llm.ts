import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export function getLLM(): BaseChatModel {
  const provider = process.env.LLM_PROVIDER || "gemini";
  const modelName = process.env.MODEL_NAME;

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }
    return new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: modelName || "gpt-4o-mini",
      temperature: 0.1,
    });
  } else if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY in environment variables.");
    }
    return new ChatAnthropic({
      apiKey: apiKey,
      modelName: modelName || "claude-3-5-sonnet-20241022",
      temperature: 0.1,
    });
  } else if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables.");
    }
    return new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: modelName || "gemini-2.5-flash",
      temperature: 0.1,
    });
  } else {
    throw new Error(`Unsupported LLM_PROVIDER: "${provider}". Must be "openai", "anthropic" or "gemini".`);
  }
}
