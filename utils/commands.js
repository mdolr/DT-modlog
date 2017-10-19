// Gets the name of the user searched.
module.exports.track = (server, m, args) => {
    m.delete();
    if (args[0]) {
        m.channel.createMessage('`Sending request to twitch ...`')
            .then((message) => {
                __Client.fn.getTwitchId(args[0])
                    .then((data) => {
                        if (data._total > 0) {
                            message.edit(`**${args[0]}**'s twitch id is : \`${data.users[0]._id}\`.`);
                        } else {
                            message.edit('*Error - this user doesn\'t exist.*');
                        }
                    }).catch((err) => { console.error(err), message.edit('*An error occured in the request.*'); });
            });
    }
};

// Modifies the log channel for a certain event.
module.exports.log = (server, m, args) => {
    m.delete();
    if (['moderation', 'chat', 'roles'].includes(args[0]) && m.member.permission.has('banMembers')) {
        server.channels[args[0].toLowerCase()] = m.channel.id;
        __Client.fn.dbUtils.update('dtmodlog', 'discord', server)
            .then(() => { m.channel.createMessage('Command successfully executed !'); })
            .catch((err) => { console.error(err), m.channel.createMessage('An unknown error happened.'); });
    } else if (m.member.permission.has('banMembers')) {
        m.channel.createMessage('*Error - Type has to be one of these :* `moderation` `chat` `roles`');
    }
};

module.exports.prefix = (server, m, args) => {
    m.delete();
    if (m.member.permission.has('manageGuild') && args[0]) {
        server.prefix = args[0];
        __Client.fn.dbUtils.update('dtmodlog', 'discord', server)
            .then(() => { m.channel.createMessage(`Successfully updated prefix to \`${server.prefix}\`. In case of an unrecognized prefix you can reset it by mentionning the bot instead of using the prefix. Example : \`@${__Client.discord.user.username}#${__Client.discord.user.discriminator} prefix ?\`.`); });
    }
};

module.exports.help = (server, m, args) => {
    m.delete();
    __Client.discord.getDMChannel(m.author.id)
        .then((channel) => {

            let embed = {
                'content': '\n',
                'embed': {
                    'description': '**HELP** - I highly suggest you to join the [Support Server](https://discord.gg/pAU6qKx). **ALSO IMPORTANT NOTE : THE BOT HAS TO BE A MOD OF THE TWITCH CHANNEL IF YOU WANT IT TO WORK DO : ** `/mod Discord_TwitchModLog` **ON TWITCH CHAT.**',
                    'color': 1221841,
                    'fields': [
                        {
                            'name': 'track',
                            'value': `Description : Gets the Twitch ID of the selected user\n\nExample :\`\`\`${server.prefix}track username - Gets the id of the user.\`\`\``
                        },
                        {
                            'name': 'twitch',
                            'value': `Description : Binds a twitch channel to your server (only 1 channel can be bound for each server. But multiple servers can listen to events of the same channel.)\n\nExample :\`\`\`${server.prefix}twitch delink - Unbinds the actual twitch channel.\n${server.prefix}twitch channelname - Binds the server to that channel.\`\`\``
                        },
                        {
                            'name': 'log',
                            'value': `Description : Sets the channel to log events of that type in. As to be used in the channel you want to bind events to. Available events : \n\n- \`moderation\` - ban unban timeout\n\n- \`chat\` - every chat mode + clear\n\n- \`roles\` - mod unmod\n\nExample :\`\`\`${server.prefix}log moderation - Logs moderation events in that channel.\`\`\``
                        },
                        {
                            'name': 'event',
                            'value': `Description : Lets you block or unblock certain events. *events will still be logged in the database just won't be sent to your server.*\n\nExample :\`\`\`${server.prefix}event - Sends a list of events blocked on the server.\n${server.prefix}event block event1 event2 ... - Blocks those events\n${server.prefix}event unblock event1 event2 ...\`\`\``
                        },
                        {
                            'name': 'prefix',
                            'value': `Description : Changes the prefix for every command.\n\nExample :\`\`\`${server.prefix}prefix ! - Sets ! as the prefix of commands.\`\`\``
                        }]
                }
            };

            __Client.discord.createMessage(channel.id, embed);
        });
};

module.exports.event = (server, m, args) => {
    m.delete();
    if (!args[0] && m.member.permission.has('manageGuild')) {
        m.channel.createMessage(`${server.blocked && server.blocked[0] ? 'Blocked events on this server are : ' + server.blocked.join(' ') + '.' : 'This server doesn\'t have any events blocked.'}`);
    }
    // To block events.
    else if (args[0].toLowerCase() == 'block' && m.member.permission.has('manageGuild')) {
        let accepted = args.filter((arg) => { return __Client.fn.constants.ARGS.includes(arg.toLowerCase()); });
        if (server.blocked && server.blocked[0]) {
            accepted.forEach((arg) => { if (arg && !server.blocked.includes(arg.toLowerCase())) server.blocked.push(arg.toLowerCase()); });
        } else {
            server.blocked = accepted;
        }

        m.channel.createMessage(`${accepted.length > 0 ? 'Added : ' + accepted.join(' ') + ' to blocked events.' : 'Please enter a correct argument from this list : ' + __Client.fn.constants.ARGS.join(' ') + '.'}`);
        __Client.fn.dbUtils.update('dtmodlog', 'discord', server);

    }
    // To unblock events.
    else if (args[0].toLowerCase() == 'unblock' && m.member.permission.has('manageGuild')) {
        if (server.blocked && server.blocked[0]) {
            let accepted = args.filter((arg) => { return __Client.fn.constants.ARGS.includes(arg.toLowerCase()); });
            accepted.forEach((arg) => {
                server.blocked = server.blocked.filter((blocked) => { return blocked.toLowerCase() != arg.toLowerCase(); });
            });

            m.channel.createMessage(`${accepted.length > 0 ? 'Removed : ' + accepted.join(' ') + ' from blocked events.' : 'Please enter a correct argument from this list : ' + __Client.fn.constants.ARGS.join(' ') + '.'}`);
            __Client.fn.dbUtils.update('dtmodlog', 'discord', server);
        } else {
            m.channel.createMessage('No events are blocked on this server.');
        }
    }
};


// Modifies the channel twitch the server is bound to.
module.exports.twitch = (server, m, args) => {
    m.delete();

    // If user wants to delink
    if (!args[0] && m.member.permission.has('manageGuild')) {
        m.channel.createMessage(`This server ${server.twitch ? 'is actually bound to a channel,' : 'isn\'t bound to a channel,'} type \`!twitch newChannel\` to link to a new one. Or \`!twitch delink\` to completely unbind the bot.`);
    } else if (args[0].toLowerCase() === 'delink' && m.member.permission.has('manageGuild')) {
        // If already watched a channel delink from it
        if (server.twitch) {
            __Client.fn.dbUtils.get('dtmodlog', 'twitch', server.twitch)
                .then((channel) => {
                    if (channel) {
                        let filtered = channel.watchers.filter((watcher) => { return watcher.url != server.id; });
                        channel.watchers = filtered;

                        // If still watchers on this channel
                        if (channel.watchers.length > 0) __Client.fn.dbUtils.update('dtmodlog', 'twitch', channel);
                        else {
                            __Client.fn.dbUtils.remove('dtmodlog', 'twitch', channel.id);
                            __Client.fn.dbUtils.tableDrop('dtmodlog', channel.id);
                        }
                    }
                });
        }

        // Then remove the twitch field from server
        server.twitch = null;
        __Client.fn.dbUtils.update('dtmodlog', 'discord', server);
        m.channel.createMessage('Successfully delinked !');
    }
    // To link to a new channel
    else if (m.member.permission.has('manageGuild')) {
        __Client.fn.getTwitchId(args[0])
            .then((data) => {
                if (data._total > 0) {
                    if (server.twitch != data.users[0]._id) {
                        __Client.fn.dbUtils.get('dtmodlog', 'twitch', data.users[0]._id)
                            .then((newChannel) => {
                                // Check if newChannel already in database.
                                if (newChannel) {
                                    // if already had a channel watched get removed from it
                                    if (server.twitch) {
                                        __Client.fn.dbUtils.get('dtmodlog', 'twitch', server.twitch)
                                            .then((channel) => {
                                                if (channel) {
                                                    let filtered = channel.watchers.filter((watcher) => { return watcher.url != server.id; });
                                                    channel.watchers = filtered;

                                                    if (channel.watchers.length > 0) __Client.fn.dbUtils.update('dtmodlog', 'twitch', channel);
                                                    else {
                                                        __Client.fn.dbUtils.remove('dtmodlog', 'twitch', channel.id);
                                                        __Client.fn.dbUtils.tableDrop('dtmodlog', channel.id);
                                                    }
                                                }
                                            });
                                    }

                                    // Insert in db row ... update server
                                    newChannel.watchers.push({ type: 'discord', url: m.channel.guild.id });
                                    __Client.fn.dbUtils.update('dtmodlog', 'twitch', newChannel);
                                    server.twitch = newChannel.id;
                                    __Client.fn.dbUtils.update('dtmodlog', 'discord', server);

                                    // Join pubsub
                                    __Client.pubsub.addTopic(newChannel.id);
                                    m.channel.createMessage(`Successfully joined **${args[0].toLowerCase()}**.`);
                                }
                                // Else create the table, the row in twitch table, and update server
                                else {
                                    // if already had a channel watched get removed from it
                                    if (server.twitch) {
                                        __Client.fn.dbUtils.get('dtmodlog', 'twitch', server.twitch)
                                            .then((channel) => {
                                                if (channel) {
                                                    let filtered = channel.watchers.filter((watcher) => { return watcher.url != server.id; });
                                                    channel.watchers = filtered;

                                                    if (channel.watchers.length > 0) __Client.fn.dbUtils.update('dtmodlog', 'twitch', channel);
                                                    else {
                                                        __Client.fn.dbUtils.remove('dtmodlog', 'twitch', channel.id);
                                                        __Client.fn.dbUtils.tableDrop('dtmodlog', channel.id);
                                                    }
                                                }
                                            });
                                    }

                                    // Then create the channel object
                                    newChannel = {
                                        id: data.users[0]._id,
                                        watchers: [{ type: 'discord', url: m.channel.guild.id }],
                                        caseID: 1
                                    };

                                    // Insert in db row etc ... create table update server
                                    __Client.fn.dbUtils.tableCreate('dtmodlog', newChannel.id);
                                    __Client.fn.dbUtils.insert('dtmodlog', 'twitch', newChannel);
                                    server.twitch = newChannel.id;
                                    __Client.fn.dbUtils.update('dtmodlog', 'discord', server);

                                    // Join pubsub
                                    __Client.pubsub.addTopic(newChannel.id);
                                    m.channel.createMessage(`Successfully joined **${args[0].toLowerCase()}**.`);
                                }
                            });
                    } else {
                        m.channel.createMessage('This channel is already bound to this server.');
                    }
                } else {
                    m.channel.createMessage('Couldn\'t find an user with that name on twitch.');
                }
            })
            .catch((error) => { console.error(error), m.channel.createMessage('An unknown error happened.'); });
    }
};