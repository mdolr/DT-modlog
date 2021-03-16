import { Core } from '..';
import { DiscordServer } from '../entity/DiscordServer';

export = {
  name: 'prefix',
  desc: "Changes the bot's prefix on this server",
  example: [`?prefix !`],
  enabled: true,
  permissionLevel: 1,
  exec: async (Bot: Core, serverConfig: DiscordServer, m: any, args) => {
    if (!args[0]) return;

    try {
      const serverRepository = await Bot.db.getRepository(DiscordServer);
      serverConfig.prefix = args.join(' ');
      await serverRepository.save(serverConfig);

      m.channel.createMessage(`:white_check_mark: Prefix changed to \`${serverConfig.prefix}\``);
    } catch (e) {
      m.channel.createMessage(`An error occured, retry again please`);
    }
  },
};
