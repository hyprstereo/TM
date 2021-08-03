export default {
  excludes: "node_modules/**",
  input: "./src/app.js",
  output: {
    dir: "../dist/build",
    file: "tm.one.js",
    format: "cjs",
  },


  input: "./src/app.js",
  external: '/js/build',
  output: [
    {
      file: "./public/app/tm.one.js",
    },
  ],
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
