/**
 * Custom Jest prepocesor
 * It is necessary for proper testing using Jest, Typescript and ESNext features
 * 
 * It customized version of
 * [this preprocessor](https://github.com/kulshekhar/ts-jest/issues/68#issuecomment-271075354)
 * 
 * I have removed `babel-preset-es2015` and replaced it with `transform-es2015-modules-commonjs`
 * plugin. It is the only necessary plugin when running node 7.7+ with --harmony flag.
 */

const babel = require('babel-core');
const tsc = require('typescript');
const crypto = require('crypto');
const fs = require('fs');
const jestPreset = require('babel-preset-jest');
const path = require('path');

const BABELRC_FILENAME = '.babelrc';

const cache = Object.create(null);
const tsconfig = require('./tsconfig.json');

const getBabelRC = (filename, { useCache }) => {
  const paths = [];
  let directory = filename;

  while (directory !== (directory = path.dirname(directory))) {
    if (useCache && cache[directory]) {
      break;
    }

    paths.push(directory);
    const configFilePath = path.join(directory, BABELRC_FILENAME);
    if (fs.existsSync(configFilePath)) {

      cache[directory] = fs.readFileSync(configFilePath, 'utf8');
      break;
    }
  }

  paths.forEach(directoryPath => {
    cache[directoryPath] = cache[directory];
  });

  return cache[directory] || '';
};

const createTransformer = options => {
  options = Object.assign({}, options, {
    presets: [...(options && options.presets || []), jestPreset],
    plugins: [...(options && options.plugins || []), "transform-es2015-modules-commonjs"],
    retainLines: true,
  });
  delete options.cacheDirectory;

  return {
    canInstrument: true,
    getCacheKey(
      fileData,
      filename,
      configString,
      { instrument, watch }
    ) {
      return crypto.createHash('md5')
        .update(fileData)
        .update(configString)
        .update(getBabelRC(filename, { useCache: !watch }))
        .update(instrument ? 'instrument' : '')
        .digest('hex');
    },
    process(
      src,
      filename,
      config,
      transformOptions
    ) {
      let plugins = options.plugins || [];

      if (transformOptions && transformOptions.instrument) {
        plugins = plugins.concat([
          [
            require('babel-plugin-istanbul').default,
            {
              cwd: config.rootDir,
              exclude: [],
            },
          ],
        ]);
      }

      const diag = [];
      const tsOutput = tsc.transpileModule(src, { diagnostics: diag, filename, compilerOptions: tsconfig.compilerOptions, reportDiagnostics: true });

      if (babel.util.canCompile(filename) || true) {
        const babelOutput = babel.transform(
          tsOutput.outputText,
          Object.assign({}, options, { filename, plugins })
        );

        return babelOutput.code;
      }
    },
  };
};

module.exports = createTransformer();