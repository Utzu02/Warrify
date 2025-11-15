import './ContactPage.css';
import ContactHero from '../components/contact/ContactHero';
import ContactForm from '../components/contact/ContactForm';
import Footer from '../components/Footer/Footer';

const contactChannels = [
  {
    label: 'Sales & onboarding',
    detail: 'Book a guided tour and learn how Warrify fits your workflow.',
    meta: 'sales@warrify.com'
  },
  {
    label: 'Customer success',
    detail: 'Need help with a rollout? We reply in less than one business day.',
    meta: 'success@warrify.com'
  },
  {
    label: 'Technical support',
    detail: 'Priority support for enterprise automation or Gmail sync.',
    meta: '+40 720 000 000'
  }
];

function Contact() {
  return (
    <>
      <div className="contact-page">
        <div className="contact-page__inner">
          <ContactHero
            title={
              <>
                Connect with <span className="contact-hero__highlight">Warrify</span> in minutes.
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
