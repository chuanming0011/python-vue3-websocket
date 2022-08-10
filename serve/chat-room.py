# -*- coding: utf-8 -

import asyncio, websockets, json, hashlib


class Chat:

    userList = []               # 用户账户 唯一
    userPasswordsDict = {}      # 用户密码
    allUserHeaderImageUrl = {}  # 用户头像
    allUserSocketSet = set()    # 用户socket对象 用于通知所有在线用户
    allUserSocketDict = {}      # 用户键值对socket对象一一对应  可以给指定用户发送消息

    def __init__(self, ip, port):

        self.ip = ip                 # 主机ip地址
        self.port = port             # 自定义端口号
        self.initWebSocket()

    # 初始化websocket
    def initWebSocket(self):

        socketServe = websockets.serve(self.Recive, self.ip, self.port)
        asyncio.get_event_loop().run_until_complete(socketServe)
        asyncio.get_event_loop().run_forever()

    # 接受客户端的数据
    async def Recive(self, websocket):
        async for msg in websocket:
            try:
                data = self.parseJson(msg)
                # print(data)
                await self.handlerEvents(data, websocket)
            except Exception as e:
                print(e)

    # 判断客户端传递过来的事件
    async def handlerEvents(self, data, websocket):
        if data['event'] == 'login':
            await self.Login(data, websocket)
        elif data['event'] == 'ping':
            self.pong(websocket)
        elif data['event'] == 'chatOne':
            await self.chatOne(data,websocket)
        elif data['event'] == 'GetHeaderImage':
            await self.getHeaderimage(data, websocket)
        elif data['event'] == 'loginOut':
            self.loginOut(data, websocket)
        elif data['event'] == 'chatRoom':
            await self.chatRoom(data, websocket)

    # 转json
    def toJson(self, data):
        return json.dumps(data, ensure_ascii=False)

    # json转字典
    def parseJson(self, data):
        return json.loads(data)

    # 返回头像
    async def getHeaderimage(self, data, websocket):
        if data['username'] in self.userList:
            image = self.allUserHeaderImageUrl[data['username']]
            result = {
                'event': 'HeaderImage',
                'code': 200,
                'url': image
            }
            await websocket.send(self.toJson(result))

    # 登录加注册
    # @params {username,password，HeaderImageUrl}  账号 密码 头像地址
    # @return {message,code,event,username,HeaderImageUrl,token} 状态说明，返回状态码, 当前事件 账号 头像地址 token暂时没用到
    async def Login(self, data, websocket):
        try:
            result = {
                'message': "",
                'code': 3001,
                'event': "",
            }
            username = data['username']
            userpassword = data['password']
            # 未注册
            if username not in self.userList:
                self.userList.append(username)
                self.userPasswordsDict[username] = hashlib.md5(
                    userpassword.encode()).hexdigest()
                self.allUserHeaderImageUrl[username] = data['HeaderImageUrl']

                result['message'] = "登录成功"
                result['code'] = 200
                result['event'] = 'loginsuccess'
                result['username'] = username
                result['HeaderImageUrl'] = data['HeaderImageUrl']
                result['token'] = hashlib.md5(username.encode()).hexdigest()
            # 已注册
            else:
                if hashlib.md5(userpassword.encode()).hexdigest() == self.userPasswordsDict[username]:
                    result['message'] = "登录成功"
                    result['code'] = 200
                    result['event'] = 'loginsuccess'
                    result['username'] = username
                    result['HeaderImageUrl'] = self.allUserHeaderImageUrl[username]
                    result['token'] = hashlib.md5(
                        username.encode()).hexdigest()
                else:
                    result['message'] = "密码错误"
                    result['event'] = 'passworderror'
                    result['code'] = 3002
        except Exception as e:
            print(e)
            result = {
                'message': "请先登录",
                'code': 3004,
                'event': "loginfail",
            }
        finally:
            if result['code'] == 200:
                self.allUserSocketSet.add(websocket)
                self.allUserSocketDict[username] = websocket
                alluser = self.getAllOnline(username)
                result['alluser'] = alluser
                toOtherUser = {
                    "event": "join",
                    'user': [
                        {
                            "username": username,
                            "HeaderImageUrl": self.allUserHeaderImageUrl[username],
                        }
                    ]
                }
                self.sendMsessageOther(websocket, toOtherUser)

            await websocket.send(self.toJson(result))

    # 登出  从在线集合删除 对应字典置为空
    def loginOut(self, data, websocket):
        username = data['username']
        self.allUserSocketSet.remove(websocket)
        self.allUserSocketDict[username] = None
        message = {
            "event": "userLoginOut",
            "username": username
        }
        self.sendMsessageOther(websocket, message)

    # 群聊
    async def chatRoom(self, data, websocket):
        try:
            if data['fromUser'] not in self.userList:
                data = {
                    'message': "请先登录",
                    'code': 3004,
                    'event': "loginfail",
                }
                await websocket.send(self.toJson(data))
            else:
                data = {
                    'fromUser': data['fromUser'],
                    'message': data['message'],
                    'HeaderImageUrl': self.allUserHeaderImageUrl[data['fromUser']],
                    'code': 200,
                    'event': 'chatRoom',
                    'isRead': False,
                    'type':data['type'],
                }
                self.sendMsessageOther(websocket, data)


        except Exception as e:
            print('error:', e)

    #单独聊天
    async def chatOne(self, data, websocket):
      if data['fromUser'] not in self.userList:
          data = {
              'message': "请先登录",
              'code': 3004,
              'event': "loginfail",
          }
          await websocket.send(self.toJson(data))
      fromUser = data['fromUser']
      toUser = data['toUser']
      msg = data['message']
      wb = self.allUserSocketDict[toUser]
      message = {
        "fromUser":fromUser,
        "message":msg,
        'HeaderImageUrl': self.allUserHeaderImageUrl[fromUser],
        "code":200,
        "event":"chatOne",
        "isRead": False,
        'type':data['type'],
      }
      await wb.send(self.toJson(message))


    # 发送给除自己以外的所有人
    def sendMsessageOther(self, websocket, data):
        otherUsersSet = self.allUserSocketSet.copy()
        otherUsersSet.discard(websocket)
        if otherUsersSet:
            self.sendMsessageGroup(otherUsersSet, data)
            otherUsersSet = None

    # 发送消息给指定组
    def sendMsessageGroup(self, group, data):
        if group:
            websockets.broadcast(group, self.toJson(data))

    # 心跳
    def pong(self):
        return True

    # 获取自己以外在线的所有人的头像和昵称
    def getAllOnline(self, name):
        nowList = self.userList.copy()
        nowList.remove(name)
        # 去除不在的用户
        for user in self.allUserSocketDict:
          if self.allUserSocketDict[user] == None:
            nowList.remove(user)
        backAllUserList = []
        for i in nowList:
            backAllUserList.append({
                'username': i,
                'HeaderImageUrl': self.allUserHeaderImageUrl[i]
            })
        return backAllUserList


if __name__ == "__main__":

    ip = '192.168.2.69'   # 主机ip   
    port = 3001           # 端口
    chat = Chat(ip, port)
