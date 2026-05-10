require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

console.log("🚀 BOT STARTING...");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const MAX_TEAMS = 16;

let teams = [];
let waitlist = [];
let slotMessage = null;

client.once('ready', () => {
  console.log(`🟢 Bot online as ${client.user.tag}`);
});

// PARSE FORMAT
function parse(content) {
  const team = { name: "", tag: "", manager: "" };
  const lines = content.split("\n");

  for (let line of lines) {
    if (line.toLowerCase().includes("team name:")) {
      team.name = line.split(":")[1]?.trim();
    }
    if (line.toLowerCase().includes("team tag:")) {
      team.tag = line.split(":")[1]?.trim();
    }
    if (line.toLowerCase().includes("team manager:")) {
      team.manager = line.split(":")[1]?.trim();
    }
  }

  return team;
}

// SAFE SLOT UPDATE (prevents crashes)
async function updateSlots(channel) {
  try {
    const embed = new EmbedBuilder()
      .setTitle("🏆 SCRIMS SLOT LIST")
      .setColor("Green")
      .setDescription(
        teams.length
          ? teams.map((t, i) => `**${i + 1}. ${t.name} [${t.tag}]**`).join("\n")
          : "No teams registered yet"
      )
      .addFields(
        { name: "Slots", value: `${teams.length}/${MAX_TEAMS}`, inline: true },
        { name: "Waitlist", value: `${waitlist.length}`, inline: true }
      );

    if (!slotMessage) {
      slotMessage = await channel.send({ embeds: [embed] });
    } else {
      await slotMessage.edit({ embeds: [embed] });
    }

  } catch (err) {
    console.log("❌ SLOT UPDATE ERROR:", err);
  }
}

// MESSAGE HANDLER
client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith("%register")) return;

    const team = parse(message.content);

    // VALIDATION
    if (!team.name || !team.tag || !team.manager) {
      return message.reply(`❌ Wrong Format!

Use:
%register
Team name: Alpha
Team tag: APL
Team manager: @user`);
    }

    // DUPLICATE CHECK
    if (teams.find(t => t.name === team.name)) {
      return message.reply("❌ Team already registered!");
    }

    // SLOT SYSTEM
    if (teams.length < MAX_TEAMS) {
      teams.push(team);
      message.reply(`✅ Registered! Slot #${teams.length}`);
    } else {
      waitlist.push(team);
      message.reply(`⏳ Added to waitlist #${waitlist.length}`);
    }

    await updateSlots(message.channel);

  } catch (err) {
    console.log("❌ MESSAGE ERROR:", err);
  }
});

// LOGIN (IMPORTANT)
client.login(process.env.TOKEN);
