// youtube.js – Synapse Main Controller for YouTube
// Focus: Comments Hidden toggle injected inline. Other features removed as requested.

console.log('Synapse: YouTube module loaded.');

// Focus Mode state isn't strictly needed for YT comment shield logic, but the script runs.
// On YouTube pages, Zen Mode and Simplify buttons are disabled.
window.commentShield = null;

window.initModules = function() {
    if (window.commentShield) return; // Already initialized
    window.commentShield = window.initCommentShield();
};

async function activateSynapseYouTube() {
    // Left empty for compatibility if popup sends "activate_youtube_mode", 
    // although Focus Mode logic takes over most UI flows now.
    // The comment shield self-initializes below anyway.
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "activate_youtube_mode") {
        activateSynapseYouTube();
        sendResponse({ success: true });
    }
});

// Self-initialize the comment shield inline toggle
window.initModules();
if (window.commentShield) {
    window.commentShield.init();
}
