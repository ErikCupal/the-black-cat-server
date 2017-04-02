# The Black Cat - Server 🎮🃏

[![Travis branch](https://img.shields.io/travis/ErikCupal/the-black-cat-server/master.svg?style=flat-square)](https://travis-ci.org/ErikCupal/the-black-cat-server)

The Black Cat is an online multiplayer card game. It consists of two parts: Node.js [server](https://github.com/ErikCupal/the-black-cat-server) and [client](https://github.com/ErikCupal/the-black-cat-client) app written in Kotlin and based on LibGDX game framework.

### [Client app repo](https://github.com/ErikCupal/the-black-cat-client)

## Official active servers (🔥 still under development 🔥)

* [https://sr1.theblackcat.club](https://sr1.theblackcat.club)
* [https://sr2.theblackcat.club](https://sr2.theblackcat.club)
* [https://sr3.theblackcat.club](https://sr3.theblackcat.club)
* [https://sr4.theblackcat.club](https://sr4.theblackcat.club)

## Install on own server

1. Make sure you have installed latest version of [Node.js](https://nodejs.org/)
1. Download latest [release](https://github.com/ErikCupal/the-black-cat-server/releases)
1. Unzip `server.zip`
1. Go to servers folder
1. Install dependencies - run `npm install` command
1. Start server by running `npm run launch` command. The default port is 3000. To change it run one of these commands before running `npm run launch`.

    * Unix (macOS/OS X/Linux): `PORT=REPLACE_WITH_NUMBER`
    * Windows
      * Command Line: `set PORT=REPLACE_WITH_NUMBER`
      * PowerShell: `$env:PORT = REPLACE_WITH_NUMBER`
1. Enjoy 🃏👌

If you are using reverse proxy, make sure it has configured WebSockets support correctly. Otherwise, it might not work at all.

Alternatively, you can clone this repo and run `npm run start` command.

### SSL/TLS support

The server fully supports secured communication, but doesn't care how you provide it. I recommend using reverse proxy to achieve it. Example configuration (nginx):

```nginx
server {
  server_name sr1.theblackcat.club;

  listen 80;
  listen [::]:80;

  return 301 https://$server_name$request_uri;
}

server {
  server_name sr1.theblackcat.club;

  listen 443 ssl http2;
  listen [::]:443 ssl http2;

  # SSL certificate and configuration
  include snippets/ssl-sr1.theblackcat.club.conf;
  include snippets/ssl-params.conf;

  location / {
    proxy_pass http://localhost:9011;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## Libraries used

* [Express](https://github.com/expressjs/express)
* [Socket.IO](https://github.com/socketio/socket.io)
* [Redux](https://github.com/reactjs/redux)
* [RxJS 5](https://github.com/ReactiveX/rxjs)
* [Lodash](https://github.com/lodash/lodash)

## License

MIT