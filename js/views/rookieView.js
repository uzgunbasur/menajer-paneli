/**
 * StreamOps CRM - Çaylak (Yeni Başlayan) Menajer Görünümü
 * Apple / Vercel Estetiğinde, SPA Sekme/Panel Yönlendirmesi Destekli.
 */

import { Storage } from '../services/storage.js';

export class RookieView {
  constructor(app) {
    this.app = app;
    this.currentPanel = 'all'; // 'all' | 'talents' | 'tasks' | 'brands' | 'tips'
  }

  async render(container) {
    const [streamers, tasks, brands, tips] = await Promise.all([
      Storage.getAll('streamers'),
      Storage.getAll('tasks'),
      Storage.getAll('brands'),
      Storage.getAll('tips')
    ]);

    const completedTasksCount = tasks.filter(t => t.completed).length;

    let html = `
      <div class="view-rookie fade-in">
        <!-- VERCEL ONBOARDING BANNER -->
        <div class="notion-callout notion-callout-info mb-6 reveal-on-scroll" id="rookie-banner">
          <div class="callout-icon">⚡</div>
          <div class="callout-content">
            <div class="callout-title">StreamOps Yetenek & Influencer Yönetim Paneli</div>
            <p class="callout-desc">
              Kick, Twitch yayıncıları ile YouTube ve Instagram influencer'larınızı tek ekrandan yönetin.
              Sol menüden istediğiniz panele geçiş yapabilir, sağ üstten <strong>⚡ Pro Menajer Modu</strong>'nu açabilirsiniz.
            </p>
          </div>
        </div>

        <!-- 1. PANEL: YETENEKLER & KADRO -->
        <div class="spa-panel section-container mb-8 reveal-on-scroll" id="panel-talents">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-emoji">✨</span>
              <div>
                <h2 class="section-title">Yetenekler & Kadro</h2>
                <p class="section-desc">Temsil ettiğiniz yayıncılar, YouTuber'lar ve Instagram içerik üreticileri.</p>
              </div>
            </div>
            <div class="section-actions">
              <button class="notion-btn notion-btn-primary" id="btn-add-streamer-rookie">
                <span>+</span> Yeni Yetenek Ekle
              </button>
            </div>
          </div>

          ${streamers.length > 0 ? `
            <div class="streamer-grid">
              ${streamers.map((s, idx) => this.renderTalentCard(s, idx)).join('')}
            </div>
          ` : `
            <div class="empty-state-card reveal-on-scroll">
              <div class="empty-state-icon-wrap">🎙️</div>
              <h3 class="empty-state-title">Kadroda Henüz Yetenek Bulunmuyor</h3>
              <p class="empty-state-desc">Kick/Twitch yayıncılarınızı, YouTube veya Instagram influencer'larınızı ekleyerek ajans portföyünüzü oluşturun.</p>
              <button class="notion-btn notion-btn-primary" id="btn-empty-add-talent">
                <span>+</span> İlk Yeteneğinizi Ekleyin
              </button>
            </div>
          `}
        </div>

        <!-- 2. PANEL: GÖREVLER -->
        <div class="spa-panel section-container mb-8 reveal-on-scroll" id="panel-tasks">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-emoji">📋</span>
              <div>
                <h2 class="section-title">Görevler & Hatırlatıcılar</h2>
                <p class="section-desc">${tasks.length} Görevden ${completedTasksCount} tanesi tamamlandı</p>
              </div>
            </div>
            <button class="notion-btn notion-btn-sm" id="btn-add-task-rookie">+ Görev Ekle</button>
          </div>

          ${tasks.length > 0 ? `
            <div class="task-list" id="rookie-task-list">
              ${tasks.map((t, idx) => this.renderTaskItem(t, idx)).join('')}
            </div>
          ` : `
            <div class="empty-state-card reveal-on-scroll" style="padding: 32px 16px;">
              <div class="empty-state-icon-wrap" style="width: 40px; height: 40px; font-size: 18px;">📋</div>
              <h4 class="empty-state-title" style="font-size: 13.5px;">Bekleyen Görev Yok</h4>
              <p class="empty-state-desc" style="font-size: 11.5px; margin-bottom: 12px;">Sponsorluk briefleri ve teslimat hatırlatıcıları ekleyin.</p>
              <button class="notion-btn notion-btn-secondary notion-btn-xs" id="btn-empty-add-task">+ Görev Oluştur</button>
            </div>
          `}
        </div>

        <!-- 3. PANEL: GÖRÜŞÜLEN MARKALAR -->
        <div class="spa-panel section-container mb-8 reveal-on-scroll" id="panel-brands">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-emoji">🤝</span>
              <div>
                <h2 class="section-title">Görüşülen Markalar</h2>
                <p class="section-desc">Aktif teklifler ve marka partnerlik süreçleri.</p>
              </div>
            </div>
            <button class="notion-btn notion-btn-sm" id="btn-add-brand-rookie">+ Marka Ekle</button>
          </div>

          ${brands.length > 0 ? `
            <div class="brand-list">
              ${brands.map((b, idx) => this.renderBrandItem(b, idx)).join('')}
            </div>
          ` : `
            <div class="empty-state-card reveal-on-scroll" style="padding: 32px 16px;">
              <div class="empty-state-icon-wrap" style="width: 40px; height: 40px; font-size: 18px;">🏢</div>
              <h4 class="empty-state-title" style="font-size: 13.5px;">Marka Görüşmesi Yok</h4>
              <p class="empty-state-desc" style="font-size: 11.5px; margin-bottom: 12px;">Teklif hazırladığınız markaları kaydedin.</p>
              <button class="notion-btn notion-btn-secondary notion-btn-xs" id="btn-empty-add-brand">+ Marka Ekle</button>
            </div>
          `}
        </div>

        <!-- 4. PANEL: REHBER & İPUÇLARI -->
        <div class="spa-panel section-container reveal-on-scroll" id="panel-tips">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-emoji">📚</span>
              <div>
                <h2 class="section-title">Menajerlik El Kitabı & Sektör Taktikleri</h2>
                <p class="section-desc">Kick, Twitch, YouTube ve Instagram iş birliklerinde temel stratejiler.</p>
              </div>
            </div>
          </div>

          <div class="tips-grid">
            ${tips.map((t, idx) => `
              <div class="tip-card reveal-on-scroll" style="transition-delay: ${(idx % 4) * 0.05}s;">
                <div class="tip-icon">${t.icon}</div>
                <div class="tip-body">
                  <div class="tip-tag">${t.category}</div>
                  <h4 class="tip-title">${t.title}</h4>
                  <p class="tip-content">${t.content}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.applyPanelVisibility(container);
    this.attachEvents(container);
  }

  setPanel(panelName) {
    this.currentPanel = panelName;
    const container = document.getElementById('app-view-container');
    if (!container) return;

    if (panelName === 'all') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = container.querySelector(`#panel-${panelName}`);
    if (target) {
      const targetOffset = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
      container.scrollTo({ top: Math.max(0, targetOffset - 18), behavior: 'smooth' });

      // Odaklanan paneli hafifçe parlat
      target.classList.remove('section-highlight');
      void target.offsetWidth;
      target.classList.add('section-highlight');
    }
  }

  applyPanelVisibility(container) {
    // Tüm paneller açık tutularak yumuşak kaydırma sağlanır
    container.querySelectorAll('.spa-panel').forEach(p => p.style.display = 'block');
  }

  renderTalentCard(s, idx = 0) {
    const isLive = s.status === 'live';
    const plat = s.primaryPlatform || 'Twitch';

    let platPillClass = 'pill-twitch';
    let platIcon = '🟣';
    if (plat === 'Kick') { platPillClass = 'pill-kick'; platIcon = '🟢'; }
    if (plat === 'YouTube') { platPillClass = 'pill-youtube'; platIcon = '🔴'; }
    if (plat === 'Instagram') { platPillClass = 'pill-instagram'; platIcon = '📸'; }

    const delay = ((idx % 6) * 0.05).toFixed(2);

    return `
      <div class="streamer-card notion-box reveal-on-scroll" data-id="${s.id}" style="transition-delay: ${delay}s;">
        <div class="streamer-card-header">
          <div class="avatar-wrap">
            <img src="${s.avatar}" alt="${s.name}" class="streamer-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=111111&color=ededed'">
            ${isLive ? '<span class="live-pill">CANLI</span>' : ''}
          </div>
          <div class="streamer-meta">
            <h3 class="streamer-name">${s.name}</h3>
            <span class="streamer-handle">${s.handle}</span>
          </div>
          <button class="icon-btn edit-streamer-btn" data-id="${s.id}" title="Düzenle">⚙️</button>
        </div>

        <div class="streamer-platforms-wrap">
          <span class="platform-pill ${platPillClass}">
            ${platIcon} ${plat}
          </span>
          <span class="notion-tag badge-subtle">${s.category || 'İçerik Üreticisi'}</span>
        </div>

        <div class="streamer-stats-row">
          <div class="stat-item">
            <span class="stat-label">Takipçi / Abone</span>
            <span class="stat-val">${s.followers || '0'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Metrik</span>
            <span class="stat-val">${s.avgViewers || '-'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Ajans Payı</span>
            <span class="stat-val text-accent">%${s.agencyCommission || 15}</span>
          </div>
        </div>

        <div class="streamer-card-actions">
          ${s.links?.kick ? `
            <a href="${s.links.kick}" target="_blank" rel="noopener noreferrer" class="platform-action-btn btn-platform-kick">
              🟢 Kick ↗
            </a>
          ` : ''}
          ${s.links?.twitch ? `
            <a href="${s.links.twitch}" target="_blank" rel="noopener noreferrer" class="platform-action-btn btn-platform-twitch">
              🟣 Twitch ↗
            </a>
          ` : ''}
          ${s.links?.youtube ? `
            <a href="${s.links.youtube}" target="_blank" rel="noopener noreferrer" class="platform-action-btn btn-platform-youtube">
              🔴 YouTube ↗
            </a>
          ` : ''}
          ${s.links?.instagram ? `
            <a href="${s.links.instagram}" target="_blank" rel="noopener noreferrer" class="platform-action-btn btn-platform-instagram">
              📸 Instagram ↗
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderTaskItem(t, idx = 0) {
    const priorityClass = t.priority === 'high' ? 'priority-high' : (t.priority === 'medium' ? 'priority-medium' : 'priority-low');
    const priorityText = t.priority === 'high' ? 'Acil' : (t.priority === 'medium' ? 'Normal' : 'Düşük');
    const delay = ((idx % 6) * 0.04).toFixed(2);

    return `
      <div class="task-item reveal-on-scroll ${t.completed ? 'completed' : ''}" data-id="${t.id}" style="transition-delay: ${delay}s;">
        <label class="custom-checkbox">
          <input type="checkbox" ${t.completed ? 'checked' : ''} data-id="${t.id}" class="task-checkbox">
          <span class="checkmark"></span>
        </label>
        
        <div class="task-content">
          <div class="task-title-line">
            <span class="task-title">${t.title}</span>
            <span class="task-priority ${priorityClass}">${priorityText}</span>
          </div>
          <div class="task-meta">
            <span class="task-streamer">${t.streamerName || 'Genel'}</span>
            <span class="meta-dot">•</span>
            <span class="task-date">📅 ${t.dueDate || 'Belirtilmedi'}</span>
          </div>
        </div>

        <button class="task-delete-btn" data-id="${t.id}" title="Görevi Sil">&times;</button>
      </div>
    `;
  }

  renderBrandItem(b, idx = 0) {
    let statusBadgeClass = 'badge-yellow';
    if (b.status === 'Anlaşıldı') statusBadgeClass = 'badge-green';
    if (b.status === 'Reddedildi') statusBadgeClass = 'badge-red';
    if (b.status === 'Teklif İletildi') statusBadgeClass = 'badge-blue';
    const delay = ((idx % 6) * 0.05).toFixed(2);

    return `
      <div class="brand-item notion-box reveal-on-scroll" data-id="${b.id}" style="transition-delay: ${delay}s;">
        <div class="brand-item-header">
          <div>
            <h4 class="brand-name">${b.name}</h4>
            <span class="brand-contact">${b.contactPerson || 'İletişim belirtilmedi'}</span>
          </div>
          <span class="notion-tag ${statusBadgeClass}">${b.status}</span>
        </div>

        <div class="brand-details">
          ${b.budgetEstimate ? `<span class="brand-budget">💰 ${b.budgetEstimate}</span>` : ''}
          ${b.email ? `<a href="mailto:${b.email}" class="brand-link">✉️ ${b.email}</a>` : ''}
          ${b.discord ? `<span>💬 ${b.discord}</span>` : ''}
        </div>

        ${b.notes ? `<p class="text-xs text-muted" style="margin-top: 4px;">${b.notes}</p>` : ''}
      </div>
    `;
  }

  attachEvents(container) {
    const addTalentHandler = () => this.app.modals.openStreamerModal();
    const addTaskHandler = () => this.app.modals.openTaskModal();
    const addBrandHandler = () => this.app.modals.openBrandModal();

    container.querySelector('#btn-add-streamer-rookie')?.addEventListener('click', addTalentHandler);
    container.querySelector('#btn-empty-add-talent')?.addEventListener('click', addTalentHandler);

    container.querySelector('#btn-add-task-rookie')?.addEventListener('click', addTaskHandler);
    container.querySelector('#btn-empty-add-task')?.addEventListener('click', addTaskHandler);

    container.querySelector('#btn-add-brand-rookie')?.addEventListener('click', addBrandHandler);
    container.querySelector('#btn-empty-add-brand')?.addEventListener('click', addBrandHandler);

    container.querySelectorAll('.edit-streamer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.app.modals.openStreamerModal(id);
      });
    });

    container.querySelectorAll('.task-checkbox').forEach(chk => {
      chk.addEventListener('change', async () => {
        const id = chk.getAttribute('data-id');
        const item = chk.closest('.task-item');
        item.classList.toggle('completed', chk.checked);
        await Storage.update('tasks', id, { completed: chk.checked });
      });
    });

    container.querySelectorAll('.task-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await Storage.delete('tasks', id);
        this.app.refreshCurrentView();
      });
    });
  }
}
