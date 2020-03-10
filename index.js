const SocketIO = require('socket.io-client')
const IPFSHttpClient = require('ipfs-http-client')
const wget = require('wget-improved');
const Config = require('./config.json')

const IPFS = IPFSHttpClient({ host: 'localhost', port: '5001', protocol: 'http'})
const { globSource } = IPFSHttpClient

if (Config.hashtypes.length === 0) console.log('Warning: selected hash types is empty, IPSync client will not pin any files.')

let ipsync = SocketIO.connect(Config.socketioEndpoint)

ipsync.on('message',(message) => {
    console.log(message)
})

ipsync.on('upload',async (data) => {
    console.log('received',data)

    if (data.ipfshash) {
        // video upload
        if (Config.hashtypes.includes('videos')) pinVideo(data.ipfshash,true)
        if (Config.hashtypes.includes('sprites') && data.spritehash) pinVideo(data.spritehash,true)
        if (Config.hashtypes.includes('thumbnails') && data.snaphash) pinVideo(data.snaphash,false)
        if (Config.hashtypes.includes('video240') && data.ipfs240hash) pinVideo(data.ipfs240hash,true)
        if (Config.hashtypes.includes('video480') && data.spritehash)  pinVideo(data.ipfs480hash,true)
        if (Config.hashtypes.includes('video720') && data.spritehash) pinVideo(data.ipfs720hash,true)
        if (Config.hashtypes.includes('video1080') && data.spritehash) pinVideo(data.ipfs1080hash,true) 
    } else if (data.imghash) {
        // image/thumbnail upload
        if (Config.hashtypes.includes('images') && data.imgtype === 'images')
            pinVideo(data.imghash,true)
        else if (Config.hashtypes.includes('thumbnails') && data.imgtype === 'thumbnails')
            pinVideo(data.imghash,false)
    } else if (Config.hashtypes.includes('subtitles') && data.hash)
        // subtitle upload
        pinVideo(data.hash,false)
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
        for await (const file of IPFS.add(globSource(hash, { recursive: true }), { trickle: trickle })) {
            console.log('pinned ' + file.cid.toString() + ' recursively')
        }
    })
}