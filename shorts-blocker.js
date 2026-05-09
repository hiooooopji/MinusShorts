// YouTube Shorts Blocker - Content Script
// Injected into YouTube pages to hide Shorts recommendations

(function() {
  'use strict';
  
  // Check if already initialized
  if (window.shortsBlockerInitialized) return;
  window.shortsBlockerInitialized = true;
  
  console.log('[Shorts Blocker] Initialized');
  
  // CSS to hide Shorts elements
  const shortsBlockerCSS = `
    /* Hide Shorts shelf on homepage */
    ytd-rich-shelf-renderer[is-shorts],
    ytd-rich-shelf-renderer[is-shorts] *,
    ytd-reel-shelf-renderer,
    ytd-reel-shelf-renderer *,
    ytd-rich-section-renderer[is-shorts],
    ytd-rich-section-renderer[is-shorts] * {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      overflow: hidden !important;
    }
    
    /* Hide Shorts tab in navigation */
    ytd-mini-guide-entry-renderer[title="Shorts"],
    ytd-guide-entry-renderer[title="Shorts"],
    tp-yt-paper-tab[aria-label="Shorts"],
    a[title="Shorts"],
    a[href*="/shorts/"] {
      display: none !important;
    }
    
    /* Hide Shorts in search results */
    ytd-video-renderer[is-short],
    ytd-video-renderer a[href*="/shorts/"],
    ytd-reel-video-renderer,
    ytd-reel-video-renderer * {
      display: none !important;
    }
    
    /* Hide Shorts section in sidebar recommendations */
    ytd-compact-video-renderer[is-short],
    ytd-compact-video-renderer a[href*="/shorts/"] {
      display: none !important;
    }
    
    /* Hide Shorts player if somehow navigated there */
    ytd-shorts,
    ytd-shorts * {
      display: none !important;
    }
    
    /* Hide Shorts banner/buttons */
    [aria-label*="Shorts" i],
    [title*="Shorts" i] {
      display: none !important;
    }
    
    /* Hide mobile Shorts shelf */
    ytd-browse[page-subtype="home"] ytd-rich-section-renderer,
    ytd-browse[page-subtype="home"] ytd-reel-shelf-renderer {
      display: none !important;
    }
  `;
  
  // Inject CSS
  function injectCSS() {
    let style = document.getElementById('shorts-blocker-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'shorts-blocker-style';
      style.textContent = shortsBlockerCSS;
      document.documentElement.appendChild(style);
      console.log('[Shorts Blocker] CSS injected');
    }
  }
  
  // Remove Shorts elements dynamically
  function removeShortsElements() {
    // Shorts shelves
    const selectors = [
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-reel-shelf-renderer',
      'ytd-rich-section-renderer[is-shorts]',
      'ytd-reel-video-renderer',
      'ytd-video-renderer[is-short]',
      'ytd-compact-video-renderer[is-short]',
      'ytd-shorts'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el && el.style.display !== 'none') {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          console.log('[Shorts Blocker] Hidden element:', selector);
        }
      });
    });
    
    // Hide Shorts links in search results and sidebar
    document.querySelectorAll('a[href*="/shorts/"]').forEach(link => {
      const videoRenderer = link.closest('ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer');
      if (videoRenderer && videoRenderer.style.display !== 'none') {
        videoRenderer.style.display = 'none';
      }
    });
  }
  
  // Block navigation to Shorts URLs
  function blockShortsNavigation() {
    // Override history methods to intercept /shorts/ navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      const url = args[2];
      if (url && typeof url === 'string' && url.includes('/shorts/')) {
        console.log('[Shorts Blocker] Blocked navigation to:', url);
        window.location.href = 'https://www.youtube.com';
        return;
      }
      return originalPushState.apply(this, args);
    };
    
    history.replaceState = function(...args) {
      const url = args[2];
      if (url && typeof url === 'string' && url.includes('/shorts/')) {
        console.log('[Shorts Blocker] Blocked replace navigation to:', url);
        window.location.href = 'https://www.youtube.com';
        return;
      }
      return originalReplaceState.apply(this, args);
    };
    
    // Intercept clicks on Shorts links
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a[href*="/shorts/"]');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Shorts Blocker] Blocked click on Shorts link:', target.href);
        window.location.href = 'https://www.youtube.com';
        return false;
      }
    }, true);
  }
  
  // Watch for dynamically added content
  function observeChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldClean = true;
        }
      });
      if (shouldClean) {
        removeShortsElements();
      }
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    
    console.log('[Shorts Blocker] MutationObserver started');
  }
  
  // Redirect if on Shorts page
  function checkAndRedirect() {
    if (window.location.pathname.startsWith('/shorts/')) {
      console.log('[Shorts Blocker] Redirecting from Shorts page');
      window.location.href = 'https://www.youtube.com';
    }
  }
  
  // Initialize
  function init() {
    injectCSS();
    removeShortsElements();
    blockShortsNavigation();
    observeChanges();
    checkAndRedirect();
    
    // Periodic cleanup
    setInterval(removeShortsElements, 1000);
    
    console.log('[Shorts Blocker] Active - Shorts are blocked');
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also run on navigation (SPA behavior)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('[Shorts Blocker] URL changed:', url);
      setTimeout(() => {
        checkAndRedirect();
        removeShortsElements();
        injectCSS();
      }, 100);
    }
  }).observe(document, { subtree: true, childList: true });
  
})();
