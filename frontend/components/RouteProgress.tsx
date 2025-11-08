"use client"

import { AppProgressBar } from "next-nprogress-bar"

export function RouteProgress() {
  return (
    <AppProgressBar
      height="3px"
      color="#8b5cf6"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}


