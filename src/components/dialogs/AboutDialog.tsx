import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Logo } from '../common/Logo';
import { APP_VERSION } from '../../version';
import {
  Layers,
  Code2,
  Cpu,
  Package,
  Sparkles,
  ExternalLink,
  Heart,
  FileCode,
  TestTube2,
  CheckCircle2,
  Palette
} from 'lucide-react';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'stack'>('about');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About SVGEdito"
      width={680}
      actions={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div className="about-links">
            <a
              href="https://github.com/qya/svg-edito"
              target="_blank"
              rel="noreferrer"
              className="about-link-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
          <button className="mat-flat-button" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div className="about-dialog-container">
        {/* App Hero / Brand */}
        <div className="about-header">
          <div className="about-logo-container">
            <Logo size={30} fill="#ffffff" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="about-title-row">
              <span className="about-app-name">SVGEdito</span>
              <span className="about-version-badge">v{APP_VERSION}</span>
            </div>
            <div className="about-tagline">
              Professional layer-based SVG path and vector graphics editor for the web
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="about-tabs">
          <button
            type="button"
            className={`about-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About Project
          </button>
          <button
            type="button"
            className={`about-tab-btn ${activeTab === 'stack' ? 'active' : ''}`}
            onClick={() => setActiveTab('stack')}
          >
            What We Use
          </button>
        </div>

        {/* Tab 1: About the Project */}
        {activeTab === 'about' && (
          <div className="about-tab-content">
            <div className="about-lead-text">
              <strong>SVGEdito</strong> is designed around the core principle that <em>every editable vector object is a layer</em>.
              By treating standard SVG path syntax as the native document representation, it delivers the precision of raw SVG curve manipulation alongside the intuitive multi-layer workflow of modern design tools like Figma, Illustrator, and Photoshop.
            </div>

            <div className="about-cards-grid">
              <div className="about-card">
                <div className="about-card-title">
                  <Code2 size={16} color="#61afef" />
                  Path-First Engine
                </div>
                <div className="about-card-desc">
                  First-class visual editing for all SVG path commands (M, L, H, V, C, S, Q, T, A, Z), interactive Bézier handles, and absolute/relative coordinate toggling.
                </div>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <Layers size={16} color="#98c379" />
                  Multi-Layer Management
                </div>
                <div className="about-card-desc">
                  Hierarchical layer tree with grouping, z-order reordering, visibility & lock controls, opacity, and custom fill/stroke styling per layer.
                </div>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <Sparkles size={16} color="#e5c07b" />
                  Geometric Transformations
                </div>
                <div className="about-card-desc">
                  Real-time scaling, translation, rotation, coordinate rounding, reverse path direction, origin shifting, and path optimization.
                </div>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <Palette size={16} color="#c678dd" />
                  Tracing & Reference Images
                </div>
                <div className="about-card-desc">
                  Load backdrop bitmap images with interactive opacity controls and aspect ratio locks to trace artwork into clean vector paths.
                </div>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <FileCode size={16} color="#56b6c2" />
                  Clean SVG Portability
                </div>
                <div className="about-card-desc">
                  Export standard SVG code, render PNG rasters, share via URL parameters, or save projects locally in browser storage.
                </div>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <CheckCircle2 size={16} color="#e06c75" />
                  Native Web Standards
                </div>
                <div className="about-card-desc">
                  No heavy canvas engines or proprietary binary formats. Uses standard W3C SVG syntax as the authoritative source of truth.
                </div>
              </div>
            </div>

            <div className="about-credits-box">
              <strong>Credits & Acknowledgement:</strong> Path editing concepts and algorithms are heavily inspired by and build upon{' '}
              <a href="https://github.com/Yqnn/svg-path-editor" target="_blank" rel="noreferrer">
                svg-path-editor by Yqnn
              </a>
              .
            </div>
          </div>
        )}

        {/* Tab 2: What We Use (Tech Stack) */}
        {activeTab === 'stack' && (
          <div className="about-tab-content">
            <div className="about-lead-text">
              SVGEdito is built with a focused, modern web stack chosen for performance, type safety, and fast feedback loops:
            </div>

            <div className="about-cards-grid">
              <div className="about-card">
                <div className="about-card-title">
                  <Cpu size={16} color="#61afef" />
                  React 18
                </div>
                <div className="about-card-desc">
                  Powers the component hierarchy, declarative rendering, custom hooks, and reactive canvas integration.
                </div>
                <span className="about-tech-tag">v18.3.1</span>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <Code2 size={16} color="#3178c6" />
                  TypeScript
                </div>
                <div className="about-card-desc">
                  End-to-end static type safety for vector geometry calculations, SVG command ASTs, and layer document models.
                </div>
                <span className="about-tech-tag">v5.7.2</span>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <Package size={16} color="#bd34fe" />
                  Vite 6
                </div>
                <div className="about-card-desc">
                  Next-generation frontend tooling offering instant dev-server starts, lightning-fast HMR, and optimized Rollup production builds.
                </div>
                <span className="about-tech-tag">v6.2.0</span>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <Palette size={16} color="#f06595" />
                  Lucide React
                </div>
                <div className="about-card-desc">
                  Crisp, modern, consistent vector icon set used across toolbars, layer action buttons, and context menus.
                </div>
                <span className="about-tech-tag">v1.16.0</span>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <TestTube2 size={16} color="#fcc419" />
                  Vitest
                </div>
                <div className="about-card-desc">
                  Blazing-fast test runner validating path parsing algorithms, SVG exporters, reverse paths, and geometry math.
                </div>
                <span className="about-tech-tag">v3.0.7</span>
              </div>

              <div className="about-card">
                <div className="about-card-title">
                  <CheckCircle2 size={16} color="#51cf66" />
                  Web Platform APIs
                </div>
                <div className="about-card-desc">
                  Native SVG DOM APIs (SVGPathElement bounding box & lengths), HTML5 Canvas rasterization, LocalStorage, and Clipboard APIs.
                </div>
                <span className="about-tech-tag">W3C SVG 1.1 / 2.0</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
