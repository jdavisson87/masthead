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
    contrast: {
      description: 'Increased contrast',
      toolbar: {
        title: 'Contrast',
        icon: 'contrast',
        items: [
          { value: 'off', title: 'Standard contrast' },
          { value: 'more', title: 'Increased contrast' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', contrast: 'off' },
  decorators: [
    (Story, context) => {
      // Stories that demonstrate theming (ThemeToggle) set parameters.manageTheme to own the class themselves.
      if (!context.parameters.manageTheme) {
        document.documentElement.classList.toggle('dark', context.globals.theme === 'dark');
        document.documentElement.classList.toggle('contrast', context.globals.contrast === 'more');
      }
      return Story();
    },
  ],
  parameters: {
    layout: 'centered',
    a11y: { test: 'error' },
  },
};

export default preview;
