export let Engines = { };

export const registerEngine = (name, module) => {
  Engines[name] = async config => {
    const engimp = await import(module);
    const engcls = engimp.default;
    return new engcls(config);
  }
}

registerEngine('sqlite',   './Engine/Sqlite.js');
registerEngine('mysql',    './Engine/Mysql.js');
registerEngine('postgres', './Engine/Postgres.js');

export default Engines;
