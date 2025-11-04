import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero__content">
          <h1 className="hero__title">
            AI-Powered Project Management
          </h1>
          <p className="hero__description">
            Transform your project management with cutting-edge AI technology. 
            Streamline workflows, automate tasks, and make data-driven decisions.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/signup" className="button">
              Get Started
              <ArrowRight size={18} />
            </Link>
            <Link href="/features" className="button button--secondary">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}