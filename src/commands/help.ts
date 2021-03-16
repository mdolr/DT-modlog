import { Core } from '..';
import { DiscordServer } from '../entity/DiscordServer';

export = {
  name: 'help',
  desc: 'List commands',
  example: [`?help`],
  enabled: true,
  permissionLevel: 1,
  exec: async (Bot: Core, serverConfig: DiscordServer, m: any, args) => {
    const fields = Object.keys(Bot.commands).map((command: any) => {
      command = Bot.commands[command];

      const examples = command.example.map((e) => {
        return `${serverConfig.prefix}${e.substring(1)}`;
      });

      return { name: command.name, value: `__Description :__ ${command.desc}\n__Examples :__\`\`\`\n${examples.join('\n')}\n\`\`\`` };
    });

    const embed = {
      content: '\n',
      embed: {
        description: `[Support Server](https://discord.gg/pAU6qKx). \n\n**Frequent issues :** \n- Make sure you've added the bot as a **moderator on your twitch channel** with : \n\`/mod ${Bot.config.twitch.name}\`\n\n- Make sure the bot has permission to post in discord channels\n\n- Make sure you've used the ${serverConfig.prefix}twitch & ${serverConfig.prefix}log commands`,
        color: 1221841,
        fields: fields,
      },
    };

    await Bot.sendDM(m.author, embed);
    m.delete();
  },
};
