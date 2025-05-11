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
                    By accessing or using Parliant.AI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                    Parliant.AI is a survey platform that allows users to create, distribute, and analyze surveys. The Service includes various features and subscription plans as described on our website.
                </p>

                <h2>3. User Accounts</h2>
                <p>
                    To use certain features of the Service, you must create an account. You are responsible for:
                </p>
                <ul>
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Providing accurate and complete information</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                </ul>

                <h2>4. Subscription Plans and Payments</h2>
                <p>
                    The Service offers different subscription plans with varying features and limitations:
                </p>
                <ul>
                    <li>Free Plan: Limited to 3 surveys and 100 responses per month</li>
                    <li>Pro Plan: Additional features and higher limits</li>
                    <li>Enterprise Plan: Custom solutions for larger organizations</li>
                </ul>
                <p>
                    Subscription fees are billed in advance and are non-refundable. We reserve the right to modify our pricing with notice.
                </p>

                <h2>5. User Content and Conduct</h2>
                <p>
                    You retain ownership of your survey content and responses. However, you agree not to:
                </p>
                <ul>
                    <li>Violate any laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Collect sensitive personal information without consent</li>
                    <li>Use the Service for spam or harassment</li>
                    <li>Attempt to reverse engineer the Service</li>
                    <li>Interfere with the Service's operation</li>
                </ul>

                <h2>6. Data Privacy and Security</h2>
                <p>
                    We handle your data according to our Privacy Policy. You are responsible for:
                </p>
                <ul>
                    <li>Obtaining necessary consents from survey respondents</li>
                    <li>Complying with data protection laws</li>
                    <li>Protecting respondent privacy</li>
                    <li>Using the Service in accordance with privacy regulations</li>
                </ul>

                <h2>7. Intellectual Property</h2>
                <p>
                    The Service and its original content, features, and functionality are owned by Parliant.AI and are protected by international copyright, trademark, and other intellectual property laws.
                </p>

                <h2>8. Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law:
                </p>
                <ul>
                    <li>The Service is provided "as is" without warranties</li>
                    <li>We are not liable for any indirect, incidental, or consequential damages</li>
                    <li>Our total liability is limited to the amount paid for the Service</li>
                    <li>We are not responsible for survey responses or content</li>
                </ul>

                <h2>9. Service Modifications</h2>
                <p>
                    We reserve the right to:
                </p>
                <ul>
                    <li>Modify or discontinue the Service</li>
                    <li>Change features or functionality</li>
                    <li>Update subscription plans and pricing</li>
                    <li>Suspend or terminate accounts</li>
                </ul>

                <h2>10. Termination</h2>
                <p>
                    We may terminate or suspend your account and access to the Service:
                </p>
                <ul>
                    <li>For violations of these Terms</li>
                    <li>For fraudulent or illegal activity</li>
                    <li>For non-payment of fees</li>
                    <li>At our sole discretion</li>
                </ul>

                <h2>11. Governing Law</h2>
                <p>
                    These Terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the United States.
                </p>

                <h2>12. Changes to Terms</h2>
                <p>
                    We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
                </p>

                <h2>13. Contact</h2>
                <p>
                    For questions about these Terms, please contact us at legal@parliant.ai
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