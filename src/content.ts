// Content (source: Oct 9 two-page resume). Nothing here is invented: projects carry only
// resume features and outcomes list only resume-stated results.
// Exception: project technologies, features and outcomes were checked against the linked repositories
// (manifests, source and git history, 2026-11-02). Anything they do not support is left out, so some
// project technologies and test or CI claims on the resume are not repeated here.

export const LINKS = {
  email: 'mailto:akshatbhardwaj0801@gmail.com',
  emailLabel: 'akshatbhardwaj0801@gmail.com',
  github: 'https://github.com/AKSHAT-BHARDWAJ01',
  linkedin: 'https://www.linkedin.com/in/akshat-bhardwaj-84bb52271/',
  doi: 'https://doi.org/10.1109/ICoECIT68303.2026.11497893',
  // Two-page public resume (no phone number); source in resume-src/resume.html.
  resume: `${import.meta.env.BASE_URL}resume/Akshat_Bhardwaj_Resume.pdf`,
  resumeFile: 'Akshat_Bhardwaj_Resume.pdf',
}

// Project source repositories, by project slug. Each URL is the one linked from the two-page resume
// and was confirmed public on GitHub (2026-10-31). Leave a slug out to hide its "View source" link.
// `fork` is the upstream repository when the linked repository is a fork of it, and is shown as such.
// `alias` is the name the repository itself uses for the project, when it differs from the name here.
export type Repo = { url: string; fork?: string; alias?: string }
export const REPOS: Record<string, Repo> = {
  'healthcare-ai': { url: 'https://github.com/AKSHAT-BHARDWAJ01/HealthCare.Ai', fork: 'murtuza777/HealthCare.Ai' },
  taskflow: { url: 'https://github.com/AKSHAT-BHARDWAJ01/task-management-app' },
  'burry-ai': { url: 'https://github.com/AKSHAT-BHARDWAJ01/BurryAI', fork: 'murtuza777/BurryAI' },
  webopedia: { url: 'https://github.com/AKSHAT-BHARDWAJ01/Wikipedia_HackOmania', fork: 'murtuza777/Wikipedia_HackOmania', alias: 'Wajipedia' },
}

export const SECTIONS = ['about', 'experience', 'work', 'process', 'research', 'toolkit', 'contact'] as const

export type Project = {
  slug: string
  name: string
  kind: string
  desc: string
  tags: string[]
  features: string[]
  outcomes: string[]
  marker?: string
  link?: { label: string; href: string }
}

export const PROJECTS: Project[] = [
  {
    slug: 'healthcare-ai', name: 'Healthcare.AI', kind: 'AI Health Prediction Platform', marker: 'IEEE research publication · 2026',
    desc: 'An integrated healthcare AI platform designed to bring patient information, medical reports, and AI-assisted health insights into one experience.',
    tags: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    features: ['LLM-assisted symptom analysis and preliminary health insights.', 'Secure medical report upload and storage, with AI-assisted summaries.', 'QR-code-based sharing of reports.', 'A unified patient profile containing reports, diagnoses, medications, and AI observations.', 'Caregiver support, emergency contacts, health alerts, and secure report sharing.'],
    outcomes: ['Published at the 2026 IEEE International Conference on Emerging Computing and Intelligent Technologies (ICoECIT), Hyderabad, pp. 1–5.', 'Presented at ICCIDSDT 2026, MANUU, Hyderabad (Jan 2026) — a presentation, separate from the publication.'],
    link: { label: 'Read the IEEE paper ↗', href: LINKS.doi },
  },
  {
    slug: 'taskflow', name: 'TaskFlow', kind: 'Full-Stack Task Management Platform',
    desc: 'A full-stack productivity application built around task organization, secure access, progress tracking, and an analytics-driven workflow.',
    tags: ['React', 'FastAPI', 'Supabase', 'PostgreSQL', 'JWT', 'Docker', 'Vercel'],
    features: ['JWT authentication and bcrypt password hashing.', 'JWT access tokens for session handling.', 'Full create, read, update, and delete task workflows.', 'Status updates and priority-based filtering.', 'Search across titles, descriptions, categories, status, and priority.', 'Analytics with completion-rate charts and task-status distributions.', 'Configured for Vercel deployment with Supabase PostgreSQL.', 'Automated tests for the reminder engine, notification access and toast policy (Python unittest and the Node test runner).'],
    outcomes: ['Automated tests for the reminder engine, notification access and toast policy.', 'Configured for Vercel with Supabase PostgreSQL.'],
  },
  {
    slug: 'burry-ai', name: 'Burry AI', kind: 'Personal Finance Advisor',
    desc: 'An AI-oriented personal finance application for understanding spending patterns and exploring more informed financial decisions.',
    tags: ['Next.js', 'React', 'TypeScript', 'Cloudflare Workers', 'Cloudflare D1'],
    features: ['Personalized recommendations based on spending trends and financial goals.', 'Income and expense tracking with data visualizations.', 'Cost-optimization insights to identify avoidable expenses.', 'Trend analysis, category breakdowns, and income-versus-spending comparisons.'],
    outcomes: [],
  },
  {
    slug: 'webopedia', name: 'Webopedia', kind: 'Accessible Wikipedia Clone',
    desc: 'An accessible information-discovery experience focused on making articles and knowledge more approachable.',
    tags: ['HTML', 'JavaScript', 'Wikipedia API', 'Web Speech API', 'CSS'],
    features: ['Dynamic article search and content rendering through the Wikipedia API.', 'Live article and image retrieval.', 'Assistive navigation using a floating action button.', 'Text-to-speech for audio-based content consumption.', 'Built with Team Blaze at the Hack-O-Mania Hackathon, 2023.'],
    outcomes: ['1st Place at Hack-O-Mania (GDSC and DSS, VJIT), Nov 2023 — built with Team Blaze in 24 hours.'],
  },
]

export const CAPABILITIES = [
  ['01', 'Platform & Engineering', 'Production mobile systems, backend migration, API integration, version control, CI/CD, release engineering.'],
  ['02', 'Full-Stack Products', 'Task management, authentication, database-backed apps, analytics dashboards, interactive UX.'],
  ['03', 'AI & Research', 'RAG systems, NLP, Hugging Face, model fine-tuning, local inference, applied healthcare AI.'],
]

// The four stages of how I work. Each one restates a resume bullet; the evidence line is the bullet itself.
export const PROCESS = [
  ['Understand', 'Read the system before changing it.', 'Traced a branch divergence of 126+ commits across nine core screens before reconciling it, with no data or feature loss.'],
  ['Design', 'Translate intent into components.', 'Turned Figma designs into React Native components for task management, workspace hierarchies, Insights drill-downs and document previews.'],
  ['Build', 'Change it while it keeps running.', 'Moved a production app from Firebase to PostgreSQL-backed REST APIs across 30+ files while maintaining production uptime.'],
  ['Validate', 'Prove it before it ships.', 'Functional, regression, lint, type-check and real-device validation on production hotfixes, from an isolated Git worktree.'],
]

export const JULLEY = [
  ['Backend migration', 'Contributed to migrating a production React Native/Expo application from Firebase to PostgreSQL-backed REST APIs across 30+ files while maintaining production uptime.'],
  ['Version control recovery', 'Reconciled a branch divergence involving 126+ commits across nine core application screens, restoring a clean branch baseline with no data or feature loss.'],
  ['QA & hotfixes', 'Diagnosed and fixed production UI issues, including touch-interception and task-creation gating, using an isolated Git worktree with functional, regression, lint, type-check, and real-device validation.'],
  ['Release engineering', 'Audited GitHub Actions and EAS configuration; implemented a Firebase Remote Config force-update mechanism with version comparison and fail-open error handling.'],
  ['Mobile features', 'Translated Figma designs into React Native components for task management, workspace hierarchies, Insights drill-downs, biometric authentication, and document previews.'],
]
export const JULLEY_STACK = ['React Native', 'Expo', 'PostgreSQL', 'REST APIs', 'Firebase Remote Config', 'GitHub Actions', 'EAS']

export const INTERNSHIPS = [
  { org: 'Swecha Telangana', role: 'AI Research Intern', meta: 'IIIT Hyderabad (Hybrid) · May 2025 – Jun 2025', points: ['Built an open-source AI assistant with Hugging Face supporting 50+ complex query types through prompt engineering.', 'Designed a RAG system with custom knowledge bases, reducing information retrieval time by 40%.', 'Deployed local LLM inference via Ollama and PocketPal, enabling offline execution of 7+ language models.', 'Fine-tuned transformer models for specialized NLP tasks, improving accuracy by 15%.'] },
  { org: 'Agnirva.com Space Community', role: 'AI Research Intern', meta: 'Remote · Jul 2025', points: ['Built LLM-based AI assistants using generative AI techniques for design, audio, and video generation.', 'Analyzed AI applications in climate research and satellite data processing.', 'Explored generative AI workflows and prompt engineering.'] },
]

export const PUBLICATION = {
  title: 'Healthcare AI: An Integrated AI Platform for Proactive Patient Care and Medical Data Management',
  authors: 'A. Bhardwaj, M. M. Ali, M. S. U. Tayyab, M. W. Uddin Taher, and P. K. Yadala',
  venue: '2026 IEEE International Conference on Emerging Computing and Intelligent Technologies (ICoECIT), Hyderabad, India, pp. 1–5.',
  doi: '10.1109/ICoECIT68303.2026.11497893',
  record: [['Type', 'Conference paper'], ['Year', '2026'], ['Venue', 'ICoECIT · Hyderabad'], ['Pages', '1–5'], ['Authors', '5']],
}

export const HONORS = [
  ['Paper presentation · Jan 2026', 'Healthcare.AI: An Integrated Artificial Intelligence Platform for Proactive Patient Care', 'Presented at ICCIDSDT 2026, MANUU, Hyderabad. A presentation, separate from the publication above.'],
  ['Hackathon · Nov 2023', '1st Place: Hack-O-Mania', 'Organized by GDSC and DSS, VJIT. Built Webopedia with Team Blaze in 24 hours.'],
  ['Certification · Feb 2026', 'Introduction to Generative AI Studio', 'Simplilearn'],
]

export const TOOLKIT = [
  ['Languages', 'Python · JavaScript · TypeScript · SQL · HTML · CSS'],
  ['Mobile & Frontend', 'React Native · Expo · Expo Router · React'],
  ['Backend & DevOps', 'FastAPI · PostgreSQL · Firebase · REST APIs · JWT · Docker · Vercel · GitHub Actions · EAS Build · EAS Update'],
  ['AI/ML & Data', 'Hugging Face · PyTorch · Scikit-Learn · Pandas · NumPy · RAG · LLM fine-tuning · Prompt engineering · NLP · Generative AI · Ollama'],
  ['Testing & Tools', 'Git · pytest · Vitest · Functional testing · Regression testing · Figma design translation'],
]
