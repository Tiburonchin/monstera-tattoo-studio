/* =========================================
   LENIS SMOOTH SCROLLING
   ========================================= */
const lenis = new Lenis({
  duration: 0.8,       // Fast enough to not feel laggy
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.2,  // Slightly faster scroll per tick
  smoothTouch: false,    // Keep native touch scroll (less jarring on phones)
  touchMultiplier: 2,
});

// Sync AOS (Animate on Scroll) with Lenis scroll position
lenis.on('scroll', () => {
  AOS.refresh();  // Re-calculate trigger points as Lenis scrolls
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Initialize Animate On Scroll (AOS)
AOS.init({
  once: true,
  offset: 100,
});

// Navigation Background and Social Dock on Scroll
const header = document.getElementById("navbar");
const socialDock = document.querySelector(".social-dock");

window.addEventListener("scroll", () => {
  // Header logic
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  // Social Dock visibility (show dock after scrolling past hero text ~500px)
  if (socialDock) {
    if (window.scrollY > 500) {
      socialDock.classList.add("visible");
    } else {
      socialDock.classList.remove("visible");
    }
  }
});

// Setup SVG Displacement map dynamically based on Codepen logic
function initDockDisplacement() {
  if (!socialDock) return;
  
  const width = socialDock.offsetWidth || 240;
  const height = socialDock.offsetHeight || 64;
  
  const config = {
    width: width,
    height: height,
    radius: height / 2, // perfect pill shape
    border: 0.07,
    lightness: 50,
    alpha: 0.93,
    blur: 11,
    blend: 'difference',
    x: 'R',
    y: 'B',
    scale: -180,
    r: 0,
    g: 10,
    b: 20
  };

  const borderPx = Math.min(config.width, config.height) * (config.border * 0.5);
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.width} ${config.height}">
      <defs>
        <linearGradient id="rGrad" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="bGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${config.width}" height="${config.height}" fill="black"/>
      <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#rGrad)"/>
      <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#bGrad)" style="mix-blend-mode:${config.blend}"/>
      <rect x="${borderPx}" y="${borderPx}" width="${config.width - borderPx * 2}" height="${config.height - borderPx * 2}" rx="${config.radius}" fill="hsl(0 0% ${config.lightness}% / ${config.alpha})" style="filter:blur(${config.blur}px)"/>
    </svg>`;

  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

  const map = document.getElementById('dock-map');
  if(map) map.setAttribute('href', dataUri);
  
  const setupChannel = (id, offset) => {
    const el = document.getElementById(id);
    if(el) {
      el.setAttribute('scale', config.scale + offset);
      el.setAttribute('xChannelSelector', config.x);
      el.setAttribute('yChannelSelector', config.y);
    }
  };
  
  setupChannel('dock-redchannel', config.r);
  setupChannel('dock-greenchannel', config.g);
  setupChannel('dock-bluechannel', config.b);
}

// Re-calc layout on window resize to update displacement shape
window.addEventListener('resize', initDockDisplacement);
// Calc on load
window.addEventListener('load', initDockDisplacement);

// Mobile menu toggle
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("active");
  menuToggle.classList.toggle("active");
});

// Handle smooth scrolling for ALL anchor links using Lenis
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || targetId === '') return;
    e.preventDefault();

    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      lenis.scrollTo(targetEl, { offset: -80 }); // -80px for fixed header
    }

    // Close mobile menu if open
    if (nav && nav.classList.contains('active')) {
      nav.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
});

/* =========================================
   MAGNETIC BUTTONS
   ========================================= */
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Adjust the divisor (e.g., 3) to increase or decrease the pull strength
    el.style.transform = `translate(${x / 3}px, ${y / 3}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0px, 0px)';
  });
});

/* =========================================
   HERO TEXT REVEAL
   ========================================= */
window.addEventListener('load', () => {
  const clipReveals = document.querySelectorAll('.clip-reveal');
  const fadeReveals = document.querySelectorAll('.fade-reveal, .fade-reveal-delay');
  
  // Stagger bringing them in
  setTimeout(() => {
    clipReveals.forEach(el => el.classList.add('is-visible'));
    fadeReveals.forEach(el => el.classList.add('is-visible'));
  }, 300);
});

/* =========================================
   PREMIUM WIZARD FORM LOGIC
   ========================================= */
const wizardForm = document.getElementById('premium-wizard-form');
const steps = document.querySelectorAll('.wizard-step');
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');
const btnNext = document.querySelector('.wizard-btn-next');
const btnPrev = document.querySelector('.wizard-btn-prev');
const btnSubmit = document.querySelector('.form-submit-btn');
const toastNotification = document.getElementById('toast-notification');

let currentStep = 0;

function updateWizard() {
  if (!wizardForm) return;
  // Hide all, show current
  steps.forEach((step, index) => {
    if (index === currentStep) {
      step.classList.remove('hidden-step');
      step.classList.add('active-step');
    } else {
      step.classList.remove('active-step');
      step.classList.add('hidden-step');
    }
  });

  // Update Progress
  progressSteps.forEach((step, index) => {
    if (index === currentStep) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else if (index < currentStep) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else {
      step.classList.remove('completed', 'active');
    }
  });

  progressLines.forEach((line, index) => {
    if (index < currentStep) {
      line.classList.add('completed');
    } else {
      line.classList.remove('completed');
    }
  });

  // Buttons
  if (currentStep === 0) {
    btnPrev.style.display = 'none';
  } else {
    btnPrev.style.display = 'block';
  }

  if (currentStep === steps.length - 1) {
    btnNext.style.display = 'none';
    btnSubmit.style.display = 'block';
  } else {
    btnNext.style.display = 'block';
    btnSubmit.style.display = 'none';
  }
}

if (wizardForm) {
  // Navigation
  btnNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      updateWizard();
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateWizard();
    }
  });

  // File Upload Preview
  const fileInput = document.getElementById('reference-images');
  const fileListContainer = document.getElementById('file-list');

  if (fileInput) {
    fileInput.addEventListener('change', function() {
      fileListContainer.innerHTML = '';
      Array.from(this.files).forEach(file => {
        const span = document.createElement('span');
        span.className = 'file-item';
        span.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> ${file.name}`;
        fileListContainer.appendChild(span);
      });
    });
  }

  // Submission
  btnSubmit.addEventListener('click', () => {
    // Basic validation check (Step 4)
    const nameInput = document.getElementById('form-name');
    const phoneInput = document.getElementById('form-phone');
    
    if (!nameInput.value || !phoneInput.value) {
      alert('Por favor, rellena tu nombre y WhatsApp para finalizar la reserva.');
      return;
    }

    // Simulate API delay
    const originalText = btnSubmit.innerText;
    btnSubmit.innerText = 'Procesando...';
    btnSubmit.style.pointerEvents = 'none';
    btnSubmit.style.opacity = '0.8';

    setTimeout(() => {
      // Show Toast Notification
      if (toastNotification) {
        toastNotification.classList.add('show');
      }
      
      // Reset Form fields
      wizardForm.reset();
      if(fileListContainer) fileListContainer.innerHTML = '';
      currentStep = 0;
      updateWizard();
      
      // Re-enable button
      btnSubmit.innerText = originalText;
      btnSubmit.style.pointerEvents = 'auto';
      btnSubmit.style.opacity = '1';

      // Hide toast after 4 seconds
      setTimeout(() => {
        if(toastNotification) toastNotification.classList.remove('show');
      }, 4000);

    }, 800);
  });

  // Initialize
  updateWizard();
}


