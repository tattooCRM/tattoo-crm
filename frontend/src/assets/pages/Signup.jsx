import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react'; 

function Signup() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      })

      const data = await res.json();

      if(!res.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      console.log('Inscription réussie:', data);
      window.location.href = "/login";
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-100 text-white">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center font-serif tracking-wider">
          InkFlow
        </h1>

        {error && (
          <p className="bg-red-500/20 text-red-400 px-3 py-2 mb-4 rounded">{error}</p>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/*Nom*/}
          <div>
            <label className="block mb-1 text-sm font-medium">Nom</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Votre nom"/>
          </div>

          {/*Rôle*/}
          <div>
            <label className="block mb-1 text-sm font-medium">Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="user">Utilisateur</option>
              <option value="admin">Tatoueur</option>
            </select>
          </div>

          {/*Email*/}
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="exemple@email.com" />
          </div>

          {/*Mot de passe*/}
          <div>
            <label className="block mb-1 text-sm font-medium">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/*Bouton Inscription*/}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-md font-semibold"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>

          {/*Lien vers la page de connexion*/}
          <div className="text-sm text-center mt-2">
            <a href="/login" className="text-indigo-400 hover:underline">

              Déjà inscrit ? Connectez-vous
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
