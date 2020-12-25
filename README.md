# IPSync Client

A reference implementation of IPSync on the client side. IPSync listens for new uploads on [OneLoveIPFS uploader](https://github.com/oneloveipfs/ipfsVideoUploader) and performs actions based on the upload info received.

In this implementation, the IPFS hashes received are used to pin new uploads to additional IPFS nodes.

## Install

```
git clone https://github.com/oneloveipfs/ipsync-client
cd ipsync-client
npm i
```

#### To start:
```
node .
```

## Configure

All configurations are done in [config.json](https://github.com/oneloveipfs/ipsync-client/blob/master/config.json) file.

* `socketioEndpoint`: The IPSync endpoint of the upload server. Usually ends with `/ipsync`.
* `gateway`: IPFS gateway used to download the newly uploaded file.
* `hashtypes`: Array of hash types to listen to and download. Valid values are listed [here](https://github.com/oneloveipfs/ipfsVideoUploader/blob/master/src/dbManager.js#L30).
* `users`: List of full usernames to listen to, compliant with [username specifications](https://github.com/oneloveipfs/ipfsVideoUploader/blob/master/docs/Usernames.md). Empty array will listen to all users.
* `deleteDownload`: Delete downloaded file after adding to IPFS.