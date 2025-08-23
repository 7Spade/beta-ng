│  README.md
│  setupTests.ts
│
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
│          README.md
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
│      │  contracts.actions.ts
│      │  documents.actions.ts
│      │  knowledge.actions.ts
│      │  README.md
│      │
│      └─__tests__
│              contracts.actions.test.ts
│
├─components
│  │  README.md
│  │
│  ├─features
│  │  │  README.md
│  │  │
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
│  │  │  │  API.md
│  │  │  │  contracts-details-sheet.tsx
│  │  │  │  create-contract-dialog.tsx
│  │  │  │  dashboard-stats.tsx
│  │  │  │  README.md
│  │  │  │
│  │  │  ├─dashboard
│  │  │  │  │  dashboard-updated-example.tsx
│  │  │  │  │  dashboard.tsx
│  │  │  │  │
│  │  │  │  └─__tests__
│  │  │  │          dashboard.test.tsx
│  │  │  │
│  │  │  ├─details
│  │  │  │      contract-changes-tab.tsx
│  │  │  │      contract-details-tab.tsx
│  │  │  │      contract-history-tab.tsx
│  │  │  │      contract-payments-tab.tsx
│  │  │  │
│  │  │  └─table
│  │  │      │  CLEANUP_SUMMARY.md
│  │  │      │  contracts-row.tsx
│  │  │      │  contracts-table.tsx
│  │  │      │  index.ts
│  │  │      │  TYPE_FIXES_SUMMARY.md
│  │  │      │
│  │  │      └─__tests__
│  │  │              contracts-row.test.tsx
│  │  │              contracts-table.test.tsx
│  │  │              integration.test.tsx
│  │  │              TEST_SUMMARY.md
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
│  │  │  │      partner-dashboard.tsx
│  │  │  │
│  │  │  ├─partners
│  │  │  │  │  partner-list.tsx
│  │  │  │  │  partner-profile.tsx
│  │  │  │  │
│  │  │  │  ├─forms
│  │  │  │  │      contact-form.tsx
│  │  │  │  │      partner-form.tsx
│  │  │  │  │
│  │  │  │  └─profile-tabs
│  │  │  │          compliance-tab.tsx
│  │  │  │          contacts-tab.tsx
│  │  │  │          contracts-tab.tsx
│  │  │  │          financial-workflows-tab.tsx
│  │  │  │          performance-tab.tsx
│  │  │  │          transactions-tab.tsx
│  │  │  │
│  │  │  └─workflows
│  │  │          optimization-assistant.tsx
│  │  │          receivable-payable.tsx
│  │  │          workflow-builder.tsx
│  │  │
│  │  └─team
│  │      │  README.md
│  │      │
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
│  │  │  index.ts
│  │  │  README.md
│  │  │
│  │  ├─core
│  │  │      app-header.tsx
│  │  │      app-provider.tsx
│  │  │      app-shell.tsx
│  │  │      layout-wrapper.tsx
│  │  │      README.md
│  │  │      theme-provider.tsx
│  │  │
│  │  ├─navigation
│  │  │      breadcrumb.tsx
│  │  │      context-menu.tsx
│  │  │      navigation-menu-item.tsx
│  │  │      navigation-menu.tsx
│  │  │      notification-center.tsx
│  │  │      quick-actions.tsx
│  │  │      README.md
│  │  │      search-command.tsx
│  │  │      unified-sidebar.tsx
│  │  │      user-menu.tsx
│  │  │
│  │  ├─overlays
│  │  │      drawer-container.tsx
│  │  │      modal-container.tsx
│  │  │      popover-container.tsx
│  │  │      README.md
│  │  │      tooltip-provider.tsx
│  │  │
│  │  ├─responsive
│  │  │      mobile-menu.tsx
│  │  │      README.md
│  │  │      responsive-wrapper.tsx
│  │  │
│  │  └─shared
│  │          empty-state.tsx
│  │          logo.tsx
│  │          page-container.tsx
│  │          page-header.tsx
│  │          README.md
│  │          section-divider.tsx
│  │          status-indicator.tsx
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
│          context-menu.tsx
│          dialog.tsx
│          dropdown-menu.tsx
│          form.tsx
│          input.tsx
│          label.tsx
│          menubar.tsx
│          popover.tsx
│          progress.tsx
│          radio-group.tsx
│          README.md
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
│  │  index.ts
│  │  ProjectContext.tsx
│  │  README.md
│  │
│  ├─contracts
│  │  │  CONTEXT_INTEGRATION_SUMMARY.md
│  │  │  contract.context.tsx
│  │  │  contract.provider.tsx
│  │  │  index.ts
│  │  │
│  │  └─__tests__
│  ├─projects
│  └─shared
│          app.context.tsx
│          error.context.tsx
│          index.ts
│
├─docs
│      database.md
│      README.md
│      structure.md
│
├─hooks
│  │  ERROR_HANDLING_INTEGRATION.md
│  │  ERROR_HANDLING_INTEGRATION_SUMMARY.md
│  │  index.ts
│  │  README.md
│  │  use-mobile.tsx
│  │  use-toast.ts
│  │
│  ├─business
│  │      index.ts
│  │      README.md
│  │      use-contract-actions.ts
│  │      use-contract-stats.ts
│  │
│  ├─data
│  │      index.ts
│  │      README.md
│  │      use-contracts.ts
│  │
│  ├─ui
│  │      index.ts
│  │      README.md
│  │      use-error-handling.ts
│  │      use-form-state.ts
│  │      use-hook-error-integration.ts
│  │      use-table-state.ts
│  │
│  └─__tests__
│          error-integration.test.ts
│          ERROR_FIXES_SUMMARY.md
│
├─lib
│      firebase.ts
│      README.md
│      roles.ts
│      types.ts
│      utils.ts
│
├─repositories
│  │  index.ts
│  │  README.md
│  │
│  ├─base
│  │      base.repository.ts
│  │      firebase.repository.ts
│  │      index.ts
│  │      README.md
│  │
│  ├─contracts
│  │      contract.repository.interface.ts
│  │      contract.repository.ts
│  │      contract.types.ts
│  │      index.ts
│  │      README.md
│  │
│  ├─partners
│  │      index.ts
│  │      README.md
│  │
│  └─projects
│          index.ts
│          project.repository.ts
│          README.md
│
├─services
│  │  index.ts
│  │  logging.service.ts
│  │  README.md
│  │
│  ├─contracts
│  │  │  contract-export.service.ts
│  │  │  contract-stats.service.ts
│  │  │  contract.service.ts
│  │  │  index.ts
│  │  │  README-export-service.md
│  │  │  README-stats-service.md
│  │  │  README.md
│  │  │
│  │  └─__tests__
│  │          contract-export.service.test.ts
│  │          contract-stats.service.test.ts
│  │
│  ├─partners
│  │      index.ts
│  │      README.md
│  │
│  ├─projects
│  │      index.ts
│  │      project.service.ts
│  │      README.md
│  │
│  └─shared
│      │  error.service.ts
│      │  export.service.ts
│      │  index.ts
│      │  README-validation-service.md
│      │  README.md
│      │  validation.service.ts
│      │
│      └─__tests__
│              export.service.test.ts
│              validation.service.test.ts
│
├─types
│  │  index.ts
│  │  README.md
│  │
│  ├─dto
│  │      contract.dto.ts
│  │      index.ts
│  │      project.dto.ts
│  │      README.md
│  │
│  ├─entities
│  │      contract.types.ts
│  │      error.types.ts
│  │      index.ts
│  │      project.types.ts
│  │      README.md
│  │      shared.types.ts
│  │
│  └─services
│          contract.service.types.ts
│          index.ts
│          project.service.types.ts
│          README.md
│          repository.types.ts
│
├─utils
│  │  index.ts
│  │  README.md
│  │
│  ├─formatting
│  │      currency.formatter.ts
│  │      date.formatter.ts
│  │      index.ts
│  │      README.md
│  │
│  ├─transformation
│  │      firebase.transformer.ts
│  │      index.ts
│  │      README.md
│  │
│  └─validation
│          common.validation.ts
│          contract.validation.ts
│          index.ts
│          README.md
│
└─__tests__
        contract-functionality.test.tsx
        contract-integration.test.tsx
        final-functionality.test.ts
        performance.test.ts
        test-summary.md