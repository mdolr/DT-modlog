// Different arrays as there are a lot of events with the same structure for chat.
module.exports.PUBSUB_EVENTS = {
    CHAT: ['clear', 'emoteonly', 'emoteonlyoff', 'followers', 'followersoff', 'r9k', 'r9koff', 'slow', 'slowoff', 'subscribers', 'subscribersoff'],
    MODERATION: ['ban', 'unban', 'timeout'],
    ROLES: ['mod', 'unmod'],
    OTHERS: ['error']
};

module.exports.ARGS = ['clear', 'emoteonly', 'emoteonlyoff', 'followers', 'followersoff', 'r9k', 'r9koff', 'slow', 'slowoff', 'subscribers', 'subscribersoff', 'ban', 'unban', 'timeout', 'mod', 'unmod'];

// Only an array as not much event of the same type.
module.exports.DISCORD_EVENTS = ['messageCreate', 'guildCreate', 'guildDelete', 'disconnect'];

module.exports.COLORS = {
    'BAN': '16711680',
    'UNBAN': '65280',
    'TIMEOUT': '16759354',
    'CHAT': '6570404',
    'ROLES': '1221841'
};