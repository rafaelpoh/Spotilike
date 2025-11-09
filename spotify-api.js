// spotify-api.js

// IMPORTANT: Replace with your actual Client ID and Client Secret from Spotify Developer Dashboard
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

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
