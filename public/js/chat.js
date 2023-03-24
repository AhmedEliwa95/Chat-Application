const socket  = io()
/// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
// const $locations = 
//// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

/// Options
const {username , room } = Qs.parse(location.search , {ignoreQueryPrefix:true})

const autoScroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
    
}

socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html) 
    autoScroll()
});

socket.on('locationMessage',(message)=>{
    console.log(message.url)
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        mapsUrl:message.url,
        createdAt:moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html
});


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    // we will disable the send button until the message acknowldgement
    $messageFormButton.setAttribute('disabled' , 'disabled')

    // const message = document.querySelector('input').value;
    /// WE CAN USE NAME PROPERTY AND USE IT AS A TARGET ELEMENT
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message ,(error)=>{
        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    });
    // enable the button after the aknoldgemenet 
    $messageFormButton.removeAttribute('disabled');
    /// cear the input after the message aknowldgement
    $messageFormInput.value = '';
    $messageFormInput.focus();
})


$sendLocationButton.addEventListener('click',()=>{
    $sendLocationButton.setAttribute('disabled','disabled');
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    };
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position)
        const pos = {lang:position.coords.longitude , lat:position.coords.latitude}
        socket.emit('sendLocation' , pos,(error)=>{
            if(error){
                return console.log(error);
            };
            console.log('Location Shared!!')
            $sendLocationButton.removeAttribute('disabled');
        })
    })
})

socket.emit('join' , {username , room},(error)=>{
    if(error){
        alert(error);
        location.href = '/'
    }    
});



