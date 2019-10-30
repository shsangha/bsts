import React from "react"
import Helmet from "react-helmet"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import Twitter from "./twitter"

const query = graphql`
  query SEO {
    site {
      buildTime(formatString: "YYYY-MM-DD")
      siteMetadata {
        siteUrl
        defaultTitle: title
        defaultDescription: description
        defaultBanner: banner
        headline
        siteLanguage
        author
        twitter
      }
    }
  }
`

const SEO = ({ title, desc, banner, pathname }) => {
  const { site } = useStaticQuery(query)

  const {
    buildTime,
    siteMetadata: {
      siteUrl,
      defaultTitle,
      defaultDescription,
      defaultBanner,
      headline,
      siteLanguage,
      author,
      twitter,
    },
  } = site

  const seo = {
    title: title || defaultTitle,
    description: desc || defaultDescription,
    image: `${siteUrl}${banner || defaultBanner}`,
    url: `${siteUrl}${pathname || ""}`,
  }

  const schemaOrgWebPage = {
    "@context": "http://schema.org",
    "@type": "WebPage",
    url: siteUrl,
    headline,
    inLanguage: siteLanguage,
    mainEntityOfPage: siteUrl,
    description: defaultDescription,
    name: defaultTitle,
    author: {
      "@type": "Person",
      name: author,
    },
    copyrightHolder: {
      "@type": "Person",
      name: author,
    },
    copyrightYear: "2019",
    creator: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Person",
      name: author,
    },
    datePublished: "2019-01-18T10:30:00+01:00",
    dateModified: buildTime,
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}${defaultBanner}`,
    },
  }

  const itemListElement = [
    {
      "@type": "ListItem",
      item: {
        "@id": siteUrl,
        name: "Homepage",
      },
      position: 1,
    },
  ]

  const breadcrumb = {
    "@context": "http://schema.org",
    "@type": "BreadcrumbList",
    description: "Breadcrumbs list",
    name: "Breadcrumbs",
    itemListElement,
  }

  return (
    <>
      <Helmet title={seo.title}>
        <html lang={siteLanguage} />
        <meta name="description" content={seo.description} />
        <meta name="image" content={seo.image} />
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgWebPage)}
        </script>
        <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      </Helmet>
      <Twitter
        title={seo.title}
        image={seo.image}
        desc={seo.description}
        username={twitter}
      />
    </>
  )
}
export default SEO
SEO.propTypes = {
  title: PropTypes.string,
  desc: PropTypes.string,
  banner: PropTypes.string,
  pathname: PropTypes.string,
}
SEO.defaultProps = {
  title: null,
  desc: null,
  banner: null,
  pathname: null,
}
