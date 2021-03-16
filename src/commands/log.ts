import { Core } from '..';
import { DiscordServer } from '../entity/DiscordServer';

export = {
  name: 'log',
  desc: 'Sets this channel as the one to post events in',
  example: [`?log moderation`, `?log chat`, `?log roles`, `?log [event-type] reset`],
  enabled: true,
  permissionLevel: 1,
  exec: async (Bot: Core, serverConfig: DiscordServer, m: any, args) => {
    if (!args[0] || !['moderation', 'chat', 'roles'].includes(args[0].toLowerCase())) return;

    if (args[1]) {
      args[1] = args[1].toLowerCase();
    }

    try {
      const serverRepository = await Bot.db.getRepository(DiscordServer);

      switch (args[0].toLowerCase()) {
        case 'moderation':
          serverConfig.moderationEventsChannel = args[1] && args[1] == 'reset' ? null : m.channel.id;
          break;
        case 'chat':
          serverConfig.chatEventsChannel = args[1] && args[1] == 'reset' ? null : m.channel.id;
          break;
        case 'roles':
          serverConfig.roleEventsChannel = args[1] && args[1] == 'reset' ? null : m.channel.id;
          break;
      }

      await serverRepository.save(serverConfig);

      m.channel.createMessage(
        `:white_check_mark: ${args[1] && args[1] == 'reset' ? 'Stopped logging' : 'Now logging'} \`${args[0].toLowerCase()}\` events in this channel.`,
      );
    } catch (e) {
      m.channel.createMessage(`An error occured, retry again please`);
    }
  },
};
