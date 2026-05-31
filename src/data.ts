/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Game, Comment } from './types';

export const INITIAL_COMMENTS: Record<string, Comment[]> = {
  cafe: [
    {
      id: "comment_1",
      author: "可愛喵喵控",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "這款遊戲真的超級療癒！紅熊貓店長太可愛了，每次端咖啡的手勢都讓我融化。推薦給大家舒壓～",
      timeAgo: "2 小時前",
      likes: 15
    },
    {
      id: "comment_2",
      author: "小點心大師",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "解鎖到第三層裝飾了！那個雲朵沙發真的很好看。希望能多出一點新的小動物角色。",
      timeAgo: "5 小時前",
      likes: 8
    }
  ],
  jelly: [
    {
      id: "comment_3",
      author: "消消大王",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "果凍音效太啵哩啵哩了！聽著特別解壓，根本停不下來！",
      timeAgo: "1 天前",
      likes: 24
    }
  ],
  wood: [
    {
      id: "comment_4",
      author: "智力擔當",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "最後一關研究了半小時！出來的那一刻真的超有成就感的好不！",
      timeAgo: "3 天前",
      likes: 19
    }
  ],
  snake: [
    {
      id: "comment_snake_1",
      author: "貪食巨無霸",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "太好玩了！小蛇的花色可以隨便換，吃到蜜桃時還會打個可愛飽嗝，超精緻！",
      timeAgo: "10 分鐘前",
      likes: 12
    },
    {
      id: "comment_snake_2",
      author: "極速指尖手",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "難得有這麼可愛的貪食蛇！音樂也很輕快舒壓，拿到 500 分解鎖了黃金蛇皇皮膚，開心！",
      timeAgo: "1 小時前",
      likes: 7
    }
  ],
  sudoku: [
    {
      id: "comment_sudoku_1",
      author: "九格魔法師",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "陪讀的小松鼠米奧好萌呀！各種表情動作神同步我的答題情況。一邊動腦一邊被療癒！",
      timeAgo: "15 分鐘前",
      likes: 9
    },
    {
      id: "comment_sudoku_2",
      author: "腦力大作戰",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "居然支持鍵盤快捷鍵和自動高亮，玩起來非常絲滑。草稿筆記功能太實用了，推薦硬核玩家挑戰神速難度！",
      timeAgo: "2 小時前",
      likes: 4
    }
  ],
  minesweeper: [
    {
      id: "comment_minesweeper_1",
      author: "胡蘿蔔狂熱粉",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "天哪，萌兔朵朵戴著帽子太可愛了，失誤或者是踩到地鼠時候的無辜表情真讓人忍俊不禁！",
      timeAgo: "10 分鐘前",
      likes: 8
    },
    {
      id: "comment_minesweeper_2",
      author: "花園漫步者",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "玩起來非常舒服！安全區會長出可愛的小草芽和蘿蔔葉 🌱，不愧是高精緻度的療癒系踩地雷，第一次玩到這麼有溫度且反饋十足的玩法！",
      timeAgo: "45 分鐘前",
      likes: 12
    }
  ],
  tictactoe: [
    {
      id: "comment_tictactoe_1",
      author: "肉墊收藏家",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "天哪！肉墊棋子真的太融化了！每次落子還有貓叫狗吠的音效，和AI對戰還會不服輸，太療癒了吧！",
      timeAgo: "2 分鐘前",
      likes: 5
    },
    {
      id: "comment_tictactoe_2",
      author: "棋藝界喵星人",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "有雙人同屏對戰和智慧人機對戰兩種模式可選。聰明難度非常有挑戰性！介面繪畫風格簡直就是為我量身打造的！",
      timeAgo: "15 分鐘前",
      likes: 9
    }
  ],
  rockpaperscissors: [
    {
      id: "comment_rps_1",
      author: "森林守護者",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "小熊和松鼠的表情真的超級可愛！還可以積攢怒氣釋放萌物必殺技（超級剪刀石頭布），真的太好玩了！",
      timeAgo: "3 分鐘前",
      likes: 6
    },
    {
      id: "comment_rps_2",
      author: "猜拳王123",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "我最喜歡它的「瘋狂預判模式」和「奇術卡牌玩法」，不單純是看運氣，還能用各類趣味道具與絕招來扭轉局勢，設計得太精緻了！",
      timeAgo: "22 分鐘前",
      likes: 11
    }
  ],
  tetris: [
    {
      id: "comment_tetris_1",
      author: "糖果盒小專家",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "天哪，果凍積木消掉的時候竟然有特別好玩的QQ彈性特效！還有背景小熊巴魯的搞笑小台詞，太萌了！",
      timeAgo: "5 分鐘前",
      likes: 14
    },
    {
      id: "comment_tetris_2",
      author: "俄羅斯方塊大師",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "果凍效果做得非常到位，音樂特別愉快，居然含有難度遞增的萌態特訓、無盡佛系和限時速消三種自訂規則，強烈推薦！",
      timeAgo: "1 小時前",
      likes: 21
    }
  ]
};

export const GAMES_DATA: Game[] = [
  {
    id: "cafe",
    title: "小動物咖啡廳",
    category: "simulation",
    categoryName: "模擬經營",
    tags: ["模擬經營", "療癒", "單人遊戲"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "medium",
    playTimeName: "5-15分鐘 (挑戰)",
    rating: 4.9,
    timesPlayed: 118400,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBS84TmphOqbWStZyoOxno59BF9Se1A4CUKxR7NY3V05peGQPy2TzVDm7nsesDt8tRRc5iKD2Y3F-_SztMiXvYNrnYQ-SWQMaiPy_fOIJLfMfjj9S66nFPnbHWHC-7sIxWqXk_RTgUN-03rXtRI0Y3PoycQA2GFsPHB-PTp8wbQJIAqRr02HsyYFw5YrwpnsxFJeYfqwRUYVDjvBO7tfbz7PHEdn9olnTs894u908O0a3lj5YrBdnI26dneoANEDoLhx39BKdttIl5z",
    description: "招待各式各樣暖萌毛絨的森林小動物。根據牠們的心願，親手沖調咖啡與烘烤可愛杯子麵包甜點，打造溫馨夢幻的森林小店。",
    hotness: 97
  },
  {
    id: "jelly",
    title: "彩色果凍三消",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["三消", "熱門"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "short",
    playTimeName: "5分鐘內 (休閒)",
    rating: 4.9,
    timesPlayed: 85200,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwU66PIfgSh3qj1xmebj9laneyRCaIF_x5XTqc4IqgGEyxmbOIA2mpb8QwJVP7Ls3OGvVS3qVpV0TQvgzGPf_tZgugOHAuIzkDc1jJknBj5RjmgGRqPlxBtFslagbi-30RK28cRxl0t0xei2CLpoY77gNM3R6Tj0gH_yJ0c1T6tuAPp0gmcdnwzMzMR1hed6K0k5JsNBkUTu3W5SlU5_DmZongjEtzu87C0xGRJM3c-3xcAB1qVD5OIuzM-z2YCyQRSljmSwzXLdzv",
    description: "挑戰靈活腦力，將可愛軟萌的彩色果凍滑動對齊，引爆充滿治癒感的果凍波波特效！",
    hotness: 92
  },
  {
    id: "wood",
    title: "木塊推推樂",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["邏輯", "舒壓"],
    difficulty: "medium",
    difficultyName: "中等",
    playTime: "medium",
    playTimeName: "5-15分鐘 (挑戰)",
    rating: 4.7,
    timesPlayed: 64100,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOiPqIf8Z_5CHiPV7H7Ki77iO5EIxh1UMfJhxu332vYRohAF_W0_REBdummqnnpXpZbV37vKcYKS_L_bzit8St1rGRNqWC_1hP8nVo8vcP3EWOVFODwFuMx7BnCt1jUP8ix4suYBU11UDj36GinQWYhWGkphCKFbzpqV9Sz0p5_PelsNsuF1eeFqlm92nWK3BCaFIVPeUhEW4a-CbUg3RvFwfbJBoDDXE3gW4IqoMBcipri6Fu-L2vjLiJak0Guws6HPne5XLW42Xa",
    description: "在溫暖午後的陽光下，拖動質樸的木製積木拼圖，為關鍵木塊打通出口，既燒腦又舒壓。",
    hotness: 88
  },
  {
    id: "snake",
    title: "貪食蛇之王",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["動作", "懷舊", "療癒"],
    difficulty: "medium",
    difficultyName: "中等",
    playTime: "short",
    playTimeName: "5分鐘內 (休閒)",
    rating: 4.8,
    timesPlayed: 52100,
    image: "/src/assets/images/snake_king_cover_1780230735095.png",
    description: "控制超萌森林果凍蛇，在百吃不厭的草地冒險裡，收集草莓與黃金果實，挑戰最長蛇王極限！",
    hotness: 90
  },
  {
    id: "sudoku",
    title: "萌寵數字九宮格",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["邏輯", "燒腦", "療癒"],
    difficulty: "medium",
    difficultyName: "中等",
    playTime: "medium",
    playTimeName: "5-15分鐘 (挑戰)",
    rating: 4.8,
    timesPlayed: 43200,
    image: "/src/assets/images/sudoku_cover_1780231940664.png",
    description: "與森林奇妙萌寵一起開動腦筋！在木香悠遠的九宮格魔法盤上，填寫彩色數字並解密療癒的益智數獨謎題。",
    hotness: 91
  },
  {
    id: "minesweeper",
    title: "萌兔胡蘿蔔探險",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["邏輯", "益智", "療癒"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "medium",
    playTimeName: "5-10分鐘 (休閒)",
    rating: 4.9,
    timesPlayed: 32600,
    image: "/src/assets/images/minesweeper_bunny_cover_1780233195871.png",
    description: "陪膽小溫順的萌兔朵朵一起在陽光花園拔胡蘿蔔！仔細辨認土壤泥巴處的周圍警告數字，佈置安全防風罩繞開頑皮地鼠。",
    hotness: 93
  },
  {
    id: "tictactoe",
    title: "萌喵汪汪爪爪棋",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["邏輯", "對決", "療癒"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "short",
    playTimeName: "5分鐘內 (休閒)",
    rating: 4.9,
    timesPlayed: 25100,
    image: "/src/assets/images/tictactoe_cover_1780235758823.png",
    description: "軟萌的小貓和小狗在柔軟的地毯上開啟了爪爪棋對抗！放下香黏貓爪和汪汪骨頭，與超群的智慧AI或好友同屏度過快樂時光。",
    hotness: 94
  },
  {
    id: "rockpaperscissors",
    title: "盟寵森友猜猜拳",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["猜拳", "策略", "療癒"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "short",
    playTimeName: "5分鐘內 (休閒)",
    rating: 4.9,
    timesPlayed: 18400,
    image: "/src/assets/images/rps_bear_cover_1780236377965.png",
    description: "在陽光斑駁的童話森林中，和小熊巴魯、松鼠皮皮開啟奇妙的萌趣猜拳爭霸！體驗經典的剪刀石頭布之外，還能解鎖神祕道具、怒氣必殺技能與卡牌奇術模式！",
    hotness: 95
  },
  {
    id: "tetris",
    title: "萌熊果凍積木盒",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["拼圖", "敏捷", "療癒"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "medium",
    playTimeName: "5-15分鐘 (挑戰)",
    rating: 4.9,
    timesPlayed: 38200,
    image: "/src/assets/images/tetris_bear_cover_1780242039147.png",
    description: "和小熊巴魯一塊把五彩繽紛、QQ彈彈的糖果果凍積木完美拼入保鮮盒中吧！挑戰經典、阻礙、和限時速消玩法，體驗滿屏果凍消除時的極致解壓快感！",
    hotness: 96
  }
];

export const OTHER_LEADERBOARD: { rank: number; title: string; hotness: number; icon: string; bgClass: string; iconClass: string; category: string }[] = [
  { rank: 7, title: "森林小餐廳", hotness: 72, icon: "restaurant", bgClass: "bg-[#a7f3d0]/30", iconClass: "text-[#1b6b4f]", category: "美食" },
  { rank: 8, title: "色塊塗鴉趣", hotness: 65, icon: "brush", bgClass: "bg-[#fdd0ea]/30", iconClass: "text-[#765469]", category: "藝術" },
  { rank: 9, title: "音樂泡泡龍", hotness: 61, icon: "music_note", bgClass: "bg-[#f3e580]/30", iconClass: "text-[#695f02]", category: "音樂" },
  { rank: 10, title: "可愛寵物屋", hotness: 58, icon: "pets", bgClass: "bg-[#e1e3e4]/30", iconClass: "text-[#6f7973]", category: "養成" }
];
