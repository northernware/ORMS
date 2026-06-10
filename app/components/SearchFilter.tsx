'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface SearchFilterProps {
  placeholder?: string
}

export function SearchFilter({ placeholder = 'Search...' }: SearchFilterProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1') // Reset to first page on search
    
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative flex-1 max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-zinc-400" />
      </div>
      <input
        type="text"
        className="input-field pl-10"
        placeholder={placeholder}
        onChange={(e) => {
          // Debounce could be added here
          handleSearch(e.target.value)
        }}
        defaultValue={searchParams.get('search')?.toString()}
      />
    </div>
  )
}
