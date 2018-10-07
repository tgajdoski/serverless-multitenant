module.exports = {
  parser: "babel-eslint",
  env: {
    "es6": true,
    "node": true,
    "mocha": true
  },
  extends: "eslint:recommended",
  rules: {
    "graphql/template-strings": ['error', {
      env: 'apollo',
      schemaJson: require('./src/app/schemas/merged-schema.json'),
    },
      {
        env: 'literal',
        schemaJson: require('./src/app/schemas/merged-schema.json')
      }],
    "indent": [
      "warn",
      4
    ],
    "semi": [
      "warn",
      "always"
    ],
    "no-console": [
      0
    ],
    "no-unused-vars": [
      1
    ],
    "no-unexpected-multiline": [
      1
    ]
  },
  plugins: [
    'graphql'
  ]
}