"""
CLISONIX AUTO-PUBLISHER - 100% Automated Content Pipeline
==========================================================

Fully automated system that:
1. Generates topics based on trends, news, and domain expertise
2. Creates high-quality documents via Blerina + EAP
3. Publishes to multiple platforms automatically
4. Runs 24/7 without human intervention

Target: 50-100 documents/day across all platforms
Goal: Make Clisonix known worldwide through valuable content

Author: Ledjan Ahmati (CEO, ABA GmbH)
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import random
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

# HTTP client
try:
    import httpx
except ImportError:
    httpx = None  # type: ignore

logger = logging.getLogger("auto_publisher")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class AutoPublishConfig:
    """Configuration for auto-publishing"""
    # LLM
    ollama_url: str = field(default_factory=lambda: os.environ.get("OLLAMA_HOST", "http://localhost:11434"))
    model: str = field(default_factory=lambda: os.environ.get("MODEL", "llama3.1:8b"))
    
    # Publishing intervals
    min_interval_seconds: int = 300      # 5 minutes minimum between posts
    max_interval_seconds: int = 1800     # 30 minutes maximum
    docs_per_day_target: int = 50        # Target documents per day
    
    # Platforms
    linkedin_enabled: bool = True
    medium_enabled: bool = True
    twitter_enabled: bool = True
    devto_enabled: bool = True
    substack_enabled: bool = False       # Needs manual newsletter setup
    
    # API Credentials (from environment)
    linkedin_token: Optional[str] = field(default_factory=lambda: os.environ.get("LINKEDIN_ACCESS_TOKEN"))
    medium_token: Optional[str] = field(default_factory=lambda: os.environ.get("MEDIUM_TOKEN"))
    twitter_api_key: Optional[str] = field(default_factory=lambda: os.environ.get("TWITTER_API_KEY"))
    twitter_api_secret: Optional[str] = field(default_factory=lambda: os.environ.get("TWITTER_API_SECRET"))
    twitter_access_token: Optional[str] = field(default_factory=lambda: os.environ.get("TWITTER_ACCESS_TOKEN"))
    twitter_access_secret: Optional[str] = field(default_factory=lambda: os.environ.get("TWITTER_ACCESS_SECRET"))
    devto_api_key: Optional[str] = field(default_factory=lambda: os.environ.get("DEVTO_API_KEY"))
    
    # Content storage
    output_dir: str = "/app/published"
    
    # Quality thresholds
    min_quality_score: float = 0.7
    max_gaps_allowed: int = 2


# ═══════════════════════════════════════════════════════════════════════════════
# TOPIC DOMAINS - What Clisonix is about
# ═══════════════════════════════════════════════════════════════════════════════

class TopicDomain(str, Enum):
    """Clisonix expertise domains"""
    EEG_NEUROSCIENCE = "eeg_neuroscience"
    AUDIO_PROCESSING = "audio_processing"
    AI_ML_SYSTEMS = "ai_ml_systems"
    HEALTHCARE_TECH = "healthcare_tech"
    SIGNAL_PROCESSING = "signal_processing"
    REGULATORY_COMPLIANCE = "regulatory_compliance"
    ENTERPRISE_AI = "enterprise_ai"
    EDGE_COMPUTING = "edge_computing"
    DATA_PRIVACY = "data_privacy"
    SUSTAINABLE_TECH = "sustainable_tech"


# Topic templates per domain
TOPIC_TEMPLATES: Dict[TopicDomain, List[str]] = {
    TopicDomain.EEG_NEUROSCIENCE: [
        "How real-time EEG analysis is revolutionizing {application}",
        "The science behind {technique} in brain-computer interfaces",
        "Why {metric} matters in clinical EEG monitoring",
        "Building reliable EEG systems for {use_case}",
        "Understanding {wave_type} waves and their clinical significance",
        "EEG-based {detection_type} detection: Current state and future",
        "Challenges in {challenge} for EEG devices",
        "How AI improves {aspect} in EEG interpretation",
    ],
    TopicDomain.AUDIO_PROCESSING: [
        "Real-time audio analysis for {application}",
        "Speech recognition in {environment}: Technical challenges",
        "How {technique} improves audio quality in {context}",
        "Building low-latency audio processing systems",
        "The role of {technology} in modern audio analytics",
        "Audio biomarkers: Detecting {condition} through voice",
    ],
    TopicDomain.AI_ML_SYSTEMS: [
        "Deploying ML models at scale: Lessons from {industry}",
        "Why {approach} is essential for production AI",
        "Building explainable AI systems for {domain}",
        "The architecture of real-time ML inference engines",
        "How {technique} improves model performance in {context}",
        "Edge AI vs Cloud AI: When to use what",
        "Monitoring ML models in production: Best practices",
    ],
    TopicDomain.HEALTHCARE_TECH: [
        "Digital health compliance: Navigating {regulation}",
        "Building HIPAA-compliant AI systems",
        "The future of remote patient monitoring",
        "AI in diagnostics: {modality} analysis systems",
        "Interoperability challenges in healthcare IT",
        "Patient data privacy in the age of AI",
    ],
    TopicDomain.SIGNAL_PROCESSING: [
        "Real-time signal filtering for {application}",
        "Understanding {algorithm} in digital signal processing",
        "Time-frequency analysis: {method} explained",
        "Artifact removal in biomedical signals",
        "Building robust signal processing pipelines",
    ],
    TopicDomain.REGULATORY_COMPLIANCE: [
        "EU AI Act: What it means for {industry}",
        "MDR compliance for AI-powered medical devices",
        "GDPR and AI: Handling personal data correctly",
        "ISO 13485 for software as medical device",
        "Building audit trails for regulatory compliance",
    ],
    TopicDomain.ENTERPRISE_AI: [
        "Enterprise AI adoption: Common pitfalls and solutions",
        "Building AI centers of excellence",
        "ROI of AI investments: Measuring real value",
        "AI governance in large organizations",
        "From POC to production: Scaling enterprise AI",
    ],
    TopicDomain.EDGE_COMPUTING: [
        "Edge AI for {application}: Architecture patterns",
        "Optimizing neural networks for edge deployment",
        "Real-time inference on embedded systems",
        "Power-efficient AI at the edge",
        "Edge-cloud hybrid architectures for AI",
    ],
    TopicDomain.DATA_PRIVACY: [
        "Federated learning: AI without data sharing",
        "Differential privacy in ML systems",
        "Anonymization techniques for health data",
        "Privacy-preserving AI: Technical approaches",
        "GDPR-compliant machine learning pipelines",
    ],
    TopicDomain.SUSTAINABLE_TECH: [
        "Green AI: Reducing the carbon footprint of ML",
        "Energy-efficient model architectures",
        "Sustainable data centers for AI workloads",
        "The environmental cost of large language models",
        "Building eco-friendly AI infrastructure",
    ],
}

# Fill-in values for templates
TEMPLATE_FILLS: Dict[str, List[str]] = {
    "application": ["sleep monitoring", "epilepsy detection", "attention tracking", "meditation apps", "mental health assessment", "cognitive load measurement", "driver alertness", "anesthesia monitoring"],
    "technique": ["spectral analysis", "wavelet decomposition", "independent component analysis", "deep learning", "adaptive filtering", "coherence analysis"],
    "metric": ["signal quality", "artifact rejection rate", "classification accuracy", "latency", "battery efficiency"],
    "use_case": ["clinical research", "consumer wearables", "hospital ICU", "home monitoring", "sports performance"],
    "wave_type": ["alpha", "beta", "theta", "delta", "gamma"],
    "detection_type": ["seizure", "sleep stage", "drowsiness", "stress", "cognitive impairment"],
    "challenge": ["motion artifact removal", "electrode contact quality", "signal standardization", "real-time processing"],
    "aspect": ["accuracy", "speed", "reliability", "interpretability"],
    "environment": ["noisy environments", "clinical settings", "call centers", "smart homes"],
    "context": ["telehealth", "voice assistants", "medical diagnostics", "security systems"],
    "technology": ["transformer models", "spectrogram analysis", "voice activity detection", "speaker diarization"],
    "condition": ["Parkinson's disease", "depression", "respiratory illness", "stress levels"],
    "industry": ["healthcare", "finance", "manufacturing", "retail"],
    "approach": ["MLOps", "model versioning", "A/B testing", "continuous training"],
    "domain": ["healthcare", "finance", "legal", "insurance"],
    "regulation": ["EU AI Act", "FDA guidelines", "HIPAA", "MDR"],
    "modality": ["radiology", "pathology", "cardiology", "dermatology"],
    "algorithm": ["FFT", "Kalman filter", "IIR filters", "FIR filters"],
    "method": ["STFT", "wavelet transform", "Hilbert-Huang transform", "spectrogram"],
}


# ═══════════════════════════════════════════════════════════════════════════════
# TOPIC GENERATOR
# ═══════════════════════════════════════════════════════════════════════════════

class TopicGenerator:
    """Generates topics for content creation"""
    
    def __init__(self, config: AutoPublishConfig):
        self.config = config
        self.generated_topics: List[str] = []
        self.topic_hashes: set = set()  # Avoid duplicates
    
    def generate_from_template(self) -> Dict[str, Any]:
        """Generate a topic from templates"""
        # Pick random domain
        domain = random.choice(list(TopicDomain))
        templates = TOPIC_TEMPLATES.get(domain, [])
        
        if not templates:
            return self._fallback_topic(domain)
        
        # Pick random template
        template = random.choice(templates)
        
        # Fill in placeholders
        topic = template
        for placeholder, values in TEMPLATE_FILLS.items():
            if "{" + placeholder + "}" in topic:
                topic = topic.replace("{" + placeholder + "}", random.choice(values))
        
        # Check for duplicate
        topic_hash = hashlib.md5(topic.lower().encode()).hexdigest()
        if topic_hash in self.topic_hashes:
            return self.generate_from_template()  # Try again
        
        self.topic_hashes.add(topic_hash)
        self.generated_topics.append(topic)
        
        return {
            "topic": topic,
            "domain": domain.value,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "method": "template"
        }
    
    async def generate_with_llm(self, context: Optional[str] = None) -> Dict[str, Any]:
        """Generate topic using LLM for more variety"""
        domain = random.choice(list(TopicDomain))
        
        prompt = f"""Generate a unique, engaging article topic for a technology company specializing in:
- EEG/brain signal processing
- Audio analytics
- AI/ML systems for healthcare
- Medical device software

Domain focus: {domain.value.replace('_', ' ').title()}

{f'Context: {context}' if context else ''}

Requirements:
- Professional but accessible tone
- Practical and actionable
- Appeal to CTOs, developers, and healthcare professionals
- 10-15 words maximum

Return ONLY the topic title, nothing else."""

        try:
            if httpx:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{self.config.ollama_url}/api/generate",
                        json={
                            "model": self.config.model,
                            "prompt": prompt,
                            "stream": False
                        }
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        topic = result.get("response", "").strip().strip('"\'')
                        
                        if topic and len(topic) > 10:
                            topic_hash = hashlib.md5(topic.lower().encode()).hexdigest()
                            if topic_hash not in self.topic_hashes:
                                self.topic_hashes.add(topic_hash)
                                self.generated_topics.append(topic)
                                
                                return {
                                    "topic": topic,
                                    "domain": domain.value,
                                    "generated_at": datetime.now(timezone.utc).isoformat(),
                                    "method": "llm"
                                }
        except Exception as e:
            logger.warning(f"LLM topic generation failed: {e}")
        
        # Fallback to template
        return self.generate_from_template()
    
    def _fallback_topic(self, domain: TopicDomain) -> Dict[str, Any]:
        """Fallback topic generation"""
        topics = [
            "Building Reliable AI Systems for Healthcare Applications",
            "Real-Time Signal Processing: Architecture and Best Practices",
            "The Future of Brain-Computer Interfaces in Consumer Tech",
            "AI Compliance in Medical Devices: A Practical Guide",
            "Edge Computing for Healthcare: When Milliseconds Matter",
        ]
        topic = random.choice(topics)
        return {
            "topic": topic,
            "domain": domain.value,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "method": "fallback"
        }


# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT GENERATOR
# ═══════════════════════════════════════════════════════════════════════════════

class ContentGenerator:
    """Generates full article content from topics"""
    
    def __init__(self, config: AutoPublishConfig):
        self.config = config
    
    async def generate_article(self, topic: str, domain: str) -> Dict[str, Any]:
        """Generate full article content using LLM"""
        
        prompt = f"""Write a professional technical article about: "{topic}"

Domain: {domain.replace('_', ' ').title()}
Company: Clisonix (AI healthcare technology company)

Structure:
1. Introduction (hook the reader, state the problem)
2. Core content (3-4 sections with technical depth)
3. Practical examples or case studies
4. Conclusion with actionable takeaways

Requirements:
- 800-1200 words
- Professional but accessible
- Include technical details where relevant
- Add value to readers (CTOs, developers, healthcare professionals)
- Subtle Clisonix positioning (expertise, not sales)
- Use markdown formatting

Write the complete article:"""

        try:
            if httpx:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        f"{self.config.ollama_url}/api/generate",
                        json={
                            "model": self.config.model,
                            "prompt": prompt,
                            "stream": False
                        }
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        content = result.get("response", "").strip()
                        
                        if content and len(content) > 500:
                            return {
                                "success": True,
                                "title": topic,
                                "content": content,
                                "word_count": len(content.split()),
                                "domain": domain,
                                "generated_at": datetime.now(timezone.utc).isoformat()
                            }
        except Exception as e:
            logger.error(f"Content generation failed: {e}")
        
        return {
            "success": False,
            "title": topic,
            "error": "Content generation failed",
            "domain": domain
        }
    
    def generate_social_variants(self, article: Dict[str, Any]) -> Dict[str, str]:
        """Generate platform-specific variants"""
        title = article.get("title", "")
        content = article.get("content", "")
        
        # Extract first paragraph as summary
        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip() and not p.startswith("#")]
        summary = paragraphs[0] if paragraphs else content[:300]
        
        return {
            "linkedin": f"🚀 {title}\n\n{summary[:500]}...\n\n#HealthTech #AI #Innovation #Clisonix",
            "twitter": f"{title[:200]}\n\n{summary[:180]}...\n\n#HealthTech #AI",
            "medium_excerpt": summary[:400],
            "devto_tags": "healthtech,ai,machinelearning,programming"
        }


# ═══════════════════════════════════════════════════════════════════════════════
# PLATFORM PUBLISHERS
# ═══════════════════════════════════════════════════════════════════════════════

class LocalPublisher:
    """Save articles locally - always works, no API needed"""
    
    def __init__(self, output_dir: str = "/app/published"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        # Also create blog directory for Jekyll/GitHub Pages
        self.blog_dir = self.output_dir / "blog" / "_posts"
        self.blog_dir.mkdir(parents=True, exist_ok=True)
    
    async def publish(self, content: str, title: str, domain: str = "general", 
                     tags: Optional[List[str]] = None) -> Dict[str, Any]:
        """Save article locally as Markdown and HTML"""
        try:
            # Create slug from title
            slug = title.lower()
            for char in ["'", '"', ":", ";", ",", ".", "?", "!", "(", ")", "[", "]"]:
                slug = slug.replace(char, "")
            slug = slug.replace(" ", "-")[:50]
            
            date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            timestamp = datetime.now(timezone.utc).isoformat()
            
            # Jekyll-compatible filename
            filename = f"{date_str}-{slug}"
            
            actual_tags = tags if tags else ["clisonix", "technology", "ai"]
            
            # Create Jekyll front matter
            front_matter = f"""---
layout: post
title: "{title}"
date: {timestamp}
categories: [{domain}]
tags: [{', '.join(actual_tags)}]
author: Clisonix AI
description: "{title[:150]}"
---

"""
            # Save as Markdown (Jekyll format)
            md_path = self.blog_dir / f"{filename}.md"
            md_path.write_text(front_matter + content, encoding="utf-8")
            
            # Save as plain Markdown (without front matter)
            plain_md_path = self.output_dir / "articles" / f"{filename}.md"
            plain_md_path.parent.mkdir(parents=True, exist_ok=True)
            plain_md_path.write_text(f"# {title}\n\n{content}", encoding="utf-8")
            
            # Create HTML version
            html_content = self._markdown_to_html(title, content, actual_tags, domain)
            html_path = self.output_dir / "html" / f"{filename}.html"
            html_path.parent.mkdir(parents=True, exist_ok=True)
            html_path.write_text(html_content, encoding="utf-8")
            
            # Update index
            self._update_index(title, filename, domain, actual_tags)
            
            logger.info(f"📁 Saved locally: {filename}")
            
            return {
                "success": True,
                "platform": "local",
                "files": {
                    "jekyll": str(md_path),
                    "markdown": str(plain_md_path),
                    "html": str(html_path)
                },
                "slug": slug,
                "url": f"/blog/{date_str}/{slug}",
                "published_at": timestamp
            }
            
        except Exception as e:
            logger.error(f"Local save failed: {e}")
            return {"success": False, "error": str(e), "platform": "local"}
    
    def _markdown_to_html(self, title: str, content: str, tags: List[str], domain: str) -> str:
        """Convert markdown to HTML with Clisonix branding"""
        # Simple markdown to HTML conversion
        html_body = content
        
        # Convert headers
        for i in range(6, 0, -1):
            html_body = html_body.replace(f"{'#' * i} ", f"<h{i}>").replace("\n", f"</h{i}>\n", 1)
        
        # Convert bold and italic
        import re
        html_body = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html_body)
        html_body = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html_body)
        
        # Convert paragraphs
        paragraphs = html_body.split('\n\n')
        html_body = '\n'.join([f'<p>{p}</p>' if not p.startswith('<') else p for p in paragraphs])
        
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{title[:150]}">
    <meta name="keywords" content="{', '.join(tags)}">
    <meta name="author" content="Clisonix">
    <title>{title} | Clisonix</title>
    <style>
        :root {{ --primary: #2563eb; --bg: #f8fafc; --text: #1e293b; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
               max-width: 800px; margin: 0 auto; padding: 2rem; background: var(--bg); color: var(--text); }}
        h1 {{ color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; }}
        .meta {{ color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }}
        .tags {{ display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }}
        .tag {{ background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; }}
        .content {{ line-height: 1.8; }}
        .footer {{ margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; }}
    </style>
</head>
<body>
    <article>
        <h1>{title}</h1>
        <div class="meta">
            <span>📅 {datetime.now(timezone.utc).strftime('%B %d, %Y')}</span> • 
            <span>📁 {domain}</span> • 
            <span>🏢 Clisonix AI</span>
        </div>
        <div class="tags">
            {''.join([f'<span class="tag">{tag}</span>' for tag in tags])}
        </div>
        <div class="content">
            {html_body}
        </div>
    </article>
    <footer class="footer">
        <p>© {datetime.now().year} Clisonix - Advancing Healthcare Through Intelligent Signal Processing</p>
        <p><a href="https://clisonix.com">clisonix.com</a></p>
    </footer>
</body>
</html>"""
    
    def _update_index(self, title: str, filename: str, domain: str, tags: List[str]) -> None:
        """Update the articles index JSON"""
        index_path = self.output_dir / "index.json"
        
        try:
            if index_path.exists():
                index = json.loads(index_path.read_text())
            else:
                index = {"articles": [], "last_updated": None, "total_count": 0}
            
            index["articles"].insert(0, {
                "title": title,
                "filename": filename,
                "domain": domain,
                "tags": tags,
                "published_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Keep last 1000 articles in index
            index["articles"] = index["articles"][:1000]
            index["total_count"] = len(index["articles"])
            index["last_updated"] = datetime.now(timezone.utc).isoformat()
            
            index_path.write_text(json.dumps(index, indent=2))
            
        except Exception as e:
            logger.error(f"Failed to update index: {e}")


class GitHubPagesPublisher:
    """Publish to GitHub Pages via Git push"""
    
    def __init__(self, repo_path: str = "/app/published", 
                 repo_url: Optional[str] = None,
                 branch: str = "main"):
        self.repo_path = Path(repo_path)
        self.repo_url = repo_url or os.environ.get("GITHUB_PAGES_REPO")
        self.branch = branch
        self._git_configured = False
    
    async def configure_git(self) -> bool:
        """Configure git for pushing"""
        if self._git_configured:
            return True
        
        try:
            import subprocess
            
            # Check if git repo exists
            git_dir = self.repo_path / ".git"
            if not git_dir.exists():
                # Initialize repo
                subprocess.run(["git", "init"], cwd=self.repo_path, check=True)
                
                if self.repo_url:
                    subprocess.run(["git", "remote", "add", "origin", self.repo_url], 
                                 cwd=self.repo_path, check=True)
            
            # Configure user
            subprocess.run(["git", "config", "user.email", "ai@clisonix.com"], 
                         cwd=self.repo_path, check=True)
            subprocess.run(["git", "config", "user.name", "Clisonix AI"], 
                         cwd=self.repo_path, check=True)
            
            self._git_configured = True
            return True
            
        except Exception as e:
            logger.error(f"Git configuration failed: {e}")
            return False
    
    async def publish(self, commit_message: Optional[str] = None) -> Dict[str, Any]:
        """Commit and push all new articles to GitHub"""
        if not self.repo_url:
            return {
                "success": False, 
                "error": "No GitHub repo configured. Set GITHUB_PAGES_REPO env var",
                "platform": "github_pages"
            }
        
        try:
            import subprocess
            
            if not await self.configure_git():
                return {"success": False, "error": "Git configuration failed", "platform": "github_pages"}
            
            # Add all changes
            subprocess.run(["git", "add", "-A"], cwd=self.repo_path, check=True)
            
            # Check if there are changes
            result = subprocess.run(["git", "status", "--porcelain"], 
                                  cwd=self.repo_path, capture_output=True, text=True)
            
            if not result.stdout.strip():
                return {
                    "success": True, 
                    "message": "No new changes to publish",
                    "platform": "github_pages"
                }
            
            # Commit
            msg = commit_message or f"📝 Auto-publish: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
            subprocess.run(["git", "commit", "-m", msg], cwd=self.repo_path, check=True)
            
            # Push
            subprocess.run(["git", "push", "-u", "origin", self.branch], 
                         cwd=self.repo_path, check=True)
            
            logger.info(f"🚀 Pushed to GitHub Pages: {self.repo_url}")
            
            return {
                "success": True,
                "platform": "github_pages",
                "repo": self.repo_url,
                "branch": self.branch,
                "published_at": datetime.now(timezone.utc).isoformat()
            }
            
        except subprocess.CalledProcessError as e:
            return {"success": False, "error": f"Git error: {e}", "platform": "github_pages"}
        except Exception as e:
            return {"success": False, "error": str(e), "platform": "github_pages"}


class LinkedInPublisher:
    """Publish to LinkedIn"""
    
    def __init__(self, access_token: Optional[str]):
        self.access_token = access_token
        self.api_url = "https://api.linkedin.com/v2"
    
    async def publish(self, content: str, title: str) -> Dict[str, Any]:
        """Publish post to LinkedIn"""
        if not self.access_token:
            return {"success": False, "error": "No LinkedIn token configured", "platform": "linkedin"}
        
        try:
            if httpx:
                async with httpx.AsyncClient() as client:
                    # Get user URN
                    me_response = await client.get(
                        f"{self.api_url}/userinfo",
                        headers={"Authorization": f"Bearer {self.access_token}"}
                    )
                    
                    if me_response.status_code != 200:
                        return {"success": False, "error": "Failed to get user info", "platform": "linkedin"}
                    
                    user_sub = me_response.json().get("sub")
                    
                    # Create post
                    post_data = {
                        "author": f"urn:li:person:{user_sub}",
                        "lifecycleState": "PUBLISHED",
                        "specificContent": {
                            "com.linkedin.ugc.ShareContent": {
                                "shareCommentary": {"text": content[:3000]},
                                "shareMediaCategory": "NONE"
                            }
                        },
                        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
                    }
                    
                    response = await client.post(
                        f"{self.api_url}/ugcPosts",
                        headers={
                            "Authorization": f"Bearer {self.access_token}",
                            "Content-Type": "application/json",
                            "X-Restli-Protocol-Version": "2.0.0"
                        },
                        json=post_data
                    )
                    
                    if response.status_code in [200, 201]:
                        post_id = response.headers.get("x-restli-id", "unknown")
                        return {
                            "success": True,
                            "platform": "linkedin",
                            "post_id": post_id,
                            "url": f"https://www.linkedin.com/feed/update/{post_id}",
                            "published_at": datetime.now(timezone.utc).isoformat()
                        }
                    else:
                        return {"success": False, "error": response.text, "platform": "linkedin"}
                        
        except Exception as e:
            return {"success": False, "error": str(e), "platform": "linkedin"}
        
        return {"success": False, "error": "httpx not available", "platform": "linkedin"}


class MediumPublisher:
    """Publish to Medium"""
    
    def __init__(self, token: Optional[str]):
        self.token = token
        self.api_url = "https://api.medium.com/v1"
    
    async def publish(self, content: str, title: str, tags: Optional[List[str]] = None) -> Dict[str, Any]:
        """Publish article to Medium"""
        if not self.token:
            return {"success": False, "error": "No Medium token configured", "platform": "medium"}
        
        actual_tags = tags if tags else ["Technology", "AI", "Healthcare"]
        
        try:
            if httpx:
                async with httpx.AsyncClient() as client:
                    # Get user ID
                    me_response = await client.get(
                        f"{self.api_url}/me",
                        headers={"Authorization": f"Bearer {self.token}"}
                    )
                    
                    if me_response.status_code != 200:
                        return {"success": False, "error": "Failed to get user info", "platform": "medium"}
                    
                    user_id = me_response.json().get("data", {}).get("id")
                    
                    # Create post
                    post_data = {
                        "title": title,
                        "contentFormat": "markdown",
                        "content": content,
                        "tags": actual_tags[:5],  # Medium allows max 5 tags
                        "publishStatus": "public"
                    }
                    
                    response = await client.post(
                        f"{self.api_url}/users/{user_id}/posts",
                        headers={
                            "Authorization": f"Bearer {self.token}",
                            "Content-Type": "application/json"
                        },
                        json=post_data
                    )
                    
                    if response.status_code in [200, 201]:
                        data = response.json().get("data", {})
                        return {
                            "success": True,
                            "platform": "medium",
                            "post_id": data.get("id"),
                            "url": data.get("url"),
                            "published_at": datetime.now(timezone.utc).isoformat()
                        }
                    else:
                        return {"success": False, "error": response.text, "platform": "medium"}
                        
        except Exception as e:
            return {"success": False, "error": str(e), "platform": "medium"}
        
        return {"success": False, "error": "httpx not available", "platform": "medium"}


class DevToPublisher:
    """Publish to Dev.to"""
    
    def __init__(self, api_key: Optional[str]):
        self.api_key = api_key
        self.api_url = "https://dev.to/api"
    
    async def publish(self, content: str, title: str, tags: Optional[List[str]] = None) -> Dict[str, Any]:
        """Publish article to Dev.to"""
        if not self.api_key:
            return {"success": False, "error": "No Dev.to API key configured", "platform": "devto"}
        
        actual_tags = tags if tags else ["healthtech", "ai", "programming", "machinelearning"]
        
        try:
            if httpx:
                async with httpx.AsyncClient() as client:
                    post_data = {
                        "article": {
                            "title": title,
                            "body_markdown": content,
                            "published": True,
                            "tags": actual_tags[:4]  # Dev.to allows max 4 tags
                        }
                    }
                    
                    response = await client.post(
                        f"{self.api_url}/articles",
                        headers={
                            "api-key": self.api_key,
                            "Content-Type": "application/json"
                        },
                        json=post_data
                    )
                    
                    if response.status_code in [200, 201]:
                        data = response.json()
                        return {
                            "success": True,
                            "platform": "devto",
                            "post_id": data.get("id"),
                            "url": data.get("url"),
                            "published_at": datetime.now(timezone.utc).isoformat()
                        }
                    else:
                        return {"success": False, "error": response.text, "platform": "devto"}
                        
        except Exception as e:
            return {"success": False, "error": str(e), "platform": "devto"}
        
        return {"success": False, "error": "httpx not available", "platform": "devto"}


class TwitterPublisher:
    """Publish to Twitter/X"""
    
    def __init__(self, api_key: str, api_secret: str, access_token: str, access_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.access_token = access_token
        self.access_secret = access_secret
        self.api_url = "https://api.twitter.com/2"
    
    async def publish(self, content: str) -> Dict[str, Any]:
        """Publish tweet"""
        if not all([self.api_key, self.api_secret, self.access_token, self.access_secret]):
            return {"success": False, "error": "Twitter credentials not configured", "platform": "twitter"}
        
        # Twitter integration requires OAuth 1.0a which is complex
        # For now, return placeholder - would need tweepy or similar
        return {
            "success": False, 
            "error": "Twitter OAuth implementation needed - use tweepy library",
            "platform": "twitter"
        }


# ═══════════════════════════════════════════════════════════════════════════════
# AUTO PUBLISHER ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class AutoPublisher:
    """Main auto-publishing engine"""
    
    def __init__(self, config: Optional[AutoPublishConfig] = None):
        self.config = config or AutoPublishConfig()
        self.topic_generator = TopicGenerator(self.config)
        self.content_generator = ContentGenerator(self.config)
        
        # Initialize publishers - LOCAL is ALWAYS enabled (no API needed)
        self.local = LocalPublisher(self.config.output_dir)
        self.github_pages = GitHubPagesPublisher(
            self.config.output_dir,
            os.environ.get("GITHUB_PAGES_REPO")
        )
        
        # External platform publishers (need API keys)
        self.linkedin = LinkedInPublisher(self.config.linkedin_token)
        self.medium = MediumPublisher(self.config.medium_token)
        self.devto = DevToPublisher(self.config.devto_api_key)
        self.twitter = TwitterPublisher(
            self.config.twitter_api_key or "",
            self.config.twitter_api_secret or "",
            self.config.twitter_access_token or "",
            self.config.twitter_access_secret or ""
        )
        
        self._running = False
        self._stats: Dict[str, Any] = {
            "total_generated": 0,
            "total_published": 0,
            "locally_saved": 0,
            "by_platform": {},
            "errors": [],
            "started_at": None
        }
    
    async def publish_cycle(self) -> Dict[str, Any]:
        """Execute one full publish cycle"""
        cycle_id = hashlib.md5(datetime.now().isoformat().encode()).hexdigest()[:8]
        logger.info(f"🔄 Starting publish cycle {cycle_id}")
        
        results: Dict[str, Any] = {
            "cycle_id": cycle_id,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "topic": None,
            "article": None,
            "publications": []
        }
        
        try:
            # 1. Generate topic (50% template, 50% LLM)
            if random.random() < 0.5:
                topic_result = self.topic_generator.generate_from_template()
            else:
                topic_result = await self.topic_generator.generate_with_llm()
            
            results["topic"] = topic_result
            logger.info(f"📝 Topic: {topic_result['topic']}")
            
            # 2. Generate article
            article = await self.content_generator.generate_article(
                topic_result["topic"],
                topic_result["domain"]
            )
            
            if not article.get("success"):
                logger.error(f"❌ Article generation failed: {article.get('error')}")
                results["error"] = "Article generation failed"
                return results
            
            results["article"] = {
                "title": article["title"],
                "word_count": article["word_count"],
                "domain": article["domain"]
            }
            self._stats["total_generated"] += 1
            logger.info(f"✅ Article generated: {article['word_count']} words")
            
            # 3. Generate social variants
            variants = self.content_generator.generate_social_variants(article)
            
            # 4. ALWAYS save locally first (no API needed, always works)
            tags_str = variants.get("devto_tags", "healthtech,ai,programming")
            tags_list = tags_str.split(",") if isinstance(tags_str, str) else ["healthtech", "ai"]
            
            local_result = await self.local.publish(
                article["content"], 
                article["title"], 
                article["domain"],
                tags_list
            )
            results["publications"].append(local_result)
            
            if local_result.get("success"):
                self._stats["locally_saved"] += 1
                self._stats["total_published"] += 1
                self._stats["by_platform"]["local"] = self._stats["by_platform"].get("local", 0) + 1
                logger.info(f"📁 Saved locally: {local_result.get('files', {}).get('jekyll', 'N/A')}")
            
            # 5. Publish to external platforms (if configured)
            publish_tasks = []
            
            if self.config.linkedin_enabled:
                publish_tasks.append(("linkedin", self.linkedin.publish(
                    variants["linkedin"], article["title"]
                )))
            
            if self.config.medium_enabled:
                publish_tasks.append(("medium", self.medium.publish(
                    article["content"], article["title"], tags_list
                )))
            
            if self.config.devto_enabled:
                publish_tasks.append(("devto", self.devto.publish(
                    article["content"], article["title"], tags_list
                )))
            
            # Execute all publish tasks
            for platform, task in publish_tasks:
                try:
                    result = await task
                    results["publications"].append(result)
                    
                    if result.get("success"):
                        self._stats["total_published"] += 1
                        self._stats["by_platform"][platform] = self._stats["by_platform"].get(platform, 0) + 1
                        logger.info(f"✅ Published to {platform}: {result.get('url', 'N/A')}")
                    else:
                        logger.warning(f"⚠️ Failed to publish to {platform}: {result.get('error')}")
                        
                except Exception as e:
                    error_result = {"success": False, "platform": platform, "error": str(e)}
                    results["publications"].append(error_result)
                    logger.error(f"❌ Error publishing to {platform}: {e}")
            
            # 6. Save article metadata
            await self._save_article(article, results)
            
        except Exception as e:
            logger.error(f"❌ Cycle error: {e}")
            results["error"] = str(e)
            self._stats["errors"].append({
                "cycle_id": cycle_id,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        results["completed_at"] = datetime.now(timezone.utc).isoformat()
        return results
    
    async def _save_article(self, article: Dict[str, Any], results: Dict[str, Any]):
        """Save article to local storage"""
        try:
            output_dir = Path(self.config.output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
            
            date_str = datetime.now().strftime("%Y-%m-%d")
            article_id = hashlib.md5(article["title"].encode()).hexdigest()[:8]
            
            # Save markdown
            md_path = output_dir / f"{date_str}_{article_id}.md"
            with open(md_path, "w", encoding="utf-8") as f:
                f.write(f"# {article['title']}\n\n")
                f.write(f"*Domain: {article['domain']} | Generated: {article['generated_at']}*\n\n")
                f.write(article["content"])
            
            # Save metadata
            meta_path = output_dir / f"{date_str}_{article_id}_meta.json"
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2)
            
            logger.info(f"💾 Saved to {md_path}")
            
        except Exception as e:
            logger.error(f"Failed to save article: {e}")
    
    async def run_continuous(self):
        """Run continuous publishing loop"""
        self._running = True
        self._stats["started_at"] = datetime.now(timezone.utc).isoformat()
        
        logger.info("🚀 Starting continuous auto-publisher...")
        logger.info(f"   Target: {self.config.docs_per_day_target} docs/day")
        logger.info(f"   Interval: {self.config.min_interval_seconds}-{self.config.max_interval_seconds}s")
        
        while self._running:
            try:
                # Execute publish cycle
                await self.publish_cycle()
                
                # Random interval for natural distribution
                interval = random.randint(
                    self.config.min_interval_seconds,
                    self.config.max_interval_seconds
                )
                
                logger.info(f"⏳ Next cycle in {interval}s ({interval/60:.1f} min)")
                await asyncio.sleep(interval)
                
            except Exception as e:
                logger.error(f"Continuous loop error: {e}")
                await asyncio.sleep(60)  # Wait 1 min on error
        
        logger.info("🛑 Auto-publisher stopped")
    
    def stop(self):
        """Stop the continuous loop"""
        self._running = False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get publishing statistics"""
        return {
            **self._stats,
            "topics_generated": len(self.topic_generator.generated_topics),
            "recent_topics": self.topic_generator.generated_topics[-10:],
            "is_running": self._running
        }


# ═══════════════════════════════════════════════════════════════════════════════
# FASTAPI INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

# Global instance
_auto_publisher: Optional[AutoPublisher] = None


def get_auto_publisher() -> AutoPublisher:
    """Get or create auto publisher instance"""
    global _auto_publisher
    if _auto_publisher is None:
        _auto_publisher = AutoPublisher()
    return _auto_publisher


async def start_auto_publisher():
    """Start the auto-publisher (call from FastAPI startup)"""
    publisher = get_auto_publisher()
    asyncio.create_task(publisher.run_continuous())


# ═══════════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys
    
    async def main():
        publisher = AutoPublisher()
        
        if len(sys.argv) > 1 and sys.argv[1] == "once":
            # Single cycle
            result = await publisher.publish_cycle()
            print(json.dumps(result, indent=2))
        else:
            # Continuous mode
            await publisher.run_continuous()
    
    asyncio.run(main())
