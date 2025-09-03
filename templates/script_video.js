// Video Wallpaper Script for {wallpaper_id}
document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('video');
    
    // Handle video playback
    if (video) {
        video.play().catch(error => {
            console.log("Video autoplay failed:", error);
        });
        
        // Add click to play/pause functionality
        video.addEventListener('click', function() {
            if (video.paused) {
                video.play().catch(error => {
                    console.error("Failed to play video:", error);
                });
            } else {
                video.pause();
            }
        });
        
        // Handle video loading errors
        video.addEventListener('error', function(e) {
            console.error("Video loading error:", e);
        });
    } else {
        console.error("Video element not found");
    }
    
    // Handle audio playback if present
    const audio = document.querySelector('audio');
    if (audio) {
        audio.play().catch(error => {
            console.log("Audio autoplay failed:", error);
        });
        
        // Handle audio loading errors
        audio.addEventListener('error', function(e) {
            console.error("Audio loading error:", e);
        });
    }
    
    // Handle window resize
    function resizeVideo() {
        if (!video) return;
        
        const windowRatio = window.innerWidth / window.innerHeight;
        const videoRatio = video.videoWidth / video.videoHeight;
        
        if (windowRatio > videoRatio) {
            video.style.width = '100%';
            video.style.height = 'auto';
        } else {
            video.style.width = 'auto';
            video.style.height = '100%';
        }
    }
    
    window.addEventListener('resize', resizeVideo);
    if (video) {
        video.addEventListener('loadeddata', resizeVideo);
    }
    
    console.log("Video wallpaper {wallpaper_id} initialized");
});