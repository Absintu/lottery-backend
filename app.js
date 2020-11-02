const express = require('express')
const {Worker, isMainThread, parentPort} = require('worker_threads')
// create the worker
const dailySlave = new Worker('./components/dailySlave.js')
const weeklySlave = new Worker('./components/weeklySlave.js')
const monthlySlave = new Worker('./components/monthlySlave.js')
// Listen for messages from the worker and print them
dailySlave.on('message', (msg) => {
    console.log('DailyLottery msg: ' + msg)
})

weeklySlave.on('message', (msg) => {
    console.log('WeeklyLottery msg: ' + msg)
})

monthlySlave.on('message', (msg) => {
    console.log('MonthlyLottery msg: ' + msg)
})

const app = express()
const PORT = process.env.port || 3000
app.get("/", (req, res)=>{
    res.send('Lottery Logger')
})

app.listen(PORT, () => console.log('Listening on port' + PORT))
