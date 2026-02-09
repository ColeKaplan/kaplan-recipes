import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }

        setLoading(false);
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl shadow-md w-80"
                >
                    <h1 className="text-2xl font-bold mb-4 text-center">Log In</h1>

                    <input
                        type="email"
                        className="w-full p-2 mb-3 border rounded"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        className="w-full p-2 mb-3 border rounded"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                    )}

                    {success && (
                        <p className="text-green-600 text-sm mb-3 text-center">
                            Logged in
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default Login;
