function addClearButton(searchBar) {
    if (searchBar && !searchBar.nextElementSibling?.classList.contains('lse-clear-button')) {
        const clearButton = document.createElement('button');
        clearButton.innerHTML = '&times;';
        clearButton.className = 'lse-clear-button';
        clearButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Clear the input value
            searchBar.value = '';

            // Trigger various events to ensure LinkedIn updates its internal state
            const events = ['input', 'change', 'keydown', 'keyup', 'keypress'];
            events.forEach(eventType => {
                searchBar.dispatchEvent(new Event(eventType, { bubbles: true }));
            });

            // Simulate backspace key press
            searchBar.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
            searchBar.dispatchEvent(new KeyboardEvent('keyup', { key: 'Backspace', bubbles: true }));

            // Force blur and focus to trigger any attached event listeners
            searchBar.blur();
            searchBar.focus();

            // Use setTimeout to allow LinkedIn's scripts to process the events
            setTimeout(() => {
                // Clear the input value again, in case it was reset by LinkedIn's scripts
                searchBar.value = '';
                searchBar.dispatchEvent(new Event('input', { bubbles: true }));

                // Update button visibility
                updateButtonVisibility(searchBar, clearButton);
            }, 50);

            // Hide the clear button immediately
            clearButton.style.display = 'none';
        };

        searchBar.parentNode.insertBefore(clearButton, searchBar.nextSibling);

        // Initialize visibility
        updateButtonVisibility(searchBar, clearButton);

        // Add event listeners for input and focus events
        ['input', 'focus'].forEach(eventType => {
            searchBar.addEventListener(eventType, () => updateButtonVisibility(searchBar, clearButton));
        });
    }
}

function updateButtonVisibility(searchBar, clearButton) {
    const hasValue = searchBar.value.length > 0;
    clearButton.style.display = hasValue ? 'block' : 'none';
    searchBar.style.paddingRight = hasValue ? '40px' : '';
}

function shouldEnhanceSearchBar(searchBar) {
    // Exclude specific inputs
    const excludeList = [
        "Search messages",
        "Search conversations",
        "Search for learning content"
    ];
    if (excludeList.includes(searchBar.placeholder)) {
        return false;
    }

    // Exclude inputs that already have clear functionality
    if (searchBar.parentNode.querySelector('.search-icon, .clear-search-icon, [aria-label="Clear search"]')) {
        return false;
    }

    // Include only specific inputs we want to enhance
    const includeList = [
        "Search",
        "Search by title, skill, or company",
        "City, state, or zip code"
    ];
    return includeList.some(term => searchBar.placeholder.includes(term) || searchBar.ariaLabel?.includes(term));
}

function enhanceSearchBars() {
    const searchBars = document.querySelectorAll('input[type="text"][placeholder*="Search"], input[type="search"], input[aria-label="Search by title, skill, or company"], input[aria-label="City, state, or zip code"]');
    searchBars.forEach(searchBar => {
        if (shouldEnhanceSearchBar(searchBar)) {
            addClearButton(searchBar);
        }
    });
}

function initEnhancement() {
    enhanceSearchBars();

    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                enhanceSearchBars();
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    let attempts = 0;
    const interval = setInterval(() => {
        enhanceSearchBars();
        attempts++;
        if (attempts >= 10) clearInterval(interval);
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancement);
} else {
    initEnhancement();
}
