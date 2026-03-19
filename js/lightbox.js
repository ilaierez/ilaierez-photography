/* ===========================
   LIGHTBOX.JS — portfolio.html only
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  initLightbox();
});

/* -------------------------------------------------------
   FILTERS — show/hide gallery items by category
------------------------------------------------------- */
function initFilters() {
  const filterBtns      = document.querySelectorAll('.filter-btn');
  const allItems        = document.querySelectorAll('.gallery__item');
  const basketballGallery = document.querySelector('.gallery[aria-label="Photo gallery"]');
  const flashSection    = document.querySelector('.portfolio-section');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filter = btn.dataset.filter;

      allItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.style.display = match ? '' : 'none';
      });

      /* Hide entire section containers when they have no visible items */
      if (basketballGallery) {
        basketballGallery.style.display = (filter === 'flash') ? 'none' : '';
      }
      if (flashSection) {
        flashSection.style.display = (filter === 'basketball') ? 'none' : '';
      }
    });
  });
}

/* -------------------------------------------------------
   LIGHTBOX — open, close, navigate, keyboard
------------------------------------------------------- */
let lightboxEl      = null;
let lightboxImgEl   = null;
let counterEl       = null;
let captionEl       = null;
let lightboxImages  = [];
let currentIndex    = 0;
let isOpen          = false;

function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery__item');
  if (!galleryItems.length) return;

  /* Build lightbox DOM once */
  lightboxEl = document.createElement('div');
  lightboxEl.className  = 'lightbox';
  lightboxEl.setAttribute('role', 'dialog');
  lightboxEl.setAttribute('aria-modal', 'true');
  lightboxEl.setAttribute('aria-label', 'Photo lightbox');

  lightboxEl.innerHTML = `
    <button class="lightbox__close" aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="1" y1="1" x2="13" y2="13"/>
        <line x1="13" y1="1" x2="1" y2="13"/>
      </svg>
    </button>

    <button class="lightbox__prev" aria-label="Previous photo">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9,1 3,7 9,13"/>
      </svg>
    </button>

    <img class="lightbox__img" src="" alt="" />

    <button class="lightbox__next" aria-label="Next photo">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="5,1 11,7 5,13"/>
      </svg>
    </button>

    <div class="lightbox__caption"></div>
    <div class="lightbox__counter"></div>
  `;

  document.body.appendChild(lightboxEl);

  lightboxImgEl = lightboxEl.querySelector('.lightbox__img');
  counterEl     = lightboxEl.querySelector('.lightbox__counter');
  captionEl     = lightboxEl.querySelector('.lightbox__caption');

  /* Click handlers on gallery items */
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.style.display === 'none') return;

      /* Build image set from currently visible items */
      const visibleItems = Array.from(galleryItems).filter(i => i.style.display !== 'none');
      lightboxImages = visibleItems.map(i => ({
        src:     i.dataset.src  || i.querySelector('img')?.src || '',
        thumb:   i.querySelector('img')?.src || '',
        alt:     i.querySelector('img')?.alt  || '',
        category: i.dataset.category || ''
      }));

      currentIndex = visibleItems.indexOf(item);
      openLightbox(currentIndex);
    });
  });

  /* Control button events */
  lightboxEl.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
  lightboxEl.querySelector('.lightbox__prev').addEventListener('click', () => navigateLightbox(-1));
  lightboxEl.querySelector('.lightbox__next').addEventListener('click', () => navigateLightbox(1));

  /* Click the backdrop (not the image) to close */
  lightboxEl.addEventListener('click', e => {
    if (e.target === lightboxEl) closeLightbox();
  });

  /* Keyboard navigation */
  document.addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft')  navigateLightbox(-1);
  });
}

function openLightbox(index) {
  if (!lightboxEl || !lightboxImages.length) return;
  currentIndex = index;
  loadImage(currentIndex);
  lightboxEl.classList.add('lightbox--open');
  document.body.style.overflow = 'hidden';
  isOpen = true;
  lightboxEl.querySelector('.lightbox__close').focus();
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('lightbox--open');
  document.body.style.overflow = '';
  isOpen = false;
}

function navigateLightbox(direction) {
  if (!lightboxImages.length) return;
  currentIndex = (currentIndex + direction + lightboxImages.length) % lightboxImages.length;
  loadImage(currentIndex);
}

function loadImage(index) {
  const data = lightboxImages[index];
  if (!data || !lightboxImgEl) return;

  /* Fade out → swap src → fade in */
  lightboxImgEl.style.opacity = '0';

  const img = new Image();
  img.onload = img.onerror = () => {
    lightboxImgEl.src = data.src;
    lightboxImgEl.alt = data.alt;
    lightboxImgEl.style.opacity = '1';
  };
  img.src = data.src;

  if (counterEl) counterEl.textContent = `${index + 1} / ${lightboxImages.length}`;
  if (captionEl) captionEl.textContent = data.alt || data.category || '';
}
