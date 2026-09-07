/**
 * StreamOps CRM - Pro (Kıdemli) Menajer Görünümü
 * Apple & Vercel Estetiğinde, Empty State ve Çoklu Platform Desteği.
 */

import { Storage } from '../services/storage.js';
import { KanbanBoard } from '../components/kanban.js';
import { CommissionCalculator } from '../components/calculator.js';

export class ProView {
  constructor(app) {
    this.app = app;
    this.activeTab = 'kanban';
    this.kanban = null;
    this.calculator = null;
  }

  setTab(tabName) {
    this.activeTab = tabName;
    const container = document.getElementById('app-view-container');
    if (!container) return;

    const tabBtns = container.querySelectorAll('.pro-tab-item');
    tabBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });

    const panes = container.querySelectorAll('.pro-tab-pane');
    panes.forEach(p => {
      p.classList.toggle('active', p.id === `pro-pane-${tabName}`);
    });

    // Sekme değiştiğinde yeni görünen öğelerin animasyonunu tetikle
    if (this.app?.setupScrollReveal) {
      this.app.setupScrollReveal();
    }
  }

  async render(container) {
    const [streamers, campaigns] = await Promise.all([
      Storage.getAll('streamers'),
      Storage.getAll('campaigns')
    ]);

    // Finansal KPI Hesaplamaları
    const totalPipelineBudget = campaigns.reduce((acc, c) => acc + (Number(c.budget) || 0), 0);
    const totalAgencyCut = campaigns.reduce((acc, c) => {
      const cutRate = (c.managerCutRate || 15) / 100;
      return acc + ((Number(c.budget) || 0) * cutRate);
    }, 0);
    const activeCampaignsCount = campaigns.filter(c => c.stage === 'active' || c.stage === 'draft').length;

    let html = `
      <div class="view-pro fade-in">
        <!-- PRO EXECUTIVE KPI BAR -->
        <div class="kpi-grid mb-6">
          <div class="kpi-card notion-box reveal-on-scroll" style="transition-delay: 0.04s;">
            <div class="kpi-top">
              <span class="kpi-label">Toplam Kampanya Bütçesi</span>
              <span class="kpi-icon">💎</span>
            </div>
            <div class="kpi-val">${totalPipelineBudget.toLocaleString('tr-TR')} ₺</div>
            <div class="kpi-foot text-muted">${campaigns.length} aktif / teklif aşamasında kampanya</div>
          </div>

          <div class="kpi-card notion-box reveal-on-scroll" style="transition-delay: 0.08s;">
            <div class="kpi-top">
              <span class="kpi-label">Öngörülen Ajans Komisyonu</span>
              <span class="kpi-icon">📈</span>
            </div>
            <div class="kpi-val text-accent">${Math.round(totalAgencyCut).toLocaleString('tr-TR')} ₺</div>
            <div class="kpi-foot text-success">Ortalama komisyon: %16.0</div>
          </div>

          <div class="kpi-card notion-box reveal-on-scroll" style="transition-delay: 0.12s;">
            <div class="kpi-top">
              <span class="kpi-label">Kadro Yetenek Sayısı</span>
              <span class="kpi-icon">🎙️</span>
            </div>
            <div class="kpi-val">${streamers.length} Yetenek</div>
            <div class="kpi-foot text-muted">Kick, Twitch, YouTube & Instagram</div>
          </div>

          <div class="kpi-card notion-box reveal-on-scroll" style="transition-delay: 0.16s;">
            <div class="kpi-top">
              <span class="kpi-label">Aktif Sponsorluklar</span>
              <span class="kpi-icon">⚡</span>
            </div>
            <div class="kpi-val">${activeCampaignsCount} Yayında / Taslak</div>
            <div class="kpi-foot text-muted">Kanban panosundan yönetiliyor</div>
          </div>
        </div>

        <!-- PRO SEKMELER -->
        <div class="pro-nav-tabs mb-6 reveal-on-scroll">
          <button class="pro-tab-item ${this.activeTab === 'kanban' ? 'active' : ''}" data-tab="kanban">
            <span>⚡</span> Kampanya Yönetimi (Kanban)
          </button>
          <button class="pro-tab-item ${this.activeTab === 'roster' ? 'active' : ''}" data-tab="roster">
            <span>📑</span> Gelişmiş Kadro & Sözleşmeler
          </button>
          <button class="pro-tab-item ${this.activeTab === 'finance' ? 'active' : ''}" data-tab="finance">
            <span>💰</span> Finans & Komisyon Hesaplayıcı
          </button>
        </div>

        <!-- SEKME 1: KANBAN -->
        <div class="pro-tab-pane ${this.activeTab === 'kanban' ? 'active' : ''} reveal-on-scroll" id="pro-pane-kanban">
          <div id="pro-kanban-container"></div>
        </div>

        <!-- SEKME 2: GELİŞMİŞ KADRO & SÖZLEŞMELER -->
        <div class="pro-tab-pane ${this.activeTab === 'roster' ? 'active' : ''}" id="pro-pane-roster">
          <div class="section-container reveal-on-scroll">
            <div class="section-header">
              <div class="section-title-wrap">
                <span class="section-emoji">📑</span>
                <div>
                  <h2 class="section-title">Gelişmiş Kadro & Sözleşme Tablosu</h2>
                  <p class="section-desc">Yayıncı ve influencer sözleşmeleri, takipçi ve doğrudan profil bağlantıları.</p>
                </div>
              </div>
              <button class="notion-btn notion-btn-primary" id="btn-add-streamer-pro">
                <span>+</span> Yeni Yetenek Ekle
              </button>
            </div>

            ${streamers.length > 0 ? `
              <div class="notion-table-container reveal-on-scroll">
                <table class="notion-table">
                  <thead>
                    <tr>
                      <th>Yetenek</th>
                      <th>Platform</th>
                      <th>Takipçi / Metrik</th>
                      <th>Ajans Komisyonu</th>
                      <th>Sözleşme Bitiş</th>
                      <th>Hızlı Profil Butonu</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${streamers.map(s => this.renderRosterRow(s)).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="empty-state-card reveal-on-scroll">
                <div class="empty-state-icon-wrap">📑</div>
                <h3 class="empty-state-title">Kadroda Henüz Yetenek Kaydı Yok</h3>
                <p class="empty-state-desc">Sözleşmeli yayıncı ve influencer'larınızı ekleyerek detaylı sözleşme tablosunu görüntüleyin.</p>
                <button class="notion-btn notion-btn-primary" id="btn-empty-pro-add-talent">
                  <span>+</span> İlk Yeteneği Ekle
                </button>
              </div>
            `}
          </div>
        </div>

        <!-- SEKME 3: FİNANS & GELİR TAKİBİ -->
        <div class="pro-tab-pane ${this.activeTab === 'finance' ? 'active' : ''}" id="pro-pane-finance">
          <div id="pro-calc-container" class="mb-8 reveal-on-scroll"></div>

          <div class="section-container reveal-on-scroll">
            <div class="section-header">
              <div class="section-title-wrap">
                <span class="section-emoji">🧾</span>
                <div>
                  <h2 class="section-title">Aktif Sponsorluk & Hakediş Defteri</h2>
                  <p class="section-desc">Marka bütçeleri, ajans payı ve influencer net hakedişleri.</p>
                </div>
              </div>
            </div>

            ${campaigns.length > 0 ? `
              <div class="notion-table-container reveal-on-scroll">
                <table class="notion-table">
                  <thead>
                    <tr>
                      <th>Kampanya / Marka</th>
                      <th>Yetenek</th>
                      <th>Brüt Bütçe</th>
                      <th>Ajans Komisyonu</th>
                      <th>Yayıncı Hakedişi</th>
                      <th>Ödeme Durumu</th>
                      <th>Aşama</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${campaigns.map(c => this.renderDealRow(c)).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="empty-state-card reveal-on-scroll" style="padding: 36px 16px;">
                <div class="empty-state-icon-wrap" style="width: 44px; height: 44px; font-size: 20px;">🧾</div>
                <h4 class="empty-state-title">Hakediş Kaydı Bulunmuyor</h4>
                <p class="empty-state-desc">Bir kampanya başlattığınızda bütçe ve hakediş dağılımı burada listelenir.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.initSubComponents();
    this.attachEvents(container);
  }

  initSubComponents() {
    this.kanban = new KanbanBoard(
      'pro-kanban-container',
      (campaignId) => this.app.modals.openCampaignModal(campaignId),
      () => this.app.modals.openCampaignModal()
    );
    this.kanban.render();

    this.calculator = new CommissionCalculator('pro-calc-container');
    this.calculator.render();
  }

  renderRosterRow(s) {
    const plat = s.primaryPlatform || 'Twitch';
    let platClass = 'pill-twitch';
    let btnClass = 'btn-platform-twitch';
    let btnLabel = '🟣 Twitch';
    let profileLink = s.links?.twitch || `https://twitch.tv/${s.handle?.replace('@', '')}`;

    if (plat === 'Kick') {
      platClass = 'pill-kick';
      btnClass = 'btn-platform-kick';
      btnLabel = '🟢 Kick';
      profileLink = s.links?.kick || `https://kick.com/${s.handle?.replace('@', '')}`;
    } else if (plat === 'YouTube') {
      platClass = 'pill-youtube';
      btnClass = 'btn-platform-youtube';
      btnLabel = '🔴 YouTube';
      profileLink = s.links?.youtube || `https://youtube.com/@${s.handle?.replace('@', '')}`;
    } else if (plat === 'Instagram') {
      platClass = 'pill-instagram';
      btnClass = 'btn-platform-instagram';
      btnLabel = '📸 Instagram';
      profileLink = s.links?.instagram || `https://instagram.com/${s.handle?.replace('@', '')}`;
    }

    return `
      <tr>
        <td>
          <div class="table-streamer-cell">
            <img src="${s.avatar}" class="table-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=111111&color=ededed'">
            <div>
              <div class="table-streamer-name">${s.name}</div>
              <div class="text-muted text-xs">${s.handle}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="platform-pill ${platClass}">${plat}</span>
        </td>
        <td>
          <strong>${s.followers || '0'}</strong>
          <span class="text-muted text-xs"> (${s.avgViewers || '-'})</span>
        </td>
        <td>
          <span class="text-bold text-accent">%${s.agencyCommission || 15}</span>
        </td>
        <td>${s.contractEnd || '<span class="text-muted">Süresiz</span>'}</td>
        <td>
          <a href="${profileLink}" target="_blank" rel="noopener noreferrer" class="platform-action-btn ${btnClass}" style="padding: 3px 8px; font-size: 11px;">
            ${btnLabel} Profilini Aç ↗
          </a>
        </td>
        <td>
          <button class="notion-btn notion-btn-xs edit-streamer-pro-btn" data-id="${s.id}">Düzenle</button>
        </td>
      </tr>
    `;
  }

  renderDealRow(c) {
    const budget = Number(c.budget) || 0;
    const cutRate = (c.managerCutRate || 15) / 100;
    const agencyCut = Math.round(budget * cutRate);
    const streamerNet = budget - agencyCut;

    return `
      <tr>
        <td>
          <strong>${c.title}</strong>
          <div class="text-muted text-xs">${c.brandName}</div>
        </td>
        <td>${c.streamerName}</td>
        <td><strong>${budget.toLocaleString('tr-TR')} ₺</strong></td>
        <td><span class="text-accent">${agencyCut.toLocaleString('tr-TR')} ₺ (%${c.managerCutRate || 15})</span></td>
        <td><span class="text-success">${streamerNet.toLocaleString('tr-TR')} ₺</span></td>
        <td>
          <span class="notion-tag badge-subtle">${c.paymentStatus || 'Beklemede'}</span>
        </td>
        <td>
          <span class="notion-tag badge-blue">${c.stage.toUpperCase()}</span>
        </td>
      </tr>
    `;
  }

  attachEvents(container) {
    const tabBtns = container.querySelectorAll('.pro-tab-item');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (this.app?.setActiveProTab) {
          this.app.setActiveProTab(tab);
        } else {
          this.setTab(tab);
        }
      });
    });

    const addTalentHandler = () => this.app.modals.openStreamerModal();
    container.querySelector('#btn-add-streamer-pro')?.addEventListener('click', addTalentHandler);
    container.querySelector('#btn-empty-pro-add-talent')?.addEventListener('click', addTalentHandler);

    container.querySelectorAll('.edit-streamer-pro-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.app.modals.openStreamerModal(id);
      });
    });
  }
}
