// Require websocket - API interface.
const Eris = require('eris');
const ModerationPubsub = require('twitch-moderation-pubsub');

// Declaring a global client usable everywhere in the project.
global.__Client = {

    // Attach it the DB and the Discord Interface.
    r: require('rethinkdb'),
    discord: new Eris(require('./config.json').discord.token, {
        autoreconnect: true,
        compress: true,
        getAllUsers: true,
        moreMentions: true,
        gatewayVersion: 6,
        disableEveryone: false
    }),

    fn: require('./fn.js'),
    config: require('./config.json'),

    // Connect the DB first and then Discord.
    init: () => {
        return new Promise((resolve, reject) => {
            __Client.r.connect({ host: __Client.config.db.host, port: __Client.config.db.port }, (err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    __Client.db = conn;

                    __Client.discord
                        .connect()
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    },

    // When DB and Discord are connected, connect to twitch with every channel to listen events on.
    start: () => {
        return new Promise((resolve, reject) => {
            let channels = [];

            __Client.r
                .db('dtmodlog')
                .table('twitch')
                .filter((row) => { return row.hasFields('id'); })
                .run(__Client.db)
                .then((cursor) => cursor.toArray())
                .then((result) => {
                    // If the channels array is empty or doesn't contain the twitch's ID.

                    result = !result ? result = [] : result;
                    result.forEach((channel) => { channels.push(channel.id); });
                    channels.includes(__Client.config.twitch.id) ? channels : channels.push(__Client.config.twitch.id);

                    __Client.pubsub = new ModerationPubsub({
                        token: __Client.config.twitch.token,
                        topics: channels,
                        mod_id: __Client.config.twitch.id
                    });

                    __Client.pubsub.on('ready', () => { __Client.discord.createMessage(__Client.config.discord.eventsChannel, `[${__Client.fn.formatDate()}] - Bot started.`), resolve(); });
                })
                .catch(reject);
        });
    },

    // When everything is ready start listening to events.
    listen: () => {
        Object.keys(__Client.fn.constants.PUBSUB_EVENTS).forEach((TYPE) => {
            __Client.fn.constants.PUBSUB_EVENTS[TYPE].forEach((event) => { __Client.pubsub.on(event, (data) => { __Client.fn.pubsubHandler({ type: TYPE, name: event, data }); }); });
        });

        __Client.fn.constants.DISCORD_EVENTS.forEach((event) => { __Client.discord.on(event, (data) => { __Client.fn.discordHandler({ name: event, data }); }); });
    }
};

__Client
    .init()
    .then(__Client.start)
    .then(__Client.listen)
    .catch(console.error);