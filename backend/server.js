// c:\Dev\Spotilike\backend\server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const querystring = require('querystring'); // Import querystring module
const app = express();
const port = 3001; // Choose a port different from your frontend (e.g., 3000)

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || `http://localhost:${port}/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in the .env file.");
    process.exit(1);
}

// Store user-specific tokens (for this example, in-memory; use a database for production)
let userAccessToken = null;
let userRefreshToken = null;

// Endpoint for Client Credentials Flow (for public data)
app.get('/spotify-token', async (req, res) => {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        if (response.ok) {
            res.json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('Error fetching Spotify token (Client Credentials):', error);
        res.status(500).json({ error: 'Failed to fetch Spotify token' });
    }
});

// Endpoint to initiate Spotify user login
app.get('/login', (req, res) => {
    const scope = 'user-read-playback-state user-modify-playback-state streaming user-read-email user-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            show_dialog: true // Force user to approve again
        }));
});

// Callback endpoint after user authorizes the app
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
            },
            body: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        const data = await response.json();
        if (response.ok) {
            userAccessToken = data.access_token;
            userRefreshToken = data.refresh_token;
            // Redirect to frontend, passing tokens (e.g., via query params or localStorage)
            res.redirect(`http://localhost:3000/?access_token=${userAccessToken}&refresh_token=${userRefreshToken}&expires_in=${data.expires_in}`);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('Error during Spotify callback:', error);
        res.status(500).json({ error: 'Failed to get user tokens' });
    }
});

// Endpoint to refresh user access token
app.get('/refresh_token', async (req, res) => {
    if (!userRefreshToken) {
        return res.status(400).json({ error: 'No refresh token available' });
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
            },
            body: querystring.stringify({
                grant_type: 'refresh_token',
                refresh_token: userRefreshToken
            })
        });

        const data = await response.json();
        if (response.ok) {
            userAccessToken = data.access_token; // Update stored access token
            if (data.refresh_token) { // Refresh token might be rotated
                userRefreshToken = data.refresh_token;
            }
            res.json({ access_token: userAccessToken });
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('Error refreshing user token:', error);
        res.status(500).json({ error: 'Failed to refresh user token' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
