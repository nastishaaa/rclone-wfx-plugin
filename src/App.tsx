/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Download, 
  Settings, 
  Database, 
  Cloud, 
  Cpu, 
  Shield, 
  Github, 
  ExternalLink,
  ChevronRight,
  Clipboard,
  CheckCircle2,
  HardDrive,
  Layers,
  Zap,
  Info,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Types ---

type SectionId = 'overview' | 'features' | 'architecture' | 'installation' | 'configuration' | 'troubleshooting';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'features', label: 'Key Features', icon: Zap },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'installation', label: 'Installation', icon: Download },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: HelpCircle },
];

// --- Components ---

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg bg-zinc-900 border border-zinc-800 my-4 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-bottom border-zinc-800 text-xs font-mono text-zinc-400">
        <span>{language}</span>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          {copied ? <CheckCircle2 size={12} /> : <Clipboard size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FeatureCard = ({ title, description, icon: Icon, delay }: { title: string; description: string; icon: any; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-500/30 transition-all group"
  >
    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="text-zinc-100" size={24} />
    </div>
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
  </motion.div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold tracking-tight text-white mb-4">{children}</h2>
    <div className="h-1 w-20 bg-gradient-to-r from-zinc-200 to-zinc-800 rounded-full" />
  </div>
);

// --- Main App ---

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = NAV_ITEMS.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-zinc-200 selection:text-black">
      {/* Background Patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none active:pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-900 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
              <Database className="text-black" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight">RClone WFX</h1>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Documentation v1.0.0</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeSection === item.id 
                    ? 'bg-zinc-900 text-white shadow-lg' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}
                `}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-900">
            <a 
              href="https://github.com/nastishaaa/rclone-wfx-plugin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Github size={20} />
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Repository</p>
                  <p className="text-xs text-zinc-500">Source code & issues</p>
                </div>
              </div>
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-72 min-h-screen relative">
        {/* Header (Sticky) */}
        <header className={`
          sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between border-b 
          transition-all duration-300 backdrop-blur-md
          ${scrolled ? 'bg-black/50 border-zinc-900' : 'bg-transparent border-transparent'}
        `}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden lg:block">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Technical Specification / <span className="text-zinc-300 capitalize">{activeSection.replace('-', ' ')}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              BUILD: PASSED
            </div>
          </div>
        </header>

        {/* Content Screens */}
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 space-y-32">
          
          {/* Section: Overview */}
          <section id="overview" className="scroll-mt-32">
            <div className="grid md:grid-cols-5 gap-12 items-center">
              <div className="md:col-span-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4">Introduction</h2>
                  <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-tight mb-6">
                    Revolutionizing <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">Fast Storage Access</span>
                  </h1>
                  <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                    RClone WFX is a high-performance File System plugin for Total Commander. 
                    It bridges the gap between the legendary file manager and over 40+ cloud storage providers 
                    through the power of the RClone engine.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => scrollTo('installation')}
                      className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors shadow-xl shadow-white/10"
                    >
                      Get Started
                    </button>
                    <a 
                      href="https://github.com/nastishaaa/rclone-wfx-plugin" 
                      target="_blank" 
                      className="px-8 py-3 rounded-full bg-zinc-900 text-white font-bold border border-zinc-800 hover:bg-zinc-800 transition-colors"
                    >
                      GitHub Repo
                    </a>
                  </div>
                </motion.div>
              </div>
              <div className="md:col-span-2 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative z-10 p-8 rounded-3xl bg-gradient-to-br from-zinc-800/40 to-black/40 border border-zinc-700/50 backdrop-blur-xl shadow-2xl"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <Cloud className="text-sky-400" size={24} />
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: "85%" }} 
                          transition={{ duration: 2, delay: 1 }}
                          className="h-full bg-sky-400" 
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <Database className="text-emerald-400" size={24} />
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: "95%" }} 
                          transition={{ duration: 2, delay: 1.2 }}
                          className="h-full bg-emerald-400" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">40+</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Remotes Supported</p>
                    </div>
                  </div>
                </motion.div>
                {/* Decorative pulse */}
                <div className="absolute inset-0 bg-white/5 blur-3xl scale-125 -z-10 animate-pulse" />
              </div>
            </div>
          </section>

          {/* Section: Features */}
          <section id="features" className="scroll-mt-32">
            <SectionHeading>Engineered for Speed</SectionHeading>
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureCard 
                icon={Zap}
                title="Ultra-low Latency"
                description="Optimized C++ wrapper ensures minimal overhead between Total Commander's API and RClone backend."
                delay={0.1}
              />
              <FeatureCard 
                icon={Shield}
                title="Secure Auth"
                description="Leverages RClone's battle-tested OAuth flow. Your credentials never leave your encrypted config file."
                delay={0.2}
              />
              <FeatureCard 
                icon={HardDrive}
                title="Virtual Mapping"
                description="Mount remotes as virtual drives within Total Commander, enjoying native-like file operations."
                delay={0.3}
              />
              <FeatureCard 
                icon={Cpu}
                title="Multithreaded Io"
                description="Concurrent file listings and background uploads keep the UI responsive during heavy data transfers."
                delay={0.4}
              />
            </div>
          </section>

          {/* Section: Architecture */}
          <section id="architecture" className="scroll-mt-32">
            <SectionHeading>Technical Architecture</SectionHeading>
            <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-900 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Layers size={120} />
              </div>

              <p className="text-zinc-400 leading-relaxed mb-10 max-w-2xl">
                The plugin acts as a stateful intermediary between the WFX API and the RClone subprocess system. 
                It handles complex mapping of virtual paths to remote endpoints in real-time.
              </p>

              <div className="space-y-8 relative">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                    <h4 className="text-white font-bold mb-2">Total Commander</h4>
                    <p className="text-xs text-zinc-500 font-mono italic">WFX Interface Call</p>
                  </div>
                  <ChevronRight className="rotate-90 md:rotate-0 text-zinc-700" />
                  <div className="flex-1 p-6 rounded-2xl bg-white text-black text-center ring-4 ring-zinc-500/10">
                    <h4 className="font-bold mb-2">RClone WFX Plugin</h4>
                    <p className="text-xs text-zinc-700 font-mono italic">C++/Go Translation Layer</p>
                  </div>
                  <ChevronRight className="rotate-90 md:rotate-0 text-zinc-700" />
                  <div className="flex-1 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                    <h4 className="text-white font-bold mb-2">Cloud Infrastructure</h4>
                    <p className="text-xs text-zinc-500 font-mono italic">S3 / Drive / Dropbox</p>
                  </div>
                </div>

                <div className="bg-zinc-900/30 p-6 rounded-2xl border border-dashed border-zinc-800">
                  <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Terminal size={14} className="text-zinc-500" />
                    How it handles Paths
                  </h5>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded bg-zinc-950/50 border border-zinc-900">
                      <span className="text-zinc-500">TC Path:</span>
                      <span className="text-emerald-400">\\\RClone\MyDrive\Projects\main.cpp</span>
                    </div>
                    <div className="text-center py-1">
                      <ChevronRight className="mx-auto rotate-90 text-zinc-800" size={14} />
                    </div>
                    <div className="flex justify-between p-2 rounded bg-zinc-950/50 border border-zinc-900">
                      <span className="text-zinc-500">RClone Cmd:</span>
                      <span className="text-sky-400">rclone cat MyDrive:/Projects/main.cpp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Installation */}
          <section id="installation" className="scroll-mt-32">
            <SectionHeading>Deployment Guide</SectionHeading>
            <div className="space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Platform</p>
                  <p className="text-sm font-bold text-white">Windows 10/11</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">File Manager</p>
                  <p className="text-sm font-bold text-white">Total Commander</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Engine</p>
                  <p className="text-sm font-bold text-white">RClone Core</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Architecture</p>
                  <p className="text-sm font-bold text-white">x64 / ARM64</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold">1</div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Download rclone.exe</h3>
                  <p className="text-zinc-400">RClone must be installed on your system and accessible via the system PATH.</p>
                  <CodeBlock code="winget install Rclone.Rclone" />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold">2</div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Get the WFX Plugin</h3>
                  <p className="text-zinc-400">Download the latest release from GitHub and extract the <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">.wfx</code> (or <code className="text-white bg-zinc-800 px-1.5 py-0.5 rounded">.wfx64</code>) file.</p>
                  <a 
                    href="https://github.com/nastishaaa/rclone-wfx-plugin/releases" 
                    className="inline-flex items-center gap-2 text-white hover:underline group"
                  >
                    View Releases <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold">3</div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Install in Total Commander</h3>
                  <p className="text-zinc-400">Navigate to <span className="text-white font-medium font-mono text-sm leading-relaxed whitespace-pre font-bold uppercase tracking-widest text-[#F27D26]">Configuration &gt; Options &gt; Plugins &gt; File System Plugins (WFX)</span> and click "Add". Select your file.</p>
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-orange-200/60 text-sm">
                    <p className="flex items-center gap-2"><Info size={14} /> Note: Restart Total Commander if the plugin doesn't appear immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Configuration */}
          <section id="configuration" className="scroll-mt-32">
            <SectionHeading>Configuration & Setup</SectionHeading>
            <p className="text-zinc-400 mb-8">
              The plugin uses your global RClone config by default. You can create new remotes using the command line or the internal interface within the file manager.
            </p>
            
            <div className="space-y-6">
              {/* Google Drive Specific Tip */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Cloud className="text-blue-400" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Instant Google Drive Integration</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                      Adding Google Drive is remarkably simple. Once you've added the RClone WFX plugin to Total (or Double) Commander, simply click the 
                      <span className="text-white font-bold mx-1 px-2 py-0.5 bg-blue-500/20 rounded">Configure Rclone</span> 
                      button. The plugin will handle the remote handshake automatically, allowing you to access your cloud files instantly.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono text-blue-400/80">
                      <CheckCircle2 size={14} />
                      AUTO-DISCOVERY ENABLED
                    </div>
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
              </motion.div>

              <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                <h4 className="text-white font-bold mb-4">CLI Setup</h4>
                <CodeBlock code="rclone config" />
                <p className="text-xs text-zinc-500 mt-2 italic">Follow the interactive prompt to set up your S3, Drive, or SFTP remotes.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                  <h4 className="text-white font-bold mb-2">Config Path</h4>
                  <p className="text-sm text-zinc-500 font-mono tracking-tight text-white mb-4 line-clamp-1 truncate font-bold text-sm leading-relaxed whitespace-pre font-mono text-[#E6E6E6]">
                    %AppData%/rclone/rclone.conf
                  </p>
                  <p className="text-xs text-zinc-500">Default storage location for cloud credentials.</p>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                  <h4 className="text-white font-bold mb-2">Logs</h4>
                  <p className="text-sm text-zinc-500 font-mono tracking-tight text-white mb-4 line-clamp-1 truncate font-bold text-sm leading-relaxed whitespace-pre font-mono text-[#E6E6E6]">
                    rclone-wfx.log
                  </p>
                  <p className="text-xs text-zinc-500">Enabled in debug mode for API audit.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Troubleshooting */}
          <section id="troubleshooting" className="scroll-mt-32">
            <SectionHeading>Common Pitfalls</SectionHeading>
            <div className="space-y-4">
               {[
                 { q: "Plugin says 'rclone not found'", a: "Ensure rclone is in your Windows PATH. Open CMD and type 'rclone' to verify." },
                 { q: "Empty file list in Total Commander", a: "Check if the remote is properly configured. Test with 'rclone ls [remote]:' in terminal." },
                 { q: "Uploads are slow", a: "This often depends on your network and the provider's API. Check rclone --transfers parameter if applicable." }
               ].map((item, i) => (
                 <div key={i} className="p-6 rounded-2xl bg-zinc-900/20 border border-zinc-800 hover:bg-zinc-900/40 transition-colors">
                   <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                     <HelpCircle size={16} className="text-zinc-500" />
                     {item.q}
                   </h4>
                   <p className="text-sm text-zinc-400">{item.a}</p>
                 </div>
               ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-32 pb-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-sm text-zinc-500">© 2026 RClone WFX Team</p>
              <p className="text-xs text-zinc-600 mt-1">Built with passion for the Total Commander community.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Github size={20} /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors tracking-tight text-white line-clamp-1 truncate font-bold text-sm leading-relaxed whitespace-pre font-mono text-[#E6E6E6]">
                 v1.2.4-STABLE
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
