export const GOBOOKME_PRIMARY_CITY = "champaign";

export const GOBOOKME_NEIGHBORHOODS = [
  "Champaign",
  "Urbana",
  "Campustown",
  "Downtown Champaign",
  "Midtown",
  "UIUC Area",
] as const;

export const GOBOOKME_MARKETPLACE_CATEGORIES = [
  { slug: "cleaning", name: "Cleaning", description: "Move-out, apartment, deep, and turnover cleaning." },
  {
    slug: "photography",
    name: "Photography",
    description: "Graduation photos, headshots, portraits, products, and local events.",
  },
  { slug: "beauty", name: "Beauty & Personal Care", description: "Salons, lashes, nails, and personal care." },
  {
    slug: "mobile-detailing",
    name: "Mobile Detailing",
    description: "Interior detailing, exterior washes, full details, and vehicle care.",
  },
  {
    slug: "creators",
    name: "Creators & Influencers",
    description: "UGC creators, TikTok creators, brand collaboration calls, and content packages.",
  },
  {
    slug: "video-content",
    name: "Video & Content",
    description: "Short-form video, editing, content shoots, social media production, and creator services.",
  },
  {
    slug: "software-automation",
    name: "Software & Automation",
    description: "Web apps, automation, AI tools, scripting, and technical consulting.",
  },
  {
    slug: "creative-services",
    name: "Websites & Design",
    description: "Graphic design, video editing, websites, branding, and social media services.",
  },
  {
    slug: "writing-editing",
    name: "Writing & Editing",
    description: "Copywriting, editing, resumes, grant writing, proofreading, and writing coaching.",
  },
  {
    slug: "home-services",
    name: "Home Services",
    description: "Handyman help, moving help, lawn care, furniture assembly, and minor repairs.",
  },
  {
    slug: "tutoring-lessons",
    name: "Tutoring & Lessons",
    description: "Private tutoring, music lessons, language lessons, test prep, and writing help.",
  },
  {
    slug: "business-services",
    name: "Business Services",
    description: "Bookkeeping, consulting, operations help, virtual assistance, and local business support.",
  },
] as const;

export const GOBOOKME_SERVICE_AREAS = [
  "Online / Remote",
  "Mobile service",
  "Customer location",
  "Business location",
  "Nationwide",
  "Champaign",
  "Urbana",
  "Campustown",
  "Downtown Champaign",
  "UIUC Area",
] as const;

export const GOBOOKME_LEGACY_CATEGORIES = [
  {
    slug: "career-coaching",
    name: "Career Coaching",
    description: "Career coaching, interview prep, and resume services.",
  },
  { slug: "education", name: "Education", description: "Education services, coaching, and academic support." },
  { slug: "tutors", name: "Tutors", description: "Tutoring and academic support near Champaign-Urbana." },
  { slug: "consulting", name: "Consulting", description: "Local consultants and professional service providers." },
  { slug: "wellness", name: "Wellness", description: "Massage, esthetics, and wellness appointments." },
  { slug: "fitness", name: "Fitness", description: "Coaches, trainers, and private fitness sessions." },
  { slug: "barbers", name: "Barbers", description: "Barbershops and independent barbers." },
  { slug: "auto-detailing", name: "Auto Detailing", description: "Interior and exterior vehicle detailing." },
  { slug: "other", name: "Other", description: "Other local bookable services." },
] as const;

export const GOBOOKME_FOUNDING_CATEGORIES = [
  ...GOBOOKME_MARKETPLACE_CATEGORIES,
  ...GOBOOKME_LEGACY_CATEGORIES,
] as const;

export const GOBOOKME_ESTIMATED_PLATFORM_FEE_BASIS_POINTS = 300;
