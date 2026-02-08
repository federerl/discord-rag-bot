import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});
console.log("Token loaded:", Boolean(process.env.DISCORD_TOKEN));
console.log("Token length:", process.env.DISCORD_TOKEN?.length);

client.login(process.env.DISCORD_TOKEN);