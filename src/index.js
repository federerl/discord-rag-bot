import { Client, GatewayIntentBits, Events, Partials } from "discord.js";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "ask") return;

  const question = interaction.options.getString("question", true);

  await interaction.deferReply();

  try {
  const res = await fetch(`${process.env.BACKEND_API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) throw new Error("Backend error");

  const data = await res.json();

  await interaction.editReply({
    embeds: [
      {
        title: "💡 Answer",
        description: data.answer,
        color: 0x5865f2,
        fields: data.sources?.length
          ? [
              {
                name: "📚 Sources",
                value: data.sources.map(s => `• ${s}`).join("\n"),
              },
            ]
          : [],
      },
    ],
  });

  const msg = await interaction.fetchReply();
  await msg.react("👍");
  await msg.react("👎");

} catch (err) {
  console.error(err);
  await interaction.editReply("❌ Sorry, something went wrong.");
}

  const msg = await interaction.fetchReply();
  await msg.react("👍");
  await msg.react("👎");
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
  } catch {
    return;
  }

  // only track reactions on bot messages
  if (reaction.message.author?.id !== client.user.id) return;

  const emoji = reaction.emoji.name;
  if (emoji !== "👍" && emoji !== "👎") return;

  console.log(
    `📝 Feedback: ${emoji} by ${user.tag} on msg ${reaction.message.id}`
  );
});

client.login(process.env.DISCORD_TOKEN);