document.addEventListener('DOMContentLoaded', () => {
    const navLogo = document.getElementById('nav-logo');
    const profilePic = document.getElementById('profile-pic');
 
    let isAnimating = false;
    let isSwapped = false; // State to track if images are swapped
    let deltas = {}; // Object to store calculated positions
 
    // 1. Function to calculate the positions.
    // We run this on load and on window resize to stay responsive.
    const calculatePositions = () => {
        // Temporarily clear transforms to get original positions
        gsap.set([navLogo, profilePic], { clearProps: "transform" });
 
        const logoState = navLogo.getBoundingClientRect();
        const picState = profilePic.getBoundingClientRect();
 
        deltas.logo = {
            // Calculate the distance between the centers of the elements
            x: (picState.left + picState.width / 2) - (logoState.left + logoState.width / 2),
            y: (picState.top + picState.height / 2) - (logoState.top + logoState.height / 2),
            scale: picState.width / logoState.width
        };
 
        deltas.pic = {
            // Calculate the distance between the centers of the elements
            x: (logoState.left + logoState.width / 2)- (picState.left + picState.width / 2),
            y: (logoState.top + logoState.height / 2) - (picState.top + picState.height / 2),
            scale: logoState.width / picState.width
        };

        // If they are already swapped, re-apply the transform instantly
        if (isSwapped) {
            gsap.set(navLogo, { x: deltas.logo.x, y: deltas.logo.y, scale: deltas.logo.scale });
            gsap.set(profilePic, { x: deltas.pic.x, y: deltas.pic.y, scale: deltas.pic.scale });
        }
    };
 
    // Calculate initial positions on page load
    calculatePositions();
 
    // Recalculate on window resize for responsiveness
    window.addEventListener('resize', calculatePositions);
 
    const playSwapAnimation = () => {
        if (isAnimating) return;
        isAnimating = true;
 
        // Determine the target state based on the isSwapped flag
        const logoTarget = !isSwapped ? deltas.logo : { x: 0, y: 0, scale: 1 };
        const picTarget = !isSwapped ? deltas.pic : { x: 0, y: 0, scale: 1 };
 
        // Add rotation only for the forward animation
        logoTarget.rotation = !isSwapped ? 720 : 0;
        picTarget.rotation = !isSwapped ? -720 : 0;
 
        gsap.timeline({ onComplete: () => { isAnimating = false; isSwapped = !isSwapped; } })
            .to(navLogo, { ...logoTarget, duration: 1.5, ease: 'back.inOut(1.5)' }, 0)
            .to(profilePic, { ...picTarget, duration: 1.5, ease: 'back.inOut(1.5)' }, 0);
    };
 
    // 2. Add click listeners to BOTH elements
    const triggerAnimation = (e) => {
        e.preventDefault(); // Prevents navigation for the logo's <a> tag
        playSwapAnimation();
    };
 
    navLogo.addEventListener('click', triggerAnimation);
    profilePic.addEventListener('click', triggerAnimation);
});