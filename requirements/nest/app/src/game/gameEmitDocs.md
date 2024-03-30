## create-room
### request
- speed: number, 1, 2, 4
### response
#### fail
- ststus: 'fail'
- reason: 실패 이유
#### success
- status: 'success'
- room: room data


## match-making
### request
- none
### response
- queue 에 들어간 경우: none
- 게임이 시작되는 경우: 'start-game' 으로 emit

## cancel-match-making
### request
- none
### response
- none

## join-room
### request
- roomId: string
### response
#### fail
- status: 'fail'
- reason: 실패 이유
#### success
- 'start-game' 으로 emit

## invite-room
### request
- targetId: number, 초대받는 상대의 id
- roomId: string, 생성된 방의 id
### response
#### fail
- status: 'fail'
- reason: 실패 이유
#### success
- status: 'success'

## invite-room-chat
### request
- targetNick: string, 4~20
- roomId: string, 생성된 방의 id
### response
#### success
- status: 'success'
- roomId: string
- targetNick: 초대하는 사람 닉네임

## invite-reject
### request
- roomId: string
### response
#### fail
- state: 'fail'
- reason: 실패 이유
#### success
- end-game 날려줌

## leave-room
### request
- roomId: string
### response
#### fail
- status: 'fail'
- reason: 실패 이유
#### success
- 'end-game' 으로 emit

## key-in
### request
- roomId: string
- key: 'ArrowDown' | 'ArrowUp'

## start-game
- 게임 시작 알림
- 창 변경
### response
- roomId: string

## end-game
- 게임 끝 알림
- 창 변경
### response
- none

## render
- 게임 데이터 전송
### request
- roomId: string
### response
#### fail
- status: 'fail'
- reason: 실패 이유
#### success
- gameApp.render() 데이터