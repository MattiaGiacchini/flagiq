<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout />
</template>

<style>
/* Design System CSS Variables */
:root {
  /* Color Palette - Primary Brand */
  --color-primary: #4a5af7;
  --color-primary-hover: #3b4ac6;
  
  /* Color Palette - Performance Colors */
  --color-perfect: #10b981;
  --color-high: #4a5af7;
  --color-medium: #f59e0b;
  --color-low: #ef4444;
  
  /* Color Palette - Neutrals */
  --color-text: #1a1f3c;
  --color-text-secondary: #6b7280;
  --color-border: #e8ebf0;
  --color-background: #ffffff;
  --color-background-subtle: #f9fafb;
  
  /* Color Palette - Success/Error Indicators */
  --color-success: #10b981;
  --color-error: #ef4444;
  
  /* Typography Scale - Font Sizes */
  --font-size-h1: 2rem;           /* 32px */
  --font-size-h2: 1.5rem;         /* 24px */
  --font-size-h3: 1.25rem;        /* 20px */
  --font-size-body-large: 1.125rem; /* 18px */
  --font-size-body: 1rem;         /* 16px */
  --font-size-body-small: 0.9375rem; /* 15px */
  --font-size-display: 3.5rem;    /* 56px */
  --font-size-display-small: 2rem; /* 32px */
  
  /* Typography Scale - Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  
  /* Spacing System */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-xxl: 3rem;     /* 48px */
  
  /* Component-Specific Spacing */
  --spacing-card-padding: 1.5rem;
  --spacing-card-padding-large: 2.5rem;
  --spacing-card-gap: 1rem;
  --spacing-card-gap-desktop: 1.5rem;
  
  /* Border Radius Scale */
  --radius-sm: 0.5rem;     /* 8px */
  --radius-md: 0.75rem;    /* 12px */
  --radius-lg: 1rem;       /* 16px */
  --radius-xl: 1.5rem;     /* 24px */
  --radius-full: 999px;
  
  /* Shadow System */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 4px 32px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 8px 48px rgba(0, 0, 0, 0.12);
}

*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
}
</style>
