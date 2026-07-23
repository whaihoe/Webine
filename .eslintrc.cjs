module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", "node_modules"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: [
        "api/**/*.ts",
        "dev/**/*.ts",
        "scripts/**/*.mjs",
        "server/**/*.ts",
        "tests/**/*.mjs",
        "vite.config.ts",
      ],
      env: { browser: false, node: true },
    },
  ],
};
