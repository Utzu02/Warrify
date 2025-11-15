import './ContactPage.css';
import ContactHero from '../components/contact/ContactHero';
import ContactForm from '../components/contact/ContactForm';
import Footer from '../components/footer/Footer';

function Contact() {
  return (
    <>
      <div className="contact-page">
        <div className="contact-page-inner">
          <ContactHero
            title={
              <>
                Connect with <span className="contact-hero-highlight">Warrify</span> in minutes.
              </>
            }
            description="Reach out for support, onboarding, or custom integrations. Our team replies fast and makes sure every conversation ends with clarity."
          />

          <section className="contact-content-grid">
              <ContactForm />
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
