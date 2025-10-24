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
              <h2 className="text-2xl font-bold text-primary">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using ZARA AI HUB, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">2. Use License</h2>
              <p className="leading-relaxed">
                Permission is granted to temporarily access the materials (information or software) on ZARA AI HUB for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You may not modify or copy the materials</li>
                <li>You may not use the materials for any commercial purpose</li>
                <li>You may not attempt to decompile or reverse engineer any software</li>
                <li>You may not remove any copyright or other proprietary notations</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">3. AI Services</h2>
              <p className="leading-relaxed">
                ZARA AI HUB provides AI-powered services including text generation, image creation, and text-to-speech. Users agree to use these services responsibly and ethically.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">4. User Accounts</h2>
              <p className="leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">5. Disclaimer</h2>
              <p className="leading-relaxed">
                The materials on ZARA AI HUB are provided on an 'as is' basis. ZARA AI HUB makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">6. Limitations</h2>
              <p className="leading-relaxed">
                In no event shall ZARA AI HUB or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ZARA AI HUB.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">7. Privacy</h2>
              <p className="leading-relaxed">
                Your use of ZARA AI HUB is also governed by our Privacy Policy. We respect your privacy and are committed to protecting your personal data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">8. Modifications</h2>
              <p className="leading-relaxed">
                ZARA AI HUB may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-primary">9. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our support channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
