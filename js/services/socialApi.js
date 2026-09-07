/**
 * StreamOps CRM - Güçlendirilmiş CORS & Sosyal Medya Veri Çekme Motoru
 * Kick, Twitch, YouTube ve Instagram için api.allorigins.win destekli güvenilir proxy.
 * Hatalar tamamen yutulur (try-catch); sistem asla çökmez ve manuel girişe izin verir.
 */

export class SocialApiService {
  static cleanHandle(handle) {
    return (handle || '').trim().replace(/^@+/, '');
  }

  static formatNumber(num) {
    if (!num || isNaN(num)) return num;
    const n = Number(num);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return n.toString();
  }

  /**
   * Güvenli Proxy İstek Yöneticisi (allorigins.win raw ve get fallback)
   */
  static async fetchProxyText(targetUrl, timeoutMs = 5000) {
    const rawUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const getUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    // 1. Raw denemesi
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(rawUrl, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text && !text.includes('Error: 404')) return text;
      }
    } catch (e) {}

    // 2. Get JSON denemesi
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(getUrl, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (data && data.contents) return data.contents;
      }
    } catch (e) {}

    // 3. Doğrudan çağrı denemesi
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return await res.text();
    } catch (e) {}

    return null;
  }

  /**
   * 1. TWITCH VERİSİ ÇEK
   */
  static async fetchTwitch(handle) {
    const username = this.cleanHandle(handle);
    if (!username) throw new Error('Kullanıcı adı gerekli');

    try {
      const followUrl = `https://decapi.me/twitch/followcount/${username}`;
      const avatarUrl = `https://decapi.me/twitch/avatar/${username}`;
      const uptimeUrl = `https://decapi.me/twitch/uptime/${username}`;

      const [followText, avatarText, uptimeText] = await Promise.all([
        this.fetchProxyText(followUrl),
        this.fetchProxyText(avatarUrl),
        this.fetchProxyText(uptimeUrl)
      ]);

      const isValidFollow = followText && !isNaN(Number(followText.trim().replace(/,/g, '')));
      const followers = isValidFollow ? this.formatNumber(Number(followText.trim().replace(/,/g, ''))) : '';

      let photo = '';
      if (avatarText && avatarText.trim().startsWith('http')) {
        photo = avatarText.trim();
      } else {
        photo = `https://ui-avatars.com/api/?name=${username}&background=9146ff&color=fff&size=200&bold=true`;
      }

      const isLive = uptimeText ? (!uptimeText.includes('offline') && !uptimeText.includes('not found')) : false;

      return {
        success: isValidFollow,
        platform: 'Twitch',
        username,
        displayName: username,
        followers: followers || 'N/A',
        avatar: photo,
        isLive,
        category: 'Twitch Canlı Yayın',
        profileUrl: `https://twitch.tv/${username}`
      };
    } catch (err) {
      console.warn('Twitch fetch hatası yutuldu:', err.message);
    }

    return {
      success: false,
      platform: 'Twitch',
      username,
      fallbackRequired: true,
      message: 'Twitch verileri çekilemedi. Lütfen bilgileri manuel tamamlayın.',
      profileUrl: `https://twitch.tv/${username}`,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=9146ff&color=fff&size=200&bold=true`
    };
  }

  /**
   * 2. KICK VERİSİ ÇEK
   */
  static async fetchKick(handle) {
    const username = this.cleanHandle(handle);
    if (!username) throw new Error('Kullanıcı adı gerekli');

    try {
      const kickApiUrl = `https://kick.com/api/v2/channels/${username}`;
      const rawText = await this.fetchProxyText(kickApiUrl);

      if (rawText) {
        try {
          const data = JSON.parse(rawText);
          if (data && (data.user || data.id)) {
            const isLive = !!data.livestream;
            const ccu = isLive ? (data.livestream.viewer_count || 0) : 0;
            const followers = data.followers_count || data.followersCount || 0;
            const photo = data.user?.profile_pic || data.profile_pic || `https://ui-avatars.com/api/?name=${username}&background=53fc18&color=000&size=200&bold=true`;

            return {
              success: true,
              platform: 'Kick',
              username,
              displayName: data.user?.username || username,
              followers: this.formatNumber(followers),
              avatar: photo,
              isLive,
              ccu: this.formatNumber(ccu),
              category: data.recent_categories?.[0]?.name || 'Kick Yayıncısı',
              profileUrl: `https://kick.com/${username}`
            };
          }
        } catch (parseErr) {}
      }
    } catch (err) {
      console.warn('Kick fetch hatası yutuldu:', err.message);
    }

    return {
      success: false,
      platform: 'Kick',
      username,
      fallbackRequired: true,
      message: 'Kick API yanıt vermedi veya kanal bulunamadı. Lütfen bilgileri manuel girin.',
      profileUrl: `https://kick.com/${username}`,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=53fc18&color=000&size=200&bold=true`
    };
  }

  /**
   * 3. YOUTUBE VERİSİ ÇEK
   */
  static async fetchYouTube(handle) {
    const username = this.cleanHandle(handle);
    if (!username) throw new Error('Kullanıcı adı gerekli');

    try {
      const ytUrl = `https://decapi.me/youtube/subcount?id=${encodeURIComponent(username)}`;
      const subText = await this.fetchProxyText(ytUrl);

      if (subText && !isNaN(Number(subText.trim().replace(/,/g, '')))) {
        const num = Number(subText.trim().replace(/,/g, ''));
        return {
          success: true,
          platform: 'YouTube',
          username,
          displayName: username,
          followers: this.formatNumber(num),
          avatar: `https://ui-avatars.com/api/?name=${username}&background=ff0000&color=fff&size=200&bold=true`,
          category: 'YouTube İçerik Üreticisi',
          profileUrl: `https://youtube.com/@${username}`
        };
      }
    } catch (err) {
      console.warn('YouTube fetch hatası yutuldu:', err.message);
    }

    return {
      success: false,
      platform: 'YouTube',
      username,
      fallbackRequired: true,
      message: 'YouTube abone sayısı otomatik çekilemedi. Lütfen manuel girin.',
      profileUrl: `https://youtube.com/@${username}`,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=ff0000&color=fff&size=200&bold=true`
    };
  }

  /**
   * 4. INSTAGRAM VERİSİ (ASLA ÇÖKMEZ, YUMUŞAK FALLBACK)
   */
  static async fetchInstagram(handle) {
    const username = this.cleanHandle(handle);
    return {
      success: false,
      platform: 'Instagram',
      username,
      fallbackRequired: true,
      message: 'Instagram katı CORS/API kuralları nedeniyle istemciden veri çekilmesine izin vermiyor. Lütfen takipçi sayısını aşağıya manuel girin.',
      profileUrl: `https://instagram.com/${username}`,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=e1306c&color=fff&size=200&bold=true`,
      category: 'Instagram Influencer'
    };
  }

  static async fetchPlatformData(platform, username) {
    const plat = (platform || '').toLowerCase();
    try {
      if (plat === 'kick') return await this.fetchKick(username);
      if (plat === 'twitch') return await this.fetchTwitch(username);
      if (plat === 'youtube') return await this.fetchYouTube(username);
      if (plat === 'instagram') return await this.fetchInstagram(username);
    } catch (e) {
      console.warn('Global fetch dispatcher hatası yutuldu:', e);
    }

    return {
      success: false,
      platform: platform,
      username,
      fallbackRequired: true,
      message: 'Bağlantı kurulamadı. Lütfen takipçi sayısını manuel tamamlayın.',
      profileUrl: `https://${platform.toLowerCase()}.com/${username}`,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=18181b&color=fff&size=200&bold=true`
    };
  }
}
