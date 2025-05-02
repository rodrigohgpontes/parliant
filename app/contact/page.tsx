"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="container max-w-2xl py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
                <p className="text-muted-foreground">
                    Have questions or feedback? We'd love to hear from you.
                </p>
            </div>

            <div className="space-y-4">
                <p className="text-lg">
                    Email:{" "}
                    <span
                        className="text-primary hover:underline cursor-pointer"
                        onClick={() => {
                            const email = [
                                "contact",
                                String.fromCharCode(64),
                                "parliant",
                                String.fromCharCode(46),
                                "ai",
                            ].join("");
                            window.location.href = `mailto:${email}`;
                        }}
                    >
                        contact<span className="hidden">no-spam</span>@parliant.ai
                    </span>
                </p>
            </div>

            <div className="mt-8">
                <Link href="/">
                    <Button variant="outline">Back to Home</Button>
                </Link>
            </div>
        </div>
    );
} 