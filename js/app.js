// Weave Bro - Main Storefront Application Engine
// Handles Catalog rendering, Filtering, PDP Modal, Cart Drawer, Checkout, and UI interactions

// Global Toast Utility
window.showToast = function(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";

  let icon = `🌊`;
  if (type === "success") icon = `✓`;
  if (type === "error") icon = `✕`;

  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

class WeaveApp {
  constructor() {
    this.currentFilter = "all";
    this.currentSort = "featured";
    this.selectedPdpProduct = null;
    this.selectedPdpSize = null;
    this.selectedPdpColor = null;
    this.selectedBundleQty = 1;
    this.searchQuery = "";

    this.init();
  }

  init() {
    this.initTheme();
    this.bindEvents();
    this.bindMenubarEvents();
    this.initSearch();
    this.renderStoreSettings();
    this.renderProducts();
    this.renderReviews();
    this.updateCartDrawer();
    this.updateWishlistCount();
    this.initAuth();
    this.initMobileDock();
    this.initMenuDrawer();

    // Subscribe to store changes
    WeaveStore.subscribe((event) => {
      if (event === "PRODUCTS_UPDATED") {
        this.renderProducts();
      }
      if (event === "SETTINGS_UPDATED") {
        this.renderStoreSettings();
      }
      if (event === "CART_UPDATED") {
        this.updateCartDrawer();
      }
      if (event === "WISHLIST_UPDATED") {
        this.updateWishlistCount();
        this.renderProducts();
      }
      if (event === "AUTH_UPDATED") {
        this.updateAuthUi();
      }
      if (event === "ORDER_CREATED") {
        if (WeaveStore.isLoggedIn()) {
          this.renderUserOrders();
        }
      }
    });
  }

  // --- THEME MANAGEMENT ---
  initTheme() {
    const savedTheme = localStorage.getItem("weavebro_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.updateThemeIcon(savedTheme);

    const toggleBtn = document.getElementById("themeToggleBtn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("weavebro_theme", next);
        this.updateThemeIcon(next);
        window.showToast(`Switched to ${next === 'dark' ? 'Midnight Wave (Dark)' : 'Luxe Coastal (Light)'} mode`, "info");
      });
    }
  }

  updateThemeIcon(theme) {
    const icon = document.getElementById("themeIcon");
    if (!icon) return;
    if (theme === "dark") {
      icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    } else {
      icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
  }

  // --- DOM EVENT BINDINGS ---
  bindEvents() {
    // Filter Category Buttons
    const filterButtons = document.querySelectorAll("#filterCategoryButtons .filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentFilter = btn.dataset.filter;
        this.renderProducts();
      });
    });

    // Nav Filter links
    document.querySelectorAll(".nav-link[data-filter]").forEach(link => {
      link.addEventListener("click", (e) => {
        const filter = link.dataset.filter;
        this.currentFilter = filter;
        const matchingBtn = document.querySelector(`#filterCategoryButtons .filter-btn[data-filter="${filter}"]`);
        if (matchingBtn) {
          filterButtons.forEach(b => b.classList.remove("active"));
          matchingBtn.classList.add("active");
        }
        this.renderProducts();
      });
    });

    // Sort Dropdown
    const sortSelect = document.getElementById("sortFilterSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        this.currentSort = sortSelect.value;
        this.renderProducts();
      });
    }

    // Cart Drawer Open / Close
    const openCartBtn = document.getElementById("openCartBtn");
    const closeCartBtn = document.getElementById("closeCartBtn");
    const cartOverlay = document.getElementById("cartOverlay");

    if (openCartBtn) openCartBtn.addEventListener("click", () => this.openCart());
    if (closeCartBtn) closeCartBtn.addEventListener("click", () => this.closeCart());
    if (cartOverlay) {
      cartOverlay.addEventListener("click", (e) => {
        if (e.target === cartOverlay) this.closeCart();
      });
    }

    // PDP Modal Close
    const closePdpBtn = document.getElementById("closePdpModalBtn");
    const pdpOverlay = document.getElementById("pdpModal");
    if (closePdpBtn) closePdpBtn.addEventListener("click", () => this.closePdp());
    if (pdpOverlay) {
      pdpOverlay.addEventListener("click", (e) => {
        if (e.target === pdpOverlay) this.closePdp();
      });
    }

    // Size Guide Modal Open / Close
    const openSizeGuideBtn = document.getElementById("openSizeGuideBtn");
    const footerSizeGuideBtn = document.getElementById("footerSizeGuideBtn");
    const closeSizeGuideBtn = document.getElementById("closeSizeGuideBtn");
    const sizeGuideModal = document.getElementById("sizeGuideModal");

    const openGuide = (e) => {
      if (e) e.preventDefault();
      sizeGuideModal.classList.add("active");
    };
    if (openSizeGuideBtn) openSizeGuideBtn.addEventListener("click", openGuide);
    if (footerSizeGuideBtn) footerSizeGuideBtn.addEventListener("click", openGuide);
    if (closeSizeGuideBtn) closeSizeGuideBtn.addEventListener("click", () => sizeGuideModal.classList.remove("active"));
    if (sizeGuideModal) {
      sizeGuideModal.addEventListener("click", (e) => {
        if (e.target === sizeGuideModal) sizeGuideModal.classList.remove("active");
      });
    }

    // Hero buttons
    const heroFabricBtn = document.getElementById("openFabricGuideHeroBtn");
    if (heroFabricBtn) {
      heroFabricBtn.addEventListener("click", () => {
        document.getElementById("fabric-specs").scrollIntoView({ behavior: "smooth" });
      });
    }

    // Pincode checker in PDP
    const checkPincodeBtn = document.getElementById("checkPincodeBtn");
    const pincodeInput = document.getElementById("pincodeInput");
    if (checkPincodeBtn && pincodeInput) {
      checkPincodeBtn.addEventListener("click", () => {
        const pin = pincodeInput.value.trim();
        const res = document.getElementById("pincodeResult");
        if (pin.length === 6 && /^\d+$/.test(pin)) {
          res.innerHTML = `
            <span style="color: #10B981; font-weight: 700;">✓ Express delivery to ${pin} available in 2-3 business days.</span>
          `;
        } else {
          res.innerHTML = `<span style="color: var(--c-coral);">Please enter a valid 6-digit postal code.</span>`;
        }
      });
    }

    // Bundle selector in PDP
    const bundleCards = document.querySelectorAll(".bundle-option-card");
    bundleCards.forEach(card => {
      card.addEventListener("click", () => {
        bundleCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selectedBundleQty = Number(card.dataset.bundleQty) || 1;
      });
    });

    // Accordions in PDP
    document.querySelectorAll(".accordion-header").forEach(header => {
      header.addEventListener("click", () => {
        const item = header.parentElement;
        item.classList.toggle("open");
      });
    });

    // PDP Add To Bag
    const pdpAddBtn = document.getElementById("pdpAddToCartBtn");
    if (pdpAddBtn) {
      pdpAddBtn.addEventListener("click", () => {
        if (!this.selectedPdpProduct) return;
        const size = this.selectedPdpSize || (this.selectedPdpProduct.sizes && this.selectedPdpProduct.sizes[0]) || "M";
        WeaveStore.addToCart(this.selectedPdpProduct.id, size, this.selectedBundleQty, this.selectedPdpColor);
        window.showToast(`Added ${this.selectedBundleQty}x ${this.selectedPdpProduct.title} (${size}) to bag!`, "success");
        this.closePdp();
        this.openCart();
      });
    }

    // PDP Buy Now
    const pdpBuyBtn = document.getElementById("pdpBuyNowBtn");
    if (pdpBuyBtn) {
      pdpBuyBtn.addEventListener("click", () => {
        if (!this.selectedPdpProduct) return;
        const size = this.selectedPdpSize || (this.selectedPdpProduct.sizes && this.selectedPdpProduct.sizes[0]) || "M";
        WeaveStore.addToCart(this.selectedPdpProduct.id, size, this.selectedBundleQty, this.selectedPdpColor);
        this.closePdp();
        this.openCheckout();
      });
    }

    // Cart Promo Apply
    const applyPromoBtn = document.getElementById("applyPromoBtn");
    const promoInput = document.getElementById("cartPromoInput");
    if (applyPromoBtn && promoInput) {
      applyPromoBtn.addEventListener("click", () => {
        const code = promoInput.value.trim();
        if (!code) return;
        const result = WeaveStore.applyPromo(code);
        if (result.success) {
          window.showToast(result.message, "success");
          promoInput.value = "";
        } else {
          window.showToast(result.message, "error");
        }
      });
    }

    // Proceed to Checkout Button
    const proceedCheckoutBtn = document.getElementById("proceedCheckoutBtn");
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener("click", () => {
        if (WeaveStore.getCart().length === 0) {
          window.showToast("Your shopping bag is empty.", "info");
          return;
        }
        this.closeCart();
        this.openCheckout();
      });
    }

    // Checkout Navigation & Forms
    this.bindCheckoutEvents();

    // Newsletter subscription
    const newsletterBtn = document.getElementById("newsletterSubscribeBtn");
    const newsletterInput = document.getElementById("newsletterEmailInput");
    if (newsletterBtn && newsletterInput) {
      newsletterBtn.addEventListener("click", () => {
        const email = newsletterInput.value.trim();
        if (email && email.includes("@")) {
          window.showToast("🎉 Welcome to Bro Tribe! Use code WAVE15 for 15% OFF.", "success");
          newsletterInput.value = "";
        } else {
          window.showToast("Please enter a valid email address.", "error");
        }
      });
    }

    // Order Tracking footer link
    const trackOrderBtn = document.getElementById("footerTrackOrderBtn");
    if (trackOrderBtn) {
      trackOrderBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const orders = WeaveStore.getOrders();
        if (orders.length > 0) {
          const latest = orders[0];
          window.showToast(`Order #${latest.id} is currently: ${latest.status}. Tracking link sent to ${latest.customer?.email || 'email'}`, "info");
        } else {
          window.showToast("No active orders found. Place an order to track delivery!", "info");
        }
      });
    }
  }

  // --- MENUBAR EVENTS (Screenshot items & Categories) ---
  bindMenubarEvents() {
    const menubarLinks = document.querySelectorAll(".menubar-link");
    const filterButtons = document.querySelectorAll("#filterCategoryButtons .filter-btn");

    menubarLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const filter = link.dataset.filter;
        if (filter !== undefined) {
          e.preventDefault();
          this.currentFilter = filter;
          
          menubarLinks.forEach(l => l.classList.remove("active"));
          link.classList.add("active");

          if (filterButtons.length > 0) {
            filterButtons.forEach(b => {
              if (b.dataset.filter === filter) b.classList.add("active");
              else b.classList.remove("active");
            });
          }

          this.renderProducts();
          const catalogSection = document.getElementById("catalog");
          if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });
  }

  // --- REAL-TIME SEARCH (Flipkart Inspired) ---
  initSearch() {
    const searchForm = document.getElementById("headerSearchForm");
    const searchInput = document.getElementById("headerSearchInput");
    const searchClearBtn = document.getElementById("searchClearBtn");
    const suggestionsDropdown = document.getElementById("searchSuggestionsDropdown");
    const suggestionsList = document.getElementById("searchSuggestionsList");
    const suggestionsFooter = document.getElementById("searchSuggestionsFooter");
    const activeSearchClearBtn = document.getElementById("activeSearchClearBtn");

    if (!searchInput) return;

    const highlightText = (text, query) => {
      if (!query) return text;
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    };

    const updateSuggestions = () => {
      const q = searchInput.value.trim();
      if (!q) {
        if (searchClearBtn) searchClearBtn.style.display = "none";
        if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
        return;
      }

      if (searchClearBtn) searchClearBtn.style.display = "flex";

      const allProducts = WeaveStore.getProducts();
      const qLower = q.toLowerCase();
      const matches = allProducts.filter(p => {
        const matchTitle = p.title.toLowerCase().includes(qLower);
        const matchFit = p.fit ? p.fit.toLowerCase().includes(qLower) : false;
        const matchBadge = p.badge ? p.badge.toLowerCase().includes(qLower) : false;
        const matchSub = p.subtitle ? p.subtitle.toLowerCase().includes(qLower) : false;
        const matchDesc = p.description ? p.description.toLowerCase().includes(qLower) : false;
        const matchColor = p.color ? p.color.toLowerCase().includes(qLower) : false;
        const matchGsm = (p.gsm + "").includes(qLower) || (qLower.includes("gsm") && (p.gsm + "").includes(qLower.replace(/\D/g, "")));
        return matchTitle || matchFit || matchBadge || matchSub || matchDesc || matchColor || matchGsm;
      });

      if (suggestionsDropdown) {
        suggestionsDropdown.style.display = "block";
      }

      if (matches.length === 0) {
        if (suggestionsList) {
          suggestionsList.innerHTML = `
            <div class="search-no-results">
              <div class="no-results-title">No t-shirts matching "${q}"</div>
              <div class="no-results-hint">Try searching for <strong>240 GSM</strong>, <strong>Oversized</strong>, <strong>French Terry</strong>, or <strong>Acid Wash</strong></div>
            </div>
          `;
        }
        if (suggestionsFooter) {
          suggestionsFooter.innerHTML = `
            <button type="button" class="view-all-results-btn" id="searchBrowseAllBtn">
              Browse all collection drops →
            </button>
          `;
          const browseBtn = document.getElementById("searchBrowseAllBtn");
          if (browseBtn) {
            browseBtn.addEventListener("click", () => {
              if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
              this.searchQuery = "";
              searchInput.value = "";
              if (searchClearBtn) searchClearBtn.style.display = "none";
              const allBtn = document.querySelector('#filterCategoryButtons button[data-filter="all"]');
              if (allBtn) allBtn.click();
              const catalogSection = document.getElementById("catalog");
              if (catalogSection) catalogSection.scrollIntoView({ behavior: "smooth" });
            });
          }
        }
        return;
      }

      if (suggestionsList) {
        suggestionsList.innerHTML = matches.map(p => `
          <div class="search-suggestion-item" data-product-id="${p.id}">
            <img src="${p.image}" alt="${p.title}" class="suggestion-thumb" onerror="this.src='assets/images/tee-navy.jpg'">
            <div class="suggestion-info">
              <div class="suggestion-title">${highlightText(p.title, q)}</div>
              <div class="suggestion-meta">
                <span class="suggestion-gsm">${p.gsm || 240} GSM</span>
                <span>•</span>
                <span class="suggestion-fit">${p.fit || 'Oversized Fit'}</span>
                ${p.badge ? `<span class="suggestion-badge">${p.badge}</span>` : ''}
              </div>
            </div>
            <div class="suggestion-price">
              <div class="suggestion-current-price">₹${p.price.toLocaleString()}</div>
              ${p.comparePrice ? `<div class="suggestion-compare-price">₹${p.comparePrice.toLocaleString()}</div>` : ''}
            </div>
          </div>
        `).join("");

        suggestionsList.querySelectorAll(".search-suggestion-item").forEach(item => {
          item.addEventListener("click", () => {
            const pId = item.dataset.productId;
            if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
            this.openPdp(pId);
          });
        });
      }

      if (suggestionsFooter) {
        suggestionsFooter.innerHTML = `
          <button type="button" class="view-all-results-btn" id="searchViewAllMatchesBtn">
            <span>View all ${matches.length} matching drops in vault</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        `;
        const viewAllBtn = document.getElementById("searchViewAllMatchesBtn");
        if (viewAllBtn) {
          viewAllBtn.addEventListener("click", () => {
            this.applySearch(q);
          });
        }
      }
    };

    searchInput.addEventListener("input", updateSuggestions);
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) updateSuggestions();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.applySearch(searchInput.value.trim());
      } else if (e.key === "Escape") {
        if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
      }
    });

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.applySearch(searchInput.value.trim());
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchClearBtn.style.display = "none";
        if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
        if (this.searchQuery) {
          this.searchQuery = "";
          this.renderProducts();
        }
        searchInput.focus();
      });
    }

    if (activeSearchClearBtn) {
      activeSearchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        if (searchClearBtn) searchClearBtn.style.display = "none";
        if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
        this.searchQuery = "";
        this.renderProducts();
      });
    }

    // Search Overlay Toggle & Dismiss (Hemmey-style clean modal search)
    const searchToggleBtn = document.getElementById("searchToggleBtn");
    const searchOverlay = document.getElementById("headerSearchOverlay");
    const searchOverlayCloseBtn = document.getElementById("searchOverlayCloseBtn");

    if (searchToggleBtn && searchOverlay) {
      searchToggleBtn.addEventListener("click", () => {
        searchOverlay.classList.toggle("open");
        if (searchOverlay.classList.contains("open")) {
          setTimeout(() => searchInput.focus(), 80);
        } else {
          if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
        }
      });
    }

    if (searchOverlayCloseBtn && searchOverlay) {
      searchOverlayCloseBtn.addEventListener("click", () => {
        searchOverlay.classList.remove("open");
        if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchOverlay && searchOverlay.classList.contains("open")) {
        searchOverlay.classList.remove("open");
        if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
      }
    });

    document.addEventListener("click", (e) => {
      if (searchOverlay && searchOverlay.classList.contains("open")) {
        if (!searchOverlay.contains(e.target) && searchToggleBtn && !searchToggleBtn.contains(e.target)) {
          searchOverlay.classList.remove("open");
          if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
        }
      }
    });
  }

  applySearch(query) {
    const suggestionsDropdown = document.getElementById("searchSuggestionsDropdown");
    if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
    const searchOverlay = document.getElementById("headerSearchOverlay");
    if (searchOverlay) searchOverlay.classList.remove("open");

    this.searchQuery = query;
    this.renderProducts();

    const catalogSection = document.getElementById("catalog");
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
    }
    if (query) {
      window.showToast(`Showing search results for "${query}"`, "info");
    }
  }

  // --- STORE SETTINGS RENDERING ---
  renderStoreSettings() {
    const s = WeaveStore.getSettings();
    const annText = document.getElementById("announcementText");
    if (annText && s.announcement) annText.textContent = s.announcement;

    const heroBadge = document.getElementById("heroBadge");
    if (heroBadge && s.heroBadge) heroBadge.textContent = s.heroBadge;

    const heroTitle = document.getElementById("heroTitle");
    if (heroTitle && s.heroTitle) {
      heroTitle.innerHTML = `${s.heroTitle} <br><span class="gradient-text">FOR THE CULTURE</span>`;
    }

    const heroSub = document.getElementById("heroSubtitle");
    if (heroSub && s.heroSubtitle) heroSub.textContent = s.heroSubtitle;

    const heroCta = document.getElementById("heroCta");
    if (heroCta && s.heroCtaText) {
      heroCta.innerHTML = `${s.heroCtaText} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
    }

    const heroImg = document.getElementById("heroBannerImg");
    if (heroImg && s.heroBannerImage) heroImg.src = s.heroBannerImage;
  }

  // --- PRODUCTS RENDERING ---
  renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    let items = WeaveStore.getProducts();

    // Search Query Filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(p => {
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchFit = p.fit ? p.fit.toLowerCase().includes(q) : false;
        const matchBadge = p.badge ? p.badge.toLowerCase().includes(q) : false;
        const matchSub = p.subtitle ? p.subtitle.toLowerCase().includes(q) : false;
        const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        const matchColor = p.color ? p.color.toLowerCase().includes(q) : false;
        const matchGsm = (p.gsm + "").includes(q) || (q.includes("gsm") && (p.gsm + "").includes(q.replace(/\D/g, "")));
        return matchTitle || matchFit || matchBadge || matchSub || matchDesc || matchColor || matchGsm;
      });
    }

    // Category Filter
    if (this.currentFilter !== "all") {
      items = items.filter(p => {
        const matchTitle = p.title.toLowerCase().includes(this.currentFilter.toLowerCase());
        const matchFit = p.fit ? p.fit.toLowerCase().includes(this.currentFilter.toLowerCase()) : false;
        const matchBadge = p.badge ? p.badge.toLowerCase().includes(this.currentFilter.toLowerCase()) : false;
        const matchSub = p.subtitle ? p.subtitle.toLowerCase().includes(this.currentFilter.toLowerCase()) : false;
        const matchGsm = this.currentFilter.includes("240") && p.gsm >= 240;
        return matchTitle || matchFit || matchBadge || matchSub || matchGsm;
      });
    }

    // Active Search Chip Update
    const activeSearchChipBar = document.getElementById("activeSearchChipBar");
    const activeSearchKeyword = document.getElementById("activeSearchKeyword");
    const activeSearchCount = document.getElementById("activeSearchCount");
    if (activeSearchChipBar) {
      if (this.searchQuery) {
        activeSearchChipBar.style.display = "block";
        if (activeSearchKeyword) activeSearchKeyword.textContent = `"${this.searchQuery}"`;
        if (activeSearchCount) activeSearchCount.textContent = `${items.length} ${items.length === 1 ? 'drop' : 'drops'}`;
      } else {
        activeSearchChipBar.style.display = "none";
      }
    }

    // Sort
    if (this.currentSort === "price-low") {
      items.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === "price-high") {
      items.sort((a, b) => b.price - a.price);
    } else if (this.currentSort === "gsm-high") {
      items.sort((a, b) => (b.gsm || 240) - (a.gsm || 240));
    } else if (this.currentSort === "rating") {
      items.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    // Update count label
    const countLabel = document.getElementById("productCountLabel");
    if (countLabel) {
      if (this.searchQuery) {
        countLabel.textContent = `Found ${items.length} T-Shirts for "${this.searchQuery}"`;
      } else {
        countLabel.textContent = `Showing ${items.length} T-Shirts`;
      }
    }

    if (items.length === 0) {
      const isSearch = !!this.searchQuery;
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <h3 style="font-family: var(--font-heading); margin-bottom: 8px;">
            ${isSearch ? `No t-shirts match "${this.searchQuery}"` : 'No drops match your criteria'}
          </h3>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">
            ${isSearch ? 'Try searching for 240 GSM, Oversized, Acid Wash, or browse all t-shirts.' : 'Try selecting another category or view all T-shirts.'}
          </p>
          <button class="btn btn-secondary" id="emptyResetFilterBtn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("emptyResetFilterBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          this.searchQuery = "";
          const searchInput = document.getElementById("headerSearchInput");
          if (searchInput) searchInput.value = "";
          const clearBtn = document.getElementById("searchClearBtn");
          if (clearBtn) clearBtn.style.display = "none";
          const allBtn = document.querySelector('#filterCategoryButtons button[data-filter="all"]');
          if (allBtn) allBtn.click();
          this.renderProducts();
        });
      }
      return;
    }

    grid.innerHTML = items.map(p => {
      const discount = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
      const isWishlisted = WeaveStore.isInWishlist(p.id);

      return `
        <article class="product-card" data-product-id="${p.id}">
          <div class="product-media-wrap" onclick="window.weaveApp.openPdp('${p.id}')">
            <img src="${p.image}" alt="${p.title}" class="product-image" loading="lazy" onerror="this.src='assets/images/tee-navy.jpg'">
            
            <div class="product-badge-overlay">
              <span class="badge-gsm">${p.gsm || 240} GSM</span>
              ${p.badge ? `<span class="badge ${p.badge.toLowerCase().includes('bestseller') ? 'badge-amber' : 'badge-wave'}">${p.badge}</span>` : ''}
              ${p.stock <= 0 ? `<span class="badge badge-coral">SOLD OUT</span>` : ''}
            </div>

            <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                    title="Wishlist" 
                    onclick="event.stopPropagation(); window.weaveApp.toggleWishlist('${p.id}');">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
            </button>

            <div class="product-quick-btn">
              QUICK VIEW • SPECS & SIZES
            </div>
          </div>

          <div class="product-details">
            <div class="product-meta-row">
              <span class="product-fit-label">${p.fit || 'Oversized Fit'}</span>
              <span class="product-rating">★ ${p.rating || '4.9'} <span style="color: var(--text-muted); font-size: 0.68rem;">(${p.reviewsCount || 100})</span></span>
            </div>

            <h3 class="product-title" onclick="window.weaveApp.openPdp('${p.id}')">${p.title}</h3>
            <p class="product-subtitle">${p.subtitle || '100% Super Combed Cotton'}</p>

            <div class="product-swatches">
              <span class="color-swatch-dot active" style="background-color: ${p.colorHex || '#0A1128'};" title="${p.colorName}"></span>
              <span style="font-size: 0.72rem; color: var(--text-secondary);">${p.colorName || 'Classic Wave'}</span>
            </div>

            <div class="product-pricing-row">
              <span class="price-current">₹${p.price}</span>
              ${p.comparePrice ? `<span class="price-compare">₹${p.comparePrice}</span>` : ''}
              ${discount > 0 ? `<span class="price-discount-pill">${discount}% OFF</span>` : ''}
            </div>

            <div class="product-sizes-row">
              ${(p.sizes || ["S", "M", "L", "XL"]).map(sz => `<span class="size-pill-mini">${sz}</span>`).join("")}
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  // --- PDP (PRODUCT DETAIL DEEP DIVE MODAL) ---
  openPdp(productId) {
    const p = WeaveStore.getProductById(productId);
    if (!p) return;

    this.selectedPdpProduct = p;
    this.selectedPdpSize = p.sizes ? p.sizes[0] : "M";
    this.selectedPdpColor = p.colorName;
    this.selectedBundleQty = 1;

    // Fill PDP elements
    document.getElementById("pdpTitle").textContent = p.title;
    document.getElementById("pdpSubtitle").textContent = p.subtitle || "Pure Combed Heavyweight Cotton";
    document.getElementById("pdpPriceNow").textContent = `₹${p.price}`;
    document.getElementById("pdpPriceMrp").textContent = p.comparePrice ? `₹${p.comparePrice}` : "";
    
    const discPill = document.getElementById("pdpDiscountPill");
    if (p.comparePrice) {
      const disc = Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
      discPill.textContent = `${disc}% OFF`;
      discPill.style.display = "inline-block";
    } else {
      discPill.style.display = "none";
    }

    document.getElementById("pdpFitTag").textContent = p.fit.toUpperCase();
    document.getElementById("pdpSelectedColorName").textContent = p.colorName || "Original";
    document.getElementById("pdpGsmLabel").textContent = `${p.gsm || 240} GSM`;

    // Fill GSM progress
    const gsmVal = p.gsm || 240;
    const gsmPercent = Math.min(100, Math.max(20, ((gsmVal - 140) / 180) * 100));
    document.getElementById("pdpGsmFill").style.width = `${gsmPercent}%`;

    // Main Image
    const mainImg = document.getElementById("pdpMainImg");
    mainImg.src = p.image;

    // Badges
    const badgeContainer = document.getElementById("pdpBadgeContainer");
    badgeContainer.innerHTML = `
      <span class="badge-gsm">${p.gsm || 240} GSM</span>
      ${p.badge ? `<span class="badge badge-wave">${p.badge}</span>` : ''}
    `;

    // Thumbnails
    const thumbsContainer = document.getElementById("pdpThumbnailsList");
    const gallery = p.gallery && p.gallery.length ? p.gallery : [p.image];
    thumbsContainer.innerHTML = gallery.map((imgUrl, i) => `
      <img src="${imgUrl}" alt="Thumbnail ${i}" class="pdp-thumb-img ${i === 0 ? 'active' : ''}" onclick="window.weaveApp.changePdpImage('${imgUrl}', this)">
    `).join("");

    // Color Swatches
    const colorContainer = document.getElementById("pdpColorSwatches");
    colorContainer.innerHTML = `
      <span class="color-swatch-dot active" style="background-color: ${p.colorHex || '#0A1128'};" title="${p.colorName}"></span>
    `;

    // Size Picker
    const sizePicker = document.getElementById("pdpSizePicker");
    const sizes = p.sizes && p.sizes.length ? p.sizes : ["S", "M", "L", "XL"];
    sizePicker.innerHTML = sizes.map((sz, i) => `
      <button class="size-btn-pill ${i === 0 ? 'active' : ''}" onclick="window.weaveApp.selectPdpSize('${sz}', this)">
        ${sz}
      </button>
    `).join("");

    // Stock alert
    const stockWarn = document.getElementById("pdpStockWarning");
    if (p.stock <= 5 && p.stock > 0) {
      stockWarn.textContent = `⚡ Only ${p.stock} left in stock - order soon!`;
    } else if (p.stock <= 0) {
      stockWarn.textContent = `✕ Currently Out of Stock`;
    } else {
      stockWarn.textContent = ``;
    }

    // Specs Accordion
    const specsList = p.specs && p.specs.length ? p.specs : [
      `${p.gsm || 240} GSM heavyweight combed cotton`,
      "Zero-fade bio-enzyme wash",
      "Reinforced lycra collar",
      "Drop-shoulder streetwear hang"
    ];
    document.getElementById("pdpSpecsContent").innerHTML = `
      <p style="margin-bottom: 10px;">${p.description || ''}</p>
      <ul style="padding-left: 20px; line-height: 1.8;">
        ${specsList.map(s => `<li>${s}</li>`).join("")}
      </ul>
    `;

    // Care Accordion
    if (p.fabricCare) {
      document.getElementById("pdpCareContent").textContent = p.fabricCare;
    }

    // Reset bundle cards
    document.querySelectorAll(".bundle-option-card").forEach((card, idx) => {
      card.classList.toggle("selected", idx === 0);
    });

    // Open Modal
    document.getElementById("pdpModal").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closePdp() {
    document.getElementById("pdpModal").classList.remove("active");
    document.body.style.overflow = "";
    this.selectedPdpProduct = null;
  }

  changePdpImage(url, thumbEl) {
    document.getElementById("pdpMainImg").src = url;
    document.querySelectorAll(".pdp-thumb-img").forEach(el => el.classList.remove("active"));
    if (thumbEl) thumbEl.classList.add("active");
  }

  selectPdpSize(size, btnEl) {
    this.selectedPdpSize = size;
    document.querySelectorAll(".size-btn-pill").forEach(el => el.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
  }

  // --- CART DRAWER ---
  openCart() {
    this.updateCartDrawer();
    document.getElementById("cartOverlay").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeCart() {
    document.getElementById("cartOverlay").classList.remove("active");
    document.body.style.overflow = "";
  }

  updateCartDrawer() {
    const cart = WeaveStore.getCart();
    const count = WeaveStore.getCartCount();
    const calc = WeaveStore.getCartCalculations();

    // Badges
    const badge = document.getElementById("cartCountBadge");
    if (badge) badge.textContent = count;
    const dockCartBadge = document.getElementById("dockCartCount");
    if (dockCartBadge) dockCartBadge.textContent = count;
    const menuCartBadge = document.getElementById("menuCartCount");
    if (menuCartBadge) menuCartBadge.textContent = count;
    const headerCount = document.getElementById("cartHeaderCount");
    if (headerCount) headerCount.textContent = `${count} ${count === 1 ? 'Item' : 'Items'}`;

    // Free Shipping Progress
    const shippingBar = document.getElementById("shippingProgressBar");
    const shippingText = document.getElementById("shippingBarText");
    if (shippingBar && shippingText) {
      shippingBar.style.width = `${calc.freeShippingProgress}%`;
      if (calc.amountToFreeShipping === 0) {
        shippingText.innerHTML = `🎉 <strong>YOU UNLOCKED FREE EXPRESS SHIPPING!</strong>`;
      } else {
        shippingText.innerHTML = `<span>Add <strong>₹${calc.amountToFreeShipping.toFixed(0)}</strong> more to unlock <strong>FREE SHIPPING!</strong></span>`;
      }
    }

    // Items List
    const list = document.getElementById("cartItemsList");
    if (!list) return;

    if (cart.length === 0) {
      list.innerHTML = `
        <div class="cart-empty-state">
          <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <h4 style="font-family: var(--font-heading); font-size: 1.1rem; margin-bottom: 6px;">Your bag is empty</h4>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 20px;">Explore the 240+ GSM drop and wear the wave.</p>
          <button class="btn btn-primary btn-sm" onclick="window.weaveApp.closeCart(); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });">
            Explore T-Shirts
          </button>
        </div>
      `;
    } else {
      list.innerHTML = cart.map((item, idx) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.src='assets/images/tee-navy.jpg'">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.title}</h4>
            <div class="cart-item-variant">Size: <strong>${item.size}</strong> • ${item.color} • ${item.gsm || 240} GSM</div>
            
            <div class="cart-item-bottom">
              <div class="cart-qty-stepper">
                <button class="qty-step-btn" onclick="WeaveStore.updateCartQuantity(${idx}, ${item.quantity - 1})">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-step-btn" onclick="WeaveStore.updateCartQuantity(${idx}, ${item.quantity + 1})">+</button>
              </div>

              <div style="display: flex; align-items: center;">
                <span class="cart-item-price">₹${(item.price * item.quantity).toFixed(0)}</span>
                <button class="cart-remove-btn" title="Remove Item" onclick="WeaveStore.removeFromCart(${idx})">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join("");
    }

    // Applied Promo Badge
    const promoBadge = document.getElementById("appliedPromoBadge");
    const promoInputContainer = document.getElementById("promoInputContainer");
    if (promoBadge && promoInputContainer) {
      if (calc.appliedPromo) {
        promoBadge.style.display = "flex";
        promoBadge.innerHTML = `
          <span>✓ Code <strong>${calc.appliedPromo.code}</strong> applied (${calc.appliedPromo.discountPercent}% OFF)</span>
          <button style="color: inherit; font-size: 0.8rem;" onclick="WeaveStore.removeAppliedPromo()">✕</button>
        `;
        promoInputContainer.style.display = "none";
      } else {
        promoBadge.style.display = "none";
        promoInputContainer.style.display = "flex";
      }
    }

    // Summary calculations
    document.getElementById("cartSubtotalText").textContent = `₹${calc.subtotal.toFixed(0)}`;
    const discLine = document.getElementById("cartDiscountLine");
    if (calc.discount > 0) {
      discLine.style.display = "flex";
      document.getElementById("cartDiscountText").textContent = `-₹${calc.discount.toFixed(0)}`;
    } else {
      discLine.style.display = "none";
    }

    document.getElementById("cartShippingText").textContent = calc.shipping === 0 ? "FREE" : `₹${calc.shipping}`;
    document.getElementById("cartTotalText").textContent = `₹${calc.total.toFixed(0)}`;
  }

  // --- CHECKOUT SIMULATOR ---
  openCheckout() {
    const calc = WeaveStore.getCartCalculations();
    document.getElementById("checkoutPayableText").textContent = `₹${calc.total.toFixed(0)}`;

    // Auto-populate customer fields if user is authenticated
    const user = WeaveStore.getCurrentUser();
    if (user) {
      if (document.getElementById("custName") && user.name && user.name !== "Bro Member") {
        document.getElementById("custName").value = user.name;
      }
      if (document.getElementById("custPhone")) document.getElementById("custPhone").value = user.phone || "";
      if (document.getElementById("custEmail") && user.email) document.getElementById("custEmail").value = user.email;
      if (document.getElementById("custAddress") && user.address) document.getElementById("custAddress").value = user.address;
      if (document.getElementById("custCity") && user.city) document.getElementById("custCity").value = user.city;
      if (document.getElementById("custPincode") && user.pincode) document.getElementById("custPincode").value = user.pincode;
    }

    this.setCheckoutStep(1);
    document.getElementById("checkoutModal").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeCheckout() {
    document.getElementById("checkoutModal").classList.remove("active");
    document.body.style.overflow = "";
  }

  setCheckoutStep(stepNumber) {
    document.querySelectorAll(".step-tab").forEach((tab, i) => {
      tab.classList.toggle("active", i + 1 === stepNumber);
    });

    document.getElementById("checkoutStep1").style.display = stepNumber === 1 ? "block" : "none";
    document.getElementById("checkoutStep2").style.display = stepNumber === 2 ? "block" : "none";
    document.getElementById("checkoutStep3").style.display = stepNumber === 3 ? "block" : "none";
  }

  bindCheckoutEvents() {
    const closeBtn = document.getElementById("closeCheckoutBtn");
    const overlay = document.getElementById("checkoutModal");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeCheckout());
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.closeCheckout();
      });
    }

    // Step 1 Form submit
    const shippingForm = document.getElementById("checkoutShippingForm");
    if (shippingForm) {
      shippingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.customerData = {
          name: document.getElementById("custName").value,
          email: document.getElementById("custEmail").value,
          phone: document.getElementById("custPhone").value,
          address: document.getElementById("custAddress").value,
          city: document.getElementById("custCity").value,
          pincode: document.getElementById("custPincode").value
        };
        this.setCheckoutStep(2);
      });
    }

    // Back to shipping
    const backBtn = document.getElementById("backToShippingBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => this.setCheckoutStep(1));
    }

    // Payment radio click
    document.querySelectorAll(".payment-radio-label").forEach(label => {
      label.addEventListener("click", () => {
        document.querySelectorAll(".payment-radio-label").forEach(l => l.classList.remove("selected"));
        label.classList.add("selected");
      });
    });

    // Complete Payment Button
    const completePaymentBtn = document.getElementById("completePaymentBtn");
    if (completePaymentBtn) {
      completePaymentBtn.addEventListener("click", () => {
        const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || "UPI";
        const order = WeaveStore.createOrder(this.customerData, payMethod);

        if (!order) {
          window.showToast("Cart is empty or order failed", "error");
          return;
        }

        // Render receipt
        const receipt = document.getElementById("orderReceiptDetails");
        receipt.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--border-medium); padding-bottom: 8px;">
            <span>Order Reference: <strong style="color: var(--c-wave-500);">${order.id}</strong></span>
            <span>Date: <strong>${order.date}</strong></span>
          </div>
          <div style="font-size: 0.85rem; margin-bottom: 10px;">
            <strong>Shipped To:</strong> ${order.customer.name}, ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}
          </div>
          <div style="font-size: 0.85rem; margin-bottom: 10px;">
            <strong>Payment Method:</strong> ${order.paymentMethod} (Verified)
          </div>
          <div style="font-size: 0.85rem; margin-bottom: 10px;">
            <strong>Items:</strong>
            ${order.items.map(it => `<div>• ${it.quantity}x ${it.title} (${it.size}) - ₹${it.price * it.quantity}</div>`).join("")}
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; border-top: 1px dashed var(--border-medium); padding-top: 8px; margin-top: 8px;">
            <span>Paid Amount:</span>
            <span>₹${order.total.toFixed(0)}</span>
          </div>
        `;

        this.setCheckoutStep(3);
        window.showToast("Order placed successfully! Welcome to the wave.", "success");
      });
    }

    const closeSuccessBtn = document.getElementById("closeCheckoutSuccessBtn");
    if (closeSuccessBtn) {
      closeSuccessBtn.addEventListener("click", () => {
        this.closeCheckout();
      });
    }
  }

  // --- WISHLIST ---
  toggleWishlist(productId) {
    const isAdded = WeaveStore.toggleWishlist(productId);
    const prod = WeaveStore.getProductById(productId);
    if (isAdded) {
      window.showToast(`Saved "${prod?.title || 'Tee'}" to your Wishlist ❤️`, "success");
    } else {
      window.showToast(`Removed from Wishlist`, "info");
    }
    this.updateWishlistCount();
    this.renderProducts();
  }

  updateWishlistCount() {
    const count = WeaveStore.getWishlist().length;
    const badge = document.getElementById("wishlistCountBadge");
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    }
    const dockBadge = document.getElementById("dockWishlistCount");
    if (dockBadge) {
      dockBadge.textContent = count;
      dockBadge.style.display = count > 0 ? "flex" : "none";
    }
    const menuBadge = document.getElementById("menuWishlistCount");
    if (menuBadge) {
      menuBadge.textContent = count;
      menuBadge.style.display = count > 0 ? "inline-flex" : "none";
    }
  }

  // --- REVIEWS ---
  renderReviews() {
    const container = document.getElementById("reviewsGrid");
    if (!container) return;

    container.innerHTML = CUSTOMER_REVIEWS_SEED.map(rev => `
      <div class="review-card">
        <div class="review-rating-stars">★★★★★</div>
        <h4 class="review-title">"${rev.title}"</h4>
        <p class="review-body">${rev.comment}</p>
        <div class="review-author">
          <span>${rev.name} (${rev.location})</span>
          ${rev.verified ? `<span class="review-verified">● Verified Buyer</span>` : ''}
        </div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
          Purchased: ${rev.product} • ${rev.date}
        </div>
      </div>
    `).join("");
  }

  // --- USER AUTHENTICATION & ACCOUNT (PHONE + OTP) ---
  initAuth() {
    this.authModal = document.getElementById("authModal");
    this.accountModal = document.getElementById("accountModal");
    this.openAuthBtn = document.getElementById("openAuthBtn");
    this.menubarLoginBtn = document.getElementById("menubarLoginBtn");
    this.menubarLoginLabel = document.getElementById("menubarLoginLabel");
    this.menubarAvatar = document.getElementById("menubarAvatar");
    this.menubarOnlineDot = document.getElementById("menubarOnlineDot");
    this.userDropdown = document.getElementById("userDropdownPopover");
    this.onlineDot = document.getElementById("userOnlineDot");

    this.authPhoneForm = document.getElementById("authPhoneForm");
    this.authOtpForm = document.getElementById("authOtpForm");
    this.phoneInput = document.getElementById("authPhoneInput");
    this.nameInput = document.getElementById("authNameInput");
    this.otpCells = [
      document.getElementById("otp1"),
      document.getElementById("otp2"),
      document.getElementById("otp3"),
      document.getElementById("otp4")
    ];

    this.resendTimer = null;
    this.currentSimulatedOtp = null;

    this.bindAuthEvents();
    this.updateAuthUi();
  }

  bindAuthEvents() {
    // Auth Triggers (Header & Menubar)
    const triggerButtons = [this.openAuthBtn, this.menubarLoginBtn].filter(Boolean);
    triggerButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (WeaveStore.isLoggedIn()) {
          this.toggleUserDropdown();
        } else {
          this.openAuthModal();
        }
      });
    });

    // Close Dropdown on click outside
    document.addEventListener("click", (e) => {
      const isInside = (this.userDropdown && this.userDropdown.contains(e.target)) ||
                       triggerButtons.some(b => b.contains(e.target));
      if (!isInside) {
        this.closeUserDropdown();
      }
    });

    // Dropdown Actions
    const myOrdersBtn = document.getElementById("dropdownMyOrdersBtn");
    if (myOrdersBtn) {
      myOrdersBtn.addEventListener("click", () => {
        this.closeUserDropdown();
        this.openAccountModal("orders");
      });
    }

    const myProfileBtn = document.getElementById("dropdownMyProfileBtn");
    if (myProfileBtn) {
      myProfileBtn.addEventListener("click", () => {
        this.closeUserDropdown();
        this.openAccountModal("profile");
      });
    }

    const logoutBtn = document.getElementById("dropdownLogoutBtn");
    const accountSignOutBtn = document.getElementById("accountSignOutBtn");
    const handleLogout = () => {
      WeaveStore.logout();
      this.closeUserDropdown();
      this.closeAccountModal();
      window.showToast("Signed out successfully. Come back soon!", "info");
    };

    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
    if (accountSignOutBtn) accountSignOutBtn.addEventListener("click", handleLogout);

    // Modal Close Buttons
    const closeAuthBtn = document.getElementById("closeAuthModalBtn");
    if (closeAuthBtn) closeAuthBtn.addEventListener("click", () => this.closeAuthModal());
    if (this.authModal) {
      this.authModal.addEventListener("click", (e) => {
        if (e.target === this.authModal) this.closeAuthModal();
      });
    }

    const closeAccountBtn = document.getElementById("closeAccountModalBtn");
    if (closeAccountBtn) closeAccountBtn.addEventListener("click", () => this.closeAccountModal());
    if (this.accountModal) {
      this.accountModal.addEventListener("click", (e) => {
        if (e.target === this.accountModal) this.closeAccountModal();
      });
    }

    // Account Modal Tabs
    const accTabOrders = document.getElementById("accTabOrders");
    const accTabProfile = document.getElementById("accTabProfile");
    const accOrdersView = document.getElementById("accOrdersView");
    const accProfileView = document.getElementById("accProfileView");

    if (accTabOrders && accTabProfile) {
      accTabOrders.addEventListener("click", () => {
        accTabOrders.classList.add("active");
        accTabProfile.classList.remove("active");
        accOrdersView.style.display = "block";
        accProfileView.style.display = "none";
        this.renderUserOrders();
      });

      accTabProfile.addEventListener("click", () => {
        accTabProfile.classList.add("active");
        accTabOrders.classList.remove("active");
        accProfileView.style.display = "block";
        accOrdersView.style.display = "none";
        this.fillProfileForm();
      });
    }

    // Profile Form Submit
    const profileForm = document.getElementById("userProfileForm");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const updates = {
          name: document.getElementById("profileNameInput").value.trim(),
          email: document.getElementById("profileEmailInput").value.trim(),
          address: document.getElementById("profileAddressInput").value.trim(),
          city: document.getElementById("profileCityInput").value.trim(),
          pincode: document.getElementById("profilePincodeInput").value.trim()
        };
        WeaveStore.updateUserProfile(updates);
        window.showToast("Profile details updated successfully!", "success");
      });
    }

    // Auth Phone Form (Step 1 -> Step 2)
    if (this.authPhoneForm) {
      this.authPhoneForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const phone = this.phoneInput.value.trim();
        const name = this.nameInput ? this.nameInput.value.trim() : "";

        try {
          const res = WeaveStore.sendOtp(phone, name);
          this.currentSimulatedOtp = res.otp;

          // Display on Step 2
          document.getElementById("authOtpPhoneDisplay").textContent = `+91 ${res.phone}`;
          document.getElementById("simulatedSmsText").innerHTML = `Your login OTP is <strong>${res.otp}</strong>. Valid for 10 minutes.`;

          // Switch steps
          document.getElementById("authStepPhone").style.display = "none";
          document.getElementById("authStepOtp").style.display = "block";

          // Clear and focus first OTP input
          this.otpCells.forEach(cell => { if (cell) cell.value = ""; });
          if (this.otpCells[0]) this.otpCells[0].focus();

          this.startOtpCountdown(30);
          window.showToast(`📱 SMS: OTP sent to +91 ${res.phone}`, "info");
        } catch (err) {
          window.showToast(err.message, "error");
        }
      });
    }

    // Change Phone Button
    const changePhoneBtn = document.getElementById("changePhoneBtn");
    if (changePhoneBtn) {
      changePhoneBtn.addEventListener("click", () => {
        clearInterval(this.resendTimer);
        document.getElementById("authStepOtp").style.display = "none";
        document.getElementById("authStepPhone").style.display = "block";
        if (this.phoneInput) this.phoneInput.focus();
      });
    }

    // Auto-fill OTP button
    const autoFillBtn = document.getElementById("autoFillOtpBtn");
    if (autoFillBtn) {
      autoFillBtn.addEventListener("click", () => {
        if (!this.currentSimulatedOtp) return;
        const digits = this.currentSimulatedOtp.split("");
        this.otpCells.forEach((cell, i) => {
          if (cell) cell.value = digits[i] || "";
        });
        if (this.authOtpForm) {
          this.authOtpForm.dispatchEvent(new Event("submit"));
        }
      });
    }

    // OTP Cell Inputs Auto-advance & Backspace Navigation
    this.otpCells.forEach((cell, idx) => {
      if (!cell) return;

      cell.addEventListener("input", (e) => {
        const val = e.target.value.replace(/\D/g, "");
        e.target.value = val ? val[0] : "";

        if (e.target.value && idx < this.otpCells.length - 1) {
          this.otpCells[idx + 1].focus();
        }
      });

      cell.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !cell.value && idx > 0) {
          this.otpCells[idx - 1].focus();
        }
      });

      cell.addEventListener("paste", (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        if (pasteData) {
          const digits = pasteData.slice(0, 4).split("");
          digits.forEach((d, i) => {
            if (this.otpCells[i]) this.otpCells[i].value = d;
          });
          const nextIndex = Math.min(digits.length, this.otpCells.length - 1);
          if (this.otpCells[nextIndex]) this.otpCells[nextIndex].focus();
        }
      });
    });

    // Resend OTP Button
    const resendBtn = document.getElementById("resendOtpBtn");
    if (resendBtn) {
      resendBtn.addEventListener("click", () => {
        const phone = this.phoneInput.value.trim();
        const name = this.nameInput ? this.nameInput.value.trim() : "";
        try {
          const res = WeaveStore.sendOtp(phone, name);
          this.currentSimulatedOtp = res.otp;
          document.getElementById("simulatedSmsText").innerHTML = `Your login OTP is <strong>${res.otp}</strong>. Valid for 10 minutes.`;
          this.startOtpCountdown(30);
          window.showToast(`📱 New OTP sent to +91 ${res.phone}`, "info");
        } catch (err) {
          window.showToast(err.message, "error");
        }
      });
    }

    // Auth OTP Form Submit
    if (this.authOtpForm) {
      this.authOtpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const enteredOtp = this.otpCells.map(c => (c ? c.value : "")).join("").trim();

        if (enteredOtp.length !== 4) {
          window.showToast("Please enter the complete 4-digit OTP", "error");
          return;
        }

        const res = WeaveStore.verifyOtp(enteredOtp);
        if (res.success) {
          clearInterval(this.resendTimer);

          document.getElementById("authStepOtp").style.display = "none";
          const successStep = document.getElementById("authStepSuccess");
          successStep.style.display = "block";
          document.getElementById("authSuccessTitle").textContent = "WELCOME TO THE WAVE!";
          document.getElementById("authSuccessSub").textContent = `Authenticated as ${res.user.name} (+91 ${res.user.phone})`;

          setTimeout(() => {
            this.closeAuthModal();
            window.showToast(`Logged in successfully! Welcome, ${res.user.name}.`, "success");
          }, 1200);
        } else {
          window.showToast(res.message, "error");
          this.otpCells.forEach(cell => {
            if (cell) {
              cell.style.borderColor = "var(--c-coral)";
              setTimeout(() => { cell.style.borderColor = ""; }, 1800);
            }
          });
          if (this.otpCells[0]) this.otpCells[0].focus();
        }
      });
    }
  }

  openAuthModal() {
    if (!this.authModal) return;
    document.getElementById("authStepPhone").style.display = "block";
    document.getElementById("authStepOtp").style.display = "none";
    document.getElementById("authStepSuccess").style.display = "none";
    if (this.phoneInput) {
      this.phoneInput.value = "";
      setTimeout(() => this.phoneInput.focus(), 150);
    }
    if (this.nameInput) this.nameInput.value = "";
    this.authModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeAuthModal() {
    if (!this.authModal) return;
    clearInterval(this.resendTimer);
    this.authModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  openAccountModal(tab = "orders") {
    if (!this.accountModal) return;
    this.accountModal.classList.add("active");
    document.body.style.overflow = "hidden";

    if (tab === "profile") {
      document.getElementById("accTabProfile").click();
    } else {
      document.getElementById("accTabOrders").click();
    }
  }

  closeAccountModal() {
    if (!this.accountModal) return;
    this.accountModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggleUserDropdown() {
    if (!this.userDropdown) return;
    this.userDropdown.classList.toggle("active");
  }

  closeUserDropdown() {
    if (!this.userDropdown) return;
    this.userDropdown.classList.remove("active");
  }

  startOtpCountdown(seconds = 30) {
    clearInterval(this.resendTimer);
    const countdownEl = document.getElementById("otpCountdown");
    const timerText = document.getElementById("otpTimerText");
    const resendBtn = document.getElementById("resendOtpBtn");

    timerText.style.display = "inline";
    resendBtn.style.display = "none";
    countdownEl.textContent = `${seconds}s`;

    let remaining = seconds;
    this.resendTimer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(this.resendTimer);
        timerText.style.display = "none";
        resendBtn.style.display = "inline";
      } else {
        countdownEl.textContent = `${remaining}s`;
      }
    }, 1000);
  }

  updateAuthUi() {
    const user = WeaveStore.getCurrentUser();
    const isLoggedIn = !!user;

    // Online indicator dots
    if (this.onlineDot) {
      this.onlineDot.style.display = isLoggedIn ? "block" : "none";
    }
    if (this.menubarOnlineDot) {
      this.menubarOnlineDot.style.display = isLoggedIn ? "block" : "none";
    }
    const dockDot = document.getElementById("dockOnlineDot");
    const dockLabel = document.getElementById("dockAccountLabel");
    if (dockDot) dockDot.style.display = isLoggedIn ? "block" : "none";
    if (dockLabel) dockLabel.textContent = isLoggedIn ? (user.name ? user.name.split(" ")[0] : "Account") : "Login";

    if (this.openAuthBtn) {
      this.openAuthBtn.title = isLoggedIn ? `Account: ${user.name}` : "Sign In / Register";
    }
    if (this.menubarLoginBtn) {
      this.menubarLoginBtn.title = isLoggedIn ? `Account: ${user.name}` : "Sign In / Register";
    }

    // Dropdown & Menubar details
    if (isLoggedIn) {
      const name = user.name || "Bro Member";
      const firstName = name.split(" ")[0] || "Bro";
      const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "WB";

      if (this.menubarLoginLabel) {
        this.menubarLoginLabel.textContent = `Hi, ${firstName}`;
      }
      if (this.menubarAvatar) {
        this.menubarAvatar.innerHTML = `<span style="font-weight: 800; font-size: 0.72rem; line-height: 1;">${initials}</span>`;
      }

      const nameEl = document.getElementById("dropdownUserName");
      const phoneEl = document.getElementById("dropdownUserPhone");
      const avatarEl = document.getElementById("dropdownAvatar");

      if (nameEl) nameEl.textContent = name;
      if (phoneEl) phoneEl.textContent = `+91 ${user.phone}`;
      if (avatarEl) avatarEl.textContent = initials;

      // Menu Drawer details
      const menuLoggedOut = document.getElementById("menuAuthLoggedOut");
      const menuLoggedIn = document.getElementById("menuAuthLoggedIn");
      if (menuLoggedOut) menuLoggedOut.style.display = "none";
      if (menuLoggedIn) menuLoggedIn.style.display = "block";

      const menuNameEl = document.getElementById("menuUserName");
      const menuPhoneEl = document.getElementById("menuUserPhone");
      const menuAvatarEl = document.getElementById("menuUserAvatar");
      if (menuNameEl) menuNameEl.textContent = name;
      if (menuPhoneEl) menuPhoneEl.textContent = `+91 ${user.phone}`;
      if (menuAvatarEl) menuAvatarEl.textContent = initials;

      // Account modal details
      const accBigAvatar = document.getElementById("accountBigAvatar");
      const accNameHeading = document.getElementById("accountNameHeading");
      const accPhoneSub = document.getElementById("accountPhoneSub");

      if (accBigAvatar) accBigAvatar.textContent = initials;
      if (accNameHeading) accNameHeading.textContent = name;
      if (accPhoneSub) accPhoneSub.textContent = `+91 ${user.phone} • Bro Tribe Member`;

      this.fillProfileForm();
      this.renderUserOrders();
    } else {
      if (this.menubarLoginLabel) {
        this.menubarLoginLabel.textContent = "Login";
      }
      if (this.menubarAvatar) {
        this.menubarAvatar.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        `;
      }
      const menuLoggedOut = document.getElementById("menuAuthLoggedOut");
      const menuLoggedIn = document.getElementById("menuAuthLoggedIn");
      if (menuLoggedOut) menuLoggedOut.style.display = "flex";
      if (menuLoggedIn) menuLoggedIn.style.display = "none";

      this.closeUserDropdown();
      this.closeAccountModal();
    }
  }

  fillProfileForm() {
    const user = WeaveStore.getCurrentUser();
    if (!user) return;

    if (document.getElementById("profileNameInput")) document.getElementById("profileNameInput").value = user.name || "";
    if (document.getElementById("profileEmailInput")) document.getElementById("profileEmailInput").value = user.email || "";
    if (document.getElementById("profileAddressInput")) document.getElementById("profileAddressInput").value = user.address || "";
    if (document.getElementById("profileCityInput")) document.getElementById("profileCityInput").value = user.city || "";
    if (document.getElementById("profilePincodeInput")) document.getElementById("profilePincodeInput").value = user.pincode || "";
  }

  renderUserOrders() {
    const user = WeaveStore.getCurrentUser();
    const container = document.getElementById("userOrdersListContainer");
    const countBadge = document.getElementById("accOrderCount");
    if (!container) return;

    const orders = WeaveStore.getUserOrders(user ? user.phone : null);
    if (countBadge) countBadge.textContent = orders.length;

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 2.2rem; margin-bottom: 10px;">📦</div>
          <h4 style="font-family: var(--font-heading); font-size: 1.1rem; margin-bottom: 6px;">No orders yet</h4>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 18px;">
            You haven't placed any orders yet. Discover our 240+ GSM heavyweight collection!
          </p>
          <button class="btn btn-primary btn-sm" onclick="window.weaveApp.closeAccountModal(); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });">
            Explore Drops
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(ord => `
      <div class="account-order-card">
        <div class="order-card-header">
          <div>
            <div style="font-family: var(--font-heading); font-weight: 800; font-size: 0.95rem; color: var(--c-wave-500);">
              Order #${ord.id}
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">Placed on ${ord.date}</div>
          </div>
          <span class="badge ${ord.status === 'Delivered' ? 'badge-wave' : ord.status === 'Shipped' ? 'badge-amber' : 'badge-dark'}">
            ● ${ord.status}
          </span>
        </div>

        <div class="order-card-items-wrap">
          ${ord.items.map(item => `
            <div class="order-mini-item">
              <img src="${item.image}" alt="${item.title}" class="order-mini-thumb" onerror="this.src='assets/images/tee-navy.jpg'">
              <div style="flex-grow: 1;">
                <div style="font-size: 0.84rem; font-weight: 700; color: var(--text-primary);">${item.title}</div>
                <div style="font-size: 0.72rem; color: var(--text-secondary);">Size: <strong>${item.size}</strong> • Qty: ${item.quantity} • ${item.color}</div>
              </div>
              <div style="font-family: var(--font-heading); font-weight: 800; font-size: 0.88rem;">₹${(item.price * item.quantity).toFixed(0)}</div>
            </div>
          `).join("")}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border-light); padding-top: 10px; font-size: 0.82rem;">
          <span style="color: var(--text-secondary);">Paid via <strong>${ord.paymentMethod}</strong></span>
          <span style="font-family: var(--font-heading); font-weight: 800; font-size: 1rem;">Total: ₹${ord.total.toFixed(0)}</span>
        </div>
      </div>
    `).join("");
  }

  // --- MOBILE BOTTOM DOCK CONTROLLER ---
  initMobileDock() {
    const dockHome = document.getElementById("dockHomeBtn");
    const dockDrops = document.getElementById("dockDropsBtn");
    const dockSearch = document.getElementById("dockSearchBtn");
    const dockWishlist = document.getElementById("dockWishlistBtn");
    const dockCart = document.getElementById("dockCartBtn");
    const dockAccount = document.getElementById("dockAccountBtn");

    if (dockCart) {
      dockCart.addEventListener("click", () => this.openCart());
    }

    if (dockWishlist) {
      dockWishlist.addEventListener("click", () => {
        const wishlistBtn = document.getElementById("wishlistTriggerBtn");
        if (wishlistBtn) wishlistBtn.click();
      });
    }

    if (dockSearch) {
      dockSearch.addEventListener("click", () => {
        const searchInput = document.getElementById("headerSearchInput");
        if (searchInput) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => searchInput.focus(), 250);
        }
      });
    }

    if (dockAccount) {
      dockAccount.addEventListener("click", () => {
        if (WeaveStore.isLoggedIn()) {
          this.openAccountModal();
        } else {
          this.openAuthModal();
        }
      });
    }

    // Active dock indicator on scroll
    const updateActiveDock = () => {
      const scrollPos = window.scrollY + 200;
      const catalogEl = document.getElementById("catalog");
      if (catalogEl && scrollPos >= catalogEl.offsetTop) {
        if (dockDrops) dockDrops.classList.add("active");
        if (dockHome) dockHome.classList.remove("active");
      } else {
        if (dockHome) dockHome.classList.add("active");
        if (dockDrops) dockDrops.classList.remove("active");
      }
    };
    window.addEventListener("scroll", updateActiveDock, { passive: true });
  }

  // --- STORE MENU DRAWER CONTROLLER (Three Lines Navigation) ---
  openMenuDrawer() {
    const overlay = document.getElementById("menuDrawerOverlay");
    if (overlay) {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  closeMenuDrawer() {
    const overlay = document.getElementById("menuDrawerOverlay");
    if (overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  initMenuDrawer() {
    const openBtn = document.getElementById("openMenuDrawerBtn");
    const menubarBtn = document.getElementById("menubarThreeLinesBtn");
    const closeBtn = document.getElementById("closeMenuDrawerBtn");
    const overlay = document.getElementById("menuDrawerOverlay");

    if (openBtn) openBtn.addEventListener("click", () => this.openMenuDrawer());
    if (menubarBtn) menubarBtn.addEventListener("click", () => this.openMenuDrawer());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeMenuDrawer());
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) this.closeMenuDrawer();
      });
    }

    // Drawer Auth Trigger
    const menuLoginBtn = document.getElementById("menuLoginTriggerBtn");
    if (menuLoginBtn) {
      menuLoginBtn.addEventListener("click", () => {
        this.closeMenuDrawer();
        this.openAuthModal();
      });
    }

    // Drawer User Action Buttons
    const menuMyOrders = document.getElementById("menuMyOrdersBtn");
    if (menuMyOrders) {
      menuMyOrders.addEventListener("click", () => {
        this.closeMenuDrawer();
        this.openAccountModal();
        const ordersTab = document.getElementById("accTabOrders");
        if (ordersTab) ordersTab.click();
      });
    }

    const menuMyProfile = document.getElementById("menuMyProfileBtn");
    if (menuMyProfile) {
      menuMyProfile.addEventListener("click", () => {
        this.closeMenuDrawer();
        this.openAccountModal();
        const profileTab = document.getElementById("accTabProfile");
        if (profileTab) profileTab.click();
      });
    }

    const menuLogout = document.getElementById("menuLogoutBtn");
    if (menuLogout) {
      menuLogout.addEventListener("click", () => {
        WeaveStore.logout();
        window.showToast("Signed out successfully. See you soon, Bro!", "info");
      });
    }

    // Drawer Category Filter Buttons
    document.querySelectorAll("[data-drawer-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.drawerFilter;
        this.currentFilter = filter;
        
        // Synchronize main page filter buttons
        document.querySelectorAll("#filterCategoryButtons .filter-btn").forEach(b => {
          b.classList.toggle("active", b.dataset.filter === filter);
        });

        // Synchronize menubar links
        document.querySelectorAll(".menubar-link").forEach(l => {
          l.classList.toggle("active", l.dataset.filter === filter);
        });

        // Synchronize drawer buttons
        document.querySelectorAll("[data-drawer-filter]").forEach(b => {
          b.classList.toggle("active", b.dataset.drawerFilter === filter);
        });

        this.renderProducts();
        this.closeMenuDrawer();

        const catalogEl = document.getElementById("catalog");
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Drawer Science & Guides
    const fabricLink = document.getElementById("menuFabricScienceLink");
    if (fabricLink) {
      fabricLink.addEventListener("click", () => this.closeMenuDrawer());
    }

    const reviewsLink = document.getElementById("menuReviewsLink");
    if (reviewsLink) {
      reviewsLink.addEventListener("click", () => this.closeMenuDrawer());
    }

    const sizeGuideBtn = document.getElementById("menuSizeGuideBtn");
    if (sizeGuideBtn) {
      sizeGuideBtn.addEventListener("click", () => {
        this.closeMenuDrawer();
        const guideModal = document.getElementById("sizeGuideModal");
        if (guideModal) guideModal.classList.add("active");
      });
    }

    // Drawer Store Tools
    const adminBtn = document.getElementById("menuAdminBtn");
    if (adminBtn) {
      adminBtn.addEventListener("click", () => {
        this.closeMenuDrawer();
        const adminModal = document.getElementById("adminModal");
        if (adminModal) adminModal.classList.add("active");
      });
    }

    const wishlistBtn = document.getElementById("menuWishlistBtn");
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () => {
        this.closeMenuDrawer();
        const mainWishlist = document.getElementById("wishlistTriggerBtn");
        if (mainWishlist) mainWishlist.click();
      });
    }

    const cartBtn = document.getElementById("menuCartBtn");
    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        this.closeMenuDrawer();
        this.openCart();
      });
    }

    const themeToggleBtn = document.getElementById("menuThemeToggleBtn");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const mainThemeToggle = document.getElementById("themeToggleBtn");
        if (mainThemeToggle) mainThemeToggle.click();
      });
    }
  }
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.weaveApp = new WeaveApp();
});

