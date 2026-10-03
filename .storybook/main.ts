import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  // Storybook should not inherit the library-mode build or the d.ts plugin.
  viteFinal: (config) => ({
    ...config,
    build: { ...config.build, lib: undefined },
    plugins: (config.plugins ?? []).filter(
      (p) => !(p && typeof p === 'object' && 'name' in p && p.name === 'vite:dts'),
    ),
  }),
};

export default config;
