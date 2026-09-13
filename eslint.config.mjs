import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

// ESLint 9+ шукає лише flat-конфіг; без цього файлу `npm run lint` падав із
// «couldn't find an eslint.config.*». Набір — рекомендований Next 16:
// core-web-vitals (next + react + react-hooks) і typescript-eslint.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Гітігнорена стороння копія проєкту й резервні копії фото.
    "public/**",
    "backup-stone-images/**",
    "supabase/**",
    "scripts/**",
  ]),
  {
    rules: {
      // Апострофи й лапки в українських текстах JSX («пам'ятник») — 36 хибних
      // спрацювань; React їх екранує сам.
      "react/no-unescaped-entities": "off",
      // Правила React Compiler у eslint-plugin-react-hooks 7: шаблони на кшталт
      // setMounted(true) в ефекті зустрічаються по всьому коду. Лишаємо як
      // попередження, щоб бачити їх, але не блокувати lint.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/set-state-in-render": "warn",
    },
  },
])

export default eslintConfig
