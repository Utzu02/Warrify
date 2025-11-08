type Channel = {
  title: string;
  detail: string;
  description: string;
};

type OfficeInfo = {
  location: string;
  liveChat: string;
};

import './ContactInfoCard.css';

type ContactInfoCardProps = {
  image: string;
  overlayStatus: string;
  overlaySubtitle: string;
  channels: Channel[];
  office: OfficeInfo;
};

const ContactInfoCard = ({ image, overlayStatus, overlaySubtitle, channels, office }: ContactInfoCardProps) => (
  <div className="contact-info-card">
    <div className="contact-info-card__visual">
      <img src={image} alt="Our support team" />
      <div className="contact-info-card__overlay">
        <p>{overlaySubtitle}</p>
        <strong>{overlayStatus}</strong>
      </div>
    </div>
    <div className="contact-info-card__content">
      <div className="contact-info-card__heading">
        <span className="contact-info-card__badge contact-info-card__badge--secondary">Channels</span>
        <h3>Talk to a real person</h3>
        <p>Pick the best channel for you. We track every request, so you won’t repeat yourself.</p>
      </div>
      <div className="contact-info-card__grid">
        {channels.map((channel) => (
          <div key={channel.title} className="contact-info-card__pill">
            <p className="contact-info-card__pill-title">{channel.title}</p>
            <p className="contact-info-card__pill-detail">{channel.detail}</p>
            <span>{channel.description}</span>
          </div>
        ))}
      </div>
      <div className="contact-info-card__office">
        <div>
          <p className="contact-info-card__pill-title">Office</p>
          <p>{office.location}</p>
        </div>
        <div>
          <p className="contact-info-card__pill-title">Live chat</p>
          <p>{office.liveChat}</p>
        </div>
      </div>
    </div>
  </div>
);

export default ContactInfoCard;
