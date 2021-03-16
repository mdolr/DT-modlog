# Discord Twitch Modlog

A bot listening to the Twitch pubsub that posts moderation & chat related events in Discord channels.

## Prerequisites
* node v14+
* postgres v10
* Twitch.tv Client-ID - [Create an app](https://dev.twitch.tv/)
* Twitch.tv chat bot Oauth token - [Generate an OAuth token](https://twitchapps.com/tmi/)
* Discord bot credentials - [Create a bot](https://discord.com/developers/applications)

## Configuration
Create a file named `config.json` at the root of the project that looks like this. You can modify the `config.example.json` file, don't forget to rename it.

```json {
  "discord": {
    "token": "Discord bot Token",
    "options": {
      "allowedMentions": {
        "everyone": true,
        "roles": true,
        "users": true
      },
      "autoreconnect": true,
      "getAllUsers": true
    },
    "ignoredServers": ["Discord server IDs if you need to ignore some"],
    "ownerID": "Your Discord account ID"
  },
  "twitch": {
    "id": "Twitch bot user ID",
    "name": "Twitch bot username",
    "token": "Twitch OAuth token (without the 'oauth:' part)",
    "apiKey": "Twitch Client-ID"
  },
  "db": {
    "username": "username",
    "host": "localhost",
    "port": "5432",
    "password": "password"
  },
  "colors": {
    "chat": "6570404",
    "roles": "1221841",
    "ban": "16711680",
    "unban": "65280",
    "timeout": "16759354",
    "untimeout": "65280"
  },
  "dateLocale": "en-US"
}
```
## Installation

### Docker
**Docker pull**
`docker pull mdolr/dt-modlog:3.0.0`
`docker run -d -v /path/to/your/config.json:/build/config.json mdolr/dt-modlog:3.0.0`


**Deploy with docker-compose**

Example `docker-compose.yml` file
```yaml
version: '3'
services:
  postgres:
    container_name: 'postgres-dtmodlog - this is your host in the config.json'
    image: 'postgres:10'
    environment:
      POSTGRES_USER: 'dtmodlog'
      POSTGRES_PASSWORD: 'A_complicated_password_:)'
      POSTGRES_DB: 'dtmodlog'
    volumes:
      - /path/to/a/folder:/var/lib/postgresql/data
    restart: 'unless-stopped'
    networks:
      - dtmodlog

  dtmodlog:
    container_name: 'dtmodlog'
    build: .
    command: yarn start
    depends_on: 
      - postgres
    volumes:
      - '/path/to/your/config.json:/build/config.json'
    restart: 'unless-stopped'
    networks:
      - dtmodlog

networks:
  dtmodlog:
    name: 'dtmodlog'
    driver: bridge
    attachable: true
```

### Git clone
**Development**  
Use `yarn dev`  
**Production**  
Use `yarn build && yarn start`