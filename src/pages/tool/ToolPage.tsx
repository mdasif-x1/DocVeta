import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getToolBySlug } from '../../config/tools.config';
import { SEO_CONFIG } from '../../config/seo.config';
import { SEOHead } from '../../components/seo/SEOHead';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { ToolHowTo } from '../../components/seo/ToolHowTo';
import { ToolFaq } from '../../components/seo/ToolFaq';
import { RelatedTools } from '../../components/seo/RelatedTools';
import { ImageToPdfFeature } from '../../features/image-to-pdf/ImageToPdfFeature';
import { TextToPdfFeature } from '../../features/text-to-pdf/TextToPdfFeature';
import { MergePdfFeature } from '../../features/merge-pdf/MergePdfFeature';
import { PdfToImageFeature } from '../../features/pdf-to-image/PdfToImageFeature';
import { PdfToTextFeature } from '../../features/pdf-to-text/PdfToTextFeature';
import { ImageToTextFeature } from '../../features/image-to-text/ImageToTextFeature';

export const ToolPage: React.FC = () => {
  const { toolSlug } = useParams<{ toolSlug: string }>();

  if (!toolSlug) {
    return <Navigate to="/tools" replace />;
  }

  const tool = getToolBySlug(toolSlug);
  if (!tool) {
    return <Navigate to="/404" replace />;
  }

  const seo = SEO_CONFIG[tool.id];

  // Render the appropriate feature engine based on tool id
  const renderFeature = () => {
    switch (tool.id) {
      case 'image-to-pdf':
      case 'jpg-to-pdf':
      case 'png-to-pdf':
      case 'webp-to-pdf':
        return <ImageToPdfFeature tool={tool} />;
      case 'text-to-pdf':
        return <TextToPdfFeature tool={tool} />;
      case 'merge-pdf':
        return <MergePdfFeature tool={tool} />;
      case 'pdf-to-image':
        return <PdfToImageFeature tool={tool} />;
      case 'pdf-to-text':
        return <PdfToTextFeature tool={tool} />;
      case 'image-to-text':
        return <ImageToTextFeature tool={tool} />;
      default:
        return null;
    }
  };

  // Generate Schema.org JSON-LD structured data for this tool
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: seo?.h1 || tool.name,
    operatingSystem: 'Any',
    applicationCategory: 'UtilitiesApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: seo?.description || tool.description,
  };

  return (
    <div className="py-6 sm:py-8">
      <SEOHead
        title={seo?.title}
        description={seo?.description}
        canonicalPath={`/${tool.slug}`}
        jsonLd={jsonLd}
      />

      <div className="docveta-container">
        {/* Breadcrumb navigation */}
        <Breadcrumbs
          items={[
            { label: 'Tools', href: '/tools' },
            { label: tool.shortName },
          ]}
        />

        {/* Tool Header Section */}
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <h1 className="text-xl sm:text-3xl font-bold text-slate-950 tracking-tight mb-2">
            {seo?.h1 || tool.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {tool.description}
          </p>
        </div>

        {/* Primary Interactive Tool Workspace */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-7 shadow-2xs">
          {renderFeature()}
        </div>

        {/* Educational Step-by-Step How-To Guide */}
        {seo?.howTo && (
          <ToolHowTo toolName={tool.shortName} steps={seo.howTo} />
        )}

        {/* Tool-specific FAQ Section */}
        {seo?.faqs && (
          <ToolFaq toolName={tool.shortName} faqs={seo.faqs} />
        )}

        {/* Configuration-driven Related Tools */}
        <RelatedTools relatedSlugs={tool.relatedToolSlugs} />
      </div>
    </div>
  );
};
