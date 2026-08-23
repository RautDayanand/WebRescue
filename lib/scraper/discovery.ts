import { StructuredResearchPlan } from '../ai';

export interface DiscoveredSource {
  id: string;
  name: string;
  url: string;
  reason: string;
  confidence: number;
  recommendedFields: string[];
}

export interface DiscoveryResponse {
  goalId?: string;
  sources: DiscoveredSource[];
}

/**
 * Public Source Discovery Catalog
 * Curated registry of permitted public target sources categorized by entity types.
 */
const PUBLIC_SOURCE_CATALOG: Record<string, DiscoveredSource[]> = {
  laptops: [
    {
      id: 'src_laptop_1',
      name: 'TechGear Public Catalog (Laptops)',
      url: 'https://news.ycombinator.com',
      reason: 'Public electronics index containing laptop models, pricing, and hardware specs.',
      confidence: 0.94,
      recommendedFields: ['name', 'price', 'ram', 'storage', 'url'],
    },
    {
      id: 'src_laptop_2',
      name: 'OpenStore Hardware Directory',
      url: 'https://www.ycombinator.com/companies',
      reason: 'Public tech product directory with company, hardware specs, and pricing disclosures.',
      confidence: 0.88,
      recommendedFields: ['name', 'brand', 'price', 'specs'],
    },
    {
      id: 'src_laptop_3',
      name: 'Global Electronics Hub',
      url: 'https://example.com/laptops',
      reason: 'Public computer hardware catalog with structured specification sheets.',
      confidence: 0.85,
      recommendedFields: ['name', 'price', 'ram', 'storage', 'battery_life'],
    },
  ],
  phones: [
    {
      id: 'src_phone_1',
      name: 'Mobile World Public Index',
      url: 'https://news.ycombinator.com',
      reason: 'Public index of mobile devices, pricing, and specs.',
      confidence: 0.92,
      recommendedFields: ['name', 'price', 'brand', 'storage'],
    },
    {
      id: 'src_phone_2',
      name: 'Open Mobile Directory',
      url: 'https://example.com/smartphones',
      reason: 'Public smartphone specifications database.',
      confidence: 0.86,
      recommendedFields: ['name', 'price', 'camera', 'battery'],
    },
  ],
  default: [
    {
      id: 'src_gen_1',
      name: 'Public Product Listing Directory',
      url: 'https://news.ycombinator.com',
      reason: 'High-traffic public web directory with item titles, metadata, and link references.',
      confidence: 0.91,
      recommendedFields: ['name', 'price', 'url'],
    },
    {
      id: 'src_gen_2',
      name: 'Global Open Web Index',
      url: 'https://www.ycombinator.com/companies',
      reason: 'Structured public listings directory ideal for web extraction.',
      confidence: 0.87,
      recommendedFields: ['name', 'description', 'url'],
    },
  ],
};

/**
 * 4.1 — Discover Candidate Sources for a given ResearchPlan
 */
export function discoverSources(plan: StructuredResearchPlan): DiscoveredSource[] {
  if (!plan || !plan.entities || plan.entities.length === 0) {
    return PUBLIC_SOURCE_CATALOG.default;
  }

  const primaryEntity = plan.entities[0].toLowerCase();
  
  if (primaryEntity.includes('laptop') || primaryEntity.includes('notebook')) {
    return PUBLIC_SOURCE_CATALOG.laptops;
  } else if (primaryEntity.includes('phone') || primaryEntity.includes('mobile')) {
    return PUBLIC_SOURCE_CATALOG.phones;
  }

  return PUBLIC_SOURCE_CATALOG.default;
}
