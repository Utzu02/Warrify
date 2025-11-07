type Channel = {
  title: string;
  detail: string;
  description: string;
};

type OfficeInfo = {
  location: string;
  liveChat: string;
};

type ContactInfoCardProps = {
  image: string;
  overlayStatus: string;
  overlaySubtitle: string;
  channels: Channel[];
  office: OfficeInfo;
};

const ContactInfoCard = ({ image, overlayStatus, overlaySubtitle, channels, office }: ContactInfoCardProps) => (
  <div className="contact-info-card">
    <div className="info-visual">
      <img src={image} alt="Our support team" />
      <div className="info-overlay">
        <p>{overlaySubtitle}</p>
        <strong>{overlayStatus}</strong>
      </div>
    </div>
    <div className="info-content">
      <div className="card-heading">
        <span className="badge secondary">Channels</span>
        <h3>Talk to a real person</h3>
        <p>Pick the best channel for you. We track every request, so you won’t repeat yourself.</p>
      </div>
      <div className="info-grid">
        {channels.map((channel) => (
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
          <p>{office.location}</p>
        </div>
        <div>
          <p className="pill-title">Live chat</p>
          <p>{office.liveChat}</p>
        </div>
      </div>
    </div>
  </div>
);

export default ContactInfoCard;
