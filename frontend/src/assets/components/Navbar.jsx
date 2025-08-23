import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

function Navbar() {
    return (
        <nav className="flex justify-between items-center p-4 bg-white shadow-md">
            <Link to="/" className="font-bold text-xl">InkFlow</Link>
            <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm hover:underline">Connexion</Link>
                <Link to="/signup" className="text-sm hover:underline">Inscription</Link>
                
                {/* Profil utilisateur */}
                <div className="flex items-center gap-2 ml-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 cursor-pointer transition-colors">
                        <User size={18} className="text-gray-600" />
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;