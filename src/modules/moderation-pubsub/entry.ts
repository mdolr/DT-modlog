import { Core } from '../..';
import { DiscordServer } from '../../entity/DiscordServer';
import * as ModerationPubSub from 'twitch-moderation-pubsub';

export = {
  name: 'moderation-pubsub',
  enabled: true,
  execute: async (Bot: Core) => {
    const serverRepository = Bot.db.getRepository(DiscordServer);

    const configuredServers = await serverRepository.createQueryBuilder('discord_server').where('discord_server.twitch_id IS NOT NULL').getMany();

    let twitchChannelIDs: string[] = configuredServers.map((channel) => {
      return channel.twitchID;
    });

    twitchChannelIDs = twitchChannelIDs.includes(Bot.config.twitch.id) ? twitchChannelIDs : [Bot.config.twitch.id].concat(twitchChannelIDs);

    Bot.pubsub = new ModerationPubSub({
      token: Bot.config.twitch.token,
      mod_id: Bot.config.twitch.id,
      topics: twitchChannelIDs,
    });

    const PUBSUB_EVENTS = {
      CHAT: ['clear', 'emoteonly', 'emoteonlyoff', 'followers', 'followersoff', 'r9k', 'r9koff', 'slow', 'slowoff', 'subscribers', 'subscribersoff'],
      MODERATION: ['ban', 'unban', 'timeout', 'untimeout'],
      ROLES: ['mod', 'unmod'],
    };

    Bot.pubsub.on('ready', () => {
      console.log(`[${Bot.formatDate()}] - Now listening to Twitch events`);
    });

    Bot.pubsub.on('error', () => {
      console.log(`[${Bot.formatDate()}] - Error while listening to the Twitch Pubsub`);
      process.exit(1);
    });

    PUBSUB_EVENTS.CHAT.forEach((event) => {
      Bot.pubsub.on(event, async (data) => {
        const watchers = await serverRepository.find({ where: { twitchID: data.channel_id } });

        for await (const watcher of watchers) {
          if (watcher.chatEventsChannel) {
            let embed = {
              description: `**CASE ${watcher.caseID}** - ${data.moderator.name} - ${data.moderator.id} | ${
                data.type[0].toUpperCase() + data.type.substring(1).toLowerCase()
              }${data.duration ? ' - Duration : ' + data.duration.toString() + (data.type === 'slow' ? 's' : 'm') : '.'}`,
              color: Bot.config.colors.chat,
            };

            watcher.caseID += 1;

            await serverRepository.save(watcher);
            await Bot.discord.createMessage(watcher.chatEventsChannel, { content: '\n', embed });
          }
        }
      });
    });

    PUBSUB_EVENTS.MODERATION.forEach((event) => {
      Bot.pubsub.on(event, async (data) => {
        const watchers = await serverRepository.find({ where: { twitchID: data.channel_id } });

        for await (const watcher of watchers) {
          if (watcher.chatEventsChannel) {
            let embed = {
              description: `**CASE ${watcher.caseID} - ${data.type[0].toUpperCase() + data.type.substring(1).toLowerCase()}**\nTarget : ${
                data.target.name
              } - ${data.target.id}\nModerator : ${data.moderator.name} - ${data.moderator.id}\nDuration : ${
                data.duration === 'permanent' ? 'Permanently' : data.duration.toString() + 's'
              }\n\nReason : ${data.reason ? data.reason : 'No reason set.'}`,
              color: Bot.config.colors[data.type.toLowerCase()],
            };

            watcher.caseID += 1;

            await serverRepository.save(watcher);
            await Bot.discord.createMessage(watcher.chatEventsChannel, { content: '\n', embed });
          }
        }
      });
    });

    PUBSUB_EVENTS.ROLES.forEach((event) => {
      Bot.pubsub.on(event, async (data) => {
        const watchers = await serverRepository.find({ where: { twitchID: data.channel_id } });

        for await (const watcher of watchers) {
          if (watcher.chatEventsChannel) {
            let embed = {
              description: `**CASE ${watcher.caseID}** - ${data.target.name} - ${data.target.id} has been ${data.type}ded.`,
              color: Bot.config.colors.roles,
            };

            watcher.caseID += 1;

            await serverRepository.save(watcher);
            await Bot.discord.createMessage(watcher.chatEventsChannel, { content: '\n', embed });
          }
        }
      });
    });
  },
};
