import config from './config.js';

const getAccessToken = (function() {
    let accessToken = null;
    let expiresAt = 0;

    async function fetchNewToken() {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(config.SPOTIFY_CLIENT_ID + ':' + config.SPOTIFY_CLIENT_SECRET)
                },
                body: 'grant_type=client_credentials'
            });

            const data = await response.json();
            if (response.ok) {
                accessToken = data.access_token;
                expiresAt = Date.now() + (data.expires_in * 1000);
                return accessToken;
            } else {
                console.error('Error fetching access token from Spotify API:', data);
                throw new Error('Failed to get access token');
            }
        } catch (error) {
            console.error('Error in fetchNewToken:', error);
            throw error;
        }
    }

    return async function() {
        if (!accessToken || Date.now() >= expiresAt - 60000) {
            console.log('Fetching new access token for client credentials directly from Spotify...');
            return await fetchNewToken();
        }
        console.log('Using cached client credentials access token.');
        return accessToken;
    };
})();

async function spotifyFetch(url) {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const error = data.error || {};
            const errorMessage = error.message || response.statusText;
            console.error(`Spotify API error for ${url}:`, data);
            throw new Error(`Spotify API error: ${errorMessage}`);
        }

        console.log(`Successful response from ${url}:`, data);
        return data;
    } catch (error) {
        console.error(`Error in spotifyFetch for ${url}:`, error);
        throw error;
    }
}

async function searchSpotify(query, type = 'artist') {
    console.log(`Searching for ${type}: ${query}`);
    return spotifyFetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}`);
}

async function getFeaturedPlaylists(searchTerms = ['pop', 'rock', 'jazz', 'hip hop', 'electronic', 'classical', 'r&b', 'country', 'latin', 'indie']) {
    console.log('Fetching diverse playlists...');

    const promises = searchTerms.map(term =>
        spotifyFetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}&type=playlist&limit=10`)
            .then(data => {
                if (data && data.playlists && data.playlists.items) {
                    return data.playlists.items.map(p => ({ ...p, theme: term }));
                }
                return [];
            })
            .catch(error => {
                console.error(`Error fetching playlists for theme "${term}":`, error);
                return [];
            })
    );

    const results = await Promise.all(promises);
    const allPlaylists = results.flat();

    return { playlists: { items: allPlaylists } };
}

async function getArtistTopTracks(artistId) {
    console.log(`Fetching top tracks for artist ${artistId}...`);
    const data = await spotifyFetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`);
    return data.tracks;
}

export { searchSpotify, getFeaturedPlaylists, getArtistTopTracks };