// Copyright 2020 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

interface CampaignParams {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
}

interface ParsedCampaignUrl {
  campaignParams: Partial<CampaignParams>
  cleanedWebsiteUrl: string
}

export const CampiagnParams: (keyof CampaignParams)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
]

export const extractParamsFromWebsiteUrl = (
  websiteUrl: string
): Partial<CampaignParams> | undefined => {
  // Also support fragment params.
  let asUrl: URL
  try {
    let missingProtocol = /[^://].*?.com/
    if (missingProtocol.test(websiteUrl)) {
      asUrl = new URL(`https://${websiteUrl}`)
    } else {
      asUrl = new URL(websiteUrl)
    }
  } catch (e) {
    return undefined
  }
  const searchParams = asUrl.searchParams
  const campaignParams: Partial<CampaignParams> = {}

  let fragment = asUrl.hash
  // Some of the urls we see have fragment, then query params

  const queryIndex = fragment.indexOf("?")
  if (queryIndex !== -1) {
    const afterFragment = new URLSearchParams(fragment.substring(queryIndex))
    fragment = fragment.substring(0, queryIndex)
    afterFragment.forEach((v, k) => {
      searchParams.set(k, v)
    })
  }
  // The first character of .hash is always a '#'
  const fragmentParams = new URLSearchParams(fragment.substring(1))

  // Pull out any campaign params that are valid search params
  CampiagnParams.forEach(param => {
    const fromSearch = searchParams.get(param)
    if (fromSearch !== null) {
      campaignParams[param] = fromSearch
    }

    const fromFragment = fragmentParams.get(param)
    if (fromFragment !== null) {
      campaignParams[param] = fromFragment
    }
  })

  return campaignParams
}
