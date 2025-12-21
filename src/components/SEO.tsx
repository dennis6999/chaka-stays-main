import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({
    title = 'Chaka Stays - Nature Retreats in Chaka, Kenya',
    description = 'Discover the best Airbnb and vacation rentals in Chaka, Nyeri. Book luxury stays, nature retreats, and cozy homes for your perfect getaway.',
    keywords = ['chaka airbnb', 'chaka stays', 'chaka homes', 'chaka bnb', 'nyeri accommodation', 'mt kenya stays', 'vacation rentals chaka'],
    image = '/og-image.jpg',
    url = window.location.href,
    type = 'website'
}) => {
    const siteTitle = title === 'Chaka Stays - Nature Retreats in Chaka, Kenya' ? title : `${title} | Chaka Stays`;

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
