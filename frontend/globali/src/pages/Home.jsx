
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  fetch("http://localhost:5000/api/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setUser(data.user);
      }
    })
    .catch((err) => console.log(err));
}, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const services = [
    {
      title: "Web Development",
      description:
        "Modern, responsive, and high-performance websites tailored to your business goals.",
      icon: "💻",
      path: "/web-development",
    },
    {
      title: "SEO Services",
      description:
        "Improve your search engine rankings and drive more organic traffic to your website.",
      icon: "📈",
      path: "/seo-services",
    },
    {
      title: "Digital Marketing",
      description:
        "Grow your brand through targeted digital marketing and social media strategies.",
      icon: "📣",
      path: "/digital-marketing",
    },
    {
      title: "Project Management",
      description:
        "Efficient planning, communication, and delivery to ensure successful client projects.",
      icon: "📋",
      path: "/project-management",
    },
    {
      title: "Application Development",
      description:
        "Custom mobile and web applications designed to support and grow your business.",
      icon: "📱",
      path: "/application-development",
    },
  ];

  const reasons = [
    "Experienced and dedicated team",
    "Customer-focused solutions",
    "Modern technologies and best practices",
    "Reliable support and timely delivery",
  ];

  const styles = {
    app: {
      fontFamily: "Arial, Helvetica, sans-serif",
      backgroundColor: "#f5f7fb",
      color: "#1e293b",
      margin: 0,
      padding: 0,
      lineHeight: 1.6,
    },

    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 8%",
      backgroundColor: "#0f172a",
      color: "#ffffff",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      flexWrap: "wrap",
    },

    logo: {
      fontSize: "1.6rem",
      fontWeight: "bold",
      color: "#38bdf8",
    },

    navLinks: {
      display: "flex",
      listStyle: "none",
      gap: "20px",
      padding: 0,
      margin: 0,
      flexWrap: "wrap",
    },

    navLink: {
      color: "#ffffff",
      textDecoration: "none",
      fontWeight: "500",
    },

    hero: {
  backgroundImage:
    "linear-gradient(rgba(15,23,42,0.70), rgba(15,23,42,0.70)), url('/images/hero.jpg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  color: "#ffffff",
  padding: "100px 20px",
},

    heroTitle: {
      fontSize: "3rem",
      marginBottom: "20px",
    },

    heroText: {
      fontSize: "1.2rem",
      maxWidth: "700px",
      margin: "0 auto 35px",
    },

    button: {
      display: "inline-block",
      backgroundColor: "#38bdf8",
      color: "#ffffff",
      border: "none",
      padding: "15px 35px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "bold",
      textDecoration: "none",
    },

    section: {
      padding: "80px 8%",
    },

    sectionTitle: {
      textAlign: "center",
      fontSize: "2.2rem",
      marginBottom: "50px",
      color: "#0f172a",
    },

    cards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "25px",
    },

    cardLink: {
      color: "inherit",
      textDecoration: "none",
    },

    card: {
      height: "100%",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      textAlign: "center",
      cursor: "pointer",
    },

    icon: {
      fontSize: "2.5rem",
      marginBottom: "15px",
    },

    cardTitle: {
      marginBottom: "15px",
      color: "#2563eb",
    },

    learnMore: {
      display: "inline-block",
      marginTop: "12px",
      color: "#2563eb",
      fontWeight: "bold",
    },

    about: {
      maxWidth: "900px",
      margin: "0 auto",
      textAlign: "center",
      fontSize: "1.1rem",
    },

    whyContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
    },

    whyCard: {
      backgroundColor: "#ffffff",
      padding: "25px",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    },

    contact: {
      maxWidth: "650px",
      margin: "0 auto",
      textAlign: "center",
    },

    footer: {
      backgroundColor: "#0f172a",
      color: "#ffffff",
      textAlign: "center",
      padding: "35px 20px",
      marginTop: "40px",
    },
  };

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <div style={styles.logo}>Global Digital Solutions</div>
        {user && (
  <div style={{ color: "#fff", fontSize: "14px", fontWeight: "bold" }}>
    Welcome, {user.fullName}
  </div>
)}

        <ul style={styles.navLinks}>
          <li>
            <a href="#home" style={styles.navLink}>
              Home
            </a>
          </li>

          <li>
            <a href="#services" style={styles.navLink}>
              Services
            </a>
          </li>

          <li>
            <a href="#about" style={styles.navLink}>
              About
            </a>
          </li>

          <li>
            <a href="#why" style={styles.navLink}>
              Why Us
            </a>
          </li>

          <li>
            <a href="#contact" style={styles.navLink}>
              Contact
            </a>
          </li>

          <li> <Link to="/login" style={styles.navLink} > 
          Login </Link> 
          </li> 
          <li>
  <button
    onClick={handleLogout}
    style={{
      background: "#0f62fe",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Logout
  </button>
</li>
        </ul>
      </nav>

      <section id="home" style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Grow Your Business with Global Digital Solutions
        </h1>

        <p style={styles.heroText}>
          We help businesses succeed through professional website development,
          SEO, digital marketing, project management and application
          development services.
        </p>

        <a href="#contact" style={styles.button}>
          Get Started
        </a>
      </section>

      <section id="services" style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Services</h2>

        <div style={styles.cards}>
          {services.map((service) => (
            <Link
              key={service.path}
              to={service.path}
              style={styles.cardLink}
            >
              <div style={styles.card}>
                <div style={styles.icon}>{service.icon}</div>

                <h3 style={styles.cardTitle}>{service.title}</h3>

                <p>{service.description}</p>

                <span style={styles.learnMore}>View Service →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="about" style={styles.section}>
        <h2 style={styles.sectionTitle}>About Us</h2>

        <div style={styles.about}>
          <p>
            Global Digital Solutions is committed to helping businesses build a
            strong digital presence. We combine creativity, technical expertise
            and strategic planning to deliver solutions that help companies
            attract customers, increase visibility and achieve sustainable
            growth.
          </p>
        </div>
      </section>

      <section id="why" style={styles.section}>
        <h2 style={styles.sectionTitle}>Why Choose Us</h2>

        <div style={styles.whyContainer}>
          {reasons.map((reason) => (
            <div key={reason} style={styles.whyCard}>
              <h3>✓</h3>
              <p>{reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" style={styles.section}>
        <h2 style={styles.sectionTitle}>Contact Us</h2>

        <div style={styles.contact}>
          <p>
            Ready to grow your business? Get in touch today and let&apos;s
            discuss your next digital project.
          </p>

          <p>
            <strong>Email:</strong> info@globaldigitalsolutions.com
          </p>

          <p>
            <strong>Phone:</strong> +44 1234 567890
          </p>

          <a
            href="mailto:info@globaldigitalsolutions.com"
            style={styles.button}
          >
            Contact Us
          </a>
        </div>
      </section>

      <footer style={styles.footer}>
        <h3>Global Digital Solutions</h3>

        <p>
          Website Development • SEO • Digital Marketing • Project Management •
          Application Development
        </p>

        <p>
          © {new Date().getFullYear()} Global Digital Solutions. All Rights
          Reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;