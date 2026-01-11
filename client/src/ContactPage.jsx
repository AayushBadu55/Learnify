import React, { useState } from "react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import "./ContactPage.css";
import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle, Music } from "lucide-react";

function ContactPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        message: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // Add submission logic here
    };

    return (
        <div className="contact-root">
            <Nav />
            <div style={{ height: '70px' }}></div>

            <main className="contact-main">
                <div className="contact-container">
                    {/* Left Section */}
                    <div className="contact-left">
                        <section className="contact-header-section">
                            <h1 className="contact-title">Contact Us</h1>
                            <p className="contact-desc">
                                At Learnify, we're here to support smooth and effective classroom communication.
                                Whether you have a question, need help using the platform, or want to share feedback,
                                feel free to reach out—we're just a message away!
                            </p>
                        </section>

                        <div className="contact-details-grid">
                            {/* Contact Info Column */}
                            <div className="contact-col">
                                <h3 className="col-title">CONTACT US</h3>
                                <div className="col-divider"></div>

                                <div className="info-row">
                                    <div className="icon-circle icon-orange">
                                        <MapPin size={20} color="white" />
                                    </div>
                                    <span className="info-text">Naxal, Kathmandu</span>
                                </div>

                                <div className="info-row">
                                    <div className="icon-circle icon-orange">
                                        <Phone size={20} color="white" />
                                    </div>
                                    <span className="info-text">+977 9848556790</span>
                                </div>

                                <div className="info-row">
                                    <div className="icon-circle icon-orange">
                                        <Mail size={20} color="white" />
                                    </div>
                                    <span className="info-text small-text">learnifyClassroom555support@gmail.com</span>
                                </div>
                            </div>

                            {/* Social Networks Column */}
                            <div className="contact-col">
                                <h3 className="col-title">Social Networks</h3>
                                <div className="col-divider"></div>

                                <div className="info-row">
                                    <Instagram size={24} color="#E1306C" />
                                    <span className="info-text">Learnify_Classroom</span>
                                </div>

                                <div className="info-row">
                                    <Facebook size={24} color="#1877F2" />
                                    <span className="info-text">Learnify_Classroom</span>
                                </div>

                                <div className="info-row">
                                    <MessageCircle size={24} color="#25D366" />
                                    <span className="info-text">Learnify_Classroom</span>
                                </div>

                                <div className="info-row">
                                    <Music size={24} color="black" /> {/* Fallback for TikTok */}
                                    <span className="info-text">Learnify_Classroom</span>
                                </div>
                            </div>
                        </div>

                        {/* Location Map */}
                        <section className="location-section">
                            <h2 className="location-title">Location</h2>
                            <div className="map-container">
                                {/* Using an iframe for the map of Naxal, Kathmandu */}
                                <iframe
                                    title="Naxal Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.240403132623!2d85.32396051506214!3d27.70903198279128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1908c6928e1b%3A0x6e78817d3d941913!2sNaxal%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1626343827361!5m2!1sen!2snp"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </section>
                    </div>

                    {/* Right Section - Form */}
                    <div className="contact-right">
                        <form onSubmit={handleSubmit} className="glass-form">
                            <div className="form-field">
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-field">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-field">
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-field">
                                <textarea
                                    name="message"
                                    placeholder="Message"
                                    rows="6"
                                    value={formData.message}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-btn">Submit</button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ContactPage;
