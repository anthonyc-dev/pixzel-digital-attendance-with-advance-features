import { Clock, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type HeaderProps = {
    realTimeClock: string;
    currentDate?: string;
};

const Header = ({ realTimeClock, currentDate }: HeaderProps) => {
    return (
        <header className="py-3 px-6 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href={"/"}>
                    <div className="flex items-center gap-3">
                        <Image
                            src="/Pixzel-Digital-Logo-Light-Land.png"
                            alt="Pixzel Logo"
                            width={130}
                            height={130}
                            className="object-contain dark:brightness-110"
                            priority
                        />
                    </div>
                </Link>

                {/* Clock & Date pill */}
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
    )
}

export default Header