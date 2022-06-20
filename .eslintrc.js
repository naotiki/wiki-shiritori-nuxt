module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "@nuxtjs/eslint-config-typescript",
    "plugin:nuxt/recommended",
    "prettier",
  ],
  rules: {
    "vue/no-unused-vars": "off",
  },
}
