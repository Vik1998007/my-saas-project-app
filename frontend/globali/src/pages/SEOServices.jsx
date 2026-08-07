import React, { useState } from "react";
import { Link } from "react-router-dom";

function SECOServices() {
  const [hoveredService, setHoveredService] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(false);

  const seoServices = [
    {
      title: "Keyword Research",
      description:
        "We find valuable keywords that your potential customers are searching for on Google.",
    },
    {
      title: "On-Page SEO",
      description:
        "We optimize your headings, page content, titles, descriptions, images, and internal links.",
    },
    {
      title: "Technical SEO",
      description:
        "We improve website speed, mobile usability, indexing, crawling, security, and technical performance.",
    },
    {
      title: "Local SEO",
      description:
        "We help local businesses appear in nearby Google searches and attract customers from their area.",
    },
    {
      title: "E-commerce SEO",
      description:
        "We optimize online stores, product pages, category pages, and descriptions to increase organic sales.",
    },
    {
      title: "Content Optimization",
      description:
        "We improve website content so it is helpful for visitors and properly optimized for search engines.",
    },
    {
      title: "Link Building",
      description:
        "We build relevant and high-quality backlinks to improve your website authority and online visibility.",
    },
    {
      title: "SEO Audit",
      description:
        "We analyse your complete website and identify technical, content, keyword, and performance issues.",
    },
    {
      title: "Google Business Profile Optimization",
      description:
        "We optimize your Google Business Profile to improve local visibility, calls, visits, and enquiries.",
    },
    {
      title: "Monthly SEO Reports",
      description:
        "We provide clear monthly reports showing rankings, traffic, improvements, and completed SEO work.",
    },
  ];

  const whyChooseUs = [
    "Experienced SEO Specialists",
    "White Hat SEO Techniques",
    "Improved Google Rankings",
    "Increased Organic Traffic",
    "Better User Experience",
    "Affordable SEO Packages",
    "Monthly Performance Reports",
    "Dedicated Customer Support",
  ];

  const seoProcess = [
    "Website Analysis",
    "Keyword Research",
    "SEO Strategy",
    "On-Page Optimization",
    "Technical Improvements",
    "Content Optimization",
    "Link Building",
    "Monthly Reporting",
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f4f7fb",
      fontFamily: "Arial, Helvetica, sans-serif",
      padding: "40px 20px",
      color: "#1f2937",
    },

    container: {
      width: "100%",
      maxWidth: "1150px",
      margin: "0 auto",
    },

    heroSection: {
      textAlign: "center",
      backgroundColor: "#ffffff",
      padding: "55px 25px",
      borderRadius: "16px",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
      marginBottom: "50px",
    },

    mainHeading: {
      fontSize: "clamp(34px, 5vw, 48px)",
      color: "#1e3a8a",
      margin: "0 0 18px",
    },

    introduction: {
      maxWidth: "800px",
      margin: "0 auto",
      fontSize: "18px",
      lineHeight: "1.8",
      color: "#4b5563",
    },

    section: {
      marginBottom: "55px",
    },

    sectionHeading: {
      textAlign: "center",
      fontSize: "clamp(28px, 4vw, 36px)",
      color: "#1f2937",
      marginBottom: "32px",
    },

    servicesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "22px",
    },

    serviceCard: {
      backgroundColor: "#ffffff",
      padding: "28px",
      borderRadius: "14px",
      borderTop: "4px solid #2563eb",
      boxShadow: "0 5px 16px rgba(0, 0, 0, 0.08)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "pointer",
    },

    serviceCardHovered: {
      transform: "translateY(-8px)",
      boxShadow: "0 12px 28px rgba(37, 99, 235, 0.18)",
    },

    serviceTitle: {
      fontSize: "21px",
      color: "#2563eb",
      marginTop: "0",
      marginBottom: "13px",
    },

    serviceDescription: {
      fontSize: "16px",
      color: "#4b5563",
      lineHeight: "1.7",
      margin: "0",
    },

    contentBox: {
      backgroundColor: "#ffffff",
      padding: "42px 32px",
      borderRadius: "16px",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
    },

    chooseGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
      gap: "18px",
    },

    chooseItem: {
      backgroundColor: "#eff6ff",
      borderLeft: "4px solid #2563eb",
      padding: "18px",
      borderRadius: "9px",
      fontSize: "16px",
      fontWeight: "600",
      color: "#1e3a8a",
    },

    processGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: "20px",
    },

    processCard: {
      backgroundColor: "#ffffff",
      textAlign: "center",
      padding: "27px 20px",
      borderRadius: "13px",
      boxShadow: "0 5px 16px rgba(0, 0, 0, 0.08)",
    },

    processNumber: {
      width: "44px",
      height: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 15px",
      borderRadius: "50%",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      fontSize: "18px",
      fontWeight: "bold",
    },

    processTitle: {
      fontSize: "18px",
      color: "#1f2937",
      margin: "0",
    },

    buttonContainer: {
      textAlign: "center",
      marginTop: "20px",
    },

    backButton: {
      display: "inline-block",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      textDecoration: "none",
      padding: "14px 30px",
      borderRadius: "9px",
      fontSize: "17px",
      fontWeight: "bold",
      transition: "background-color 0.3s ease, transform 0.3s ease",
    },

    backButtonHovered: {
      backgroundColor: "#1d4ed8",
      transform: "translateY(-3px)",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.heroSection}>
          <h1 style={styles.mainHeading}>SEO Services</h1>

          <p style={styles.introduction}>
            Our professional SEO services help businesses improve their Google
            rankings, increase organic website traffic, reach the right
            audience, and generate more enquiries, leads, and customers.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Our SEO Services</h2>

          <div style={styles.servicesGrid}>
            {seoServices.map((service, index) => (
              <article
                key={service.title}
                style={{
                  ...styles.serviceCard,
                  ...(hoveredService === index
                    ? styles.serviceCardHovered
                    : {}),
                }}
                onMouseEnter={() => setHoveredService(index)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <h3 style={styles.serviceTitle}>{service.title}</h3>

                <p style={styles.serviceDescription}>
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.contentBox}>
            <h2 style={styles.sectionHeading}>
              Why Choose Our SEO Services?
            </h2>

            <div style={styles.chooseGrid}>
              {whyChooseUs.map((reason) => (
                <div key={reason} style={styles.chooseItem}>
                  ✓ {reason}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Our SEO Process</h2>

          <div style={styles.processGrid}>
            {seoProcess.map((step, index) => (
              <article key={step} style={styles.processCard}>
                <div style={styles.processNumber}>{index + 1}</div>
                <h3 style={styles.processTitle}>{step}</h3>
              </article>
            ))}
          </div>
        </section>

        <div style={styles.buttonContainer}>
          <Link
            to="/"
            style={{
              ...styles.backButton,
              ...(hoveredButton ? styles.backButtonHovered : {}),
            }}
            onMouseEnter={() => setHoveredButton(true)}
            onMouseLeave={() => setHoveredButton(false)}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default SECOServices;