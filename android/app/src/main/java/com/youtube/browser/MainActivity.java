package com.youtube.browser;

import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private boolean shortsBlockerEnabled = true;

    // Allowed domains
    private static final List<String> ALLOWED_HOSTS = Arrays.asList(
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "accounts.google.com",
        "myaccount.google.com",
        "google.com"
    );

    // JavaScript to block Shorts
    private static final String SHORTS_BLOCKER_JS = 
        "(function(){" +
        "if(window.shortsBlockerInitialized)return;" +
        "window.shortsBlockerInitialized=true;" +
        "var c='ytd-rich-shelf-renderer[is-shorts],ytd-reel-shelf-renderer,ytd-rich-section-renderer[is-shorts],ytd-reel-video-renderer,ytd-video-renderer[is-short],ytd-compact-video-renderer[is-short],ytd-shorts,ytd-mini-guide-entry-renderer[title=\\'Shorts\\'],ytd-guide-entry-renderer[title=\\'Shorts\\'],a[title=\\'Shorts\\'],a[href*=\\'/shorts/\\']{display:none!important;visibility:hidden!important}';" +
        "var s=document.createElement('style');" +
        "s.id='shorts-blocker-style';" +
        "s.textContent=c;" +
        "document.documentElement.appendChild(s);" +
        "function r(){" +
        "document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts],ytd-reel-shelf-renderer,ytd-rich-section-renderer[is-shorts],ytd-reel-video-renderer,ytd-video-renderer[is-short],ytd-compact-video-renderer[is-short],ytd-shorts').forEach(function(e){e.style.display='none'});" +
        "document.querySelectorAll('a[href*=\\\"/shorts/\\\"]').forEach(function(l){var x=l.closest('ytd-video-renderer,ytd-compact-video-renderer');if(x)x.style.display='none'});" +
        "}" +
        "r();" +
        "setInterval(r,1000);" +
        "new MutationObserver(r).observe(document.documentElement,{childList:true,subtree:true});" +
        "if(location.pathname.startsWith('/shorts/')){location.href='https://www.youtube.com';}" +
        "var o=history.pushState;" +
        "history.pushState=function(){if(arguments[2]&&arguments[2].includes('/shorts/')){location.href='https://www.youtube.com';return;}return o.apply(this,arguments);};" +
        "console.log('[Shorts Blocker] Active');" +
        "})();";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        swipeRefreshLayout = findViewById(R.id.swipeRefresh);
        webView = findViewById(R.id.webView);

        setupWebView();
        setupSwipeRefresh();

        webView.loadUrl("https://www.youtube.com");
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString("Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36");

        webView.setWebChromeClient(new WebChromeClient());
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                String host = request.getUrl().getHost();

                // Check if URL is allowed
                boolean allowed = false;
                for (String allowedHost : ALLOWED_HOSTS) {
                    if (host != null && (host.equals(allowedHost) || host.endsWith("." + allowedHost))) {
                        allowed = true;
                        break;
                    }
                }

                if (!allowed) {
                    Toast.makeText(MainActivity.this, "External links blocked", Toast.LENGTH_SHORT).show();
                    return true; // Block the navigation
                }

                // Block Shorts URLs
                if (shortsBlockerEnabled && url.contains("/shorts/")) {
                    Toast.makeText(MainActivity.this, "Shorts blocked", Toast.LENGTH_SHORT).show();
                    view.loadUrl("https://www.youtube.com");
                    return true;
                }

                return false; // Allow navigation
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefreshLayout.setRefreshing(false);
                
                // Inject Shorts blocker
                if (shortsBlockerEnabled) {
                    view.evaluateJavascript(SHORTS_BLOCKER_JS, null);
                }
            }
        });
    }

    private void setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener(() -> {
            webView.reload();
        });
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    public void toggleShortsBlocker(boolean enabled) {
        shortsBlockerEnabled = enabled;
        Toast.makeText(this, enabled ? "Shorts Blocker ON" : "Shorts Blocker OFF", Toast.LENGTH_SHORT).show();
        webView.reload();
    }
}
