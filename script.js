import { getFeaturedPlaylists, getNewReleases } from './spotify-api.js';

//BOM DIA | BOA TARDE | BOA NOITE

// Obtém a referência do elemento com o ID "greeting"
const greetingElement = document.getElementById("greeting");

// Obtém a hora atual do sistema
const currentHour = new Date().getHours();

// Define a saudação com base na hora atual
const greetingMessage =
  currentHour >= 5 && currentHour < 12
    ? "Bom dia!"
    : currentHour >= 12 && currentHour < 18
    ? "Boa tarde!"
    : "Boa noite!";

greetingElement.textContent = greetingMessage;



export function displayPlaylists(playlists) {
    const playlistContainer = document.querySelector('#result-playlists .offer__list-item');
    playlistContainer.innerHTML = ''; // Clear existing content

    playlists.forEach(playlist => {
        const card = document.createElement('a');
        card.href = playlist.external_urls.spotify;
        card.target = '_blank';
        card.classList.add('cards');

        const cardContent = `
            <div class="cards">
                <img src="${playlist.images[0].url}" alt="">
                <span>${playlist.name}</span>
            </div>
        `;

        card.innerHTML = cardContent;
        playlistContainer.appendChild(card);
    });
}

function displayArtists(albums) {
    const artistContainer = document.querySelector('#result-artists .offer__list-item');
    artistContainer.innerHTML = ''; // Clear existing content
    const artistNames = new Set();

    albums.forEach(album => {
        const artist = album.artists[0];
        if (!artistNames.has(artist.name)) {
            artistNames.add(artist.name);

            const card = document.createElement('a');
            card.href = artist.external_urls.spotify;
            card.target = '_blank';
            card.classList.add('cards');

            const cardContent = `
                <div class="cards">
                    <img src="${album.images[0].url}" alt="">
                    <span>${artist.name}</span>
                </div>
            `;

            card.innerHTML = cardContent;
            artistContainer.appendChild(card);
        }
    });

    document.getElementById('result-artists').classList.remove('hidden');
}

getFeaturedPlaylists().then(data => {
    displayPlaylists(data.playlists.items);
});

getNewReleases().then(data => {
    displayArtists(data.albums.items);
});
