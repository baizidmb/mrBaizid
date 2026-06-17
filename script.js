document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. MOTION ACCESSIBILITY CHECK
  // ==========================================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================================================
  // 2. CUSTOM CURSOR
  // ==========================================================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let hasMoved = false;
  let isTouch = false;

  // Detect touch capability to hide custom cursor
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    isTouch = true;
  }

  if (!isTouch && !prefersReducedMotion) {
    // Show custom cursors on mouse move
    document.addEventListener('mousemove', (e) => {
      if (!hasMoved) {
        cursorDot.style.display = 'block';
        cursorRing.style.display = 'block';
        hasMoved = true;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Cursor click expansions
    document.addEventListener('mousedown', () => {
      cursorRing.style.width = '24px';
      cursorRing.style.height = '24px';
    });
    
    document.addEventListener('mouseup', () => {
      cursorRing.style.width = '36px';
      cursorRing.style.height = '36px';
    });

    // Hide cursor when leaving viewport
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (hasMoved) {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
    });

    // Global Hover Event Delegation (Links, Buttons, Rows)
    document.addEventListener('mouseover', (e) => {
      const hoverTarget = e.target.closest('a, button, .project-row, .social-link, input, textarea');
      if (hoverTarget) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  // ==========================================================================
  // 3. GOLD PARTICLE CANVAS
  // ==========================================================================
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const maxParticles = 60;
  let animationFrameId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 20;
      this.size = Math.random() * 1.5 + 0.8; // size 0.8px to 2.3px
      this.speedY = -(Math.random() * 0.3 + 0.15); // slow vertical drift
      this.speedX = (Math.random() - 0.5) * 0.15; // slow horizontal drift
      this.opacity = Math.random() * 0.4 + 0.15; // opacity 0.15 to 0.55
      this.color = Math.random() > 0.45 ? '#C9A96E' : '#8C8C8C'; // gold or grey
      this.wobbleSpeed = Math.random() * 0.01 + 0.005;
      this.wobbleRange = Math.random() * 0.4 + 0.2;
      this.wobbleVal = Math.random() * Math.PI * 2;
    }
    update() {
      this.y += this.speedY;
      this.wobbleVal += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobbleVal) * this.wobbleRange * 0.1;

      // Reset when floating off screen
      if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  if (!prefersReducedMotion) {
    initParticles();
  }

  // ==========================================================================
  // 4. ANIMATION FRAME CENTRAL LOOP (Cursor Inertia, Parallax, Particles)
  // ==========================================================================
  const heroParallax = document.getElementById('hero-parallax');
  let lastScrollY = window.scrollY;

  function tick() {
    // 4.1 Update custom cursor with inertia (lerp)
    if (hasMoved && !isTouch && !prefersReducedMotion) {
      // Linear interpolation (lerp) for smooth lag ring
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    }

    // 4.2 Particle canvas rendering
    if (!prefersReducedMotion) {
      drawParticles();
    }

    // 4.3 Hero parallax (35% scroll speed)
    if (heroParallax && !prefersReducedMotion) {
      lastScrollY = window.scrollY;
      heroParallax.style.transform = `translate3d(0, ${lastScrollY * 0.35}px, 0)`;
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  // Start tick loop
  tick();

  // ==========================================================================
  // 5. SCROLL PROGRESS BAR & NAV SCROLLED CLASS
  // ==========================================================================
  const scrollProgress = document.getElementById('scroll-progress');
  const mainNav = document.getElementById('main-nav');

  window.addEventListener('scroll', () => {
    // Progress calculation
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      scrollProgress.style.width = `${progress}%`;
    }

    // Nav class scroll toggle
    if (window.scrollY > 80) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }
  });

  // ==========================================================================
  // 6. INTERSECTION OBSERVERS (Scroll reveals, Typewriter)
  // ==========================================================================
  
  // 6.1 About reveal elements (Threshold: 0.12)
  const aboutImage = document.getElementById('about-image-wrapper');
  const aboutText = document.getElementById('about-text-wrapper');

  if (aboutImage && aboutText) {
    if (prefersReducedMotion) {
      aboutImage.classList.add('active');
      aboutText.classList.add('active');
    } else {
      const aboutObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      aboutObserver.observe(aboutImage);
      aboutObserver.observe(aboutText);
    }
  }

  // 6.2 Projects items slide-in staggered reveal
  const projectRows = document.querySelectorAll('.project-row');
  if (projectRows.length > 0) {
    if (prefersReducedMotion) {
      projectRows.forEach(row => row.classList.add('active'));
    } else {
      const projectObserver = new IntersectionObserver((entries, observer) => {
        let delay = 0;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const row = entry.target;
            setTimeout(() => {
              row.classList.add('active');
            }, delay);
            delay += 120; // 120ms stagger delay
            observer.unobserve(row);
          }
        });
      }, { threshold: 0.08 });

      projectRows.forEach(row => projectObserver.observe(row));
    }
  }

  // 6.3 Skills column staggered reveal
  const skillsColumns = document.querySelectorAll('.skills-column');
  if (skillsColumns.length > 0) {
    if (prefersReducedMotion) {
      skillsColumns.forEach(col => col.classList.add('active'));
    } else {
      const skillsObserver = new IntersectionObserver((entries, observer) => {
        let delay = 0;
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const col = entry.target;
            setTimeout(() => {
              col.classList.add('active');
            }, delay);
            delay += 180; // 180ms stagger delay
            observer.unobserve(col);
          }
        });
      }, { threshold: 0.12 });

      skillsColumns.forEach(col => skillsObserver.observe(col));
    }
  }

  // 6.4 Contact Typewriter (Threshold 0.1)
  const contactSection = document.getElementById('contact');
  const emailElement = document.getElementById('typewriter-email');
  const emailText = "hello@baizid.com";

  if (contactSection && emailElement) {
    if (prefersReducedMotion) {
      emailElement.textContent = emailText;
    } else {
      // Clear email on load to prepare for typing reveal
      emailElement.textContent = "";

      const contactObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            typewriter(emailElement, emailText, 70);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      contactObserver.observe(contactSection);
    }
  }

  function typewriter(element, text, speed) {
    let index = 0;
    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // ==========================================================================
  // 7. PROJECTS MOUSE-FOLLOW THUMBNAIL
  // ==========================================================================
  if (!isTouch && !prefersReducedMotion) {
    projectRows.forEach(row => {
      const thumbnail = row.querySelector('.project-thumbnail-float');
      
      if (thumbnail) {
        row.addEventListener('mousemove', (e) => {
          const rect = row.getBoundingClientRect();
          // Calculate relative position to the parent row container
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          thumbnail.style.left = `${x}px`;
          thumbnail.style.top = `${y}px`;
        });
      }
    });
  }

  // ==========================================================================
  // 8. GALLERY SNAP SCROLL CENTER CALCULATION & DRAG SCROLL
  // ==========================================================================
  const galleryTrack = document.getElementById('gallery-track');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (galleryTrack && galleryItems.length > 0) {
    
    // 8.1 Active Center calculation on scroll
    function updateGalleryCenter() {
      const trackRect = galleryTrack.getBoundingClientRect();
      const trackCenter = trackRect.left + (trackRect.width / 2);

      let closestItem = null;
      let minDistance = Infinity;

      galleryItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + (itemRect.width / 2);
        const distance = Math.abs(itemCenter - trackCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestItem = item;
        }
      });

      galleryItems.forEach(item => {
        if (item === closestItem) {
          item.classList.add('active-center');
        } else {
          item.classList.remove('active-center');
        }
      });
    }

    galleryTrack.addEventListener('scroll', updateGalleryCenter);
    window.addEventListener('resize', updateGalleryCenter);
    
    // Initial center highlight check
    setTimeout(updateGalleryCenter, 150);

    // 8.2 Drag to Scroll logic (Desktop only)
    if (!isTouch) {
      let isDown = false;
      let startX;
      let scrollLeft;

      galleryTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        galleryTrack.classList.add('dragging');
        startX = e.pageX - galleryTrack.offsetLeft;
        scrollLeft = galleryTrack.scrollLeft;
      });

      galleryTrack.addEventListener('mouseleave', () => {
        isDown = false;
        galleryTrack.classList.remove('dragging');
      });

      galleryTrack.addEventListener('mouseup', () => {
        isDown = false;
        galleryTrack.classList.remove('dragging');
      });

      galleryTrack.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - galleryTrack.offsetLeft;
        const walk = (x - startX) * 1.5; // Drag speed multiplier
        galleryTrack.scrollLeft = scrollLeft - walk;
      });
    }
  }

  // ==========================================================================
  // 9. MOBILE MENU TOGGLE
  // ==========================================================================
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      
      // Prevent body scrolling when menu is active
      if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking link
    document.querySelectorAll('.mobile-menu-link').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside of links/menu container
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && e.target !== menuBtn) {
        menuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});
