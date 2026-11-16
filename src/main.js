import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const formEl = document.querySelector('.form');
const loadMoreBtnEl = document.querySelector('.load-more');

const PER_PAGE = 15;

let currentQuery = '';
let currentPage = 1;
let totalHits = 0;

formEl.addEventListener('submit', onFormSubmit);
loadMoreBtnEl.addEventListener('click', onLoadMoreClick);

async function onFormSubmit(event) {
  event.preventDefault();

  const query = event.currentTarget.elements['search-text'].value.trim();

  if (query === '') {
    iziToast.warning({
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        backgroundColor: '#ef4040',
        messageColor: '#fff',
      });
      return;
    }

    createGallery(data.hits);
    updateLoadMoreButton();
  } catch {
    showRequestError();
  } finally {
    hideLoader();
    formEl.reset();
  }
}

async function onLoadMoreClick() {
  currentPage += 1;

  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);

    createGallery(data.hits);
    scrollPage();
    updateLoadMoreButton();
  } catch {
    showRequestError();
  } finally {
    hideLoader();
  }
}

function updateLoadMoreButton() {
  if (currentPage * PER_PAGE >= totalHits) {
    hideLoadMoreButton();
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
    });
    return;
  }

  showLoadMoreButton();
}

function scrollPage() {
  const cardEl = document.querySelector('.gallery-item');

  if (!cardEl) {
    return;
  }

  const { height } = cardEl.getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}

function showRequestError() {
  iziToast.error({
    message: 'Something went wrong. Please try again!',
    position: 'topRight',
    backgroundColor: '#ef4040',
    messageColor: '#fff',
  });
}