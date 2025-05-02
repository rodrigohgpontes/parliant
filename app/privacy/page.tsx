import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="container max-w-4xl py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose dark:prose-invert">
                <h2>1. Information We Collect</h2>
                <p>
                    We collect information that you provide directly to us, including your name, email address, and survey responses. We also automatically collect certain information about your device and usage of our service.
                </p>

                <h2>2. How We Use Your Information</h2>
                <p>
                    We use the information we collect to:
                </p>
                <ul>
                    <li>Provide and maintain our service</li>
                    <li>Process your survey responses</li>
                    <li>Send you important updates and notifications</li>
                    <li>Improve our service and develop new features</li>
                </ul>

                <h2>3. Data Storage and Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your personal information. Your data is stored securely and encrypted in transit and at rest.
                </p>

                <h2>4. Data Sharing</h2>
                <p>
                    We do not sell your personal information. We may share your information with third-party service providers who assist us in operating our service, but only to the extent necessary to provide the service.
                </p>

                <h2>5. Your Rights</h2>
                <p>
                    You have the right to access, correct, or delete your personal information. You can also opt-out of certain communications and data processing activities.
                </p>

                <h2>6. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at privacy@parliant.ai
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