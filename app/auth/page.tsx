'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye, EyeOff, Calendar, ArrowLeft, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { emailSchema, passwordSchema, nameSchema } from '@/lib/validations';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Eye Ball Component
interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

// Pupil Component
interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

// Google G SVG
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 533.5 544.3" width="18" height="18" {...props}>
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4-50.4H272v95.5h147.4c-6.4 34-25.8 62.8-55 82v68h88.8c52-48 81.3-118.6 81.3-195.1z"/>
    <path fill="#34A853" d="M272 544.3c73.7 0 135.6-24.4 180.8-66.2l-88.8-68c-24.7 16.6-56.4 26.5-92 26.5-70.8 0-130.8-47.8-152.2-112.1h-90.2v70.5C93.9 475.1 176.3 544.3 272 544.3z"/>
    <path fill="#FBBC05" d="M119.8 322.3c-10.9-32.4-10.9-67.6 0-100l-90.2-70.6C3.6 188.5 0 230.8 0 272.2s3.6 83.8 29.6 120.4l90.2-70.3z"/>
    <path fill="#EA4335" d="M272 107.4c38.9 0 74 13.39 101.6 39.6l76.2-76.1C405.8 24.2 342.9 0 272 0 176.3 0 93.9 69.2 49.6 174.6l90.2 70.5C141.2 155.2 201.2 107.4 272 107.4z"/>
  </svg>
);

// TypingWord component: types and deletes words in a loop
interface TypingWordProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  displayTime?: number; // ms to keep the full word visible
}

const TypingWord = ({ words, typingSpeed = 80, deletingSpeed = 40, displayTime = 5000 }: TypingWordProps) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const currentWord = words[wordIndex];

    if (!isDeleting && charIndex === currentWord.length) {
      // finished typing, wait displayTime then start deleting
      timeout = setTimeout(() => setIsDeleting(true), displayTime);
    } else if (isDeleting && charIndex === 0) {
      // finished deleting, move to next word
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setCharIndex((c) => c + (isDeleting ? -1 : 1));
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [charIndex, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, displayTime]);

  useEffect(() => {
    const blinkInt = setInterval(() => setBlink((b) => !b), 500);
    return () => clearInterval(blinkInt);
  }, []);

  const current = words[wordIndex].substring(0, charIndex);

  return (
    <span className="inline-flex items-center">
      <span>{current}</span>
      <span aria-hidden className="ml-1" style={{ opacity: blink ? 1 : 0 }}>|</span>
    </span>
  );
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const { signIn, signUp, user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirectTo');
      const destination = redirectTo && redirectTo.startsWith('/') 
        ? redirectTo 
        : '/dashboard';
      router.push(destination);
    }
  }, [user, router, searchParams]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking effect for purple
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Blinking effect for black
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Looking at each other when typing
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // Peeking animation
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsPurplePeeking(false);
    }
  }, [password, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const processAuthenticationSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!isLogin) {
        nameSchema.parse(name);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        setLoading(false);
        return;
      }
    }

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        logger.error('Login failed', { context: 'Auth', metadata: { email } });
        setError('Credenciais inválidas. Tente novamente.');
        toast.error('Credenciais inválidas. Tente novamente.');
      } else {
        toast.success('Login realizado com sucesso!');
        // Redirecionamento acontece automaticamente via useEffect quando user muda
      }
    } else {
      if (!agreeToTerms) {
        setError('Você precisa aceitar os Termos de Serviço e a Política de Privacidade');
        toast.error('Você precisa aceitar os Termos de Serviço e a Política de Privacidade');
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, name);
      if (error) {
        logger.error('Sign up failed', { context: 'Auth', metadata: { email } });
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado');
          toast.error('Este email já está cadastrado');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
          toast.error('Erro ao criar conta. Tente novamente.');
        }
      } else {
        toast.success('Conta criada com sucesso!');
        // Redirecionamento acontece automaticamente via useEffect quando user muda
      }
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setForgotLoading(true);
    try {
      emailSchema.parse(forgotEmail);
      // redirect back to auth page after user resets password
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: redirectUrl,
      } as any);

      if (error) {
        logger.error('Reset password failed', { context: 'Auth', metadata: { email: forgotEmail, error } });
        toast.error('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.');
      } else {
        toast.success('Se o e-mail existe, um link de recuperação foi enviado.');
        setForgotOpen(false);
      }
    } catch (err) {
      logger.error('Reset password exception', { context: 'Auth', metadata: { err } });
      toast.error('Ocorreu um erro. Tente novamente mais tarde.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      logger.error('Google sign in failed', { context: 'Auth' });
      setError('Erro ao conectar com Google. Tente novamente.');
      toast.error('Erro ao conectar com Google. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Content Section */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-12 text-white">
        <div className="relative z-20">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label="Voltar para a home"
              className="text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-5" />
            </button>

              <img src="/assets/brand-icon.png" alt="AgendaFlow" className="w-8 h-8" />
            <span className="text-white">AgendaFlow</span>
          </div>
        </div>

        <div className="relative z-20 flex flex-col items-center justify-center h-[500px]">
          {/* CTA Phrase */}
          <div className="mb-8 text-center">
            <p className="text-xl font-semibold leading-relaxed max-w-sm">
              Os nossos assistentes estão de olho, complete seu cadastro e comece a otimizar seus agendamentos
            </p>
          </div>

          {/* Cartoon Characters */}
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            {/* Purple character */}
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px',
                width: '180px',
                height: (isTyping || (password.length > 0 && !showPassword)) ? '440px' : '400px',
                backgroundColor: '#6C3FF5',
                borderRadius: '10px 10px 0 0',
                zIndex: 1,
                transform: (password.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : (isTyping || (password.length > 0 && !showPassword))
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall
                  size={18}
                  pupilSize={7}
                  maxDistance={5}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall
                  size={18}
                  pupilSize={7}
                  maxDistance={5}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isPurpleBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            {/* Black character */}
            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px',
                width: '120px',
                height: '310px',
                backgroundColor: '#2D2D2D',
                borderRadius: '8px 8px 0 0',
                zIndex: 2,
                transform: (password.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || (password.length > 0 && !showPassword))
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall
                  size={16}
                  pupilSize={6}
                  maxDistance={4}
                  eyeColor="white"
                  pupilColor="#2D2D2D"
                  isBlinking={isBlackBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            {/* Orange character */}
            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px',
                width: '240px',
                height: '200px',
                zIndex: 3,
                backgroundColor: '#FF9B6B',
                borderRadius: '120px 120px 0 0',
                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                  top: (password.length > 0 && showPassword) ? `${85}px` : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
              </div>
            </div>

            {/* Yellow character */}
            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px',
                width: '140px',
                height: '230px',
                backgroundColor: '#E8D754',
                borderRadius: '70px 70px 0 0',
                zIndex: 4,
                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                  top: (password.length > 0 && showPassword) ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-white/60">
          <Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidade</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Termos de Serviço</Link>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden flex items-center justify-center gap-2 mb-12"
          >
            <img src="/assets/brand-icon.png" alt="AgendaFlow" className="w-8 h-8" />
            <span className="text-lg font-semibold text-foreground">AgendaFlow</span>
          </motion.div>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? 'Entre com suas credenciais para acessar' : 'Comece seu trial gratuito de 3 dias'}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={processAuthenticationSubmission} 
            className="space-y-5"
          >
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="name" className="text-sm font-medium">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  className="h-12 bg-background border-border/60 focus:border-emerald-600 focus:ring-emerald-600/20 transition-all"
                />
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12 bg-background border-border/60 focus:border-emerald-600 focus:ring-emerald-600/20 transition-all"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10 bg-background border-border/60 focus:border-emerald-600 focus:ring-emerald-600/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </motion.div>

            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex items-start gap-2"
              >
                <Checkbox 
                  id="agree" 
                  checked={agreeToTerms} 
                  onCheckedChange={(v) => setAgreeToTerms(Boolean(v))}
                  className="border-border/60 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="agree" className="text-sm">
                  Eu li e aceito os <Link href="/terms" className="text-emerald-600 hover:underline">Termos de Serviço</Link> e a <Link href="/privacy" className="text-emerald-600 hover:underline">Política de Privacidade</Link>.
                </Label>
              </motion.div>
            )}

            {isLogin && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember"
                    className="border-border/60 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Lembrar por 30 dias
                  </Label>
                </div>
                <a href="#" onClick={(e) => { e.preventDefault(); setForgotOpen(true); }} className="text-sm text-emerald-600 hover:underline font-medium">
                  Esqueci a senha
                </a>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-300/50 dark:hover:shadow-emerald-800/40"
                disabled={loading}
              >
                {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar conta grátis'}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <Button
              variant="outline"
              className="w-full h-12 bg-background border-border/60 hover:bg-accent hover:border-emerald-200 dark:hover:border-emerald-800 flex items-center justify-center gap-3 transition-all"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <GoogleIcon />
                </span>
                <span className="text-sm">{loading ? 'Conectando...' : 'Entrar com Google'}</span>
              </span>
            </Button>
          </motion.div>

          {/* Forgot password dialog */}
          <Dialog open={forgotOpen} onOpenChange={(v) => setForgotOpen(v)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recuperar senha</DialogTitle>
                <DialogDescription>
                  Informe o e-mail da sua conta e enviaremos um link para redefinir sua senha.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleForgotPassword} className="mt-4">
                <Label htmlFor="forgot-email" className="text-sm font-medium">E-mail</Label>
                <Input id="forgot-email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="mt-2 mb-4" />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setForgotOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={forgotLoading} className="ml-2">{forgotLoading ? 'Enviando...' : 'Enviar e-mail'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'} {' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-foreground font-medium hover:text-emerald-600 transition-colors"
            >
              {isLogin ? 'Criar conta grátis' : 'Fazer login'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


