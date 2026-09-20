import React, { useEffect } from 'react';
import { APP_CONFIG } from '../../config/app.config';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath,
  jsonLd,
}) => {
  const fullTitle = title || `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`;
  const fullDescription = description || APP_CONFIG.description;
  const canonicalUrl = `${APP_CONFIG.url}${canonicalPath || ''}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // 2. Helper to set or create meta tags
    const setMetaTag = (attribute: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Description & OpenGraph
    setMetaTag('name', 'description', fullDescription);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', fullDescription);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', fullDescription);

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. JSON-LD Structured Data
    const existingScript = document.getElementById('docveta-jsonld');
    if (existingScript) {
      existingScript.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'docveta-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup jsonld on unmount
      const s = document.getElementById('docveta-jsonld');
      if (s) s.remove();
    };
  }, [fullTitle, fullDescription, canonicalUrl, jsonLd]);

  return null;
};
