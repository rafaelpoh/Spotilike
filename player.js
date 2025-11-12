import config from './config.js';

let player;
let currentTrack = null;
let spotifyDeviceId = null;
let spotifyAccessToken = localStorage.getItem('spotify_access_token'); // Get from localStorage
let spotifyRefreshToken = localStorage.getItem('spotify_refresh_token'); // Get from localStorage
let tokenExpiresAt = localStorage.getItem('spotify_token_expires_at') ? parseInt(localStorage.getItem('spotify_token_expires_at')) : 0;
let progressBarInterval;

const BACKEND_URL = config.backendUrl; // Your backend URL

// Function to refresh the access token
async function refreshAccessToken() {
    if (!spotifyRefreshToken) {
        console.error('No refresh token available. Please log in again.');
        return null;
    }
    try {
        const response = await fetch(`${BACKEND_URL}/refresh_token`);
        const data = await response.json();
        if (response.ok) {
            spotifyAccessToken = data.access_token;
            // Spotify's refresh token endpoint usually returns expires_in
            tokenExpiresAt = Date.now() + (data.expires_in * 1000); 
            localStorage.setItem('spotify_access_token', spotifyAccessToken);
            localStorage.setItem('spotify_token_expires_at', tokenExpiresAt.toString());
            console.log('Access token refreshed successfully!');
            return spotifyAccessToken;
        } else {
            console.error('Failed to refresh access token:', data);
            // If refresh fails, clear tokens and prompt re-login
            localStorage.removeItem('spotify_access_token');
            localStorage.removeItem('spotify_refresh_token');
            localStorage.removeItem('spotify_token_expires_at');
            spotifyAccessToken = null;
            spotifyRefreshToken = null;
            tokenExpiresAt = 0;
            alert('Your session has expired. Please log in again.');
            return null;
        }
    } catch (error) {
        console.error('Error during token refresh:', error);
        return null;
    }
}

// Function to get a valid access token (either current or refreshed)
async function getValidAccessToken() {
    // Check if token is expired or about to expire (e.g., within 60 seconds)
    if (!spotifyAccessToken || Date.now() >= tokenExpiresAt - 60000) { // 60 seconds buffer
        console.log('Access token expired or expiring soon, attempting to refresh...');
        return await refreshAccessToken();
    }
    return spotifyAccessToken;
}


window.onSpotifyWebPlaybackSDKReady = () => {
    // Parse tokens from URL if redirected from Spotify
    const params = new URLSearchParams(window.location.search);
    const urlAccessToken = params.get('access_token');
    const urlRefreshToken = params.get('refresh_token');
    const urlExpiresIn = params.get('expires_in'); // Assuming backend passes this

    if (urlAccessToken && urlRefreshToken) {
        spotifyAccessToken = urlAccessToken;
        spotifyRefreshToken = urlRefreshToken;
        tokenExpiresAt = Date.now() + (parseInt(urlExpiresIn || '3600') * 1000); // Default to 1 hour if not provided
        localStorage.setItem('spotify_access_token', spotifyAccessToken);
        localStorage.setItem('spotify_refresh_token', spotifyRefreshToken);
        localStorage.setItem('spotify_token_expires_at', tokenExpiresAt.toString());
        // Clear URL parameters to avoid re-processing on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!spotifyAccessToken) {
        console.log('No Spotify access token found. Please log in.');
        // The login button will handle redirection
        return;
    }

    player = new Spotify.Player({
        name: 'Spotilike Web Player',
        getOAuthToken: async cb => {
            const token = await getValidAccessToken();
            if (token) {
                cb(token);
            } else {
                console.error('Could not get a valid access token for SDK. Redirecting to login.');
                // If token cannot be obtained, redirect to login
                window.location.href = `${BACKEND_URL}/login`;
            }
        },
        volume: 0.5
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        spotifyDeviceId = device_id; // Store the device ID
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Player State Changed
    player.addListener('player_state_changed', (state) => {
        if (!state) {
            return;
        }
        currentTrack = state.track_window.current_track;
        console.log('Current Track', currentTrack);
        console.log('Paused', state.paused);

        const playPauseButton = document.getElementById('play-pause');
        if (state.paused) {
            playPauseButton.innerHTML = '<i class="fa fa-play"></i>';
            clearInterval(progressBarInterval);
        } else {
            playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
            // Start updating progress bar
            clearInterval(progressBarInterval); // Clear any existing interval
            progressBarInterval = setInterval(() => {
                updateProgressBar(state.position, state.duration);
            }, 1000); // Update every second
        }
        updateProgressBar(state.position, state.duration); // Initial update
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });
    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
        alert('Authentication failed. Please log in again.');
        // Clear tokens and prompt re-login
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expires_at');
        spotifyAccessToken = null;
        spotifyRefreshToken = null;
        tokenExpiresAt = 0;
    });
    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });
    player.addListener('playback_error', ({ message }) => {
        console.error(message);
    });

    // Connect to the player!
    player.connect();

    // Add event listeners for player controls
    document.getElementById('play-pause').addEventListener('click', () => {
        player.togglePlay();
    });

    document.getElementById('next-track').addEventListener('click', () => {
        player.nextTrack();
    });

    document.getElementById('prev-track').addEventListener('click', () => {
        player.previousTrack();
    });

    document.getElementById('stop-track').addEventListener('click', () => {
        player.pause();
        // Optionally seek to beginning
        // player.seek(0); 
        clearInterval(progressBarInterval);
        updateProgressBar(0, 0); // Reset progress bar
    });
};

// Function to update the progress bar
function updateProgressBar(position, duration) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar && duration > 0) {
        const progress = (position / duration) * 100;
        progressBar.style.width = `${progress}%`;
    } else if (progressBar) {
        progressBar.style.width = '0%';
    }
}

// Event listener for the Login button
document.getElementById('login-button').addEventListener('click', () => {
    window.location.href = `${BACKEND_URL}/login`;
});

// Function to play a specific track
export const playTrack = async (uri) => {
    // Ensure we have a fresh token before attempting playback
    const token = await getValidAccessToken();
    if (!spotifyDeviceId || !token) {
        console.error('Spotify player not ready or access token not available. Please log in.');
        alert('Spotify player not ready or access token not available. Please log in.');
        return;
    }

    console.log('Attempting to play track:', uri, 'on device:', spotifyDeviceId);

    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [uri] }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to play track:', errorData);
        if (response.status === 401) { // Unauthorized, token might be expired
            alert('Your Spotify session has expired. Please log in again.');
            localStorage.removeItem('spotify_access_token');
            localStorage.removeItem('spotify_refresh_token');
            localStorage.removeItem('spotify_token_expires_at');
            spotifyAccessToken = null;
            spotifyRefreshToken = null;
            tokenExpiresAt = 0;
        }
    }
};

