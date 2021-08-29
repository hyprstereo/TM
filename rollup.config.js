import svg from 'rollup-plugin-svg'
import rootImport from 'rollup-plugin-root-import';
// export default {
//   input: "./src/controllers/tomi/index.js",
//   external:['/node_modules/**', '/build/**'],
//   output: [
//     {
//       file: "./public/tomi.js",
//       paths: {
//         '/js': './js',
//         '/build': './build'
//       }
//     },
//   ],
  
//   plugins: [
//     rootImport({
//       root: `${__dirname}/public/`,
//       useInput: `prepend`,
//       extensions: '.js'
//     }),
//     svg(),
//   ]
// };
export default {
  input: "./src/app.js",
  external:['/node_modules/**', '/build/**'],
  output: [
    {
      file: "./public/iocmain.js",
      paths: {
        '/js': './js',
        '/build': './build'
      }
    },
  ],
  
  plugins: [
    rootImport({
      root: `${__dirname}/public/`,
      useInput: `prepend`,
      extensions: '.js'
    }),
    svg(),
  ]
};

// plugin
export function svgResolverPlugin() {
  return {
    resolveId(source, importer) {
      if (source.endsWith(".svg")) {
        return path.resolve(path.dirname(importer), source);
      }
    },
    load(id) {
      if (id.endsWith(".svg")) {
        const referenceId = this.emitFile({
          type: "asset",
          name: path.basename(id),
          source: fs.readFileSync(id),
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      }
    },
  };
}

// plugin
export function glbResolverPlugin() {
  return {
    resolveId(source, importer) {
      if (source.endsWith(".glb")) {
        return path.resolve(path.dirname(importer), source);
      }
    },
    load(id) {
      if (id.endsWith(".glb")) {
        const referenceId = this.emitFile({
          type: "asset",
          name: path.basename(id),
          source: fs.readFileSync(id),
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      }
    },
  };
}
