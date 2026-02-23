// ============================================
// HOME PAGE
// ============================================

import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TreePine, 
  Users, 
  UserPlus, 
  ArrowRight,
  Shield,
  Heart,
  Share2,
} from 'lucide-react';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const { members, isLoading } = useFamily();

  const stats = [
    { label: 'Total Anggota', value: members.length, icon: Users },
    { label: 'Generasi', value: new Set(members.map(m => {
      // Calculate generation based on parent relationships
      let gen = 1;
      let parent = members.find(p => p.id === m.father_id || p.id === m.mother_id);
      while (parent) {
        gen++;
        parent = members.find(p => p.id === parent?.father_id || p.id === parent?.mother_id);
      }
      return gen;
    })).size || 1, icon: TreePine },
    { label: 'Keluarga Aktif', value: members.filter(m => m.status === 'alive').length, icon: Heart },
  ];

  const features = [
    {
      icon: TreePine,
      title: 'Visualisasi Pohon Keluarga',
      description: 'Lihat silsilah keluarga dalam tampilan pohon yang interaktif dan mudah dipahami.',
    },
    {
      icon: UserPlus,
      title: 'Kelola Anggota',
      description: 'Tambah, edit, dan hapus data anggota keluarga dengan mudah.',
    },
    {
      icon: Share2,
      title: 'Bagikan dengan Keluarga',
      description: 'Undang anggota keluarga lain untuk melihat dan berkontribusi.',
    },
    {
      icon: Shield,
      title: 'Aman & Privat',
      description: 'Data keluarga Anda aman dengan sistem autentikasi yang kuat.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <TreePine className="w-4 h-4" />
              Platform Pohon Keluarga Modern
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Simpan dan Jaga
              <span className="text-primary"> Warisan Keluarga </span>
              Anda
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Buat, kelola, dan bagikan silsilah keluarga Anda dengan mudah. 
              Platform modern untuk menghubungkan generasi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" asChild className="gap-2">
                  <Link to="/tree">
                    <TreePine className="w-5 h-5" />
                    Lihat Pohon Keluarga
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="gap-2">
                    <Link to="/register">
                      <UserPlus className="w-5 h-5" />
                      Mulai Gratis
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login">Masuk</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      </section>

      {/* Stats Section */}
      {isAuthenticated && (
        <section className="py-12 -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{isLoading ? '-' : stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola dan membagikan 
              sejarah keluarga Anda dalam satu platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 lg:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Siap untuk Memulai?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              Bergabunglah dengan ribuan keluarga yang telah menyimpan 
              warisan mereka di Family Tree.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" variant="secondary" asChild className="gap-2">
                  <Link to="/tree">
                    <TreePine className="w-5 h-5" />
                    Lihat Pohon Keluarga
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="secondary" asChild className="gap-2">
                    <Link to="/register">
                      <UserPlus className="w-5 h-5" />
                      Daftar Sekarang
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                    <Link to="/login">Sudah Punya Akun?</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
