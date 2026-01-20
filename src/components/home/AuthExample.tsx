'use client';

import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

export default function AuthExample() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login
    };

    return (
        <div className="flex h-[700px] w-full bg-background">
            {/* Left Side - Green Solid with Branding */}
            <div className="w-full hidden md:flex md:flex-col md:items-center md:justify-center bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-300 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 text-center max-w-md px-8">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">
                        AgendaFlow
                    </h1>
                    <p className="text-xl text-white/90 mb-8">
                        Simplifique seus agendamentos e foque no que importa: seus clientes.
                    </p>
                    <div className="space-y-4 text-left">
                        {[
                            '3 dias grátis para experimentar',
                            'Página pública personalizada',
                            'Agendamento online 24/7',
                            'Lembretes automáticos',
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 text-white/90">
                                <div className="w-2 h-2 rounded-full bg-white" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full flex flex-col items-center justify-center p-6 md:p-0">
                <form onSubmit={handleSubmit} className="md:w-96 w-full max-w-sm flex flex-col items-center justify-center">
                    <h2 className="text-4xl font-bold text-foreground mb-2">Bem-vindo!</h2>
                    <p className="text-sm text-muted-foreground mt-1 mb-8">Entre com suas credenciais para acessar</p>

                    {/* Google Sign-In Button */}
                    <button
                        type="button"
                        className="w-full bg-muted hover:bg-muted/80 flex items-center justify-center h-12 rounded-full transition-colors"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 w-full my-6">
                        <div className="w-full h-px bg-border"></div>
                        <p className="text-nowrap text-sm text-muted-foreground">ou entre com email</p>
                        <div className="w-full h-px bg-border"></div>
                    </div>

                    {/* Email Input */}
                    <div className="flex items-center w-full bg-background border border-border h-12 rounded-full overflow-hidden pl-4 gap-3">
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor" className="text-muted-foreground" />
                        </svg>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm w-full h-full"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="flex items-center mt-4 w-full bg-background border border-border h-12 rounded-full overflow-hidden pl-4 gap-3">
                        <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="currentColor" className="text-muted-foreground" />
                        </svg>
                        <input
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm w-full h-full"
                            required
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="w-full flex items-center justify-between mt-6 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <input
                                className="h-4 w-4 rounded border-border"
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="text-sm cursor-pointer" htmlFor="remember">
                                Lembrar-me
                            </label>
                        </div>
                        <Link href="#" className="text-sm hover:text-foreground transition-colors">
                            Esqueci a senha
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="mt-6 w-full h-11 rounded-full text-white font-medium bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 transition-opacity shadow-lg"
                    >
                        Entrar
                    </button>

                    {/* Sign Up Link */}
                    <p className="text-muted-foreground text-sm mt-6">
                        Não tem conta?{" "}
                        <Link href="/auth" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                            Criar conta grátis
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}


