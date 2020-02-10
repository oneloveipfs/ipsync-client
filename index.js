const SocketIO = require('socket.io-client')
const IPFSHttpClient = require('ipfs-http-client')
const Config = require('./config.json')

const IPFS = IPFSHttpClient({ host: 'localhost', port: '5001', protocol: 'http'})
const { urlSource } = IPFSHttpClient

if (Config.hashtypes.length === 0) console.log('Warning: selected hash types is empty, IPSync client will not pin any files.')

let ipsync = SocketIO.connect(Config.socketioEndpoint)

ipsync.on('message',(message) => {
    console.log(message)
})

ipsync.on('upload',async (data) => {
    if (Config.users !== []) {
        if (!Config.users.includes(data.username)) return
    }

    if (data.ipfshash) {
        // video upload
        if (Config.hashtypes.includes('videos')) {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.ipfshash, { recursive: true }), { trickle: true })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        }

        if (Config.hashtypes.includes('sprites') && data.spritehash) {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.spritehash, { recursive: true }), { trickle: true })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        }

        if (Config.hashtypes.includes('thumbnails') && data.snaphash) {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.spritehash, { recursive: true }), { trickle: false })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        }

        if (Config.hashtypes.includes('video240') && data.spritehash) {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.ipfs240hash, { recursive: true }), { trickle: true })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        }

        if (Config.hashtypes.includes('video480') && data.spritehash) {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.ipfs480hash, { recursive: true }), { trickle: true })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        }

        if (Config.hashtypes.includes('video720') && data.spritehash) {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.ipfs720hash, { recursive: true }), { trickle: true })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        }

        if (Config.hashtypes.includes('video240') && data.spritehash) {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.ipfs1080hash, { recursive: true }), { trickle: true })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        }
    } else if (data.imghash) {
        // image/thumbnail upload
        if (Config.hashtypes.includes('images') && data.imgtype === 'images') {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.imghash, { recursive: true }), { trickle: true })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        } else if (Config.hashtypes.includes('thumbnails') && data.imgtype === 'thumbnails') {
            for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.imghash, { recursive: true }), { trickle: false })) {
                console.log('pinned ' + file.cid.toString() + ' recursively')
            }
        }
    } else if (Config.hashtypes.includes('subtitles') && data.hash) {
        // subtitle upload
        for await (const file of IPFS.add(urlSource(Config.gateway + '/ipfs/' + data.hash, { recursive: true }), { trickle: false })) {
            console.log('pinned ' + file.cid.toString() + ' recursively')
        }
    }
})