export default function PartnerVerseDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PartnerVerse Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your partner management dashboard
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Total Partners</h3>
          <p className="text-2xl font-bold">24</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Active Collaborations</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Pending Workflows</h3>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">This Month</h3>
          <p className="text-2xl font-bold">+3</p>
        </div>
      </div>
    </div>
  )
}