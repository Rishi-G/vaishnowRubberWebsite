import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['.next/', 'node_modules/', '_legacy/', 'src/app/(payload)/', 'src/payload-types.ts'] },
  {
    rules: {
      // The 3D stage is an imperative object by design: GSAP timelines and pointer handlers write plain
      // numbers into `stage.state`, and the stage renders when that changes. That is the single-owner
      // animation model, not a React state bug.
      'react-hooks/immutability': 'off',
      // Browser-only values (matchMedia, URL query) can only be read after hydration; reading them in an
      // effect avoids server/client markup mismatches.
      'react-hooks/set-state-in-effect': 'warn',
      'react/no-unescaped-entities': 'off',
    },
  },
]
export default config
