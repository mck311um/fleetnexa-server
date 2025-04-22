import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_API_KEY!;
const environment = process.env.PADDLE_ENVIRONMENT as Environment;

const paddle = new Paddle(apiKey, {
  environment,
});

export default paddle;
