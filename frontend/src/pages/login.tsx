import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase/firebase";
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import { PasswordInput } from '../components/common/PasswordInput';

export default function Login() {
    //const { user, isAdmin, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorState, setErrorState] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorState(null);

      try{
        console.log("Attempting to log in with:", email);
        setLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful for:", email);
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      }
      catch(error: any){
        console.error("Login error:", error);
        setErrorState(error.message || "Login failed. Please try again.");
      }
      finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
            <h3 className="text-2xl font-bold text-center">Login to CondoPay</h3>
              {errorState && <p className="text-red-500 text-sm mt-2">{errorState}</p>}
              <form onSubmit={handleSubmit}>
                <div className="mt-4">
                  <div>
                    <label className="block" htmlFor="email">Email</label>
                    <input
                      type="email"
                      placeholder="Email"
                      id="email"
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-4">
                    { /*<label className="block" htmlFor="password">Password</label> */}
                    
                  </div>
                  <PasswordInput
                      //type="password"
                      placeholder="Password"
                      //id="password"
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      value={password}
                      onChange={(setPassword)}
                      required
                    />
                  <div className="flex items-center justify-between mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 disabled:opacity-50"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <a 
                      href="/register" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      <p></p>
                      <div>Don't have an account? Register here</div>
                    </a>
                  </div>
                </div>
            </form>
        </div>
      </div>
    );
}