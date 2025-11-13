import './ContactPage.css';
import ContactHero from '../components/contact/ContactHero';
import ContactForm from '../components/contact/ContactForm';
import Footer from '../components/Footer/Footer';

function Contact() {
  return (
    <>
      <div className="contact-page">
        <ContactHero
          eyebrow="Contact us"
          title="We're a message away."
          description="Reach out for support, onboarding, or custom integrations. Our team replies fast and makes sure every conversation ends with clarity."
        />

        <div className="contact-wrapper">
          <ContactForm />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
