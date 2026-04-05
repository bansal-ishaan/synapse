// src/youtube/text/commentShield.js
// Advanced interactive comment toggle for YouTube, integrated directly into the metadata row.

window.initCommentShield = function() {
    let mode = 'hide';

    // Icons
    const ICON_VISIBLE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:block;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
    const ICON_HIDDEN = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:block;"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;

    function injectGlobalStyles() {
        if (document.getElementById('synapse-comment-shield-styles')) return;
        const style = document.createElement('style');
        style.id = 'synapse-comment-shield-styles';
        style.innerHTML = `
            ytd-comments { 
                transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                transform-origin: top !important;
            }
            .synapse-yt-hide ytd-comments { 
                opacity: 0 !important; 
                transform: translateY(-10px) scaleY(0.98) !important;
                pointer-events: none !important;
                position: absolute !important;
                visibility: hidden !important;
                overflow: hidden !important;
                height: 0 !important;
            }
            #synapse-comment-toggle {
                cursor: pointer;
                border: none;
                border-radius: 99px;
                padding: 0 12px;
                display: inline-flex !important;
                align-items: center;
                gap: 8px;
                background: var(--yt-spec-badge-chip-background, #f2f2f2);
                color: var(--yt-spec-text-primary, #0f0f0f);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
                margin-left: 12px !important;
                height: 36px !important;
                box-sizing: border-box;
                font-family: inherit;
                vertical-align: middle;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
            }
            #synapse-comment-toggle:hover {
                background: var(--yt-spec-button-chip-background-hover, #e5e5e5);
            }
            .synapse-toggle-pill {
                width: 28px;
                height: 16px;
                background: var(--yt-spec-text-secondary, #606060);
                opacity: 0.6;
                border-radius: 10px;
                position: relative;
                transition: background 0.25s ease;
            }
            .synapse-toggle-pill::after {
                content: "";
                position: absolute;
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                top: 2px;
                left: 2px;
                transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 1px 3px rgba(0,0,0,0.25);
            }
            [data-synapse-active="true"] .synapse-toggle-pill {
                background: #3ea6ff; /* YT Action Blue */
            }
            [data-synapse-active="true"] .synapse-toggle-pill::after {
                transform: translateX(12px);
            }
            .synapse-toggle-label {
                font-size: 13px;
                font-weight: 600;
                color: #475569;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            [data-synapse-active="true"] .synapse-toggle-label {
                color: #3b82f6;
            }
        `;
        document.head.appendChild(style);
    }

    function updateDOMState() {
        document.body.classList.toggle('synapse-yt-hide', mode === 'hide');
        const toggle = document.getElementById('synapse-comment-toggle');
        if (toggle) {
            const isActive = mode === 'show';
            toggle.setAttribute('data-synapse-active', isActive);
            toggle.setAttribute('aria-pressed', isActive);
            toggle.title = isActive ? 'Hide Comments' : 'Show Comments';
            
            const label = toggle.querySelector('.synapse-toggle-label');
            if (label) {
                label.innerHTML = `${isActive ? ICON_VISIBLE : ICON_HIDDEN} <span style="margin-left:2px;">Comments</span>`;
            }
        }
    }

    async function saveState() {
        if (chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({ synapse_yt_comments: mode });
        }
    }

    function injectToggle() {
        // Target the main owner flex container to force inline behavior
        const owner = document.querySelector('ytd-watch-metadata #owner');
        if (!owner || document.getElementById('synapse-comment-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'synapse-comment-toggle';
        toggle.setAttribute('role', 'switch');
        toggle.style.alignSelf = 'center'; // Enforce vertical centering in flex parent
        toggle.innerHTML = `
            <div class="synapse-toggle-label"></div>
            <div class="synapse-toggle-pill"></div>
        `;

        toggle.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            mode = mode === 'hide' ? 'show' : 'hide';
            updateDOMState();
            saveState();
        };

        owner.appendChild(toggle); // Appending to the end of the #owner flex row
        updateDOMState();
    }

    return {
        init: async () => {
            injectGlobalStyles();
            if (chrome.storage && chrome.storage.local) {
                const res = await chrome.storage.local.get('synapse_yt_comments');
                if (res?.synapse_yt_comments) mode = res.synapse_yt_comments;
            }
            // Avoid flicker
            document.body.classList.toggle('synapse-yt-hide', mode === 'hide');
            
            const obs = new MutationObserver(() => {
                injectToggle();
            });
            obs.observe(document.body, { childList: true, subtree: true });

            document.addEventListener('yt-navigate-finish', () => injectToggle());
            injectToggle();
        }
    };
};