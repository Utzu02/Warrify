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
            <div className="contact-info-panel">
              <div className="contact-info-card">
                <p className="contact-info-card__eyebrow">How we help</p>
                <h3>Talk with the team that builds Warrify</h3>
                <p>
                  Share your challenge, drop us files, or request a guided implementation. We work with you until every
                  automation is live.
                </p>
                <div className="contact-channel-list">
                  {contactChannels.map((channel) => (
                    <div key={channel.label} className="contact-channel">
                      <h4>{channel.label}</h4>
                      <p>{channel.detail}</p>
                      <span>{channel.meta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="contact-form-panel" id="contact-form">
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
