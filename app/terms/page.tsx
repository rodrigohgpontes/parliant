import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="container max-w-4xl py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
                <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose dark:prose-invert">
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing and using Parliant.AI, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h2>2. Use License</h2>
                <p>
                    Permission is granted to temporarily use Parliant.AI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                </p>

                <h2>3. User Account</h2>
                <p>
                    You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                </p>

                <h2>4. Service Limitations</h2>
                <p>
                    The free plan includes up to 3 surveys and 100 responses per month. Additional features are available in our Pro and Enterprise plans.
                </p>

                <h2>5. Data Privacy</h2>
                <p>
                    We take your privacy seriously. Please refer to our Privacy Policy for information on how we collect, use, and protect your data.
                </p>

                <h2>6. Modifications</h2>
                <p>
                    We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date of these terms.
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