import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="flex justify-between items-center p-4 bg-white shadow-md">
            <Link to="/" className="font-bold text-xl">InkFlow</Link>
            <div className="flex gap-4">
                <Link to="/login" className="text-sm hover:underline">Connexion</Link>
                <Link to="/signup" className="text-sm hover:underline">Inscription</Link>
            </div>
        </nav>
    )
}

export default Navbar;