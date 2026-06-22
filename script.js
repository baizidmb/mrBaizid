document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  // ==========================================================================
  // 1. LENIS SMOOTH SCROLL INTEGRATION
  // ==========================================================================
  // Connect Lenis to GSAP ScrollTrigger globally
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: true,
    syncTouch: true
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // ==========================================================================
  // 2. SCROLL PROGRESS INDICATOR & GLOBAL BACKGROUND SEQUENCE RENDERER
  // ==========================================================================
  const scrollProgress = document.getElementById('scroll-progress');
  const mainNav = document.getElementById('main-nav');

  const bgFrameCount = 277;
  const bgImages = [];
  const bgSequenceCanvas = document.getElementById("global-bg-sequence-canvas");
  let renderBgSequenceFrame = () => {};

  // Preload all 277 JPEGs in the background
  for (let i = 1; i <= bgFrameCount; i++) {
    const img = new Image();
    const frameStr = String(i).padStart(3, '0');
    img.src = `bg-sequence/ezgif-frame-${frameStr}.jpg`;
    bgImages.push(img);
  }

  if (bgSequenceCanvas) {
    const ctx = bgSequenceCanvas.getContext("2d");

    renderBgSequenceFrame = (scrollPercent) => {
      const frameIndex = Math.min(bgFrameCount - 1, Math.floor(scrollPercent * bgFrameCount));
      const img = bgImages[frameIndex];
      
      if (img && img.complete) {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        if (imgWidth === 0 || imgHeight === 0) return;

        const canvasWidth = bgSequenceCanvas.width;
        const canvasHeight = bgSequenceCanvas.height;

        const imgRatio = imgWidth / imgHeight;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        // Cover fit for background sequence
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

    const resizeBgSequenceCanvas = () => {
      bgSequenceCanvas.width = window.innerWidth;
      bgSequenceCanvas.height = window.innerHeight;
      
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = totalScrollHeight > 0 ? (window.scrollY / totalScrollHeight) : 0;
      renderBgSequenceFrame(scrollPercent);
    };

    bgImages[0].onload = () => renderBgSequenceFrame(0);
    window.addEventListener('resize', resizeBgSequenceCanvas);
    resizeBgSequenceCanvas();
  }

  let lastScrollTime = Date.now();
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let targetScrollVelocity = 0;

  const handleScrollEvents = () => {
    // Scroll progress calculations
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = totalHeight > 0 ? (window.scrollY / totalHeight) : 0;
    
    if (scrollProgress) {
      scrollProgress.style.width = `${scrollPercent * 100}%`;
    }

    // Navigation toggle scrolled class
    if (window.scrollY > 50) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }

    // Render background sequence frame
    if (bgSequenceCanvas) {
      renderBgSequenceFrame(scrollPercent);
    }

    // Velocity calculations
    const now = Date.now();
    const dt = Math.max(1, now - lastScrollTime);
    const dy = window.scrollY - lastScrollY;
    targetScrollVelocity = dy / dt;
    lastScrollTime = now;
    lastScrollY = window.scrollY;
  };

  lenis.on('scroll', handleScrollEvents);

  // ==========================================================================
  // 2.5 GLOBAL HERO SCROLL IMAGE SEQUENCE PRELOADER & RENDERER
  // ==========================================================================
  const frameCount = 220;
  const images = new Array(frameCount); // Holds Image objects or null
  const sequence = { frame: 0 };
  const sequenceCanvas = document.getElementById("hero-sequence-canvas");
  let renderSequenceFrame = () => {};
  
  // Preload a small active window of 15 frames around the target frame index dynamically
  const loadWindow = (activeFrame) => {
    const bufferBefore = 5;
    const bufferAfter = 15;
    const start = Math.max(0, activeFrame - bufferBefore);
    const end = Math.min(frameCount - 1, activeFrame + bufferAfter);
    
    // Load frames in the active buffer window
    for (let i = start; i <= end; i++) {
      if (!images[i]) {
        const img = new Image();
        const frameStr = String(i + 1).padStart(3, '0');
        img.src = `hero-sequence/ezgif-frame-${frameStr}.jpg`;
        images[i] = img;
      }
    }
    
    // Unload frames outside a wider threshold window to free browser decoded RAM
    const thresholdBefore = 12;
    const thresholdAfter = 25;
    for (let i = 0; i < frameCount; i++) {
      if (i < activeFrame - thresholdBefore || i > activeFrame + thresholdAfter) {
        if (images[i]) {
          images[i].src = ""; // Clear src to release GPU memory
          images[i] = null;   // Remove references
        }
      }
    }
  };

  // Preload first 15 frames immediately on startup so landing view is ready
  for (let i = 0; i < 15; i++) {
    const img = new Image();
    const frameStr = String(i + 1).padStart(3, '0');
    img.src = `hero-sequence/ezgif-frame-${frameStr}.jpg`;
    images[i] = img;
  }

  if (sequenceCanvas) {
    const ctx = sequenceCanvas.getContext("2d");
    
    const drawCanvasImage = (img) => {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      if (imgWidth === 0 || imgHeight === 0) return;
      
      const canvasWidth = sequenceCanvas.width;
      const canvasHeight = sequenceCanvas.height;
      
      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      const isMobile = window.innerWidth <= 900;
      
      if (isMobile) {
        // Crop 20% horizontally from each side on mobile
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
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
      }
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    renderSequenceFrame = () => {
      const frameIndex = sequence.frame;
      loadWindow(frameIndex);
      
      const img = images[frameIndex];
      if (img && img.complete && img.naturalWidth > 0) {
        drawCanvasImage(img);
      } else {
        // Fallback: draw nearest loaded frame to prevent visual blank flashes
        let fallbackImg = null;
        for (let offset = 1; offset < 20; offset++) {
          const prevFrame = images[frameIndex - offset];
          if (prevFrame && prevFrame.complete && prevFrame.naturalWidth > 0) {
            fallbackImg = prevFrame;
            break;
          }
          const nextFrame = images[frameIndex + offset];
          if (nextFrame && nextFrame.complete && nextFrame.naturalWidth > 0) {
            fallbackImg = nextFrame;
            break;
          }
        }
        if (fallbackImg) {
          drawCanvasImage(fallbackImg);
        }
      }
    };

    const resizeSequenceCanvas = () => {
      sequenceCanvas.width = sequenceCanvas.clientWidth || window.innerWidth;
      sequenceCanvas.height = sequenceCanvas.clientHeight || window.innerHeight;
      renderSequenceFrame();
    };

    // Render first frame as soon as it is loaded
    if (images[0]) {
      images[0].onload = renderSequenceFrame;
    }
    window.addEventListener('resize', resizeSequenceCanvas);
    resizeSequenceCanvas();
  }

  // ==========================================================================
  // 3. RESPONSIVE MOTION WITH GSAP MATCHMEDIA
  // ==========================================================================
  let mm = gsap.matchMedia();

  // Desktop Animation Suite (width > 900px)
  mm.add("(min-width: 901px)", () => {
    
    // 3.1 Hero Entrance Animation
    const entryTl = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    gsap.set("#hero-scroll-node", { opacity: 0, y: 10 });
    gsap.set(".hero-sequence-wrapper", { opacity: 0, scale: 1.1 });
    gsap.set(".hero-container", { opacity: 0, y: 30 });
    entryTl.to(".hero-sequence-wrapper", { opacity: 1.0, scale: 1.0, duration: 2.2, ease: "power3.out" })
           .to(".hero-container", { opacity: 1, y: 0, duration: 1.2 }, "-=1.5")
           .to("#hero-scroll-node", { opacity: 1, y: 0, duration: 0.8 }, "-=1.0");

    // 3.1.5 Pinned Scroll Timeline (Desktop)
    const heroScrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 0.1,
        invalidateOnRefresh: true
      }
    });

    // 1. Frame sequence mapping
    heroScrollTl.to(sequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      onUpdate: renderSequenceFrame,
      duration: 1.0
    }, 0);

    // 2. Animate nav bar background and border to transparent
    heroScrollTl.to("#main-nav", {
      backgroundColor: "rgba(15, 23, 42, 0)",
      backdropFilter: "blur(0px)",
      webkitBackdropFilter: "blur(0px)",
      borderBottomColor: "rgba(255, 107, 0, 0)",
      duration: 0.3
    }, 0);

    // 3. Fade out scroll indicator immediately
    heroScrollTl.to("#hero-scroll-node", {
      y: 20,
      opacity: 0,
      ease: "power2.inOut",
      duration: 0.2
    }, 0);



    // 5. Restore nav bar background near the end (from 0.75 to 1.0)
    heroScrollTl.to("#main-nav", {
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(20px)",
      webkitBackdropFilter: "blur(20px)",
      borderBottomColor: "rgba(255, 107, 0, 0.08)",
      duration: 0.25
    }, 0.75);

    // 6. Subtle Parallax for hero sequence wrapper (Desktop)
    heroScrollTl.to(".hero-sequence-wrapper", {
      yPercent: 30,
      ease: "none",
      duration: 1.0
    }, 0);

    // 7. Scale down and fade out hero content container (Desktop)
    heroScrollTl.to(".hero-container", {
      scale: 0.95,
      opacity: 0,
      ease: "power1.inOut",
      duration: 0.5
    }, 0);





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

    // 3.9 Desktop Staggered Entrance Reveals
    gsap.from(".build-horizontal-track .project-card-wrapper", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#build",
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    gsap.from(".stack-grid .stack-card", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#stack",
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
  });

  // Mobile Animation Suite (width <= 900px)
  mm.add("(max-width: 900px)", () => {
    // 3.7 Mobile Hero Entrance (Simple load animation)
    const mobileTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    gsap.set(".hero-sequence-wrapper", { opacity: 0, scale: 1.08 });
    gsap.set("#hero-scroll-node", { opacity: 0 });
    mobileTl.to(".hero-sequence-wrapper", { opacity: 1.0, scale: 1.0, duration: 1.5, ease: "power2.out" })
            .to("#hero-scroll-node", { opacity: 1, duration: 0.6 }, "-=0.6");

    // 3.7.5 Pinned Scroll Timeline (Mobile)
    const heroScrollTlMobile = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 0.1,
        invalidateOnRefresh: true
      }
    });

    // 1. Frame sequence mapping (Mobile)
    heroScrollTlMobile.to(sequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      onUpdate: renderSequenceFrame,
      duration: 1.0
    }, 0);

    // 2. Hide Main Nav immediately on Mobile
    heroScrollTlMobile.to("#main-nav", {
      yPercent: -120,
      opacity: 0,
      ease: "power2.inOut",
      duration: 0.25
    }, 0);

    // 3. Hide Scroll Indicator on Mobile
    heroScrollTlMobile.to("#hero-scroll-node", {
      y: 20,
      opacity: 0,
      ease: "power2.inOut",
      duration: 0.2
    }, 0);



    // 5. Restore Main Nav near the end (Mobile)
    heroScrollTlMobile.to("#main-nav", {
      yPercent: 0,
      opacity: 1,
      ease: "power2.out",
      duration: 0.25
    }, 0.75);

    // 6. Scale down and fade out hero content container (Mobile)
    heroScrollTlMobile.to(".hero-container", {
      scale: 0.95,
      opacity: 0,
      ease: "power1.inOut",
      duration: 0.5
    }, 0);

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

    // Scroll-triggered staggered reveals for mobile sections
    // 1. What I Build cards
    gsap.from(".build-horizontal-track .project-card-wrapper", {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#build",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // 2. Neural Tunnel Rings (vertical segments)
    gsap.from(".tunnel-container .tunnel-ring", {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#neural-tunnel",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // 3. Avatar panels
    gsap.from(".avatar-text-column .avatar-text-panel", {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#avatar-story",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // 4. Destiny cards
    gsap.from(".destiny-cylinder .destiny-card", {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#destinies",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // 5. Stack Cards
    gsap.from(".stack-grid .stack-card", {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#stack",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });

  // ==========================================================================
  // 4. SHARED/GLOBAL SCROLL-TRIGGERED ACTIONS
  // ==========================================================================
  
  // 4.1 Ambient Background Color Shifting
  const bgTransitions = [
    { trigger: "#neural-tunnel", bg: "#FAF6F0", isDark: false },
    { trigger: "#build", bg: "#FCEEE3", isDark: false },
    { trigger: "#avatar-story", bg: "#FCE5E5", isDark: false },
    { trigger: "#destinies", bg: "#FAF0E6", isDark: false },
    { trigger: "#stack", bg: "#FAEFE5", isDark: false },
    { trigger: "#contact", bg: "#0B0A08", isDark: true }
  ];

  bgTransitions.forEach(trans => {
    ScrollTrigger.create({
      trigger: trans.trigger,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) {
          // gsap.to("body", { backgroundColor: trans.bg, duration: 0.8 });
          if (trans.isDark) {
            document.body.classList.add("dark-active");
          } else {
            document.body.classList.remove("dark-active");
          }
        }
      },
      onLeaveBack: () => {
        const currentIndex = bgTransitions.indexOf(trans);
        if (currentIndex === 0) {
          // gsap.to("body", { backgroundColor: "#FAF6F0", duration: 0.8 });
          document.body.classList.remove("dark-active");
        } else {
          const prev = bgTransitions[currentIndex - 1];
          // gsap.to("body", { backgroundColor: prev.bg, duration: 0.8 });
          if (prev.isDark) {
            document.body.classList.add("dark-active");
          } else {
            document.body.classList.remove("dark-active");
          }
        }
      }
    });
  });

  // 4.1.5 Ambient Background Gradient Shifting (Scroll-Linked)
  const bgTl = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1
    }
  });

  bgTl.to("body", {
    "--bg-grad-1": "#1e1b4b",
    "--bg-grad-2": "#311042",
    "--bg-grad-3": "#181829",
    duration: 1
  })
  .to("body", {
    "--bg-grad-1": "#311042",
    "--bg-grad-2": "#1e1b4b",
    "--bg-grad-3": "#0f172a",
    duration: 1
  })
  .to("body", {
    "--bg-grad-1": "#1e1b4b",
    "--bg-grad-2": "#083344",
    "--bg-grad-3": "#0f172a",
    duration: 1
  })
  .to("body", {
    "--bg-grad-1": "#0f172a",
    "--bg-grad-2": "#020617",
    "--bg-grad-3": "#000000",
    duration: 1
  });

  // 4.2 Contact Section Slide-Up Reveal
  gsap.from(["#contact-info-node", "#contact-form-node"], {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: "#contact",
      start: "top 80%",
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
