import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        console.log('Connexion réussie:', result.user);
        
        // Rediriger selon le rôle
        if (result.user.role === 'tattoo_artist' || result.user.role === 'artist' || result.user.role === 'tatoueur') {
          navigate('/dashboard');
        } else {
          navigate('/client'); // Les clients vont vers leur espace dédié
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
      console.error('Erreur login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-100 text-white">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl shadow-lg">
        
        {/* Titre */}
        <h1 className="text-3xl font-bold mb-6 text-center font-serif tracking-wider">
          InkFlow
        </h1>

        {/* Message d'erreur */}
        {error && (
          <p className="bg-red-500/20 text-red-400 px-3 py-2 mb-4 rounded">
            {error}
          </p>
        )}

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="exemple@email.com"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block mb-1 text-sm font-medium">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-10 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-white"
                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Bouton Connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-md font-semibold disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          {/* Lien vers inscription */}
          <div className="text-sm text-center mt-2">
            <a href="/signup" className="text-indigo-400 hover:underline">
              Pas encore inscrit ? Créez un compte
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
