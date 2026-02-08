import { Client, GatewayIntentBits, Events, Partials } from "discord.js";
import "dotenv/config";

const BACKEND_BASE = (process.env.BACKEND_API_URL || "").replace(/\/+$/, "");

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
  console.log("Backend:", BACKEND_BASE);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "ask") return;

  const question = interaction.options.getString("question", true);
  await interaction.deferReply();

  try {
    if (!BACKEND_BASE) throw new Error("BACKEND_API_URL not set");

    const res = await fetch(`${BACKEND_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Backend error ${res.status}: ${text}`);
    }

    const data = await res.json();

    await interaction.editReply({
      embeds: [
        {
          title: "💡 Answer",
          description: data.answer ?? "(no answer)",
          color: 0x5865f2,
          fields: Array.isArray(data.sources) && data.sources.length
            ? [{ name: "📚 Sources", value: data.sources.map(s => `• ${s}`).join("\n") }]
            : [],
        },
      ],
    });

    // ✅ react once, only on success
    const msg = await interaction.fetchReply();
    await msg.react("👍");
    await msg.react("👎");

  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Sorry, something went wrong.");
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
  } catch {
    return;
  }

  if (reaction.message.author?.id !== client.user.id) return;

  const emoji = reaction.emoji.name;
  if (emoji !== "👍" && emoji !== "👎") return;

  console.log(`📝 Feedback: ${emoji} by ${user.tag} on msg ${reaction.message.id}`);
});

client.login(process.env.DISCORD_TOKEN);