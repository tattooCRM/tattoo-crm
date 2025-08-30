import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <>
      {/* Dégradé de séparation */}
      <div className="w-full h-4 bg-gray-100" ></div>
      <footer className="bg-gray-200 text-black py-8 font-sans shadow-2xl">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Bloc gauche : branding & infos */}
        <div className="flex flex-col items-start space-y-2 md:w-1/2">
          <h2 className="text-2xl font-bold tracking-tight mb-1 text-back" style={{ fontFamily: 'Georgia, serif' }}>
            InkStudio CRM
          </h2>
          <p className="text-sm opacity-80 mb-2 text-black">Le CRM moderne pour studios et artistes tatoueurs.</p>
          <div className="flex items-center space-x-3 text-xs opacity-80 text-black">
            <MapPin size={16} /> <span>Paris, France</span>
            <Mail size={16} /> <span>contact@inkstudio.com</span>
          </div>
        </div>

        {/* Bloc centre : réseaux sociaux */}
        <div className="flex space-x-5 items-center md:w-1/4 justify-center mt-6 md:mt-0">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200">
            <Facebook size={24} className="text-black/80 hover:text-gray-500" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200">
            <Instagram size={24} className="text-black/80 hover:text-gray-500" />
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200">
            <Twitter size={24} className="text-black/80 hover:text-gray-500" />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200">
            <Linkedin size={24} className="text-black/80 hover:text-gray-500" />
          </a>
        </div>

        {/* Bloc droit : call-to-action & liens */}
        <div className="flex flex-col items-end md:w-1/4 space-y-2">
          <a href="https://www.instagram.com/tattoo-crm" target="_blank" rel="noopener noreferrer" className="bg-black hover:bg-gray-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg transition-colors mb-2">
            Suivez-nous sur Instagram
          </a>
          <div className="flex space-x-3 text-xs opacity-80 text-black">
            <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
            <span>|</span>
            <a href="/cgu" className="hover:underline">CGU</a>
            <span>|</span>
            <a href="/confidentialite" className="hover:underline">Confidentialité</a>
          </div>
          <p className="text-xs mt-2 text-back">&copy; {new Date().getFullYear()} InkStudio CRM. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
    </>
  );
}