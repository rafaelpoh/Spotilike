const getAccessToken = (function() {
    let accessToken = null;

    async function fetchNewToken() {
        try {
            // Agora buscamos o token através do nosso backend no Vercel
            const response = await fetch('/api/token');
            if (response.ok) {
                const data = await response.json();
                accessToken = data.access_token;
                return accessToken;
            } else {
                console.warn('Usuário não autenticado. Faça login para buscar músicas.');
                return null;
            }
        } catch (error) {
            console.error('Error in fetchNewToken:', error);
            throw error;
        }
    }

    return async function() {
        if (!accessToken) {
            return await fetchNewToken();
        }
        return accessToken;
    };
})();

async function spotifyFetch(url) {
    try {
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