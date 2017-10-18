module.exports = (event) => {
    // Verify that we're still supposed to log events from this channel.
    __Client.fn.dbUtils.get('dtmodlog', 'twitch', event.data.channel_id)
        .then((result) => {
            if (result) {
                // if != error : db Insert case
                if (event.type != 'OTHERS') {
                    event.data.id = result.caseID.toString();
                    __Client.fn.dbUtils.insert('dtmodlog', result.id, event.data);

                    // Increment caseID by 1.
                    result.caseID += 1;
                    __Client.fn.dbUtils.update('dtmodlog', 'twitch', result);
                }

                switch (event.type) {
                    case 'MODERATION':
                        __Client.fn.broadcast.moderation(result, event);
                        break;
                    case 'CHAT':
                        __Client.fn.broadcast.chat(result, event);
                        break;
                    case 'ROLES':
                        if (event.name === 'mod' && event.data.target.id === __Client.config.twitch.id) __Client.discord.createMessage(__Client.config.discord.eventsChannel, `[${__Client.fn.formatDate()}] - Bot activated by ${event.data.moderator.name}.`);
                        __Client.fn.broadcast.roles(result, event);
                        break;
                    case 'OTHERS':
                        console.error(event);
                        process.exit(1);
                        break;
                }
            }
        })
        .catch(console.error);
};