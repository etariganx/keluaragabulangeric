// ============================================
// MAIN APP COMPONENT
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { FamilyProvider } from '@/context/FamilyContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';

// Pages
import { HomePage } from '@/pages/HomePage';
import { TreePage } from '@/pages/TreePage';
import { MembersPage } from '@/pages/MembersPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AdminPage } from '@/pages/AdminPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // In a real app, check authentication
  // For now, we'll just render the children
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background">
            <Routes>
              {/* Auth pages without header/footer */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Pages with header/footer */}
              <Route
                path="/*"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route 
                          path="/tree" 
                          element={
                            <ProtectedRoute>
                              <TreePage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/members" 
                          element={
                            <ProtectedRoute>
                              <MembersPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/admin" 
                          element={
                            <ProtectedRoute>
                              <AdminPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </FamilyProvider>
    </AuthProvider>
  );
}

export default App;
