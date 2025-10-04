# The Return of Attention - Design System Guide

## 📋 Overview
This comprehensive design system guide establishes the visual and interaction patterns for "The Return of Attention" meditation app. Based on the Figma designs and best practices for meditation/wellness applications, this guide ensures consistency, accessibility, and scalability across all interfaces.

**Design Philosophy**: Calm, focused, and minimal design that supports meditation practice without distraction.

---

## 🎨 COLOR PALETTE

### **Primary Color System**

#### **Blue Gradient Family (Primary)**
```css
/* Primary Gradient - Hero Sections */
--gradient-primary: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
--gradient-primary-dark: linear-gradient(135deg, #3B8CD4 0%, #00D2E4 100%);

/* Solid Blues */
--blue-50: #F0F9FF;
--blue-100: #E0F2FE;
--blue-200: #BAE6FD;
--blue-300: #7DD3FC;
--blue-400: #38BDF8;
--blue-500: #0EA5E9;  /* Primary */
--blue-600: #0284C7;  /* Interactive */
--blue-700: #0369A1;  /* Pressed */
--blue-800: #075985;
--blue-900: #0C4A6E;
```

#### **Teal/Cyan Accents**
```css
--teal-50: #F0FDFA;
--teal-100: #CCFBF1;
--teal-200: #99F6E4;
--teal-300: #5EEAD4;  /* Success states */
--teal-400: #2DD4BF;
--teal-500: #14B8A6;  /* Secondary actions */
--teal-600: #0D9488;
--teal-700: #0F766E;
--teal-800: #115E59;
--teal-900: #134E4A;
```

#### **Purple/Meditation Accents**
```css
--purple-50: #FAF5FF;
--purple-100: #F3E8FF;
--purple-200: #E9D5FF;
--purple-300: #D8B4FE;  /* PAHM Matrix highlights */
--purple-400: #C084FC;
--purple-500: #A855F7;  /* Mindfulness elements */
--purple-600: #9333EA;
--purple-700: #7C3AED;
--purple-800: #6B21A8;
--purple-900: #581C87;
```

### **Neutral Color System**

#### **Grays (Text & Backgrounds)**
```css
--white: #FFFFFF;
--gray-50: #F9FAFB;   /* Light backgrounds */
--gray-100: #F3F4F6;  /* Card backgrounds */
--gray-200: #E5E7EB;  /* Borders */
--gray-300: #D1D5DB;  /* Dividers */
--gray-400: #9CA3AF;  /* Disabled text */
--gray-500: #6B7280;  /* Secondary text */
--gray-600: #4B5563;  /* Primary text */
--gray-700: #374151;  /* Headings */
--gray-800: #1F2937;  /* Strong emphasis */
--gray-900: #111827;  /* High contrast */
--black: #000000;
```

### **Semantic Colors**

#### **Status & Feedback**
```css
/* Success */
--success-50: #ECFDF5;
--success-500: #10B981;  /* Completed states */
--success-700: #047857;

/* Warning */
--warning-50: #FFFBEB;
--warning-500: #F59E0B;  /* Attention needed */
--warning-700: #B45309;

/* Error */
--error-50: #FEF2F2;
--error-500: #EF4444;    /* Error states */
--error-700: #B91C1C;

/* Info */
--info-50: #EFF6FF;
--info-500: #3B82F6;     /* Information */
--info-700: #1D4ED8;
```

### **Meditation-Specific Colors**

#### **Emotional States (Daily Notes)**
```css
--happy: #FDE047;        /* 😊 Happy */
--excited: #F97316;      /* 🤩 Excited */
--calm: #A78BFA;         /* 😌 Calm */
--confident: #FB7185;    /* 💪 Confident */
--peaceful: #6EE7B7;     /* 🕊️ Peaceful */
--energetic: #FBBF24;    /* ⚡ Energetic */
--neutral: #9CA3AF;      /* 😐 Neutral */
--tired: #8B5CF6;        /* 😴 Tired */
--bored: #64748B;        /* 😑 Bored */
--sad: #3B82F6;          /* 😢 Sad */
--anxious: #F59E0B;      /* 😰 Anxious */
--frustrated: #EF4444;   /* 😤 Frustrated */
```

### **PAHM Matrix Colors**
```css
--pahm-present: #10B981;     /* Center - Present moment */
--pahm-nostalgia: #8B5CF6;   /* Past pleasant */
--pahm-likes: #F59E0B;       /* Desires/cravings */
--pahm-anticipation: #3B82F6; /* Future excitement */
--pahm-past: #6B7280;        /* Neutral past */
--pahm-future: #6B7280;      /* Neutral future */
--pahm-regret: #EF4444;      /* Past aversion */
--pahm-dislikes: #DC2626;    /* Present aversion */
--pahm-worry: #B91C1C;       /* Future aversion */
```

---

## 🔤 TYPOGRAPHY

### **Font Families**
```css
/* Primary Font Stack */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Display Font (Headings) */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace (Code/Technical) */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

### **Font Sizes & Line Heights**
```css
/* Display Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */

/* Line Heights */
--leading-tight: 1.25;   /* Headings */
--leading-snug: 1.375;   /* Subheadings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625; /* Long-form content */
--leading-loose: 2;      /* Very relaxed reading */
```

### **Font Weights**
```css
--font-thin: 100;
--font-extralight: 200;
--font-light: 300;
--font-normal: 400;      /* Body text */
--font-medium: 500;      /* Emphasis */
--font-semibold: 600;    /* Subheadings */
--font-bold: 700;        /* Headings */
--font-extrabold: 800;   /* Display */
--font-black: 900;       /* Heavy emphasis */
```

### **Typography Hierarchy**

#### **Headings**
```css
/* H1 - Page Titles */
.text-h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--gray-900);
  margin-bottom: 1.5rem;
}

/* H2 - Section Titles */
.text-h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--gray-800);
  margin-bottom: 1rem;
}

/* H3 - Subsection Titles */
.text-h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--gray-700);
  margin-bottom: 0.75rem;
}

/* H4 - Component Titles */
.text-h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}
```

#### **Body Text**
```css
/* Primary Body */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-600);
}

/* Secondary Body */
.text-body-sm {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-500);
}

/* Large Body */
.text-body-lg {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--gray-600);
}
```

#### **Special Text**
```css
/* Meditation Quote */
.text-quote {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-relaxed);
  color: var(--gray-700);
  font-style: italic;
}

/* Caption */
.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-400);
}

/* Label */
.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--gray-700);
}
```

---

## 📏 SPACING SYSTEM

### **Base Spacing Scale**
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
--space-40: 10rem;    /* 160px */
--space-48: 12rem;    /* 192px */
--space-56: 14rem;    /* 224px */
--space-64: 16rem;    /* 256px */
```

### **Component Spacing**
```css
/* Content Spacing */
--content-padding: var(--space-6);     /* 24px */
--content-gap: var(--space-4);         /* 16px */
--section-gap: var(--space-12);        /* 48px */

/* Layout Spacing */
--layout-padding: var(--space-4);      /* Mobile: 16px */
--layout-padding-lg: var(--space-8);   /* Desktop: 32px */
--layout-max-width: 1280px;            /* Container max-width */

/* Card Spacing */
--card-padding: var(--space-6);        /* 24px */
--card-gap: var(--space-4);            /* 16px */
```

---

## 📐 BORDER RADIUS

### **Radius Scale**
```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Fully rounded */
```

### **Component Radius**
```css
--btn-radius: var(--radius-lg);        /* Buttons */
--card-radius: var(--radius-xl);       /* Cards */
--input-radius: var(--radius-md);      /* Form inputs */
--modal-radius: var(--radius-2xl);     /* Modals */
--avatar-radius: var(--radius-full);   /* Profile pictures */
```

---

## 🎭 SHADOWS & ELEVATION

### **Shadow System**
```css
/* Elevation Levels */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Colored Shadows */
--shadow-blue: 0 4px 14px 0 rgba(59, 130, 246, 0.15);
--shadow-teal: 0 4px 14px 0 rgba(20, 184, 166, 0.15);
--shadow-purple: 0 4px 14px 0 rgba(168, 85, 247, 0.15);
```

### **Component Shadows**
```css
--card-shadow: var(--shadow-base);
--modal-shadow: var(--shadow-xl);
--dropdown-shadow: var(--shadow-lg);
--button-shadow: var(--shadow-sm);
--button-shadow-hover: var(--shadow-md);
```

---

## 🔘 COMPONENT SYSTEM

### **Button Components**

#### **Primary Button**
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--btn-radius);
  font-weight: var(--font-medium);
  box-shadow: var(--button-shadow);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--gradient-primary-dark);
  box-shadow: var(--button-shadow-hover);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

#### **Secondary Button**
```css
.btn-secondary {
  background: var(--teal-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--btn-radius);
  font-weight: var(--font-medium);
  box-shadow: var(--button-shadow);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--teal-600);
  box-shadow: var(--button-shadow-hover);
  transform: translateY(-1px);
}
```

#### **Button Sizes**
```css
/* Small Button */
.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

/* Medium Button (Default) */
.btn-md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
}

/* Large Button */
.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
}

/* Extra Large Button */
.btn-xl {
  padding: var(--space-5) var(--space-10);
  font-size: var(--text-xl);
}
```

### **Card Components**

#### **Base Card**
```css
.card {
  background: white;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: var(--card-padding);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

#### **Meditation Session Card**
```css
.session-card {
  @extend .card;
  position: relative;
  overflow: hidden;
}

.session-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
}

.session-card.completed::before {
  background: var(--success-500);
}

.session-card.locked::before {
  background: var(--gray-300);
}
```

#### **Stage Card**
```css
.stage-card {
  @extend .card;
  text-align: center;
  position: relative;
}

.stage-card .stage-number {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  width: 40px;
  height: 40px;
  background: var(--blue-500);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
}
```

### **Form Components**

#### **Input Field**
```css
.input {
  width: 100%;
  padding: var(--space-3);
  border: 2px solid var(--gray-200);
  border-radius: var(--input-radius);
  font-size: var(--text-base);
  background: white;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:invalid {
  border-color: var(--error-500);
}

.input:invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

#### **Form Labels**
```css
.form-label {
  @extend .text-label;
  display: block;
  margin-bottom: var(--space-2);
}

.form-label.required::after {
  content: '*';
  color: var(--error-500);
  margin-left: var(--space-1);
}
```

#### **Validation Messages**
```css
.form-error {
  color: var(--error-500);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.form-success {
  color: var(--success-500);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}

.form-hint {
  color: var(--gray-400);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

### **PAHM Matrix Component**

#### **Matrix Grid**
```css
.pahm-matrix {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  max-width: 400px;
  margin: 0 auto;
  padding: var(--space-6);
  background: var(--gray-50);
  border-radius: var(--radius-2xl);
}

.pahm-cell {
  aspect-ratio: 1;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.pahm-cell:hover {
  border-color: var(--blue-300);
  background: var(--blue-50);
  transform: scale(1.02);
}

.pahm-cell.active {
  border-color: var(--blue-500);
  background: var(--blue-100);
  box-shadow: var(--shadow-blue);
}

.pahm-cell.center {
  border-color: var(--pahm-present);
  background: rgba(16, 185, 129, 0.1);
}

.pahm-cell.center.active {
  background: rgba(16, 185, 129, 0.2);
  box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.25);
}
```

### **Emotional Check-in Grid**

#### **Emoji Grid**
```css
.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
  padding: var(--space-6);
}

.emotion-card {
  @extend .card;
  text-align: center;
  padding: var(--space-4);
  cursor: pointer;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.emotion-card:hover {
  background: var(--blue-50);
  border-color: var(--blue-200);
}

.emotion-card.selected {
  background: var(--blue-100);
  border-color: var(--blue-500);
  box-shadow: var(--shadow-blue);
}

.emotion-emoji {
  font-size: 3rem;
  line-height: 1;
}

.emotion-label {
  font-weight: var(--font-medium);
  color: var(--gray-700);
}
```

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints**
```css
/* Mobile First Approach */
--screen-sm: 640px;   /* Small tablets */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Small desktops */
--screen-xl: 1280px;  /* Large desktops */
--screen-2xl: 1536px; /* Extra large screens */
```

### **Container System**
```css
.container {
  width: 100%;
  padding-left: var(--layout-padding);
  padding-right: var(--layout-padding);
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding-left: var(--layout-padding-lg);
    padding-right: var(--layout-padding-lg);
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: var(--layout-max-width);
  }
}
```

### **Responsive Typography**
```css
/* Fluid Typography */
.text-h1 {
  font-size: clamp(2rem, 4vw, 3rem);
}

.text-h2 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
}

.text-h3 {
  font-size: clamp(1.25rem, 2.5vw, 1.875rem);
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .btn-lg {
    width: 100%;
    padding: var(--space-4) var(--space-6);
  }
  
  .pahm-matrix {
    max-width: 300px;
    gap: var(--space-1);
  }
  
  .emotion-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### **Touch-Friendly Design**
```css
/* Minimum touch targets */
.btn, .pahm-cell, .emotion-card {
  min-height: 44px;
  min-width: 44px;
}

/* Increased spacing on mobile */
@media (max-width: 767px) {
  .pahm-cell {
    min-height: 60px;
    min-width: 60px;
  }
  
  .emotion-card {
    min-height: 80px;
  }
}
```

---

## 🎯 ACCESSIBILITY

### **Focus States**
```css
/* Global focus ring */
*:focus {
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
}

/* Button focus */
.btn:focus {
  outline: 2px solid var(--blue-500);
  outline-offset: 2px;
  box-shadow: var(--button-shadow-hover);
}

/* Input focus - handled in component */
```

### **Color Contrast**
```css
/* Ensure WCAG AA compliance */
/* All text has minimum 4.5:1 contrast ratio */
/* Large text has minimum 3:1 contrast ratio */

/* High contrast mode support */
@media (prefers-contrast: high) {
  .card {
    border-width: 2px;
    border-color: var(--gray-400);
  }
  
  .btn {
    border: 2px solid currentColor;
  }
}
```

### **Reduced Motion**
```css
/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **Screen Reader Support**
```css
/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## ⚡ ANIMATIONS & TRANSITIONS

### **Base Transitions**
```css
/* Timing functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Duration scale */
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### **Common Animations**
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse (for meditation timer) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Breathing animation */
@keyframes breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### **Page Transitions**
```css
.page-enter {
  animation: slideUp var(--duration-300) var(--ease-out);
}

.modal-enter {
  animation: scaleIn var(--duration-200) var(--ease-out);
}

.loading-pulse {
  animation: pulse var(--duration-1000) var(--ease-in-out) infinite;
}
```

---

## 🔄 THEME SYSTEM (Color Palette Flexibility)

### **CSS Custom Properties Structure**
```css
/* Theme structure allows easy color palette changes */
:root {
  /* Primary theme colors */
  --theme-primary-50: var(--blue-50);
  --theme-primary-500: var(--blue-500);
  --theme-primary-600: var(--blue-600);
  --theme-primary-700: var(--blue-700);
  
  /* Secondary theme colors */
  --theme-secondary-50: var(--teal-50);
  --theme-secondary-500: var(--teal-500);
  --theme-secondary-600: var(--teal-600);
  
  /* Accent theme colors */
  --theme-accent-50: var(--purple-50);
  --theme-accent-500: var(--purple-500);
  --theme-accent-600: var(--purple-600);
}

/* Alternative theme example */
[data-theme="warm"] {
  --theme-primary-50: #FFF7ED;
  --theme-primary-500: #EA580C;
  --theme-primary-600: #DC2626;
  --theme-primary-700: #B91C1C;
  
  --theme-secondary-50: #FEFCE8;
  --theme-secondary-500: #EAB308;
  --theme-secondary-600: #CA8A04;
}

[data-theme="forest"] {
  --theme-primary-50: #F0FDF4;
  --theme-primary-500: #16A34A;
  --theme-primary-600: #15803D;
  --theme-primary-700: #166534;
  
  --theme-secondary-50: #ECFCCB;
  --theme-secondary-500: #84CC16;
  --theme-secondary-600: #65A30D;
}
```

### **Theme Implementation**
```css
/* Use theme variables instead of direct colors */
.btn-primary {
  background: linear-gradient(135deg, var(--theme-primary-500), var(--theme-primary-600));
  color: white;
}

.btn-secondary {
  background: var(--theme-secondary-500);
  color: white;
}

.accent-element {
  color: var(--theme-accent-500);
}
```

---

## 📐 LAYOUT PATTERNS

### **Hero Section**
```css
.hero {
  background: var(--gradient-primary);
  padding: var(--space-20) 0;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg...') no-repeat center;
  opacity: 0.1;
  pointer-events: none;
}
```

### **Dashboard Grid**
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### **Navigation Bar**
```css
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--gray-200);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-content {
  @extend .container;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-nav {
  display: flex;
  gap: var(--space-6);
  align-items: center;
}

@media (max-width: 767px) {
  .navbar-nav {
    gap: var(--space-4);
  }
}
```

---

## 🔧 UTILITY CLASSES

### **Common Utilities**
```css
/* Display */
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.inline-flex { display: inline-flex; }
.grid { display: grid; }

/* Flexbox */
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }

/* Text alignment */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Width */
.w-full { width: 100%; }
.w-auto { width: auto; }
.max-w-xs { max-width: 20rem; }
.max-w-sm { max-width: 24rem; }
.max-w-md { max-width: 28rem; }
.max-w-lg { max-width: 32rem; }
.max-w-xl { max-width: 36rem; }

/* Margin */
.m-0 { margin: 0; }
.m-auto { margin: auto; }
.mt-4 { margin-top: var(--space-4); }
.mb-4 { margin-bottom: var(--space-4); }
.ml-4 { margin-left: var(--space-4); }
.mr-4 { margin-right: var(--space-4); }

/* Padding */
.p-0 { padding: 0; }
.p-4 { padding: var(--space-4); }
.pt-4 { padding-top: var(--space-4); }
.pb-4 { padding-bottom: var(--space-4); }
.pl-4 { padding-left: var(--space-4); }
.pr-4 { padding-right: var(--space-4); }
```

---

## 🎨 DESIGN TOKENS

### **Implementation in Next.js**
```css
/* globals.css */
@import 'design-tokens.css';

/* Tailwind CSS configuration */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--blue-50)',
          500: 'var(--blue-500)',
          600: 'var(--blue-600)',
          // ... etc
        },
        gray: {
          50: 'var(--gray-50)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          // ... etc
        }
      },
      fontFamily: {
        sans: ['var(--font-primary)'],
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        // ... etc
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'base': 'var(--radius-base)',
        // ... etc
      }
    }
  }
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### **Phase 1: Foundation**
- [ ] Set up CSS custom properties for all design tokens
- [ ] Implement base typography styles
- [ ] Create spacing and layout utilities
- [ ] Establish color palette with theme support
- [ ] Set up responsive breakpoints

### **Phase 2: Components**
- [ ] Button component system
- [ ] Card components
- [ ] Form components with validation states
- [ ] Navigation components
- [ ] PAHM Matrix component
- [ ] Emotional check-in grid

### **Phase 3: Patterns**
- [ ] Page layouts (hero, dashboard, forms)
- [ ] Modal and overlay patterns
- [ ] Loading and empty states
- [ ] Error and success states

### **Phase 4: Interactions**
- [ ] Hover and focus states
- [ ] Transitions and animations
- [ ] Touch interactions for mobile
- [ ] Accessibility enhancements

### **Phase 5: Theming**
- [ ] Theme switching functionality
- [ ] Dark mode support (future)
- [ ] Color palette variations
- [ ] User preference persistence

---

## 📚 BEST PRACTICES

### **Meditation App Specific Guidelines**

1. **Calming Colors**: Use soft, muted colors that promote relaxation
2. **Breathing Room**: Generous whitespace to reduce visual stress
3. **Clear Hierarchy**: Important information stands out without being jarring
4. **Touch-Friendly**: All interactive elements meet minimum touch target sizes
5. **Distraction-Free**: Minimize unnecessary animations during meditation sessions

### **Accessibility Standards**

1. **WCAG AA Compliance**: All text meets contrast requirements
2. **Keyboard Navigation**: All interactive elements are keyboard accessible
3. **Screen Reader Support**: Proper semantic markup and ARIA labels
4. **Motion Sensitivity**: Respect `prefers-reduced-motion` settings
5. **Focus Management**: Clear focus indicators and logical tab order

### **Performance Considerations**

1. **CSS Custom Properties**: Enable easy theming without CSS rebuilds
2. **Component Reusability**: Consistent patterns reduce CSS bloat
3. **Mobile First**: Optimize for mobile performance first
4. **Critical Path**: Inline critical styles for faster initial render
5. **Progressive Enhancement**: Ensure functionality without JavaScript

### **Maintenance Guidelines**

1. **Design Tokens**: Use variables for all design decisions
2. **Component Documentation**: Document all component variations
3. **Version Control**: Track design system changes
4. **Cross-Browser Testing**: Test on all supported browsers
5. **Regular Audits**: Periodically review and update components

---

## 🚀 GETTING STARTED

### **Quick Start**
1. Copy design token CSS variables to your `globals.css`
2. Implement base typography and layout styles
3. Create button and card components first
4. Build out form components
5. Add PAHM Matrix and emotion grid components
6. Implement responsive patterns
7. Add animations and interactions
8. Test accessibility and performance

### **File Structure**
```
styles/
├── globals.css           # Global styles and imports
├── design-tokens.css     # All CSS custom properties
├── base.css             # Base typography and elements
├── components/          # Component-specific styles
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   └── pahm-matrix.css
├── utilities.css        # Utility classes
└── themes/             # Theme variations
    ├── default.css
    ├── warm.css
    └── forest.css
```

This comprehensive design system provides a solid foundation for building "The Return of Attention" meditation app with consistency, scalability, and accessibility in mind!