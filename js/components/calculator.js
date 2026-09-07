/**
 * StreamOps CRM - Pro Menajer Komisyon & Finans Hesaplayıcı Bileşeni
 * Kick, Twitch, YouTube ve Instagram için gelir payı ve ajans kesintisi simülasyonu.
 */

export class CommissionCalculator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="calculator-card notion-box">
        <div class="calc-header">
          <div class="calc-header-title">
            <span class="calc-icon">🧮</span>
            <div>
              <h4>Menajerlik Hakediş & Komisyon Hesaplayıcı</h4>
              <p class="text-muted text-sm">Sponsorluk, YouTube AdSense ve platform gelir paylarını anlık hesaplayın.</p>
            </div>
          </div>
          <div class="calc-tabs">
            <button class="calc-tab-btn active" data-tab="brand">Marka / Kampanya</button>
            <button class="calc-tab-btn" data-tab="platform">Platform Gelir Payı</button>
          </div>
        </div>

        <!-- TAB 1: MARKA SPONSORLUK -->
        <div class="calc-tab-content active" id="calc-tab-brand">
          <div class="calc-grid">
            <div class="calc-form">
              <div class="form-group">
                <label>Brüt Sponsorluk Bütçesi (₺)</label>
                <div class="input-with-affix">
                  <input type="number" id="calc-brand-budget" value="150000" step="5000" min="0">
                  <span class="affix">₺</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Menajerlik Komisyonu (%)</label>
                  <div class="input-with-affix">
                    <input type="number" id="calc-brand-commission" value="15" step="1" min="0" max="100">
                    <span class="affix">%</span>
                  </div>
                </div>

                <div class="form-group">
                  <label>KDV Durumu</label>
                  <select id="calc-brand-vat">
                    <option value="exclude">KDV Hariç (+%20 Fatura)</option>
                    <option value="include">KDV Dahil Bütçe</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Yapım / Ekipman Masrafı (₺)</label>
                <div class="input-with-affix">
                  <input type="number" id="calc-brand-expenses" value="0" step="1000" min="0">
                  <span class="affix">₺</span>
                </div>
              </div>
            </div>

            <!-- SONUÇ KUTUSU -->
            <div class="calc-results">
              <div class="calc-res-item res-highlight">
                <span class="res-label">Menajerlik Net Geliri (Ajans Payı)</span>
                <span class="res-value text-accent" id="res-agency-cut">22.500 ₺</span>
              </div>
              <div class="calc-res-item">
                <span class="res-label">Yayıncı / Influencer Hakedişi</span>
                <span class="res-value text-success" id="res-streamer-cut">127.500 ₺</span>
              </div>
              <div class="calc-res-item">
                <span class="res-label">Hesaplanan KDV (%20)</span>
                <span class="res-value" id="res-vat-amount">30.000 ₺</span>
              </div>
              <div class="calc-res-item">
                <span class="res-label">Markaya Kesilecek Toplam Fatura</span>
                <span class="res-value" id="res-total-invoice">180.000 ₺</span>
              </div>
              <div class="calc-bar-wrap">
                <div class="calc-bar">
                  <div class="calc-bar-streamer" id="calc-bar-streamer" style="width: 85%;"></div>
                  <div class="calc-bar-agency" id="calc-bar-agency" style="width: 15%;"></div>
                </div>
                <div class="calc-bar-legend">
                  <span>🟢 Yetenek Hakedişi (%<span id="res-streamer-pct">85</span>)</span>
                  <span>⚪ Ajans Payı (%<span id="res-agency-pct">15</span>)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: PLATFORM ABONELİK & ADSENSE -->
        <div class="calc-tab-content" id="calc-tab-platform">
          <div class="calc-grid">
            <div class="calc-form">
              <div class="form-group">
                <label>Platform / Gelir Türü</label>
                <select id="calc-plat-choice">
                  <option value="kick">Kick Abonelik (%95 Yayıncı / %5 Kick)</option>
                  <option value="twitch-std">Twitch Abonelik (%50 / %50)</option>
                  <option value="youtube-ads">YouTube AdSense (%55 Yayıncı / %45 Google)</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label id="lbl-metric-count">Aylık Abone / Havuz ($)</label>
                  <input type="number" id="calc-plat-subs" value="1000" step="50" min="0">
                </div>
                <div class="form-group">
                  <label>Birim Fiyat / Değer ($)</label>
                  <input type="number" id="calc-plat-price" value="5.0" step="0.5" min="1">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>USD / TRY Kuru</label>
                  <input type="number" id="calc-plat-fx" value="34.5" step="0.5">
                </div>
                <div class="form-group">
                  <label>Menajerlik Komisyonu (%)</label>
                  <input type="number" id="calc-plat-comm" value="15" step="1" min="0" max="100">
                </div>
              </div>
            </div>

            <!-- SONUÇ KUTUSU -->
            <div class="calc-results">
              <div class="calc-res-item">
                <span class="res-label">Toplam Brüt Havuz</span>
                <span class="res-value" id="res-plat-gross">$5,000</span>
              </div>
              <div class="calc-res-item">
                <span class="res-label">Platform Payı Kesintisi</span>
                <span class="res-value text-danger" id="res-plat-cut">-$250 (%5)</span>
              </div>
              <div class="calc-res-item res-highlight">
                <span class="res-label">Menajerlik Komisyonu (TL)</span>
                <span class="res-value text-accent" id="res-plat-agency-tl">24.581 ₺</span>
              </div>
              <div class="calc-res-item">
                <span class="res-label">İçerik Üreticisine Kalan (TL)</span>
                <span class="res-value text-success" id="res-plat-streamer-tl">139.293 ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
    this.calculateBrand();
  }

  attachEvents() {
    const tabBtns = this.container.querySelectorAll('.calc-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        this.container.querySelectorAll('.calc-tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        const target = this.container.querySelector(`#calc-tab-${tab}`);
        if (target) target.classList.add('active');

        if (tab === 'brand') this.calculateBrand();
        if (tab === 'platform') this.calculatePlatform();
      });
    });

    ['calc-brand-budget', 'calc-brand-commission', 'calc-brand-vat', 'calc-brand-expenses'].forEach(id => {
      const el = this.container.querySelector(`#${id}`);
      if (el) el.addEventListener('input', () => this.calculateBrand());
    });

    ['calc-plat-choice', 'calc-plat-subs', 'calc-plat-price', 'calc-plat-fx', 'calc-plat-comm'].forEach(id => {
      const el = this.container.querySelector(`#${id}`);
      if (el) el.addEventListener('input', () => this.calculatePlatform());
    });
  }

  calculateBrand() {
    const budget = Number(this.container.querySelector('#calc-brand-budget')?.value) || 0;
    const commPct = Number(this.container.querySelector('#calc-brand-commission')?.value) || 0;
    const vatMode = this.container.querySelector('#calc-brand-vat')?.value || 'exclude';
    const expenses = Number(this.container.querySelector('#calc-brand-expenses')?.value) || 0;

    const netDealPool = Math.max(0, budget - expenses);
    const agencyCut = netDealPool * (commPct / 100);
    const streamerCut = netDealPool - agencyCut;

    let vatAmount = 0;
    let totalInvoice = 0;

    if (vatMode === 'exclude') {
      vatAmount = budget * 0.20;
      totalInvoice = budget + vatAmount;
    } else {
      totalInvoice = budget;
      vatAmount = budget - (budget / 1.20);
    }

    const streamerPct = (100 - commPct);

    const fmt = (n) => Math.round(n).toLocaleString('tr-TR') + ' ₺';
    this.container.querySelector('#res-agency-cut').textContent = fmt(agencyCut);
    this.container.querySelector('#res-streamer-cut').textContent = fmt(streamerCut);
    this.container.querySelector('#res-vat-amount').textContent = fmt(vatAmount);
    this.container.querySelector('#res-total-invoice').textContent = fmt(totalInvoice);
    
    this.container.querySelector('#res-streamer-pct').textContent = streamerPct;
    this.container.querySelector('#res-agency-pct').textContent = commPct;
    this.container.querySelector('#calc-bar-streamer').style.width = `${streamerPct}%`;
    this.container.querySelector('#calc-bar-agency').style.width = `${commPct}%`;
  }

  calculatePlatform() {
    const platChoice = this.container.querySelector('#calc-plat-choice')?.value || 'kick';
    const subs = Number(this.container.querySelector('#calc-plat-subs')?.value) || 0;
    const price = Number(this.container.querySelector('#calc-plat-price')?.value) || 5.0;
    const fx = Number(this.container.querySelector('#calc-plat-fx')?.value) || 34.5;
    const commPct = Number(this.container.querySelector('#calc-plat-comm')?.value) || 15;

    const grossUSD = subs * price;
    let platCutPct = 0.05;
    let platName = 'Kick (%5)';

    if (platChoice === 'twitch-std') {
      platCutPct = 0.50;
      platName = 'Twitch (%50)';
    } else if (platChoice === 'youtube-ads') {
      platCutPct = 0.45;
      platName = 'Google (%45)';
    } else {
      platCutPct = 0.05;
      platName = 'Kick (%5)';
    }

    const platformTakeUSD = grossUSD * platCutPct;
    const creatorPoolUSD = grossUSD - platformTakeUSD;
    const creatorPoolTL = creatorPoolUSD * fx;

    const agencyTL = creatorPoolTL * (commPct / 100);
    const streamerTL = creatorPoolTL - agencyTL;

    this.container.querySelector('#res-plat-gross').textContent = `$${Math.round(grossUSD).toLocaleString()}`;
    this.container.querySelector('#res-plat-cut').textContent = `-$${Math.round(platformTakeUSD).toLocaleString()} (${platName})`;
    this.container.querySelector('#res-plat-agency-tl').textContent = Math.round(agencyTL).toLocaleString('tr-TR') + ' ₺';
    this.container.querySelector('#res-plat-streamer-tl').textContent = Math.round(streamerTL).toLocaleString('tr-TR') + ' ₺';
  }
}
