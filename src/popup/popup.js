document.addEventListener('DOMContentLoaded', async () => {
    const tabs = document.querySelectorAll('.tab');
    const infoEl = document.getElementById('mode-info');
    const actionBtn = document.getElementById('action-btn');
    const selector = document.querySelector('.selector');

    let currentMode = 'text';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isYouTube = tab.url?.includes('youtube.com');

    function updateUI() {
        if (isYouTube) {
            selector.style.display = 'none';
            infoEl.textContent = 'A small comment toggle appears directly on YouTube video pages.';
            actionBtn.textContent = 'Use inline toggle';
            actionBtn.disabled = true;
            actionBtn.title = 'Toggle comments from the YouTube page';
            return;
        }

        selector.style.display = 'flex';
        actionBtn.disabled = false;
        actionBtn.title = '';

        if (currentMode === 'text') {
            infoEl.textContent = 'Simplifies web content for better reading and focus.';
            actionBtn.textContent = 'Process This Page';
        } else if (currentMode === 'vision') {
            infoEl.textContent = 'Analyzes visuals to provide clear, structured feedback.';
            actionBtn.textContent = 'Capture Screen';
        }
    }

    tabs.forEach(t => {
        t.addEventListener('click', () => {
            tabs.forEach(bt => bt.classList.remove('active'));
            t.classList.add('active');
            currentMode = t.dataset.mode;
            updateUI();
        });
    });

    actionBtn.addEventListener('click', () => {
        if (actionBtn.disabled) return;
        actionBtn.textContent = 'Launching...';
        actionBtn.disabled = true;

        if (currentMode === 'text') {
            chrome.runtime.sendMessage({ action: 'start_article_analysis', tabId: tab.id });
            window.close();
        } else if (currentMode === 'vision') {
            chrome.tabs.sendMessage(tab.id, { action: 'start_vision_analysis' }, () => {
                window.close();
            });
        }
    });

    updateUI();
});
