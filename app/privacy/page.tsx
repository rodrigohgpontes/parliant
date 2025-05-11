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
                    We collect and process the following categories of information:
                </p>
                <h3>1.1 Information You Provide</h3>
                <ul>
                    <li>Account information (name, email address)</li>
                    <li>Survey content and configurations</li>
                    <li>Survey responses and conversations</li>
                    <li>Payment information (processed securely through our payment providers)</li>
                </ul>

                <h3>1.2 Automatically Collected Information</h3>
                <ul>
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                    <li>Usage patterns and interaction data</li>
                </ul>

                <h2>2. Cookies and Similar Technologies</h2>
                <p>
                    We use only essential cookies that are strictly necessary for the operation of our service. Under Article 5(3) of the ePrivacy Directive and Recital 32 of the GDPR, these cookies are exempt from consent requirements because they are:
                </p>
                <ul>
                    <li>Used solely for the purpose of carrying out the transmission of a communication over an electronic communications network</li>
                    <li>Strictly necessary for the provision of an information society service explicitly requested by the user</li>
                </ul>

                <p>
                    Specifically, we use the following essential cookies:
                </p>
                <ul>
                    <li><strong>Session Cookie:</strong> Required to maintain your authentication state and prevent unauthorized access to your account. This cookie is essential for security and cannot be disabled.</li>
                    <li><strong>CSRF Token:</strong> Required to prevent cross-site request forgery attacks. This cookie is essential for security and cannot be disabled.</li>
                    <li><strong>Load Balancer Cookie:</strong> Required to maintain your session with our servers. This cookie is essential for service functionality and cannot be disabled.</li>
                </ul>

                <p>
                    These cookies are exempt from consent requirements because:
                </p>
                <ul>
                    <li>They are used solely to provide the service you have explicitly requested</li>
                    <li>They are essential for the security and functionality of the service</li>
                    <li>They do not track you across websites or collect any personal data beyond what is necessary for the service</li>
                    <li>They are temporary and are automatically deleted when you close your browser</li>
                </ul>

                <p>
                    We do not use any non-essential cookies, tracking technologies, or third-party analytics. We do not use cookies for:
                </p>
                <ul>
                    <li>Advertising or marketing purposes</li>
                    <li>User behavior tracking</li>
                    <li>Analytics or performance monitoring</li>
                    <li>Personalization beyond your explicit choices</li>
                </ul>

                <p>
                    If you wish to prevent the use of these essential cookies, you can configure your browser settings to block all cookies. However, please note that this will prevent you from using our service, as these cookies are strictly necessary for its operation.
                </p>

                <h2>3. How We Use Your Information</h2>
                <p>
                    We use the collected information for the following purposes:
                </p>
                <ul>
                    <li>Providing and maintaining our survey platform</li>
                    <li>Processing and storing survey responses</li>
                    <li>Managing user accounts and subscriptions</li>
                    <li>Improving our services and user experience</li>
                    <li>Communicating with you about your account and services</li>
                    <li>Preventing fraud and ensuring platform security</li>
                </ul>

                <h2>4. Data Storage and Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your data:
                </p>
                <ul>
                    <li>Data encryption in transit and at rest</li>
                    <li>Regular security assessments</li>
                    <li>Access controls and authentication</li>
                    <li>Secure data centers and cloud infrastructure</li>
                </ul>

                <h2>5. Data Sharing and Third Parties</h2>
                <p>
                    We may share your information with:
                </p>
                <ul>
                    <li>Service providers who assist in operating our platform</li>
                    <li>Payment processors for subscription management</li>
                    <li>Legal authorities when required by law</li>
                </ul>
                <p>
                    We do not sell your personal information to third parties.
                </p>

                <h2>6. Data Retention</h2>
                <p>
                    We retain your data for as long as necessary to provide our services and comply with legal obligations. Survey responses are retained according to your subscription plan and account settings.
                </p>

                <h2>7. Your Rights</h2>
                <p>
                    Depending on your location, you may have the following rights:
                </p>
                <ul>
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to data processing</li>
                    <li>Data portability</li>
                    <li>Withdraw consent</li>
                </ul>

                <h2>8. International Data Transfers</h2>
                <p>
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable laws.
                </p>

                <h2>9. Children's Privacy</h2>
                <p>
                    Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children.
                </p>

                <h2>10. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy periodically. We will notify you of any material changes through our platform or via email.
                </p>

                <h2>11. Contact Us</h2>
                <p>
                    For any questions about this Privacy Policy or our data practices, please contact us at privacy@parliant.ai
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