├─ai
│  │  dev.ts
│  │  genkit.ts
│  │  README.md
│  │
│  └─flows
│          extract-work-items-flow.ts
│          generate-knowledge-entry-flow.ts
│          generate-skill-flow.ts
│          generate-subtasks-flow.ts
│          summarize-contract-flow.ts
│          workflow-optimization-flow.ts
│
├─app
│  │  favicon.ico
│  │  globals.css
│  │  layout.tsx
│  │  page.tsx
│  │  README.md
│  │
│  ├─(app)
│  │  │  layout.tsx
│  │  │  README.md
│  │  │
│  │  ├─analytics
│  │  │      page.tsx
│  │  │
│  │  ├─contracts
│  │  │      page.tsx
│  │  │
│  │  ├─dashboard
│  │  │      page.tsx
│  │  │
│  │  ├─documents
│  │  │      page.tsx
│  │  │
│  │  ├─partnerverse
│  │  │  │  page.tsx
│  │  │  │
│  │  │  ├─dashboard
│  │  │  │      page.tsx
│  │  │  │
│  │  │  ├─partners
│  │  │  │      page.tsx
│  │  │  │
│  │  │  ├─receivable-payable
│  │  │  │      page.tsx
│  │  │  │
│  │  │  └─workflows
│  │  │          page.tsx
│  │  │
│  │  ├─projects
│  │  │  │  page.tsx
│  │  │  │
│  │  │  └─[id]
│  │  │          page.tsx
│  │  │
│  │  ├─settings
│  │  │      page.tsx
│  │  │
│  │  └─team
│  │      ├─knowledge-base
│  │      │      page.tsx
│  │      │
│  │      ├─members
│  │      │      page.tsx
│  │      │
│  │      ├─schedule
│  │      │      page.tsx
│  │      │
│  │      └─skills
│  │              page.tsx
│  │
│  └─actions
│          contracts.actions.ts
│          documents.actions.ts
│          knowledge.actions.ts
│          README.md
│
├─components
│  │  README.md
│  │
│  ├─features
│  │  ├─analytics
│  │  │  │  README.md
│  │  │  │
│  │  │  └─dashboard
│  │  │          dashboard.tsx
│  │  │
│  │  ├─app
│  │  │  │  ai-subtask-suggestions.tsx
│  │  │  │  create-project-dialog.tsx
│  │  │  │  project-progress-chart.tsx
│  │  │  │  README.md
│  │  │  │  task-item.tsx
│  │  │  │
│  │  │  └─dashboard
│  │  │          dashboard.tsx
│  │  │
│  │  ├─contracts
│  │  │  │  ai-summarizer-dialog.tsx
│  │  │  │  contracts-details-sheet.tsx
│  │  │  │  contracts-table.tsx
│  │  │  │  create-contract-dialog.tsx
│  │  │  │  dashboard-stats.tsx
│  │  │  │  README.md
│  │  │  │
│  │  │  └─dashboard
│  │  │          dashboard.tsx
│  │  │
│  │  ├─dashboard
│  │  │      ai-usage-log.tsx
│  │  │      README.md
│  │  │
│  │  ├─documents
│  │  │      README.md
│  │  │      work-items-table.tsx
│  │  │
│  │  ├─partnerverse
│  │  │  │  README.md
│  │  │  │
│  │  │  ├─dashboard
│  │  │  │      dashboard.tsx
│  │  │  │
│  │  │  ├─partners
│  │  │  │  │  partner-list.tsx
│  │  │  │  │  partner-profile.tsx
│  │  │  │  │
│  │  │  │  └─forms
│  │  │  │          contact-form.tsx
│  │  │  │          partner-form.tsx
│  │  │  │
│  │  │  └─workflows
│  │  │          optimization-assistant.tsx
│  │  │          receivable-payable.tsx
│  │  │          workflow-builder.tsx
│  │  │
│  │  └─team
│  │      ├─knowledge-base
│  │      │      entry-form-dialog.tsx
│  │      │
│  │      ├─members
│  │      │      create-member-dialog.tsx
│  │      │      README.md
│  │      │
│  │      ├─schedule
│  │      │      README.md
│  │      │
│  │      └─skills
│  │              README.md
│  │              skill-form-dialog.tsx
│  │              skills-list.tsx
│  │
│  ├─layout
│  │  │  README.md
│  │  │
│  │  ├─core
│  │  │      app-header.tsx
│  │  │      app-provider.tsx
│  │  │      app-shell.tsx
│  │  │      theme-provider.tsx
│  │  │
│  │  ├─navigation
│  │  │      breadcrumb.tsx
│  │  │      mobile-menu.tsx
│  │  │      navigation-menu-item.tsx
│  │  │      navigation-menu.tsx
│  │  │      unified-sidebar.tsx
│  │  │
│  │  └─shared
│  │          logo.tsx
│  │
│  └─ui
│          accordion.tsx
│          alert-dialog.tsx
│          alert.tsx
│          avatar.tsx
│          badge.tsx
│          breadcrumb.tsx
│          button.tsx
│          calendar.tsx
│          card.tsx
│          carousel.tsx
│          chart.tsx
│          checkbox.tsx
│          collapsible.tsx
│          dialog.tsx
│          dropdown-menu.tsx
│          form.tsx
│          input.tsx
│          label.tsx
│          menubar.tsx
│          popover.tsx
│          progress.tsx
│          radio-group.tsx
│          scroll-area.tsx
│          select.tsx
│          separator.tsx
│          sheet.tsx
│          sidebar.tsx
│          skeleton.tsx
│          slider.tsx
│          switch.tsx
│          table.tsx
│          tabs.tsx
│          textarea.tsx
│          toast.tsx
│          toaster.tsx
│          tooltip.tsx
│
├─config
│      navigation.config.ts
│      README.md
│
├─context
│      ProjectContext.tsx
│      README.md
│
├─docs
│      database.md
│      README.md
│      structure.md
│
├─hooks
│      README.md
│      use-mobile.tsx
│      use-toast.ts
│
├─lib
│      firebase.ts
│      README.md
│      roles.ts
│      types.ts
│      utils.ts
│
└─services
        logging.service.ts
        README.md