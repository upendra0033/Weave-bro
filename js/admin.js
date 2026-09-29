// Weave Bro - Admin Console Controller
// Handles Full CRUD for Products, Store Content, Promo Codes, and Order Tracking

class AdminController {
  constructor() {
    this.modal = document.getElementById("adminModal");
    this.closeBtn = document.getElementById("closeAdminModalBtn");
    this.openBtn = document.getElementById("openAdminBtn");
    this.footerAdminLink = document.getElementById("footerAdminLink");
    this.tabButtons = document.querySelectorAll(".admin-tab-btn");
    this.panels = document.querySelectorAll(".admin-panel");

    // Product Form Elements
    this.toggleFormBtn = document.getElementById("toggleAddProductFormBtn");
    this.formContainer = document.getElementById("addProductFormContainer");
    this.productForm = document.getElementById("productManageForm");
    this.cancelFormBtn = document.getElementById("cancelProductFormBtn");
    this.productsTableBody = document.getElementById("adminProductsTableBody");
    this.presetPicker = document.getElementById("presetImagePickerButtons");

    // Storefront Settings Form
    this.settingsForm = document.getElementById("storeSettingsForm");

    // Promos Form & Table
    this.promoForm = document.getElementById("addPromoForm");
    this.promosTableBody = document.getElementById("adminPromosTableBody");

    // Orders Table
    this.ordersTableBody = document.getElementById("adminOrdersTableBody");

    // Tools
    this.exportBtn = document.getElementById("exportDataBtn");
    this.resetBtn = document.getElementById("resetDefaultsBtn");

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderPresets();
    this.syncAll();

    // Listen to store updates
    WeaveStore.subscribe((event) => {
      if (event === "PRODUCTS_UPDATED") this.renderProductsTable();
      if (event === "SETTINGS_UPDATED") this.syncSettingsForm();
      if (event === "PROMOS_UPDATED") this.renderPromosTable();
      if (event === "ORDERS_UPDATED") this.renderOrdersTable();
    });
  }

  bindEvents() {
    // Open / Close Modal
    if (this.openBtn) {
      this.openBtn.addEventListener("click", () => this.open());
    }
    if (this.footerAdminLink) {
      this.footerAdminLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.open();
      });
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    // Backdrop click
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });

    // Keyboard shortcut (Ctrl + Shift + A) and Esc to close
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        if (this.modal.classList.contains("active")) {
          this.close();
        } else {
          this.open();
        }
      } else if (e.key === "Escape" && this.modal.classList.contains("active")) {
        this.close();
      }
    });

    // Logo double-click secret trigger for Admin
    const brandLogo = document.getElementById("brandHomeBtn");
    if (brandLogo) {
      brandLogo.addEventListener("dblclick", (e) => {
        e.preventDefault();
        this.open();
        window.showToast("Admin Console opened via Logo shortcut", "info");
      });
    }

    // Tab Switching
    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab;
        this.switchTab(tabId);
      });
    });

    // Toggle Add Product Form
    if (this.toggleFormBtn) {
      this.toggleFormBtn.addEventListener("click", () => {
        this.resetProductForm();
        const isHidden = this.formContainer.style.display === "none";
        this.formContainer.style.display = isHidden ? "block" : "none";
        if (isHidden) {
          document.getElementById("pFormTitle").focus();
        }
      });
    }

    if (this.cancelFormBtn) {
      this.cancelFormBtn.addEventListener("click", () => {
        this.formContainer.style.display = "none";
        this.resetProductForm();
      });
    }

    // Submit Product Form (Add / Edit)
    if (this.productForm) {
      this.productForm.addEventListener("submit", (e) => this.handleProductSubmit(e));
    }

    // Submit Settings Form
    if (this.settingsForm) {
      this.settingsForm.addEventListener("submit", (e) => this.handleSettingsSubmit(e));
    }

    // Submit Promo Form
    if (this.promoForm) {
      this.promoForm.addEventListener("submit", (e) => this.handlePromoSubmit(e));
    }

    // Export Data
    if (this.exportBtn) {
      this.exportBtn.addEventListener("click", () => this.exportStoreData());
    }

    // Reset Defaults
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all products, promo codes, and settings back to the default factory catalog?")) {
          WeaveStore.resetToDefaults();
          this.syncAll();
          window.showToast("Store catalog reset to default factory state!", "info");
        }
      });
    }
  }

  open() {
    this.syncAll();
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  switchTab(tabId) {
    this.tabButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    this.panels.forEach(panel => {
      panel.classList.toggle("active", panel.id === `tab-${tabId}`);
    });
  }

  syncAll() {
    this.renderProductsTable();
    this.syncSettingsForm();
    this.renderPromosTable();
    this.renderOrdersTable();
  }

  renderPresets() {
    if (!this.presetPicker) return;
    this.presetPicker.innerHTML = PRESET_IMAGE_OPTIONS.map(opt => `
      <button type="button" class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 0.72rem;" onclick="document.getElementById('pFormImage').value = '${opt.url}';">
        📷 ${opt.label}
      </button>
    `).join("");
  }

  // --- PRODUCTS MANAGEMENT ---
  renderProductsTable() {
    const products = WeaveStore.getProducts();
    if (!this.productsTableBody) return;

    if (products.length === 0) {
      this.productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No products in catalog. Click "+ Add New T-Shirt" to add one.
          </td>
        </tr>
      `;
      return;
    }

    this.productsTableBody.innerHTML = products.map(prod => `
      <tr>
        <td>
          <div class="admin-product-cell">
            <img src="${prod.image}" alt="${prod.title}" class="admin-thumb" onerror="this.src='assets/images/tee-navy.jpg'">
            <div>
              <div style="font-weight: 700; color: var(--text-primary); font-family: var(--font-heading);">${prod.title}</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">${prod.subtitle || ''}</div>
              ${prod.badge ? `<span class="badge badge-wave" style="font-size: 0.65rem; margin-top: 4px;">${prod.badge}</span>` : ''}
            </div>
          </div>
        </td>
        <td>
          <span class="badge-gsm">${prod.gsm} GSM</span>
        </td>
        <td>
          <span style="font-size: 0.78rem;">${prod.fit}</span>
        </td>
        <td>
          <div style="font-weight: 800; font-family: var(--font-heading);">₹${prod.price}</div>
          ${prod.comparePrice ? `<div style="font-size: 0.72rem; text-decoration: line-through; color: var(--text-muted);">₹${prod.comparePrice}</div>` : ''}
        </td>
        <td>
          <span style="font-weight: 700;">${prod.stock}</span>
        </td>
        <td>
          <button class="btn btn-sm ${prod.stock > 0 ? 'badge-wave' : 'badge-coral'}" style="cursor: pointer;" onclick="WeaveStore.toggleStock('${prod.id}')" title="Click to toggle stock">
            ${prod.stock > 0 ? '● In Stock' : '✕ Out of Stock'}
          </button>
        </td>
        <td>
          <div class="admin-action-btn-group">
            <button class="btn-action-icon" title="Edit T-Shirt" onclick="window.adminCtrl.startEditProduct('${prod.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="btn-action-icon danger" title="Delete T-Shirt" onclick="window.adminCtrl.deleteProduct('${prod.id}', '${prod.title}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  resetProductForm() {
    document.getElementById("editProductId").value = "";
    document.getElementById("productFormTitle").textContent = "ADD NEW T-SHIRT TO STORE";
    document.getElementById("pFormTitle").value = "";
    document.getElementById("pFormSubtitle").value = "";
    document.getElementById("pFormGsm").value = 240;
    document.getElementById("pFormPrice").value = 899;
    document.getElementById("pFormComparePrice").value = 1499;
    document.getElementById("pFormFit").value = "Oversized Boxy Fit";
    document.getElementById("pFormBadge").value = "NEW DROP";
    document.getElementById("pFormStock").value = 30;
    document.getElementById("pFormColorName").value = "Deep Navy";
    document.getElementById("pFormColorHex").value = "#0E1B33";
    document.getElementById("pFormImage").value = "assets/images/tee-navy.jpg";
    document.getElementById("pFormDesc").value = "Crafted with 100% pure combed cotton for a structured, high-fashion drape.";
  }

  startEditProduct(id) {
    const p = WeaveStore.getProductById(id);
    if (!p) return;

    this.formContainer.style.display = "block";
    document.getElementById("productFormTitle").textContent = `EDIT T-SHIRT: ${p.title}`;
    document.getElementById("editProductId").value = p.id;
    document.getElementById("pFormTitle").value = p.title;
    document.getElementById("pFormSubtitle").value = p.subtitle || "";
    document.getElementById("pFormGsm").value = p.gsm || 240;
    document.getElementById("pFormPrice").value = p.price;
    document.getElementById("pFormComparePrice").value = p.comparePrice || "";
    document.getElementById("pFormFit").value = p.fit || "Oversized Boxy Fit";
    document.getElementById("pFormBadge").value = p.badge || "";
    document.getElementById("pFormStock").value = p.stock !== undefined ? p.stock : 25;
    document.getElementById("pFormColorName").value = p.colorName || "";
    document.getElementById("pFormColorHex").value = p.colorHex || "#0A1128";
    document.getElementById("pFormImage").value = p.image || "";
    document.getElementById("pFormDesc").value = p.description || "";

    this.formContainer.scrollIntoView({ behavior: "smooth" });
  }

  handleProductSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById("editProductId").value;

    const data = {
      title: document.getElementById("pFormTitle").value,
      subtitle: document.getElementById("pFormSubtitle").value,
      gsm: Number(document.getElementById("pFormGsm").value),
      price: Number(document.getElementById("pFormPrice").value),
      comparePrice: Number(document.getElementById("pFormComparePrice").value),
      fit: document.getElementById("pFormFit").value,
      badge: document.getElementById("pFormBadge").value,
      stock: Number(document.getElementById("pFormStock").value),
      colorName: document.getElementById("pFormColorName").value,
      colorHex: document.getElementById("pFormColorHex").value,
      image: document.getElementById("pFormImage").value,
      gallery: [document.getElementById("pFormImage").value, "assets/images/hero-banner.jpg"],
      description: document.getElementById("pFormDesc").value,
      specs: [
        `${document.getElementById("pFormGsm").value} GSM Heavyweight pure combed cotton`,
        "Bio-washed & pre-shrunk weave",
        "Anti-bacon ribbed lycra neckline",
        "Tailored streetwear drop shoulder cut"
      ]
    };

    if (editId) {
      WeaveStore.updateProduct(editId, data);
      window.showToast(`Updated "${data.title}" successfully!`, "success");
    } else {
      WeaveStore.addProduct(data);
      window.showToast(`Added "${data.title}" to catalog!`, "success");
    }

    this.formContainer.style.display = "none";
    this.resetProductForm();
  }

  deleteProduct(id, title) {
    if (confirm(`Are you sure you want to remove "${title}" from the store?`)) {
      WeaveStore.deleteProduct(id);
      window.showToast(`Deleted "${title}" from catalog.`, "info");
    }
  }

  // --- STOREFRONT SETTINGS ---
  syncSettingsForm() {
    const s = WeaveStore.getSettings();
    if (!document.getElementById("adminSettingAnnouncement")) return;

    document.getElementById("adminSettingAnnouncement").value = s.announcement || "";
    document.getElementById("adminSettingHeroBadge").value = s.heroBadge || "";
    document.getElementById("adminSettingThreshold").value = s.freeShippingThreshold || 999;
    document.getElementById("adminSettingHeroTitle").value = s.heroTitle || "";
    document.getElementById("adminSettingHeroSubtitle").value = s.heroSubtitle || "";
    document.getElementById("adminSettingHeroCta").value = s.heroCtaText || "EXPLORE COLLECTION";
    document.getElementById("adminSettingHeroImg").value = s.heroBannerImage || "assets/images/hero-banner.jpg";
  }

  handleSettingsSubmit(e) {
    e.preventDefault();
    const updated = {
      announcement: document.getElementById("adminSettingAnnouncement").value,
      heroBadge: document.getElementById("adminSettingHeroBadge").value,
      freeShippingThreshold: Number(document.getElementById("adminSettingThreshold").value) || 999,
      heroTitle: document.getElementById("adminSettingHeroTitle").value,
      heroSubtitle: document.getElementById("adminSettingHeroSubtitle").value,
      heroCtaText: document.getElementById("adminSettingHeroCta").value,
      heroBannerImage: document.getElementById("adminSettingHeroImg").value
    };

    WeaveStore.updateSettings(updated);
    window.showToast("Storefront banners and settings updated!", "success");
  }

  // --- PROMOS MANAGEMENT ---
  renderPromosTable() {
    const promos = WeaveStore.getPromos();
    if (!this.promosTableBody) return;

    this.promosTableBody.innerHTML = promos.map(promo => `
      <tr>
        <td>
          <span class="badge badge-dark" style="font-family: var(--font-heading);">${promo.code}</span>
        </td>
        <td>
          <span style="font-weight: 800; color: var(--c-emerald);">${promo.discountPercent}% OFF</span>
        </td>
        <td>
          <span>₹${promo.minSpend || 0}</span>
        </td>
        <td>
          <span style="font-size: 0.78rem; color: var(--text-secondary);">${promo.description || ''}</span>
        </td>
        <td>
          <button class="btn-action-icon danger" title="Delete Promo" onclick="window.adminCtrl.deletePromo('${promo.code}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>
    `).join("");
  }

  handlePromoSubmit(e) {
    e.preventDefault();
    const code = document.getElementById("newPromoCode").value;
    const discount = Number(document.getElementById("newPromoPercent").value);
    const minSpend = Number(document.getElementById("newPromoMin").value) || 0;
    const desc = document.getElementById("newPromoDesc").value;

    try {
      WeaveStore.addPromo({ code, discountPercent: discount, minSpend, description: desc });
      window.showToast(`Promo code ${code.toUpperCase()} created!`, "success");
      this.promoForm.reset();
    } catch (err) {
      window.showToast(err.message, "error");
    }
  }

  deletePromo(code) {
    if (confirm(`Delete promo code "${code}"?`)) {
      WeaveStore.deletePromo(code);
      window.showToast(`Promo code "${code}" removed.`, "info");
    }
  }

  // --- ORDERS MANAGEMENT ---
  renderOrdersTable() {
    const orders = WeaveStore.getOrders();
    if (!this.ordersTableBody) return;

    if (orders.length === 0) {
      this.ordersTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No customer orders placed yet.
          </td>
        </tr>
      `;
      return;
    }

    this.ordersTableBody.innerHTML = orders.map(ord => {
      const itemsList = ord.items.map(it => `${it.quantity}x ${it.title} (${it.size})`).join(", ");
      return `
        <tr>
          <td>
            <strong style="font-family: var(--font-heading); color: var(--c-wave-500);">${ord.id}</strong>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${ord.date}</div>
          </td>
          <td>
            <div style="font-weight: 700;">${ord.customer?.name || 'Customer'}</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary);">${ord.customer?.city || ''} • ${ord.customer?.phone || ''}</div>
          </td>
          <td style="max-width: 220px; font-size: 0.75rem;">
            ${itemsList}
          </td>
          <td>
            <span style="font-weight: 800; font-family: var(--font-heading);">₹${ord.total.toFixed(0)}</span>
            ${ord.promoCode ? `<div style="font-size: 0.68rem; color: var(--c-emerald);">Used ${ord.promoCode}</div>` : ''}
          </td>
          <td>
            <span class="badge badge-dark" style="font-size: 0.68rem;">${ord.paymentMethod}</span>
          </td>
          <td>
            <span class="badge ${ord.status === 'Delivered' ? 'badge-wave' : ord.status === 'Shipped' ? 'badge-amber' : 'badge-dark'}" style="font-size: 0.7rem;">
              ${ord.status}
            </span>
          </td>
          <td>
            <select class="form-input" style="padding: 4px 8px; font-size: 0.74rem;" onchange="WeaveStore.updateOrderStatus('${ord.id}', this.value); window.showToast('Order status updated', 'success');">
              <option value="Processing" ${ord.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${ord.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");
  }

  // --- EXPORT TOOLS ---
  exportStoreData() {
    const backup = {
      exportedAt: new Date().toISOString(),
      store: "Weave Bro",
      tagline: "wear the wave",
      products: WeaveStore.getProducts(),
      settings: WeaveStore.getSettings(),
      promos: WeaveStore.getPromos(),
      orders: WeaveStore.getOrders()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weave_bro_store_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast("Store backup JSON downloaded!", "success");
  }
}

// Bind to window for global inline event handlers
window.addEventListener("DOMContentLoaded", () => {
  window.adminCtrl = new AdminController();
});
