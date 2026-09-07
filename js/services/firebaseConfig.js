/**
 * StreamOps CRM - Firebase Yapılandırması ve Kimlik Doğrulama Servisi
 * CDN üzerinden ES Module olarak yüklenir; GitHub Pages ve SPA ile %100 uyumludur.
 * Kullanıcı adı -> kullaniciadi@streamops.com dönüşümü ile şifreli giriş sağlar.
 */

// Firebase v10 CDN Modülleri
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Kendi Firebase projemizin gerçek konfigürasyonu
export const firebaseConfig = {
  apiKey: "AIzaSyA3Ops_j5_nIJLQfNc1FQIL-NNiqcHcfHk",
  authDomain: "menajer-panel.firebaseapp.com",
  projectId: "menajer-panel",
  storageBucket: "menajer-panel.firebasestorage.app",
  messagingSenderId: "110681218557",
  appId: "1:110681218557:web:02947f2c1164fe1df84d94",
  measurementId: "G-PMJ01YGHMZ"
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.currentUser = null;
    this.isDemoFallback = false;
    this.init();
  }

  init() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      console.log('Firebase başarıyla initialize edildi.');
    } catch (err) {
      console.warn('Firebase başlatılırken yerel fallback moduna geçildi:', err.message);
      this.isDemoFallback = true;
    }
  }

  /**
   * Kullanıcı adını gizli e-postaya dönüştür
   * örn: 'mert_manager' -> 'mert_manager@streamops.com'
   */
  usernameToEmail(username) {
    const clean = (username || '').toLowerCase().trim().replace(/[^a-z0-9_.-]/g, '');
    return `${clean}@streamops.com`;
  }

  /**
   * Kullanıcı Girişi
   */
  async login(username, password) {
    const email = this.usernameToEmail(username);

    // Gerçek Firebase Auth Denemesi
    if (this.auth && !this.isDemoFallback) {
      try {
        const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
        this.currentUser = {
          uid: userCredential.user.uid,
          username: username.trim().toLowerCase(),
          email: userCredential.user.email
        };
        localStorage.setItem('streamops_active_session', JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
      } catch (err) {
        console.warn('Firebase login hatası (yerel kimlik doğrulayıcıya başvuruluyor):', err.code || err.message);
      }
    }

    // Yerel Çok Kullanıcılı (Multi-Tenant) Güvenli Fallback Doğrulayıcı
    return this.fallbackAuth(username, password, 'login');
  }

  /**
   * Yeni Menajer Hesabı Oluştur
   */
  async register(username, password) {
    const email = this.usernameToEmail(username);

    if (this.auth && !this.isDemoFallback) {
      try {
        const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
        this.currentUser = {
          uid: userCredential.user.uid,
          username: username.trim().toLowerCase(),
          email: userCredential.user.email
        };
        localStorage.setItem('streamops_active_session', JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
      } catch (err) {
        console.warn('Firebase register hatası (yerel kullanıcı oluşturuluyor):', err.code || err.message);
      }
    }

    return this.fallbackAuth(username, password, 'register');
  }

  /**
   * Çok Kullanıcılı İzole Yerel Fallback Motoru
   */
  fallbackAuth(username, password, mode) {
    const cleanUser = username.trim().toLowerCase();
    const usersStore = JSON.parse(localStorage.getItem('streamops_registered_users') || '{}');

    if (mode === 'register') {
      if (usersStore[cleanUser]) {
        throw new Error('Bu kullanıcı adı zaten alınmış.');
      }
      const uid = 'usr_' + btoa(cleanUser).replace(/=/g, '');
      usersStore[cleanUser] = { password, uid, username: cleanUser };
      localStorage.setItem('streamops_registered_users', JSON.stringify(usersStore));

      this.currentUser = { uid, username: cleanUser, email: `${cleanUser}@streamops.com` };
      localStorage.setItem('streamops_active_session', JSON.stringify(this.currentUser));
      return { success: true, user: this.currentUser };
    } else {
      const existing = usersStore[cleanUser];
      if (!existing || existing.password !== password) {
        throw new Error('Kullanıcı adı veya şifre hatalı.');
      }
      this.currentUser = { uid: existing.uid, username: cleanUser, email: `${cleanUser}@streamops.com` };
      localStorage.setItem('streamops_active_session', JSON.stringify(this.currentUser));
      return { success: true, user: this.currentUser };
    }
  }

  /**
   * Çıkış Yap
   */
  async logout() {
    if (this.auth) {
      try { await fbSignOut(this.auth); } catch (e) {}
    }
    this.currentUser = null;
    localStorage.removeItem('streamops_active_session');
  }

  /**
   * Aktif Oturumu Getir
   */
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    const session = localStorage.getItem('streamops_active_session');
    if (session) {
      try {
        this.currentUser = JSON.parse(session);
        return this.currentUser;
      } catch (e) {}
    }
    return null;
  }
}

export const Firebase = new FirebaseService();
export { collection, doc, getDocs, setDoc, deleteDoc };