import type { Preview } from '@storybook/react-vite';
import '@fontsource-variable/inter';
import '@fontsource-variable/newsreader';
import '@fontsource-variable/jetbrains-mono';
import './storybook.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      document.documentElement.classList.toggle('dark', context.globals.theme === 'dark');
      return Story();
    },
  ],
  parameters: {
    layout: 'centered',
    a11y: { test: 'error' },
  },
};

export default preview;
