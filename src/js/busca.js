import { searchSpotify, getArtistTopTracks } from "./spotify-api.js";

export const resultPlaylists = document.getElementById("result-playlists");
export const resultArtists = document.getElementById("result-artists");
const headerContextName = document.getElementById('header-context-name');
const searchInput = document.getElementById("search-input");

export function updateHeaderContextName(name) {
    if (headerContextName) {
        headerContextName.textContent = name;
    }
}

export function clearHeaderContextName() {
    if (headerContextName) headerContextName.textContent = '';
}

function requestApi(searchInput) {
  const searchType = document.querySelector('input[name="search-type"]:checked').value;
  searchSpotify(searchInput, searchType)
    .then((results) => {
      if (searchType === 'artist') {
        displayArtistResults(results);
      } else {
        clearHeaderContextName();
        displayTrackResults(results);
      }
    })
    .catch(error => {
        console.error('Error during search:', error);
        const offerListItem = resultArtists.querySelector(".offer__list-item");
        if (offerListItem) {
            offerListItem.innerHTML = `<p class="no-results">An error occurred during the search. Error: ${error.message}</p>`;
        }
        resultPlaylists.classList.add("hidden");
        resultArtists.classList.remove("hidden");
    });
}

async function displayArtistResults(results) {
  hideSections();
  const offerListItem = resultArtists.querySelector(".offer__list-item");
  offerListItem.innerHTML = "";

  if (results && results.artists && results.artists.items.length > 0) {
    const fragment = document.createDocumentFragment();
    for (const artist of results.artists.items) {
      const artistCard = document.createElement("div");
      artistCard.classList.add("artist-card");
      artistCard.id = artist.id;

      const artistImage = artist.images.length > 0 ? artist.images[0].url : "./src/imagens/icons/music-1085655_640.png";
      const artistImage = artist.images.length > 0 ? artist.images[0].url : "/src/imagens/icons/music-1085655_640.png";

      artistCard.innerHTML = `
        <div class="card-img">
          <img src="${artistImage}" alt="${artist.name}" class="artist-img">
        </div>
        <div class="card-text">
          <a title="${artist.name}" class="vst" href="${artist.external_urls.spotify}" target="_blank"></a>
          <span class="artist-name">${artist.name}</span>
          <span class="artist-categorie">Artista</span>
        </div>
      `;
      
      artistCard.addEventListener('click', () => {
        displayArtistTopTracks(artist.id, artist.name);
      });

      fragment.appendChild(artistCard);
    }
    offerListItem.appendChild(fragment);
    resultArtists.classList.remove("hidden");
  } else {
    offerListItem.innerHTML = '<p class="no-results">Nenhum resultado encontrado para sua busca.</p>';
    resultArtists.classList.remove("hidden");
  }
}

function displayTrackResults(results) {
  hideSections();
  const offerListItem = resultArtists.querySelector(".offer__list-item");
  offerListItem.innerHTML = "";

  if (results && results.tracks && results.tracks.items.length > 0) {
    const fragment = document.createDocumentFragment();
    results.tracks.items.forEach(track => {
      const trackCard = document.createElement("div");
      trackCard.classList.add("artist-card");

      const trackImage = track.album.images.length > 0 ? track.album.images[0].url : './src/imagens/icons/music-1085655_640.png';
      const trackImage = track.album.images.length > 0 ? track.album.images[0].url : '/src/imagens/icons/music-1085655_640.png';

      trackCard.innerHTML = `
          <div class="card-img">
              <img src="${trackImage}" alt="${track.name}" class="playlist-img">
          </div>
          <div class="card-text">
              <span class="artist-name">${track.name}</span>
              <span class="artist-categorie">${track.artists[0].name}</span>
          </div>
      `;
      
      trackCard.addEventListener('click', () => {
        if (track.artists && track.artists.length > 0) {
            displayArtistTopTracks(track.artists[0].id, track.artists[0].name);
        }
      });

      fragment.appendChild(trackCard);
    });
    offerListItem.appendChild(fragment);
    resultArtists.classList.remove("hidden");
  } else {
    offerListItem.innerHTML = '<p class="no-results">Nenhuma música encontrada para sua busca.</p>';
    resultArtists.classList.remove("hidden");
  }
}

export default async function displayArtistTopTracks(artistId, artistName) {
    resultPlaylists.classList.add('hidden');
    resultArtists.classList.add('hidden');

    const offerListItem = resultArtists.querySelector(".offer__list-item");
    offerListItem.innerHTML = '';

    try {
        const topTracks = await getArtistTopTracks(artistId);
        updateHeaderContextName(artistName);

        if (topTracks && topTracks.length > 0) {
            const fragment = document.createDocumentFragment();
            topTracks.slice(0, 10).forEach(track => {
                const trackCard = document.createElement("div");
                trackCard.classList.add("artist-card"); // Reusing artist-card style
                trackCard.innerHTML = `
                    <div class="card-img">
                        <img src="${track.album.images.length > 0 ? track.album.images[0].url : './src/imagens/icons/music-1085655_640.png'}" alt="${track.name}" class="artist-img">
                        <img src="${track.album.images.length > 0 ? track.album.images[0].url : '/src/imagens/icons/music-1085655_640.png'}" alt="${track.name}" class="artist-img">
                    </div>
                    <div class="card-text">
                        <span class="artist-name">${track.name}</span>
                        <span class="artist-categorie">${track.album.name}</span>
                    </div>
                `;
                fragment.appendChild(trackCard);
            });
            offerListItem.appendChild(fragment);
            resultArtists.classList.remove("hidden");
        } else {
            offerListItem.innerHTML = `<p class="no-results">Nenhuma música encontrada para ${artistName}.</p>`;
            resultArtists.classList.remove("hidden");
        }
    } catch (error) {
        console.error(`Error fetching top tracks for ${artistName}:`, error);
        offerListItem.innerHTML = `<p class="no-results">Ocorreu um erro ao carregar as músicas de ${artistName}. Erro: ${error.message}</p>`;
        resultArtists.classList.remove("hidden");
    }
}

export function hideSections() {
    resultPlaylists.classList.add("hidden");
    resultArtists.classList.add("hidden");
}

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm === "") {
    const artistContent = resultArtists.querySelector(".offer__list-item");
    artistContent.innerHTML = "";
    resultPlaylists.classList.remove("hidden");
    resultArtists.classList.add("hidden");
    clearHeaderContextName();
    return;
  }
  resultPlaylists.classList.add("hidden");
  requestApi(searchTerm);
});

const arrowLeftButton = document.querySelector(".arrow-left");
arrowLeftButton.addEventListener("click", () => {
  const artistContent = resultArtists.querySelector(".offer__list-item");
  const playlistContent = resultPlaylists.querySelector(".offer__list-item");
  artistContent.innerHTML = "";
  searchInput.value = "";
  resultPlaylists.classList.remove("hidden");
  resultArtists.classList.add("hidden");
  clearHeaderContextName();
});