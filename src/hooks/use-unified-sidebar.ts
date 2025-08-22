'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { shouldExpandSection, isPathActive } from '@/config/navigation.config'

interface UseSidebarReturn {
  // 狀態
  isOpen: boolean
  isMobile: boolean
  activeRoute: string
  expandedSections: string[]
  
  // 動作
  toggle: () => void
  setOpen: (open: boolean) => void
  setActiveRoute: (route: string) => void
  toggleSection: (sectionId: string) => void
  
  // 工具函數
  isRouteActive: (route: string) => boolean
  isSectionExpanded: (sectionId: string) => boolean
}

// 自定義 localStorage hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

export function useUnifiedSidebar(): UseSidebarReturn {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  
  // 從 localStorage 讀取狀態
  const [isOpen, setIsOpen] = useLocalStorage('unified-sidebar-open', true)
  const [expandedSections, setExpandedSections] = useLocalStorage<string[]>('unified-sidebar-expanded', [])
  
  // 根據當前路徑設定活躍路由
  const activeRoute = useMemo(() => {
    return pathname
  }, [pathname])
  
  // 自動展開包含當前路由的區段
  useEffect(() => {
    const sectionsToExpand: string[] = []
    
    // 檢查 PartnerVerse 是否需要展開
    if (shouldExpandSection('partnerverse', pathname)) {
      sectionsToExpand.push('partnerverse')
    }
    
    // 更新展開的區段
    setExpandedSections(prev => {
      const newExpanded = [...prev]
      let hasChanges = false
      
      sectionsToExpand.forEach(sectionId => {
        if (!newExpanded.includes(sectionId)) {
          newExpanded.push(sectionId)
          hasChanges = true
        }
      })
      
      return hasChanges ? newExpanded : prev
    })
  }, [pathname, setExpandedSections])
  
  // 切換側邊欄開關
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [setIsOpen])
  
  // 設定活躍路由（主要由路由自動管理）
  const setActiveRoute = useCallback((route: string) => {
    // 這個函數主要是為了 API 一致性，實際上路由由 Next.js 管理
    console.log('Setting active route:', route)
  }, [])
  
  // 切換區段展開狀態
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }, [setExpandedSections])
  
  // 檢查路由是否為活躍狀態
  const isRouteActive = useCallback((route: string) => {
    return isPathActive(route, pathname)
  }, [pathname])
  
  // 檢查區段是否已展開
  const isSectionExpanded = useCallback((sectionId: string) => {
    return expandedSections.includes(sectionId)
  }, [expandedSections])
  
  // 鍵盤快捷鍵支援
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])
  
  return {
    isOpen,
    isMobile,
    activeRoute,
    expandedSections,
    toggle,
    setOpen: setIsOpen,
    setActiveRoute,
    toggleSection,
    isRouteActive,
    isSectionExpanded
  }
}