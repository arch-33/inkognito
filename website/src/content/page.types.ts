export interface PageConfig {
  /**
   * Applies to the `<title>` tag
   */
  document_title?: string;
  /**
   * Applies to some meta tags related to SEO and Social Sharing
   * - og:title
   * - twitter:title
   *
   * Falls back to the `document_title` if not provided
   */
  meta_title?: string;
  /**
   * Applies to some meta tags
   * - description
   * - og:description
   * - twitter:description
   */
  meta_description?: string;
  /**
   * Applies to the <meta name="keywords"> tag
   */
  meta_keywords?: string[];

  /**
   * Applies to the <meta name="author"> tag
   */
  meta_author?: string;

  /**
   * Applies to the <link rel="canonical"> tag
   */
  canonical_url?: string;
  /**
   * Applies to the <meta name="robots"> tag.
   * If true, it will add the 'noindex, nofollow' value.
   * If false, it will add the 'index, follow' value.
   */
  noindex?: boolean;
  /**
   * Applies to the og:image and twitter:image meta tags
   */
  meta_image?: string;
}




export interface PageCommonProps {
  title: string;
  description?: string;
}

export type PageType<data_type = any> = PageCommonProps &
  PageConfig & { data: data_type };
