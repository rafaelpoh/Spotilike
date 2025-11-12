console.log('script.js loaded'); // For debugging

import { getFeaturedPlaylists } from './spotify-api.js';

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
    const fragment = document.createDocumentFragment();

    playlists.forEach(playlist => {
        if (playlist && playlist.external_urls && playlist.images && playlist.images.length > 0) {
            const card = document.createElement('a');
            card.href = playlist.external_urls.spotify;
            card.target = '_blank';
            card.classList.add('cards');

            card.innerHTML = `
                <img src="${playlist.images[0].url}" alt="${playlist.name}">
                <span>${playlist.name}</span>
            `;

            fragment.appendChild(card);
        } else {
            console.warn('Skipping a malformed playlist item:', playlist);
        }
    });

    playlistContainer.appendChild(fragment);
}

getFeaturedPlaylists().then(data => {
    if (data && data.playlists && data.playlists.items) {
        displayPlaylists(data.playlists.items);
    } else {
        console.error('Could not retrieve featured playlists. The response may be malformed:', data);
        const playlistContainer = document.querySelector('#result-playlists .offer__list-item');
        if (playlistContainer) {
            playlistContainer.innerHTML = '<p class="no-results">Could not load playlists. The response from the server was malformed.</p>';
        }
    }
}).catch(error => {
    console.error('Error fetching featured playlists:', error);
    // Here you could display a message to the user in the UI
    const playlistContainer = document.querySelector('#result-playlists .offer__list-item');
    if (playlistContainer) {
        playlistContainer.innerHTML = `<p class="no-results">Could not load playlists. Error: ${error.message}</p>`;
    }
});

