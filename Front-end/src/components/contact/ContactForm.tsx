const ContactForm = () => (
  <div className="contact-form-card">
    <div className="card-heading">
      <span className="badge">Message</span>
      <h3>Send us a note</h3>
      <p>Tell us a little about your request and we’ll connect you with the right specialist.</p>
    </div>
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
);

export default ContactForm;
