import BaseModule from './structures/module/BaseModule.js'
import DeezerAPI from './structures/api/DeezerAPI.js'
import DeezerTrack from './structures/track/DeezerTrack.js'
import { HostNames } from './util/Constants.js'

export default class TrackDeezer extends BaseModule {
    /**
     * @param {Main} main
     */
    constructor(main) {
        super(main);

        this.register(TrackDeezer, {
            name: 'trackDeezer',
            scope: 'global',
            requires: ['trackResolver']
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

                return new DeezerTrack(this._m, track);
            }
        }
        
        const playlist = isPlaylist
                ? (await this.deezer.getPlaylist(deezer.split('/playlist/')[1]))
                : (await this.deezer.getAlbum(deezer.split('/album/')[1]));

        const trackList = [];

        playlist.tracks.data.forEach(track => trackList.push(new DeezerTrack(this._m, track)));
        
        this._m.emit(isPlaylist ? 'playlistPlayed' : 'albumPlayed');

        return trackList;
    }

    /**
     * @param {URL} url
     */
    resolve(url) {
        return this._resolve(url);
    }

    setup() {
        this.deezer = new DeezerAPI(this._m);

        this.modules.trackResolver.registerResolver(this.name, HostNames);

        return true;
    }
}
