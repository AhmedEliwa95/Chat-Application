
let users = [];

// add users, Remove users, getUser ,getUsersInToom 

const addUser = ({id , username , room})=>{
    // clean the data by conserting un to lowercase and trim them 
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data 
    if(!username || !room){
        return{
            error:`Username and Room are required`
        }
    }
    // check the uniquness of the un and the room 
    const existingUsers = users.find((user)=>{
        return user.username === username && user.room === room
    })
    if(existingUsers){
        return{
            error:`Username is in use`
        }
    }
    /// Strore user in the users array
    const user = {id , username , room};
    users.push(user);
    return {user}
};

const removeUser = (id)=>{
    const index = users.findIndex(user=>user.id === id);
    if(index !== -1){
        return users.splice(index,1)[0]
    }
};

const getUser = (id)=>{
    const user = users.find(user=>user.id===id)
    if(!user){
        return undefined
    }
    return user
};

const getUsersinRoom = (roomName)=>{
    const room = users.filter(user=>user.room === roomName);
    if(!room)return [];
    return room
}

module.exports = {
    addUsers: addUser,
    removeUser,
    getUser,
    getUsersinRoom
}