const SocketIO = require('socket.io-client')
const IPFSHttpClient = require('ipfs-http-client')
const wget = require('wget-improved')
const fs = require('fs')
const Config = require('./config.json')

const IPFS = IPFSHttpClient.create({ host: 'localhost', port: '5001', protocol: 'http'})

if (Config.hashtypes.length === 0) console.log('Warning: selected hash types is empty, IPSync client will not pin any files.')

let ipsync = SocketIO.connect(Config.socketioEndpoint)

ipsync.on('message',(message) => {
    console.log(message)
})

ipsync.on('upload',async (data) => {
    console.log('received',data)

    if (Config.users.length > 0) {
        let isUser = false
        for (let i in Config.users)
            if (data.username == toUsername(Config.users[i]) && data.network == toNetwork(Config.users[i]))
                isUser = true
        if (!isUser) return
    }

    if (data.ipfshash) {
        // video upload
        if (Config.hashtypes.includes('videos')) pinVideo(data.ipfshash,true)
        if (Config.hashtypes.includes('sprites') && data.spritehash) pinVideo(data.spritehash,true)
        if (Config.hashtypes.includes('thumbnails') && data.snaphash) pinVideo(data.snaphash,false)
    } else if (data.imghash) {
        // image/thumbnail upload
        if (Config.hashtypes.includes('images') && data.imgtype === 'images')
            pinVideo(data.imghash,true)
        else if (Config.hashtypes.includes('thumbnails') && data.imgtype === 'thumbnails')
            pinVideo(data.imghash,false)
    } else if (Config.hashtypes.includes('subtitles') && data.type === 'subtitles' && data.hash)
        // subtitle upload
        pinVideo(data.hash,false)

    // Resumable encoded video uploads
    if (Config.hashtypes.includes('video240') && data.type === 'video240' && data.hash) pinVideo(data.hash,true)
    if (Config.hashtypes.includes('video480') && data.type === 'video480' && data.hash) pinVideo(data.hash,true)
    if (Config.hashtypes.includes('video720') && data.type === 'video720' && data.hash) pinVideo(data.hash,true)
    if (Config.hashtypes.includes('video1080') && data.type === 'video1080' && data.hash) pinVideo(data.hash,true)
})

function pinVideo(hash,trickle) {
    let src = Config.gateway + '/ipfs/' + hash
    let download = wget.download(src,hash,{})
    download.on('error',(e) => {
        if (e) console.log('Download error',e)
    })
    download.on('start',(filesize) => {
        console.log('File download begin (' + filesize + ')')
    })
    download.on('end',async () => {
        let readableStream = fs.createReadStream(hash)
        let ipfsAdd = await IPFS.add(readableStream,{ trickle: trickle, cidVersion: 0 })
        console.log('pinned ' + ipfsAdd.cid.toString() + ' recursively')
        if (Config.deleteDownload)
            fs.unlink(hash,() => {})
    })
}

function toUsername(fullusername) {
    return fullusername.split('@')[0]
}

function toNetwork(fullusername) {
    let parts = fullusername.split('@')
    if (parts.length > 1)
        return parts[1]
    else
        return 'all'
}