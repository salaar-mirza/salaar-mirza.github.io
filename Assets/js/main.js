/*
    ================================================================================
    |   Main JavaScript File (main.js) - FIXED VERSION                             |
    |                                                                              |
    |   Fixes applied:                                                             |
    |   1. Solved "Floating Image" bug by swapping image Sources (src) at the end  |
    |      of the animation. This ensures the big image is physically inside the   |
    |      scrollable Hero section, not the sticky Navbar.                         |
    |   2. Solved "Hidden Logo" bug because the small logo ends up physically      |
    |      inside the Navbar (z-index 1000), so it sits on top correctly.          |
    ================================================================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES ---
    const navLogo = document.getElementById('nav-logo');
    const profilePic = document.getElementById('profile-pic');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    const projectGrid = document.querySelector('.project-grid');

    // Track state
    let isAnimating = false;
    let isDarkTheme = false; // We only need to track the theme color state now

    // Theme definitions
    const lightTheme = {
        '--bg-primary': '#f4f4f4',
        '--bg-secondary': '#ffffff',
        '--bg-card': '#ffffff',
        '--text-primary': '#111111',
        '--text-secondary': '#555555',
        '--text-muted': '#777777',
        '--border-primary': '#e0e0e0',
        '--border-secondary': '#cccccc',
    };

    const darkTheme = {
        '--bg-primary': '#050505',
        '--bg-secondary': '#111',
        '--bg-card': '#1a1a1a',
        '--text-primary': '#ffffff',
        '--text-secondary': '#aaa',
        '--text-muted': '#888',
        '--border-primary': '#222',
        '--border-secondary': '#333',
    };

    // --- PERSISTENCE & SYSTEM PREFERENCE ---
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply Dark Theme if:
    // 1. User previously saved 'dark'
    // 2. OR User has no saved preference, but their Device is set to Dark Mode
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        isDarkTheme = true;
        // Apply Dark Theme Variables Immediately
        for (const [key, value] of Object.entries(darkTheme)) {
            document.body.style.setProperty(key, value);
        }
        // If on Main Page, swap images immediately to match Dark Mode state
        if (navLogo && profilePic) {
            const tempSrc = navLogo.src;
            navLogo.src = profilePic.src;
            profilePic.src = tempSrc;

            // Fix z-index for the swapped state so scrolling works immediately
            gsap.set(navLogo, { zIndex: 2 });
            gsap.set(profilePic, { zIndex: 1001 });
        }
    }

    /* ------------------------------------------------------------------------ */
    /* --- The Fixed Swap Animation Logic --- */
    /* ------------------------------------------------------------------------ */
    const playSwapAnimation = () => {
        if (isAnimating) return;
        isAnimating = true;

        // 1. Calculate positions dynamically (in case window was resized)
        const logoState = navLogo.getBoundingClientRect();
        const picState = profilePic.getBoundingClientRect();

        // Calculate the distance to move the Nav Logo to the Hero position
        const xMove = (picState.left + picState.width / 2) - (logoState.left + logoState.width / 2);
        const yMove = (picState.top + picState.height / 2) - (logoState.top + logoState.height / 2);

        // Calculate scaling
        const scaleToHero = picState.width / logoState.width;
        const scaleToNav = logoState.width / picState.width;

        // Determine which theme we are going TO
        const targetTheme = !isDarkTheme ? darkTheme : lightTheme;

        // 2. The Animation Timeline
        const tl = gsap.timeline({
            onComplete: () => {
                // --- THE MAGIC FIX ---
                // Instead of leaving the images in the wrong containers, we swap their contents!
                const tempSrc = navLogo.src;
                navLogo.src = profilePic.src;
                profilePic.src = tempSrc;

                // Reset the physical transforms. 
                // Now "navLogo" (in the navbar) holds the small image, 
                // and "profilePic" (in the hero) holds the big image.
                gsap.set([navLogo, profilePic], { clearProps: "all" });

                // Update state
                isDarkTheme = !isDarkTheme;
                localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light'); // Save preference
                isAnimating = false;
            }
        });

        // 3. Animate Body Colors
        tl.to('body', { ...targetTheme, duration: 1.5, ease: 'power2.inOut' }, 0);

        // 4. Animate Images
        // Move Element in Navbar -> To Hero Position
        tl.to(navLogo, {
            x: xMove,
            y: yMove,
            scale: scaleToHero,
            rotation: 720,
            duration: 1.5,
            ease: 'back.inOut(1.5)'
        }, 0);

        // Move Element in Hero -> To Navbar Position
        tl.to(profilePic, {
            x: -xMove,
            y: -yMove,
            scale: scaleToNav,
            rotation: -720,
            duration: 1.5,
            ease: 'back.inOut(1.5)'
        }, 0);
    };

    // Trigger Listeners
    const triggerAnimation = (e) => {
        e.preventDefault();
        playSwapAnimation();
    };

    if(navLogo) navLogo.addEventListener('click', triggerAnimation);
    if(profilePic) profilePic.addEventListener('click', triggerAnimation);

    /* ------------------------------------------------------------------------ */
    /* --- Hamburger Menu Logic --- */
    /* ------------------------------------------------------------------------ */
    if(hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-links li a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    /* ------------------------------------------------------------------------ */
    /* --- Project Layout Toggle Logic --- */
    /* ------------------------------------------------------------------------ */
    if (gridViewBtn && listViewBtn && projectGrid) {
        gridViewBtn.addEventListener('click', () => {
            projectGrid.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        });

        listViewBtn.addEventListener('click', () => {
            projectGrid.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        });
    }

    /* ------------------------------------------------------------------------ */
    /* --- Logo Aura Animation (to encourage clicking) --- */
    /* ------------------------------------------------------------------------ */
    const logoAura = document.querySelector('.logo-aura');
    if (logoAura) {
        // Create a repeating "pulse" effect
        gsap.timeline({ repeat: -1, repeatDelay: 1.5 })
            .to(logoAura, {
                scale: 1.4,
                opacity: 1,
                duration: 0.7,
                ease: 'power1.out'
            })
            .to(logoAura, {
                scale: 1.8,
                opacity: 0,
                duration: 0.7,
                ease: 'power1.in'
            });
    }
});