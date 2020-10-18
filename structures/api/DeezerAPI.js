import Deezer from 'deezer-web-api'

import https from 'https'

export default class DeezerAPI {
    constructor(main) {
        this._m = main;

        this.DeezerClient = new Deezer();
    }

    async getTrack(a1) {
        return await this.DeezerClient.musics.getTrack(a1);
    }

    async getPlaylist(a1) {
        return await this.DeezerClient.musics.getPlaylist(a1);
    }

    async getAlbum(a1) {
        return await this.DeezerClient.musics.getAlbum(a1);
    }

    async fetchSharableLink(path) {
        const options = {
            hostname: 'deezer.page.link',
            port: 443,
            path: path,
            method: 'GET'
        };

        return new Promise(function (resolve, reject) {
            const req = https.request(options, async (res) => {
                if(res.statusCode != '302') reject(res.statusCode);

                resolve(res.headers.location);
            });

            req.on('error', function (err) {
                console.log(err);
            });

            req.end();
        })
    }
}
