// scripts.js
let socket = io();

let joinForm = document.getElementById('joinForm');
let messageForm = document.getElementById('messageForm');
let loginContainer = document.getElementById('loginContainer');
let chatContainer = document.getElementById('chatContainer');
let username = document.getElementById('username');
let room = document.getElementById('room');
let message = document.getElementById('message');
let recipient = document.getElementById('recipient');
let messageArea = document.getElementById("messageArea");
let chatBox = document.getElementById("chatBox");

joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (username.value && room.value) {
        socket.emit('join room', { username: username.value, room: room.value });
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
});

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (message.value) {
        socket.emit('send message', { recipientId: recipient.value, message: message.value });
        message.value = "";
        recipient.value = "";
    }
});

socket.on("existing users", (users) => {
    users.forEach(user => {
        let name = document.createElement("p");
        name.className = "chat-message";
        name.style.backgroundColor = "grey";
        name.textContent = user.username;
        messageArea.appendChild(name);

        let option = document.createElement("option");
        option.value = user.socketId;
        option.textContent = user.username;
        recipient.appendChild(option);
    });
});

socket.on("user joined", (data) => {
    let name = document.createElement("p");
    name.className = "chat-message";
    name.style.backgroundColor = "green";
    name.textContent = data.username + " joined the room";
    messageArea.appendChild(name);

    let option = document.createElement("option");
    option.value = data.socketId;
    option.textContent = data.username;
    recipient.appendChild(option);
});

socket.on("send message", (data) => {
    let chatContent = document.createElement("p");
    chatContent.className = "chat-message";
    chatContent.textContent = data.from + ": " + data.message + (data.private ? " (private)" : "");
    chatBox.appendChild(chatContent);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to the bottom
});

socket.on("user left", (data) => {
    let name = document.createElement("p");
    name.className = "chat-message";
    name.style.backgroundColor = "red";
    name.textContent = data.username + " left the room";
    messageArea.appendChild(name);

    let options = recipient.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === data.socketId) {
            recipient.remove(i);
            break;
        }
    }
});
