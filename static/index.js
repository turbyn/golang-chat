console.log('abcd');
console.log($('body').html());

const socket = io('http://localhost:5000/socket.io');
// console.log(socket);
// jQuery('#sendMsg').html('abcd');


// $('body').append('<p>dupa</p>')

let username = $('#currentUser').html();

$('#newUserSubmit').on('click', () => {
  console.log('Clicked')
  let desiredUsername = $('#newUserInput').val();
  let currentUsername = $('#currentUser').html();
  console.log(desiredUsername);
  $('#newUserInput').val('');
  username = desiredUsername;
  $('#currentUser').html(desiredUsername);

  socket.emit('usernameChange', JSON.stringify({oldName:currentUsername,newName:desiredUsername}));

});


// const socket = io('http://localhost:5000/socket.io');
socket.on('connect', function(){
  console.log('connected');
  socket.emit('newUserJoined', 'Testowy user');

socket.on('usernameChangeMessage', function(e){
  console.log('Username change detected');
  console.log(JSON.parse(e));
  appendUsernameInfo(JSON.parse(e));
})

$('#formArea').on('submit',function(e){
  e.preventDefault();
  console.log('Submitted');
})

$("#sendMsg").click(function(){
  console.log('Clicked');
  let messageString = $('#messageValue').val();
  // if(messageString.trim().length === 0){alert('Cannot send empty message!');return}
  // socket.emit('newMessage', messageString.trim());
  socket.emit('newMessage', JSON.stringify({
    username: $('#currentUser').html(),
    content: messageString.trim()
  }));

  appendMessage({
    username: $('#currentUser').html(),
    content:  messageString.trim()
  })

  // appendToDiv(messageString.trim());
  $('#messageValue').val('');
});


// socket.emit('hello','adadijasijaisjdsiaj');
socket.on('newServerMessage', function(element){
  console.log('Dupa');
  console.log(element);
  appendMessage(JSON.parse(element));
})

socket.on('utilMessage', function(utilMessage){
  console.log('Util');
  console.log(utilMessage);
  appendToDiv(utilMessage);
})


  })

function appendToDiv(messageText){
  $('#chatWindow').append(`<p>${messageText}</p>`);
}

function appendMessage(parsedObject){
  $('#chatWindow').append(`<p><b>${parsedObject.username}</b>: ${parsedObject.content}</p>`);
}

function appendUsernameInfo(parsedObject){
  $('#chatWindow').append(`<p><b>Server</b>: ${parsedObject.oldName} changed nick to ${parsedObject.newName}</p>`);
}
