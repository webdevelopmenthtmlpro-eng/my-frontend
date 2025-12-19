// Ensure translations object exists
window.translations = window.translations || {};

// Utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

// Translations object - should be present or loaded before applyTranslations uses it
window.translations = window.translations || {};

// Comprehensive translation keys for all visible text on the page
const commonKeys = {
  home: 'Home',
  gallery: 'Gallery',
  services: 'Services',
  track: 'Track',
  login: 'Login',
  register: 'Register',
  welcome: 'SwiftDelivery Airfreight Logistics',
  intro: 'Global cargo solutions with speed, safety, and precision.',
  getStarted: 'Get Started',
  galleryTitle: 'Fleet & Facilities',
  servicesTitle: 'Our Services',
  service1: 'Airfreight Express',
  service1Desc: 'Priority cargo delivery with guaranteed timelines, ensuring your urgent shipments reach their destination quickly and safely.',
  service2: 'Global Warehousing',
  service2Desc: 'Secure storage solutions across strategically located international hubs, enabling efficient inventory management and quick distribution.',
  service3: 'Customs Clearance',
  service3Desc: 'Expert handling of documentation and border processing to expedite shipment clearance, minimizing delays and compliance risks.',
  service4: 'Temperature-Controlled Cargo',
  service4Desc: 'Specialized transport and storage for pharmaceuticals, perishables, and sensitive goods requiring strict temperature regulation.',
  service5: 'Dangerous Goods Transport',
  service5Desc: 'Certified and compliant handling of hazardous materials with stringent safety standards and legal requirements.',
  bookingTitle: 'Booking Dashboard',
  bookingNamePlaceholder: 'Full Name',
  bookingEmailPlaceholder: 'Email Address',
  bookingMessagePlaceholder: 'Booking Details (date, cargo type, destination)',
  bookingSubmitButton: 'Submit Booking',
  testimonialsTitle: 'Customer Testimonials',
  testimonial1Text: '"SwiftDelivery got our medical supplies across borders in record time. Highly recommended!"',
  testimonial1Author: '- Dr. Amina Yusuf',
  testimonial2Text: '"Their tracking system is top-notch. I knew exactly where my shipment was at all times."',
  testimonial2Author: '- James Okoro',
  testimonial3Text: '"Professional, fast, and reliable. SwiftDelivery is our go-to logistics partner."',
  testimonial3Author: '- GlobalTech Ltd.',
  contactTitle: 'Contact Us',
  submitButton: 'Submit Form',
  loginTitle: 'Client Login',
  loginButton: 'Login',
  registerTitle: 'New Client Registration',
  registerButton: 'Register',
  registerUsernamePlaceholder: 'Username',
  registerPasswordPlaceholder: 'Password',
  trackTitle: 'Pickup & Delivery Tracking',
  trackButton: 'Track Shipment',
  faqTitle: 'Frequently Asked Questions',
  faq1Q: 'How fast is airfreight delivery?',
  faq1A: 'Most airfreight shipments arrive within 24–48 hours, depending on the destination, flight availability, and customs processing. We prioritize speed and reliability, ensuring your cargo reaches its destination as quickly as possible. Expedited options are available for urgent shipments.',
  faq2Q: 'Do you handle international customs?',
  faq2A: 'Yes, we provide comprehensive customs clearance services for all international shipments. Our experienced team navigates complex regulations and documentation to ensure smooth border transitions, minimizing delays and avoiding compliance issues.',
  faq3Q: 'Can I track my cargo in real time?',
  faq3A: 'Absolutely. Our advanced tracking system offers live updates, GPS location data, and status notifications throughout the journey. You’ll have full visibility from pickup to final delivery, accessible via our online portal or mobile app.',
  faq4Q: 'Do you offer temperature-controlled shipping?',
  faq4A: 'Yes, we specialize in cold-chain logistics tailored for sensitive goods such as pharmaceuticals, vaccines, fresh produce, and other perishables. Our temperature-controlled containers and monitoring systems maintain optimal conditions throughout transit.',
  faq5Q: 'Is weekend delivery available?',
  faq5A: 'Weekend delivery is available in select regions and for eligible service tiers. To confirm availability for your shipment, please contact our support team. We strive to accommodate your schedule with flexible delivery options.',
  liveChatTitle: 'Live Chat Support',
  liveChatNamePlaceholder: 'Your Name',
  liveChatEmailPlaceholder: 'Your Email',
  liveChatMessagePlaceholder: 'Your Message',
  chatbotTitle: 'SwiftDelivery Bot',
  chatbotGreeting: 'Hi there! How can I help you today?',
  chatMessagePlaceholder: 'Type your message...',
  sendButton: 'Send',
  newsletterTitle: 'Stay Updated',
  newsletterText: 'Subscribe to our newsletter for airfreight tips, updates, and exclusive offers.',
  emailLabel: 'Email',
  subscribeButton: 'Subscribe',
  followUs: 'Follow Us',
  company: 'Company',
  about: 'About Us',
  helpCenter: 'Help Center',
  support: 'Support',
  legal: 'Legal',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  footerNote: '© 2025 SwiftDelivery. All rights reserved.'
};

// English (base)
window.translations.en = window.translations.en || Object.assign({}, commonKeys);

// French
window.translations.fr = window.translations.fr || {
  home: 'Accueil',
  gallery: 'Galerie',
  services: 'Services',
  track: 'Suivi',
  login: 'Connexion',
  register: "S'inscrire",
  welcome: 'SwiftDelivery - Fret aérien',
  intro: 'Solutions de fret mondiales rapides, sûres et précises.',
  getStarted: 'Commencer',
  galleryTitle: 'Flotte & Installations',
  servicesTitle: 'Nos Services',
  service1: 'Express aérien',
  service1Desc: "Livraison prioritaire de marchandises avec délais garantis, pour que vos envois urgents arrivent rapidement et en toute sécurité.",
  service2: 'Entrepôts mondiaux',
  service2Desc: 'Solutions de stockage sécurisées dans des hubs internationaux stratégiques, permettant une gestion efficace des stocks et une distribution rapide.',
  service3: 'Dédouanement',
  service3Desc: "Gestion experte des documents et du traitement frontalier pour accélérer le dédouanement des envois, minimisant les retards et les risques de non-conformité.",
  service4: 'Transport sous température contrôlée',
  service4Desc: 'Transport et stockage spécialisés pour produits pharmaceutiques, périssables et marchandises sensibles nécessitant une régulation stricte de la température.',
  service5: 'Transport de matières dangereuses',
  service5Desc: 'Manutention certifiée et conforme des matières dangereuses avec des normes de sécurité strictes et le respect des exigences légales.',
  bookingTitle: 'Tableau de réservation',
  bookingNamePlaceholder: 'Nom complet',
  bookingEmailPlaceholder: 'Adresse e-mail',
  bookingMessagePlaceholder: 'Détails de la réservation (date, type de cargaison, destination)',
  bookingSubmitButton: 'Envoyer la réservation',
  testimonialsTitle: 'Témoignages clients',
  testimonial1Text: '"SwiftDelivery a acheminé nos fournitures médicales à travers les frontières en un temps record. Fortement recommandé !"',
  testimonial1Author: '- Dr. Amina Yusuf',
  testimonial2Text: '"Leur système de suivi est au top. Je savais exactement où se trouvait mon envoi à tout moment."',
  testimonial2Author: '- James Okoro',
  testimonial3Text: '"Professionnel, rapide et fiable. SwiftDelivery est notre partenaire logistique de référence."',
  testimonial3Author: '- GlobalTech Ltd.',
  contactTitle: 'Contactez-nous',
  submitButton: 'Envoyer',
  loginTitle: 'Connexion client',
  loginButton: 'Se connecter',
  registerTitle: 'Nouvel enregistrement client',
  registerButton: "S'inscrire",
  registerUsernamePlaceholder: 'Nom d\'utilisateur',
  registerPasswordPlaceholder: 'Mot de passe',
  trackTitle: 'Suivi de collecte et de livraison',
  trackButton: 'Suivre l\'envoi',
  faqTitle: 'Foire aux questions',
  faq1Q: 'À quelle vitesse la livraison aérienne est-elle effectuée ?',
  faq1A: 'La plupart des expéditions aériennes arrivent en 24 à 48 heures, selon la destination, la disponibilité des vols et le traitement douanier. Nous privilégions la rapidité et la fiabilité.',
  faq2Q: 'Gérez-vous les douanes internationales ?',
  faq2A: 'Oui, nous fournissons des services complets de dédouanement pour toutes les expéditions internationales.',
  faq3Q: 'Puis-je suivre ma cargaison en temps réel ?',
  faq3A: 'Absolument. Notre système de suivi fournit des mises à jour en direct, des données GPS et des notifications de statut tout au long du trajet.',
  faq4Q: 'Offrez-vous un transport sous température contrôlée ?',
  faq4A: 'Oui, nous sommes spécialisés dans la chaîne du froid pour les produits sensibles.',
  faq5Q: 'La livraison le week-end est-elle disponible ?',
  faq5A: 'La livraison le week-end est disponible dans certaines régions et pour certains niveaux de service.',
  liveChatTitle: 'Assistance en direct',
  liveChatNamePlaceholder: 'Votre nom',
  liveChatEmailPlaceholder: 'Votre e-mail',
  liveChatMessagePlaceholder: 'Votre message',
  chatbotTitle: 'Bot SwiftDelivery',
  chatbotGreeting: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
  chatMessagePlaceholder: 'Tapez votre message...',
  sendButton: 'Envoyer',
  newsletterTitle: 'Restez informé',
  newsletterText: 'Abonnez-vous à notre newsletter pour des conseils et des offres exclusives.',
  emailLabel: 'E-mail',
  subscribeButton: 'S\'abonner',
  followUs: 'Suivez-nous',
  company: 'Entreprise',
  about: 'À propos',
  helpCenter: 'Centre d\'aide',
  support: 'Support',
  legal: 'Mentions légales',
  privacy: 'Politique de confidentialité',
  terms: 'Conditions d\'utilisation',
  footerNote: '© 2025 SwiftDelivery. Tous droits réservés.'
};

// Spanish
window.translations.es = window.translations.es || {
  home: 'Inicio',
  gallery: 'Galería',
  services: 'Servicios',
  track: 'Seguimiento',
  login: 'Iniciar sesión',
  register: 'Registrarse',
  welcome: 'SwiftDelivery Transporte Aéreo',
  intro: 'Soluciones de carga globales con rapidez, seguridad y precisión.',
  getStarted: 'Comenzar',
  galleryTitle: 'Flota y Instalaciones',
  servicesTitle: 'Nuestros Servicios',
  service1: 'Transporte aéreo exprés',
  service1Desc: 'Entrega prioritaria de carga con plazos garantizados para que sus envíos urgentes lleguen de forma rápida y segura.',
  service2: 'Almacenamiento global',
  service2Desc: 'Soluciones de almacenamiento seguras en hubs internacionales estratégicos que permiten una gestión eficiente del inventario y una distribución rápida.',
  service3: 'Despacho de aduanas',
  service3Desc: 'Gestión experta de documentación y procesos fronterizos para agilizar el despacho de aduanas, minimizando retrasos y riesgos de incumplimiento.',
  service4: 'Carga con control de temperatura',
  service4Desc: 'Transporte y almacenamiento especializados para productos farmacéuticos, perecederos y mercancías sensibles que requieren control de temperatura.',
  service5: 'Transporte de mercancías peligrosas',
  service5Desc: 'Manipulación certificada y conforme de materiales peligrosos con normas de seguridad estrictas y requisitos legales.',
  bookingTitle: 'Panel de reservas',
  bookingNamePlaceholder: 'Nombre completo',
  bookingEmailPlaceholder: 'Dirección de correo',
  bookingMessagePlaceholder: 'Detalles de la reserva (fecha, tipo de carga, destino)',
  bookingSubmitButton: 'Enviar reserva',
  testimonialsTitle: 'Testimonios de clientes',
  testimonial1Text: '"SwiftDelivery transportó nuestras suministros médicas a través de fronteras en tiempo récord. ¡Muy recomendable!"',
  testimonial1Author: '- Dr. Amina Yusuf',
  testimonial2Text: '"Su sistema de seguimiento es excepcional. Sabía exactamente dónde estaba mi envío en todo momento."',
  testimonial2Author: '- James Okoro',
  testimonial3Text: '"Profesional, rápido y fiable. SwiftDelivery es nuestro socio logístico preferido."',
  testimonial3Author: '- GlobalTech Ltd.',
  contactTitle: 'Contáctenos',
  submitButton: 'Enviar',
  loginTitle: 'Inicio de sesión',
  loginButton: 'Entrar',
  registerTitle: 'Registro de nuevo cliente',
  registerButton: 'Registrarse',
  registerUsernamePlaceholder: 'Nombre de usuario',
  registerPasswordPlaceholder: 'Contraseña',
  trackTitle: 'Seguimiento de recogida y entrega',
  trackButton: 'Rastrear envío',
  faqTitle: 'Preguntas frecuentes',
  faq1Q: '¿Qué tan rápida es la entrega aérea?',
  faq1A: 'La mayoría de los envíos aéreos llegan en 24–48 horas, dependiendo del destino, la disponibilidad de vuelos y el procesamiento aduanero.',
  faq2Q: '¿Manejan aduanas internacionales?',
  faq2A: 'Sí, ofrecemos servicios integrales de despacho aduanero para todos los envíos internacionales.',
  faq3Q: '¿Puedo rastrear mi carga en tiempo real?',
  faq3A: 'Sí. Nuestro sistema ofrece actualizaciones en vivo, datos GPS y notificaciones de estado durante todo el trayecto.',
  faq4Q: '¿Ofrecen envío con control de temperatura?',
  faq4A: 'Sí, nos especializamos en la cadena de frío para mercancías sensibles.',
  faq5Q: '¿Está disponible la entrega los fines de semana?',
  faq5A: 'La entrega los fines de semana está disponible en regiones selectas y para niveles de servicio elegibles.',
  liveChatTitle: 'Chat en vivo',
  liveChatNamePlaceholder: 'Tu nombre',
  liveChatEmailPlaceholder: 'Tu correo',
  liveChatMessagePlaceholder: 'Tu mensaje',
  chatbotTitle: 'Bot SwiftDelivery',
  chatbotGreeting: '¡Hola! ¿En qué puedo ayudarte hoy?',
  chatMessagePlaceholder: 'Escribe tu mensaje...',
  sendButton: 'Enviar',
  newsletterTitle: 'Mantente al día',
  newsletterText: 'Suscríbete a nuestro boletín para recibir consejos y ofertas.',
  emailLabel: 'Correo electrónico',
  subscribeButton: 'Suscribirse',
  followUs: 'Síguenos',
  company: 'Empresa',
  about: 'Sobre nosotros',
  helpCenter: 'Centro de ayuda',
  support: 'Soporte',
  legal: 'Legal',
  privacy: 'Política de privacidad',
  terms: 'Términos de servicio',
  footerNote: '© 2025 SwiftDelivery. Todos los derechos reservados.'
};

// German
window.translations.de = window.translations.de || {
  home: 'Startseite',
  gallery: 'Galerie',
  services: 'Dienstleistungen',
  track: 'Verfolgung',
  login: 'Anmelden',
  register: 'Registrieren',
  welcome: 'SwiftDelivery Luftfracht',
  intro: 'Globale Frachtlösungen mit Geschwindigkeit, Sicherheit und Präzision.',
  getStarted: 'Loslegen',
  galleryTitle: 'Flotte & Einrichtungen',
  servicesTitle: 'Unsere Dienstleistungen',
  service1: 'Express Luftfracht',
  service1Desc: 'Priorisierte Frachtsendung mit garantierten Zeitplänen, damit Ihre dringenden Sendungen schnell und sicher ankommen.',
  service2: 'Globales Lagerwesen',
  service2Desc: 'Sichere Lagerlösungen an strategisch gelegenen internationalen Hubs für effizientes Inventarmanagement und schnelle Distribution.',
  service3: 'Zollabfertigung',
  service3Desc: 'Expertenabwicklung von Unterlagen und Grenzprozessen zur Beschleunigung der Sendungsfreigabe und Minimierung von Verzögerungen.',
  service4: 'Temperaturgeführte Fracht',
  service4Desc: 'Spezialisierter Transport und Lagerung für Pharmazeutika, verderbliche Waren und empfindliche Güter mit strenger Temperaturkontrolle.',
  service5: 'Transport gefährlicher Güter',
  service5Desc: 'Zertifizierte und konforme Handhabung gefährlicher Stoffe mit strengen Sicherheitsstandards.',
  bookingTitle: 'Buchungsübersicht',
  bookingNamePlaceholder: 'Vollständiger Name',
  bookingEmailPlaceholder: 'E-Mail-Adresse',
  bookingMessagePlaceholder: 'Buchungsdetails (Datum, Frachtart, Ziel)',
  bookingSubmitButton: 'Buchung absenden',
  testimonialsTitle: 'Kundenbewertungen',
  testimonial1Text: '"SwiftDelivery hat unsere medizinischen Lieferungen rekordverdächtig über Grenzen transportiert. Sehr zu empfehlen!"',
  testimonial1Author: '- Dr. Amina Yusuf',
  testimonial2Text: '"Ihr Tracking-System ist erstklassig. Ich wusste jederzeit, wo sich meine Sendung befand."',
  testimonial2Author: '- James Okoro',
  testimonial3Text: '"Professionell, schnell und zuverlässig. SwiftDelivery ist unser Logistikpartner der Wahl."',
  testimonial3Author: '- GlobalTech Ltd.',
  contactTitle: 'Kontaktieren Sie uns',
  submitButton: 'Absenden',
  loginTitle: 'Kundenlogin',
  loginButton: 'Anmelden',
  registerTitle: 'Neue Kundenregistrierung',
  registerButton: 'Registrieren',
  registerUsernamePlaceholder: 'Benutzername',
  registerPasswordPlaceholder: 'Passwort',
  trackTitle: 'Abhol- & Lieferverfolgung',
  trackButton: 'Sendung verfolgen',
  faqTitle: 'Häufig gestellte Fragen',
  faq1Q: 'Wie schnell ist die Luftfrachtlieferung?',
  faq1A: 'Die meisten Luftfrachtsendungen erreichen das Ziel innerhalb von 24–48 Stunden, abhängig von Zielort, Flugverfügbarkeit und Zollabfertigung.',
  faq2Q: 'Kümmern Sie sich um internationale Zollabfertigung?',
  faq2A: 'Ja, wir bieten umfassende Zollabfertigungsdienste für alle internationalen Sendungen.',
  faq3Q: 'Kann ich meine Fracht in Echtzeit verfolgen?',
  faq3A: 'Ja. Unser System bietet Live-Updates, GPS-Daten und Statusbenachrichtigungen während der gesamten Reise.',
  faq4Q: 'Bieten Sie temperaturkontrollierten Versand an?',
  faq4A: 'Ja, wir sind auf die Kühlkette für empfindliche Waren spezialisiert.',
  faq5Q: 'Ist Wochenendzustellung verfügbar?',
  faq5A: 'Wochenendzustellung ist in ausgewählten Regionen und für bestimmte Servicelevel verfügbar.',
  liveChatTitle: 'Live-Chat-Support',
  liveChatNamePlaceholder: 'Ihr Name',
  liveChatEmailPlaceholder: 'Ihre E-Mail',
  liveChatMessagePlaceholder: 'Ihre Nachricht',
  chatbotTitle: 'SwiftDelivery Bot',
  chatbotGreeting: 'Hallo! Wie kann ich Ihnen heute helfen?',
  chatMessagePlaceholder: 'Geben Sie Ihre Nachricht ein...',
  sendButton: 'Senden',
  newsletterTitle: 'Bleiben Sie auf dem Laufenden',
  newsletterText: 'Abonnieren Sie unseren Newsletter für Tipps und exklusive Angebote.',
  emailLabel: 'E-Mail',
  subscribeButton: 'Abonnieren',
  followUs: 'Folgen Sie uns',
  company: 'Unternehmen',
  about: 'Über uns',
  helpCenter: 'Hilfezentrum',
  support: 'Support',
  legal: 'Rechtliches',
  privacy: 'Datenschutz',
  terms: 'Nutzungsbedingungen',
  footerNote: '© 2025 SwiftDelivery. Alle Rechte vorbehalten.'
};

// Chinese (Simplified)
window.translations.zh = window.translations.zh || {
  home: '首页',
  gallery: '图库',
  services: '服务',
  track: '追踪',
  login: '登录',
  register: '注册',
  welcome: 'SwiftDelivery 航空货运',
  intro: '提供快速、安全、精准的全球货运解决方案。',
  getStarted: '开始',
  galleryTitle: '机队与设施',
  servicesTitle: '我们的服务',
  service1: '空运快递',
  service1Desc: '优先货运，保证时间表，确保您的紧急货物快速安全到达。',
  service2: '全球仓储',
  service2Desc: '在战略位置的国际枢纽提供安全存储，支持高效库存管理和快速分发。',
  service3: '报关服务',
  service3Desc: '专业处理文件和边境流程，加快清关，减少延误与合规风险。',
  service4: '温控货物',
  service4Desc: '为药品、易腐品和敏感货物提供专业运输和存储，严格控制温度。',
  service5: '危险品运输',
  service5Desc: '对危险品进行认证和合规处理，遵循严格的安全标准与法律要求。',
  bookingTitle: '预订面板',
  bookingNamePlaceholder: '全名',
  bookingEmailPlaceholder: '电子邮件地址',
  bookingMessagePlaceholder: '预订详情（日期、货物类型、目的地）',
  bookingSubmitButton: '提交预订',
  testimonialsTitle: '客户评价',
  testimonial1Text: '"SwiftDelivery 在创纪录的时间内跨境运送了我们的医疗物资，强烈推荐！"',
  testimonial1Author: '- Dr. Amina Yusuf',
  testimonial2Text: '"他们的追踪系统非常出色。我随时知道我的货物在哪里。"',
  testimonial2Author: '- James Okoro',
  testimonial3Text: '"专业、快速且可靠。SwiftDelivery 是我们的首选物流合作伙伴。"',
  testimonial3Author: '- GlobalTech Ltd.',
  contactTitle: '联系我们',
  submitButton: '提交',
  loginTitle: '客户登录',
  loginButton: '登录',
  registerTitle: '新客户注册',
  registerButton: '注册',
  registerUsernamePlaceholder: '用户名',
  registerPasswordPlaceholder: '密码',
  trackTitle: '取件与交付追踪',
  trackButton: '追踪货件',
  faqTitle: '常见问题',
  faq1Q: '空运多快？',
  faq1A: '大多数空运货物在 24–48 小时内到达，具体取决于目的地、航班可用性和海关处理。',
  faq2Q: '你们处理国际海关吗？',
  faq2A: '是的，我们为所有国际货物提供全面的通关服务。',
  faq3Q: '我可以实时追踪我的货物吗？',
  faq3A: '可以。我们的追踪系统提供实时更新、GPS 数据和状态通知。',
  faq4Q: '提供温控运输吗？',
  faq4A: '是的，我们专注于冷链物流以满足敏感货物的需求。',
  faq5Q: '周末送货可用吗？',
  faq5A: '周末送货在部分地区和特定服务级别可用。',
  liveChatTitle: '在线客服',
  liveChatNamePlaceholder: '您的姓名',
  liveChatEmailPlaceholder: '您的电子邮件',
  liveChatMessagePlaceholder: '您的消息',
  chatbotTitle: 'SwiftDelivery 机器人',
  chatbotGreeting: '您好！我能为您做些什么？',
  chatMessagePlaceholder: '输入消息...',
  sendButton: '发送',
  newsletterTitle: '保持关注',
  newsletterText: '订阅我们的通讯，获取货运技巧、更新和独家优惠。',
  emailLabel: '电子邮件',
  subscribeButton: '订阅',
  followUs: '关注我们',
  company: '公司',
  about: '关于我们',
  helpCenter: '帮助中心',
  support: '支持',
  legal: '法律',
  privacy: '隐私政策',
  terms: '服务条款',
  footerNote: '© 2025 SwiftDelivery。保留所有权利。'
};

// Arabic (right-to-left)
window.translations.ar = window.translations.ar || {
  home: 'الرئيسية',
  gallery: 'المعرض',
  services: 'الخدمات',
  track: 'تتبع',
  login: 'تسجيل الدخول',
  register: 'تسجيل',
  welcome: 'سويفت ديلفري - الشحن الجوي',
  intro: 'حلول شحن عالمية بسرعة وأمان ودقة.',
  getStarted: 'ابدأ الآن',
  galleryTitle: 'الأسطول والمرافق',
  servicesTitle: 'خدماتنا',
  service1: 'الشحن الجوي السريع',
  service1Desc: 'توصيل الشحنات ذات أولوية مع جداول زمنية مضمونة لضمان وصول شحناتك العاجلة بسرعة وأمان.',
  service2: 'التخزين العالمي',
  service2Desc: 'حلول تخزين آمنة عبر مراكز دولية استراتيجية لتمكين إدارة المخزون الفعالة والتوزيع السريع.',
  service3: 'تخليص جمركي',
  service3Desc: 'معالجة متقنة للوثائق والإجراءات الحدودية لتسريع تخليص الشحنات وتقليل التأخيرات.',
  service4: 'شحن بدرجة حرارة محكومة',
  service4Desc: 'نقل وتخزين متخصص للأدوية والسلع القابلة للتلف والسلع الحساسة التي تتطلب رقابة صارمة على درجة الحرارة.',
  service5: 'نقل المواد الخطرة',
  service5Desc: 'معالجة معتمدة ومتوافقة للمواد الخطرة وفقًا لمعايير السلامة والمتطلبات القانونية الصارمة.',
  bookingTitle: 'لوحة الحجز',
  bookingNamePlaceholder: 'الاسم الكامل',
  bookingEmailPlaceholder: 'البريد الإلكتروني',
  bookingMessagePlaceholder: 'تفاصيل الحجز (التاريخ، نوع الشحنة، الوجهة)',
  bookingSubmitButton: 'إرسال الحجز',
  testimonialsTitle: 'آراء العملاء',
  testimonial1Text: '"وصلت SwiftDelivery إمداداتنا الطبية عبر الحدود في وقت قياسي. ننصح بها بشدة!"',
  testimonial1Author: '- د. أمينة يوسف',
  testimonial2Text: '"نظام التتبع لديهم من الطراز الأول. كنت أعرف مكان الشحنة في كل وقت."',
  testimonial2Author: '- جيمس أوكورو',
  testimonial3Text: '"محترفون، سريعون وموثوقون. SwiftDelivery هو شريكنا اللوجستي المفضل."',
  testimonial3Author: '- GlobalTech Ltd.',
  contactTitle: 'اتصل بنا',
  submitButton: 'إرسال',
  loginTitle: 'تسجيل دخول العملاء',
  loginButton: 'تسجيل الدخول',
  registerTitle: 'تسجيل عميل جديد',
  registerButton: 'تسجيل',
  registerUsernamePlaceholder: 'اسم المستخدم',
  registerPasswordPlaceholder: 'كلمة المرور',
  trackTitle: 'تتبع الاستلام والتسليم',
  trackButton: 'تتبع الشحنة',
  faqTitle: 'الأسئلة المتكررة',
  faq1Q: 'ما مدى سرعة الشحن الجوي؟',
  faq1A: 'تصل معظم الشحنات الجوية في غضون 24–48 ساعة، حسب الوجهة وتوفر الرحلات ومعالجة الجمارك.',
  faq2Q: 'هل تتعاملون مع الجمارك الدولية؟',
  faq2A: 'نعم، نقدم خدمات تخليص جمركي شاملة لجميع الشحنات الدولية.',
  faq3Q: 'هل يمكنني تتبع شحنتي في الوقت الفعلي؟',
  faq3A: 'نعم. يوفر نظامنا تحديثات مباشرة وبيانات GPS وإشعارات الحالة طوال الرحلة.',
  faq4Q: 'هل تقدمون شحنًا بدرجة حرارة محكومة؟',
  faq4A: 'نعم، نحن متخصصون في سلسلة التبريد للسلع الحساسة.',
  faq5Q: 'هل التوصيل متاح في عطلة نهاية الأسبوع؟',
  faq5A: 'التوصيل في عطلة نهاية الأسبوع متاح في مناطق محددة ولخطط خدمة مؤهلة.',
  liveChatTitle: 'دردشة مباشرة',
  liveChatNamePlaceholder: 'اسمك',
  liveChatEmailPlaceholder: 'بريدك الإلكتروني',
  liveChatMessagePlaceholder: 'رسالتك',
  chatbotTitle: 'بوت SwiftDelivery',
  chatbotGreeting: 'مرحبًا! كيف يمكنني مساعدتك اليوم؟',
  chatMessagePlaceholder: 'اكتب رسالتك...',
  sendButton: 'إرسال',
  newsletterTitle: 'ابق على اطلاع',
  newsletterText: 'اشترك في نشرتنا الإخبارية للحصول على نصائح وعروض حصرية.',
  emailLabel: 'البريد الإلكتروني',
  subscribeButton: 'اشترك',
  followUs: 'تابعنا',
  company: 'الشركة',
  about: 'من نحن',
  helpCenter: 'مركز المساعدة',
  support: 'الدعم',
  legal: 'قانوني',
  privacy: 'سياسة الخصوصية',
  terms: 'شروط الخدمة',
  footerNote: '© 2025 SwiftDelivery. جميع الحقوق محفوظة.'
};

// Global translation/apply helper (single canonical implementation)
function applyTranslations(lang) {
  const translations = window.translations || {};
  if (!lang || !translations[lang]) {
    console.warn('applyTranslations: missing language or translations for', lang);
    return 0;
  }
  const els = document.querySelectorAll('[data-i18n]');
  let updated = 0;
  els.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = translations[lang] && translations[lang][key];
    if (!value) return;
    const tag = el.tagName.toLowerCase();
    if ((tag === 'input' || tag === 'textarea') && !el.hasAttribute('data-i18n-force-text')) {
      el.placeholder = value;
    } else {
      try { el.textContent = value; } catch (e) { el.innerText = value; }
    }
    updated++;
  });

  // Handle RTL for Arabic
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.classList.add('rtl');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.classList.remove('rtl');
  }

  try { localStorage.setItem('sd-lang', lang); } catch (e) { /* ignore */ }
  console.log(`applyTranslations: lang=${lang}, updated=${updated}`);
  return updated;
}

// Global language switcher (safe, can be called from console)
window.changeLanguage = function(lang) {
  console.log('changeLanguage called with', lang);
  const selectTop = document.querySelector('#languageSelect');
  const selectSide = document.querySelector('#sidebarLanguageSelect');
  if (selectTop) selectTop.value = lang;
  if (selectSide) selectSide.value = lang;
  const updated = applyTranslations(lang);
  console.log(`changeLanguage: updated ${updated} elements for lang=${lang}`);
  return updated > 0;
};

// DOMContentLoaded wrapper
document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById("output");

  // Theme toggle (persist)
  const themeToggle = $('#themeToggle');
  const applyTheme = (isDark) => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.body.classList.add('theme-transition');
    setTimeout(() => document.body.classList.remove('theme-transition'), 600);
    try { localStorage.setItem('sd-theme', isDark ? 'dark' : 'light'); } catch (e) {}
  };
  const savedTheme = (() => { try { return localStorage.getItem('sd-theme'); } catch { return null; } })();
  if (savedTheme) {
    applyTheme(savedTheme === 'dark');
    if (themeToggle) themeToggle.checked = savedTheme === 'dark';
  }
  if (themeToggle) {
    themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked));
  }

  // Translations: wire selects to the global applyTranslations / changeLanguage
  const langTop = $('#languageSelect');
  const langSide = $('#sidebarLanguageSelect');
  const savedLang = (() => { try { return localStorage.getItem('sd-lang'); } catch { return null; } })() || 'en';

  // Initialize language selectors and apply saved language
  if (langTop) langTop.value = savedLang;
  if (langSide) langSide.value = savedLang;
  requestAnimationFrame(() => applyTranslations(savedLang));

  // Wire up language change handlers
  const handleLanguageChange = (value, source) => {
    console.log(`Language changed to ${value} from ${source}`);
    // Update both selectors
    if (langTop && langTop !== source) langTop.value = value;
    if (langSide && langSide !== source) langSide.value = value;
    // Apply translations and persist
    applyTranslations(value);
    try { localStorage.setItem('sd-lang', value); } catch (e) { console.warn('Could not save language preference:', e); }
  };

  if (langTop) {
    langTop.addEventListener('change', (e) => handleLanguageChange(e.target.value, langTop));
  }
  if (langSide) {
    langSide.addEventListener('change', (e) => handleLanguageChange(e.target.value, langSide));
  }

  // Sidebar/menu
  const menuToggle = $('#menuToggle');
  const sideMenu = $('#sideMenu');
  const closeMenu = $('#closeMenu');
  const closeSide = () => sideMenu?.classList.remove('open');
  if (menuToggle && sideMenu) {
    menuToggle.addEventListener('click', (ev) => { ev.stopPropagation(); sideMenu.classList.toggle('open'); });
    menuToggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sideMenu.classList.toggle('open'); } });
  }
  if (closeMenu) closeMenu.addEventListener('click', closeSide);
  document.addEventListener('click', (e) => {
    if (sideMenu && menuToggle && !sideMenu.contains(e.target) && !menuToggle.contains(e.target)) closeSide();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeSide(); if (typeof closeChatbotPanel === 'function') closeChatbotPanel(); } });

  // Smooth scroll for anchors
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const target = document.querySelector(href);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // Gallery auto-slide
  const gallerySlider = $('.gallery-slider');
  if (gallerySlider) {
    let autoTimer = null;
    const startAuto = () => {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        const maxScroll = gallerySlider.scrollWidth - gallerySlider.clientWidth;
        if (maxScroll <= 0) return;
        const next = Math.min(gallerySlider.scrollLeft + 310, maxScroll);
        if (gallerySlider.scrollLeft >= maxScroll - 2) gallerySlider.scrollTo({ left: 0, behavior: 'smooth' });
        else gallerySlider.scrollTo({ left: next, behavior: 'smooth' });
      }, 3500);
    };
    gallerySlider.addEventListener('mouseenter', () => clearInterval(autoTimer));
    gallerySlider.addEventListener('mouseleave', startAuto);
    startAuto();
  }

  // Chatbot
  const chatbot = $('#chatbot');
  const closeChatbotBtn = $('#closeChatbot');
  const sendChatBtn = $('#sendChat');
  const chatMessage = $('#chatMessage');
  const chatBody = $('#chatBody') || $('.chat-body');

  // Create chat toggle button if it doesn't exist
  if (!$('#chatToggleBtn')) {
    const chatToggleBtn = document.createElement('button');
    chatToggleBtn.id = 'chatToggleBtn';
    chatToggleBtn.textContent = '💬 Chat';
    chatToggleBtn.style.position = 'fixed';
    chatToggleBtn.style.bottom = '32px';
    chatToggleBtn.style.right = '32px';
    chatToggleBtn.style.zIndex = '2100';
    chatToggleBtn.style.padding = '12px 24px';
    chatToggleBtn.style.borderRadius = '24px';
    chatToggleBtn.style.background = 'var(--primary-color)';
    chatToggleBtn.style.color = '#fff';
    chatToggleBtn.style.border = 'none';
    chatToggleBtn.style.cursor = 'pointer';
    chatToggleBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    document.body.appendChild(chatToggleBtn);

    // Initial state
    if (chatbot) {
      chatbot.style.display = 'none';
      chatbot.style.position = 'fixed';
      chatbot.style.bottom = '100px';
      chatbot.style.right = '32px';
      chatbot.style.zIndex = '2000';
      chatbot.style.maxHeight = '500px';
      chatbot.style.width = '300px';
      chatbot.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    }

    chatToggleBtn.addEventListener('click', () => {
      if (chatbot) {
        const isVisible = chatbot.style.display !== 'none';
        chatbot.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
          chatbot.style.transform = 'translateY(20px)';
          chatbot.style.opacity = '0';
          requestAnimationFrame(() => {
            chatbot.style.transform = 'translateY(0)';
            chatbot.style.opacity = '1';
          });
        }
      }
    });
  }

  // Close chat
  function closeChatbotPanel() { 
    if (chatbot) {
      chatbot.style.transform = 'translateY(20px)';
      chatbot.style.opacity = '0';
      setTimeout(() => chatbot.style.display = 'none', 300);
    }
  }
  if (closeChatbotBtn) closeChatbotBtn.addEventListener('click', closeChatbotPanel);

  // Send message to backend (Gemini integration)
  async function sendMessageToBackend() {
    if (!chatMessage || !chatBody) return;
    const text = chatMessage.value.trim();
    if (!text) return;
    
    // Add user message to chat UI
    const userEl = document.createElement('div');
    userEl.className = 'user-message';
    userEl.textContent = text;
    chatBody.appendChild(userEl);
    chatMessage.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      // Get JWT token from localStorage (if user is logged in)
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Send to backend
      const response = await fetch('http://localhost:5000/api/chat', { // Gemini API URL
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'Sorry, I could not process your message.';

      // Add bot response to chat UI
      const botEl = document.createElement('div');
      botEl.className = 'bot-message';
      botEl.textContent = reply;
      chatBody.appendChild(botEl);
      chatBody.scrollTop = chatBody.scrollHeight;
    } catch (error) {
      console.error('Chat error:', error);
      const errorEl = document.createElement('div');
      errorEl.className = 'bot-message';
      errorEl.textContent = 'Error: Could not reach the backend. Make sure it is running on port 5000.';
      chatBody.appendChild(errorEl);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  if (sendChatBtn) sendChatBtn.addEventListener('click', (e) => { e.preventDefault(); sendMessageToBackend(); });
  if (chatMessage) chatMessage.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessageToBackend(); } });

  // FAQ
  $$('.faq details').forEach(d => d.addEventListener('toggle', () => d.classList.toggle('open', d.open)));

  // Form validation
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      const required = Array.from(form.querySelectorAll('input[required], textarea[required]'));
      let ok = true;
      for (const el of required) {
        if (!el.value.trim()) { el.style.borderColor = 'red'; ok = false; }
        else el.style.borderColor = '';
      }
      if (!ok) { e.preventDefault(); const first = required.find(i => !i.value.trim()); if (first) first.focus(); }
    });
  });

  // Newsletter
  const newsletterForm = $('#newsletterForm');
  if (newsletterForm) newsletterForm.addEventListener('submit', (e) => { e.preventDefault(); const email = $('#newsletterEmail')?.value.trim(); if (email) { alert(`Thanks for subscribing: ${email}`); newsletterForm.reset(); } else alert('Please enter an email.'); });

  // Register
   // stop page reload
    const name = document.getElementById("registerUsername").value; // Updated ID
    const email = document.getElementById("registerEmail").value; // Updated ID
    const password = document.getElementById("registerPassword").value; // Updated ID

    const res = await fetch("http://localhost:5000/api/register", { // ✅ correct URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email, password }) // Updated to match expected API
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  });

  // Handle Login
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value; // Updated ID
    const password = document.getElementById("loginPassword").value; // Updated ID

    const res = await fetch("http://localhost:5000/api/login", { // ✅ correct URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token); // save JWT
      output.textContent = "✅ Logged in successfully!";
    } else {
      output.textContent = "❌ Login failed";
    }
  });

  // Use Token for Protected Routes
  async function fetchProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
      output.textContent = "No token found. Please login first.";
      return;
    }

    const res = await fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  }

  // Accessibility
  window.addEventListener('keydown', (e) => { if (e.key === 'Tab') document.body.classList.add('user-is-tabbing'); });
  window.addEventListener('mousedown', () => document.body.classList.remove('user-is-tabbing'));

  // Reveal on scroll
  const revealElements = document.querySelectorAll('section, .card');
  revealElements.forEach(el => { el.style.transition = 'opacity 0.8s cubic-bezier(.77,0,.175,1), transform 0.7s cubic-bezier(.77,0,.175,1)'; el.style.opacity = 0; el.style.transform = 'translateY(40px)'; });
  const revealOnScroll = () => { revealElements.forEach(el => { const rect = el.getBoundingClientRect(); if (rect.top < window.innerHeight - 120) { el.style.opacity = 1; el.style.transform = 'translateY(0)'; } }); };
  window.addEventListener('scroll', revealOnScroll); revealOnScroll();

  // Initial fade-in
  requestAnimationFrame(() => { document.body.style.opacity = 1; });
});
