import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, AlertCircle } from 'lucide-react'
import { isTauri } from '@/runtime/env'

interface GitHubRelease {
  tag_name: string
  name: string
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
  }>
}

interface CachedRelease {
  data: GitHubRelease
  timestamp: number
}

const REPO_OWNER = 'Jonte-jpg'
const REPO_NAME = 'betting-tracker'
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`
const CACHE_KEY = 'betting-tracker-latest-release'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

function getCachedRelease(): GitHubRelease | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const { data, timestamp }: CachedRelease = JSON.parse(cached)
    const isExpired = Date.now() - timestamp > CACHE_DURATION
    
    return isExpired ? null : data
  } catch {
    return null
  }
}

function setCachedRelease(release: GitHubRelease): void {
  try {
    const cached: CachedRelease = {
      data: release,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // localStorage might be full or disabled
  }
}

async function fetchLatestRelease(): Promise<GitHubRelease> {
  const response = await fetch(GITHUB_API_URL, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }
  
  return response.json()
}

export function GitHubDownloadButton() {
  const [release, setRelease] = useState<GitHubRelease | null>(getCachedRelease())
  const [loading, setLoading] = useState(!release)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!isOnline || release) return

    let retryCount = 0
    const maxRetries = 3
    
    async function loadRelease() {
      try {
        setLoading(true)
        setError(null)
        
        const latestRelease = await fetchLatestRelease()
        setRelease(latestRelease)
        setCachedRelease(latestRelease)
        
      } catch (err) {
        retryCount++
        
        if (retryCount <= maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryCount - 1) * 1000
          setTimeout(loadRelease, delay)
          return
        }
        
        const message = err instanceof Error ? err.message : 'Failed to fetch release'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadRelease()
  }, [isOnline, release])

  // Don't show in Tauri app
  if (isTauri) return null

  // Find Windows installers
  const msiAsset = release?.assets.find(asset => 
    asset.name.toLowerCase().includes('.msi') && 
    asset.name.toLowerCase().includes('x64')
  )
  
  const exeAsset = release?.assets.find(asset => 
    asset.name.toLowerCase().includes('.exe') && 
    asset.name.toLowerCase().includes('x64')
  )

  const primaryAsset = msiAsset || exeAsset
  const secondaryAsset = msiAsset ? exeAsset : null

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        Letar efter senaste version...
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        Offline - kan inte hämta nedladdningslänkar
      </div>
    )
  }

  if (error || !primaryAsset) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error || 'Inga installationsfiler hittades'}
        </div>
        <a 
          href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Visa på GitHub
        </a>
      </div>
    )
  }

  const isPrimary = primaryAsset === msiAsset
  const version = release?.tag_name?.replace(/^v/, '') || '1.0.0'

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <a 
          href={primaryAsset.browser_download_url}
          download
          aria-label={`Ladda ner ${isPrimary ? 'MSI' : 'EXE'} installer för Windows, version ${version}`}
        >
          <Button className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Ladda ner {isPrimary ? 'MSI' : 'EXE'} (v{version})
          </Button>
        </a>
        
        {secondaryAsset && (
          <a 
            href={secondaryAsset.browser_download_url}
            download
            aria-label={`Ladda ner EXE installer för Windows, version ${version}`}
          >
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Ladda ner EXE (v{version})
            </Button>
          </a>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 text-xs text-muted-foreground">
        <span>Storlek: {formatFileSize(primaryAsset.size)}</span>
        <span>Windows 64-bit</span>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={() => console.log('Download URL:', primaryAsset.browser_download_url)}
            className="text-left underline hover:no-underline"
          >
            Debug: Logga URL
          </button>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
        <strong>Tips:</strong> MSI rekommenderas för enklare installation. 
        Kräver Windows 10 eller senare.
      </div>
    </div>
  )
}
