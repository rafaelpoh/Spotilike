const getAccessToken = (function() {
    let accessToken = null;
    let isRefreshing = false;
    let refreshPromise = null;

    async function fetchNewToken() {
        try {
            const response = await fetch('/api/token');
            if (response.ok) {
                const data = await response.json();
                accessToken = data.access_token;
                return accessToken;
            } else {
                console.warn('User not authenticated. Please login to use the search feature.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching initial token:', error);
            throw error;
        }
    }

    async function refreshToken() {
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = (async () => {
                try {
                    const response = await fetch('/api/refresh_token');
                    if (response.ok) {
                        const data = await response.json();
                        accessToken = data.access_token;
                        console.log('Token refreshed successfully.');
                        return accessToken;
                    } else {
                        console.error('Failed to refresh token.');
                        accessToken = null;
                        // Maybe redirect to login here
                        return null;
                    }
                } catch (error) {
                    console.error('Error during token refresh:', error);
                    accessToken = null;
                    return null;
                } finally {
                    isRefreshing = false;
                }
            })();
        }
        return refreshPromise;
    }

    return async function(forceRefresh = false) {
        if (forceRefresh) {
            return await refreshToken();
        }
        if (!accessToken) {
            return await fetchNewToken();
        }
        return accessToken;
    };
})();

async function spotifyFetch(url, isRetry = false) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        throw new Error('Access token not available. Please login.');
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    if (response.status === 401 && !isRetry) {
        console.warn('Access token expired. Refreshing and retrying...');
        const newAccessToken = await getAccessToken(true); // Force refresh
        if (newAccessToken) {
            return spotifyFetch(url, true); // Retry the request
        } else {
            throw new Error('Failed to refresh token, please login again.');
        }
    }
    
    const data = await response.json();

    if (!response.ok) {
        const error = data.error || {};
        const errorMessage = error.message || response.statusText;
        console.error(`Spotify API error for ${url}:`, data);
        throw new Error(`Spotify API error: ${errorMessage}`);
    }

    console.log(`Successful response from ${url}:`, data);
    return data;
}

export async function searchSpotify(query, type = 'artist') {
    console.log(`Searching for ${type}: ${query}`);
    return spotifyFetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}`);
}

export async function getFeaturedPlaylists() {
    console.log('Fetching featured playlists...');
    const data = await spotifyFetch(`https://api.spotify.com/v1/browse/featured-playlists?limit=20`);
    return data;
}

export async function getArtistTopTracks(artistId) {
    console.log(`Fetching top tracks for artist ${artistId}...`);
    const data = await spotifyFetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`);
    return data.tracks;
}

export async function getPlaylistTracks(playlistId) {
    console.log(`Fetching tracks for playlist ${playlistId}...`);
    const data = await spotifyFetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`);
    return data;
}