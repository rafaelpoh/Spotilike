// spotify-api.js

// Function to get an access token from your backend
async function getAccessToken() {
    const response = await fetch('http://localhost:3001/spotify-token'); // Your backend endpoint
    const data = await response.json();
    if (response.ok) {
        return data.access_token;
    } else {
        console.error('Error fetching access token from backend:', data);
        throw new Error('Failed to get access token');
    }
}

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
