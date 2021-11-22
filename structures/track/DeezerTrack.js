import Modules from '@/src/Modules.js'

export default class DeezerTrack extends Modules.trackResolver.ResolvableTrack {
    /**
     * @param {Object} data Data found by the LavaLink REST APi
     */
    constructor(main, data) {
        super(main);

        Object.assign(this, {
            artist: data.artist.name,
            cover: data.cover_medium ?? data.album?.cover_medium,
            name: data.title
        });
    }

    get author() {
        return this.artist;
    }

    get image() {
        return this.cover;
    }

    get title() {
        return `${this.author} - ${this.name}`;
    }

    get full_author() {
        const _contributors = [];

        this.contributors.forEach(contributor => _contributors.push(contributor.name));

        return _contributors.join(', ');
    }
}
