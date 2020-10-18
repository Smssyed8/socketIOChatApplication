var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var mongoose =  require('mongoose')
//refer transcript, socket needs to bind with express, so creating http server
var http = require('http').Server(app)
var io = require('socket.io')(http)
mongoose.Promise = Promise
var dbUrl = 'mongodb+srv://admin:admin@test.4hrmw.mongodb.net/Test?retryWrites=true&w=majority'

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
///caps M to indicate Model
var Message = mongoose.model('Message',{
    name : String,
    message : String
})
//var messages = [
  //  {name:'Tim',message:'response hello Tim'},
    //{name:'Jim',message:'response hello Jim'},
//]
app.get('/messages',(req,res) => {
    Message.find({},(err,messages) =>{
        res.send(messages)
    })
    
})
app.get('/messages/:user',(req,res) => {
    var user = req.params.user
    Message.find({name:user},(err,messages) =>{
        res.send(messages)
    })
    
})


app.post('/message',async (req,res) => {
    const obj = JSON.parse(JSON.stringify(req.body));
    console.log(obj)
    var message = new Message(obj)
    var savedMessage =  await message.save()
    var censored = await Message.findOne({message:'badWord'})
    
         //messages.push(obj)
        if(censored)
            await  Message.remove({_id:censored.id})
        else
            io.emit('message',req.body)

        res.sendStatus(200)
    .catch((err) => {
        res.sendStatus(500)
        return console.error(err)
    })
   
})
io.on('connection',(socket) =>{
    console.log('a user connected')
})

mongoose.connect(dbUrl,{ useNewUrlParser: true,
    useUnifiedTopology: true },(err) =>{
    console.log('mongo connection',err)
})
var server = http.listen(3000,() =>{
    console.log("server is listening" ,server.address().port)
})

