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
        if (Config.hashtypes.includes('videos')) {
            downloadVideo(data.ipfshash,async () => {
                for await (const file of IPFS.add(globSource(data.ipfshash, { recursive: true }), { trickle: true })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        }

        if (Config.hashtypes.includes('sprites') && data.spritehash) {
            downloadVideo(data.spritehash,async () => {
                for await (const file of IPFS.add(globSource(data.spritehash, { recursive: true }), { trickle: true })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        }

        if (Config.hashtypes.includes('thumbnails') && data.snaphash) {
            downloadVideo(data.snaphash,async () => {
                for await (const file of IPFS.add(globSource(data.snaphash, { recursive: true }), { trickle: false })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        }

        if (Config.hashtypes.includes('video240') && data.ipfs240hash) {
            downloadVideo(data.ipfs240hash,async () => {
                for await (const file of IPFS.add(globSource(data.ipfs240hash, { recursive: true }), { trickle: true })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        }

        if (Config.hashtypes.includes('video480') && data.spritehash) {
            downloadVideo(data.ipfs480hash,async () => {
                for await (const file of IPFS.add(globSource(data.ipfs480hash, { recursive: true }), { trickle: true })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        }

        if (Config.hashtypes.includes('video720') && data.spritehash) {
            downloadVideo(data.ipfs720hash,async () => {
                for await (const file of IPFS.add(globSource(data.ipfs720hash, { recursive: true }), { trickle: true })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        }

        if (Config.hashtypes.includes('video1080') && data.spritehash) {
            downloadVideo(data.ipfs1080hash,async () => {
                for await (const file of IPFS.add(globSource(data.ipfs1080hash, { recursive: true }), { trickle: true })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        }
    } else if (data.imghash) {
        // image/thumbnail upload
        if (Config.hashtypes.includes('images') && data.imgtype === 'images') {
            downloadVideo(data.imghash,async () => {
                for await (const file of IPFS.add(globSource(data.imghash, { recursive: true }), { trickle: true })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        } else if (Config.hashtypes.includes('thumbnails') && data.imgtype === 'thumbnails') {
            downloadVideo(data.imghash,async () => {
                for await (const file of IPFS.add(globSource(data.imghash, { recursive: true }), { trickle: false })) {
                    console.log('pinned ' + file.cid.toString() + ' recursively')
                }
            })
        }
    } else if (Config.hashtypes.includes('subtitles') && data.hash) {
        // subtitle upload
        downloadVideo(data.hash,async () => {
            for await (const file of IPFS.add(globSource(data.hash, { recursive: true }), { trickle: false })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        })
    }
})

function downloadVideo(hash,cb) {
    let src = Config.gateway + '/ipfs/' + hash
    let download = wget.download(src,hash,{})
    download.on('error',(e) => {
        if (e) console.log('Download error',e)
    })
    download.on('start',(filesize) => {
        console.log('File download begin (' + filesize + ')')
    })
    download.on('end',() => {
        cb()
    })
}