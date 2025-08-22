
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">管理您的應用程式偏好設定。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>外觀</CardTitle>
          <CardDescription>自訂您應用程式的外觀與感覺。選擇淺色、深色或系統主題。</CardDescription>
        </CardHeader>
        <CardContent>
          {!mounted ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          ) : (
            <RadioGroup value={theme} onValueChange={setTheme} aria-label="主題選擇">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">淺色</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">深色</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">系統</Label>
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>關於</CardTitle>
            <CardDescription>查看應用程式的版本資訊。</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">版本: 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  )
}
