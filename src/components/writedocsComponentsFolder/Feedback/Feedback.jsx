import React, { useState, useRef } from "react";
import emailjs from "emailjs-com";
import styles from "./style.module.css";
import { X } from "@phosphor-icons/react";

export default function Feedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const formRef = useRef(null);

  const toggleDialog = () => {
    setCurrentUrl(window.location.href);
    setIsOpen(!isOpen);
  };

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "service_mgdklrf",
        "template_8tfc8zu",
        e.target,
        "1a6aHxEAzXmMBSep5"
      )
      .then(
        (result) => {
          // console.log('Email successfully sent!', result.text);
          formRef.current.reset(); // Reset the form fields
          toggleDialog(); // Close the dialog
        },
        (error) => {
          // console.log('Failed to send email.', error.text);
        }
      );
  };

  return (
    <div>
      <button className={styles["feedback-button"]} onClick={toggleDialog}>
        Feedback
      </button>
      <div
        className={`${styles["dialog-background"]} ${
          isOpen ? styles["visible"] : ""
        }`}
      >
        <div className={styles["dialog"]}>
          <button className={styles["close-button"]} onClick={toggleDialog}>
            <X weight="bold" />
          </button>
          <h3>Feedback</h3>
          <form ref={formRef} onSubmit={sendEmail}>
            <input name="name" type="text" placeholder="Your name" required />
            <input name="company" type="text" placeholder="Your company" />
            <input
              name="email"
              type="email"
              placeholder="Your email"
              required
            />
            <textarea
              name="message"
              placeholder="Your feedback"
              rows="8"
              required
            ></textarea>
            <input name="currentUrl" type="hidden" value={currentUrl} />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}
