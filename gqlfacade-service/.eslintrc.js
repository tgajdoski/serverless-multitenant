/**
 * Linting rules + graphql pluigin for checking gql literals
 * (The mentioned literal string tags [gqlfs, gqlus] need to be defined in the code)
 */
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
      env: 'relay',
      schemaJson: require('./client-fileservice/fileservice.json'),
      tagName: 'gqlfs'
    },
      {
        env: 'relay',
        schemaJson: require('./client-userservice/userservice.json'),
        tagName: 'gqlus'
      },
      {
        env: 'relay',
        schemaJson: require('./client-projectservice/projectservice.json'),
        tagName: 'gqlps'
      }
      ],
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