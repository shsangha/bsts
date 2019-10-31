const proxy = require("http-proxy-middleware")

module.exports = {
  developMiddleware: app => {
    app.use(
      "/.netlify/functions/",
      proxy({
        target: "http://localhost:9000",
        pathRewrite: {
          "/.netlify/functions/": "",
        },
      })
    )
  },
  pathPrefix: "/",
  siteMetadata: {
    siteUrl: "https://bsts.live",
    pathPrefix: "/",
    title: "bsts.live",
    titleAlt: "bsts.live",
    description: "", // CHANGE
    banner: "/img/card.jpg",
    headline: "HEADLINE CHANGE THIS", //CHANGE
    siteLanguage: "en",
    author: "Shawn Sangha",
    ogLanguage: "en_US",
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/static/img`,
        name: "uploads",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/src/content`,
        name: "cmsContent",
      },
    },

    `gatsby-plugin-sharp`,
    {
      resolve: "gatsby-transformer-sharp",
      options: {
        stripMetadata: true,
        defaultQuality: 75,
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-relative-images",
            options: {
              name: "uploads",
            },
          },
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 2048,
            },
          },
          {
            resolve: "gatsby-remark-copy-linked-files",
            options: {
              destinationDir: "static",
            },
          },
        ],
      },
    },
    "gatsby-plugin-sitemap",

    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `BSTS`,
        short_name: `BSTS`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `static/img/card.jpg`,
      },
    },
    "gatsby-plugin-transition-link",
    "gatsby-plugin-netlify-cms",
    `gatsby-plugin-offline`,
    "gatsby-plugin-netlify",
  ],
}
