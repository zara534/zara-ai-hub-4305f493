import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardHeader className="space-y-4">
            <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Terms of Service
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-foreground/90">
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">1. About ZARA AI HUB</h2>
              <p className="leading-relaxed">
                ZARA AI HUB is owned and operated by Goodluck Zara. This platform provides access to multiple AI models for text generation, image creation, and other AI-powered services. By using ZARA AI HUB, you agree to these Terms of Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">2. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using ZARA AI HUB, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use this service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">3. Use License</h2>
              <p className="leading-relaxed">
                Permission is granted to access ZARA AI HUB for personal and professional use. This is the grant of a license, not a transfer of title. Under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the platform's code or materials</li>
                <li>Attempt to reverse engineer any software or AI models</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Use the service for illegal or harmful purposes</li>
                <li>Attempt to overwhelm or exploit the service</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">4. AI Services & Usage</h2>
              <p className="leading-relaxed">
                ZARA AI HUB provides access to various AI models for text generation, image creation, and other AI capabilities. Users agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use these services responsibly and ethically</li>
                <li>Not generate illegal, harmful, or offensive content</li>
                <li>Respect daily usage limits set by the administrator</li>
                <li>Understand that AI-generated content may not always be accurate</li>
                <li>Not use the service to impersonate others or spread misinformation</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">5. User Accounts & Responsibility</h2>
              <p className="leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">6. Content & Intellectual Property</h2>
              <p className="leading-relaxed">
                Content you create using ZARA AI HUB belongs to you, but you grant us the right to use, modify, and display user-generated content for the purpose of improving our services. ZARA AI HUB and all its original content, features, and functionality are owned by Goodluck Zara and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">7. Service Availability & Limitations</h2>
              <p className="leading-relaxed">
                ZARA AI HUB is provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Uninterrupted or error-free service operation</li>
                <li>Accuracy or reliability of AI-generated content</li>
                <li>That the service will meet all your requirements</li>
                <li>That any errors will be corrected</li>
              </ul>
              <p className="leading-relaxed mt-2">
                We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">8. Limitation of Liability</h2>
              <p className="leading-relaxed">
                In no event shall Goodluck Zara or ZARA AI HUB be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or other intangible losses resulting from your use of the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">9. Privacy & Data Protection</h2>
              <p className="leading-relaxed">
                Your use of ZARA AI HUB is governed by our Privacy Policy. We are committed to protecting your personal data and will only use your information as described in our Privacy Policy. We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">10. Modifications to Terms</h2>
              <p className="leading-relaxed">
                Goodluck Zara reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. Your continued use of ZARA AI HUB after any such changes constitutes your acceptance of the new Terms of Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">11. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms of Service or ZARA AI HUB, please contact Goodluck Zara through our support channels within the platform.
              </p>
            </section>

            <section className="space-y-3 border-t pt-4">
              <p className="text-sm text-muted-foreground text-center">
                © {new Date().getFullYear()} ZARA AI HUB by Goodluck Zara. All rights reserved.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
