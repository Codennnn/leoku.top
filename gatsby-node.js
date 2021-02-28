const { createFilePath } = require('gatsby-source-filesystem')
const path = require('path')

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  // you only want to operate on `Mdx` nodes. If you had content from a
  // remote CMS you could also check to see if the parent node was a
  // `File` node here
  if (node.internal.type === 'Mdx') {
    const value = createFilePath({ node, getNode })
    createNodeField({
      // Name of the field you are adding
      name: 'slug',
      // Individual MDX node
      node,
      // Generated value based on filepath with "blog" prefix. you
      // don't need a separating "/" before the value because
      // createFilePath returns a path with the leading "/".
      value: `/blog${value}`,
    })
    createNodeField({
      name: 'collection',
      node,
      value: getNode(node.parent).sourceInstanceName,
    })
  }
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const postsResult = await graphql(`
    query {
      allMdx(filter: { fields: { collection: { eq: "posts" } } }) {
        edges {
          node {
            id
            fields {
              slug
            }
          }
        }
      }
    }
  `)
  if (postsResult.errors) {
    reporter.panicOnBuild('🚨  ERROR: Loading "createPages" query')
  }
  // Create blog post pages.
  const posts = postsResult.data.allMdx.edges
  // you'll call `createPage` for each result
  posts.forEach(({ node }) => {
    createPage({
      // This is the slug you created before
      // (or `node.frontmatter.slug`)
      path: node.fields.slug,
      // This component will wrap our MDX content
      component: path.resolve(`./src/components/blog-layout/index.js`),
      // You can use the values in this context in
      // our page layout component
      context: { id: node.id },
    })
  })
}
