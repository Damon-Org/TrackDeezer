import BaseModule from './structures/module/BaseModule.js'
import DeezerAPI from './structures/api/DeezerAPI.js'
import { HostNames } from './util/Constants.js'

export default class TrackDeezer extends BaseModule {
    /**
     * @param {Main} main
     */
    constructor(main) {
        super(main);

        this.register(TrackDeezer, {
            name: 'trackDeezer',
            requires: [ 'trackResolver' ]
        });
    }

    /**
     * @private
     * @param {URL} url
     */
    async _resolve(url) {
        let deezer = url.pathname;
        let isAlbum = deezer.includes('/album/');
        let isPlaylist = deezer.includes('/playlist/');
        let isPlaylistOrAlbum = isAlbum || isPlaylist;

        if (!isAlbum && !isPlaylist && !deezer.includes('/track/')) {
            const trackLink = await this.deezer.fetchSharableLink(deezer);

            deezer = new URL(trackLink).pathname;

            isAlbum = deezer.includes('/album/');
            isPlaylist = deezer.includes('/playlist/');
            isPlaylistOrAlbum = isAlbum || isPlaylist;

            if(!isPlaylistOrAlbum) {
                const track = (await this.deezer.getTrack(deezer.split('/track/')[1]));

                return { type: 'song', data: new this.resolvableTrack(this._m, track) };
            }
        }

        const playlist = isPlaylist
                ? (await this.deezer.getPlaylist(deezer.split('/playlist/')[1]))
                : (await this.deezer.getAlbum(deezer.split('/album/')[1]));

        const trackList = [];

        playlist.tracks.data.forEach(track => trackList.push(new this.resolvableTrack(this._m, track)));

        this._m.emit(isPlaylist ? 'playlistPlayed' : 'albumPlayed');

        return { type: isPlaylist ? 'playlist' : 'album', data: trackList };
    }

    async init() {
        this.deezer = new DeezerAPI(this._m);

        this.resolvableTrack = (await import('./structures/track/DeezerTrack.js')).default;

        this.modules.trackResolver.registerResolver(this.name, HostNames);

        return true;
    }

    /**
     * @param {URL} url
     */
    resolve(url) {
        return this._resolve(url);
    }
}
