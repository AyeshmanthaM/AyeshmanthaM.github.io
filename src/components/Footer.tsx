import React from 'react';
import { Github, Linkedin, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-8">
      {/* Glassmorphism Footer Container */}
      <div className="relative backdrop-blur-xl bg-white/10 dark:bg-black/10 border-t border-white/20 dark:border-gray-700/30">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-pink-400/5"></div>

        {/* Glass effect inner border */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent dark:from-white/5"></div>

        <div className="relative container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-2 md:mb-0">
              <p className="text-sm text-gray-700/80 dark:text-gray-300/80 font-medium">
                © {new Date().getFullYear()} Ayeshmantha. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                className="group relative p-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-gray-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                aria-label="GitHub"
              >
                <Github size={18} />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a
                href="#"
                className="group relative p-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-gray-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a
                href="#"
                className="group relative p-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-gray-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                aria-label="Facebook"
              >
                <Facebook size={18} />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a
                href="mailto:contact@example.com"
                className="group relative p-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-gray-600/30 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-gray-500/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                aria-label="Instagram"
              >
                <Instagram size={18} />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;