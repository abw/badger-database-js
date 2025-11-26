#!/usr/bin/env tsx

// Testing the use of an interface to define table columns acceptable for
// various operations: select, insert, update, etc.

interface Model {
  tables: {
    Users: {
      columns: {
        select: {
          id?: number
          name?: string
          email?: string
          password?: string
        }
        insert: {
          id?: number
          name: string
          email: string
          password?: string
        }
        update: {
          name?: string
          email?: string
          password?: string
        }
        identity: {
          id: number
        }
      }
    }
  }
}

type TableMethod = 'select' | 'insert' | 'update' | 'identity'

type ColumnsForTableMethod<
  TableName extends keyof Model["tables"],
  Method extends TableMethod
> =
  Model["tables"][TableName]["columns"][Method]

function table<Name extends keyof Model["tables"]>(
  name: Name
) {
  return {
    select: function(
      whereColumns: ColumnsForTableMethod<Name, "select">
    ) {
      return "TODO"
    },
    update: function(
      setColumns: ColumnsForTableMethod<Name, "update">,
      whereColumns: ColumnsForTableMethod<Name, "select">
    ) {
      return "TODO"
    },
    insert: function(
      setColumns: ColumnsForTableMethod<Name, "insert">,
    ) {
      return "TODO"
    },
    'delete': function(
      whereColumns: ColumnsForTableMethod<Name, "identity">,
    ) {
      return "TODO"
    },
  }
}

const users = table('Users')
const response1 = users.select({ id: 123 })
const response2 = users.update({ name: 'Fred' }, { id: 456 })
const response3 = users.insert({ name: 'Fred', email: 'fred@here.com' })
const response4 = users.delete({ id: 789 })

/*
*/

/*
extends Record<Verb, {
    responses: {
      200: {
        content: {
          'application/json': infer ResponseType,  // <-- the "infer"
        }
      }
    }
function table<Name extends keyof Model["tables"]>(
  name: Name
) {
  return {
    select: function<
  }
}
// type SelectableColumnsForTable<TableName extends keyof Model["tables"]> =


export interface paths {
  "/users": {
    post: {
      requestBody: {
        content: {
          "application/json": components["schemas"]["CreateUserRequest"];
        };
      };
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["User"];
          };
        };
      };
    };
    // also get, etc.
  };
}

export interface components {
  schemas: {
    CreateUserRequest: {
      name: string;
      age: number;
    };
    User: {
      id: string;
      name: string;
      age: number;
    };
  };
}

type ResponseForMethod<Path extends keyof paths, Verb extends HttpVerb> =
  paths[Path] extends Record<Verb, {
    responses: {
      200: {
        content: {
          'application/json': infer ResponseType,  // <-- the "infer"
        }
      }
    }
  }> ? ResponseType : never

declare function post<Path extends keyof paths>(
  endpoint: Path
): Promise<ResponseForMethod<Path, 'post'>>;

const response = post('/users');
*/