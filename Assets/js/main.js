/*
    ================================================================================
    |                                                                              |
    |   Main JavaScript File (main.js)                                             |
    |                                                                              |
    |   This file handles the interactive animations for the portfolio, primarily  |
    |   the image-swapping effect between the navigation logo and the hero         |
    |   profile picture. It uses the GSAP library for smooth, high-performance     |
    |   animations.                                                                |
    |                                                                              |
    |   Key Logic:                                                                 |
    |   1. State Calculation: On load and resize, it calculates the exact          |
    |      position, scale, and rotation needed to move each image to the other's  |
    |      spot. This is the core of the "FLIP" animation technique.               |
    |   2. Animation Trigger: A click on either image triggers the animation.      |
    |   3. State Tracking: A boolean flag `isSwapped` tracks the current state     |
    |      (original or swapped) to ensure the animation can be reversed.          |
    |                                                                              |
    ================================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // Get references to the two images that will be swapped.
    const navLogo = document.getElementById('nav-logo');
    const profilePic = document.getElementById('profile-pic');

    // State variables to manage the animation.
    let isAnimating = false; // Prevents spam-clicking from breaking the animation.
    let isSwapped = false;   // Tracks if the images are in their original or swapped positions.
    let deltas = {};         // An object to store the calculated transform values (differences in position/scale).

    /*
        ----------------------------------------------------------------------------
        |   calculatePositions()                                                   |
        ----------------------------------------------------------------------------
        |   This is the most critical function for the responsive animation. It    |
        |   measures the starting position and size of both images and calculates  |
        |   the difference (`delta`) required to move one to the other's spot.     |
        |                                                                          |
        |   This function is called on page load and whenever the window is        |
        |   resized, ensuring the animation works correctly even if the layout     |
        |   changes.                                                               |
        ----------------------------------------------------------------------------
    */
    const calculatePositions = () => {
        // Temporarily remove any existing transforms to get the "true" original positions.
        gsap.set([navLogo, profilePic], { clearProps: "transform" });

        const logoState = navLogo.getBoundingClientRect();
        const picState = profilePic.getBoundingClientRect();

        // Calculate the difference in position (x, y) and scale for the logo.
        deltas.logo = {
            x: (picState.left + picState.width / 2) - (logoState.left + logoState.width / 2),
            y: (picState.top + picState.height / 2) - (logoState.top + logoState.height / 2),
            scale: picState.width / logoState.width
        };

        // Calculate the difference in position (x, y) and scale for the profile picture.
        deltas.pic = {
            x: (logoState.left + logoState.width / 2) - (picState.left + picState.width / 2),
            y: (logoState.top + logoState.height / 2) - (picState.top + picState.height / 2),
            scale: logoState.width / picState.width
        };

        // If the images are already swapped when the window is resized,
        // instantly apply the new transform values to maintain the swapped state.
        if (isSwapped) {
            gsap.set(navLogo, { x: deltas.logo.x, y: deltas.logo.y, scale: deltas.logo.scale });
            gsap.set(profilePic, { x: deltas.pic.x, y: deltas.pic.y, scale: deltas.pic.scale });
        }
    };

    // Run the calculation as soon as the page is loaded.
    calculatePositions();

    // Add a listener to recalculate positions whenever the window is resized.
    window.addEventListener('resize', calculatePositions);

    /*
        ----------------------------------------------------------------------------
        |   playSwapAnimation()                                                    |
        ----------------------------------------------------------------------------
        |   This function executes the GSAP animation timeline. It checks the      |
        |   `isSwapped` flag to determine whether to play the forward animation    |
        |   (move to swapped positions) or the reverse animation (return to        |
        |   original positions).                                                   |
        ----------------------------------------------------------------------------
    */
    const playSwapAnimation = () => {
        if (isAnimating) return; // Exit if an animation is already in progress.
        isAnimating = true;

        // Determine the target transforms. If not swapped, use the calculated deltas.
        // If already swapped, animate back to the origin (0, 0, 1).
        const logoTarget = !isSwapped ? deltas.logo : { x: 0, y: 0, scale: 1 };
        const picTarget = !isSwapped ? deltas.pic : { x: 0, y: 0, scale: 1 };

        // Add a fun rotation effect, but only for the forward animation.
        logoTarget.rotation = !isSwapped ? 720 : 0;
        picTarget.rotation = !isSwapped ? -720 : 0;

        // Use a GSAP timeline for synchronized animation.
        gsap.timeline({
            onComplete: () => {
                isAnimating = false; // Re-enable clicking.
                isSwapped = !isSwapped; // Toggle the state flag.
            }
        })
        // Animate both images at the same time (position 0 on the timeline).
        .to(navLogo, { ...logoTarget, duration: 1.5, ease: 'back.inOut(1.5)' }, 0)
        .to(profilePic, { ...picTarget, duration: 1.5, ease: 'back.inOut(1.5)' }, 0);
    };

    // A single trigger function to handle clicks.
    const triggerAnimation = (e) => {
        e.preventDefault(); // Prevents the browser from following the logo's href.
        playSwapAnimation();
    };

    // Attach the click event listener to both images.
    navLogo.addEventListener('click', triggerAnimation);
    profilePic.addEventListener('click', triggerAnimation);
});