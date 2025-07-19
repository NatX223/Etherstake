'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

// Navbar
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-dark/80 backdrop-blur border-b border-dark/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="text-accent font-bold text-2xl tracking-tight">EtherStake</div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how" className="text-gray-900 hover:underline underline-offset-8 transition">How It Works</a>
          <a href="#explore" className="text-gray-900 hover:underline underline-offset-8 transition">Explore</a>
          <button className="ml-4 bg-accent text-dark font-semibold rounded-lg shadow px-5 py-2 transition hover:scale-105">Connect Wallet</button>
        </div>
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  const words = ["Yourself", "Your Faves", "The Best"];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-primary to-dark pt-24 pb-12 text-center"
    >
      <h1 className="text-accent font-extrabold text-4xl md:text-6xl drop-shadow-lg mb-6">
        <span className="inline-flex items-center">
          Bet on{' '}
          <span className="inline-block relative min-w-[7ch] ml-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={words[index]}
                initial={{ y: 30, opacity: 0, rotateX: 90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                exit={{ y: -30, opacity: 0, rotateX: -90 }}
                transition={{ duration: 0.5 }}
                className="text-accent"
                style={{ position: 'static', left: 'unset', right: 'unset', display: 'inline-block' }}
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
        .
      </h1>
      <p className="max-w-xl mx-auto text-zinc-100 text-lg md:text-2xl mb-8">Create goals, stake ETH, let others bet. Earn if you succeed.</p>
      <a href="/create" className="bg-accent text-dark font-bold rounded-xl px-8 py-4 text-lg shadow-lg hover:scale-105 transition-transform duration-300">Start a Challenge</a>
    </motion.section>
  );
}

// How It Works
const steps = [
  {
    title: 'Create a challenge',
    desc: 'Set your goal, deadline, and proof requirements.',
  },
  {
    title: 'Stake ETH & Publish',
    desc: 'Lock your ETH and make your challenge public.',
  },
  {
    title: 'Others Bet',
    desc: 'Friends and strangers bet on your success or failure.',
  },
  {
    title: 'Complete & Earn',
    desc: 'Achieve your goal and earn rewards if you succeed.',
  },
];
function HowItWorks() {
  return (
    <section id="how" className="bg-dark border-t-2 border-primary py-20 px-4">
      <h2 className="text-accent text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="flex flex-col items-center bg-dark border border-accent/40 rounded-xl p-6 shadow-lg transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-accent text-dark font-bold text-xl rounded-full mb-4 shadow">
              {i + 1}
            </div>
            <h3 className="text-lg font-semibold text-accent mb-2 text-center">{step.title}</h3>
            <p className="text-gray-900 text-center text-sm">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Featured Challenges
const challenges = [
  {
    title: 'Run a Marathon',
    Odds: '0.5',
    deadline: '2024-08-01',
    user: {
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    title: '30-Day Coding Streak',
    Odds: '0.8',
    deadline: '2024-07-15',
    user: {
      name: 'Sarah Kim',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    title: 'Lose 10kg',
    Odds: '0.1',
    deadline: '2024-09-10',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    title: 'Read 12 Books',
    Odds: '0.5',
    deadline: '2024-12-31',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  },
];
function FeaturedChallenges() {
  return (
    <section id="explore" className="bg-gradient-to-b from-dark to-primary py-20 px-4">
      <h2 className="text-accent text-3xl md:text-4xl font-bold text-center mb-12">Featured Challenges</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {challenges.map((ch, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="bg-dark border border-accent rounded-xl p-6 shadow-lg flex flex-col gap-4 hover:scale-105 hover:shadow-accent/40 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <img 
                src={ch.user.avatar} 
                alt={ch.user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-accent/30"
              />
              <span className="text-zinc-900 font-medium text-sm">{ch.user.name}</span>
            </div>
            <h3 className="text-accent font-bold text-xl mb-2">{ch.title}</h3>
            <div className="flex items-center justify-between text-zinc-900 text-sm mb-2">
              <span>Odds: <span className="font-semibold">{ch.Odds}</span></span>
              <span>Deadline: <span className="font-semibold">{ch.deadline}</span></span>
            </div>
            <a href={`/challenge/${i + 1}`} className="mt-auto bg-accent text-dark rounded-lg px-5 py-2 font-semibold shadow hover:scale-105 transition text-center">Stake</a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Leaderboard Data
const leaderboard = [
  {
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    ethWon: 8.2,
  },
  {
    name: 'Sarah Kim',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    ethWon: 7.5,
  },
  {
    name: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    ethWon: 6.9,
  },
  {
    name: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    ethWon: 6.1,
  },
  {
    name: 'David Lee',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    ethWon: 5.7,
  },
];

function Leaderboard() {
  return (
    <section className="bg-dark border-t-2 border-primary py-16 px-4">
      <h2 className="text-accent text-3xl md:text-4xl font-bold text-center mb-10">Leaderboard</h2>
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark border border-accent/30 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary/10">
                <th className="py-4 px-6 text-accent font-semibold text-lg">#</th>
                <th className="py-4 px-6 text-accent font-semibold text-lg">User</th>
                <th className="py-4 px-6 text-accent font-semibold text-lg text-right">ETH Won</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, i) => (
                <tr key={user.name} className="border-t border-accent/20 hover:bg-primary/10 transition">
                  <td className="py-4 px-6 text-accent font-bold text-xl align-middle">{i + 1}</td>
                  <td className="py-4 px-6 flex items-center gap-4 align-middle">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-accent/30" />
                    <span className="text-zinc-100 font-medium">{user.name}</span>
                  </td>
                  <td className="py-4 px-6 text-accent font-bold text-lg text-right align-middle">{user.ethWon} <span className="text-zinc-400 font-normal text-base">ETH</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// Call To Action
function CallToAction() {
  return (
    <section className="bg-primary text-dark py-20 px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Stake on Your Success?</h2>
      <p className="text-lg md:text-xl mb-8">Join EtherStake and turn challenges into wins.</p>
      <button className="bg-dark text-accent rounded-full px-8 py-4 text-lg font-bold shadow-lg hover:scale-105 transition-transform duration-300">Launch App</button>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-black text-gray-100 text-center text-sm py-6">
      Built with <span className="text-green-400">💚</span> by EtherStake. All rights reserved.
    </footer>
  );
}

export function LandingPage() {
  return (
    <main className="bg-dark min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturedChallenges />
      <Leaderboard />
      <CallToAction />
      <Footer />
    </main>
  );
} 