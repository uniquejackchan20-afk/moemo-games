/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Game, Comment } from './types';
import snakeCover from './assets/images/snake_cover_256_1780305848486.jpg';
import sudokuCover from './assets/images/sudoku_cover_256_1780305872182.jpg';
import minesweeperCover from './assets/images/minesweeper_cover_256_1780305893961.jpg';
import tictactoeCover from './assets/images/tictactoe_cover_256_1780305915297.jpg';
import rpsCover from './assets/images/rps_cover_256_1780305935569.jpg';
import tetrisCover from './assets/images/tetris_cover_256_1780305954863.jpg';
import breakoutCover from './assets/images/breakout_cover_256_1780308992054.jpg';
import bubbleCover from './assets/images/bubble_cover_256_1780365248727.jpg';
import tilematchCover from './assets/images/tilematch_cover_1780366535767.jpg';
import sortworksCover from './assets/images/sortworks_cover_1780367280259.jpg';
import mahjongCover from './assets/images/mahjong_cover_1780367800.jpg';


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
  ],
  breakout: [
    {
      id: "comment_breakout_1",
      author: "蜜糖守望者",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "天哪！這個小熊敲磚塊簡直就是夢幻花園的顏值天花板！露珠划過軌跡的微光和樹葉大護盾音效都萌哭了！🥺💖",
      timeAgo: "剛剛",
      likes: 31
    },
    {
      id: "comment_breakout_2",
      author: "撞磚王巴魯",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "玩狂暴蜜晶雨模式拿到了 8500 分！掉落的分裂花粉和黏黏蜂蜜真的非常解壓，絕對算是我最愛的一款特訓遊戲啦！🌸🍯",
      timeAgo: "12 分鐘前",
      likes: 18
    }
  ],
  bubble: [
    {
      id: "comment_bubble_1",
      author: "彩虹泡泡兔",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "氣泡球相撞彈出的聲音好治癒！特別是連鎖大消解和氣泡掉落的時候，簡真是極致的視覺解壓享受！ 🎈🐰💖",
      timeAgo: "剛剛",
      likes: 25
    },
    {
      id: "comment_bubble_2",
      author: "流光森林探索家",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "無盡意境雨模式到後面降下來的速度好刺激，朵朵兔子急得一直耳朵動，實在是太討人喜歡了！🐇🌟",
      timeAgo: "5 分鐘前",
      likes: 14
    }
  ],
  tilematching: [
    {
      id: "comment_tile_1",
      author: "吉祥橘子醬",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "我的天！招財松鼠「阿吉」也太富貴萌了吧！聽著古琴合成的音樂清消除，每次消去柿子和蘋果時彈出的吉祥祝福語真討口彩！🍎🍊🎋",
      timeAgo: "剛剛",
      likes: 38
    },
    {
      id: "comment_tile_2",
      author: "歲歲平安老法師",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "最愛第三關祥瑞大圓滿！多層重疊的3D透透感做得真到位，明暗強烈，配合松果小揹簍移出，很有解謎破陣的儀式感！🐿️🧧",
      timeAgo: "8 分鐘前",
      likes: 21
    }
  ],
  sortworks: [
    {
      id: "comment_sort_1",
      author: "玲瓏大掌櫃",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "天哪，紅熊貓「小禾」太討喜了！每次當我消下一整筒金璨珠時他都放煙花翻跟頭，古風編鐘般的音效也極具儀式感！🎋🌟🌾",
      timeAgo: "1 分鐘前",
      likes: 42
    },
    {
      id: "comment_sort_2",
      author: "五行大衍居士",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "難得一見的高雅玉珠分類遊戲！3D微縮感的翡翠竹筒很有質感。撤銷功能十分良心，後面關卡很有深度！🧐🏆",
      timeAgo: "12 分鐘前",
      likes: 29
    }
  ],
  mahjong: [
    {
      id: "comment_mahjong_1",
      author: "雀界白面書生",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIbpPAVJYf9pTccLQsaOk-IYcP5Cu0unzqkpFhbn1boKQwDg66qPyufc0kD-lJ8XqTjxYRgGi18YtwZ02vDhSD3HmVB6XGZO-Iw5GYVJNs4SGjN2-6GJxXBzwV_BY4ywU9VG2crSKCj_N-_2Z7ni5ji9RLQ6jVmGb0T6U8jD5rlMSBRajuYfNCIZZic4PsKxFClQttRrL0HEZIfmlut8oxJGjd5dtxeCIUKh-n7Swuw0hs-ppsmNH_Vvonc4_hwQ2zzeezli5thFRW",
      content: "實在太好玩了！沒想到還能一邊在大牌雀中消消消，一邊積攢聽牌，最後組成「大四喜」或者「大三元」那一下，金光特效簡直炸裂！🀄🎨🐾",
      timeAgo: "剛才",
      likes: 48
    },
    {
      id: "comment_mahjong_2",
      author: "雀后喵喵醬",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYM1WChbAHYMPMMBB6IqLKRh344RuCgtHJQUCoQLBCBKw3yCE-aOsfbtLSEcsVDIbXUerUe4tNiXIbBtFCIOjZZifpxWJLqvQNYEECJIKecLeAWrPdQobwDxhidzAyX0AAEfYEU1nKTWrhBk1BGk5PlNyA9jhCkcjEq_NSLc2eQWtI1W7Onh5Ctnh_hQUbkXEFTEPa_bJwhghbbmaNoOE_tuNtF5sDdWGJLY9Ij7nnuvSHN-OAtuHW0xidpwgSld2kqNciIKzzweNx",
      content: "萌貓「胖胖」也太軟糯了吧，每次胡大牌時還在旁邊打著太極翻滾，特別適合跟朋友一起比拼胡牌聽牌的速度！🀆🀅🀄🧧",
      timeAgo: "15 分鐘前",
      likes: 31
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
    image: snakeCover,
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
    image: sudokuCover,
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
    image: minesweeperCover,
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
    image: tictactoeCover,
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
    image: rpsCover,
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
    image: tetrisCover,
    description: "和小熊巴魯一塊把五彩繽紛、QQ彈彈的糖果果凍積木完美拼入保鮮盒中吧！挑戰經典、阻礙、和限時速消玩法，體驗滿屏果凍消除時的極致解壓快感！",
    hotness: 96
  },
  {
    id: "breakout",
    title: "萌熊蜜糖碰碰樂",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["撞磚", "休閒", "療癒", "單人遊戲"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "short",
    playTimeName: "5分鐘內 (休閒)",
    rating: 4.9,
    timesPlayed: 52600,
    image: breakoutCover,
    description: "手握翠綠的橡葉法寶與小熊巴魯一起出發！靈活反彈色彩斑斕的蜜糖露珠，擊碎各色香甜多汁的蜜糖格與黃金蜂巢，享受漫天花粉分裂及愛心護盾跌落的快樂！",
    hotness: 95
  },
  {
    id: "bubble",
    title: "萌兔花園氣泡彈",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["射擊", "消除", "療癒", "單人遊戲"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "short",
    playTimeName: "5分鐘內 (休閒)",
    rating: 4.9,
    timesPlayed: 31200,
    image: bubbleCover,
    description: "舉起朵朵兔子特製的粉嫩魔法吹管！精準瞄準投擲夢幻絢麗的彩色泡泡露，創造 3 個以上的花粉消除奇蹟，在紛紛灑灑的泡泡雨和療癒連消中收穫滿載朝氣！",
    hotness: 96
  },
  {
    id: "tilematching",
    title: "萌獸柿柿如意消",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["疊疊消", "消除", "療癒", "單人遊戲"],
    difficulty: "medium",
    difficultyName: "普通",
    playTime: "medium",
    playTimeName: "5-15分鐘 (挑戰)",
    rating: 4.9,
    timesPlayed: 24500,
    image: tilematchCover,
    description: "與招財小松鼠阿吉攜手入局！看準重疊錯落的吉祥花果玉瓷塊，明暗調色，步步為營，將柿子、桔子和仙桃相匹配，在阿吉神奇松果揹簍的加持下享受無與倫比的好運速消！",
    hotness: 97
  },
  {
    id: "sortworks",
    title: "萌寵五福玲瓏閣",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["分類", "排序", "五行", "療癒"],
    difficulty: "medium",
    difficultyName: "普通",
    playTime: "medium",
    playTimeName: "5-15分鐘 (挑戰)",
    rating: 4.9,
    timesPlayed: 18900,
    image: sortworksCover,
    description: "閣內玲瓏五行玉珠雜亂堆放，快展現你的調配才智！將散落的珠子按相同五行色彩與吉利寓意完整歸類到竹筒與如意罐中，由紅熊貓閣主「小禾」為你常駐祥瑞福運！",
    hotness: 98
  },
  {
    id: "mahjong",
    title: "萌仙吉兆雀神樂",
    category: "puzzle",
    categoryName: "益智解謎",
    tags: ["麻將", "配對", "益智", "國粹", "療癒"],
    difficulty: "easy",
    difficultyName: "簡單",
    playTime: "medium",
    playTimeName: "5-15分鐘 (挑戰)",
    rating: 4.9,
    timesPlayed: 21500,
    image: mahjongCover,
    description: "迎來蓬鬆如雲的雀仙萌貓「胖胖」！在香氣裊裊、祥光躍動的暖閣中，解鎖由純手作美玉打造的立體吉兆麻將牌。尋找並點擊相同花色的對牌進行連消，逐步拼湊出「大四喜」、「十三幺」等祥瑞大牌！",
    hotness: 99
  }
];

export const OTHER_LEADERBOARD: { rank: number; title: string; hotness: number; icon: string; bgClass: string; iconClass: string; category: string }[] = [
  { rank: 7, title: "森林小餐廳", hotness: 72, icon: "restaurant", bgClass: "bg-[#a7f3d0]/30", iconClass: "text-[#1b6b4f]", category: "美食" },
  { rank: 8, title: "色塊塗鴉趣", hotness: 65, icon: "brush", bgClass: "bg-[#fdd0ea]/30", iconClass: "text-[#765469]", category: "藝術" },
  { rank: 9, title: "音樂泡泡龍", hotness: 61, icon: "music_note", bgClass: "bg-[#f3e580]/30", iconClass: "text-[#695f02]", category: "音樂" },
  { rank: 10, title: "可愛寵物屋", hotness: 58, icon: "pets", bgClass: "bg-[#e1e3e4]/30", iconClass: "text-[#6f7973]", category: "養成" }
];
