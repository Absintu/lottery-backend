const fs = require('fs')
const Web3 = require ('web3')                                                                                       
const address = '0xEA8aCa6C0712d0b23fdFeAAf4ae88479fBfa6756'
const Lottery = require ('./LotteryEthWeekly.json')
const privateKey = fs.readFileSync('./components/pkey.txt', 'utf8')
const infuraUrl = 'https://goerli.infura.io/v3/71a59d0af9144e5aaf47e0a37c631f2c'
const {parentPort} = require('worker_threads')
// LOTTERY_MINUTES -> Countdown to pick a Winner
const LOTTERY_MINUTES = 1

// Initializes web3 and calls the pickWinner() method from the Lottery contract
const resetLottery = async () =>{
    const web3 = new Web3(infuraUrl)
    const networkId =  await web3.eth.net.getId()
    parentPort.postMessage('NetworkId: ' + networkId)
    parentPort.postMessage('Contract Address: ' + Lottery.networks[networkId].address)
    const lottery = new web3.eth.Contract(
        Lottery.abi,
        Lottery.networks[networkId].address
    )
    const players = await lottery.methods.getPlayers().call()
    parentPort.postMessage('length: ' + players.length)
    if(players.length > 0){
        parentPort.postMessage(await lottery.methods.getPlayers().call())
        const tx = lottery.methods.pickWinner();
        parentPort.postMessage('address: ' + address)
        const data = tx.encodeABI();
        const gas = await web3.eth.estimateGas({
                from: address,
                data,
                to: lottery.options.address
        });
        const gasPrice = await web3.eth.getGasPrice();
        const nonce = await web3.eth.getTransactionCount(address)
        parentPort.postMessage('lottery.options.address: ' + lottery.options.address)
        parentPort.postMessage('data: ' + data)
        parentPort.postMessage('Gas: ' + gas)
        parentPort.postMessage('Gas Price: ' + gasPrice)
        parentPort.postMessage('Nonce: ' + nonce)
        parentPort.postMessage('ChainId: ' + networkId)
        parentPort.postMessage('PrivateKey:......')
        parentPort.postMessage('Trying to send Transaction...') 
        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: lottery.options.address,
                data,
                gas,
                gasPrice,
                nonce,
                chainId: networkId
            },
            privateKey
        );
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        parentPort.postMessage('Transaction hash: ' + receipt.transactionHash)
        } else{
        parentPort.postMessage('No players on this round. Restarting Lottery...')
    }

}

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}    
// Starts the counter in minutes and calls the resetLottery() method
(async ()=>{
    while(true){
        parentPort.postMessage('******************* Picking a Winner and reseting the Lottery contract **********')
        parentPort.postMessage(new Date())
        try{
            await resetLottery();
        }catch(err){
            parentPort.postMessage('No players or transaction error: ' + err)
        }
        parentPort.postMessage('************ Starting new Countdown *********')
        let date = new Date()
        let oldDay = date.getDay()
        while(date.getDay() < 6){
            parentPort.postMessage(date)
            parentPort.postMessage('Im the Weekly Slave and im alive :)')
            await sleep(60 * 60 * 1000)
            date = new Date()
        }
        while(date.getDay() != 0){
            parentPort.postMessage(date)
            parentPort.postMessage('Im the Weekly Slave and im alive :)')
            await sleep(60 * 1000)
            date = new Date()
        }

        // Start web3 and send transaction to the Lottery contract
    }
})()