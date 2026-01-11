import React from 'react';
import './Footer.css';
import logo from '../assets/logo.png';

import { Facebook, Instagram, Twitter } from 'lucide-react';

function Footer() {
    return (
        <footer className="footer-root">
            <div className="footer-content">
                <div className="footer-section brand-section">
                    <div className="footer-logo-wrapper">
                        <img src={logo} alt="Learnify" className="footer-logo" />
                        <span className="footer-brand">LEARNIFY</span>
                    </div>
                    <p className="footer-description">
                        Empowering students and CRs with a centralized platform for seamless communication, real-time updates, and organized learning in one place.

                    </p>
                </div>

                <div className="footer-section links-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/home">Home</a></li>
                        <li><a href="/class-routine">Class Routine</a></li>
                        <li><a href="/attendance">Attendance</a></li>
                        <li><a href="/assignments">Assignments</a></li>
                        <li><a href="/resources">Resources</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                    </ul>
                </div>

                <div className="footer-section contact-section">
                    <h4>Contact Info</h4>
                    <p>Email: support@learnify.edu</p>
                    <p>Phone: +977 9848556790</p>
                    <div className="footer-socials">
                        <div className="social-icon"><Facebook size={18} /></div>
                        <div className="social-icon"><Instagram size={18} /></div>
                        <div className="social-icon"><Twitter size={18} /></div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Learnify. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
