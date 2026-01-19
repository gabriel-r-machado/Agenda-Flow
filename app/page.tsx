'use client';

import Header from '@/components/home/Header';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Comparison from '@/components/home/Comparison';
import HowItWorks from '@/components/home/HowItWorks';
import StatsCalendar from '@/components/home/StatsCalendar';
import Pricing from '@/components/home/Pricing';
import Testimonials from '@/components/home/Testimonials';
import FAQ from '@/components/home/FAQ';
import CTA from '@/components/home/CTA';
import Footer from '@/components/home/Footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section id="hero"><Hero /></section>
      <section id="features"><Features /></section>
      <section id="comparison"><Comparison /></section>
      <section id="how"><HowItWorks /></section>
      <StatsCalendar />
      <section id="pricing"><Pricing /></section>
      <section id="testimonials"><Testimonials /></section>
      <section id="faq"><FAQ /></section>
      <section id="cta"><CTA /></section>
      <section id="footer"><Footer /></section>
    </div>
  );
}

