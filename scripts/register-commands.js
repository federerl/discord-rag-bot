import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { ProxyAgent, setGlobalDispatcher } from "undici";

const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxy) {
  setGlobalDispatcher(new ProxyAgent(proxy));
  console.log("✅ Using proxy:", proxy);
} else {
  console.log("⚠️ No proxy env found");
}

const commands = [
  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask the bot a question")
    .addStringOption((opt) =>
      opt
        .setName("question")
        .setDescription("Your question")
        .setRequired(true)
    )
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function main() {
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!clientId || !guildId) {
    throw new Error("Missing CLIENT_ID or GUILD_ID in .env");
  }

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  });

  console.log("✅ Registered /ask command to this server.");
}

main().catch((e) => {
  console.error("❌ Failed to register commands:", e);
  process.exit(1);
});