import { forwardRef } from "react";
import { nameFontSize } from "@/lib/utils";

type Props = { fullName: string; designation?: string; photo?: string };

export const EventCard = forwardRef<HTMLDivElement, Props>(function EventCard({ fullName, designation, photo }, ref) {
  const displayName = fullName.trim() || "FULL NAME";
  return (
    <div ref={ref} className="event-card reference-card" data-export-card>
      <div className="reference-card__texture" />
      <div className="reference-card__blue-wash" />
      <div className="reference-card__content">
        <div className="attend-pill">EXCITED TO ATTEND</div>
        <section className="card-title">
          <h2>ADREACH<br /><span>TIKTOK SEMINAR</span></h2>
          <strong>2026</strong>
        </section>
        <p className="card-tagline">LEARN. GROW. CONNECT. SCALE</p>
        <section className="attendee-block">
        <div className="portrait-frame">
          {/* The source is an ephemeral browser data URL, so Next image optimization cannot be used. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {photo ? <img src={photo} alt="" /> : <div className="portrait-placeholder"><span>+</span><b>YOUR PHOTO</b></div>}
        </div>
        <div className={`attendee-copy ${designation ? "" : "attendee-copy-centered"} ${designation && designation.length > 28 ? "has-long-designation" : ""}`}>
          <div className="attendee-field attendee-name-field"><h3 style={{ fontSize: nameFontSize(displayName) }}>{displayName}</h3></div>
          {designation && <div className="attendee-field attendee-designation-field"><p>{designation}</p></div>}
        </div>
        </section>
        <section className="card-details">
          <div className="date-detail"><small>DATE</small><b>30TH</b><span>AUGUST 2026</span></div>
          <div className="time-detail"><small>TIME</small><b>12:30 PM - 5 PM</b></div>
          <div className="venue-detail"><small>VENUE</small><b>BARADARI<br />BANQUET</b><p>D-10, BLOCK 10-A,<br />GULSHAN-E-IQBAL, KARACHI.</p></div>
        </section>
      </div>
    </div>
  );
});
