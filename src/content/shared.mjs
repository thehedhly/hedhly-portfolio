export const shared = {
  origin: 'https://hedhly.com',
  personId: 'https://hedhly.com/#hamza-hedhly',
  image: '/assets/images/my-avatar.png',
  profile: {
    role: { de: 'DevSecOps & Azure Cloud Engineer', en: 'DevSecOps & Azure Cloud Engineer' },
    location: { de: 'Düsseldorf, Deutschland', en: 'Düsseldorf, Germany' },
    locationName: 'Düsseldorf',
    countryCode: 'DE',
    summary: {
      de: 'DevSecOps Engineer in Düsseldorf. Ich baue sichere und automatisierte Cloud-Plattformen mit Azure, Kubernetes, Terraform und Ansible.',
      en: 'DevSecOps Engineer in Düsseldorf, Germany. I build secure, automated cloud platforms with Azure, Kubernetes, Terraform and Ansible.',
    },
    sameAs: ['https://www.linkedin.com/in/hedhly/', 'https://github.com/thehedhly'],
    knowsAbout: [
      'DevSecOps', 'Microsoft Azure', 'Azure Kubernetes Service (AKS)', 'Kubernetes',
      'Infrastructure as Code', 'Terraform', 'Ansible', 'GitLab CI/CD',
      'Argo CD', 'Helm', 'Platform Engineering', 'Observability',
    ],
  },
  technologies: [
    'Microsoft Azure', 'Kubernetes', 'Terraform', 'Ansible', 'Argo CD', 'GitLab CI/CD',
  ],
  expertise: [
    {
      id: 'azure', badge: 'AZ',
      title: { de: 'Azure Cloud & Plattformen', en: 'Azure Cloud & Platforms' },
      summary: {
        de: 'Sichere Cloud-Architekturen, AKS und hybride Infrastrukturen für produktive Workloads.',
        en: 'Secure cloud architectures, AKS and hybrid infrastructure for production workloads.',
      },
      tags: ['Azure', 'AKS', 'Cloud operations'], section: 'platform',
    },
    {
      id: 'iac', badge: '{}',
      title: { de: 'Infrastructure as Code', en: 'Infrastructure as Code' },
      summary: {
        de: 'Reproduzierbare Umgebungen und Konfigurationsmanagement: automatisiert, versioniert und nachvollziehbar.',
        en: 'Reproducible environments and configuration management: automated, versioned and auditable.',
      },
      tags: ['Terraform', 'Ansible', 'Kubespray'], section: 'platform',
    },
    {
      id: 'kubernetes', badge: 'K8s',
      title: { de: 'Container & Kubernetes', en: 'Containers & Kubernetes' },
      summary: {
        de: 'Sicherer Containerbetrieb, Orchestrierung und deklarative Deployments für moderne Anwendungen.',
        en: 'Secure container operations, orchestration and declarative deployments for modern applications.',
      },
      tags: ['Kubernetes', 'Docker', 'Helm', 'Kustomize'], section: 'platform',
    },
    {
      id: 'gitops', badge: 'CI',
      title: { de: 'CI/CD & GitOps', en: 'CI/CD & GitOps' },
      summary: {
        de: 'Nachvollziehbare Delivery-Pipelines mit automatisierten Qualitätsprüfungen und Rollouts.',
        en: 'Traceable delivery pipelines with automated quality gates and rollouts.',
      },
      tags: ['GitLab CI', 'GitHub Actions', 'Jenkins', 'Argo CD'], section: 'automation',
    },
    {
      id: 'observability', badge: 'OBS',
      title: { de: 'Observability', en: 'Observability' },
      summary: {
        de: 'Monitoring, Logging und klare Betriebssignale für schnellere Analysen und stabile Systeme.',
        en: 'Monitoring, logging and clear operational signals for faster analysis and stable systems.',
      },
      tags: ['Prometheus', 'Grafana', 'Loki', 'ELK'], section: 'automation',
    },
    {
      id: 'software', badge: 'DEV',
      title: { de: 'Software Engineering', en: 'Software Engineering' },
      summary: {
        de: 'Entwicklungserfahrung, die Infrastrukturentscheidungen näher an die Anforderungen der Teams bringt.',
        en: 'Development experience that keeps infrastructure decisions close to team requirements.',
      },
      tags: ['Java', 'Python', 'Go', 'Bash'], section: 'automation',
    },
  ],
  experience: [
    {
      start: '2021-05', end: null, role: { de: 'Consultant', en: 'Consultant' },
      focus: { de: 'Cloud & Platform Engineering', en: 'Cloud & Platform Engineering' },
      details: {
        de: 'Azure-Infrastruktur mit Terraform, AKS-Plattformen mit Helm und Argo CD sowie Automatisierung mit Ansible und GitLab CI/CD.',
        en: 'Azure infrastructure with Terraform, AKS platforms with Helm and Argo CD, plus automation with Ansible and GitLab CI/CD.',
      },
    },
    {
      start: '2019-11', end: '2021-04', role: { de: 'DevOps Engineer', en: 'DevOps Engineer' },
      focus: { de: 'DevOps & Cloud-Automatisierung', en: 'DevOps & Cloud Automation' },
      details: {
        de: 'Azure Infrastructure as Code, Ansible-Konfigurationsmanagement, Jenkins-Pipelines und Bash-Automatisierung für Cloud-Anwendungen.',
        en: 'Azure Infrastructure as Code, Ansible configuration management, Jenkins pipelines and Bash automation for cloud applications.',
      },
    },
    {
      start: '2017-03', end: '2019-10', role: { de: 'Software Engineer', en: 'Software Engineer' },
      focus: { de: 'Backend- & Plattformentwicklung', en: 'Backend & Platform Development' },
      details: {
        de: 'Entwicklung einer regulierten Pharma-Plattform mit Java, Spring, REST und PostgreSQL – inklusive Softwarearchitektur.',
        en: 'Development of a regulated pharmaceutical platform using Java, Spring, REST and PostgreSQL, including software architecture.',
      },
    },
  ],
  outcomes: [
    {
      id: 'azure', title: { de: 'Azure & Terraform', en: 'Azure & Terraform' },
      details: {
        de: 'Azure-Infrastrukturen mit Terraform und Terraform Enterprise standardisiert und automatisiert bereitgestellt. Wiederverwendbare IaC-Module und geregelte Reviews schaffen transparente, sichere Änderungen.',
        en: 'Standardized and automated Azure infrastructure delivery with Terraform and Terraform Enterprise. Reusable IaC modules and governed reviews make changes traceable and secure.',
      },
      section: 'platform',
    },
    {
      id: 'gitops', title: { de: 'AKS & GitOps', en: 'AKS & GitOps' },
      details: {
        de: 'AKS-Plattformen mit Helm und Argo CD für durchgängige GitOps-Prozesse aufgebaut. Teams erhalten nachvollziehbare Releases, konsistente Deployments und klare Rollback-Pfade.',
        en: 'Built AKS platforms with Helm and Argo CD for end-to-end GitOps workflows. Teams gain traceable releases, consistent deployments and clear rollback paths.',
      },
      section: 'platform',
    },
    {
      id: 'delivery', title: { de: 'CI/CD & Ansible', en: 'CI/CD & Ansible' },
      details: {
        de: 'GitLab-CI/CD-Pipelines und Ansible-Automatisierung entwickelt, um Build-, Prüf- und Bereitstellungsprozesse zu standardisieren, manuelle Arbeit zu reduzieren und sichere Releases zu beschleunigen.',
        en: 'Designed GitLab CI/CD pipelines and Ansible automation to standardize build, validation and deployment workflows, reduce manual work and speed up secure releases.',
      },
      section: 'automation',
    },
  ],
  credentials: [
    {
      id: 'cks', name: 'Certified Kubernetes Security Specialist', provider: 'Linux Foundation',
      logo: '/assets/images/logo-kubernetes.svg', url: 'https://kubernetes.io/',
    },
    {
      id: 'cka', name: 'Certified Kubernetes Administrator', provider: 'Linux Foundation',
      logo: '/assets/images/logo-kubernetes.svg', url: 'https://kubernetes.io/',
    },
    {
      id: 'terraform', name: 'Terraform Associate (003)', provider: 'HashiCorp',
      logo: '/assets/images/logo-terraform.svg', url: 'https://www.terraform.io/',
    },
    {
      id: 'aws', name: 'AWS Certified Cloud Practitioner', provider: 'Amazon Web Services',
      logo: '/assets/images/logo-aws.png', url: 'https://aws.amazon.com/certification/',
    },
  ],
  social: [
    { id: 'linkedin', name: 'LinkedIn', href: 'https://www.linkedin.com/in/hedhly/' },
    { id: 'github', name: 'GitHub / thehedhly', href: 'https://github.com/thehedhly' },
  ],
};
