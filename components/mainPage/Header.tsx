"use client"

import { Clock, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type HeaderProps = {
    realTimeClock: string;
    currentDate?: string;
};

const Header = ({ realTimeClock, currentDate }: HeaderProps) => {
    const [isDark, setIsDark] = useState(false);
    const [isThemeReady, setIsThemeReady] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    useEffect(() => {
        const theTheme = async () => {
            const theme = localStorage.getItem("theme");
            const dark = theme === "dark";

            setIsDark(dark);
            document.documentElement.classList.toggle("dark", dark);
            setIsThemeReady(true);
        }
        theTheme()
    }, []);

    return (
        <header className="py-3 px-6 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <Link href="/">
                    <div className="relative w-[130px] h-[40px] flex items-center">
                        {/* Show skeleton only while theme is loading OR image is loading */}
                        {(!isThemeReady || !isImageLoaded) && (
                            <div className="absolute inset-0 flex items-center gap-3 animate-pulse">
                                <div className="w-[40px] h-[40px] rounded-full bg-muted" />
                                <div className="flex flex-col gap-2">
                                    <div className="w-[120px] h-[10px] bg-muted rounded" />
                                    <div className="w-[80px] h-[8px] bg-muted rounded" />
                                </div>
                            </div>
                        )}

                        {/* Logo - only render when theme is ready */}
                        {isThemeReady && (
                            <Image
                                src={isDark ? "/Pixzel-Digital-Logo-Light-Land.png" : "/pixzel-logo.png"}
                                alt="Pixzel Logo"
                                fill
                                className={`object-contain transition-all duration-300 ${isImageLoaded ? "opacity-100" : "opacity-0"
                                    }`}
                                onLoad={() => setIsImageLoaded(true)}
                                priority
                            />
                        )}
                    </div>
                </Link>

                {/* Clock & Date */}
                <div className="flex items-center gap-4">
                    {currentDate && (
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {currentDate}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl border border-border">
                        <Clock className="w-4 h-4 text-muted-foreground animate-pulse" />
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                            {realTimeClock}
                        </span>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;