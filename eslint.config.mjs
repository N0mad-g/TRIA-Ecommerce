import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // .aiox-core/ é código interno do framework AIOX, sem relação com a
    // aplicação (achado ao rodar `npm run lint` pela primeira vez — mesmo
    // padrão do achado do jest.config.js na Story 1.1).
    ".aiox-core/**",
  ]),
  {
    // jest.config.js usa require() por convenção (doc oficial do Next.js
    // para o arquivo .js, ver jest.md) — não é código da aplicação.
    files: ["jest.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
