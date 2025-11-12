// Make sure to add your Spotify API credentials in spotify-api.js for the search to work.
import { searchSpotify, getArtistTopTracks } from "./spotify-api.js";
import { playTrack } from "./player.js";

const resultPlaylists = document.getElementById("result-playlists");
const resultArtists = document.getElementById("result-artists");
const searchInput = document.getElementById("search-input");

function requestApi(searchInput) {
  searchSpotify(searchInput)
    .then((results) => displayResults(results))
    .catch(error => {
        console.error('Error during search:', error);
        const offerListItem = resultArtists.querySelector(".offer__list-item");
        if (offerListItem) {
            offerListItem.innerHTML = `<p class="no-results">An error occurred during the search. Error: ${error.message}</p>`;
        }
    });
}

async function displayResults(results) {
  hideSections();
  const offerListItem = resultArtists.querySelector(".offer__list-item");
  offerListItem.innerHTML = ""; // Clear previous results

  if (results && results.artists && results.artists.items.length > 0) {
    const fragment = document.createDocumentFragment();
    for (const artist of results.artists.items) {
      const artistCard = document.createElement("div");
      artistCard.classList.add("artist-card");
      artistCard.id = artist.id;

      const artistImage = artist.images.length > 0 ? artist.images[0].url : "./src/imagens/icons/music-1085655_640.png";

      // Fetch top tracks for the artist
      const topTracks = await getArtistTopTracks(artist.id);
      const topTrackUri = topTracks && topTracks.length > 0 ? topTracks[0].uri : null;

      artistCard.innerHTML = `
        <div class="card-img">
          <img src="${artistImage}" alt="${artist.name}" class="artist-img">
          <div class="play" data-track-uri="${topTrackUri}">
            <span class="fa fa-solid fa-play"></span>
          </div>
        </div>
        <div class="card-text">
          <a title="${artist.name}" class="vst" href="${artist.external_urls.spotify}" target="_blank"></a>
          <span class="artist-name">${artist.name}</span>
          <span class="artist-categorie">Artista</span>
        </div>
      `;
      
      // Add event listener to the play button
      const playButton = artistCard.querySelector(".play");
      if (playButton && topTrackUri) {
        playButton.addEventListener("click", () => {
          playTrack(topTrackUri);
        });
      }
      fragment.appendChild(artistCard);
    }
    offerListItem.appendChild(fragment);
    resultArtists.classList.remove("hidden");
  } else {
    offerListItem.innerHTML = '<p class="no-results">Nenhum resultado encontrado para sua busca.</p>';
    resultArtists.classList.remove("hidden");
  }
}

function hideSections() {
    resultPlaylists.classList.add("hidden");
    resultArtists.classList.add("hidden");
}

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm === "") {
    resultPlaylists.classList.remove("hidden");
    resultArtists.classList.add("hidden");
    return;
  }
  requestApi(searchTerm);
});

const arrowLeftButton = document.querySelector(".arrow-left");
arrowLeftButton.addEventListener("click", () => {
  searchInput.value = "";
  const event = new Event('input', { bubbles: true });
  searchInput.dispatchEvent(event);
});