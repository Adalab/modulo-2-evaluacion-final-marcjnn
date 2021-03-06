"use strict";

let searchResults = [];
let favoriteShows = [];

// search

function search() {
  getSearchResults()
    .then(parseResponse)
    .then(createSearchList)
    .then(renderSearchResults)
    .then(addListnerToShowCard);
}

function getSearchResults() {
  const searchInputElement = document.querySelector(".js-search-input");
  return fetch(`//api.tvmaze.com/search/shows?q=${searchInputElement.value}`);
}

function parseResponse(response) {
  return response.json();
}

function createSearchList(data) {
  searchResults = [];
  if (data !== null) {
    const showsList = data;
    for (const result of showsList) {
      searchResults.push({
        id: result.show.id,
        name: result.show.name,
        image: result.show.image,
      });
    }
  }
  updateImageProperty();
  updateFavoriteProperty();
}

function updateImageProperty() {
  for (const result of searchResults) {
    if (result.image !== null) {
      result.image = result.image.medium;
    } else {
      result.image =
        "https://via.placeholder.com/210x295/D8BB8F/115B75/?text=TV";
    }
  }
}

function updateFavoriteProperty() {
  for (const result of searchResults) {
    result.favorite = isFavorite(result.id) ? true : false;
  }
}

function updateSearchResults() {
  updateFavoriteProperty();
  renderSearchResults();
  addListnerToShowCard();
}

// render search results

function renderSearchResults() {
  const searchResultsElement = document.querySelector(".js-search-results");
  // remove all children before appending from new search
  while (searchResultsElement.lastChild) {
    searchResultsElement.lastChild.remove();
  }
  for (const result of searchResults) {
    // create elements
    const li = createElement("li", "");
    const article = createElement("article", "");
    const img = createElement("img");
    const h2 = createElement("h2", `${result.name}`);
    // add attributes
    img.setAttribute("src", result.image);
    img.setAttribute("alt", result.name);
    article.setAttribute("data-id", result.id);
    article.setAttribute("title", "click to add to/remove from favorites");
    // add classes
    h2.classList.add("result__title");
    img.classList.add("result__img");
    article.classList.add("js-show-card");
    if (result.favorite) {
      article.classList.add("result__card--fav");
    } else {
      article.classList.add("result__card");
    }
    // nest
    article.appendChild(img);
    article.appendChild(h2);
    li.appendChild(article);
    searchResultsElement.appendChild(li);
  }
}

function createElement(element, content) {
  // to render a self-closing img element
  if (element === "img") {
    element = document.createElement(element);
  } else {
    element = document.createElement(element);
    element.appendChild(document.createTextNode(content));
  }
  return element;
}

// update favorites

function updateFavoriteList(show) {
  if (!isFavorite(show.id)) {
    addToFavorites(show);
  } else {
    removeFromFavorites(show);
  }
  updateFavoritesVisibility();
  renderFavoriteShows();
  addListnerToRemoveFromFavBtns();
  saveToLocalStorage();
}

function getShow(showId) {
  for (const result of searchResults) {
    if (result.id === showId) {
      return result;
    }
  }
}

function isFavorite(selectedShowId) {
  const favShow = favoriteShows.find((show) => show.id === selectedShowId);
  return favShow ? true : false;
}

function addToFavorites(show) {
  show.favorite = true;
  favoriteShows.push(show);
}

function removeFromFavorites(showToRemove) {
  const indexShowToRemove = favoriteShows.findIndex(
    (show) => show.name === showToRemove.name
  );
  showToRemove.favorite = false;
  favoriteShows.splice(indexShowToRemove, 1);
}

function resetFavorites() {
  favoriteShows.splice(0, favoriteShows.length);
  updateFavoritesVisibility();
  renderFavoriteShows();
  saveToLocalStorage();
}

function updateFavoritesVisibility() {
  const favoritesElement = document.querySelector(".js-favorites");
  if (favoriteShows.length === 0) {
    favoritesElement.classList.add("favorites--hidden");
  } else {
    favoritesElement.classList.remove("favorites--hidden");
  }
}

// render favorite shows

function renderFavoriteShows() {
  const favoriteShowsElement = document.querySelector(".js-favorite-shows");
  while (favoriteShowsElement.lastChild) {
    favoriteShowsElement.lastChild.remove();
  }
  for (const favShow of favoriteShows) {
    // create elements
    const li = createElement("li", "");
    const article = createElement("article", "");
    const img = createElement("img");
    const h3 = createElement("h3", `${favShow.name}`);
    const rmvBtn = createElement("i", "");
    // add attributes
    img.setAttribute("src", favShow.image);
    img.setAttribute("alt", favShow.name);
    rmvBtn.setAttribute("data-id", favShow.id);
    rmvBtn.setAttribute("title", "remove from favorites");
    article.setAttribute("data-id", favShow.id);
    // add classes
    img.classList.add("favoriteCard__img");
    h3.classList.add("favoriteCard__title");
    rmvBtn.classList.add("js-fav-rmv-btn");
    rmvBtn.classList.add("favoriteCard__btn--rmv");
    rmvBtn.classList.add("fas");
    rmvBtn.classList.add("fa-times");
    article.classList.add("js-favorite-card");
    article.classList.add("favoriteCard");
    // nest
    article.appendChild(img);
    article.appendChild(h3);
    article.appendChild(rmvBtn);
    li.appendChild(article);
    favoriteShowsElement.appendChild(li);
  }
}

// local storage

function saveToLocalStorage() {
  const dataInString = JSON.stringify(favoriteShows);
  localStorage.setItem("favoriteShows", dataInString);
}

function getFromLocalStorage() {
  const savedFavoritesInString = localStorage.getItem("favoriteShows");
  if (savedFavoritesInString !== null) {
    const savedFavorites = JSON.parse(savedFavoritesInString);
    favoriteShows = savedFavorites;
  }
}

// events - handlers

function handleForm(event) {
  event.preventDefault();
}

function handleSearchBtn(event) {
  event.preventDefault();
  search();
}

function handleFavorites(event) {
  const selectedShow = event.currentTarget;
  const show = getShow(parseInt(selectedShow.getAttribute("data-id")));
  updateFavoriteList(show);
  updateSearchResults();
}

function handleRemoveFromFavBtn(event) {
  // parseInt because data-id comes as a string
  const selectedShowId = parseInt(event.currentTarget.getAttribute("data-id"));
  for (const favShow of favoriteShows) {
    if (favShow.id === selectedShowId) {
      updateFavoriteList(favShow);
    }
  }
  updateSearchResults();
}

function handleResetBtn() {
  resetFavorites();
  updateSearchResults();
}

// events - listners

function addListnerToForm() {
  const formElement = document.querySelector(".js-form");
  formElement.addEventListener("submit", handleForm);
}

function addListnerToSearchBtn() {
  const searchBtnElement = document.querySelector(".js-search-btn");
  searchBtnElement.addEventListener("click", handleSearchBtn);
}

function addListnerToShowCard() {
  const showElements = document.querySelectorAll(".js-show-card");
  for (const showElement of showElements) {
    showElement.addEventListener("click", handleFavorites);
  }
}

// I cannot use handleFavorites for x btn because it loops through search results not favorites
function addListnerToRemoveFromFavBtns() {
  const rmvBtnElements = document.querySelectorAll(".js-fav-rmv-btn");
  for (const btn of rmvBtnElements) {
    btn.addEventListener("click", handleRemoveFromFavBtn);
  }
  const resetBtnElement = document.querySelector(".js-fav-reset-btn");
  resetBtnElement.addEventListener("click", handleResetBtn);
}

// run app

function runApp() {
  addListnerToSearchBtn();
  addListnerToForm();
  getFromLocalStorage();
  updateFavoritesVisibility();
  renderFavoriteShows();
  addListnerToRemoveFromFavBtns();
}

runApp();
