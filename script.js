/* ═══════════════════════════════════════
   NAVBAR — Hamburguesa & Scroll
   ═══════════════════════════════════════ */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks   = document.querySelectorAll('.nav-link');

// Toggle menú mobile
hamburger.addEventListener('click', function (e) {
  e.stopPropagation();
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Cerrar menú al hacer clic en un enlace
navLinks.forEach(function (link) {
  link.addEventListener('click', closeMobileMenu);
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function (e) {
  if (
    mobileMenu.classList.contains('open') &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMobileMenu();
  }
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}


/* ═══════════════════════════════════════
   NAVBAR — Sombra al hacer scroll
   ═══════════════════════════════════════ */
window.addEventListener('scroll', function () {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });


/* ═══════════════════════════════════════
   SCROLL SUAVE — Nav links
   ═══════════════════════════════════════ */
navLinks.forEach(function (link) {
  link.addEventListener('click', function (e) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navbarHeight = navbar.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    }
  });
});


/* ═══════════════════════════════════════
   FADE-IN — Intersection Observer
   ═══════════════════════════════════════ */
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

fadeEls.forEach(function (el) {
  observer.observe(el);
});


/* ═══════════════════════════════════════
   FORMULARIO RSVP
   ═══════════════════════════════════════ */
const rsvpForm   = document.getElementById('rsvpForm');
const formMsg    = document.getElementById('formMessage');
const submitBtn  = document.getElementById('submitBtn');

/* ═══════════════════════════════════════
   COUNTDOWN TIMER
   ═══════════════════════════════════════ */
function initCountdown() {
  const target = new Date('2026-07-11T16:15:00-06:00');

  function update() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      document.querySelector('.countdown').innerHTML =
        '<p style="font-family: Crimson Pro, serif; font-style: italic; color: #5b7451;">¡Hoy es el gran día!</p>';
      return;
    }

    const dias    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-dias').textContent    = String(dias).padStart(2, '0');
    document.getElementById('cd-horas').textContent   = String(horas).padStart(2, '0');
    document.getElementById('cd-minutos').textContent = String(minutos).padStart(2, '0');
    document.getElementById('cd-segundos').textContent = String(segundos).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

initCountdown();


/* ═══════════════════════════════════════
   FADE-UP — Intersection Observer
   ═══════════════════════════════════════ */
const fadeUpEls = document.querySelectorAll('.fade-up');

const fadeUpObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry, i) {
    if (entry.isIntersecting) {
      setTimeout(function () {
        entry.target.classList.add('visible');
      }, i * 80);
      fadeUpObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

fadeUpEls.forEach(function (el) {
  fadeUpObserver.observe(el);
});


/* ═══════════════════════════════════════
   FORMULARIO RSVP
   ═══════════════════════════════════════ */
rsvpForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Limpiar mensaje previo
  formMsg.textContent = '';
  formMsg.className = 'form-message';

  // Validar campos requeridos
  const fields = rsvpForm.querySelectorAll('[required]');
  let valid = true;

  fields.forEach(function (field) {
    field.style.borderBottomColor = '';
    if (!field.value.trim() || (field.tagName === 'SELECT' && field.value === '')) {
      field.style.borderBottomColor = '#a05454';
      valid = false;
    }
  });

  if (!valid) {
    formMsg.textContent = 'Por favor completa todos los campos requeridos.';
    formMsg.classList.add('form-message--error');
    return;
  }

  // Construir payload
  const payload = {
    nombre:       rsvpForm.nombre.value.trim(),
    apellido:     rsvpForm.apellido.value.trim(),
    telefono:     rsvpForm.telefono.value.trim(),
    respuesta:    rsvpForm.respuesta.value,
    acompanantes: parseInt(rsvpForm.acompanantes.value, 10) || 0,
  };

  // Deshabilitar botón mientras se envía
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando…';

  try {
    console.log('[RSVP] Enviando payload:', payload);

    const res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('[RSVP] Respuesta del servidor:', res.status, data);

    if (res.ok && data.success) {
      formMsg.textContent = '¡Gracias! Tu respuesta ha sido registrada.';
      formMsg.classList.add('form-message--success');
      rsvpForm.reset();
    } else {
      throw new Error(data.error || 'Error del servidor');
    }
  } catch (err) {
    console.error('[RSVP] Error:', err.message);
    formMsg.textContent = 'Hubo un problema, intenta de nuevo.';
    formMsg.classList.add('form-message--error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar';
  }
});
