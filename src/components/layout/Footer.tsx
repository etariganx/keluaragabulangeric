// ============================================
// FOOTER COMPONENT
// ============================================

import { Link } from 'react-router-dom';
import { TreePine, Heart, Github, Mail, Globe } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Family Tree</h3>
                <p className="text-xs text-gray-500">Pohon Keluarga Digital</p>
              </div>
            </Link>
            <p className="text-sm text-gray-600 max-w-sm mb-4">
              Platform digital untuk menyimpan dan menvisualisasikan silsilah keluarga 
              Anda dengan mudah dan aman.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Github className="w-5 h-5 text-gray-600" />
              </a>
              <a
                href="mailto:contact@familytree.app"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-600" />
              </a>
              <a
                href="https://familytree.app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Globe className="w-5 h-5 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Menu Cepat</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/tree" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Pohon Keluarga
                </Link>
              </li>
              <li>
                <Link to="/members" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Daftar Anggota
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Bantuan</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Panduan Penggunaan
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Family Tree. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
