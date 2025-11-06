// GitHub Raw Files - Using actual framix repo
// Repository: https://github.com/danilrafiqi/framix

// GitHub raw files URLs
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/danilrafiqi/framix/main';

const FRAME_URLS = {
  simple: `${GITHUB_RAW_BASE}/simple-border-frame.svg`,
  double: `${GITHUB_RAW_BASE}/double-border-frame.svg`,
  decorative: `${GITHUB_RAW_BASE}/decorative-frame.svg`,
  rounded: `${GITHUB_RAW_BASE}/rounded-frame.svg`,
};

// For dynamic loading from Firestore (optional)
// import { getDownloadURL, ref } from 'firebase/storage';
// import { storage } from './firebase';

// Frame configuration
export interface FrameConfig {
  id: string;
  name: string;
  url: string;
}

// Available frames configuration
export const FRAME_CONFIGS: FrameConfig[] = [
  {
    id: 'simple',
    name: 'Border Sederhana',
    url: FRAME_URLS.simple,
  },
  {
    id: 'double',
    name: 'Border Ganda',
    url: FRAME_URLS.double,
  },
  {
    id: 'decorative',
    name: 'Border Dekoratif',
    url: FRAME_URLS.decorative,
  },
  {
    id: 'rounded',
    name: 'Border Rounded',
    url: FRAME_URLS.rounded,
  },
];

// Get frame URL (returns static URL)
export const getFrameUrl = async (frameId: string): Promise<string> => {
  const frameConfig = FRAME_CONFIGS.find(f => f.id === frameId);
  if (!frameConfig) {
    throw new Error(`Frame config not found for id: ${frameId}`);
  }

  return frameConfig.url;
};

// Get all frame URLs
export const getAllFrameUrls = async (): Promise<{ [key: string]: string }> => {
  const urls: { [key: string]: string } = {};
  FRAME_CONFIGS.forEach(config => {
    urls[config.id] = config.url;
  });
  return urls;
};
