export const subscription = [
  {
    "name": "游客",
    "description": "不可查看完整内容",
    "accessExpireTime": "永久有效",
    "accessExpireTimeDayJS": ["1000", "year"],
    "price": "¥0",
    "value": "user"
  },
  {
    "name": "管理员",
    "description": "拥有所有权限",
    "accessExpireTime": "永久有效",
    "accessExpireTimeDayJS": ["1000", "year"],
    "price": "¥0",
    "value": "administrator"
  },
  {
    "name": "普通会员",
    "description": "可查看图集的全部内容",
    "accessExpireTime": "1年",
    "accessExpireTimeDayJS": ["1", "year"],
    "price": "¥99",
    "value": "user:ablum"
  },
  {
    "name": "高级会员",
    "description": "可查看图集、动漫、视频的全部内容",
    "accessExpireTime": "永久有效",
    "accessExpireTimeDayJS": ["1000", "year"],
    "price": "¥199",
    "value": "user:ablum.cartoon.video"
  }
]