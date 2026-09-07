/**
 * StreamOps CRM - Başlangıç Veri Seti (Empty State & Menajer İpuçları)
 * Tüm sahte veriler silinmiştir. Sistem temiz boş durumla (Empty State) başlar.
 */

export const INITIAL_DATA = {
  // Tamamen Boş Kadro & Veriler
  streamers: [],
  tasks: [],
  brands: [],
  campaigns: [],

  // Menajerlik El Kitabı & Sektör Taktikleri (Çaylak Modu Eğitici İpuçları)
  tips: [
    {
      id: 'tip-1',
      category: 'Platform Dinamikleri',
      icon: '🟢',
      title: 'Kick vs Twitch & Çoklu Yayın (Simulcast)',
      content: 'Kick platformu %95 abonelik payı verir. Twitch artık eşzamanlı yayına (Simulcast) izin vermektedir, ancak Twitch chat ve Kick chat kurallarının ayrı yönetildiğinden emin olun.'
    },
    {
      id: 'tip-2',
      category: 'Instagram Influencer',
      icon: '📸',
      title: 'Instagram Etkileşim Oranı (Engagement Rate)',
      content: 'Markalar salt takipçi sayısına değil, son 10 gönderinin beğeni + yorum sayısının takipçiye oranına (ER) bakar. %3 ve üzeri ER oranı yüksek başarı göstergesidir.'
    },
    {
      id: 'tip-3',
      category: 'YouTube Sponsorluk',
      icon: '🎬',
      title: 'YouTube Entegrasyonu (Dedicated vs Shoutout)',
      content: 'Videonun içine gömülü 60 saniyelik entegre tanıtım ile tüm videonun markaya adandığı "Dedicated" video fiyatlandırması arasında ortalama 3x ila 4x bütçe farkı olmalıdır.'
    },
    {
      id: 'tip-4',
      category: 'Sözleşme & Finans',
      icon: '⚖️',
      title: 'Menajerlik Komisyonu & KDV Tevkifatı',
      content: 'Influencer ve yayıncı anlaşmalarında ajans komisyonu genelde %15 - %20 arasındadır. Faturalandırma yapılırken KDV tevkifatı ve stopaj kesintilerini yayıncının hakedişine önceden netleştirin.'
    }
  ]
};
