module.exports = (event) => {

    switch (event.name) {
        case 'messageCreate':
            let m = event.data;
            if (!m.author.bot && m.channel.guild) {
                __Client.fn.dbUtils.get('dtmodlog', 'discord', m.channel.guild.id)
                    .then((server) => {
                        if (server && m.content.startsWith(server.prefix) || server && m.content.startsWith(`<@${__Client.discord.user.id}>`) || server && m.content.startsWith(`<@!${__Client.discord.user.id}>`)) {
                            if (m.content.startsWith(`<@${__Client.discord.user.id}> `) || m.content.startsWith(`<@!${__Client.discord.user.id}> `)) m.content = m.content.replace(`<@!${__Client.discord.user.id}> `, server.prefix).replace(`<@${__Client.discord.user.id}> `, server.prefix);

                            let args = m.content.trim().split(/\s+/g);
                            let command = args.shift().toLowerCase().substring(server.prefix.length);

                            if (['track', 'log', 'twitch', 'prefix', 'help', 'event'].includes(command)) {
                                __Client.fn.commands[command](server, m, args);
                            }
                        } else {
                            __Client.fn.dbUtils.insert('dtmodlog', 'discord', { id: m.channel.guild.id, twitch: null, prefix: '?', channels: { moderation: null, chat: null, roles: null } });
                        }
                    });
            }
            break;

        case 'guildCreate':
            let guild = event.data;
            let bots = guild.members.filter((member) => { return member.bot; });

            // If more than 51% of bots on the server, leave it.
            if ((bots.length / guild.members.size) * 100 > 51 && !__Client.config.ignoredServers.includes(guild.id)) {
                guild.leave();
            }
            // Else add the server to the database.
            else {
                __Client.fn.dbUtils.insert('dtmodlog', 'discord', { id: guild.id, twitch: null, prefix: '?', channels: { moderation: null, chat: null, roles: null } })
                    .then(() => {
                        __Client.discord.createMessage(__Client.config.discord.eventsChannel, `[${__Client.fn.formatDate()}] - Joined : ${guild.name} | ${guild.members.size} members.`);
                        __Client.fn.updateServerCount();
                    })
                    .catch(console.error);
            }

            break;
        case 'guildDelete':
            // When leaving a server remove data from the database.
            __Client.discord.createMessage(__Client.config.discord.eventsChannel, `[${__Client.fn.formatDate()}] - Left : ${event.data.name} | ${event.data.members.size} members.`);

            // Get the server from DB
            __Client.fn.dbUtils.get('dtmodlog', 'discord', event.data.id)
                .then((server) => {
                    if (server) {
                        // Get the related twitch channel
                        if (server.twitch) {
                            __Client.fn.dbUtils.get('dtmodlog', 'twitch', server.twitch)
                                .then((channel) => {
                                    if (channel) {
                                        // If this was the only server then delete.
                                        if (channel.watchers.length === 1) {
                                            // Drop the table with moderation logs from the channel.
                                            __Client.fn.dbUtils.tableDrop('dtmodlog', channel.id).catch(console.error);

                                            // Then delete the row concerning the channel.
                                            __Client.fn.dbUtils.remove('dtmodlog', 'twitch', channel.id).catch(console.error);

                                            // Then delete the row concerning the server.
                                            __Client.fn.dbUtils.remove('dtmodlog', 'discord', server.id).catch(console.error);

                                        } else {
                                            // Delete the row concerning the server only.
                                            __Client.fn.dbUtils.remove('dtmodlog', 'discord', server.id).catch(console.error);

                                            // Removing the server from the watchers
                                            channel.watchers.filter((watcher) => { return watcher.url != server.id; });
                                            __Client.fn.dbUtils.update('dtmodlog', 'twitch', channel).catch(console.error);
                                        }
                                    }
                                });
                        }
                    }
                })
                .catch(console.error);
            break;

        case 'disconnect':
            console.error(`[${__Client.fn.formatDate()}] - Lost connection with Discord.`);
            process.exit(1);
            break;
    }
};