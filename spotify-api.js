// spotify-api.js

// IMPORTANT: Replace with your actual Client ID and Client Secret from the Spotify Developer Dashboard.
// NOTE: Exposing your Client Secret in a client-side application is a security risk.
// It's recommended to use a backend proxy to handle authentication securely.
const CLIENT_ID = "e8042224100b487cacd29510d6f88476"; // User needs to replace this
const CLIENT_SECRET = "9cf7f6cee5e3425d8589d9b9ecf7366b"; // User needs to replace this

// Function to get an access token using Client Credentials Flow
async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
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

export { searchSpotify, getFeaturedPlaylists, getNewReleases };
