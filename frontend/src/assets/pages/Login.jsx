import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login with', email, password);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-100 text-white">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center font-serif tracking-wider">
          InkFlow
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Champ Email */}
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

          {/* Champ mot de passe avec icône Lucide */}
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
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-md font-semibold"
          >
            Connexion
          </button>

          {/* Lien mot de passe oublié */}
          <div className="text-sm text-center mt-2">
            <a href="#" className="text-indigo-400 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
