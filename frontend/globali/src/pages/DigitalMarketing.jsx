import React, { useState } from "react";
import { Link } from "react-router-dom";

function DigitalMarketing() {
  const [hoveredService, setHoveredService] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(false);

  const services = [
    {
      title: "Search Engine Optimization",
      description:
        "Improve your website visibility on Google, increase organic traffic, and reach customers searching for your services.",
    },
    {
      title: "Social Media Marketing",
      description:
        "Build your brand presence and connect with your audience through engaging social media campaigns.",
    },
    {
      title: "Google Ads Management",
      description:
        "Create and manage targeted Google Ads campaigns that generate quality traffic, enquiries, and sales.",
    },
    {
      title: "Facebook and Instagram Ads",
      description:
        "Reach potential customers through targeted advertising campaigns on Facebook and Instagram.",
    },
    {
      title: "Content Marketing",
      description:
        "Create valuable blogs, articles, graphics, and marketing content that attracts and engages your audience.",
    },
    {
      title: "Email Marketing",
      description:
        "Build customer relationships and promote your services through professional and personalised email campaigns.",
    },
    {
      title: "YouTube Marketing",
      description:
        "Promote your brand using engaging video content, YouTube advertising, and channel optimisation.",
    },
    {
      title: "Pay-Per-Click Advertising",
      description:
        "Generate immediate website traffic with carefully targeted and cost-effective paid advertising campaigns.",
    },
    {
      title: "Online Reputation Management",
      description:
        "Protect and improve your brand reputation by managing reviews, customer feedback, and online visibility.",
    },
    {
      title: "Conversion Rate Optimization",
      description:
        "Improve your website experience and turn more visitors into customers, enquiries, and sales.",
    },
    {
      title: "Influencer Marketing",
      description:
        "Connect your brand with suitable influencers who can promote your products and services to their audience.",
    },
    {
      title: "Digital Marketing Strategy",
      description:
        "Develop a customised marketing plan based on your goals, audience, competition, and available budget.",
    },
  ];

  const benefits = [
    "Experienced Digital Marketing Team",
    "Customized Marketing Strategies",
    "Targeted Audience Campaigns",
    "Increased Website Traffic",
    "More Leads and Sales",
    "Affordable Marketing Packages",
    "Transparent Monthly Reports",
    "Dedicated Customer Support",
  ];

  const processSteps = [
    {
      title: "Business Analysis",
      description:
        "We study your business, services, goals, challenges, and current online presence.",
    },
    {
      title: "Audience Research",
      description:
        "We identify your ideal customers, their interests, online behaviour, and purchasing needs.",
    },
    {
      title: "Competitor Analysis",
      description:
        "We analyse your competitors to identify opportunities and improve your marketing position.",
    },
    {
      title: "Marketing Strategy",
      description:
        "We create a personalised digital marketing strategy based on your business objectives.",
    },
    {
      title: "Campaign Creation",
      description:
        "We prepare advertisements, content, visuals, keywords, and audience targeting.",
    },
    {
      title: "Campaign Launch",
      description:
        "We launch your campaigns across the most suitable digital marketing platforms.",
    },
    {
      title: "Performance Monitoring",
      description:
        "We regularly monitor traffic, engagement, leads, conversions, and advertising costs.",
    },
    {
      title: "Monthly Reporting and Optimization",
      description:
        "We provide clear reports and continuously improve campaigns for stronger results.",
    },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "40px 20px",
      backgroundColor: "#f3f6fa",
      color: "#1f2937",
      fontFamily:
        "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },

    container: {
      width: "100%",
      maxWidth: "1180px",
      margin: "0 auto",
    },

    hero: {
      padding: "60px 30px",
      marginBottom: "55px",
      textAlign: "center",
      backgroundColor: "#ffffff",
      borderRadius: "18px",
      boxShadow: "0 8px 28px rgba(15, 23, 42, 0.08)",
    },

    mainHeading: {
      margin: "0 0 18px",
      color: "#1d4ed8",
      fontSize: "clamp(36px, 6vw, 54px)",
      lineHeight: "1.2",
    },

    introduction: {
      maxWidth: "850px",
      margin: "0 auto",
      color: "#4b5563",
      fontSize: "18px",
      lineHeight: "1.8",
    },

    section: {
      marginBottom: "60px",
    },

    sectionHeading: {
      margin: "0 0 35px",
      color: "#111827",
      textAlign: "center",
      fontSize: "clamp(28px, 4vw, 38px)",
    },

    servicesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "24px",
    },

    serviceCard: {
      minHeight: "190px",
      padding: "28px",
      backgroundColor: "#ffffff",
      borderTop: "4px solid #2563eb",
      borderRadius: "14px",
      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
      cursor: "pointer",
      transition:
        "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    },

    serviceCardHovered: {
      transform: "translateY(-8px)",
      borderTopColor: "#1d4ed8",
      boxShadow: "0 16px 35px rgba(37, 99, 235, 0.18)",
    },

    serviceTitle: {
      margin: "0 0 14px",
      color: "#2563eb",
      fontSize: "21px",
      lineHeight: "1.35",
    },

    description: {
      margin: "0",
      color: "#4b5563",
      fontSize: "16px",
      lineHeight: "1.7",
    },

    contentBox: {
      padding: "45px 32px",
      backgroundColor: "#ffffff",
      borderRadius: "18px",
      boxShadow: "0 8px 28px rgba(15, 23, 42, 0.08)",
    },

    benefitsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "18px",
    },

    benefitItem: {
      padding: "18px 20px",
      color: "#1e3a8a",
      backgroundColor: "#eff6ff",
      borderLeft: "4px solid #2563eb",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
    },

    processGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "24px",
    },

    processCard: {
      padding: "28px 24px",
      textAlign: "center",
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      boxShadow: "0 6px 20px rgba(15, 23, 42, 0.08)",
    },

    processNumber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
      margin: "0 auto 17px",
      color: "#ffffff",
      backgroundColor: "#2563eb",
      borderRadius: "50%",
      fontSize: "19px",
      fontWeight: "700",
    },

    processTitle: {
      margin: "0 0 12px",
      color: "#1f2937",
      fontSize: "20px",
    },

    buttonContainer: {
      marginTop: "20px",
      textAlign: "center",
    },

    backButton: {
      display: "inline-block",
      padding: "14px 32px",
      color: "#ffffff",
      backgroundColor: "#2563eb",
      borderRadius: "10px",
      boxShadow: "0 6px 16px rgba(37, 99, 235, 0.25)",
      textDecoration: "none",
      fontSize: "17px",
      fontWeight: "700",
      transition:
        "background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
    },

    backButtonHovered: {
      backgroundColor: "#1d4ed8",
      transform: "translateY(-3px)",
      boxShadow: "0 10px 24px rgba(37, 99, 235, 0.35)",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <h1 style={styles.mainHeading}>Digital Marketing</h1>

          <p style={styles.introduction}>
            Our digital marketing services help businesses increase their
            online visibility, reach the right audience, generate quality
            leads, increase sales, and build a strong and successful brand
            across digital platforms.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>
            Our Digital Marketing Services
          </h2>

          <div style={styles.servicesGrid}>
            {services.map((service, index) => (
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

                <p style={styles.description}>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.contentBox}>
            <h2 style={styles.sectionHeading}>
              Why Choose Our Digital Marketing Services?
            </h2>

            <div style={styles.benefitsGrid}>
              {benefits.map((benefit) => (
                <div key={benefit} style={styles.benefitItem}>
                  ✓ {benefit}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>
            Our Digital Marketing Process
          </h2>

          <div style={styles.processGrid}>
            {processSteps.map((step, index) => (
              <article key={step.title} style={styles.processCard}>
                <div style={styles.processNumber}>{index + 1}</div>

                <h3 style={styles.processTitle}>{step.title}</h3>

                <p style={styles.description}>{step.description}</p>
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

export default DigitalMarketing;