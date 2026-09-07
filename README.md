# ⚡ StreamOps - Yetenek, Yayıncı & Influencer Menajer CRM (v2.0)

Kick, Twitch yayıncıları ile YouTube ve Instagram influencer'ları için **Apple & Vercel estetiğinde**, ultra minimalist, OLED Dark Mode destekli, sıfır sahte veri (Empty State) ve otomatik sosyal medya veri çekme motoruna sahip modern CRM paneli.

---

## 🌟 Yeni & Öne Çıkan Özellikler (v2.0)

### 1. 🖤 Apple & Vercel Tasarım Dili
- **Derin OLED Siyahı (`#000000`) & Yüksek Kontrast**: Kartlar, mikro-kenarlıklar (`1px solid rgba(255,255,255,0.08)`) ve ince tipografi.
- **İnce Menü (Slim Sidebar)**: Çok daha az yer kaplayan, ferah ve modern kenar çubuğu.
- **Şık Empty State (Boş Durum)**: Sahte (dummy) veriler tamamen kaldırılmıştır. Panel tertemiz bir başlangıç yapar; boş durumlarda davetkar Apple tarzı noktalı kartlar ve tek tıkla ekleme butonları sunulur.

### 2. 🌐 Çoklu Platform Desteği (Kick, Twitch, YouTube, Instagram)
- Yayıncılar ve influencer'lar tek bir çatı altında toplanmıştır.
- Her yetenek kartında resmi marka renkleriyle donatılmış **Hızlı Profil Butonları (Action Buttons)**:
  - 🟢 **Kick**: `#53fc18` neon yeşili buton ➔ `kick.com/{username}`
  - 🟣 **Twitch**: `#9146ff` mor buton ➔ `twitch.tv/{username}`
  - 🔴 **YouTube**: `#ff0000` kırmızı buton ➔ `youtube.com/@{username}`
  - 📸 **Instagram**: Orijinal Instagram gün batımı gradyanı ➔ `instagram.com/{username}`
- Butonlara tıklandığında ilgili platform profili anında yeni sekmede açılır.

### 3. ⚡ İstemci Taraflı (Client-Side) Otomatik Veri Çekme Motoru
- Yetenek eklerken **sadece kullanıcı adını (`@kullaniciadi`)** girmeniz ve **"Verileri Çek"** butonuna basmanız yeterlidir:
  - **Twitch**: Decapi ve public endpoint'ler ile takipçi sayısı, avatar resmi ve canlı durumunu otomatik çeker.
  - **Kick**: Public API ve CORS proxyleri (`corsproxy.io`, `allorigins`) üzerinden takipçi ve profil resmini getirir.
  - **YouTube**: Abone sayısını ve profil resmini otomatik doldurur.
  - **Instagram & Fallback Koruması**: Instagram'ın katı API ve CORS kuralları nedeniyle istemciden veri çekilemediğinde sistem **asla çökmez**. Kullanıcıya kibar bir uyarı kutusu gösterilerek takipçi sayısını doğrudan elle girmesi için manuel giriş alanı odaklanır.

### 4. 🚀 %100 Statik & GitHub Pages Uyumluluğu
- Backend sunucusuna ihtiyaç duymaz.
- Veriler tarayıcının `localStorage`'ında saklanır.
- Statik HTML/CSS/JS olarak doğrudan **GitHub Pages**, **Vercel** veya **Cloudflare Pages** üzerine deploy edilebilir.

---

## 💻 Hızlı Başlangıç

### 1. Yerel Olarak Çalıştırma:
Proje dizinindeki `start_browser.bat` dosyasına çift tıklayın veya:
```bash
node server.js
```
Tarayıcınızda açın: **`http://localhost:3000`**

### 2. GitHub Pages ile Yayına Alma:
1. Bu klasördeki dosyaları bir GitHub reposuna yükleyin (Push).
2. Reponuzun **Settings > Pages** sekmesine gidin.
3. Source olarak **`main` (veya `master`)** branch'ini seçin ve kaydedin.
4. Birkaç saniye içinde siteniz `https://kullaniciadiniz.github.io/reponuz/` adresinde canlıya geçer!

### 3. Masaüstü (.exe) Electron Çıktısı:
Windows masaüstü uygulaması üretmek için:
```bash
npm install
npm run dist
```
Kurulum `.exe` dosyası `dist/` klasöründe hazır olacaktır.
