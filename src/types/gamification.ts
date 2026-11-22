export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface LevelInfo {
  level: number
  requiredXp: number
}

export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
}
