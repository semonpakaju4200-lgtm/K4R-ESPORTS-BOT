require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

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
  console.log(`Bot online as ${client.user.tag}`);
});

// parse registration
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

// update slot list
async function updateSlots(channel) {
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
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.name !== "registration") return;
  if (!message.content.startsWith("%register")) return;

  const team = parse(message.content);

  // validation
  if (!team.name || !team.tag || !team.manager) {
    await message.react("❌");
    return message.reply(`Wrong format!

Use:
%register
Team name:
Team tag:
Team manager: @user`);
  }

  // duplicate check
  if (teams.find(t => t.name === team.name)) {
    await message.react("❌");
    return message.reply("Team already registered!");
  }

  // slot system
  if (teams.length < MAX_TEAMS) {
    teams.push(team);
    await message.react("✅");
    message.reply(`Registered! Slot #${teams.length}`);
  } else {
    waitlist.push(team);
    await message.react("⏳");
    message.reply(`Added to waitlist #${waitlist.length}`);
  }

  await updateSlots(message.channel);
});

client.login(process.env.TOKEN);
