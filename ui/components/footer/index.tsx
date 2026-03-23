import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border/50 py-4">
            <div className="container mx-auto px-4 sm:px-8 flex flex-col items-center justify-center gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <p className="text-muted-foreground text-xs sm:text-sm text-center">
                        Built with precision and robust multi-channel notification support
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                        <Link
                            href="https://siv19.dev/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
                        >
                            siv19.dev
                        </Link>
                        <Link
                            href="https://github.com/sivab193"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="w-[18px] h-[18px]" />
                        </Link>
                        <Link
                            href="https://www.linkedin.com/in/sivab193/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-[18px] h-[18px]" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
