const fetch = require('node-fetch');
const replace = require('replace-in-file');
const loggerUtil = require('./logger');
const pluginName = 'esi-include';


const logger;

module.exports = async function esiInclude(options = {}) {

  validateOptions(options);
  logger = new loggerUtil(options);

  if (!options.esi.length || options.esi.length === 0) return null;

  try {
    options.replacers = await buildReplacers(options);

    let replaceOptions = {
      files: options.files,
      from: options.replacers.map(replacer => replacer.searchString),
      to: options.replacers.map(replacer => replacer.replaceString)
    }
    const results = await replace(replaceOptions);
    logger.verbose(`${JSON.stringify(results)}`);
  } catch (error) {
    throw new Error(`${pluginName} error: ${error}`);
  }
  return true;
}

function executeInclude(code, id, options) {
  options.replacers.forEach(replacer => {
    code = code.replace(replacer.searchString, replacer.replaceString);
  })
  return code;
}

async function buildReplacers(options) {
  let replacers = [];
  const promises = options.esi.map(async (esiItem) => {
    if (options.isLocalMode) {
      replacers.push(await buildFullFileInclude(esiItem));
    } else {
      replacers.push(buildEsiString(esiItem));
    }
    return new Promise((result, reject) => { result() });
  });

  await Promise.all(promises);
  return replacers;
}


function buildEsiString(esiItem) {
  if (!esiItem.noStore) {
    esiItem.noStore = 'true';
  }
  if (!esiItem.onError) {
    esiItem.onError = 'continue';
  }

  let tag = `<!--esi <esi:include src="${esiItem.src}" no-store="${esiItem.noStore ? 'on' : 'off'}" onerror="${esiItem.onError}"`;
  if (esiItem.ttl) {
    tag += ` ttl:"${esiItem.ttl}"`;
  }
  if (esiItem.maxwait) {
    tag += ` maxwait="${esiItem.maxwait}"`;
  }
  tag += `></esi:include>-->`;

  return {
    searchString: `<!--esi-include-webpack-plugin name=${esiItem.name}-->`,
    replaceString: tag
  };
}

async function buildFullFileInclude(esiItem) {
  let include = await fetchInclude(esiItem.src, esiItem.authorization);
  return {
    searchString: `<!--esi-include-webpack-plugin name=${esiItem.name}-->`,
    replaceString: include
  };
}

async function fetchInclude(uri, authorization) {
  let options = {};
  if (authorization) {
    options.headers = { 'authorization': authorization }
  }
  let res = await fetch(uri, options);
  let text = await res.text();
  logger.verbose(`${res.status} - ${uri} - ${text}`);

  if (res.status !== 200) {
    console.error(`${pluginName} errored attempting to fetch ${uri}, returned with code ${res.status}`);
  }

  return text;
}

function validateOptions(options) {
  const isLocal = process.env.buildTarget === 'LOCAL' || process.env.ENV === 'LOCAL' || process.env.ENV === 'DEV';
  const { esi } = options;

  options.isLocalMode = isLocal;
  options.verbose = (options.verbose === true) ? true : false;

  // Just do a little type checking
  if (esi === undefined || esi === null || !Array.isArray(esi)) {
    const errorMsg = `${pluginName}: esi property must exist and be an array.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Some more type checking
  options.esi.forEach(esiItem => {
    if (!esiItem.name || !esiItem.src) {
      const errorMsg = `${pluginName}: esi config item requires a name and src tag!`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  });
}
