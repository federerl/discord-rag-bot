import { Client, GatewayIntentBits, Events } from "discord.js";
import "dotenv/config";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ask") {
    const question = interaction.options.getString("question");

    console.log("📩 Question received:", question);

    await interaction.reply({
      content: `You asked: **${question}**`,
      ephemeral: false,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);