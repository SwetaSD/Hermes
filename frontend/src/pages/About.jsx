import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Shield,
  Eye,
  Zap,
  BarChart3,
  Globe,
  Brain,
  Layers,
  ArrowRight,
} from 'lucide-react';

const TEAM = [
  {
    name: 'Taniya Nawal Pathak',
    initials: 'TNP',
    role: 'Team Lead & Developer',
    bio: 'Full-stack developer driving the architecture and frontend of HERMES. Passionate about building tools that bring transparency to media consumption.',
  },
  {
    name: 'Sweta Suman Das',
    initials: 'SSD',
    role: 'NLP & Data Engineer',
    bio: 'Designed the NLP pipeline for bias classification and source analysis. Specializes in natural language processing and data-driven journalism tools.',
  },
  {
    name: 'Tanisha Padhi',
    initials: 'TP',
    role: 'Research & Analysis',
    bio: 'Led the research methodology for publisher bias mapping and reliability scoring. Focused on computational media analysis and information integrity.',
  },
  {
    name: 'Shayon Chakraborty',
    initials: 'SC',
    role: 'Backend & Infrastructure',
    bio: 'Built the data aggregation and news processing backend. Handles real-time source monitoring and API infrastructure powering HERMES.',
  },
];

const VALUES = [
  {
    icon: Shield,
    title: 'Independence',
    desc: 'HERMES is not owned by any media conglomerate, political party, or corporate interest. It is built as an academic project driven by curiosity and public good.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    desc: 'Our methodology is open. Every bias rating, reliability score, and classification can be audited, challenged, and improved by the community.',
  },
  {
    icon: Zap,
    title: 'Speed',
    desc: "News bias doesn't wait. HERMES detects and maps bias patterns in under 5 minutes, giving you real-time clarity on breaking stories.",
  },
  {
    icon: BarChart3,
    title: 'Rigor',
    desc: "We combine NLP-driven language analysis with multi-source cross-referencing. No single algorithm decides a source's rating — it's a multi-layered process.",
  },
];

const STEPS = [
  {
    num: '01',
    icon: Globe,
    title: 'Aggregate',
    desc: 'HERMES continuously monitors 160+ news sources across the political spectrum, ingesting articles in real-time as they\'re published.',
  },
  {
    num: '02',
    icon: Brain,
    title: 'Analyze',
    desc: 'Our NLP engine analyzes language patterns, framing, story selection, and source attribution to classify bias and reliability for each article.',
  },
  {
    num: '03',
    icon: Layers,
    title: 'Illuminate',
    desc: 'Stories are mapped across the bias spectrum, showing you every perspective at a glance. AI summaries highlight what each side emphasizes or omits.',
  },
];

const STATS = [
  { value: '700+', label: 'SOURCES MONITORED' },
  { value: '500+', label: 'STORIES ANALYZED' },
  { value: '300+', label: 'POLITICAL ARTICLES' },
  { value: '5', label: 'BIAS CATEGORIES' },
];

const About = () => {
  return (
    <div className="app-container">
      <Header />

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__overlay" />
        <div className="about-hero__content container">
          <span className="about-hero__badge">ABOUT THE PROJECT</span>
          <h1 className="about-hero__title">
            We believe truth lives
            <br />
            in the full picture.
          </h1>
          <p className="about-hero__desc">
            HERMES was born from a simple frustration: every news story is told
            differently depending on who tells it. We don't pick sides. We map the
            spectrum — so you can decide for yourself.
          </p>
          <div className="about-hero__tagline">
            <span className="about-hero__line" />
            <span>Named after the Greek messenger god — the neutral carrier of information.</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="about-stats">
        <div className="container">
          <div className="about-stats__grid">
            {STATS.map((stat) => (
              <div key={stat.label} className="about-stats__item">
                <span className="about-stats__value">{stat.value}</span>
                <span className="about-stats__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div className="container">
          <div className="about-mission__layout">
            <div className="about-mission__text">
              <span className="about-section-tag">OUR MISSION</span>
              <h2 className="about-section-heading">
                Making media bias visible,
                <br />
                measurable, and actionable.
              </h2>
              <p className="about-mission__p">
                In a world of information overload and algorithmic echo chambers,
                understanding how news is framed is as important as the news itself.
                HERMES is building the infrastructure for media literacy at scale.
              </p>
              <p className="about-mission__p">
                We don't tell you what to think. We show you the full landscape of
                how a story is being told — across 160+ sources, 5 bias categories,
                and in real-time. The messenger delivers every version. You choose
                which truths to hold.
              </p>
              <Link to="/bias" className="about-mission__link">
                Explore our Bias Map <ArrowRight size={16} />
              </Link>
            </div>
            <div className="about-mission__visual">
              <div className="about-mission__badge">
                <span className="about-mission__badge-tag">UNIVERSITY PROJECT</span>
                <span className="about-mission__badge-year">2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="container">
          <span className="about-section-tag">OUR VALUES</span>
          <h2 className="about-section-heading">What we stand for.</h2>
          <div className="about-values__grid">
            {VALUES.map((v) => (
              <div key={v.title} className="about-values__card">
                <div className="about-values__icon">
                  <v.icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="about-values__title">{v.title}</h3>
                <p className="about-values__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="about-how">
        <div className="container">
          <span className="about-section-tag">HOW IT WORKS</span>
          <h2 className="about-section-heading">
            From raw news to bias-mapped
            <br />
            clarity in three steps.
          </h2>
          <div className="about-how__grid">
            {STEPS.map((step) => (
              <div key={step.num} className="about-how__step">
                <div className="about-how__num-row">
                  <span className="about-how__num">{step.num}</span>
                  <div className="about-how__step-icon">
                    <step.icon size={18} strokeWidth={2} />
                  </div>
                </div>
                <h3 className="about-how__step-title">{step.title}</h3>
                <p className="about-how__step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="about-team">
        <div className="container">
          <span className="about-section-tag">THE TEAM</span>
          <h2 className="about-section-heading">
            Students, engineers, and researchers.
          </h2>
          <p className="about-team__subtitle">
            We're 4 BTech Computer Science & Engineering students from KIIT University,
            Bhubaneswar. Building HERMES as our vision for transparent, unbiased news consumption.
          </p>
          <div className="about-team__grid">
            {TEAM.map((member) => (
              <div key={member.name} className="about-team__card">
                <div className="about-team__card-top">
                  <div className="about-team__avatar">
                    {member.initials}
                  </div>
                  <div className="about-team__info">
                    <h3 className="about-team__name">{member.name}</h3>
                    <span className="about-team__role">{member.role}</span>
                  </div>
                </div>
                <p className="about-team__bio">{member.bio}</p>
              </div>
            ))}
          </div>
          <p className="about-team__university">
            KIIT University &middot; School of Computer Engineering &middot; BTech CSE &middot; 2026
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
