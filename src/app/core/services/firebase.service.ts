import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { environment } from '../../../environments/environment';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private auth = getAuth(this.app);
  private userIdSubject = new BehaviorSubject<string | null>(null);
  userId$ = this.userIdSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.userIdSubject.next(user?.uid || null);
    });
  }

  async getCollection<T>(collectionName: string): Promise<T[]> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) return [];

    const userCollectionRef = collection(this.db, `users/${userId}/${collectionName}`);
    const snapshot = await getDocs(userCollectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async addDocument<T extends { id?: string }>(
    collectionName: string, 
    data: T
  ): Promise<string> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userCollectionRef = collection(this.db, `users/${userId}/${collectionName}`);
    const docRef = doc(userCollectionRef);
    const docData = {
      ...data,
      id: docRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(docRef, docData);
    return docRef.id;
  }

  async updateDocument<T>(
    collectionName: string, 
    id: string, 
    data: Partial<T>
  ): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(this.db, `users/${userId}/${collectionName}/${id}`);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  async deleteDocument(collectionName: string, id: string): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(this.db, `users/${userId}/${collectionName}/${id}`);
    await deleteDoc(docRef);
  }

  async queryCollection<T>(
    collectionName: string,
    conditions: { field: string; operator: string; value: any }[],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc'
  ): Promise<T[]> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) return [];

    const userCollectionRef = collection(this.db, `users/${userId}/${collectionName}`);
    let q = query(userCollectionRef);

    conditions.forEach(({ field, operator, value }) => {
      q = query(q, where(field, operator as any, value));
    });

    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }
}
