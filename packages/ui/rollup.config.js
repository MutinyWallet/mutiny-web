import fs from "fs";
import withSolid from "rollup-preset-solid";
import image from '@rollup/plugin-image';
import css from "rollup-plugin-css-only";

const stripCSSImport = () => {
  return {
    name: "strip-css-import",
    generateBundle() {
      const path = fs.realpathSync("./dist/source/index.jsx");
      const data = fs.readFileSync(path, { encoding: "utf8" });
      const transformed = data.replace(/^import ".\/index.css";/, "");
      fs.writeFileSync(path, transformed);
    },
  };
};

export default withSolid({
  input: "src/index.tsx",
  plugins: [
    image(),
    css({ output: "style.css" }),
    stripCSSImport()
  ],
});
