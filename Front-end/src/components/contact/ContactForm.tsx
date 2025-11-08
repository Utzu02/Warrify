import './ContactForm.css';

const ContactForm = () => (
  <div className="contact-form-card">
    <div className="contact-form-card__heading">
      <span className="contact-form-card__badge">Message</span>
      <h3 className="contact-form-card__title">Send us a note</h3>
      <p className="contact-form-card__description">
        Tell us a little about your request and we’ll connect you with the right specialist.
      </p>
    </div>
    <form className="contact-form-card__grid">
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
      <label className="contact-form-card__full-width">
        How can we help?
        <textarea rows={5} placeholder="Share details about your workflow, timeline, or question." />
      </label>
      <button type="submit" className="button buttoninvert contact-form-card__button contact-form-card__full-width">
        Send message
      </button>
    </form>
  </div>
);

export default ContactForm;
