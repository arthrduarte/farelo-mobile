/* eslint-disable */
module.exports = {
  root: true,
  env: {
    es2023: true,
    node: true,
    browser: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
  ],
  extends: [
    // React Native + Expo base rules
    "@react-native",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    // Turns off stylistic rules that Prettier handles
    "eslint-config-prettier",
  ],
  settings: {
    react: { version: "detect" },
  },
  ignorePatterns: [
    "node_modules/",
    "android/",
    "ios/",
    ".expo/",
    "dist/",
    "build/",
    "coverage/",
  ],
  rules: {
    // TS/JS hygiene
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

    // React specifics
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "warn",

    // RN ergonomics (you can tighten later)
    // If @react-native/eslint-config flags inline styles too hard early on, keep warn:
    "react-native/no-inline-styles": "warn",
  },
  overrides: [
    // TS-specific tweaks
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-undef": "off",
      },
    },
  ],
};
