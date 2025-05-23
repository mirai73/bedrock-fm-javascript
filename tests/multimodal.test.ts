import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { fromModelId, ChatMessage, Models } from "../src/main";
import fs from "fs";
//@ts-ignore
const claudeMockClient: BedrockRuntimeClient = {
  send: () => ({
    body: {
      transformToString: () => JSON.stringify({ completion: "result1" }),
    },
  }),
  destroy: () => null,
  middlewareStack: () => null,
} as BedrockRuntimeClient;

function getTestImage(): string {
  const bytes = fs.readFileSync("tests/test-image.jpg");
  const data = bytes.toString("base64");
  return `data:image/jpeg;base64,${data}`;
}

const dataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=";

it("validates the messages", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a bot" });
  messages.push({ role: "human", message: "human", images: [dataUrl] });
  messages.push({ role: "ai", message: "ai" });
  messages.push({ role: "human", message: "human" });
  const fm = fromModelId("anthropic.claude-3-haiku-20240307-v1:0", {
    client: claudeMockClient,
  });
  await fm.chat(messages);
  expect(1).toBe(1);
});

it("validates the prompt is correctly built Claude", () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "human",
    images: ["data:image/png;base64,iVBO"],
  });
  const fm = fromModelId("anthropic.claude-3-haiku-20240307-v1:0", {
    client: claudeMockClient,
  });
  const body = fm.prepareBody(messages, {});
  expect(body).toBe(
    '{"messages":[{"role":"user","content":[{"type":"text","text":"human"},{"type":"image","source":{"type":"base64","media_type":"image/png","data":"iVBO"}}]}],"anthropic_version":"bedrock-2023-05-31","max_tokens":512,"stop_sequences":[],"top_p":0.9,"temperature":0.7}',
  );
});

it("validates the prompt is correctly built Nova", () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "human",
    images: ["data:image/png;base64,iVBO"],
  });
  const fm = fromModelId(Models.AMAZON_NOVA_MICRO_V1_0, {
    client: claudeMockClient,
  });
  const body = fm.prepareBody(messages, {});
  expect(body).toBe(
    '{"schemaVersion":"messages-v1","messages":[{"role":"user","content":[{"text":"human"},{"image":{"format":"png","source":{"bytes":"iVBO"}}}]}],"inferenceConfig":{"max_new_tokens":512,"stopSequences":[],"top_p":0.9,"temperature":0.7}}',
  );
});

it("validates the bot with Claude Haiku", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({
    role: "human",
    message: "Describe the image",
    images: [dataUrl],
  });
  const fm = fromModelId("anthropic.claude-3-haiku-20240307-v1:0", {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  expect(resp.message.includes("emoji")).toBeTruthy();
});

it("validates the bot with Nova", async () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "Describe the image",
    images: [getTestImage()],
  });
  const fm = fromModelId(Models.AMAZON_NOVA_MICRO_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  expect(resp.message.includes("emoji")).toBeTruthy();
});
