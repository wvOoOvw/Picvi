export const subscription = [
  {
    "name": "游客",
    "description": "不可查看完整内容",
    "accessExpireTime": "永久有效",
    "accessExpireTimeDayJS": ["1000", "year"],
    "price": 0,
    "priceOffset": 0,
    "value": "user",
    "noSale": true,
    "noResubscribe": true
  },
  {
    "name": "管理员",
    "description": "拥有所有权限",
    "accessExpireTime": "永久有效",
    "accessExpireTimeDayJS": ["1000", "year"],
    "price": 0,
    "priceOffset": 0,
    "value": "administrator",
    "noSale": true,
    "noResubscribe": true
  },
  {
    "name": "体验会员",
    "description": "通过推广可免费查看图集的全部内容",
    "accessExpireTime": "60分钟",
    "accessExpireTimeDayJS": ["60", "minute"],
    "price": 0,
    "priceOffset": 0,
    "value": "user:album",
    "noSale": true,
    "noResubscribe": true
  },
  {
    "name": "普通会员",
    "description": "可查看图集的全部内容",
    "accessExpireTime": "1年",
    "accessExpireTimeDayJS": ["1", "year"],
    "price": 60,
    "value": "user:album"
  },
  {
    "name": "高级会员",
    "description": "可查看图集、漫画、视频的全部内容",
    "accessExpireTime": "永久有效",
    "accessExpireTimeDayJS": ["1000", "year"],
    "price": 98,
    "value": "user:album.cartoon.video"
  }
]