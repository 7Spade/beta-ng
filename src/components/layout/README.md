# Layout Components

A comprehensive collection of layout components built with Next.js 15, TypeScript, and Tailwind CSS, following shadcn/ui design principles.

## Overview

This layout system provides a complete foundation for building modern web applications with consistent spacing, responsive design, and accessible components.

## Components

### Core Layout

- **`LayoutWrapper`** - Main layout container with configurable padding and width constraints

### Navigation

- **`ContextMenu`** - Right-click context menu with full keyboard navigation support
- **`NotificationCenter`** - Notification system with different types and actions
- **`QuickActions`** - Action buttons for common tasks
- **`SearchCommand`** - Command palette with keyboard shortcuts
- **`UserMenu`** - User profile dropdown menu

### Overlays

- **`DrawerContainer`** - Slide-out panels from any edge
- **`ModalContainer`** - Modal dialogs with backdrop
- **`PopoverContainer`** - Floating content positioned relative to triggers
- **`TooltipProvider`** - Tooltip system with context

### Responsive

- **`ResponsiveWrapper`** - Conditional rendering based on screen size

### Shared

- **`EmptyState`** - Empty state displays with icons and actions
- **`PageContainer`** - Consistent page layout container
- **`PageHeader`** - Page titles with optional actions
- **`SectionDivider`** - Visual separators with optional labels
- **`StatusIndicator`** - Status indicators with different states

## Usage

### Basic Layout Structure

```tsx
import { LayoutWrapper, PageContainer, PageHeader } from "@/components/layout"

export default function Page() {
  return (
    <LayoutWrapper>
      <PageContainer>
        <PageHeader 
          title="Dashboard" 
          subtitle="Welcome to your dashboard"
          actions={<button>New Item</button>}
        />
        {/* Page content */}
      </PageContainer>
    </LayoutWrapper>
  )
}
```

### Navigation Components

```tsx
import { NotificationCenter, QuickActions, UserMenu } from "@/components/layout"

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <QuickActions />
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <UserMenu />
      </div>
    </header>
  )
}
```

### Overlay Components

```tsx
import { ModalContainer, DrawerContainer } from "@/components/layout"

export default function Component() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      <button onClick={() => setIsDrawerOpen(true)}>Open Drawer</button>

      <ModalContainer 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Modal Title"
      >
        <p>Modal content here</p>
      </ModalContainer>

      <DrawerContainer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        side="right"
      >
        <p>Drawer content here</p>
      </DrawerContainer>
    </>
  )
}
```

### Responsive Design

```tsx
import { ResponsiveWrapper } from "@/components/layout"

export default function Component() {
  return (
    <ResponsiveWrapper
      mobile={<MobileView />}
      tablet={<TabletView />}
      desktop={<DesktopView />}
    >
      <DefaultView />
    </ResponsiveWrapper>
  )
}
```

## Features

- **TypeScript Support** - Full type safety with comprehensive interfaces
- **Responsive Design** - Mobile-first approach with breakpoint utilities
- **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- **Customization** - Extensive className and prop customization options
- **Performance** - Optimized with React.memo and useCallback where appropriate
- **Theme Integration** - Seamless integration with Tailwind CSS and CSS variables

## Dependencies

- Next.js 15+
- React 18+
- TypeScript 5+
- Tailwind CSS 3.4+
- Lucide React (for icons)
- clsx + tailwind-merge (for class utilities)

## Installation

The components are built into the project and can be imported directly:

```tsx
import { ComponentName } from "@/components/layout"
```

## Customization

All components accept a `className` prop for additional styling and follow the shadcn/ui design system. You can customize:

- Colors using CSS variables
- Spacing using Tailwind classes
- Typography using font utilities
- Animations using transition classes

## Contributing

When adding new layout components:

1. Follow the existing component structure
2. Use TypeScript interfaces for props
3. Include proper accessibility attributes
4. Add comprehensive JSDoc comments
5. Export from the main index file
6. Update this README with usage examples
