import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { User, AuthCredentials } from '../models/user.model';
import { environment } from '../../../environments/environment';

const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
const appleProvider = new OAuthProvider('apple.com');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {
    auth.onAuthStateChanged(this.handleAuthStateChanged.bind(this));
  }

  private handleAuthStateChanged(firebaseUser: FirebaseUser | null): void {
    if (firebaseUser) {
      const user: User = this.mapFirebaseUser(firebaseUser);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      
      // Store auth state in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      localStorage.removeItem('user');
    }
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      emailVerified: firebaseUser.emailVerified,
      provider: (firebaseUser.providerData[0]?.providerId === 'password' 
        ? 'password' 
        : firebaseUser.providerData[0]?.providerId === 'google.com'
        ? 'google'
        : 'apple') as User['provider'],
      createdAt: new Date(firebaseUser.metadata.creationTime!),
      updatedAt: new Date(firebaseUser.metadata.lastSignInTime!)
    };
  }

  register(credentials: AuthCredentials): Observable<User> {
    return from(createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    )).pipe(
      tap(userCredential => sendEmailVerification(userCredential.user)),
      map(userCredential => this.mapFirebaseUser(userCredential.user)),
      catchError(error => throwError(() => this.handleAuthError(error)))
    );
  }

  login(credentials: AuthCredentials): Observable<User> {
    return from(signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    )).pipe(
      map(userCredential => this.mapFirebaseUser(userCredential.user)),
      catchError(error => throwError(() => this.handleAuthError(error)))
    );
  }

  loginWithGoogle(): Observable<User> {
    return from(signInWithPopup(auth, googleProvider)).pipe(
      map(result => {
        // Get Google OAuth access token
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
        // Store token for future use if needed
        if (token) {
          localStorage.setItem('google_token', token);
        }
        
        return this.mapFirebaseUser(result.user);
      }),
      catchError(error => {
        // Remove any stored tokens on error
        localStorage.removeItem('google_token');
        return throwError(() => this.handleAuthError(error));
      })
    );
  }

  loginWithApple(): Observable<User> {
    return from(signInWithPopup(auth, appleProvider)).pipe(
      map(result => this.mapFirebaseUser(result.user)),
      catchError(error => throwError(() => this.handleAuthError(error)))
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(auth, email)).pipe(
      catchError(error => throwError(() => this.handleAuthError(error)))
    );
  }

  logout(): Observable<void> {
    return from(signOut(auth)).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        localStorage.removeItem('user');
        localStorage.removeItem('google_token');
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => throwError(() => this.handleAuthError(error)))
    );
  }

  private handleAuthError(error: any): string {
    let message = 'An error occurred during authentication';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operation not allowed';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Invalid password';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Authentication popup was closed';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Only one popup request allowed at a time';
        break;
      case 'auth/popup-blocked':
        message = 'Authentication popup was blocked by the browser';
        break;
      case 'auth/account-exists-with-different-credential':
        message = 'An account already exists with the same email address but different sign-in credentials';
        break;
    }

    return message;
  }
}