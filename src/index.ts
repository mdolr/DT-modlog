import 'reflect-metadata';
import { Connection, createConnection } from 'typeorm';

import * as fs from 'fs';
import { Client } from 'eris';
import * as config from '../config.json';
import * as http from 'http';
import { DiscordServer } from './entity/DiscordServer';
import * as ModerationPubSub from 'twitch-moderation-pubsub';

export class Core {
  config: any;
  modules: any;
  commands: any;

  db: Connection;
  discord: Client;
  pubsub: any;

  constructor(config) {
    this.db = null;
    this.pubsub = null;

    this.config = config;
    this.discord = new Client(config.discord.token, config.discord.options);

    this.commands = {};
    this.modules = {};
  }

  async init() {
    try {
      this.db = await createConnection();
      await this.discord.connect();
    } catch (e) {
      console.error('Failed to connect');
      console.error(e);
      process.exit(1);
    }
  }

  // Load commands from a given directory
  async loadCommands(path) {
    const commands = fs.readdirSync(path);

    path = path.replace('/src', '');

    for await (let command of commands) {
      command = command.replace('.js', '').replace('.ts', '').toLowerCase();

      if (require(`${path}/${command}`).enabled) {
        this.commands[command] = require(`${path}/${command}`);
        console.log(`[${this.formatDate()}] - Loading Discord command : ${command}`);
      }
    }
  }

  // Load modules from a given directory
  // load each module's commands & runs its entry file execute function
  async loadModules() {
    const modules = fs.readdirSync('./src/modules');

    for await (const module of modules) {
      if (module != 'README.md') {
        if (require(`./modules/${module}/entry`).enabled) {
          console.log(`[${this.formatDate()}] - Loading module : ${module.toLowerCase().replace('.ts', '').replace('.js', '')}`);
          await this.loadCommands(`./src/modules/${module}/commands`);

          this.modules[module.toLowerCase().replace('.ts', '')] = require(`./modules/${module}/entry`);
          require(`./modules/${module}/entry`).execute(this);
        }
      }
    }
  }

  twitchListen() {
    this.pubsub.on('ready', () => {
      console.log(`[${this.formatDate()}] - Now listening to Twitch events`);
    });
  }

  discordListen() {
    const serverRepository = this.db.getRepository(DiscordServer);

    this.discord.on('disconnect', () => {
      console.log(`[${this.formatDate()}] - Disconnected from Discord.\n\n\n`);
      process.exit(1);
    });

    this.discord.on('ready', async () => {
      console.log(`[${this.formatDate()}] - Bot ready`);
      console.log(`[${this.formatDate()}] - Loaded modules : [${Object.keys(this.modules).join(' ')}]`);
      console.log(`[${this.formatDate()}] - Loaded commands : [${Object.keys(this.commands).join(' ')}]`);
      console.log(`[${this.formatDate()}] - Retrieving Twitch channels`);

      const configuredServers = await serverRepository.createQueryBuilder('discord_server').where('discord_server.twitch_id IS NOT NULL').getMany();

      let twitchChannelIDs: string[] = configuredServers.map((channel) => {
        return channel.twitchID;
      });

      twitchChannelIDs = twitchChannelIDs.includes(this.config.twitch.id) ? twitchChannelIDs : [this.config.twitch.id].concat(twitchChannelIDs);

      this.pubsub = new ModerationPubSub({
        token: this.config.twitch.token,
        mod_id: this.config.twitch.id,
        topics: twitchChannelIDs,
      });

      this.twitchListen();
    });

    this.discord.on('messageCreate', async (m: any) => {
      // DMs / ignored server / message sent by a bot
      if (!m.channel.guild || m.author.bot || this.config.discord.ignoredServers.includes(m.channel.guild.id)) return;

      const serverConfig = await serverRepository.findOne(m.channel.guild.id);

      if (!serverConfig) {
        this.createServerConfig(m);
      }

      if (
        serverConfig &&
        (m.content.toLowerCase().startsWith(serverConfig.prefix) ||
          m.content.startsWith(`<@${this.discord.user.id}>`) ||
          m.content.startsWith(`<@!${this.discord.user.id}>`))
      ) {
        // if no prefix is given and the bot is mentionned instead
        if (m.content.startsWith(`<@${this.discord.user.id}> `) || m.content.startsWith(`<@!${this.discord.user.id}> `)) {
          m.content = m.content.replace(`<@!${this.discord.user.id}> `, serverConfig.prefix).replace(`<@${this.discord.user.id}> `, serverConfig.prefix);
        }

        let args = m.content.trim().split(/\s+/g);
        let command = args.shift().toLowerCase().substring(serverConfig.prefix.length);

        if (Object.keys(this.commands).includes(command.toLowerCase())) {
          if (this.commands[command].permissionLevel <= this.getPermissionLevel(m)) {
            this.commands[command].exec(this, serverConfig, m, args);
          }
        }
      }
    });
  }

  async createServerConfig(m: any) {
    const serverRepository = this.db.getRepository(DiscordServer);
    await serverRepository.save(new DiscordServer(m.channel.guild.id, '?', null, null, [], [], []));
  }

  async deleteServerConfig(m: any) {
    const serverRepository = this.db.getRepository(DiscordServer);
    const serverConfig = await serverRepository.remove(m.channel.guild.id);
    await serverRepository.remove(serverConfig);
  }

  // Util functions
  async sendDM(user, message) {
    const channel = await this.discord.getDMChannel(user.id);
    await this.discord.createMessage(channel.id, message);
  }

  // Returns formatted dates for log purposes
  formatDate(timestamp: number = null, locale: string = this.config.dateLocale) {
    let date;
    timestamp ? (date = new Date(timestamp)) : (date = new Date());

    return date
      .toLocaleDateString('fr-FR', {
        hour12: false,
        formatMatcher: 'basic',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace('à', '-');
  }

  // Saves the current config
  saveConfig() {
    fs.writeFileSync('../config.json', JSON.stringify(this.config, null, 4));
  }

  // Returns a permission level used for the command framework
  getPermissionLevel(m) {
    // bot owner
    if (m.author.id === this.config.discord.ownerID) {
      return 2;
    }

    // if server admin
    else if (m.channel.guild && m.member.permission.has('manageGuild')) {
      return 1;
    }

    // if normal user
    else {
      return 0;
    }
  }
}

async function run() {
  const Bot = new Core(config);

  console.log(`[${Bot.formatDate()}] - Starting`);

  await Bot.init();
  await Bot.loadCommands('./src/commands');
  await Bot.loadModules();
  Bot.discordListen();
}

run();
