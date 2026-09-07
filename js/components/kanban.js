/**
 * StreamOps CRM - Pro Modu Kampanya Kanban Panosu
 * HTML5 Drag & Drop API destekli dinamik pano bileşeni.
 */

import { Storage } from '../services/storage.js';

export const STAGES = [
  { id: 'brief', title: 'Brief Alındı', icon: '📋', color: 'badge-blue' },
  { id: 'proposal', title: 'Teklif & Sözleşme', icon: '📝', color: 'badge-yellow' },
  { id: 'draft', title: 'Taslak & Revize', icon: '🎨', color: 'badge-orange' },
  { id: 'active', title: 'Yayında / Aktif', icon: '🔴', color: 'badge-green' },
  { id: 'completed', title: 'Raporlandı & Bitti', icon: '✅', color: 'badge-purple' }
];

export class KanbanBoard {
  constructor(containerId, onCardClick, onAddCampaign) {
    this.container = document.getElementById(containerId);
    this.onCardClick = onCardClick;
    this.onAddCampaign = onAddCampaign;
    this.draggedCardId = null;
  }

  async render() {
    if (!this.container) return;
    const campaigns = await Storage.getAll('campaigns');

    let html = `
      <div class="kanban-wrapper">
        <div class="kanban-header-bar">
          <div>
            <h3 class="kanban-title">⚡ Aktif Sponsorluk Süreçleri</h3>
            <p class="kanban-subtitle">Kartları sürükleyip bırakarak kampanya aşamalarını anlık olarak güncelleyin.</p>
          </div>
          <button class="notion-btn notion-btn-primary" id="btn-add-kanban-campaign">
            <span>+</span> Yeni Kampanya Ekle
          </button>
        </div>
        <div class="kanban-board">
    `;

    STAGES.forEach(stage => {
      const stageCampaigns = campaigns.filter(c => c.stage === stage.id);
      const totalBudget = stageCampaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
      const formattedTotal = totalBudget.toLocaleString('tr-TR') + ' ₺';

      html += `
        <div class="kanban-column" data-stage="${stage.id}">
          <div class="kanban-column-header">
            <div class="kanban-col-title-wrap">
              <span class="kanban-col-icon">${stage.icon}</span>
              <span class="kanban-col-title">${stage.title}</span>
              <span class="kanban-count-badge">${stageCampaigns.length}</span>
            </div>
            <span class="kanban-col-budget">${formattedTotal}</span>
          </div>

          <div class="kanban-dropzone" data-stage="${stage.id}">
            ${stageCampaigns.map(c => this.renderCard(c)).join('')}
            ${stageCampaigns.length === 0 ? `<div class="kanban-empty-placeholder">Bu aşamada kampanya yok</div>` : ''}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  renderCard(campaign) {
    const budgetFormatted = (Number(campaign.budget) || 0).toLocaleString('tr-TR') + ' ₺';
    const managerCut = Math.round((Number(campaign.budget) || 0) * ((campaign.managerCutRate || 15) / 100)).toLocaleString('tr-TR') + ' ₺';

    return `
      <div class="kanban-card" draggable="true" data-id="${campaign.id}">
        <div class="kanban-card-top">
          <span class="notion-tag badge-subtle">${campaign.brandName}</span>
          <span class="kanban-card-cut" title="Menajerlik Komisyonu">%${campaign.managerCutRate || 15} Pay</span>
        </div>
        
        <h4 class="kanban-card-heading">${campaign.title}</h4>
        
        <div class="kanban-card-streamer">
          <span class="avatar-dot"></span>
          <span>${campaign.streamerName}</span>
        </div>

        <p class="kanban-card-deliverables">${campaign.deliverables || 'Teslimat belirtilmedi'}</p>

        <div class="kanban-card-footer">
          <span class="kanban-card-budget">${budgetFormatted}</span>
          <span class="kanban-card-status-pill status-${(campaign.paymentStatus || '').toLowerCase().replace(/\s+/g, '-')}">
            ${campaign.paymentStatus || 'Beklemede'}
          </span>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Add campaign button
    const addBtn = this.container.querySelector('#btn-add-kanban-campaign');
    if (addBtn && this.onAddCampaign) {
      addBtn.addEventListener('click', () => this.onAddCampaign());
    }

    // Drag and Drop
    const cards = this.container.querySelectorAll('.kanban-card');
    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.draggedCardId = card.getAttribute('data-id');
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.draggedCardId);
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.draggedCardId = null;
        this.container.querySelectorAll('.kanban-dropzone').forEach(dz => dz.classList.remove('drag-over'));
      });

      // Card click
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (this.onCardClick) this.onCardClick(id);
      });
    });

    const dropzones = this.container.querySelectorAll('.kanban-dropzone');
    dropzones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', (e) => {
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('drag-over');
        }
      });

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const campaignId = e.dataTransfer.getData('text/plain') || this.draggedCardId;
        const newStage = zone.getAttribute('data-stage');

        if (campaignId && newStage) {
          await Storage.update('campaigns', campaignId, { stage: newStage });
          await this.render();
        }
      });
    });
  }
}
