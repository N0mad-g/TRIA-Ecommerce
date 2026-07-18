const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // .aiox-core/ tem sua própria suíte de testes internos do framework, sem
  // relação com o código do projeto (achado ao rodar `npm test` pela primeira
  // vez: pegou 11 suites, 2 delas do AIOX, travando o worker). testPathIgnorePatterns
  // em vez de `roots` porque nem todo diretório da app (components/, lib/) existe
  // ainda nesta story — roots exige que os diretórios já existam.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/.aiox-core/'],
};

module.exports = createJestConfig(config);
