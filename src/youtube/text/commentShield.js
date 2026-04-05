// src/youtube/text/commentShield.js
// Repositions the comment toggle between the channel info and the action buttons for a cleaner integration.

window.initCommentShield = function() {
    let mode = 'hide';

    function applyStyle() {
        const style = document.getElementById('synapse-comment-shield-style') || document.createElement('style');
        style.id = 'synapse-comment-shield-style';
        style.innerHTML = mode === 'hide' ? 'ytd-comments { display: none !important; }' : '';
        if (!style.parentElement) document.head.appendChild(style);
    }

    function injectToggle() {
        if (document.getElementById('synapse-inline-comment-toggle')) return;
        
        // Targeted placement: In the watch metadata top row, between owner info and action buttons
        const metadata = document.querySelector('ytd-watch-metadata #top-row');
        const owner = metadata?.querySelector('#owner');
        if (!owner) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'synapse-inline-comment-toggle';
        toggleBtn.style.cssText = `
            background: #f8fafc; border: 1px solid rgba(148, 163, 184, 0.35);
            border-radius: 999px; padding: 6px 12px; color: #475569;
            font-family: inherit; font-size: 12px; font-weight: 700;
            cursor: pointer; margin-left: 12px; display: inline-flex; align-items: center; gap: 8px;
            transition: 0.18s ease-in-out; vertical-align: middle;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
        `;
        
        function updateToggleState() {
            const status = mode === 'hide'
                ? '<span style="padding: 0 8px; border-radius: 999px; background: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;">Hidden</span>'
                : '<span style="padding: 0 8px; border-radius: 999px; background: #dcfce7; color: #166534; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;">Visible</span>';
            toggleBtn.innerHTML = `💬 Comments ${status}`;
            applyStyle();
            
            if (mode === 'hide') {
                toggleBtn.style.background = '#f8fafc';
                toggleBtn.style.borderColor = 'rgba(148, 163, 184, 0.35)';
                toggleBtn.style.color = '#475569';
            } else {
                toggleBtn.style.background = '#ecfdf5';
                toggleBtn.style.borderColor = '#bbf7d0';
                toggleBtn.style.color = '#166534';
            }
        }

        toggleBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            mode = mode === 'hide' ? 'show' : 'hide';
            updateToggleState();
            if (window.saveState) window.saveState();
        };

        updateToggleState();
        owner.after(toggleBtn);
    }

    return {
        init: async () => {
            if (window.loadState) await window.loadState();
            applyStyle();
            
            const obs = new MutationObserver(() => {
                applyStyle();
                injectToggle();
            });
            obs.observe(document.body, { childList: true, subtree: true });

            document.addEventListener('yt-navigate-finish', () => { injectToggle(); });
        },
        setMode: (m) => {
            mode = m;
            applyStyle();
        }
    };
};