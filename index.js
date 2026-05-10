require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

console.log("🚀 BOT FILE LOADED");

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

client.once('ready', () => {
  console.log(`🟢 Bot online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.toLowerCase() === "ping") {
    message.reply("pong ✅");
  }
});

client.login(process.env.TOKEN);
