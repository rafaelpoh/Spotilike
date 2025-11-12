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

// Function to search for artists on Spotify
async function searchSpotify(query, type = 'artist') {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=${type}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    return data;
}

async function getFeaturedPlaylists() {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/browse/featured-playlists`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    return data;
}

async function getNewReleases() {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/browse/new-releases`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    return data;
}

async function getArtistTopTracks(artistId) {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, { // Using 'US' as a default market
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    return data.tracks;
}

export { searchSpotify, getFeaturedPlaylists, getNewReleases, getArtistTopTracks };
