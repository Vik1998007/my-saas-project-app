// ProjectManagement.jsx

import React from "react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Project Planning",
    description:
      "Strategic planning, project roadmaps, scheduling, and resource allocation to ensure successful project delivery.",
  },
  {
    title: "Agile Project Management",
    description:
      "Scrum, Kanban, sprint planning, backlog management, and continuous project improvement.",
  },
  {
    title: "Team Coordination",
    description:
      "Seamless collaboration between teams, stakeholders, and clients for efficient project execution.",
  },
  {
    title: "Risk Management",
    description:
      "Identify, evaluate, and minimize project risks before they impact delivery.",
  },
  {
    title: "Performance Tracking",
    description:
      "Monitor KPIs, milestones, budgets, and project progress with detailed reporting.",
  },
  {
    title: "Project Consulting",
    description:
      "Expert advice to improve project workflows, productivity, and business outcomes.",
  },
];

const serviceLevels = [
  {
    title: "Basic",
    features: [
      "Project Planning",
      "Task Scheduling",
      "Weekly Progress Updates",
      "Email Support",
    ],
  },
  {
    title: "Professional",
    features: [
      "Everything in Basic",
      "Agile Project Management",
      "Risk Assessment",
      "Performance Reporting",
      "Priority Support",
    ],
  },
  {
    title: "Enterprise",
    features: [
      "Everything in Professional",
      "Dedicated Project Manager",
      "Unlimited Projects",
      "Custom Workflow Solutions",
      "24/7 Premium Support",
    ],
  },
];

function ProjectManagement() {
  return (
    <>
      <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
        }

        body{
          font-family:Arial, Helvetica, sans-serif;
          background:#f5f7fb;
          color:#333;
        }

        .page{
          width:100%;
        }

        section{
          padding:70px 20px;
        }

        .container{
          max-width:1200px;
          margin:auto;
        }

        .hero{
          background:linear-gradient(135deg,#0f62fe,#0039a6);
          color:#fff;
          text-align:center;
          padding:100px 20px;
        }

        .hero h1{
          font-size:3rem;
          margin-bottom:20px;
        }

        .hero p{
          max-width:700px;
          margin:auto;
          font-size:1.1rem;
          line-height:1.8;
        }

        .title{
          text-align:center;
          font-size:2rem;
          color:#0f62fe;
          margin-bottom:45px;
        }

        .grid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(270px,1fr));
          gap:25px;
        }

        .card{
          background:#fff;
          padding:25px;
          border-radius:12px;
          box-shadow:0 8px 20px rgba(0,0,0,.08);
          transition:.3s;
        }

        .card:hover{
          transform:translateY(-6px);
        }

        .card h3{
          color:#0f62fe;
          margin-bottom:15px;
        }

        .card p{
          color:#555;
          line-height:1.7;
        }

        .why{
          background:#fff;
        }

        .why ul{
          max-width:850px;
          margin:auto;
          padding-left:20px;
        }

        .why li{
          margin-bottom:15px;
          line-height:1.8;
          color:#555;
        }

        .levels{
          background:#f5f7fb;
        }

        .level-card{
          background:#fff;
          border-radius:12px;
          padding:30px;
          box-shadow:0 8px 20px rgba(0,0,0,.08);
          text-align:center;
        }

        .level-card h3{
          color:#0f62fe;
          margin-bottom:20px;
          font-size:1.6rem;
        }

        .level-card ul{
          list-style:none;
          margin-bottom:25px;
        }

        .level-card li{
          padding:10px 0;
          border-bottom:1px solid #eee;
          color:#555;
        }

        .btn{
          display:inline-block;
          background:#0f62fe;
          color:#fff;
          padding:12px 28px;
          border-radius:8px;
          text-decoration:none;
          transition:.3s;
          font-weight:bold;
        }

        .btn:hover{
          background:#0043ce;
        }

        .contact{
          background:#fff;
          text-align:center;
        }

        .contact p{
          max-width:700px;
          margin:20px auto;
          line-height:1.8;
          color:#555;
        }

        .contact-box{
          margin-top:30px;
          display:flex;
          flex-wrap:wrap;
          justify-content:center;
          gap:20px;
        }

        .contact-item{
          background:#f5f7fb;
          padding:20px;
          border-radius:10px;
          min-width:250px;
          box-shadow:0 5px 15px rgba(0,0,0,.05);
        }

        .contact-item h4{
          color:#0f62fe;
          margin-bottom:10px;
        }

        .home{
          text-align:center;
          padding:40px 20px 80px;
        }

        @media(max-width:768px){

          .hero h1{
            font-size:2.3rem;
          }

          .title{
            font-size:1.7rem;
          }

        }
      `}</style>

      <div className="page">
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <h1>Project Management</h1>
            <p>
              Global Digital Solutions delivers professional project management
              services that help businesses successfully plan, execute, monitor,
              and complete projects on time and within budget.
            </p>
          </div>
        </section>

        {/* Services */}
        <section>
          <div className="container">
            <h2 className="title">Our Services</h2>

            <div className="grid">
              {services.map((service, index) => (
                <div className="card" key={index}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why">
          <div className="container">
            <h2 className="title">Why Choose Us</h2>

            <ul>
              <li>Experienced and certified project management professionals.</li>
              <li>Agile and modern project management methodologies.</li>
              <li>Transparent communication throughout every project.</li>
              <li>Customized solutions tailored to your business goals.</li>
              <li>On-time delivery with quality-focused execution.</li>
              <li>Dedicated support from project initiation to completion.</li>
            </ul>
          </div>
        </section>

        {/* Service Levels */}
        <section className="levels">
          <div className="container">
            <h2 className="title">Service Levels</h2>

            <div className="grid">
              {serviceLevels.map((level, index) => (
                <div className="level-card" key={index}>
                  <h3>{level.title}</h3>

                  <ul>
                    {level.features.map((feature, i) => (
                      <li key={i}>✓ {feature}</li>
                    ))}
                  </ul>

                  <Link to="/contact" className="btn">
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        
        {/* Back Home */}
        <div className="home">
          <Link to="/" className="btn">
            ← Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

export default ProjectManagement;