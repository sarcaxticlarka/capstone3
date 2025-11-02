"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('cinescope_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="relative h-[85vh] md:h-[95vh]">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 z-10"></div>
                <img
                    src="https://images.pexels.com/photos/7991394/pexels-photo-7991394.jpeg"
                    alt="Hero"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Hero Content */}
            <div className="relative z-20 h-full flex items-center px-4 md:px-12">
                <div className="max-w-2xl">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                        Unlimited movies, TV shows, and more
                    </h1>
                    <p className="text-xl md:text-2xl text-white mb-2">Watch anywhere. Cancel anytime.</p>
                    <p className="text-lg text-gray-300 mb-8">
                        Ready to watch? Enter your email to create or restart your membership.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href={user ? '#' : '/register'}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded flex items-center justify-center gap-2 transition transform hover:scale-105"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Get Started
                        </a>
                        <button className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xl font-bold rounded border border-white/50 transition">
                            More Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}