import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Brain, FileSearch, BarChart3, Lock, Zap,
  ArrowRight, MessageSquare, Upload, CheckCircle2,
  Sun, Moon, Sparkles, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

const features = [
  { icon: Brain, title: 'RAG-Powered AI', desc: 'Intelligent document Q&A using Retrieval-Augmented Generation for accurate, context-aware responses.' },
  { icon: FileSearch, title: 'Semantic Search', desc: 'Find relevant clauses, policies, and compliance requirements instantly with AI-powered semantic search.' },
  { icon: Shield, title: 'Risk Identification', desc: 'Automatically detect compliance gaps, policy violations, and potential audit observations.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time insights into compliance posture, document coverage, and AI usage metrics.' },
  { icon: Lock, title: 'Enterprise Security', desc: 'JWT authentication, encrypted storage, role-based access control, and audit trails.' },
  { icon: Zap, title: 'Instant Processing', desc: 'Upload PDFs, DOCX, and TXT files — get AI-ready in seconds with automated chunking and indexing.' },
];

const capabilities = [
  { icon: MessageSquare, title: 'Conversational AI', desc: 'Chat naturally about your documents with context retention.' },
  { icon: Upload, title: 'Multi-Document Query', desc: 'Search across all your uploaded documents simultaneously.' },
  { icon: CheckCircle2, title: 'Citation References', desc: 'Every AI answer cites the exact document and section.' },
  { icon: Sparkles, title: 'Executive Summaries', desc: 'Auto-generate compliance summaries for leadership.' },
  { icon: TrendingUp, title: 'Audit Insights', desc: 'AI-generated audit observations and recommendations.' },
  { icon: AlertTriangle, title: 'Clause Extraction', desc: 'Intelligently extract and categorize contract clauses.' },
];

const stats = [
  { value: '99.2%', label: 'Retrieval Accuracy' },
  { value: '< 2s', label: 'Response Time' },
  { value: '50+', label: 'Document Formats' },
  { value: '256-bit', label: 'Encryption' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">ComplianceAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#capabilities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Capabilities</a>
            <a href="#analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Analytics</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative hero-gradient">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Compliance Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6"
          >
            Your AI-Powered
            <br />
            <span className="gradient-text">Compliance Assistant</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Upload policy documents, compliance manuals, and audit reports.
            Get instant AI-powered answers, risk assessments, and executive summaries.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/signup')}
              className="group px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 rounded-xl border border-border bg-background font-semibold text-base hover:bg-accent transition-colors"
            >
              View Demo
            </button>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Dashboard Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 max-w-5xl mx-auto rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-2 text-xs text-muted-foreground">ComplianceAI Dashboard</span>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSearch className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">147</div>
                    <div className="text-xs text-muted-foreground">Documents Indexed</div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-primary rounded-full" />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">94.7%</div>
                    <div className="text-xs text-muted-foreground">Compliance Score</div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[94.7%] bg-success rounded-full" />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-xs text-muted-foreground">Active Risks</div>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[35%] bg-warning rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Features
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4">
              Enterprise-Grade Capabilities
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything your compliance team needs to manage policies, identify risks, and maintain audit readiness.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                custom={i}
                className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── AI Capabilities ─── */}
      <section id="capabilities" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              AI Capabilities
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4">
              Powered by Advanced AI
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our RAG pipeline combines semantic search, contextual retrieval, and generative AI for unmatched accuracy.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                variants={fadeUp}
                custom={i}
                className="flex gap-4 rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Analytics Preview ─── */}
      <section id="analytics" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Analytics
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4">
              Compliance Intelligence Dashboard
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time visibility into your organization's compliance posture with actionable insights.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { label: 'Total Documents', value: '1,247', change: '+12%', color: 'primary' },
              { label: 'Compliance Score', value: '94.7%', change: '+2.3%', color: 'success' },
              { label: 'Active Risks', value: '23', change: '-8%', color: 'warning' },
              { label: 'AI Queries Today', value: '342', change: '+18%', color: 'info' },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
                <p className="text-sm text-muted-foreground mb-2">{card.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{card.value}</span>
                  <span className={`text-sm font-medium text-${card.color}`}>{card.change}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your
              <br />
              <span className="gradient-text">Compliance Workflow?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join leading enterprises using AI to streamline policy management, risk assessment, and audit preparation.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="group px-10 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/25 inline-flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">ComplianceAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ComplianceAI. Enterprise AI for compliance intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
