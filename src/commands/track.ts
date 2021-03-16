import { Core } from '..';
import { DiscordServer } from '../entity/DiscordServer';

export = {
  name: 'track',
  desc: 'Returns a Twitch user ID given an username',
  example: [`?track [username]`],
  enabled: true,
  permissionLevel: 1,
  exec: async (Bot: Core, serverConfig: DiscordServer, m: any, args) => {
    if (!args[0]) return;

    try {
      const user = await Bot.getTwitchUserByName(args[0]);

      if (user) {
        m.channel.createMessage(`:white_check_mark: \`${user.display_name}\` - ID : \`${user._id}\``);
      } else {
        m.channel.createMessage(`Could not find a Twitch ID for \`${args[0]}\``);
      }
    } catch (e) {
      m.channel.createMessage(`An error occured, retry again please`);
    }
  },
};
