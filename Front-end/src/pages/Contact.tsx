import './styles/ContactPage.css';
import left from '../assets/people.jpg';
import ContactHero from '../components/contact/ContactHero';
import ContactStats from '../components/contact/ContactStats';
import ContactForm from '../components/contact/ContactForm';
import ContactInfoCard from '../components/contact/ContactInfoCard';

const contactChannels = [
  { title: 'Product support', detail: 'support@warrify.com', description: 'Typical reply in under 4 business hours.' },
  { title: 'Sales & onboarding', detail: '+40 743 000 321', description: 'Mon–Fri · 09:00 – 18:00 EET' },
  { title: 'Enterprise inquiries', detail: 'enterprise@warrify.com', description: 'Custom workflows, SLAs, and integrations.' },
];

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
        <ContactInfoCard
          image={left}
          overlaySubtitle="Live status"
          overlayStatus="All agents available"
          channels={contactChannels}
          office={{
            location: 'Str. Aviatorilor 12, Bucharest',
            liveChat: 'Available inside the dashboard · 08:00 – 22:00'
          }}
        />
      </div>
    </div>
  );
}

export default Contact;
