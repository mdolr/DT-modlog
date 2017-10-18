const request = require('request');

module.exports = () => {
    let options = {
        url: 'https://bots.discord.pw/api/bots/279640502717120512/stats',
        method: 'POST',
        headers: {
            Authorization: __Client.config.discord.dbotsToken,
            'Content-Type': 'application/json'
        },
        body: {
            server_count: parseInt(__Client.discord.guilds.size, 10)
        },
        json: true
    };

    request(options);
};