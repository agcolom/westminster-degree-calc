import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat();

export default [
  ...compat.config({
    extends: ["next/core-web-vitals"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-interface": "off"
    }
  })
];
