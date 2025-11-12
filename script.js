import { getFeaturedPlaylists, searchSpotify } from './spotify-api.js';
import displayArtistTopTracks from './busca.js';
import { resultArtists, hideSections } from './busca.js';

const greetingElement = document.getElementById("greeting");

const currentHour = new Date().getHours();

const greetingMessage =
  currentHour >= 5 && currentHour < 12
    ? "Bom dia!"
    : currentHour >= 12 && currentHour < 18
    ? "Boa tarde!"
    : "Boa noite!";

greetingElement.textContent = greetingMessage;



export function displayPlaylists(playlists) {
    const playlistContainer = document.querySelector('#result-playlists .offer__list-item');
    playlistContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    playlists.forEach(playlist => {
        if (playlist && playlist.external_urls && playlist.images && playlist.images.length > 0) {
            const card = document.createElement('div');
            card.classList.add('artist-card');
            card.dataset.playlistName = playlist.name;

            card.innerHTML = `
                <div class="card-img">
                    <img src="${playlist.images[0].url}" alt="${playlist.name}" class="playlist-img">
                </div>
                <div class="card-text">
                    <span class="artist-name">${playlist.name}</span>
                    <span class="artist-categorie">Playlist</span>
                </div>
            `;

            card.addEventListener('click', () => {
                displayPlaylistContent(playlist.name);
            });

            fragment.appendChild(card);
        } else {
            console.warn('Skipping a malformed playlist item:', playlist);
        }
    });

    playlistContainer.appendChild(fragment);
}

async function displayPlaylistContent(playlistName) {
    hideSections();
    const offerListItem = resultArtists.querySelector(".offer__list-item");    
    offerListItem.innerHTML = "";

    try {
        const results = await searchSpotify(playlistName, 'track');

        if (results && results.tracks && results.tracks.items.length > 0) {
            const fragment = document.createDocumentFragment();
            results.tracks.items.slice(0, 10).forEach(track => {
                const trackCard = document.createElement("div");
                trackCard.classList.add("artist-card");
                trackCard.innerHTML = `
                    <div class="card-img">
                        <img src="${track.album.images.length > 0 ? track.album.images[0].url : './src/imagens/icons/music-1085655_640.png'}" alt="${track.name}" class="playlist-img">
                    </div>
                    <div class="card-text">
                        <span class="artist-name">${track.name}</span>
                        <span class="artist-categorie">${track.artists[0].name}</span>
                    </div>
                `;
                fragment.appendChild(trackCard);

                trackCard.addEventListener('click', () => {
                    if (track.artists && track.artists.length > 0) {
                        displayArtistTopTracks(track.artists[0].id, track.artists[0].name);
                    } else {
                        console.warn('Artist information not available for this track:', track);
                    }
                });
            });
            offerListItem.appendChild(fragment);
            resultArtists.classList.remove("hidden");
        } else {
            offerListItem.innerHTML = `<p class="no-results">Nenhuma música encontrada para a playlist "${playlistName}".</p>`;
            resultArtists.classList.remove("hidden");
        }
    } catch (error) {
        console.error('Error fetching playlist content:', error);
        offerListItem.innerHTML = `<p class="no-results">Ocorreu um erro ao carregar o conteúdo da playlist "${playlistName}". Erro: ${error.message}</p>`;
        resultArtists.classList.remove("hidden");
    }
}

const playlistThemes = [
    'pop', 'rock', 'jazz', 'hip hop', 'electronic', 'classical', 'r&b', 'country', 'latin', 'indie',
    'workout', 'sleep', 'focus', 'party', 'chill', 'gaming', 'travel', 'dinner', 'romance', 'blues',
    'metal', 'folk', 'soul', 'funk', 'reggae', 'ambient', 'dance', 'gospel', 'kids', 'comedy'
];

async function loadAndDisplayPlaylists() {
    const playlistContainer = document.querySelector('#result-playlists .offer__list-item');
    playlistContainer.innerHTML = '<p class="no-results">Carregando playlists...</p>';

    try {
        const data = await getFeaturedPlaylists(playlistThemes);
        if (data && data.playlists && data.playlists.items) {
            let allPlaylists = data.playlists.items.filter(p => p && p.id && p.images && p.images.length > 0);

            const uniquePlaylistsMap = new Map();
            allPlaylists.forEach(playlist => {
                uniquePlaylistsMap.set(playlist.id, playlist);
            });

            const uniquePlaylists = Array.from(uniquePlaylistsMap.values());

            for (let i = uniquePlaylists.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [uniquePlaylists[i], uniquePlaylists[j]] = [uniquePlaylists[j], uniquePlaylists[i]];
            }
            const finalPlaylists = uniquePlaylists.slice(0, 10);

            displayPlaylists(finalPlaylists);
        } else {
            console.error('Could not retrieve featured playlists. The response may be malformed:', data);
            if (playlistContainer) {
                playlistContainer.innerHTML = '<p class="no-results">Could not load playlists. The response from the server was malformed.</p>';
            }
        }
    } catch (error) {
        console.error('Error fetching featured playlists:', error);
        if (playlistContainer) {
            playlistContainer.innerHTML = `<p class="no-results">Could not load playlists. Error: ${error.message}</p>`;
        }
    }
}

const shuffleButton = document.getElementById('shuffle-playlists-button');
shuffleButton.addEventListener('click', loadAndDisplayPlaylists);

loadAndDisplayPlaylists();
