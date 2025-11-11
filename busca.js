// Make sure to add your Spotify API credentials in spotify-api.js for the search to work.
import { searchSpotify, getFeaturedPlaylists } from "./spotify-api.js";
import { displayPlaylists } from "./script.js";

const resultArtist = document.getElementById("result-artist");
const resultPlaylists = document.getElementById("result-playlists");
const resultArtists = document.getElementById("result-artists");
const searchInput = document.getElementById("search-input");

function requestApi(searchInput) {
  searchSpotify(searchInput)
    .then((results) => displayResults(results));
}

function displayResults(results) {
  hideSections();
  resultArtists.innerHTML = ""; // Clear previous results

  if (results && results.artists && results.artists.items.length > 0) {
    results.artists.items.forEach(artist => {
      const artistCard = document.createElement("div");
      artistCard.classList.add("artist-card");
      artistCard.id = artist.id;

      const artistImage = artist.images.length > 0 ? artist.images[0].url : "./src/imagens/icons/music-1085655_640.png";

      artistCard.innerHTML = `
        <div class="card-img">
          <img src="${artistImage}" alt="${artist.name}" class="artist-img">
          <div class="play">
            <span class="fa fa-solid fa-play"></span>
          </div>
        </div>
        <div class="card-text">
          <a title="${artist.name}" class="vst" href="${artist.external_urls.spotify}" target="_blank"></a>
          <span class="artist-name">${artist.name}</span>
          <span class="artist-categorie">Artista</span>
        </div>
      `;
      resultArtists.appendChild(artistCard);
    });
    resultArtists.classList.remove("hidden");
  } else {
    resultArtists.classList.add("hidden");
  }
}

function hideSections() {
    resultPlaylists.classList.add("hidden");
    resultArtists.classList.add("hidden");
    resultArtist.classList.add("hidden"); // Hide the single artist card
}

function showSections() {
    resultPlaylists.classList.remove("hidden");
    resultArtists.classList.remove("hidden");
}

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm === "") {
    resultArtist.classList.add("hidden");
    showSections();
    return;
  }
  requestApi(searchTerm);
});

const arrowLeftButton = document.querySelector(".arrow-left");
arrowLeftButton.addEventListener("click", () => {
  searchInput.value = "";
  resultArtists.classList.add("hidden"); // Hide search results
  resultArtist.classList.add("hidden"); // Ensure single artist card is hidden
  resultPlaylists.classList.remove("hidden"); // Show playlists
  // Re-load and display the featured playlists
  getFeaturedPlaylists().then(data => {
    const playlistContainer = document.querySelector('#result-playlists .offer__list-item');
    playlistContainer.innerHTML = ''; // Clear existing content before re-loading
    displayPlaylists(data.playlists.items);
  });
});
