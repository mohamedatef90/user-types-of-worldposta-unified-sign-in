# WorldPosta SSO Design System

This document outlines the comprehensive design system for the WorldPosta SSO application. It ensures clarity, consistency, and efficiency across all WorldPosta services.

---

## Table of Contents

1. [Design Philosophy & Principles](#1-design-philosophy--principles)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing & Sizing](#4-spacing--sizing)
5. [Border Radius & Shadows](#5-border-radius--shadows)
6. [Icons](#6-icons)
7. [Components](#7-components)
8. [Layout Patterns](#8-layout-patterns)
9. [Form Patterns](#9-form-patterns)
10. [Status Indicators & Badges](#10-status-indicators--badges)
11. [Interactive States](#11-interactive-states)
12. [Animations & Transitions](#12-animations--transitions)
13. [Dark Mode Implementation](#13-dark-mode-implementation)
14. [Responsive Design](#14-responsive-design)
15. [Accessibility](#15-accessibility)

---

## 1. Design Philosophy & Principles

Our design philosophy is centered on **clarity, consistency, and efficiency**.

- **Clarity**: The UI is designed to be intuitive and reduce cognitive load. Information is presented in a structured hierarchy, and interactive elements are clearly distinguished.
- **Consistency**: A user should be able to predict how an element will behave, regardless of which service or page they are on. Components like buttons, cards, and forms share the same visual language.
- **Efficiency**: Workflows are designed to be streamlined. Users can accomplish their primary tasks with minimal friction, whether it's managing users, checking invoices, or configuring a service.
- **Scalability**: The system is built with modular components that can be reused and extended for new features and services without breaking the core design.
- **Accessibility**: We strive to meet accessibility standards by using semantic HTML, ARIA attributes, proper color contrast, and keyboard-navigable elements.

---

## 2. Color Palette

The color system is designed with distinct roles for each color and supports both light and dark modes.

### Primary Colors

| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary/Brand** | `#679a41` (WorldPosta Green) | `emerald-500` / `emerald-600` | Primary buttons, active navigation, links, focus rings, key icons |
| **Secondary** | `#293c51` (Dark Slate Blue) | `sky-600` (Vibrant Blue) | Secondary buttons, primary text, headings |

### Neutral Colors

| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Background (Page)** | `#fcfcfc` (Near White) | `#1a202c` (Slate 900) | Main page backgrounds |
| **Background (Subtle)** | `#f8f8f8` (Subtle Gray) | `slate-800` | Containers, sidebars |
| **Surface** | `#ffffff` (White) | `slate-800` | Cards, Modals, Popovers |

### Text Colors

| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary Text** | `#293c51` | `gray-200` | Main body copy, headings |
| **Secondary Text** | `gray-500` | `gray-400` | Labels, placeholders, hints |
| **Muted Text** | `gray-400` | `gray-500` | Disabled states, metadata |

### Border Colors

| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Default** | `gray-200` | `slate-700` | Card outlines, separators |
| **Emphasis** | `gray-300` | `gray-700` | Input fields, focused elements |
| **Subtle** | `gray-100` | `gray-800` | Subtle dividers |

### Status Colors

| Status | Light Mode Action | Light Mode BG | Dark Mode Action | Dark Mode BG | Usage |
|--------|-------------------|---------------|------------------|--------------|-------|
| **Success** | `green-500` | `green-100` | `green-400` | `green-900` | Success indicators, 'Active' status |
| **Danger** | `red-600` | `red-100` | `red-500` | `red-900` | Delete actions, errors, critical alerts |
| **Warning** | `yellow-600` | `yellow-100` | `yellow-500` | `yellow-900` | 'Pending'/'Suspended' status, warnings |
| **Info** | `blue-600` | `blue-100` | `blue-400` | `blue-900` | Informational messages |

### Semantic Color Variables

```css
/* Light Mode */
--color-primary: #679a41;
--color-primary-hover: #588836;
--color-secondary: #293c51;
--color-background: #fcfcfc;
--color-surface: #ffffff;
--color-text-primary: #293c51;
--color-text-secondary: #6b7280; /* gray-500 */

/* Dark Mode */
--color-primary-dark: emerald-500;
--color-primary-hover-dark: emerald-600;
--color-secondary-dark: sky-600;
--color-background-dark: #1a202c;
--color-surface-dark: slate-800;
--color-text-primary-dark: #e5e7eb; /* gray-200 */
--color-text-secondary-dark: #9ca3af; /* gray-400 */
```

---

## 3. Typography

We use a system font stack for optimal performance and a native feel across all operating systems.

### Font Family

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

All elements use `antialiased` class for improved text rendering.

### Type Hierarchy

| Element | Classes | Size | Weight | Usage |
|---------|---------|------|--------|-------|
| **Page Title (h1)** | `text-3xl font-bold` | 30px | 700 | Main page headings |
| **Section Title (h2)** | `text-xl font-semibold` | 20px | 600 | Card titles, section headings |
| **Sub-heading (h3)** | `text-lg font-medium` | 18px | 500 | Subsection titles |
| **Body Large** | `text-base` | 16px | 400 | Primary paragraphs |
| **Body Default** | `text-sm` | 14px | 400 | Most content |
| **Caption/Label** | `text-xs` | 12px | 400-500 | Labels, hints, metadata |

### Font Weight Scale

| Weight | Class | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Navigation items, labels |
| 600 | `font-semibold` | Card titles, button text |
| 700 | `font-bold` | Page titles, emphasis |

### Text Colors by Context

```tsx
// Light Mode
<h1 className="text-[#293c51]">Page Title</h1>
<p className="text-gray-500">Secondary text</p>

// Dark Mode
<h1 className="dark:text-gray-100">Page Title</h1>
<p className="dark:text-gray-400">Secondary text</p>
```

---

## 4. Spacing & Sizing

Based on Tailwind's default 4px base unit.

### Padding Standards

| Context | Classes | Pixels |
|---------|---------|--------|
| **Cards** | `p-4` or `p-6` | 16px or 24px |
| **Buttons (sm)** | `px-3 py-1.5` | 12px × 6px |
| **Buttons (md)** | `px-4 py-2` | 16px × 8px |
| **Buttons (lg)** | `px-6 py-3` | 24px × 12px |
| **Form Fields** | `px-3 py-2` | 12px × 8px |
| **Modals** | `px-4 pt-5 pb-4 sm:p-6` | Responsive |

### Gap & Margin Standards

| Context | Classes | Pixels |
|---------|---------|--------|
| **Card Grid** | `gap-6` | 24px |
| **Between Items** | `gap-2` to `gap-4` | 8px to 16px |
| **Vertical Stack** | `space-y-4` or `space-y-6` | 16px or 24px |
| **Horizontal Items** | `space-x-2` or `space-x-3` | 8px or 12px |
| **Section Margin** | `mb-4` or `mb-6` | 16px or 24px |

### Common Spacing Classes

```tsx
// Vertical spacing between elements
<div className="space-y-4">...</div>

// Grid with gaps
<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">...</div>

// Inline spacing
<div className="flex items-center space-x-2">...</div>
```

---

## 5. Border Radius & Shadows

### Border Radius Scale

| Class | Radius | Usage |
|-------|--------|-------|
| `rounded-full` | 9999px | Circular elements, avatars, pills |
| `rounded-2xl` | 16px | Prominent cards, featured elements |
| `rounded-xl` | 12px | Cards, modals |
| `rounded-lg` | 8px | Larger elements, containers |
| `rounded-md` | 6px | Buttons, form fields |
| `rounded` | 4px | Small elements |

### Shadow Levels

| Class | Usage |
|-------|-------|
| `shadow-sm` | Subtle depth, inactive cards |
| `shadow` | Default card state |
| `shadow-md` | Cards on hover |
| `shadow-lg` | Modals, prominent cards, dropdowns |
| `shadow-xl` | High-emphasis overlays |
| `shadow-inner` | Active navigation items (inset) |

### Dark Mode Shadows

```tsx
// Light mode
<div className="shadow-lg">...</div>

// Dark mode (with opacity adjustment)
<div className="shadow-lg dark:shadow-slate-900/50">...</div>
```

---

## 6. Icons

### Icon Library

**FontAwesome 6.5.2** (via CDN)

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
```

### Icon Prefixes

| Prefix | Style | Usage |
|--------|-------|-------|
| `fas` | Solid | Primary icons, actions |
| `far` | Regular | Secondary icons, outlines |
| `fab` | Brands | Brand/social icons |

### Common Icons by Category

**Navigation**
- `fas fa-bars` - Hamburger menu
- `fas fa-angles-left` / `fas fa-angles-right` - Sidebar collapse
- `fas fa-times` - Close/dismiss
- `fas fa-chevron-down` / `fas fa-chevron-up` - Expand/collapse
- `fas fa-chevron-left` / `fas fa-chevron-right` - Pagination

**Actions**
- `fas fa-check` - Confirm
- `fas fa-trash` - Delete
- `fas fa-edit` / `fas fa-pen` - Edit
- `fas fa-eye` / `fas fa-eye-slash` - View/hide
- `fas fa-plus` - Add
- `fas fa-download` / `fas fa-upload` - Download/upload

**Status & Indicators**
- `fas fa-check-circle` - Success
- `fas fa-exclamation-triangle` - Warning
- `fas fa-times-circle` - Error
- `fas fa-info-circle` - Information
- `fas fa-bell` - Notifications
- `fas fa-circle-notch` - Loading spinner (with `fa-spin`)

**Change Indicators**
- `fas fa-arrow-up` - Increase
- `fas fa-arrow-down` - Decrease

### Icon Sizing

| Class | Size | Usage |
|-------|------|-------|
| `fa-xs` | 0.75em | Small inline icons |
| `fa-sm` | 0.875em | Compact buttons |
| `fa-lg` | 1.25em | Standard size |
| `fa-xl` | 1.5em | Emphasis |
| `fa-2x` | 2em | Large icons |
| `fa-3x` | 3em | Hero/feature icons |

### Icon Component Usage

```tsx
// Basic icon
<i className="fas fa-check text-[#679a41]" aria-hidden="true"></i>

// Fixed width (for alignment in lists)
<i className="fas fa-user fa-fw"></i>

// Spinning loader
<i className="fas fa-circle-notch fa-spin"></i>
```

---

## 7. Components

### 7.1 Button

The primary interactive element with multiple variants and sizes.

**Variants**

| Variant | Light Mode | Dark Mode | Usage |
|---------|------------|-----------|-------|
| `primary` | `bg-[#679a41]` hover: darker | `bg-emerald-500` hover: `emerald-600` | Main CTAs |
| `secondary` | `bg-[#293c51]` | `bg-sky-600` | Secondary actions |
| `danger` | `bg-red-600` | `bg-red-500` | Destructive actions |
| `outline` | Transparent + brand border | Transparent + emerald border | Tertiary actions |
| `ghost` | Fully transparent | Fully transparent | Subtle actions |
| `dark` | `bg-[#1F2937]` | Same | Dark themed |

**Sizes**

| Size | Classes | Height |
|------|---------|--------|
| `sm` | `h-8 px-3 text-sm` | 32px |
| `md` | `h-10 px-4 text-sm` | 40px |
| `lg` | `h-12 px-6 text-base` | 48px |
| `icon` | `p-2` | Square |

**States**
- Disabled: `opacity-75 cursor-not-allowed`
- Loading: Spinner icon + "Loading..." text

```tsx
<Button variant="primary" size="md" leftIcon="fas fa-save">
  Save Changes
</Button>
```

### 7.2 Card

Primary content container.

```tsx
// Structure
<div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">
      Card Title
    </h2>
    {/* Optional actions */}
  </div>
  <div>
    {/* Card content */}
  </div>
</div>
```

**Features**
- Optional title with actions slot
- Optional upscale button
- Consistent border and shadow

### 7.3 Modal

Dialog component with backdrop.

**Sizes**

| Size | Max Width |
|------|-----------|
| `sm` | `max-w-sm` |
| `md` | `max-w-md` |
| `lg` | `max-w-lg` |
| `xl` | `max-w-xl` |
| `2xl` | `max-w-2xl` |
| `3xl` | `max-w-3xl` |
| `4xl` | `max-w-4xl` |
| `5xl` | `max-w-5xl` |

```tsx
// Backdrop
<div className="fixed inset-0 bg-gray-500 dark:bg-black bg-opacity-75 dark:bg-opacity-60" />

// Modal container
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl">
  {/* Modal content */}
</div>
```

### 7.4 Form Field

Unified form input component supporting multiple types.

**Supported Types**: text, email, password, checkbox, select, textarea

```tsx
// Standard input field
<div className="mb-4">
  <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-200">
    Field Label
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
  <input
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
               rounded-md bg-white dark:bg-gray-700
               focus:outline-none focus:ring-2 focus:ring-[#679a41]
               focus:border-[#679a41] dark:focus:ring-emerald-400"
  />
  {error && (
    <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
  )}
  {hint && (
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
  )}
</div>
```

### 7.5 StatCard

Statistics display with icon and change indicator.

```tsx
<div className="bg-white dark:bg-slate-800 rounded-xl p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Metric Name</p>
      <p className="text-2xl font-bold text-[#293c51] dark:text-gray-100">1,234</p>
      <div className="flex items-center text-sm">
        <i className="fas fa-arrow-up text-green-500 mr-1"></i>
        <span className="text-green-500">+12%</span>
      </div>
    </div>
    <div className="text-2xl text-[#679a41] dark:text-emerald-400">
      <i className="fas fa-users"></i>
    </div>
  </div>
</div>
```

### 7.6 Toggle Switch

Binary toggle component.

**Sizes**
- `sm`: `w-10 h-5` with `w-4 h-4` knob
- `md`: `w-14 h-8` with `w-6 h-6` knob

**Colors**
- Active: `bg-[#679a41]`
- Inactive: `bg-gray-300 dark:bg-gray-600`

### 7.7 Stepper

Progress indicator with steps.

```tsx
// Step states
// Completed: checkmark icon with text-[#679a41]
// Active: border-2 border-[#679a41] with ring glow
// Pending: gray border, no icon

// Progress bar
<div className="h-1 bg-gray-200 dark:bg-gray-700">
  <div className="h-full bg-[#679a41] dark:bg-emerald-500 transition-all duration-500"
       style={{ width: `${progress}%` }} />
</div>
```

### 7.8 Tooltip

Hover tooltip component.

```tsx
<div className="group relative">
  <button>Hover me</button>
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                  bg-gray-900 dark:bg-black text-white text-xs px-2 py-1 rounded
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  pointer-events-none">
    Tooltip text
  </div>
</div>
```

### 7.9 Pagination

Page navigation component.

```tsx
<div className="flex items-center justify-between">
  <span className="text-sm text-gray-500 dark:text-gray-400">
    Showing 1-10 of 100
  </span>
  <div className="flex items-center space-x-2">
    <Button variant="outline" size="sm" disabled={page === 1}>
      <i className="fas fa-chevron-left"></i>
    </Button>
    <span className="text-sm">Page {page} of {totalPages}</span>
    <Button variant="outline" size="sm" disabled={page === totalPages}>
      <i className="fas fa-chevron-right"></i>
    </Button>
  </div>
</div>
```

### 7.10 Collapsible Section

Expandable content section.

```tsx
<div className="border border-gray-200 dark:border-slate-700 rounded-lg">
  <button className="w-full flex justify-between items-center p-4
                     text-[#293c51] dark:text-gray-200
                     hover:bg-gray-50 dark:hover:bg-slate-700">
    <span className="font-medium">Section Title</span>
    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
  </button>
  {isOpen && (
    <div className="p-4 border-t border-gray-200 dark:border-slate-700">
      {/* Content */}
    </div>
  )}
</div>
```

### 7.11 Searchable Select

Dropdown with search functionality.

**Features**
- Filterable options
- Keyboard navigation support
- Dark mode support
- Focus ring styling

### 7.12 Multi-Select Dropdown

Multi-selection dropdown with tags.

```tsx
// Selected items display
<div className="flex flex-wrap gap-1">
  {selectedItems.slice(0, 3).map(item => (
    <span className="bg-gray-200 dark:bg-slate-600 text-xs font-medium
                     px-2 py-1 rounded-full flex items-center">
      {item.label}
      <button className="ml-2 text-gray-500 hover:text-black dark:hover:text-white">
        <i className="fas fa-times text-xs"></i>
      </button>
    </span>
  ))}
  {selectedItems.length > 3 && (
    <span className="text-xs text-gray-500">+{selectedItems.length - 3} more</span>
  )}
</div>
```

### 7.13 Charts

Custom SVG-based chart components.

**Available Charts**
- `LineChart` - Line/spline chart with smooth interpolation
- `BarChart` - Vertical bar chart
- `DoughnutChart` - Single-segment donut chart
- `MultiSegmentDoughnutChart` - Multi-segment donut chart

---

## 8. Layout Patterns

### 8.1 Application Shell

```
┌─────────────────────────────────────────────────────────┐
│                     Navbar (sticky)                      │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │              Main Content                    │
│ (fixed)  │                                              │
│          │                                              │
│          │                                              │
│          │                                              │
│          │                                              │
├──────────┴──────────────────────────────────────────────┤
│                      Footer (optional)                   │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Sidebar

Collapsible navigation sidebar.

**Desktop**
- Fixed position: `fixed left-0 z-40`
- Width: `w-64` (expanded) or `w-20` (collapsed)
- Smooth transition: `transition-all duration-300`

**Mobile**
- Overlay with dark backdrop
- Full-screen overlay when open

**Navigation Item States**
- Default: `text-[#293c51] dark:text-gray-300`
- Hover: `hover:bg-gray-200 dark:hover:bg-slate-700`
- Active: `bg-[#679a41] dark:bg-emerald-600 text-white shadow-inner`

```tsx
// Sidebar container
<aside className="fixed left-0 top-0 h-full bg-white dark:bg-slate-800
                  border-r border-gray-200 dark:border-slate-700
                  transition-all duration-300
                  w-64 lg:w-64 collapsed:w-20">
  {/* Navigation items */}
</aside>
```

### 8.3 Navbar

Top navigation bar.

```tsx
<nav className="sticky top-0 z-40 bg-white dark:bg-slate-800
                border-b border-gray-200 dark:border-slate-700 shadow-sm">
  <div className="flex items-center justify-between h-16 px-4">
    {/* Left: Sidebar toggle, Search */}
    {/* Right: Notifications, App launcher, User menu */}
  </div>
</nav>
```

### 8.4 Auth Layout

Authentication pages layout.

```tsx
<div className="min-h-screen bg-cover bg-center"
     style={{ backgroundImage: "url('/auth-bg.jpg')" }}>
  <div className="min-h-screen backdrop-blur-sm bg-gray-50/70 dark:bg-slate-900/70
                  flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl
                    w-full max-w-md p-8">
      {/* Auth form */}
    </div>
  </div>
</div>
```

### 8.5 Page Layout

Standard page content structure.

```tsx
<main className="flex-1 p-6">
  {/* Breadcrumbs */}
  <nav className="mb-4">
    <Breadcrumbs items={[...]} />
  </nav>

  {/* Page header */}
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">
      Page Title
    </h1>
    <div className="flex space-x-2">
      {/* Action buttons */}
    </div>
  </div>

  {/* Content grid */}
  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {/* Cards/content */}
  </div>
</main>
```

### 8.6 Grid Systems

**Dashboard Cards**
```tsx
<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

**Two Column Layout**
```tsx
<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
```

**Sidebar + Content**
```tsx
<div className="grid gap-6 grid-cols-1 lg:grid-cols-[300px_1fr]">
```

---

## 9. Form Patterns

### 9.1 Input Field Styling

```tsx
// Base input classes
const inputClasses = `
  w-full px-3 py-2
  border border-gray-300 dark:border-gray-600
  rounded-md
  bg-white dark:bg-gray-700
  text-[#293c51] dark:text-gray-200
  placeholder:text-gray-400 dark:placeholder:text-gray-500
  focus:outline-none focus:ring-2 focus:ring-[#679a41] focus:border-[#679a41]
  dark:focus:ring-emerald-400 dark:focus:border-emerald-400
  transition-colors
`;

// Disabled state
const disabledClasses = "bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50";

// Error state
const errorClasses = "border-red-500 dark:border-red-400";
```

### 9.2 Form Layout

```tsx
<form className="space-y-4">
  {/* Field with label */}
  <div>
    <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-200">
      Email Address
      <span className="text-red-500 ml-1">*</span>
    </label>
    <input type="email" className={inputClasses} />
  </div>

  {/* Field with error */}
  <div>
    <label className="block text-sm font-medium mb-1">Password</label>
    <input type="password" className={`${inputClasses} ${errorClasses}`} />
    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
      Password is required
    </p>
  </div>

  {/* Field with hint */}
  <div>
    <label className="block text-sm font-medium mb-1">Username</label>
    <input type="text" className={inputClasses} />
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
      Must be 3-20 characters
    </p>
  </div>

  {/* Checkbox */}
  <div className="flex items-center">
    <input type="checkbox"
           className="h-4 w-4 text-[#679a41] rounded border-gray-300
                      dark:border-gray-600 focus:ring-[#679a41]" />
    <label className="ml-2 text-sm text-[#293c51] dark:text-gray-200">
      Remember me
    </label>
  </div>

  {/* Submit button */}
  <Button type="submit" variant="primary" className="w-full">
    Submit
  </Button>
</form>
```

### 9.3 Validation States

| State | Border | Message |
|-------|--------|---------|
| Default | `border-gray-300 dark:border-gray-600` | None |
| Focus | `ring-2 ring-[#679a41] border-[#679a41]` | None |
| Error | `border-red-500 dark:border-red-400` | `text-xs text-red-500` |
| Success | `border-green-500` | `text-xs text-green-500` |
| Disabled | `bg-gray-100 opacity-50` | None |

---

## 10. Status Indicators & Badges

### 10.1 Status Chips

```tsx
// Status badge classes by type
const statusClasses = {
  active: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  pending: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  suspended: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
  error: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  inactive: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
};

// Usage
<span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses.active}`}>
  Active
</span>
```

### 10.2 Notification Badge

```tsx
// Pulsing notification indicator
<span className="relative flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full
                   rounded-full bg-red-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
</span>
```

### 10.3 Change Indicators

```tsx
// Positive change
<div className="flex items-center text-sm text-green-500 dark:text-green-400">
  <i className="fas fa-arrow-up mr-1"></i>
  <span>+12%</span>
</div>

// Negative change
<div className="flex items-center text-sm text-red-500 dark:text-red-400">
  <i className="fas fa-arrow-down mr-1"></i>
  <span>-5%</span>
</div>

// Neutral
<div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
  <span>No change</span>
</div>
```

### 10.4 Count Badges

```tsx
// Numeric badge (e.g., on tabs or menu items)
<span className="ml-2 bg-[#679a41] text-white text-xs font-medium
                 px-2 py-0.5 rounded-full">
  12
</span>
```

---

## 11. Interactive States

### 11.1 Button States

| State | Visual Treatment |
|-------|------------------|
| Default | Solid color with subtle shadow |
| Hover | Darker shade + enhanced shadow |
| Focus | `ring-2 ring-offset-1` with variant color |
| Active | Darker shade |
| Disabled | `opacity-75 cursor-not-allowed` (no hover effects) |
| Loading | Spinner + "Loading..." text, disabled |

### 11.2 Link States

```tsx
// Default link
<a className="text-[#679a41] dark:text-emerald-400
              hover:text-[#588836] dark:hover:text-emerald-500
              hover:underline">
  Link Text
</a>
```

### 11.3 Form Field States

| State | Visual Treatment |
|-------|------------------|
| Default | Gray border |
| Focused | Brand color ring + border |
| Filled | Same as default |
| Error | Red border + red error text below |
| Disabled | Gray background + reduced opacity + `cursor-not-allowed` |

### 11.4 Card States

```tsx
// Default card
<div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm
                border border-gray-200 dark:border-slate-700
                transition-shadow hover:shadow-lg">
```

### 11.5 Navigation Item States

```tsx
// Default
<a className="flex items-center px-4 py-2 text-[#293c51] dark:text-gray-300">

// Hover
<a className="hover:bg-gray-200 dark:hover:bg-slate-700">

// Active
<a className="bg-[#679a41] dark:bg-emerald-600 text-white shadow-inner">
```

---

## 12. Animations & Transitions

### 12.1 Transition Classes

| Class | Property | Duration |
|-------|----------|----------|
| `transition-all` | All properties | 150ms (default) |
| `transition-colors` | Color properties | 150ms |
| `transition-opacity` | Opacity | 150ms |
| `transition-transform` | Transform | 150ms |

### 12.2 Duration Classes

| Class | Duration | Usage |
|-------|----------|-------|
| `duration-150` | 150ms | Quick micro-interactions |
| `duration-200` | 200ms | Button hovers |
| `duration-300` | 300ms | Standard transitions |
| `duration-500` | 500ms | Larger animations |

### 12.3 Animation Classes

```tsx
// Pulse effect (notifications)
<span className="animate-pulse">...</span>

// Ping effect (notification dot)
<span className="animate-ping">...</span>

// Bounce effect (attention)
<span className="animate-bounce">...</span>

// Spin effect (loading)
<i className="fas fa-circle-notch fa-spin"></i>
```

### 12.4 Custom Animations

```css
/* Fade in animation (defined in CSS) */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
```

### 12.5 Hover Effects

```tsx
// Scale on hover (images)
<img className="transition-transform duration-300 group-hover:scale-105" />

// Background change
<button className="hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" />

// Shadow enhancement
<div className="hover:shadow-lg transition-shadow" />

// Opacity change
<i className="opacity-75 group-hover:opacity-100 transition-opacity" />
```

### 12.6 Focus Effects

```tsx
// Standard focus ring
<button className="focus:outline-none focus:ring-2 focus:ring-[#679a41]
                   focus:ring-offset-1 dark:focus:ring-emerald-400">

// Input focus
<input className="focus:outline-none focus:ring-2 focus:ring-[#679a41]
                  focus:border-[#679a41]">
```

---

## 13. Dark Mode Implementation

### 13.1 Strategy

Class-based dark mode using Tailwind's `dark:` variant prefix. The `dark` class is toggled on the `<html>` element.

### 13.2 Color Mapping

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page Background | `#fcfcfc` | `#1a202c` (slate-900) |
| Surface/Cards | `white` | `slate-800` |
| Primary Text | `#293c51` | `gray-200` |
| Secondary Text | `gray-500` | `gray-400` |
| Borders | `gray-200` / `gray-300` | `slate-700` / `gray-700` |
| Primary Button | `#679a41` | `emerald-500` |
| Primary Hover | `#588836` | `emerald-600` |
| Focus Ring | `#679a41` | `emerald-400` |
| Danger | `red-600` | `red-500` |

### 13.3 Common Dark Mode Patterns

```tsx
// Background
<div className="bg-white dark:bg-slate-800">

// Text
<p className="text-[#293c51] dark:text-gray-200">
<p className="text-gray-500 dark:text-gray-400">

// Borders
<div className="border border-gray-200 dark:border-slate-700">

// Hover states
<button className="hover:bg-gray-100 dark:hover:bg-slate-700">

// Focus states
<input className="focus:ring-[#679a41] dark:focus:ring-emerald-400">

// Primary colors
<button className="bg-[#679a41] dark:bg-emerald-500
                   hover:bg-[#588836] dark:hover:bg-emerald-600">
```

### 13.4 Scrollbar Styling

```css
/* Light mode scrollbar */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #679a41;
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background: #2d3748;
}
.dark ::-webkit-scrollbar-thumb {
  background: #4a5568;
}
```

---

## 14. Responsive Design

### 14.1 Breakpoints

| Prefix | Min Width | Description |
|--------|-----------|-------------|
| (none) | 0px | Mobile first (default) |
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Large desktop |
| `2xl:` | 1536px | Extra large |

### 14.2 Responsive Patterns

**Navigation**
```tsx
// Sidebar: Hidden on mobile, visible on desktop
<aside className="hidden lg:block lg:w-64">

// Mobile menu: Visible on mobile only
<div className="lg:hidden">
```

**Grids**
```tsx
// Responsive grid columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

**Typography**
```tsx
// Responsive text size
<h1 className="text-2xl md:text-3xl">
```

**Spacing**
```tsx
// Responsive padding
<div className="p-4 sm:p-6 lg:p-8">
```

**Visibility**
```tsx
// Hide on mobile, show on desktop
<div className="hidden sm:block">

// Show on mobile, hide on desktop
<div className="sm:hidden">
```

### 14.3 Mobile Considerations

- Touch targets: Minimum 44x44px for buttons and interactive elements
- Sidebar: Collapses to overlay on mobile
- Tables: Horizontal scroll or card view on mobile
- Navigation: Hamburger menu on mobile
- Forms: Full-width inputs
- Modals: Full-screen or near full-screen on mobile

---

## 15. Accessibility

### 15.1 Semantic HTML

```tsx
// Use proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// Use semantic elements
<nav>Navigation</nav>
<main>Main content</main>
<aside>Sidebar</aside>
<footer>Footer</footer>

// Use button for actions, links for navigation
<button onClick={handleClick}>Submit</button>
<a href="/page">Go to page</a>
```

### 15.2 ARIA Attributes

```tsx
// Icon-only buttons
<button aria-label="Close modal">
  <i className="fas fa-times" aria-hidden="true"></i>
</button>

// Expanded/collapsed states
<button aria-expanded={isOpen} aria-controls="menu-content">
  Toggle Menu
</button>

// Loading states
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### 15.3 Focus Management

```tsx
// Visible focus indicators
<button className="focus:outline-none focus:ring-2 focus:ring-[#679a41]
                   focus:ring-offset-1">

// Skip link (at top of page)
<a href="#main-content"
   className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
              bg-[#679a41] text-white px-4 py-2 rounded">
  Skip to main content
</a>
```

### 15.4 Color Contrast

- Text contrast ratio meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Don't rely solely on color to convey information
- Provide text labels alongside color indicators

### 15.5 Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows visual layout
- Escape key closes modals and dropdowns
- Arrow keys navigate within menus and lists
- Enter/Space activates buttons and links

---

## Component File Reference

All reusable UI components are located in `/src/components/ui/`:

| Component | File | Description |
|-----------|------|-------------|
| Button | `Button.tsx` | Primary interactive button |
| Card | `Card.tsx` | Content container |
| Modal | `Modal.tsx` | Dialog overlay |
| FormField | `FormField.tsx` | Unified form input |
| StatCard | `StatCard.tsx` | Statistics display |
| Sidebar | `Sidebar.tsx` | Navigation sidebar |
| Navbar | `Navbar.tsx` | Top navigation |
| Tooltip | `Tooltip.tsx` | Hover tooltip |
| Pagination | `Pagination.tsx` | Page navigation |
| Stepper | `Stepper.tsx` | Progress steps |
| ToggleSwitch | `ToggleSwitch.tsx` | Binary toggle |
| CollapsibleSection | `CollapsibleSection.tsx` | Expandable content |
| SearchableSelect | `SearchableSelect.tsx` | Dropdown with search |
| MultiSelectDropdown | `MultiSelectDropdown.tsx` | Multi-selection |
| Spinner | `Spinner.tsx` | Loading indicator |
| Icon | `Icon.tsx` | FontAwesome wrapper |
| Breadcrumbs | `Breadcrumbs.tsx` | Navigation breadcrumbs |
| LineChart | `LineChart.tsx` | Line/spline chart |
| BarChart | `BarChart.tsx` | Bar chart |
| DoughnutChart | `DoughnutChart.tsx` | Donut chart |
| BlogCard | `BlogCard.tsx` | Blog content card |
| PricingCard | `PricingCard.tsx` | Pricing plan display |
| FaqSection | `FaqSection.tsx` | FAQ accordion |
| Chatbot | `Chatbot.tsx` | Chat interface |
| FeedbackSystem | `FeedbackSystem.tsx` | Feedback modal |

---

## Quick Reference

### Brand Colors
- Primary: `#679a41` (light) / `emerald-500` (dark)
- Secondary: `#293c51` (light) / `sky-600` (dark)

### Key Classes
```tsx
// Primary button
"bg-[#679a41] hover:bg-[#588836] text-white dark:bg-emerald-500 dark:hover:bg-emerald-600"

// Card
"bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700"

// Input
"border-gray-300 dark:border-gray-600 focus:ring-[#679a41] dark:focus:ring-emerald-400"

// Text
"text-[#293c51] dark:text-gray-200"  // Primary
"text-gray-500 dark:text-gray-400"   // Secondary
```

---

*Last updated: January 2026*
