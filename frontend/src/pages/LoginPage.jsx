// client/src/pages/LoginPage.jsx
import { useAuth } from "../hooks/useAuth";
import { useSearchParams } from "react-router-dom";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const error    = params.get("error");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');.df{font-family:'Playfair Display',serif;}`}</style>
      <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-8 w-full max-w-sm text-center">
        <div className="text-6xl mb-4">💑</div>
        <h1 className="df text-3xl font-bold text-gray-800 mb-1">A–Z Couple Journal</h1>
        <p className="text-rose-400 text-sm mb-8 italic df">dates · dreams · memories · games</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-400 text-xs">
            Sign-in failed. Please try again.
          </div>
        )}

        <div className="space-y-2.5 mb-8 text-left">
          {["📅 A–Z Date Bucket List","🌟 Shared Bucket Dreams","📸 Memory Timeline","🎮 Couple Games & Quizzes"].map(f => (
            <div key={f} className="flex items-center gap-3 text-sm text-gray-500">
              <span>{f.slice(0,2)}</span><span>{f.slice(3)}</span>
            </div>
          ))}
        </div>

        <button onClick={loginWithGoogle}
          className="w-full py-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-sm">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
        <p className="text-xs text-gray-400 mt-4">Your journal is shared only with your invited partner.</p>
      </div>
    </div>
  );
}