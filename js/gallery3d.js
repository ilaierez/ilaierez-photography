/* ===========================
   GALLERY 3D — Pure CSS 3D Transforms
   No CDN, no dependencies, works on file://
   =========================== */

(function () {
  'use strict';

  const IMAGES = [
    { src: 'refrences/basketball/1.jpg',                      alt: 'Trail Blazers dunk' },
    { src: 'refrences/basketball/971A6403-2.jpg',             alt: 'Maccabi pyrotechnics' },
    { src: 'refrences/basketball/971A6627.jpg',               alt: 'Maccabi action' },
    { src: 'refrences/basketball/971A7574 copy.jpg',          alt: 'Player portrait' },
    { src: 'refrences/basketball/971A8081-2 copy.jpg',        alt: 'Courtside' },
    { src: 'refrences/basketball/971A8720-5.jpg',             alt: 'Motion blur drive' },
    { src: 'refrences/basketball/971A8980-2.jpg',             alt: 'Celebration' },
    { src: 'refrences/basketball/971A9809-watermarked.jpg',   alt: 'Basketball action' },
    { src: 'refrences/basketball/sharp dunk.jpg',             alt: 'Sharp dunk' },
    { src: 'refrences/flash photogarphy/971A9452.jpg',        alt: 'Flash — jump' },
    { src: 'refrences/flash photogarphy/971A9554.jpg',        alt: 'Flash — player' },
    { src: 'refrences/flash photogarphy/971A9575.jpg',        alt: 'Flash — low angle' },
    { src: 'refrences/flash photogarphy/971A9735.jpg',        alt: 'Flash — celebration' },
    { src: 'refrences/flash photogarphy/971A9870.jpg',        alt: 'Flash — smoke' },
  ];

  /* depth each card is spaced apart (px) */
  const SPACING    = 1400;
  const TOTAL_Z    = IMAGES.length * SPACING;
  const NEAR_CLIP  = -80;    /* fade out just before camera     */
  const FADE_DEPTH = 600;    /* distance over which cards fade  */
  const SHOW_DEPTH = 4200;   /* ~3 photos visible at a time (3 × SPACING) */

  /* Fixed scatter — each image flies in from a distinct screen region */
  const scatter = [
    { x: -540, y: -210, rot: -9  },  /* top-left */
    { x:  460, y: -170, rot:  7  },  /* top-right */
    { x: -400, y:  220, rot: -6  },  /* bottom-left */
    { x:  520, y:  200, rot:  10 },  /* bottom-right */
    { x: -660, y:   20, rot: -13 },  /* far-left edge */
    { x:  620, y:  -30, rot:  11 },  /* far-right edge */
    { x:   60, y: -300, rot:   3 },  /* top-center */
    { x: -100, y:  280, rot:  -4 },  /* bottom-center */
    { x: -310, y:  -80, rot:  -8 },  /* left-mid */
    { x:  340, y:   90, rot:   9 },  /* right-mid */
    { x:  180, y: -230, rot:   5 },  /* upper-right */
    { x: -220, y:  170, rot:  -7 },  /* lower-left */
    { x:  440, y: -100, rot:  12 },  /* right-upper */
    { x: -480, y:  120, rot: -11 },  /* left-lower */
  ];

  function init() {
    const container = document.getElementById('gallery-3d');
    if (!container) return;

    /* ---- inject styles ---- */
    const style = document.createElement('style');
    style.textContent = `
      #gallery-3d {
        perspective: 700px;
        perspective-origin: 50% 50%;
        overflow: hidden;
      }
      .g3d-scene {
        position: absolute;
        inset: 0;
        transform-style: preserve-3d;
      }
      .g3d-card {
        position: absolute;
        top: 50%;
        left: 50%;
        transform-style: preserve-3d;
        will-change: transform, opacity;
        cursor: pointer;
        transition: filter 0.3s ease;
      }
      .g3d-card:hover { filter: brightness(1.15); }
      .g3d-card img {
        display: block;
        width: 460px;
        max-width: 58vw;
        height: auto;
        object-fit: cover;
        border-radius: 3px;
        pointer-events: none;
        transform: translate(-50%, -50%);
        box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      }
    `;
    document.head.appendChild(style);

    /* ---- build scene ---- */
    const scene = document.createElement('div');
    scene.className = 'g3d-scene';
    container.appendChild(scene);

    /* ---- create cards ---- */
    const cards = IMAGES.map((item, i) => {
      const card = document.createElement('div');
      card.className = 'g3d-card';

      const img = document.createElement('img');
      img.src     = item.src;
      img.alt     = item.alt;
      img.loading = i < 4 ? 'eager' : 'lazy';
      card.appendChild(img);
      scene.appendChild(card);
      return card;
    });

    /* ---- state ---- */
    let offset     = 0;
    let velocity   = 0;
    let autoPlay   = true;
    let lastAction = Date.now();

    /* ---- input ---- */
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      velocity += e.deltaY * 0.35;
      autoPlay = false;
      lastAction = Date.now();
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { velocity += 60;  autoPlay = false; lastAction = Date.now(); }
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { velocity -= 60;  autoPlay = false; lastAction = Date.now(); }
    });

    let lastTY = null;
    container.addEventListener('touchstart', (e) => { lastTY = e.touches[0].clientY; }, { passive: true });
    container.addEventListener('touchmove',  (e) => {
      if (lastTY === null) return;
      velocity += (lastTY - e.touches[0].clientY) * 1.2;
      autoPlay = false;
      lastAction = Date.now();
      lastTY = e.touches[0].clientY;
    }, { passive: true });

    setInterval(() => { if (Date.now() - lastAction > 3000) autoPlay = true; }, 1000);

    /* ---- animation loop ---- */
    function tick() {
      requestAnimationFrame(tick);

      if (autoPlay) velocity += 0.75;
      velocity   *= 0.88;
      offset     += velocity;

      /* keep offset positive, wrapping within total tunnel */
      offset = ((offset % TOTAL_Z) + TOTAL_Z) % TOTAL_Z;

      for (let i = 0; i < cards.length; i++) {
        const s   = scatter[i % scatter.length];

        /* base z position for this card, then shift by scroll offset */
        let z = -i * SPACING + offset;

        /* wrap: when a card passes the camera, send it to the back */
        z = ((z % TOTAL_Z) + TOTAL_Z) % TOTAL_Z;   /* 0 … TOTAL_Z */
        z = z - TOTAL_Z;                             /* -TOTAL_Z … 0 */

        /* opacity: only show cards within SHOW_DEPTH, fade at both ends */
        const FAR_EDGE = -(SHOW_DEPTH);
        let op = 1;
        if      (z < FAR_EDGE)              op = 0;
        else if (z < FAR_EDGE + FADE_DEPTH) op = (z - FAR_EDGE) / FADE_DEPTH;
        else if (z > NEAR_CLIP)             op = 0;
        else if (z > NEAR_CLIP - FADE_DEPTH * 0.4) op = (NEAR_CLIP - z) / (FADE_DEPTH * 0.4);

        op = Math.max(0, Math.min(1, op));

        cards[i].style.opacity   = op;
        cards[i].style.transform =
          `translate3d(${s.x}px, ${s.y}px, ${z}px) rotateZ(${s.rot}deg)`;
      }
    }

    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
