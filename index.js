const SocketIO = require('socket.io-client')
const Config = require('./config.json')

let ipsync = SocketIO.connect(Config.socketioEndpoint)

ipsync.on('message',(message) => {
    console.log(message)
})

ipsync.on('upload',(data) => {
    console.log(data)
})