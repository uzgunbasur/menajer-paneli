/**
 * StreamOps CRM - Çok Kullanıcılı (Multi-Tenant) İzole Veri Katmanı
 * Her menajerin yetenekleri, görevleri ve markaları kendi UID'si altında izole tutulur.
 * Firestore 'users/{uid}/{collection}' yapısı ile tam uyumludur.
 */

import { Firebase } from './firebaseConfig.js';
import { INITIAL_DATA } from './data.js';

class MultiTenantStorageService {
  constructor() {
    this.fallbackTips = INITIAL_DATA.tips || [];
  }

  getUid() {
    const user = Firebase.getCurrentUser();
    return user ? user.uid : 'guest';
  }

  getUserKey(collection) {
    const uid = this.getUid();
    return `streamops_tenant_${uid}_${collection}`;
  }

  async getAll(collection) {
    if (collection === 'tips') {
      return this.fallbackTips;
    }

    const uid = this.getUid();
    const key = this.getUserKey(collection);

    // Eğer Firestore bağlantısı aktifse Firestore'dan çekmeyi dene
    if (Firebase.db && !Firebase.isDemoFallback && uid !== 'guest') {
      try {
        const querySnapshot = await Firebase.getDocs(Firebase.collection(Firebase.db, 'users', uid, collection));
        const items = [];
        querySnapshot.forEach(d => items.push({ id: d.id, ...d.data() }));
        return items;
      } catch (err) {
        // Firestore offline veya izin hatasında izole depolamaya devam et
      }
    }

    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Storage getAll error for [${collection}]:`, e);
      return [];
    }
  }

  async getById(collection, id) {
    const items = await this.getAll(collection);
    return items.find(item => item.id === id) || null;
  }

  async create(collection, item) {
    const uid = this.getUid();
    const newItem = {
      ...item,
      id: item.id || `${collection.slice(0, 3)}-${Date.now()}`,
      ownerUid: uid,
      createdAt: new Date().toISOString()
    };

    // Firestore yazma denemesi
    if (Firebase.db && !Firebase.isDemoFallback && uid !== 'guest') {
      try {
        await Firebase.setDoc(Firebase.doc(Firebase.db, 'users', uid, collection, newItem.id), newItem);
      } catch (e) {}
    }

    // İzole kullanıcı deposuna kaydet
    const items = await this.getAll(collection);
    items.unshift(newItem);
    localStorage.setItem(this.getUserKey(collection), JSON.stringify(items));
    return newItem;
  }

  async update(collection, id, updatedFields) {
    const uid = this.getUid();
    const items = await this.getAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updatedFields, updatedAt: new Date().toISOString() };

    if (Firebase.db && !Firebase.isDemoFallback && uid !== 'guest') {
      try {
        await Firebase.setDoc(Firebase.doc(Firebase.db, 'users', uid, collection, id), items[index], { merge: true });
      } catch (e) {}
    }

    localStorage.setItem(this.getUserKey(collection), JSON.stringify(items));
    return items[index];
  }

  async delete(collection, id) {
    const uid = this.getUid();
    const items = await this.getAll(collection);
    const filtered = items.filter(item => item.id !== id);

    if (Firebase.db && !Firebase.isDemoFallback && uid !== 'guest') {
      try {
        await Firebase.deleteDoc(Firebase.doc(Firebase.db, 'users', uid, collection, id));
      } catch (e) {}
    }

    localStorage.setItem(this.getUserKey(collection), JSON.stringify(filtered));
    return true;
  }

  getUserMode() {
    const uid = this.getUid();
    return localStorage.getItem(`streamops_mode_${uid}`) || 'rookie';
  }

  setUserMode(mode) {
    const uid = this.getUid();
    localStorage.setItem(`streamops_mode_${uid}`, mode);
  }

  getTheme() {
    return localStorage.getItem('streamops_theme') || 'dark';
  }

  setTheme(theme) {
    localStorage.setItem('streamops_theme', theme);
  }

  clearUserData() {
    const uid = this.getUid();
    ['streamers', 'tasks', 'brands', 'campaigns'].forEach(col => {
      localStorage.removeItem(this.getUserKey(col));
    });
  }
}

export const Storage = new MultiTenantStorageService();
