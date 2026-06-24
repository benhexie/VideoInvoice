import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  HeroSection,
  SocialProofBar,
  HowItWorksSection,
  FeaturesSection,
  TemplatesSection,
  ProSection,
  CtaSection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofBar />
        <HowItWorksSection />
        <FeaturesSection />
        <TemplatesSection />
        <ProSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
