export let Drivers = { };

export const registerDriver = (name, module) => {
  Drivers[name] = async config => {
    // console.log('registering %s driver from %s', name, module);
    const drimp = await import(module);
    const drcls = drimp.default;
    // console.log('imported driver: ', drcls);
    return new drcls(config);
  }
}

registerDriver('sqlite', './Driver/Sqlite/index.js');

export default Drivers;
