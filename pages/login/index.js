import React, { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../config/supabaseClient";
import LoginLayout from "../../components/LoginLayout";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        console.log("Error details:", error);
      } else {
        setSuccess(true);
        console.log("Signed in successfully");
        router.push("/"); // Redirect to home page
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
      setError(error.message);
    }
  };

  return (
    <LoginLayout>
      <div className="max-w-md mx-auto mt-10">
        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline">Login successful!</span>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <h1 className="text-2xl font-bold mb-4 text-center">Нэвтрэх</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-4 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2">
              Нууц үг:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-4 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Нэвтрэх
          </button>
        </form>
      </div>
    </LoginLayout>
  );
};

export default LoginPage;
