'use strict';

const translations = {
  de: {
    skip: 'Zum Inhalt springen', navExpertise: 'Expertise', navExperience: 'Erfahrung', navCertifications: 'Zertifizierungen', navContact: 'Kontakt',
    heroLine1: 'Cloud-Plattformen, die', heroAccent: 'sicher skalieren.',
    heroLead: 'Ich entwickle automatisierte, belastbare Infrastruktur mit Azure, Kubernetes, Terraform und Ansible - damit Teams schneller und zuverlässiger liefern.',
    heroCta: 'Zusammenarbeit anfragen', heroSecondary: 'Erfahrung ansehen', role: 'DevSecOps & Cloud Engineering',
    expertiseKicker: 'Expertise', expertiseTitle: 'Von Infrastruktur bis Deployment.', expertiseIntro: 'Ich verbinde Cloud Engineering, Automatisierung und Security zu Plattformen, auf die Entwicklungsteams sich verlassen können.',
    capAzureTitle: 'Azure Cloud & Plattformen', capAzureText: 'Sichere Cloud-Architekturen, AKS und hybride Infrastrukturen für produktive Workloads.',
    capIacTitle: 'Infrastructure as Code', capIacText: 'Reproduzierbare Umgebungen und Configuration Management - automatisiert, versioniert und auditierbar.',
    capK8sTitle: 'Container & Kubernetes', capK8sText: 'Sicherer Containerbetrieb, Orchestrierung und deklarative Deployments für moderne Anwendungen.',
    capCicdTitle: 'CI/CD & GitOps', capCicdText: 'Schnelle, nachvollziehbare Delivery Pipelines mit automatisierten Quality Gates und Rollouts.',
    capObsTitle: 'Observability', capObsText: 'Monitoring, Logging und klare Betriebssignale für schnellere Analyse und stabile Systeme.',
    capDevTitle: 'Software Engineering', capDevText: 'Entwicklungserfahrung, die Infrastrukturentscheidungen näher an die Anforderungen der Teams bringt.',
    experienceKicker: 'Erfahrung', experienceTitle: 'Technische Tiefe. Pragmatische Umsetzung.', experienceIntro: 'Vom Software Engineering über DevOps bis zur IT-Beratung: ein Profil, das Entwicklung und Betrieb zusammenbringt.',
    principle: 'Mein Grundsatz: Automatisierung ist dann gut, wenn sie Komplexität reduziert und Teams echte Geschwindigkeit gibt.', present: 'Heute', consultantFocus: 'Cloud & Platform Engineering', devopsFocus: 'DevOps & Cloud-Automatisierung', softwareFocus: 'Backend & Plattformentwicklung',
    consultantText: 'Azure-Infrastruktur mit Terraform, AKS-Plattformen mit Helm und Argo CD sowie Automatisierung mit Ansible und GitLab CI/CD.', devopsText: 'Azure Infrastructure as Code, Ansible-Konfigurationsmanagement, Jenkins-Pipelines und Bash-Automatisierung für Cloud-Anwendungen.', softwareText: 'Entwicklung einer regulierten Pharma-Plattform mit Java, Spring, REST und PostgreSQL - inklusive Softwarearchitektur.',
    certKicker: 'Zertifizierungen', certTitle: 'Expertise, extern bestätigt.', certIntro: 'Zertifizierungen in Kubernetes Security, Administration, Terraform und AWS ergänzen die praktische Projekterfahrung.',
    contactKicker: 'Kontakt', contactTitle: 'Bereit, Ihre Plattform zuverlässiger zu machen?', contactText: 'Lassen Sie uns über Azure, Kubernetes, Automatisierung oder Ihre nächste DevOps-Herausforderung sprechen.', linkedinCta: 'Auf LinkedIn kontaktieren', footer: 'Entwickelt für sichere Systeme.', backTop: 'Nach oben'
  },
  en: {
    skip: 'Skip to content', navExpertise: 'Expertise', navExperience: 'Experience', navCertifications: 'Certifications', navContact: 'Contact',
    heroLine1: 'Cloud platforms built to', heroAccent: 'scale securely.',
    heroLead: 'I build automated, resilient infrastructure with Azure, Kubernetes, Terraform and Ansible - helping teams ship faster and more reliably.',
    heroCta: 'Start a conversation', heroSecondary: 'View experience', role: 'DevSecOps & Cloud Engineering',
    expertiseKicker: 'Expertise', expertiseTitle: 'From infrastructure to deployment.', expertiseIntro: 'I bring cloud engineering, automation and security together in platforms development teams can rely on.',
    capAzureTitle: 'Azure Cloud & Platforms', capAzureText: 'Secure cloud architectures, AKS and hybrid infrastructure for production workloads.',
    capIacTitle: 'Infrastructure as Code', capIacText: 'Reproducible environments and configuration management - automated, versioned and auditable.',
    capK8sTitle: 'Containers & Kubernetes', capK8sText: 'Secure container operations, orchestration and declarative deployments for modern applications.',
    capCicdTitle: 'CI/CD & GitOps', capCicdText: 'Fast, traceable delivery pipelines with automated quality gates and rollouts.',
    capObsTitle: 'Observability', capObsText: 'Monitoring, logging and clear operational signals for faster analysis and stable systems.',
    capDevTitle: 'Software Engineering', capDevText: 'Development experience that keeps infrastructure decisions close to team requirements.',
    experienceKicker: 'Experience', experienceTitle: 'Technical depth. Pragmatic delivery.', experienceIntro: 'From software engineering to DevOps and IT consulting: a profile that connects development and operations.',
    principle: 'My principle: automation works when it reduces complexity and gives teams meaningful speed.', present: 'Present', consultantFocus: 'Cloud & Platform Engineering', devopsFocus: 'DevOps & Cloud Automation', softwareFocus: 'Backend & Platform Development',
    consultantText: 'Azure infrastructure with Terraform, AKS platforms with Helm and Argo CD, plus automation using Ansible and GitLab CI/CD.', devopsText: 'Azure Infrastructure as Code, Ansible configuration management, Jenkins pipelines and Bash automation for cloud applications.', softwareText: 'Development of a regulated pharmaceutical platform using Java, Spring, REST and PostgreSQL - including software architecture.',
    certKicker: 'Certifications', certTitle: 'Expertise, independently validated.', certIntro: 'Certifications in Kubernetes security, administration, Terraform and Azure complement hands-on project experience.',
    contactKicker: 'Contact', contactTitle: 'Ready to make your platform more reliable?', contactText: 'Let’s talk about Azure, Kubernetes, automation or your next DevOps challenge.', linkedinCta: 'Contact me on LinkedIn', footer: 'Engineered for reliable systems.', backTop: 'Back to top'
  }
};

const langButtons = document.querySelectorAll('[data-lang]');
const translatable = document.querySelectorAll('[data-i18n]');

function setLanguage(lang) {
  document.documentElement.lang = lang;
  translatable.forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[lang][key]) element.textContent = translations[lang][key];
  });
  langButtons.forEach((button) => {
    const selected = button.dataset.lang === lang;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.title = lang === 'de' ? 'Hamza Hedhly - DevSecOps & Azure Engineer' : 'Hamza Hedhly - DevSecOps & Azure Engineer';
}

langButtons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.getElementById('year').textContent = new Date().getFullYear();
setLanguage('de');
