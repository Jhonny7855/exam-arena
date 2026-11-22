import type { UnitId } from '../../types'

export interface TopicNote {
  name: string
  summary: string
  keyPoints: string[]
  pitfall: string
}

export interface UnitSyllabus {
  id: UnitId
  code: string
  title: string
  tagline: string
  overview: string
  topics: TopicNote[]
  accent: string
}
