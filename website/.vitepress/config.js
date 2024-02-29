import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Badger Database",
  description: "A Database Abstraction Toolkit",
  head: [['link', { rel: 'icon', href: '/badger-database-js/images/badger3.svg' }]],
  base: '/badger-database-js/',
  outDir: '../docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    siteTitle: 'Badger Database',
    logo: '/images/badger3.svg',
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Documentation',
        items: [
          { text: 'Getting Started', link: '/installation' },
          { text: 'SQL Queries', link: '/basic-queries' },
          { text: 'Query Builder', link: '/query-builder' },
          { text: 'Tables', link: '/tables' },
          { text: 'Records', link: '/records' },
          { text: 'Relations', link: '/relations' },
          { text: 'Transactions', link: '/transactions' },
        ]
      }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Connect to a Database', link: '/connecting' }
        ]
      },
      {
        text: 'SQL Queries',
        items: [
          { text: 'Basic Queries', link: '/basic-queries' },
          { text: 'Named Queries', link: '/named-queries' },
          { text: 'Query Fragments', link: '/query-fragments' },
        ]
      },
      {
        text: 'Query Builder',
        items: [
          { text: 'Query Builder', link: '/query-builder' },
          { text: 'Query Builder Methods', link: '/builder-methods' },
        ]
      },
      {
        text: 'Tables',
        items: [
          { text: 'Tables', link: '/tables' },
          { text: 'Table Columns', link: '/table-columns' },
          { text: 'Table Methods', link: '/table-methods' },
          { text: 'Table Queries', link: '/table-queries' },
          { text: 'Table Class', link: '/table-class' },
        ]
      },
      {
        text: 'Records',
        items: [
          { text: 'Record', link: '/records' },
          { text: 'Record Methods', link: '/record-methods' },
          { text: 'Record Class', link: '/record-class' },
        ]
      },
      {
        text: 'Other Components',
        items: [
          { text: 'Relations', link: '/relations' },
          { text: 'Transactions', link: '/transactions' },
          { text: 'Model', link: '/model' },
          { text: 'Waiter', link: '/waiter' },
        ]
      },
      {
        text: 'Miscellaneous',
        items: [
          { text: 'Debugging', link: '/debugging' },
          { text: 'Errors', link: '/errors' },
          { text: 'Implementation', link: '/implementation' },
          { text: 'Extending', link: '/extending' },
          { text: 'Limitations', link: '/limitations' },
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Overview', link: '/examples' },
          { text: '01 Basic Queries', link: 'https://github.com/abw/badger-database-js/tree/master/examples/01_basic_queries/example.js' },
          { text: '02 Named Queries', link: 'https://github.com/abw/badger-database-js/tree/master/examples/02_named_queries/example.js' },
          { text: '03 Query Fragments', link: 'https://github.com/abw/badger-database-js/tree/master/examples/03_query_fragments/example.js' },
          { text: '04 Tables', link: 'https://github.com/abw/badger-database-js/tree/master/examples/04_tables/example.js' },
          { text: '05 Table Class', link: 'https://github.com/abw/badger-database-js/tree/master/examples/05_table_class/example.js' },
          { text: '06 Records', link: 'https://github.com/abw/badger-database-js/tree/master/examples/06_records/example.js' },
          { text: '07 Music Database', link: 'https://github.com/abw/badger-database-js/tree/master/examples/07_musicdb/example.js' },
          { text: '08 Products Database', link: 'https://github.com/abw/badger-database-js/tree/master/examples/08_products/example.js' },
          { text: '09 Debugging', link: 'https://github.com/abw/badger-database-js/tree/master/examples/09_debugging/example.js' },
          { text: '10 Custom Builder', link: 'https://github.com/abw/badger-database-js/tree/master/examples/10_custom_builder/example.js' },
        ]
      }
      /*
      {
        text: 'Vitepress Docs',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
      */
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/abw/badger-database-js' }
    ],
    footer: {
      message: 'Built by Badgers',
      copyright: '©️ Andy Wardley 2004-2024'
    }
  }
})
