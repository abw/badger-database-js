---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Badger Database"
  # text: SQL Made Easy
  tagline: "A Javascript Database Abstraction Toolkit"
  image:
    src: images/badger3.svg
    alt: Badger
  # tagline: My great project tagline
  actions:
    - theme: brand
      text: Installation
      link: /installation
    - theme: alt
      text: Documentation
      link: /connecting
    - theme: alt
      text: Reference
      link: /method-reference
    - theme: alt
      text: Examples
      link: /examples

features:
  - title: SQL Queries
    details: Define your own named SQL queries and composable query fragments
    link: /basic-queries
  - title: Query Builder
    details: Use the query builder to programmatically compose SQL queries
    link: /query-builder
  - title: Tables
    details: Define table schemas to benefit from inbuilt CRUD queries
    link: /tables
  - title: Records
    details: Return rows as record objects for ORM functionality
    link: /records
  - title: Relations
    details: Define relations between records to interconnect data
    link: /relations
  - title: Transactions
    details: Use transactions with commit/rollback to ensure database consistency
    link: /transactions
---

## SQL Made Easier

Badger Database is a library designed to simplify the process of working with
SQL databases.

It aims to be pragmatic, not dogmatic.  It implements some of the most
useful features of SQL query builders and ORMs, but doesn't stop you from
working with SQL queries when you need to.

It has support for Postgres, MySQL, MariaDB and SQLite.  It is around 4k
lines of code, with a bundle size of around 17kB, minified and compressed.

## Opinionated and Selfish Software

::: warning WARNING - People Who Share Their Source Code Do Not Owe You Anything!
This is OSS: **Open Source Software** that you can freely download, use and adapt
if you want to. But here OSS also stands for **Opinionated and Selfish Software**.

It doesn't set out to please all the people, all the time. On the contrary,
it is designed to please one person (me) most of the time. I wrote it to help
me get my job done.  If it helps you get your job done then great.  But please
don't complain if it doesn't do what you want.  It's not my job to help you
do your job.

https://freeasinweekend.org/open-source-open-mind
:::

<center>
<img src="./public/images/oss.svg" width="120" height="120" style="margin-top: 4rem">
</center>


