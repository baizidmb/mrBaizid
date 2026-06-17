document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. LENIS SMOOTH SCROLL INTEGRATION
  // ==========================================================================
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // ==========================================================================
  // 2. SCROLL PROGRESS INDICATOR
  // ==========================================================================
  const scrollProgress = document.getElementById('scroll-progress');
  const mainNav = document.getElementById('main-nav');

  let lastScrollTime = Date.now();
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let targetScrollVelocity = 0;

  lenis.on('scroll', (e) => {
    // Scroll progress bar
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    }

    // Navigation toggle scrolled class
    if (window.scrollY > 50) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }

    // Velocity calculations
    const now = Date.now();
    const dt = Math.max(1, now - lastScrollTime);
    const dy = window.scrollY - lastScrollY;
    targetScrollVelocity = dy / dt;
    lastScrollTime = now;
    lastScrollY = window.scrollY;
  });

  // ==========================================================================
  // 3. RESPONSIVE MOTION WITH GSAP MATCHMEDIA
  // ==========================================================================
  let mm = gsap.matchMedia();

  // Desktop Animation Suite (width > 900px)
  mm.add("(min-width: 901px)", () => {
    
    // 3.1 Hero Entrance Animation
    const entryTl = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    gsap.set(".text-line span", { yPercent: 105 });
    gsap.set("#hero-eyebrow-node", { opacity: 0, y: 15 });
    gsap.set("#hero-subtitle-node", { opacity: 0, y: 15 });
    gsap.set("#hero-scroll-node", { opacity: 0, y: 10 });
    gsap.set("#hero-img-parallax", { scale: 1.15 });
    gsap.set(".hero-portrait-card", { opacity: 0, scale: 0.92, y: 30, rotateY: -10 });

    entryTl.to("#hero-img-parallax", { scale: 1.0, duration: 2.2, ease: "power3.out" })
           .to(".hero-portrait-card", { opacity: 1, scale: 1, y: 0, rotateY: 0, duration: 1.8, ease: "power3.out" }, "-=2.2")
           .to(".text-line span", { yPercent: 0, duration: 1.4, stagger: 0.12 }, "-=1.8")
           .to("#hero-eyebrow-node", { opacity: 1, y: 0, duration: 0.8 }, "-=1.0")
           .to("#hero-subtitle-node", { opacity: 1, y: 0, duration: 0.8 }, "-=0.8")
           .to("#hero-scroll-node", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");

    // 3.2 Hero Scroll Parallax
    gsap.to("#hero-img-parallax", {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to("#hero-text-wrap", {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // 3.2.1 Hero 3D Blob Scroll Parallax
    if (window.hero3dBlob) {
      gsap.to(window.hero3dBlob.position, {
        x: -0.8,
        y: -1.2,
        z: -1.0,
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
      gsap.to(window.hero3dBlob.scale, {
        x: 0.65,
        y: 0.65,
        z: 0.65,
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }

    // 3.2.5 Neural 3D Tunnel Flight Controller
    const rings = document.querySelectorAll(".tunnel-ring");
    const tunnelContainer = document.getElementById("tunnel-container");
    
    if (rings.length > 0 && tunnelContainer) {
      // Set initial Z positions and staggers on the rings
      rings.forEach((ring, idx) => {
        const zVal = parseFloat(ring.getAttribute("data-z")) || 0;
        gsap.set(ring, {
          z: zVal,
          opacity: idx === 0 ? 0.95 : (idx === 1 ? 0.6 : 0),
          scale: 1
        });
      });

      const tunnelTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#neural-tunnel",
          start: "top top",
          end: "+=150%", // Tightened scroll range
          pin: true,
          scrub: true
        }
      });

      // Helical flight forward (2800px on Z depth, twist Z by 90deg)
      tunnelTimeline.to(tunnelContainer, {
        z: 2800,
        rotateZ: 90,
        ease: "none"
      });

      // Animate cards visibility and zoom factors as the camera flies past them
      rings.forEach((ring, idx) => {
        const enterStart = idx * 0.1;
        const leaveStart = idx * 0.1 + 0.08;
        
        if (idx > 0) {
          tunnelTimeline.to(ring, {
            opacity: 0.95,
            ease: "power1.inOut"
          }, enterStart);
        }

        tunnelTimeline.to(ring, {
          opacity: 0,
          scale: 1.5,
          ease: "power1.in"
        }, leaveStart);
      });
    }

    // 3.3 What I Build - Horizontal Scroll
    const track = document.getElementById("build-track");
    if (track) {
      const getScrollAmount = () => {
        let trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth + 160); // 160px for left/right paddings
      };

      const buildScrollTrigger = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: "#build",
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth + 160}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      // 3D Card Skew & Tilt using containerAnimation
      const cards = document.querySelectorAll(".project-card-wrapper");
      cards.forEach(card => {
        gsap.fromTo(card,
          { rotateY: 16, scale: 0.94, translateZ: -80 },
          {
            rotateY: -16,
            scale: 0.94,
            translateZ: -80,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: buildScrollTrigger,
              start: "left right",
              end: "right left",
              scrub: true
            }
          }
        );
      });
    }

    // 3.4 The Avatar - Pinned Storytelling Crossfades
    const slides = document.querySelectorAll(".avatar-slide-img");
    const panels = document.querySelectorAll(".avatar-text-panel");

    if (slides.length > 0 && panels.length > 0) {
      // Clear initial active classes and let GSAP manage states
      slides[0].classList.remove("active");
      panels[0].classList.remove("active");

      gsap.set(slides[0], { opacity: 1, scale: 1, rotation: 0 });
      gsap.set(panels[0], { opacity: 1, y: 0 });

      const avatarTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: "#avatar-story",
          start: "top top",
          end: "+=150%", // Tightened scroll range
          pin: true,
          scrub: true
        }
      });

      // Slide 1 to 2
      avatarTimeline.to(slides[0], { opacity: 0, scale: 0.95, duration: 1 })
                    .to(panels[0], { opacity: 0, y: -20, duration: 1 }, "<")
                    .to(slides[1], { opacity: 1, scale: 1, rotation: 0, duration: 1 }, "-=0.3")
                    .to(panels[1], { opacity: 1, y: 0, duration: 1 }, "<");

      // Slide 2 to 3
      avatarTimeline.to(slides[1], { opacity: 0, scale: 0.95, duration: 1 })
                    .to(panels[1], { opacity: 0, y: -20, duration: 1 }, "<")
                    .to(slides[2], { opacity: 1, scale: 1, rotation: 0, duration: 1 }, "-=0.3")
                    .to(panels[2], { opacity: 1, y: 0, duration: 1 }, "<");

      // Slide 3 to 4
      avatarTimeline.to(slides[2], { opacity: 0, scale: 0.95, duration: 1 })
                    .to(panels[2], { opacity: 0, y: -20, duration: 1 }, "<")
                    .to(slides[3], { opacity: 1, scale: 1, rotation: 0, duration: 1 }, "-=0.3")
                    .to(panels[3], { opacity: 1, y: 0, duration: 1 }, "<");
    }

    // 3.5 Future Destinies - 3D Cylinder Revolver
    const destinyCards = document.querySelectorAll(".destiny-card");
    const cylinder = document.getElementById("destiny-cylinder");

    if (cylinder && destinyCards.length > 0) {
      // Offset each card by 90 degrees around X-axis, offset back by 240px radius
      destinyCards.forEach((card, idx) => {
        gsap.set(card, {
          rotateX: idx * 90,
          transformOrigin: "50% 50% -240px"
        });
      });

      // Rotate the cylinder relative to vertical scroll progress
      gsap.to(cylinder, {
        rotateX: -270,
        ease: "none",
        scrollTrigger: {
          trigger: "#destinies",
          start: "top top",
          end: "+=150%", // Tightened scroll range
          pin: true,
          scrub: true
        }
      });
    }

    // 3.6 Stack / Tools - Parallax Grid Items
    const stackItems = document.querySelectorAll(".stack-item");
    stackItems.forEach(item => {
      const speed = parseFloat(item.getAttribute("data-speed")) || 0;
      gsap.fromTo(item, 
        { y: 60 * speed },
        {
          y: -120 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: "#stack",
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });

    // 3.8 Contact Card 3D Mouse Parallax Tilt
    const contactSec = document.getElementById("contact");
    const contactCard = document.querySelector(".contact-form-container");

    if (contactSec && contactCard) {
      contactSec.addEventListener("mousemove", (e) => {
        const rect = contactSec.getBoundingClientRect();
        
        // Calculate pointer offset coordinates relative to the viewport container center
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Generate tilt bounds (max 10 degrees yaw/pitch rotation)
        const rotateY = (x / (rect.width / 2)) * 10;
        const rotateX = -(y / (rect.height / 2)) * 10;

        gsap.to(contactCard, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1200,
          ease: "power2.out",
          duration: 0.5
        });
      });

      // Reset card tilt parameters smoothly on viewport exit
      contactSec.addEventListener("mouseleave", () => {
        gsap.to(contactCard, {
          rotateX: 0,
          rotateY: 0,
          ease: "power2.out",
          duration: 0.8
        });
      });
    }

    // 3.8.5 Hero Portrait Card 3D Mouse Parallax Tilt
    const heroSec = document.getElementById("hero");
    const heroCard = document.querySelector(".hero-portrait-card");

    if (heroSec && heroCard) {
      heroSec.addEventListener("mousemove", (e) => {
        const rect = heroSec.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateY = (x / (rect.width / 2)) * 12;
        const rotateX = -(y / (rect.height / 2)) * 12;

        gsap.to(heroCard, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1200,
          ease: "power2.out",
          duration: 0.5
        });
      });

      heroSec.addEventListener("mouseleave", () => {
        gsap.to(heroCard, {
          rotateX: 0,
          rotateY: 0,
          ease: "power2.out",
          duration: 0.8
        });
      });
    }
  });

  // Mobile Animation Suite (width <= 900px)
  mm.add("(max-width: 900px)", () => {
    // 3.7 Mobile Hero Entrance
    gsap.set(".text-line span", { yPercent: 0 });
    gsap.set("#hero-eyebrow-node", { opacity: 1, y: 0 });
    gsap.set("#hero-subtitle-node", { opacity: 1, y: 0 });
    gsap.set("#hero-img-parallax", { scale: 1 });
    gsap.set("#hero-scroll-node", { opacity: 0 });

    // Clean up destiny cards offset styling on mobile
    const destinyCards = document.querySelectorAll(".destiny-card");
    destinyCards.forEach((card) => {
      gsap.set(card, {
        clearProps: "all"
      });
    });

    // Clean up tunnel ring offset styling on mobile
    const rings = document.querySelectorAll(".tunnel-ring");
    rings.forEach((ring) => {
      gsap.set(ring, {
        clearProps: "all"
      });
    });
    
    const tunnelContainer = document.getElementById("tunnel-container");
    if (tunnelContainer) {
      gsap.set(tunnelContainer, {
        clearProps: "all"
      });
    }

    const contactCard = document.querySelector(".contact-form-container");
    if (contactCard) {
      gsap.set(contactCard, {
        clearProps: "all"
      });
    }
  });

  // ==========================================================================
  // 4. SHARED/GLOBAL SCROLL-TRIGGERED ACTIONS
  // ==========================================================================
  
  // 4.1 Ambient Background Color Shifting
  const bgTransitions = [
    { trigger: "#neural-tunnel", bg: "#FAF6F0", isDark: false, accent: 0xe52e2e },
    { trigger: "#build", bg: "#FCEEE3", isDark: false, accent: 0xa855f7 },
    { trigger: "#avatar-story", bg: "#FCE5E5", isDark: false, accent: 0xec4899 },
    { trigger: "#destinies", bg: "#FAF0E6", isDark: false, accent: 0xf59e0b },
    { trigger: "#stack", bg: "#FAEFE5", isDark: false, accent: 0x3b82f6 },
    { trigger: "#contact", bg: "#0B0A08", isDark: true, accent: 0x10b981 }
  ];

  bgTransitions.forEach(trans => {
    ScrollTrigger.create({
      trigger: trans.trigger,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) {
          gsap.to("body", { backgroundColor: trans.bg, duration: 0.8 });
          if (trans.isDark) {
            document.body.classList.add("dark-active");
          } else {
            document.body.classList.remove("dark-active");
          }
          if (window.setTargetAccentColor) {
            window.setTargetAccentColor(trans.accent);
          }
        }
      },
      onLeaveBack: () => {
        const currentIndex = bgTransitions.indexOf(trans);
        if (currentIndex === 0) {
          gsap.to("body", { backgroundColor: "#FAF6F0", duration: 0.8 });
          document.body.classList.remove("dark-active");
          if (window.setTargetAccentColor) {
            window.setTargetAccentColor(0xff6b00); // Reset to Hero amber
          }
        } else {
          const prev = bgTransitions[currentIndex - 1];
          gsap.to("body", { backgroundColor: prev.bg, duration: 0.8 });
          if (prev.isDark) {
            document.body.classList.add("dark-active");
          } else {
            document.body.classList.remove("dark-active");
          }
          if (window.setTargetAccentColor) {
            window.setTargetAccentColor(prev.accent);
          }
        }
      }
    });
  });

  // 4.2 Contact Section Slide-Up Reveal
  gsap.from(["#contact-info-node", "#contact-form-node"], {
    y: 40,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: "#contact",
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  // 4.3 Form Submission & Loader Interactivity
  const contactForm = document.getElementById("portfolio-contact-form");
  const submitBtn = document.getElementById("form-submit-btn");
  const successOverlay = document.getElementById("form-success");
  const successReset = document.getElementById("success-reset");

  if (contactForm && submitBtn && successOverlay) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Animate submit button state
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector(".btn-text");
      const btnLoader = submitBtn.querySelector(".btn-loader");
      if (btnText) btnText.textContent = "Sending...";
      if (btnLoader) btnLoader.style.display = "inline-block";

      // Simulate network request latency
      setTimeout(() => {
        // Activate liquid success screen overlay
        successOverlay.classList.add("active");
        
        // Reset submit button state
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = "Send Message";
        if (btnLoader) btnLoader.style.display = "none";
        
        // Reset fields
        contactForm.reset();
      }, 1500);
    });

    if (successReset) {
      successReset.addEventListener("click", () => {
        // Dismiss success overlay
        successOverlay.classList.remove("active");
      });
    }
  }

  // ==========================================================================
  // 4.5 THREE.JS INTERACTIVE 3D ANIMATIONS (GLOSSY THEME)
  // ==========================================================================
  
  // Three.js Global Mouse coordinates tracking (lerped)
  const mouse = new THREE.Vector2(0, 0);
  const targetMouse = new THREE.Vector2(0, 0);
  
  window.addEventListener('mousemove', (e) => {
    // Normalize coordinates (-1 to 1)
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Global WebGL 3D Scene representing the bubble universe
  let globalScene, globalCamera, globalRenderer;
  const bubbles = [];
  const clusterMeshes = [];
  let heroBlob;

  // Track global accent colors
  const targetAccentColor = new THREE.Color(0xff6b00); // Start with Hero Amber
  const currentAccentColor = new THREE.Color(0xff6b00);
  window.setTargetAccentColor = (hex) => {
    targetAccentColor.set(hex);
  };

  // Track global click ripples
  let clickTime = 99.0;
  const clickPos = new THREE.Vector2(0, 0);
  window.addEventListener('click', (e) => {
    // Avoid triggering on inputs or buttons to prevent annoying overrides
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.closest('a')) {
      return;
    }
    clickTime = 0.0;
    clickPos.x = (e.clientX / window.innerWidth) * 2 - 1;
    clickPos.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function initGlobal3D() {
    const canvas = document.getElementById('global-3d-canvas');
    if (!canvas) return;

    globalScene = new THREE.Scene();
    
    // Set up camera
    globalCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    globalCamera.position.set(0, 0, 4.5);

    globalRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    globalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    globalRenderer.setSize(window.innerWidth, window.innerHeight);

    // Single Shader Material for all morphing liquid glass bubbles
    const bubbleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColor: { value: new THREE.Color(0xffffff) },
        uAccentColor: { value: new THREE.Color(0xff6b00) },
        uBlobScale: { value: 1.0 }, // Scale displacement per mesh
        uScrollVelocity: { value: 0.0 },
        uHover: { value: 0.0 },
        uClickRipple: { value: 0.0 }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uBlobScale;
        uniform float uScrollVelocity;
        uniform float uHover;
        uniform float uClickRipple;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Ripple speed and wobble dynamics scale up with hover interaction
          float speedFactor = 1.6 + uHover * 2.2;
          float wave = sin(position.x * 2.2 + uTime * speedFactor) * 
                       cos(position.y * 2.2 - uTime * (speedFactor * 0.7)) * 
                       sin(position.z * 1.8 + uTime * (speedFactor * 0.4));
          
          // Wobble amplitude increases when hovered or clicked
          float displacementAmount = 0.22 + uHover * 0.18 + uClickRipple;
          vec3 displaced = position + normal * wave * displacementAmount * uBlobScale;
          
          // Gentle mouse push influence
          float d = distance(position.xy, uMouse * 2.2);
          displaced += normal * (sin(uTime * 3.5) * 0.05 * uBlobScale) / (d + 0.5);

          // Volume-preserving scroll stretching along Y-axis
          float stretch = 1.0 + abs(uScrollVelocity) * 0.25;
          float compress = 1.0 / sqrt(stretch);
          displaced.y *= stretch;
          displaced.x *= compress;
          displaced.z *= compress;

          vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
          vViewPosition = mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uAccentColor;
        uniform float uTime;
        uniform float uHover;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vViewPosition);
          
          // Fresnel edge light
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
          
          // Specular highlights
          float diff = max(dot(normal, normalize(vec3(1.0, 2.0, 2.0))), 0.0);
          vec3 halfDir = normalize(viewDir + normalize(vec3(1.0, 2.0, 2.0)));
          
          // Hover soft-widens and intensifies the specular shine
          float specPower = mix(128.0, 64.0, uHover);
          float specMultiplier = mix(0.95, 1.8, uHover);
          float spec = pow(max(dot(normal, halfDir), 0.0), specPower) * specMultiplier;
          
          // Accent and base glass color blending
          vec3 baseColor = mix(uColor, uAccentColor, fresnel * 0.7 + sin(vPosition.y * 2.5 + uTime * 1.0) * 0.15 + 0.15);
          
          // Hover color shift adding a bright glossy white reflection
          baseColor = mix(baseColor, vec3(0.9, 0.95, 1.0), uHover * 0.35);
          
          vec3 finalColor = baseColor * (0.2 + 0.8 * diff) + vec3(1.0) * spec * 0.95;
          
          // Edge opacity increases on hover
          float alpha = mix(0.08, 0.82 + uHover * 0.12, fresnel) + spec * 0.45;
          gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 0.96));
        }
      `
    });

    // 1. Large Hero Blob
    const heroGeo = new THREE.SphereGeometry(1.4, 64, 64);
    heroBlob = new THREE.Mesh(heroGeo, bubbleMaterial.clone());
    heroBlob.material.uniforms.uBlobScale.value = 1.0;
    
    // Set position
    if (window.innerWidth > 900) {
      heroBlob.position.set(1.15, 0, 0);
    } else {
      heroBlob.position.set(0, -0.45, -0.3);
      heroBlob.scale.set(0.85, 0.85, 0.85);
    }
    globalScene.add(heroBlob);
    window.hero3dBlob = heroBlob;

    // 2. Background Bubbles field (Scattered across sections Y ranges from 0 down to -16)
    const bubbleCount = 14;
    const bubbleGeo = new THREE.SphereGeometry(1, 32, 32);
    
    for (let i = 0; i < bubbleCount; i++) {
      const size = 0.15 + Math.random() * 0.35;
      const bMat = bubbleMaterial.clone();
      bMat.uniforms.uBlobScale.value = 0.45;
      
      const bMesh = new THREE.Mesh(bubbleGeo, bMat);
      bMesh.scale.set(size, size, size);
      
      // Distribute bubbles along scroll path
      const x = (Math.random() - 0.5) * 3.8;
      const y = -Math.random() * 14.5 - 1.0; // Y from -1.0 down to -15.5
      const z = -Math.random() * 2.0 - 0.5;
      
      bMesh.position.set(x, y, z);
      
      bMesh.userData = {
        spinX: Math.random() * 0.2 + 0.05,
        spinY: Math.random() * 0.2 + 0.05,
        wobbleOffset: Math.random() * 100
      };
      
      globalScene.add(bMesh);
      bubbles.push(bMesh);
    }

    // 3. Contact Cluster (Orbiting group at Y = -16.5)
    const clusterCount = 4;
    const contactCenterY = -16.5;
    
    for (let i = 0; i < clusterCount; i++) {
      const size = 0.2 + Math.random() * 0.2;
      const bMat = bubbleMaterial.clone();
      bMat.uniforms.uBlobScale.value = 0.5;
      
      const bMesh = new THREE.Mesh(bubbleGeo, bMat);
      bMesh.scale.set(size, size, size);
      
      const angle = (i / clusterCount) * Math.PI * 2;
      const radius = 1.2;
      bMesh.position.set(Math.cos(angle) * radius, contactCenterY, Math.sin(angle) * radius - 0.5);
      
      bMesh.userData = {
        angle: angle,
        orbitRadius: radius,
        speed: 0.15 + Math.random() * 0.1
      };
      
      globalScene.add(bMesh);
      clusterMeshes.push(bMesh);
    }

    const clock = new THREE.Clock();
    const tempV = new THREE.Vector3();
    const projV = new THREE.Vector3();
    
    function animate() {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      const dt = Math.min(0.03, clock.getDelta());
      
      // Lerp mouse coordinates
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;

      // Decay scroll velocity towards 0
      targetScrollVelocity *= 0.92;
      scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.08;

      // Update click ripple timer
      clickTime += dt;
      
      // Lerp accent color
      currentAccentColor.lerp(targetAccentColor, 0.05);
      
      // Update Hero Blob uniforms
      if (heroBlob) {
        heroBlob.material.uniforms.uTime.value = elapsedTime;
        heroBlob.material.uniforms.uMouse.value.copy(mouse);
        heroBlob.material.uniforms.uScrollVelocity.value = scrollVelocity;
        heroBlob.material.uniforms.uAccentColor.value.copy(currentAccentColor);
        heroBlob.rotation.y = elapsedTime * 0.12;
        heroBlob.rotation.x = elapsedTime * 0.06;

        // Proximity detection for Hero Blob
        projV.copy(heroBlob.position);
        projV.project(globalCamera);
        let dist = mouse.distanceTo(new THREE.Vector2(projV.x, projV.y));
        let hover = dist < 0.6 ? (1.0 - (dist / 0.6)) : 0.0;
        hover = hover * hover * (3.0 - 2.0 * hover);
        heroBlob.material.uniforms.uHover.value += (hover - heroBlob.material.uniforms.uHover.value) * 0.1;

        // Click ripple for Hero Blob
        let clickDist = projV.distanceTo(new THREE.Vector3(clickPos.x, clickPos.y, 0));
        let arrivalTime = clickDist / 2.2;
        let timeSinceArrival = clickTime - arrivalTime;
        let clickRipple = 0.0;
        if (timeSinceArrival > 0.0 && timeSinceArrival < 1.0) {
          clickRipple = Math.sin(timeSinceArrival * Math.PI * 3.0) * Math.exp(-timeSinceArrival * 4.0) * 0.35;
        }
        heroBlob.material.uniforms.uClickRipple.value = clickRipple;
      }

      // Update background bubbles
      bubbles.forEach(b => {
        b.material.uniforms.uTime.value = elapsedTime;
        b.material.uniforms.uMouse.value.copy(mouse);
        b.material.uniforms.uScrollVelocity.value = scrollVelocity;
        b.material.uniforms.uAccentColor.value.copy(currentAccentColor);
        
        b.rotation.x = elapsedTime * b.userData.spinX;
        b.rotation.y = elapsedTime * b.userData.spinY;
        b.position.y += Math.sin(elapsedTime * 0.5 + b.userData.wobbleOffset) * 0.001;

        // Proximity detection for background bubble
        projV.copy(b.position);
        projV.project(globalCamera);
        let dist = mouse.distanceTo(new THREE.Vector2(projV.x, projV.y));
        let hover = dist < 0.45 ? (1.0 - (dist / 0.45)) : 0.0;
        hover = hover * hover * (3.0 - 2.0 * hover);
        b.material.uniforms.uHover.value += (hover - b.material.uniforms.uHover.value) * 0.1;

        // Click ripple for background bubble
        let clickDist = projV.distanceTo(new THREE.Vector3(clickPos.x, clickPos.y, 0));
        let arrivalTime = clickDist / 2.2;
        let timeSinceArrival = clickTime - arrivalTime;
        let clickRipple = 0.0;
        if (timeSinceArrival > 0.0 && timeSinceArrival < 1.0) {
          clickRipple = Math.sin(timeSinceArrival * Math.PI * 3.0) * Math.exp(-timeSinceArrival * 4.0) * 0.35;
        }
        b.material.uniforms.uClickRipple.value = clickRipple;
      });

      // Update Contact cluster orbits
      clusterMeshes.forEach(b => {
        b.material.uniforms.uTime.value = elapsedTime;
        b.material.uniforms.uMouse.value.copy(mouse);
        b.material.uniforms.uScrollVelocity.value = scrollVelocity;
        b.material.uniforms.uAccentColor.value.copy(currentAccentColor);
        
        b.userData.angle += b.userData.speed * 0.02;
        
        const x = Math.cos(b.userData.angle) * b.userData.orbitRadius;
        const z = Math.sin(b.userData.angle) * b.userData.orbitRadius - 0.5;
        b.position.x = x;
        b.position.z = z;
        b.rotation.y = elapsedTime * 0.2;

        // Proximity detection for Contact bubble
        projV.copy(b.position);
        projV.project(globalCamera);
        let dist = mouse.distanceTo(new THREE.Vector2(projV.x, projV.y));
        let hover = dist < 0.45 ? (1.0 - (dist / 0.45)) : 0.0;
        hover = hover * hover * (3.0 - 2.0 * hover);
        b.material.uniforms.uHover.value += (hover - b.material.uniforms.uHover.value) * 0.1;

        // Click ripple for Contact bubble
        let clickDist = projV.distanceTo(new THREE.Vector3(clickPos.x, clickPos.y, 0));
        let arrivalTime = clickDist / 2.2;
        let timeSinceArrival = clickTime - arrivalTime;
        let clickRipple = 0.0;
        if (timeSinceArrival > 0.0 && timeSinceArrival < 1.0) {
          clickRipple = Math.sin(timeSinceArrival * Math.PI * 3.0) * Math.exp(-timeSinceArrival * 4.0) * 0.35;
        }
        b.material.uniforms.uClickRipple.value = clickRipple;
      });

      // Camera Scroll Navigation
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = totalScrollHeight > 0 ? (window.scrollY / totalScrollHeight) : 0;
      const targetCameraY = -scrollPercent * 16.5; 
      globalCamera.position.y += (targetCameraY - globalCamera.position.y) * 0.08;
      
      // Camera parallax responsive mouse look
      globalCamera.position.x += (mouse.x * 0.4 - globalCamera.position.x) * 0.05;
      globalCamera.position.z += (4.5 + mouse.y * 0.15 - globalCamera.position.z) * 0.05;
      globalCamera.lookAt(new THREE.Vector3(globalCamera.position.x * 0.75, globalCamera.position.y, -0.5));
      
      globalRenderer.render(globalScene, globalCamera);
    }
    
    animate();

    window.addEventListener('resize', () => {
      globalCamera.aspect = window.innerWidth / window.innerHeight;
      globalCamera.updateProjectionMatrix();
      globalRenderer.setSize(window.innerWidth, window.innerHeight);
      
      if (heroBlob) {
        if (window.innerWidth > 900) {
          heroBlob.position.set(1.15, 0, 0);
          heroBlob.scale.set(1, 1, 1);
        } else {
          heroBlob.position.set(0, -0.45, -0.3);
          heroBlob.scale.set(0.85, 0.85, 0.85);
        }
      }
    });
  }

  // Trigger initializations if THREE exists
  if (typeof THREE !== 'undefined') {
    initGlobal3D();
  }

  // ==========================================================================
  // 5. MOBILE MENU CONTROL
  // ==========================================================================
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      
      if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        lenis.stop(); // Stop Lenis smooth scroll while overlay menu is open
      } else {
        document.body.style.overflow = '';
        lenis.start();
      }
    });

    // Close menu when clicking link
    document.querySelectorAll('.mobile-menu-link').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        lenis.start();
      });
    });
  }
});
