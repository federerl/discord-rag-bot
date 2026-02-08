import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "ping") {
    message.reply("pong 🏓");
  }
});

console.log("Token loaded:", Boolean(process.env.DISCORD_TOKEN));
console.log("Token length:", process.env.DISCORD_TOKEN?.length);

client.login(process.env.DISCORD_TOKEN);