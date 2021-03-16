import { Core } from '..';
import { DiscordServer } from '../entity/DiscordServer';
import axios from 'axios';

export = {
  name: 'twitch',
  desc: 'Changes the twitch channel followed on this server',
  example: [`?twitch reset`, `?twitch [channel-name]`],
  enabled: true,
  permissionLevel: 1,
  exec: async (Bot: Core, serverConfig: DiscordServer, m: any, args) => {
    if (!args[0]) return;
    try {
      const serverRepository = Bot.db.getRepository(DiscordServer);

      // Reset settings
      if (args[0].toLowerCase() == 'reset') {
        serverConfig.twitchName = null;
        serverConfig.twitchID = null;

        await serverRepository.save(serverConfig);

        m.channel.createMessage(`:white_check_mark: Stopped listening to twitch events`);
      }

      // Else add the channel
      else {
        const user = await Bot.getTwitchUserByName(args[0]);

        if (user) {
          serverConfig.twitchName = user.display_name;
          serverConfig.twitchID = user._id;

          await serverRepository.save(serverConfig);
          await Bot.pubsub.addTopic(user._id);

          m.channel.createMessage(
            `:white_check_mark: Now watching over \`${serverConfig.twitchName}\`'s channel. \nPlease make sure you've added the bot as a twitch moderator on your channel : \`/mod ${Bot.config.twitch.name}\``,
          );
        } else {
          m.channel.createMessage(`Can't find any user with the following channel name : \`${args[0]}\``);
        }
      }
    } catch (e) {
      // Error for whatever reason
      m.channel.createMessage(`An error occured, retry again please`);
    }
  },
};
