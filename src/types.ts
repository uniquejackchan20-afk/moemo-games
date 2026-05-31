/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  likes: number;
}

export interface Game {
  id: string;
  title: string;
  category: 'puzzle' | 'simulation' | 'action' | 'girls' | 'casual';
  categoryName: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyName: string;
  playTime: 'short' | 'medium' | 'long'; // short: Under 5 mins, medium: 5-15 mins, long: 15 mins or more
  playTimeName: string;
  rating: number;
  timesPlayed: number;
  image: string;
  description: string;
  hotness: number; // 🔥 percentage, e.g., 89
}

export interface UserProfile {
  username: string;
  avatarUrl: string;
  heartCoins: number;
  unlockedDecor: string[]; // for cafe game upgrades
  likedGameIds: string[];
  recentlyPlayedIds: string[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}
