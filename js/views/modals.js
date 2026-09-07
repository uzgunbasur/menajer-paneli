/**
 * StreamOps CRM - Modallar ve Yetenek Ekleme / Veri Çekme Motoru
 * Apple / Vercel Estetiğinde ve Çoklu Platform (Kick, Twitch, YouTube, Instagram) Destekli.
 */

import { Storage } from '../services/storage.js';
import { SocialApiService } from '../services/socialApi.js';

export class ModalManager {
  constructor(app) {
    this.app = app;
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalContainer = document.getElementById('modal-content');
    this.attachGlobalEvents();
  }

  attachGlobalEvents() {
    if (!this.modalOverlay) return;

    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay || e.target.classList.contains('modal-close-btn')) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  isOpen() {
    return this.modalOverlay.classList.contains('active');
  }

  open(html) {
    this.modalContainer.innerHTML = html;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      this.modalOverlay.classList.add('active');
    });
  }

  close() {
    this.modalOverlay.classList.remove('active');
    setTimeout(() => {
      document.body.style.overflow = '';
      this.modalContainer.innerHTML = '';
    }, 240);
  }

  // =========================================================================
  // MODAL: YENİ YETENEK EKLE (ÇOKLU PLATFORM & OTOMATİK VERİ ÇEKME MOTORU)
  // =========================================================================
  async openStreamerModal(talentId = null) {
    const isEdit = !!talentId;
    let talent = {
      name: '',
      handle: '',
      primaryPlatform: 'Twitch',
      platforms: ['Twitch'],
      category: 'İçerik Üreticisi',
      followers: '',
      avgViewers: '',
      streamSchedule: 'Hafta içi 20:00 - 00:00',
      avatar: '',
      agencyCommission: 15,
      contractStart: new Date().toISOString().slice(0, 10),
      contractEnd: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
      kickSubSplit: 95,
      twitchSubSplit: 50,
      notes: '',
      links: {}
    };

    if (isEdit) {
      const existing = await Storage.getById('streamers', talentId);
      if (existing) talent = { ...talent, ...existing };
    }

    const html = `
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">✨</span>
            <h3>${isEdit ? 'Yetenek Profilini Düzenle' : 'Yeni Yetenek / Influencer Ekle'}</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <form id="form-talent" class="modal-form">
          <!-- 1. PLATFORM SEÇİMİ -->
          <div class="form-group">
            <label>Platform Seçimi *</label>
            <div class="platform-selector-grid" id="platform-selector">
              <button type="button" class="plat-select-btn ${talent.primaryPlatform === 'Kick' ? 'active' : ''}" data-plat="Kick">
                <span style="color: var(--color-kick); font-size: 14px;">🟢</span> Kick
              </button>
              <button type="button" class="plat-select-btn ${talent.primaryPlatform === 'Twitch' ? 'active' : ''}" data-plat="Twitch">
                <span style="color: #b182ff; font-size: 14px;">🟣</span> Twitch
              </button>
              <button type="button" class="plat-select-btn ${talent.primaryPlatform === 'YouTube' ? 'active' : ''}" data-plat="YouTube">
                <span style="color: #ff4d4d; font-size: 14px;">🔴</span> YouTube
              </button>
              <button type="button" class="plat-select-btn ${talent.primaryPlatform === 'Instagram' ? 'active' : ''}" data-plat="Instagram">
                <span style="color: #ff6b9d; font-size: 14px;">📸</span> Instagram
              </button>
            </div>
            <input type="hidden" name="primaryPlatform" id="input-primary-platform" value="${talent.primaryPlatform}">
          </div>

          <!-- 2. KULLANICI ADI & OTOMATİK VERİ ÇEKME -->
          <div class="form-group">
            <label>Kullanıcı Adı (Handle) *</label>
            <div class="fetch-input-group">
              <input type="text" name="handle" id="input-handle" value="${talent.handle}" placeholder="örn: elraenn veya mrbeast" required>
              <button type="button" class="btn-fetch-data" id="btn-fetch-social">
                <span id="fetch-btn-icon">⚡</span> Verileri Çek
              </button>
            </div>
            <span class="text-xs text-muted" id="fetch-helper-text">Kullanıcı adını yazıp 'Verileri Çek'e basarak takipçi ve avatarı otomatik getirin.</span>
          </div>

          <!-- BİLDİRİM / FALLBACK KUTUSU -->
          <div id="fetch-status-container" style="display: none;"></div>

          <div class="form-row">
            <div class="form-group">
              <label>Görünen İsim / Nickname *</label>
              <input type="text" name="name" id="input-name" value="${talent.name}" placeholder="örn: Tuğkan 'Elraenn' Gönültaş" required>
            </div>
            <div class="form-group">
              <label>Takipçi / Abone Sayısı *</label>
              <input type="text" name="followers" id="input-followers" value="${talent.followers}" placeholder="örn: 450K veya 1.2M" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>İçerik Kategorisi</label>
              <input type="text" name="category" id="input-category" value="${talent.category}" placeholder="Gaming / Lifestyle / Teknoloji">
            </div>
            <div class="form-group">
              <label>Ort. İzleyici / Etkileşim</label>
              <input type="text" name="avgViewers" id="input-viewers" value="${talent.avgViewers || ''}" placeholder="örn: 4.5K CCU veya %4.2 ER">
            </div>
          </div>

          <div class="form-group">
            <label>Profil Fotoğrafı URL</label>
            <input type="url" name="avatar" id="input-avatar" value="${talent.avatar}" placeholder="https://...">
          </div>

          <div class="modal-divider"><span>Sözleşme & Ajans Detayları (Opsiyonel)</span></div>

          <div class="form-row">
            <div class="form-group">
              <label>Menajerlik Komisyonu (%)</label>
              <input type="number" name="agencyCommission" value="${talent.agencyCommission || 15}" min="0" max="100">
            </div>
            <div class="form-group">
              <label>Sözleşme Bitiş Tarihi</label>
              <input type="date" name="contractEnd" value="${talent.contractEnd || ''}">
            </div>
          </div>

          <div class="form-group">
            <label>Menajerlik Notları</label>
            <textarea name="notes" rows="2" placeholder="Özel marka kısıtlamaları, medya kiti bağlantısı vb.">${talent.notes || ''}</textarea>
          </div>

          <div class="modal-actions">
            ${isEdit ? `<button type="button" class="notion-btn notion-btn-danger" id="btn-delete-talent">Yeteneği Sil</button>` : '<div></div>'}
            <div class="actions-right">
              <button type="button" class="notion-btn notion-btn-secondary modal-close-btn">İptal</button>
              <button type="submit" class="notion-btn notion-btn-primary">${isEdit ? 'Güncelle' : 'Kaydet'}</button>
            </div>
          </div>
        </form>
      </div>
    `;

    this.open(html);
    this.setupTalentModalEvents(talentId, isEdit);
  }

  setupTalentModalEvents(talentId, isEdit) {
    const container = this.modalContainer;
    let selectedPlatform = container.querySelector('#input-primary-platform').value || 'Twitch';

    // 1. Platform seçici düğmeleri
    const platBtns = container.querySelectorAll('.plat-select-btn');
    platBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        platBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPlatform = btn.getAttribute('data-plat');
        container.querySelector('#input-primary-platform').value = selectedPlatform;

        // Reset fetch status box
        const statusBox = container.querySelector('#fetch-status-container');
        statusBox.style.display = 'none';

        // Placeholder güncelle
        const handleInput = container.querySelector('#input-handle');
        if (selectedPlatform === 'YouTube') handleInput.placeholder = 'örn: mrbeast';
        else if (selectedPlatform === 'Instagram') handleInput.placeholder = 'örn: cristiano';
        else if (selectedPlatform === 'Kick') handleInput.placeholder = 'örn: xqc';
        else handleInput.placeholder = 'örn: elraenn';
      });
    });

    // 2. OTOMATİK VERİ ÇEKME (FETCH) BUTONU
    const fetchBtn = container.querySelector('#btn-fetch-social');
    fetchBtn.addEventListener('click', async () => {
      const handle = container.querySelector('#input-handle').value.trim();
      const statusBox = container.querySelector('#fetch-status-container');

      if (!handle) {
        alert('Lütfen önce bir kullanıcı adı girin.');
        return;
      }

      fetchBtn.classList.add('loading');
      fetchBtn.innerHTML = '<span>⏳</span> Çekiliyor...';

      try {
        const result = await SocialApiService.fetchPlatformData(selectedPlatform, handle);
        fetchBtn.classList.remove('loading');
        fetchBtn.innerHTML = '<span>⚡</span> Verileri Çek';

        // Avatar alanını doldur
        if (result.avatar) {
          container.querySelector('#input-avatar').value = result.avatar;
        }

        // İsim alanını doldur (eğer boşsa)
        const nameInput = container.querySelector('#input-name');
        if (!nameInput.value || nameInput.value === handle) {
          nameInput.value = result.displayName || handle;
        }

        if (result.category) {
          container.querySelector('#input-category').value = result.category;
        }

        // Durum analizi
        if (result.success && result.followers && result.followers !== 'N/A') {
          container.querySelector('#input-followers').value = result.followers;
          if (result.ccu) container.querySelector('#input-viewers').value = `${result.ccu} CCU (Canlı)`;

          statusBox.className = 'fetch-success-box';
          statusBox.innerHTML = `<span>✓</span> <strong>${selectedPlatform}</strong> verileri başarıyla çekildi! (Takipçi: ${result.followers})`;
          statusBox.style.display = 'flex';
        } else {
          // Fallback durumu (özellikle Instagram veya API engellerinde)
          statusBox.className = 'fetch-fallback-box';
          statusBox.innerHTML = `
            <span>⚠️</span>
            <div>
              <strong>${result.message || 'Veri çekilemedi.'}</strong>
              <div class="text-xs" style="margin-top: 2px;">Lütfen aşağıdaki Takipçi / Abone sayısını manuel doldurunuz.</div>
            </div>
          `;
          statusBox.style.display = 'flex';
          container.querySelector('#input-followers').focus();
        }
      } catch (err) {
        fetchBtn.classList.remove('loading');
        fetchBtn.innerHTML = '<span>⚡</span> Verileri Çek';
        console.error('Fetch error:', err);

        statusBox.className = 'fetch-fallback-box';
        statusBox.innerHTML = `<span>⚠️</span> Bağlantı kurulamadı. Bilgileri manuel tamamlayabilirsiniz.`;
        statusBox.style.display = 'flex';
      }
    });

    // 3. Form Gönderimi
    const form = container.querySelector('#form-talent');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const plat = fd.get('primaryPlatform');
      const handle = SocialApiService.cleanHandle(fd.get('handle'));

      // Platforma özel doğrudan profil linki oluştur
      const links = {};
      if (plat === 'Kick') links.kick = `https://kick.com/${handle}`;
      if (plat === 'Twitch') links.twitch = `https://twitch.tv/${handle}`;
      if (plat === 'YouTube') links.youtube = `https://youtube.com/@${handle}`;
      if (plat === 'Instagram') links.instagram = `https://instagram.com/${handle}`;

      const avatarVal = fd.get('avatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}&background=111111&color=ededed`;

      const talentData = {
        name: fd.get('name'),
        handle: `@${handle}`,
        primaryPlatform: plat,
        platforms: [plat],
        followers: fd.get('followers') || 'N/A',
        avgViewers: fd.get('avgViewers') || '-',
        category: fd.get('category') || 'İçerik Üreticisi',
        avatar: avatarVal,
        links: links,
        agencyCommission: Number(fd.get('agencyCommission')) || 15,
        contractEnd: fd.get('contractEnd'),
        notes: fd.get('notes'),
        status: 'offline'
      };

      if (isEdit) {
        await Storage.update('streamers', talentId, talentData);
      } else {
        await Storage.create('streamers', talentData);
      }

      this.close();
      this.app.refreshCurrentView();
      this.app.scrollToSection('talents');
      this.app.showNotification(
        isEdit ? '✓ Profil Güncellendi' : '✨ Yetenek Eklendi',
        `"${talentData.name}" (${plat}) kadronuza kaydedildi.`
      );
    });

    // 4. Silme Butonu
    if (isEdit) {
      container.querySelector('#btn-delete-talent')?.addEventListener('click', async () => {
        if (confirm('Bu yeteneği silmek istediğinize emin misiniz?')) {
          await Storage.delete('streamers', talentId);
          this.close();
          this.app.refreshCurrentView();
          this.app.showNotification('Silindi', 'Yetenek kadrodan çıkarıldı.');
        }
      });
    }
  }

  // ==========================================
  // MODAL: YENİ GÖREV EKLE
  // ==========================================
  async openTaskModal() {
    const talents = await Storage.getAll('streamers');

    const html = `
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">📋</span>
            <h3>Yeni Görev & Hatırlatıcı</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <form id="form-task" class="modal-form">
          <div class="form-group">
            <label>Görev Başlığı *</label>
            <input type="text" name="title" placeholder="örn: Sponsorluk briefini ilet" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>İlgili Yetenek</label>
              <select name="streamerId">
                <option value="">Genel Ajans Görevi</option>
                ${talents.map(t => `<option value="${t.id}">${t.name} (${t.primaryPlatform})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Son Teslim Tarihi</label>
              <input type="date" name="dueDate" value="${new Date().toISOString().slice(0, 10)}" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Öncelik</label>
              <select name="priority">
                <option value="high">🔴 Acil</option>
                <option value="medium" selected>🟡 Normal</option>
                <option value="low">🟢 Düşük</option>
              </select>
            </div>
            <div class="form-group">
              <label>Kategori</label>
              <select name="category">
                <option value="Sponsorluk">Sponsorluk</option>
                <option value="Sözleşme">Sözleşme</option>
                <option value="İçerik & Yayın">İçerik & Yayın</option>
                <option value="Finans">Finans & Ödeme</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <div></div>
            <div class="actions-right">
              <button type="button" class="notion-btn notion-btn-secondary modal-close-btn">İptal</button>
              <button type="submit" class="notion-btn notion-btn-primary">Görevi Kaydet</button>
            </div>
          </div>
        </form>
      </div>
    `;

    this.open(html);

    const form = document.getElementById('form-task');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const strId = fd.get('streamerId');
      const talent = talents.find(t => t.id === strId);

      const taskData = {
        title: fd.get('title'),
        streamerId: strId || null,
        streamerName: talent ? talent.name : 'Genel',
        dueDate: fd.get('dueDate'),
        priority: fd.get('priority'),
        category: fd.get('category'),
        completed: false
      };

      await Storage.create('tasks', taskData);
      this.close();
      this.app.refreshCurrentView();
      this.app.scrollToSection('tasks');
      this.app.showNotification('✓ Görev Eklendi', `"${taskData.title}" kaydedildi.`);
    });
  }

  // ==========================================
  // MODAL: MARKA EKLE
  // ==========================================
  async openBrandModal(brandId = null) {
    const isEdit = !!brandId;
    let brand = {
      name: '',
      contactPerson: '',
      email: '',
      discord: '',
      status: 'Görüşülüyor',
      budgetEstimate: '150,000 ₺',
      notes: ''
    };

    if (isEdit) {
      const existing = await Storage.getById('brands', brandId);
      if (existing) brand = { ...brand, ...existing };
    }

    const html = `
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">🏢</span>
            <h3>${isEdit ? 'Markayı Düzenle' : 'Yeni Marka Görüşmesi Ekle'}</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <form id="form-brand" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Marka Adı *</label>
              <input type="text" name="name" value="${brand.name}" placeholder="örn: Red Bull veya Yemeksepeti" required>
            </div>
            <div class="form-group">
              <label>Durum</label>
              <select name="status">
                <option value="Görüşülüyor" ${brand.status === 'Görüşülüyor' ? 'selected' : ''}>🟡 Görüşülüyor</option>
                <option value="Teklif İletildi" ${brand.status === 'Teklif İletildi' ? 'selected' : ''}>🔵 Teklif İletildi</option>
                <option value="Anlaşıldı" ${brand.status === 'Anlaşıldı' ? 'selected' : ''}>🟢 Anlaşıldı</option>
                <option value="Reddedildi" ${brand.status === 'Reddedildi' ? 'selected' : ''}>🔴 Reddedildi</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>İletişim Kişisi</label>
              <input type="text" name="contactPerson" value="${brand.contactPerson}" placeholder="Ahmet Yılmaz (Brand Lead)">
            </div>
            <div class="form-group">
              <label>Tahmini Bütçe</label>
              <input type="text" name="budgetEstimate" value="${brand.budgetEstimate}" placeholder="örn: 200,000 ₺">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>E-Posta</label>
              <input type="email" name="email" value="${brand.email}" placeholder="ornek@marka.com">
            </div>
            <div class="form-group">
              <label>Discord / Telefon</label>
              <input type="text" name="discord" value="${brand.discord}" placeholder="@kullanici">
            </div>
          </div>

          <div class="form-group">
            <label>Notlar & Detaylar</label>
            <textarea name="notes" rows="3" placeholder="Kampanya gereksinimleri, kısıtlar...">${brand.notes}</textarea>
          </div>

          <div class="modal-actions">
            ${isEdit ? `<button type="button" class="notion-btn notion-btn-danger" id="btn-delete-brand">Markayı Sil</button>` : '<div></div>'}
            <div class="actions-right">
              <button type="button" class="notion-btn notion-btn-secondary modal-close-btn">İptal</button>
              <button type="submit" class="notion-btn notion-btn-primary">${isEdit ? 'Güncelle' : 'Kaydet'}</button>
            </div>
          </div>
        </form>
      </div>
    `;

    this.open(html);

    const form = document.getElementById('form-brand');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = {
        name: fd.get('name'),
        status: fd.get('status'),
        contactPerson: fd.get('contactPerson'),
        budgetEstimate: fd.get('budgetEstimate'),
        email: fd.get('email'),
        discord: fd.get('discord'),
        notes: fd.get('notes')
      };

      if (isEdit) {
        await Storage.update('brands', brandId, data);
      } else {
        await Storage.create('brands', data);
      }

      this.close();
      this.app.refreshCurrentView();
      this.app.scrollToSection('brands');
      this.app.showNotification(
        isEdit ? '✓ Marka Güncellendi' : '✓ Marka Eklendi',
        `"${data.name}" listeye kaydedildi.`
      );
    });

    if (isEdit) {
      document.getElementById('btn-delete-brand')?.addEventListener('click', async () => {
        if (confirm('Bu markayı silmek istediğinize emin misiniz?')) {
          await Storage.delete('brands', brandId);
          this.close();
          this.app.refreshCurrentView();
        }
      });
    }
  }

  // ==========================================
  // MODAL: PRO KAMPANYA EKLE / DÜZENLE
  // ==========================================
  async openCampaignModal(campaignId = null) {
    const isEdit = !!campaignId;
    const talents = await Storage.getAll('streamers');

    let campaign = {
      title: '',
      brandName: '',
      streamerName: talents[0]?.name || '',
      streamerId: talents[0]?.id || '',
      budget: 100000,
      stage: 'brief',
      deliverables: '1x YouTube Entegrasyonu + 1x Instagram Hikaye',
      paymentStatus: 'Teklif Aşamasında',
      managerCutRate: 15
    };

    if (isEdit) {
      const existing = await Storage.getById('campaigns', campaignId);
      if (existing) campaign = { ...campaign, ...existing };
    }

    const html = `
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">⚡</span>
            <h3>${isEdit ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Başlat'}</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <form id="form-campaign" class="modal-form">
          <div class="form-group">
            <label>Kampanya Başlığı *</label>
            <input type="text" name="title" value="${campaign.title}" placeholder="örn: Yeni Lansman Sponsorluğu" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Marka Adı *</label>
              <input type="text" name="brandName" value="${campaign.brandName}" placeholder="Monster Energy / Papara" required>
            </div>
            <div class="form-group">
              <label>Hedef Yetenek</label>
              <select name="streamerId">
                ${talents.map(t => `<option value="${t.id}" ${t.id === campaign.streamerId ? 'selected' : ''}>${t.name} (${t.primaryPlatform})</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Toplam Bütçe (₺)</label>
              <input type="number" name="budget" value="${campaign.budget}" step="5000" min="0" required>
            </div>
            <div class="form-group">
              <label>Ajans Komisyonu (%)</label>
              <input type="number" name="managerCutRate" value="${campaign.managerCutRate}" min="0" max="100" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Aşama (Kanban)</label>
              <select name="stage">
                <option value="brief" ${campaign.stage === 'brief' ? 'selected' : ''}>📋 Brief Alındı</option>
                <option value="proposal" ${campaign.stage === 'proposal' ? 'selected' : ''}>📝 Teklif & Sözleşme</option>
                <option value="draft" ${campaign.stage === 'draft' ? 'selected' : ''}>🎨 Taslak & Revize</option>
                <option value="active" ${campaign.stage === 'active' ? 'selected' : ''}>🔴 Yayında / Aktif</option>
                <option value="completed" ${campaign.stage === 'completed' ? 'selected' : ''}>✅ Raporlandı & Bitti</option>
              </select>
            </div>
            <div class="form-group">
              <label>Ödeme Durumu</label>
              <select name="paymentStatus">
                <option value="Teklif Aşamasında" ${campaign.paymentStatus === 'Teklif Aşamasında' ? 'selected' : ''}>Teklif Aşamasında</option>
                <option value="Faturalandı" ${campaign.paymentStatus === 'Faturalandı' ? 'selected' : ''}>Faturalandı</option>
                <option value="Tahsil Edildi" ${campaign.paymentStatus === 'Tahsil Edildi' ? 'selected' : ''}>Tahsil Edildi</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Taahhüt Edilen Teslimatlar</label>
            <input type="text" name="deliverables" value="${campaign.deliverables}" placeholder="örn: 1x YouTube Entegre Video + 2x IG Post">
          </div>

          <div class="modal-actions">
            ${isEdit ? `<button type="button" class="notion-btn notion-btn-danger" id="btn-delete-campaign">Kampanyayı Sil</button>` : '<div></div>'}
            <div class="actions-right">
              <button type="button" class="notion-btn notion-btn-secondary modal-close-btn">İptal</button>
              <button type="submit" class="notion-btn notion-btn-primary">${isEdit ? 'Güncelle' : 'Kaydet'}</button>
            </div>
          </div>
        </form>
      </div>
    `;

    this.open(html);

    const form = document.getElementById('form-campaign');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const strId = fd.get('streamerId');
      const talent = talents.find(t => t.id === strId);

      const campaignData = {
        title: fd.get('title'),
        brandName: fd.get('brandName'),
        streamerId: strId,
        streamerName: talent ? talent.name : 'Genel Kadro',
        budget: Number(fd.get('budget')) || 0,
        managerCutRate: Number(fd.get('managerCutRate')) || 15,
        stage: fd.get('stage'),
        paymentStatus: fd.get('paymentStatus'),
        deliverables: fd.get('deliverables')
      };

      if (isEdit) {
        await Storage.update('campaigns', campaignId, campaignData);
      } else {
        await Storage.create('campaigns', campaignData);
      }

      this.close();
      this.app.refreshCurrentView();
      this.app.scrollToSection('kanban');
      this.app.showNotification(
        isEdit ? '✓ Kampanya Güncellendi' : '⚡ Kampanya Başlatıldı',
        `"${campaignData.title}" kaydedildi.`
      );
    });

    if (isEdit) {
      document.getElementById('btn-delete-campaign')?.addEventListener('click', async () => {
        if (confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
          await Storage.delete('campaigns', campaignId);
          this.close();
          this.app.refreshCurrentView();
        }
      });
    }
  }
}
