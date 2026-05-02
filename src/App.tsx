import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';

// Pages (will create these next)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import LeadsList from './pages/LeadsList';
import NotFound from './pages/NotFound';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              ...userDoc.data()
            } as UserProfile);
          } else {
            console.warn("User logged in but no profile found in Firestore");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex bg-slate-50 items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'admin' ? '/admin' : `/school/${user.schoolId}`} />} />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/leads" 
          element={user?.role === 'admin' ? <LeadsList user={user} /> : <Navigate to="/login" />} 
        />

        {/* School Admin Routes */}
        <Route 
          path="/school/:id" 
          element={user?.role === 'school_admin' || user?.role === 'admin' ? <SchoolDashboard user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/school/:id/leads" 
          element={user?.role === 'school_admin' || user?.role === 'admin' ? <LeadsList user={user} /> : <Navigate to="/login" />} 
        />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
