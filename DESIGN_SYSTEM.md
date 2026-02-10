# WorldPosta SSO Design System

This document outlines the design system for the WorldPosta SSO application. It is designed to ensure clarity, consistency, and efficiency across all WorldPosta services.

## 1. Design Philosophy & Principles

Our design philosophy is centered on **clarity, consistency, and efficiency**.

*   **Clarity**: The UI is designed to be intuitive and reduce cognitive load. Information is presented in a structured hierarchy, and interactive elements are clearly distinguished.
*   **Consistency**: A user should be able to predict how an element will behave, regardless of which service or page they are on. Components like buttons, cards, and forms share the same visual language.
*   **Efficiency**: Workflows are designed to be streamlined. Users can accomplish their primary tasks with minimal friction, whether it's managing users, checking invoices, or configuring a service.
*   **Scalability**: The system is built with modular components that can be reused and extended for new features and services without breaking the core design.
*   **Accessibility**: We strive to meet accessibility standards by using semantic HTML, ARIA attributes, proper color contrast, and keyboard-navigable elements.

## 2. Color Palette

The color system is designed with distinct roles for each color and supports both light and dark modes.

| Role              | Light Mode                                     | Dark Mode                                       | Usage                                                              |
| ----------------- | ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| **Primary/Brand** | `#679a41` (WorldPosta Green)                    | `emerald-500` (Brighter Green)                  | Primary buttons, active navigation, links, focus rings, key icons. |
| **Secondary**     | `#293c51` (Dark Slate Blue)                    | `sky-600` (Vibrant Blue)                        | Secondary buttons, primary text, headings.                         |
| **Background**    | `fcfcfc` (Near White), `f8f8f8` (Subtle Gray)   | `1a202c` (Slate 900), `slate-800` (Lighter)     | Page backgrounds, containers, sidebars.                            |
| **Surface**       | `ffffff` (White)                               | `slate-800`                                     | Cards, Modals, Popovers.                                           |
| **Text**          | `#293c51` (Primary), `gray-500` (Secondary)     | `gray-200` (Primary), `gray-400` (Secondary)    | Body copy, labels, placeholders.                                   |
| **Borders**       | `gray-200` / `gray-300`                        | `gray-700` / `slate-700`                        | Separators, input fields, card outlines.                           |
| **Status: Danger**| `red-600` (Actions), `red-100` (Backgrounds)   | `red-500` (Actions), `red-900` (Backgrounds)    | Delete actions, error messages, critical alerts.                   |
| **Status: Success**| `green-100` (Backgrounds)                      | `green-900` (Backgrounds)                       | Success indicators, 'Active' status chips.                         |
| **Status: Warning**| `yellow-100` (Backgrounds)                     | `yellow-900` (Backgrounds)                      | 'Suspended' or 'Pending' status chips, warnings.                   |

## 3. Typography

We use a system font stack for optimal performance and a native feel across all operating systems.

*   **Font Family**: `sans-serif` (Tailwind's default: Inter, system-ui, etc.)
*   **Hierarchy**:
    *   **Page Titles (h1)**: `text-3xl font-bold`
    *   **Card/Section Titles (h2)**: `text-xl font-semibold`
    *   **Sub-headings (h3)**: `text-lg font-medium`
    *   **Body Text**: `text-sm` for most content, `text-base` for primary paragraphs.
    
## 4. Components

This section details some of the key UI components used throughout the application.

### Old Version Page Announcement Banner

This banner is used on the "Old Version" page to inform users about upcoming UI changes. It's designed to be eye-catching yet non-disruptive.

*   **Container & Layout**:
    *   A full-width block element with `p-4` padding.
    *   Uses `relative` positioning to contain decorative elements.
    *   `overflow-hidden` is applied to elegantly clip the decorative circles.
    *   `rounded-lg` corners and `shadow-lg` for depth.
    *   Uses Flexbox for alignment (`flex items-center justify-center`), adapting from centered on mobile to left-aligned on larger screens (`sm:text-left`).

*   **Background & Effects**:
    *   Features a horizontal `bg-gradient-to-r` from `from-sky-500 to-emerald-500`.
    *   Includes two decorative, semi-transparent circular elements (`bg-white/10 rounded-full opacity-50`) positioned absolutely at the top-left and bottom-right corners to add visual interest.

*   **Typography**:
    *   **Heading**: `font-bold text-lg` and `text-white`.
    *   **Body Text**: `text-white/90 text-sm`.

*   **Iconography**:
    *   **Main Icon**: A `fas fa-rocket` icon. It is styled to be large (`text-3xl`), semi-transparent (`text-white/80`), and includes a subtle `animate-pulse` effect. It's hidden on small screens (`hidden sm:block`).
    *   **Dismiss Icon**: A `fas fa-times` icon inside a button for closing the banner.

*   **Interactivity**:
    *   The entire banner is dismissible via a close button in the top-right corner.
    *   The dismiss button has a `hover:bg-white/20` effect for visual feedback.

*   **Animation**:
    *   The banner appears with a subtle fade-in and upward translation effect using a custom `animate-fade-in` animation.
