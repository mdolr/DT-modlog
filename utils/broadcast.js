module.exports.moderation = (channel, event) => {
    channel.watchers.forEach((watcher) => {
        switch (watcher.type) {
            case 'discord':
                __Client.fn.dbUtils.get('dtmodlog', 'discord', watcher.url)
                    .then((server) => {
                        if (server) {
                            let embed = {
                                description: `**CASE ${event.data.id} - ${event.data.type[0].toUpperCase() + event.data.type.substring(1).toLowerCase()}**\nTarget : ${event.data.target.name} - ${event.data.target.id}\nModerator : ${event.data.moderator.name} - ${event.data.moderator.id}\nDuration : ${event.data.duration === 'permanent' ? 'Permanently' : event.data.duration.toString() + 's'}\n\nReason : ${event.data.reason ? event.data.reason : 'No reason set.'}`,
                                color: __Client.fn.constants.COLORS[event.data.type.toUpperCase()]
                            };

                            if (server.channels.moderation) __Client.discord.createMessage(server.channels.moderation, { content: '\n', embed });
                        }
                    });
                break;
        }
    });
};

module.exports.chat = (channel, event) => {
    channel.watchers.forEach((watcher) => {
        switch (watcher.type) {
            case 'discord':
                __Client.fn.dbUtils.get('dtmodlog', 'discord', watcher.url)
                    .then((server) => {
                        if (server) {
                            let embed = {
                                description: `**CASE ${event.data.id}** - ${event.data.moderator.name} - ${event.data.moderator.id} | ${event.data.type[0].toUpperCase() + event.data.type.substring(1).toLowerCase()}${event.data.duration ? ' - Duration : ' + event.data.duration.toString() + (event.data.type === 'slow' ? 's' : 'm') : '.'}`,
                                color: __Client.fn.constants.COLORS['CHAT']
                            };

                            if (server.channels.chat) __Client.discord.createMessage(server.channels.chat, { content: '\n', embed });
                        }
                    });
                break;
        }
    });
};

module.exports.roles = (channel, event) => {
    channel.watchers.forEach((watcher) => {
        switch (watcher.type) {
            case 'discord':
                __Client.fn.dbUtils.get('dtmodlog', 'discord', watcher.url)
                    .then((server) => {
                        if (server) {
                            let embed = {
                                description: `**CASE ${event.data.id}** - ${event.data.target.name} - ${event.data.target.id} has been ${event.data.type}ded.`,
                                color: __Client.fn.constants.COLORS['ROLES']
                            };

                            if (server.channels.roles) __Client.discord.createMessage(server.channels.roles, { content: '\n', embed });
                        }
                    });
                break;
        }
    });
};