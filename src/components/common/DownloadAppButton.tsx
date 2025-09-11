import React from 'react'
import { GitHubDownloadButton } from './GitHubDownloadButton'

interface DownloadAppButtonProps {
  readonly preferMsi?: boolean
}

export function DownloadAppButton({ preferMsi = true }: DownloadAppButtonProps) {
  return <GitHubDownloadButton />
}

export default DownloadAppButton
