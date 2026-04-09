import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      localStorage.setItem('hms_token', data.token);
      localStorage.setItem('hms_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">HMS Login</h1>
          <p className="mt-2 text-muted-foreground">Sign in to manage your hospital operations</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-primary focus:border-primary bg-background outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-primary focus:border-primary bg-background outline-none transition-all pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
