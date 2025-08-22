export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
        <p className="text-muted-foreground">
          Manage collaboration workflows and processes
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Active Workflows</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Project Approval Process</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Material Procurement</span>
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Quality Assurance</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Workflow Templates</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded">
              <h4 className="font-medium">Standard Project Workflow</h4>
              <p className="text-sm text-muted-foreground">Default workflow for new projects</p>
            </div>
            <div className="p-3 border rounded">
              <h4 className="font-medium">Emergency Response</h4>
              <p className="text-sm text-muted-foreground">Fast-track workflow for urgent issues</p>
            </div>
            <div className="p-3 border rounded">
              <h4 className="font-medium">Partner Onboarding</h4>
              <p className="text-sm text-muted-foreground">Process for new partner integration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}