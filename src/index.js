const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage , generateLocationMessage} = require('./utils/messages')
const {getUser , getUsersinRoom , removeUser,addUsers}=require('./utils/users')


const app = express();
const server = http.createServer(app)
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));
app.use(express.json());


io.on('connection',(socket)=>{
    console.log('New Web Socket Connection');


    socket.on('join' , (Options,callback)=>{
        const {user,error}=addUsers({id:socket.id , ...Options})
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message' , generateMessage('Admin','Welcome!!'));
        socket.broadcast.to(user.room).emit('message' , generateMessage('Admin',`${user.username} has been joined `))

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersinRoom(user.room)
        });

        callback()
    });

    socket.on('sendMessage',(msg,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter();

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!!')
        }
        io.to(user.room).emit('message' , generateMessage(user.username,msg))
        callback();

    })

    socket.on('sendLocation',(p,callback)=>{
        const user = getUser(socket.id);
        const locationUrl = `https://google.com/maps?q=${p.lat},${p.lang}`
        // io.emit('message' , `https://google.com/maps?q=${p.lat},${p.lang}`)
        io.to(user.room).emit('locationMessage' , generateLocationMessage(user.username,locationUrl))
        callback();
    })

    socket.on('disconnect' , ()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message' , generateMessage('Admin',`${user.username} has left!`));
            
            io.to(user.room).emit('roomData' , {
                room:user.room,
                users: getUsersinRoom(user.room)
            })

        }
    })
    // socket.emit('countUpdated',count);
    
    // socket.on('increment' , ()=>{
    //     count++
    //     // socket.emit('countUpdated' , count)
    //     io.emit('countUpdated',count)
    //     } )
})

server.listen(port,()=>{
    console.log(`server is listenning on port: ${port}` )
})