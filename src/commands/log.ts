import { Core } from '..';
import { DiscordServer } from '../entity/DiscordServer';

export = {
  name: 'log',
  desc: 'Sets this channel as the one to post events in',
  example: [`?log moderation`, `?log chat`, `?log roles`],
  enabled: true,
  permissionLevel: 1,
  exec: async (Bot: Core, serverConfig: DiscordServer, m: any, args) => {
    if (!args[0] || !['moderation', 'chat', 'roles'].includes(args[0].toLowerCase())) return;

    try {
      const serverRepository = await Bot.db.getRepository(DiscordServer);

      switch (args[0].toLowerCase()) {
        case 'moderation':
          serverConfig.moderationEventsChannel = m.channel.guild.id;
          break;
        case 'chat':
          serverConfig.chatEventsChannel = m.channel.guild.id;
          break;
        case 'roles':
          serverConfig.roleEventsChannel = m.channel.guild.id;
          break;
      }

      await serverRepository.save(serverConfig);

      m.channel.createMessage(`:white_check_mark: Now logging \`${args[0].toLowerCase()}\` events in this channel.`);
    } catch (e) {
      m.channel.createMessage(`An error occured, retry again please`);
    }
  },
};
