import './styles/ContactPage.css';
import ContactHero from '../components/contact/ContactHero';
import ContactStats from '../components/contact/ContactStats';
import ContactForm from '../components/contact/ContactForm';

const responseStats = [
  { title: 'Average response', value: '2h 15m' },
  { title: 'Happy clients', value: '1,200+' },
  { title: 'Time zones covered', value: '18' }
];

function Contact() {
  return (
    <div className="contact-page">
      <ContactHero
        eyebrow="Contact us"
        title="We’re a message away."
        description="Reach out for support, onboarding, or custom integrations. Our team replies fast and makes sure every conversation ends with clarity."
      />

      <ContactStats stats={responseStats} />

      <div className="contact-wrapper">
        <ContactForm />
      </div>
    </div>
  );
}

export default Contact;
