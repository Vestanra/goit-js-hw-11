import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';

const BASE_URL = 'https://pixabay.com/api/'
const API_KEY = '38536372-159bf0f59ef5a36c5ad4ff6d0';
const END_POINT = '&image_type="photo"&orientation="horizontal"&safesearch="true"&per_page=40';
let page = null;

const elements = {
    form: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.load-more'),
}

elements.btnLoadMore.hidden = true;

elements.form.addEventListener('submit', onForm);
elements.btnLoadMore.addEventListener('click', onBtnLoadMore);

let lightbox = new SimpleLightbox('.gallery a');

async function onForm(evt) {
    evt.preventDefault();
    elements.gallery.innerHTML = '';
    elements.btnLoadMore.hidden = true;
    page = 1;
    const searchText = evt.currentTarget.elements.searchQuery.value;

    try {
        const response = await fetchImg(searchText);
        const { totalHits, hits } = response;

    if (hits.length > 0) {
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`)
        elements.gallery.insertAdjacentHTML("beforeend", imgMarcup(hits));
        lightbox.refresh();
        elements.btnLoadMore.hidden = false;
        if (totalHits <= 40) {
        hideBtn();
    } 
    } else {
        Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.")
        evt.target.reset()
    }
    } catch(err) {
        console.log(err)
    }
}

async function fetchImg(text, page) {
    const response = await axios.get(`${BASE_URL}?key=${API_KEY}${END_POINT}&q=${text}&page=${page}`);
    return response.data
}

function imgMarcup(arr) {
    return arr.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => 
    `<div class="photo-card">
        <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
        <div class="info">
            <p class="info-item">
                <b>Likes</b>
                ${likes}
            </p>
            <p class="info-item">
                <b>Views</b>
                ${views}
            </p>
            <p class="info-item">
                <b>Comments</b>
                ${comments}
            </p>
            <p class="info-item">
                <b>Downloads</b>
                ${downloads}
            </p>
        </div>
    </div>`)
        .join('')
}

async function onBtnLoadMore() {
    page += 1;
    const searchText = elements.form.elements.searchQuery.value;
    try {
        const response = await fetchImg(searchText, page);
        const { totalHits, hits } = response;
            elements.gallery.insertAdjacentHTML("beforeend", imgMarcup(hits));
            lightbox.refresh();
        if (page*40 > totalHits) {
            hideBtn()
        }
        scroll()
    } catch(err) {
        console.log(err)
    }
}

function scroll() {
    const { height: cardHeight } = elements.form.firstElementChild.getBoundingClientRect();
    window.scrollBy({
    top: cardHeight * 10,
    behavior: "smooth",
    });
}

function hideBtn() {
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    elements.btnLoadMore.hidden = true;
}