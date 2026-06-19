document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. LENIS SMOOTH SCROLL INTEGRATION
  // ==========================================================================
  // Connect Lenis to GSAP ScrollTrigger only on desktop (width > 900px)
  let lenis;
  if (window.innerWidth > 900) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // ==========================================================================
  // 2. SCROLL PROGRESS INDICATOR
  // ==========================================================================
  const scrollProgress = document.getElementById('scroll-progress');
  const mainNav = document.getElementById('main-nav');

  let lastScrollTime = Date.now();
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let targetScrollVelocity = 0;

  const handleScrollEvents = () => {
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
  };

  if (lenis) {
    lenis.on('scroll', handleScrollEvents);
  } else {
    window.addEventListener('scroll', handleScrollEvents);
  }

  // ==========================================================================
  // 2.5 GLOBAL HERO SCROLL IMAGE SEQUENCE PRELOADER & RENDERER
  // ==========================================================================
  const frameCount = 300;
  const images = [];
  const sequence = { frame: 0 };
  const sequenceCanvas = document.getElementById("hero-sequence-canvas");
  
  // Preload all 300 JPEGs in the background
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    const frameStr = String(i).padStart(3, '0');
    img.src = `hero-sequence/ezgif-frame-${frameStr}.jpg`;
    images.push(img);
  }

  if (sequenceCanvas) {
    const ctx = sequenceCanvas.getContext("2d");
    
    const renderSequenceFrame = () => {
      const img = images[sequence.frame];
      if (img && img.complete) {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        if (imgWidth === 0 || imgHeight === 0) return;
        
        const canvasWidth = sequenceCanvas.width;
        const canvasHeight = sequenceCanvas.height;
        
        const imgRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          drawHeight = canvasHeight;
          drawWidth = canvasHeight * imgRatio;
          offsetX = (canvasWidth - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imgRatio;
          offsetX = 0;
          offsetY = (canvasHeight - drawHeight) / 2;
        }
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    const resizeSequenceCanvas = () => {
      sequenceCanvas.width = window.innerWidth;
      sequenceCanvas.height = window.innerHeight;
      renderSequenceFrame();
    };

    // Render first frame as soon as it is loaded
    images[0].onload = renderSequenceFrame;
    window.addEventListener('resize', resizeSequenceCanvas);
    resizeSequenceCanvas();

    // Map scroll progress of #hero to sequence frame globally for desktop & mobile
    gsap.to(sequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 0.1 // Adding tiny scrub lag for smooth frame transitions
      },
      onUpdate: renderSequenceFrame
    });
  }

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
    gsap.set(".hero-sequence-wrapper", { opacity: 0, scale: 1.1 });

    entryTl.to(".hero-sequence-wrapper", { opacity: 0.65, scale: 1.0, duration: 2.2, ease: "power3.out" })
           .to(".text-line span", { yPercent: 0, duration: 1.4, stagger: 0.12 }, "-=1.8")
           .to("#hero-eyebrow-node", { opacity: 1, y: 0, duration: 0.8 }, "-=1.0")
           .to("#hero-subtitle-node", { opacity: 1, y: 0, duration: 0.8 }, "-=0.8")
           .to("#hero-scroll-node", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");

    // 3.2 Hero Scroll Parallax
    gsap.to("#hero-text-wrap", {
      yPercent: -20,
      opacity: 0,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=120%",
        scrub: true
      }
    });

    gsap.to("#hero-scroll-node", {
      yPercent: -40,
      opacity: 0,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=30%",
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
          end: "+=200%",
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
          end: "+=200%",
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
  });

  // Mobile Animation Suite (width <= 900px)
  mm.add("(max-width: 900px)", () => {
    // 3.7 Mobile Hero Entrance (Simple load animation)
    const mobileTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    gsap.set(".text-line span", { yPercent: 100 });
    gsap.set("#hero-eyebrow-node", { opacity: 0, y: 15 });
    gsap.set("#hero-subtitle-node", { opacity: 0, y: 15 });
    gsap.set(".hero-sequence-wrapper", { opacity: 0, scale: 1.08 });
    gsap.set("#hero-scroll-node", { opacity: 0 });

    mobileTl.to(".hero-sequence-wrapper", { opacity: 0.65, scale: 1.0, duration: 1.5, ease: "power2.out" })
            .to(".text-line span", { yPercent: 0, duration: 1.0, stagger: 0.1 }, "-=0.8")
            .to("#hero-eyebrow-node", { opacity: 1, y: 0, duration: 0.6 }, "-=0.6")
            .to("#hero-subtitle-node", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");

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

    // Scroll-triggered animations for mobile sections
    // 1. What I Build cards
    const mobileCards = document.querySelectorAll(".project-card-wrapper");
    mobileCards.forEach(card => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 1.0,
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    // 2. Neural Tunnel Rings (vertical segments)
    const mobileRings = document.querySelectorAll(".tunnel-ring");
    mobileRings.forEach(ring => {
      gsap.from(ring, {
        opacity: 0,
        y: 40,
        duration: 1.0,
        scrollTrigger: {
          trigger: ring,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    // 3. Avatar panels
    const mobileAvatarPanels = document.querySelectorAll(".avatar-text-panel");
    mobileAvatarPanels.forEach(panel => {
      gsap.from(panel, {
        opacity: 0,
        y: 40,
        duration: 1.0,
        scrollTrigger: {
          trigger: panel,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    // 4. Destiny cards
    const mobileDestinies = document.querySelectorAll(".destiny-card");
    mobileDestinies.forEach(card => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 1.0,
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    // 5. Stack Cards
    const mobileStackCards = document.querySelectorAll(".stack-card");
    mobileStackCards.forEach(card => {
      gsap.from(card, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      });
    });
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

  // Global WebGL 3D Scene representing the black hole particle swarm
  let globalScene, globalCamera, globalRenderer, globalComposer;
  let instancedMesh;
  const COUNT = 20000;
  const positions = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const target = new THREE.Vector3();

  // Control variables for the black hole simulation
  const PARAMS = {
    scale: 48,
    spin: 2.54,
    accretion: 1.5,
    warp: 2.2
  };

  // Helper stub for compatibility
  const addControl = (id, label, min, max, val) => {
    return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };

  function initGlobal3D() {
    const canvas = document.getElementById('global-3d-canvas');
    if (!canvas) return;

    globalScene = new THREE.Scene();
    globalScene.fog = new THREE.FogExp2(0x000000, 0.008);
    
    // Camera settings optimized for black hole viewport
    globalCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    globalCamera.position.set(0, 30, 120);

    globalRenderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance" 
    });
    globalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    globalRenderer.setSize(window.innerWidth, window.innerHeight);

    // Post-processing setup with UnrealBloomPass (disabled on mobile for peak performance)
    const isMobile = window.innerWidth <= 900;
    if (!isMobile && typeof THREE.EffectComposer !== 'undefined') {
      globalComposer = new THREE.EffectComposer(globalRenderer);
      globalComposer.addPass(new THREE.RenderPass(globalScene, globalCamera));
      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 
        1.5, 0.4, 0.85
      );
      bloomPass.strength = 1.4;
      bloomPass.radius = 0.45;
      bloomPass.threshold = 0.05;
      globalComposer.addPass(bloomPass);
    }

    // Instanced Mesh for 20,000 particles using TetrahedronGeometry
    const geometry = new THREE.TetrahedronGeometry(0.22);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    
    instancedMesh = new THREE.InstancedMesh(geometry, material, COUNT);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    globalScene.add(instancedMesh);

    // Initialize positions randomly
    for (let i = 0; i < COUNT; i++) {
      positions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 200, 
        (Math.random() - 0.5) * 200, 
        (Math.random() - 0.5) * 200
      ));
      instancedMesh.setColorAt(i, color.setHex(0x00ff88));
    }

    const clock = new THREE.Clock();
    
    function animate() {
      requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime() * 0.9;
      
      // Lerp mouse coordinates
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;

      // Accretion Disk Physics Simulation (User Injected Logic)
      const count = COUNT;
      const scale = addControl("scale", "Event Horizon", 20, 200, 90);
      const spin = addControl("spin", "Spin", 0.2, 8.0, 3.0);
      const accretion = addControl("accretion", "Accretion Disk", 0.0, 2.0, 1.0);
      const warp = addControl("warp", "Space Warp", 0.0, 3.0, 1.2);
      
      const t = time * 0.35;
      const ga = 2.399963229728653; // Golden angle

      for (let i = 0; i < COUNT; i++) {
        const u = (i + 0.5) / count;
        const a = i * ga;
        
        const band = u * 24.0 - 12.0;
        const disk = 1.0 - Math.abs(Math.sin(band * 0.5));
        const radius = scale * (0.08 + 1.9 * u * u);
        
        const swirl = a + spin * Math.log(radius + 1.0) - t * (2.0 + 3.0 * (1.0 - u));
        
        const grav = 1.0 / (1.0 + radius * 0.015);
        const bend = warp * grav * grav;
        
        const x0 = radius * Math.cos(swirl);
        const z0 = radius * Math.sin(swirl);
        
        const x = x0 + bend * z0;
        const z = z0 - bend * x0;
        const y = scale * 0.22 * disk * Math.sin(a * 0.17 + t * 4.0) * accretion;
        
        target.set(x, y, z);
        
        // Relativistic heat coloration (blazing orange inside to cool indigo outside)
        const heat = 1.0 - Math.min(1.0, radius / (scale * 2.0));
        const hue = 0.08 + 0.58 * (1.0 - heat);
        const sat = 0.8 + 0.2 * heat;
        const light = 0.15 + 0.55 * Math.pow(heat, 1.5);
        
        color.setHSL(hue, sat, light);

        // Interpolate position towards target for fluid momentum
        positions[i].lerp(target, 0.08);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.setColorAt(i, color);
      }
      
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      // Camera Scroll Orbit & Parallax
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = totalScrollHeight > 0 ? (window.scrollY / totalScrollHeight) : 0;
      
      const targetCamX = Math.sin(scrollPercent * Math.PI * 0.5) * 45;
      const targetCamY = 30 - scrollPercent * 90;
      const targetCamZ = 120 - scrollPercent * 40;
      
      globalCamera.position.x += (targetCamX - globalCamera.position.x) * 0.05;
      globalCamera.position.y += (targetCamY - globalCamera.position.y) * 0.05;
      globalCamera.position.z += (targetCamZ - globalCamera.position.z) * 0.05;
      
      // Responsive mouse look
      globalCamera.position.x += (mouse.x * 12 - globalCamera.position.x) * 0.05;
      globalCamera.position.y += (mouse.y * 12 - globalCamera.position.y) * 0.05;
      globalCamera.lookAt(new THREE.Vector3(0, -scrollPercent * 15, 0));

      if (globalComposer) {
        globalComposer.render();
      } else {
        globalRenderer.render(globalScene, globalCamera);
      }
    }
    
    animate();

    window.addEventListener('resize', () => {
      globalCamera.aspect = window.innerWidth / window.innerHeight;
      globalCamera.updateProjectionMatrix();
      globalRenderer.setSize(window.innerWidth, window.innerHeight);
      if (globalComposer) globalComposer.setSize(window.innerWidth, window.innerHeight);
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
