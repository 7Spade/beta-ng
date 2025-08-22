export default function PartnersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
        <p className="text-muted-foreground">
          Manage your business partners and relationships
        </p>
      </div>
      
      <div className="rounded-lg border">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Partner Directory</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Acme Construction</h4>
                <p className="text-sm text-muted-foreground">General Contractor</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Active since 2023
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">BuildTech Solutions</h4>
                <p className="text-sm text-muted-foreground">Technology Partner</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Active since 2024
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Steel & Co</h4>
                <p className="text-sm text-muted-foreground">Material Supplier</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Active since 2022
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}