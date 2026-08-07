import React from "react";
import { Link } from "react-router-dom";

function WebDevelopment() {
  const services = [
    {
      title: "Business Website Development",
      description:
        "Professional business websites that help companies promote their services, products, and brand online.",
    },
    {
      title: "E-commerce Website Development",
      description:
        "Secure online shopping websites with product pages, shopping cart, checkout, and payment integration.",
    },
    {
      title: "Portfolio Website Development",
      description:
        "Modern portfolio websites for students, freelancers, photographers, designers, and professionals.",
    },
    {
      title: "Blog Website Development",
      description:
        "Easy-to-manage blog websites for publishing articles, news, updates, and useful content.",
    },
    {
      title: "Custom Web Application",
      description:
        "Custom web applications developed according to your business requirements and ideas.",
    },
    {
      title: "Website Maintenance and Support",
      description:
        "Regular website updates, security checks, bug fixing, backups, and technical support.",
    },
  ];

  const reasons = [
    "Professional and modern website design",
    "Mobile, tablet, and desktop responsive",
    "Fast-loading and secure websites",
    "SEO-friendly website structure",
    "Affordable website development services",
    "Regular maintenance and customer support",
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f4f7fb",
      fontFamily: "Arial, sans-serif",
      padding: "40px 20px",
    },

    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },

    heroSection: {
      textAlign: "center",
      backgroundColor: "#ffffff",
      padding: "50px 25px",
      borderRadius: "14px",
      boxShadow: "0 5px 18px rgba(0, 0, 0, 0.08)",
      marginBottom: "45px",
    },

    mainHeading: {
      fontSize: "42px",
      color: "#1f2937",
      marginBottom: "18px",
    },

    introduction: {
      maxWidth: "760px",
      margin: "0 auto",
      fontSize: "18px",
      lineHeight: "1.7",
      color: "#4b5563",
    },

    sectionHeading: {
      textAlign: "center",
      fontSize: "32px",
      color: "#1f2937",
      marginBottom: "30px",
    },

    servicesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "22px",
      marginBottom: "50px",
    },

    serviceCard: {
      backgroundColor: "#ffffff",
      padding: "28px",
      borderRadius: "12px",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
      borderTop: "4px solid #2563eb",
    },

    serviceTitle: {
      color: "#2563eb",
      fontSize: "22px",
      marginBottom: "12px",
    },

    serviceDescription: {
      color: "#4b5563",
      lineHeight: "1.6",
      fontSize: "16px",
    },

    whyChooseSection: {
      backgroundColor: "#ffffff",
      padding: "40px 30px",
      borderRadius: "14px",
      boxShadow: "0 5px 18px rgba(0, 0, 0, 0.08)",
      marginBottom: "40px",
    },

    reasonsList: {
      maxWidth: "700px",
      margin: "0 auto",
      paddingLeft: "25px",
      color: "#374151",
      fontSize: "18px",
      lineHeight: "2",
    },

    buttonContainer: {
      textAlign: "center",
    },

    backButton: {
      display: "inline-block",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      textDecoration: "none",
      padding: "13px 28px",
      borderRadius: "8px",
      fontSize: "17px",
      fontWeight: "bold",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.heroSection}>
          <h1 style={styles.mainHeading}>Web Development</h1>

          <p style={styles.introduction}>
            We create professional, responsive, secure, and modern websites
            that help businesses build their online presence, reach more
            customers, and grow their brand.
          </p>
        </section>

        <section>
          <h2 style={styles.sectionHeading}>Our Services</h2>

          <div style={styles.servicesGrid}>
            {services.map((service, index) => (
              <article key={index} style={styles.serviceCard}>
                <h3 style={styles.serviceTitle}>{service.title}</h3>

                <p style={styles.serviceDescription}>
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.whyChooseSection}>
          <h2 style={styles.sectionHeading}>Why Choose Our Services?</h2>

          <ul style={styles.reasonsList}>
            {reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </section>

        <div style={styles.buttonContainer}>
          <Link to="/" style={styles.backButton}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default WebDevelopment;