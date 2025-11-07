import './styles/Contact.css';
import left from '../assets/people.jpg';

const contactChannels = [
  { title: 'Product support', detail: 'support@warrify.com', description: 'Typical reply in under 4 business hours.' },
  { title: 'Sales & onboarding', detail: '+40 743 000 321', description: 'Mon–Fri · 09:00 – 18:00 EET' },
  { title: 'Enterprise inquiries', detail: 'enterprise@warrify.com', description: 'Custom workflows, SLAs, and integrations.' },
];

function Contact() {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <p className="eyebrow">Contact us</p>
        <h1>We’re a message away.</h1>
        <p>
          Reach out for support, onboarding, or custom integrations. Our team replies fast and makes sure every conversation ends with clarity.
        </p>
      </section>

      <div className="contact-wrapper">
        <div className="contact-form-card">
          <h3>Send us a note</h3>
          <p>Tell us a little about your request and we’ll connect you with the right specialist.</p>
          <form className="form-grid">
            <label>
              Full name
              <input type="text" placeholder="Alex Popescu" required />
            </label>
            <label>
              Work email
              <input type="email" placeholder="team@company.com" required />
            </label>
            <label>
              Company
              <input type="text" placeholder="Your organization" />
            </label>
            <label>
              Phone number
              <input type="tel" placeholder="+40 7xx xxx xxx" />
            </label>
            <label className="full-width">
              How can we help?
              <textarea rows={5} placeholder="Share details about your workflow, timeline, or question." />
            </label>
            <button type="submit" className="button buttoninvert full-width">
              Send message
            </button>
          </form>
        </div>

        <div className="contact-info-card">
          <img src={left} alt="Our support team" />
          <div className="info-content">
            <h3>Talk to a real person</h3>
            <p>Pick the best channel for you. We track every request, so you won’t repeat yourself.</p>
            <div className="info-grid">
              {contactChannels.map((channel) => (
                <div key={channel.title} className="info-pill">
                  <p className="pill-title">{channel.title}</p>
                  <p className="pill-detail">{channel.detail}</p>
                  <span>{channel.description}</span>
                </div>
              ))}
            </div>
            <div className="office-hours">
              <div>
                <p className="pill-title">Office</p>
                <p>Str. Aviatorilor 12, Bucharest</p>
              </div>
              <div>
                <p className="pill-title">Live chat</p>
                <p>Available inside the dashboard · 08:00 – 22:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
