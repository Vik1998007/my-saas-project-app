import React from "react";
import { Link } from "react-router-dom";

const ApplicationDevelopment = () => {
  const services = [
    {
      title: "Custom Web Application Development",
      description:
        "We build secure, scalable, and high-performance web applications tailored to your business goals using modern technologies.",
    },
    {
      title: "Mobile Application Development",
      description:
        "Develop feature-rich Android and iOS mobile applications with intuitive user experiences and excellent performance.",
    },
    {
      title: "Enterprise Software Development",
      description:
        "Enterprise-grade software solutions that streamline business operations, improve productivity, and support business growth.",
    },
    {
      title: "SaaS Application Development",
      description:
        "End-to-end Software-as-a-Service solutions with secure architecture, subscription management, and cloud deployment.",
    },
    {
      title: "API Development",
      description:
        "Design and develop secure RESTful APIs for seamless communication between applications and external systems.",
    },
    {
      title: "Database Design & Development",
      description:
        "Optimized database architecture ensuring data security, high performance, scalability, and reliability.",
    },
    {
      title: "Cloud Application Development",
      description:
        "Cloud-native applications designed for flexibility, scalability, and maximum business efficiency.",
    },
    {
      title: "Third-Party API Integration",
      description:
        "Integrate payment gateways, CRM systems, social media APIs, maps, messaging services, and more.",
    },
    {
      title: "Legacy Application Modernization",
      description:
        "Upgrade outdated applications with modern technologies, improved security, and enhanced performance.",
    },
    {
      title: "Application Maintenance & Support",
      description:
        "Continuous monitoring, updates, bug fixing, security improvements, and technical support for your applications.",
    },
  ];

  const whyChoose = [
    "Experienced Development Team",
    "Scalable & Secure Solutions",
    "Timely Project Delivery",
    "Ongoing Support & Maintenance",
  ];

  const process = [
    "Requirement Gathering",
    "Design & Planning",
    "Development",
    "Testing & Quality Assurance",
    "Deployment",
    "Maintenance & Support",
  ];

  const industries = [
    "Healthcare",
    "Education",
    "Finance & Banking",
    "E-Commerce",
    "Real Estate",
    "Manufacturing",
    "Logistics & Transportation",
    "Travel & Hospitality",
    "Retail",
    "Startups & SMEs",
  ];

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8fafc",
        color: "#333",
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)",
          color: "#fff",
          padding: "100px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              marginBottom: "20px",
            }}
          >
            Application Development Services
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.8",
              maxWidth: "900px",
              margin: "0 auto 40px",
            }}
          >
            We build secure, scalable, and high-performance web applications,
            mobile applications, enterprise software, and custom business
            solutions for startups, small businesses, and large enterprises.
            Our experienced developers deliver innovative applications that
            improve productivity, streamline business operations, and accelerate
            digital transformation.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/contact"
              style={{
                textDecoration: "none",
                background: "#ffffff",
                color: "#2563eb",
                padding: "15px 35px",
                borderRadius: "6px",
                fontWeight: "600",
              }}
            >
              Get Free Consultation
            </Link>

            <Link
              to="/contact"
              style={{
                textDecoration: "none",
                background: "transparent",
                color: "#fff",
                border: "2px solid #fff",
                padding: "15px 35px",
                borderRadius: "6px",
                fontWeight: "600",
              }}
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        style={{
          padding: "80px 20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "38px",
            color: "#1e3a8a",
            marginBottom: "15px",
          }}
        >
          Our Application Development Services
        </h2>

        <p
          style={{
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto 50px",
            color: "#555",
            lineHeight: "1.7",
          }}
        >
          We provide comprehensive application development services using
          modern technologies, agile methodologies, and industry best
          practices.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "25px",
          }}
        >
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                transition: "0.3s",
              }}
            >
              <h3
                style={{
                  color: "#2563eb",
                  marginBottom: "15px",
                }}
              >
                {service.title}
              </h3>

              <p
                style={{
                  color: "#555",
                  lineHeight: "1.7",
                }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        style={{
          background: "#ffffff",
          padding: "80px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#1e3a8a",
              fontSize: "38px",
              marginBottom: "50px",
            }}
          >
            Why Choose Our Application Development Services?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
              gap: "25px",
            }}
          >
            {whyChoose.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  padding: "30px",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ color: "#2563eb" }}>{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Process */}
      <section
        style={{
          padding: "80px 20px",
          background: "#eff6ff",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "38px",
              color: "#1e3a8a",
              marginBottom: "50px",
            }}
          >
            Our Development Process
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
              gap: "25px",
            }}
          >
            {process.map((step, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "30px",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "#2563eb",
                    color: "#fff",
                    margin: "0 auto 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}
                </div>

                <h3>{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section
        style={{
          padding: "80px 20px",
          background: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#1e3a8a",
              fontSize: "38px",
              marginBottom: "50px",
            }}
          >
            Industries We Serve
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "20px",
            }}
          >
            {industries.map((industry, index) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  padding: "25px",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontWeight: "600",
                  color: "#1e3a8a",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                }}
              >
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background:
            "linear-gradient(135deg,#1e3a8a,#2563eb)",
          color: "#fff",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "38px",
              marginBottom: "20px",
            }}
          >
            Ready to Build Your Next Application?
          </h2>

          <p
            style={{
              lineHeight: "1.8",
              marginBottom: "35px",
            }}
          >
            Whether you need a custom web application, mobile app, SaaS
            platform, or enterprise software, our experienced team is ready to
            transform your ideas into powerful digital solutions.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/contact"
              style={{
                textDecoration: "none",
                background: "#fff",
                color: "#2563eb",
                padding: "15px 35px",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Get Free Consultation
            </Link>

            <Link
              to="/contact"
              style={{
                textDecoration: "none",
                border: "2px solid #fff",
                color: "#fff",
                padding: "15px 35px",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApplicationDevelopment;