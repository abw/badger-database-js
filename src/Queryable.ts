import Query, { QueryConfig } from './Query'
import { singleWord } from './Constants'
import { fail, isFunction, isString } from '@abw/badger-utils'
import { expandFragments, missing } from './Utils'
import {
  BuilderInstance, DatabaseInstance, EngineInstance, QueryableInstance,
  QueryOptions,
  QueryParams,
  QueryRow,
  TransactionInstance
} from './types'

export type QueryableConfig = {
  transact?: TransactionInstance
}
export type QuerySource = string | BuilderInstance
export type QueryFunction = (queryable: QueryableInstance) => QuerySource
export type QueryableQueries = Record<string, QuerySource | QueryFunction>
export type QueryableFragments = Record<string, string>

export class Queryable {
  engine: EngineInstance
  transact?: TransactionInstance
  database?: DatabaseInstance
  queries: QueryableQueries
  fragments: QueryableFragments

  debug!: (message: string) => void
  debugData!: (message: string, data: any) => void

  constructor(
    engine: EngineInstance,
    config: QueryableConfig = { }
  ) {
    this.engine   = engine || missing('engine')
    this.transact = config.transact
  }

  query(source: string): QuerySource {
    this.debugData("query()", { source });
    const query = this.queries[source]
      || (this.database && this.database.query(source))
      || fail("Invalid named query specified: ", source);
    // a named query can be a function which we call, returning either a string
    // or a query builder
    return isFunction(query)
      ? query(this)
      : query;
  }

  fragment(name: string): string {
    this.debugData("fragment()", { name });
    return this.fragments[name]
      || (this.database && this.database.fragment(name))
      || fail("Invalid query fragment in SQL expansion: <", name, ">");
  }

  buildQuery(source: QuerySource, config: QueryConfig={}) {
    config.transact ||= this.transact;
    this.debugData("buildQuery()", { source, config });
    return new Query(
      this.engine,
      isString(source) ? this.expandQuery(source) : source,
      config
    );
  }

  expandQuery(source: string, config?: QueryConfig) {
    this.debugData("expandQuery()", { source });
    // if the source is a single word then it must be a named query
    // otherwise it's an SQL query possibly with embedded fragments
    return source.match(singleWord)
      ? this.expandNamedQuery(source, config)
      : expandFragments(source, this);
  }

  expandNamedQuery(name: string, _config?: QueryConfig) {
    this.debugData("expandNamedQuery()", { name });
    const query = this.query(name);
    // the named query can be a string with embedded fragments that should
    // be expanded, or it can be a query builder
    return isString(query)
      ? expandFragments(query, this)
      : query;
  }

  sql(name: QuerySource, config?: QueryConfig) {
    this.debugData("sql()", { name, config });
    return this.buildQuery(name, config).sql()
  }

  async run(
    query: QuerySource,
    params: QueryParams,
    options: QueryOptions
  ) {
    this.debugData("run()", { query, params, options });
    return this.buildQuery(query).run(params, options)
  }

  async one(
    query: QuerySource,
    params: QueryParams,
    options: QueryOptions
  ) {
    this.debugData("one()", { query, params, options });
    return this.loadedOne(
      await this.buildQuery(query).one(params, options),
      options
    )
  }

  async any(
    query: QuerySource,
    params: QueryParams,
    options: QueryOptions
  ) {
    this.debugData("any()", { query, params, options });
    return this.loadedAny(
      await this.buildQuery(query).any(params, options),
      options
    )
  }

  async all(
    query: QuerySource,
    params: QueryParams,
    options: QueryOptions
  ) {
    this.debugData("all()", { query, params, options });
    return this.loadedAll(
      await this.buildQuery(query).all(params, options),
      options
    )
  }

  loadedOne(row: QueryRow, _options: QueryOptions) {
    return row;
  }

  loadedAny(row: QueryRow, _options: QueryOptions) {
    return row;
  }

  loadedAll(rows: QueryRow[], _options: QueryOptions) {
    return rows;
  }
}

export default Queryable