// spotify-api.js
import config from './config.js';

const getAccessToken = (function() {
    let accessToken = null;
    let expiresAt = 0;

    async function fetchNewToken() {
        try {
            const response = await fetch(`${config.backendUrl}/spotify-token`); // Your backend endpoint
            const data = await response.json();
            if (response.ok) {
                accessToken = data.access_token;
                // expires_in is in seconds, convert to milliseconds
                expiresAt = Date.now() + (data.expires_in * 1000);
                return accessToken;
            } else {
                console.error('Error fetching access token from backend:', data);
                throw new Error('Failed to get access token');
            }
        } catch (error) {
            console.error('Error in fetchNewToken:', error);
            throw error;
        }
    }

    return async function() {
        // If token is null or expired (with a 60-second buffer)
        if (!accessToken || Date.now() >= expiresAt - 60000) {
            console.log('Fetching new access token for client credentials...');
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
        throw error; // Re-throw the error to be caught by the caller
    }
}

// Function to search for artists on Spotify
async function searchSpotify(query, type = 'artist') {
    console.log(`Searching for ${type}: ${query}`);
    return spotifyFetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}`);
}

async function getFeaturedPlaylists() {
    console.log('Fetching featured playlists... (DEBUG: searching for "rock" playlists instead)');
    return spotifyFetch(`https://api.spotify.com/v1/search?q=rock&type=playlist`);
}

async function getNewReleases() {
    console.log('Fetching new releases...');
    return spotifyFetch(`https://api.spotify.com/v1/browse/new-releases`);
}

async function getArtistTopTracks(artistId) {
    console.log(`Fetching top tracks for artist ${artistId}...`);
    const data = await spotifyFetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`);
    return data.tracks;
}

export { searchSpotify, getFeaturedPlaylists, getNewReleases, getArtistTopTracks };