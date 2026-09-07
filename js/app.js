/**
 * StreamOps CRM - Ana Uygulama Koordinatörü & Çok Kullanıcılı SPA Yönlendiricisi
 * Firebase Kimlik Doğrulama, İstemci SPA Navigasyonu ve Veri İzolasyonu.
 */

import { Firebase } from './services/firebaseConfig.js';
import { Storage } from './services/storage.js';
import { RookieView } from './views/rookieView.js';
import { ProView } from './views/proView.js';
import { ModalManager } from './views/modals.js';

class App {
  constructor() {
    this.currentMode = Storage.getUserMode(); // 'rookie' | 'pro'
    this.currentTheme = Storage.getTheme();
    this.rookieView = new RookieView(this);
    this.proView = new ProView(this);
    this.modals = new ModalManager(this);
    this.authMode = 'login'; // 'login' | 'register'
    this.isAutoScrolling = false;
    this.autoScrollTimer = null;
    this.activeRookieSection = 'all';
    this.activeProTab = 'kanban';
    this.revealObserver = null;
    this.scrollSpyAttached = false;
  }

  async init() {
    this.applyTheme(this.currentTheme);
    this.setupAuthUI();
    this.setupNavigation();
    this.setupModeToggle();

    // Oturum kontrolü
    const user = Firebase.getCurrentUser();
    if (!user) {
      this.showAuthOverlay();
    } else {
      this.hideAuthOverlay();
      this.updateUserBadge(user.username);
      this.renderCurrentView();
    }

    console.log('StreamOps SaaS SPA başarıyla hazırlandı.');
  }

  // =========================================================================
  // 1. ÇOK KULLANICILI KİMLİK DOĞRULAMA (FIREBASE AUTH)
  // =========================================================================
  setupAuthUI() {
    const authOverlay = document.getElementById('auth-overlay');
    const authForm = document.getElementById('form-auth');
    const tabLogin = document.getElementById('btn-auth-tab-login');
    const tabRegister = document.getElementById('btn-auth-tab-register');
    const btnSubmit = document.getElementById('btn-auth-submit');
    const btnText = document.getElementById('auth-btn-text');
    const errorBox = document.getElementById('auth-error-msg');
    const logoutBtn = document.getElementById('btn-sidebar-logout');

    // Tab geçişi: Giriş Yap vs Kayıt Ol
    tabLogin?.addEventListener('click', () => {
      this.authMode = 'login';
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      btnText.textContent = 'Giriş Yap';
      errorBox.style.display = 'none';
    });

    tabRegister?.addEventListener('click', () => {
      this.authMode = 'register';
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      btnText.textContent = 'Hesap Oluştur ve Başla';
      errorBox.style.display = 'none';
    });

    // Form Gönderimi (Username + Password)
    authForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;

      if (!username || !password) {
        errorBox.textContent = 'Lütfen kullanıcı adı ve şifrenizi girin.';
        errorBox.style.display = 'block';
        return;
      }

      btnSubmit.style.opacity = '0.6';
      btnSubmit.style.pointerEvents = 'none';
      btnText.textContent = 'Doğrulanıyor...';
      errorBox.style.display = 'none';

      try {
        let result;
        if (this.authMode === 'register') {
          result = await Firebase.register(username, password);
        } else {
          result = await Firebase.login(username, password);
        }

        btnSubmit.style.opacity = '1';
        btnSubmit.style.pointerEvents = 'auto';

        if (result && result.success) {
          this.hideAuthOverlay();
          this.updateUserBadge(result.user.username);
          this.currentMode = Storage.getUserMode();
          this.setupModeToggle();
          this.renderCurrentView();
          this.showNotification(
            this.authMode === 'register' ? '🎉 Hoş Geldiniz' : '👋 Tekrar Hoş Geldiniz',
            `@${result.user.username} menajerlik çalışma alanı açıldı.`
          );
        }
      } catch (err) {
        btnSubmit.style.opacity = '1';
        btnSubmit.style.pointerEvents = 'auto';
        btnText.textContent = this.authMode === 'register' ? 'Hesap Oluştur ve Başla' : 'Giriş Yap';
        errorBox.textContent = err.message || 'Kimlik doğrulama başarısız oldu.';
        errorBox.style.display = 'block';
      }
    });

    // Oturumu Kapat Butonu
    logoutBtn?.addEventListener('click', async () => {
      if (confirm('Oturumunuzu kapatmak istediğinize emin misiniz?')) {
        await Firebase.logout();
        this.showAuthOverlay();
        this.showNotification('Çıkış Yapıldı', 'Güvenli şekilde oturum kapatıldı.');
      }
    });
  }

  showAuthOverlay() {
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay) authOverlay.style.display = 'flex';
  }

  hideAuthOverlay() {
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay) authOverlay.style.display = 'none';
  }

  updateUserBadge(username) {
    const handleEl = document.getElementById('sidebar-user-handle');
    const displayNameEl = document.getElementById('user-display-name');
    if (handleEl) handleEl.textContent = `@${username}`;
    if (displayNameEl) displayNameEl.textContent = `${username.charAt(0).toUpperCase() + username.slice(1)} Workspace`;
  }

  // =========================================================================
  // 2. SOL MENÜ SPA NAVİGASYONU & AKTİF SEKME SENKRONİZASYONU
  // =========================================================================
  setupNavigation() {
    // Theme toggle
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Sidebar collapse / expand
    const toggleSidebarBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('app-sidebar');
    toggleSidebarBtn?.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });

    // Hızlı Ekle butonu
    document.getElementById('btn-top-quick-add')?.addEventListener('click', () => {
      this.modals.openStreamerModal();
    });

    // SOL MENÜ LİNKLERİ (SPA ROUTER)
    document.querySelectorAll('.nav-link-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. Modal / Ekleme Aksiyonları
        const action = link.getAttribute('data-action');
        if (action === 'add-streamer') { this.modals.openStreamerModal(); return; }
        if (action === 'add-task') { this.modals.openTaskModal(); return; }
        if (action === 'add-brand') { this.modals.openBrandModal(); return; }
        if (action === 'add-campaign') { this.modals.openCampaignModal(); return; }

        // 2. SPA Panel / Sekme Geçişi
        const view = link.getAttribute('data-view');
        if (!view) return;

        if (this.currentMode === 'rookie') {
          this.setActiveNav(view, true);
        } else {
          this.setActiveProTab(view);
        }
      });
    });
  }

  setActiveNav(view, shouldScroll = false) {
    this.activeRookieSection = view;

    const rookieNav = document.getElementById('sidebar-rookie-nav');
    if (rookieNav) {
      rookieNav.querySelectorAll('.nav-link-item').forEach(l => {
        const v = l.getAttribute('data-view');
        l.classList.toggle('active', v === view);
      });
    }

    const breadcrumbSub = document.getElementById('topbar-breadcrumb-sub');
    if (breadcrumbSub && this.currentMode === 'rookie') {
      const viewNames = {
        all: 'Genel Bakış',
        talents: 'Yetenekler & Kadro',
        tasks: 'Görevler & To-Do',
        brands: 'Görüşülen Markalar',
        tips: 'Menajerlik Rehberi'
      };
      if (viewNames[view]) {
        breadcrumbSub.textContent = viewNames[view];
      }
    }

    if (shouldScroll && this.currentMode === 'rookie') {
      this.isAutoScrolling = true;
      clearTimeout(this.autoScrollTimer);
      this.autoScrollTimer = setTimeout(() => {
        this.isAutoScrolling = false;
      }, 750);
      this.rookieView.setPanel(view);
    }
  }

  setActiveProTab(tabName) {
    this.activeProTab = tabName;

    const proNav = document.getElementById('sidebar-pro-nav');
    if (proNav) {
      proNav.querySelectorAll('.nav-link-item').forEach(l => {
        const v = l.getAttribute('data-view');
        l.classList.toggle('active', v === tabName);
      });
    }

    const breadcrumbSub = document.getElementById('topbar-breadcrumb-sub');
    if (breadcrumbSub && this.currentMode === 'pro') {
      const proNames = {
        kanban: 'Kampanya Kanban Panosu',
        roster: 'Kadro & Sözleşmeler Tablosu',
        finance: 'Finans & Komisyon Hesaplayıcı'
      };
      if (proNames[tabName]) {
        breadcrumbSub.textContent = proNames[tabName];
      }
    }

    this.proView.setTab(tabName);
  }

  scrollToSection(section) {
    setTimeout(() => {
      if (this.currentMode === 'rookie') {
        this.setActiveNav(section, true);
      } else {
        const tabMap = {
          talents: 'roster',
          streamers: 'roster',
          campaigns: 'kanban',
          finance: 'finance',
          tasks: 'kanban',
          brands: 'kanban',
          roster: 'roster',
          kanban: 'kanban'
        };
        const targetTab = tabMap[section] || 'kanban';
        this.setActiveProTab(targetTab);
      }
    }, 80);
  }

  // =========================================================================
  // SCROLL-SPY: SAYFA KAYDIRILDIKÇA AKTİF MENÜ ROZETİNİ BİREBİR SENKRONİZE ET
  // =========================================================================
  setupScrollSpy() {
    const container = document.getElementById('app-view-container');
    if (!container || this.scrollSpyAttached) return;

    this.scrollSpyAttached = true;
    let ticking = false;

    container.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScrollSpy();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  handleScrollSpy() {
    if (this.currentMode !== 'rookie' || this.isAutoScrolling) return;

    const container = document.getElementById('app-view-container');
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // 1. Tepeye yakınsa 'all' (Genel Bakış)
    if (scrollTop < 55) {
      if (this.activeRookieSection !== 'all') {
        this.setActiveNav('all', false);
      }
      return;
    }

    // 2. En alta ulaşıldıysa son bölüm 'tips' (Menajerlik Rehberi)
    if (scrollTop + clientHeight >= scrollHeight - 35) {
      if (this.activeRookieSection !== 'tips') {
        this.setActiveNav('tips', false);
      }
      return;
    }

    // 3. Bölümleri sırayla tara
    const containerTop = container.getBoundingClientRect().top;
    const sections = ['talents', 'tasks', 'brands', 'tips'];
    let current = 'all';

    for (const sec of sections) {
      const el = container.querySelector(`#panel-${sec}`);
      if (el) {
        const relativeTop = el.getBoundingClientRect().top - containerTop;
        // Panel başlığı ekran üstüne 150px yaklaştığında aktif sayılır
        if (relativeTop <= 150) {
          current = sec;
        }
      }
    }

    if (current && current !== this.activeRookieSection) {
      this.setActiveNav(current, false);
    }
  }

  // =========================================================================
  // SCROLL REVEAL: AKICI, JİLETSİZ VE PERFORMANSLI ANİMASYONLAR (INTERSECTION OBSERVER)
  // =========================================================================
  setupScrollReveal() {
    const container = document.getElementById('app-view-container');
    if (!container) return;

    if (this.revealObserver) {
      this.revealObserver.disconnect();
    }

    const observerOptions = {
      root: container,
      rootMargin: '0px 0px -25px 0px',
      threshold: [0, 0.05]
    };

    this.revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elementsToReveal = container.querySelectorAll('.reveal-on-scroll:not(.revealed)');
    const containerRect = container.getBoundingClientRect();

    elementsToReveal.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Halihazırda görünen alandaki öğeleri anında görünür yap
      if (rect.top < containerRect.bottom - 15 && rect.bottom > containerRect.top) {
        el.classList.add('revealed');
      } else {
        this.revealObserver.observe(el);
      }
    });
  }

  // =========================================================================
  // 3. MOD GEÇİŞ SİSTEMİ (ÇAYLAK <-> PRO)
  // =========================================================================
  setupModeToggle() {
    const toggleBtn = document.getElementById('mode-toggle-btn');
    const modeBadge = document.getElementById('active-mode-badge');

    const updateModeUI = (mode) => {
      this.currentMode = mode;
      Storage.setUserMode(mode);

      if (mode === 'pro') {
        toggleBtn.innerHTML = `
          <span class="mode-icon">⚡</span>
          <span class="mode-text">Pro Menajer</span>
          <span class="mode-badge-pill pro">PRO</span>
        `;
        if (modeBadge) {
          modeBadge.textContent = '⚡ Pro';
          modeBadge.className = 'workspace-role-badge badge-pro';
        }
      } else {
        toggleBtn.innerHTML = `
          <span class="mode-icon">🌱</span>
          <span class="mode-text">Çaylak Modu</span>
          <span class="mode-badge-pill rookie">ÇAYLAK</span>
        `;
        if (modeBadge) {
          modeBadge.textContent = '🌱 Çaylak';
          modeBadge.className = 'workspace-role-badge badge-rookie';
        }
      }

      this.updateSidebarNav(mode);
      this.renderCurrentView();
    };

    toggleBtn?.addEventListener('click', () => {
      const nextMode = this.currentMode === 'rookie' ? 'pro' : 'rookie';
      updateModeUI(nextMode);
      this.showNotification(
        nextMode === 'pro' ? '⚡ Pro Moduna Geçildi' : '🌱 Çaylak Moduna Geçildi',
        nextMode === 'pro' 
          ? 'Gelişmiş sözleşme tablosu, hakediş defteri ve Kanban panosu aktif.' 
          : 'Sadeleştirilmiş arayüz ve el kitabı ipuçları aktif.'
      );
    });

    updateModeUI(this.currentMode);
  }

  updateSidebarNav(mode) {
    const rookieNav = document.getElementById('sidebar-rookie-nav');
    const proNav = document.getElementById('sidebar-pro-nav');
    const breadcrumbSub = document.getElementById('topbar-breadcrumb-sub');

    if (rookieNav && proNav) {
      if (mode === 'pro') {
        rookieNav.style.display = 'none';
        proNav.style.display = 'block';
        if (breadcrumbSub) breadcrumbSub.textContent = 'Kampanya Kanban Panosu';
        this.setActiveProTab(this.activeProTab || 'kanban');
      } else {
        rookieNav.style.display = 'block';
        proNav.style.display = 'none';
        if (breadcrumbSub) breadcrumbSub.textContent = 'Genel Bakış';
        this.setActiveNav(this.activeRookieSection || 'all', false);
      }
    }
  }

  async renderCurrentView() {
    const container = document.getElementById('app-view-container');
    if (!container) return;

    if (this.currentMode === 'pro') {
      await this.proView.render(container);
    } else {
      await this.rookieView.render(container);
    }

    this.setupScrollReveal();
    this.setupScrollSpy();
  }

  refreshCurrentView() {
    this.renderCurrentView();
  }

  // =========================================================================
  // TEMA & BİLDİRİMLER
  // =========================================================================
  applyTheme(theme) {
    this.currentTheme = theme;
    Storage.setTheme(theme);

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  toggleTheme() {
    const next = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
  }

  showNotification(title, message) {
    let toast = document.getElementById('notion-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'notion-toast';
      toast.className = 'notion-toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    `;
    toast.classList.add('show');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}

// Uygulamayı Başlat
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
