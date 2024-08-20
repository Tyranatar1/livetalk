const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const messages = document.getElementById('messages');
const usernameInput = document.getElementById('username-input');

let currentUsername = '';
let userId = '';

socket.on('connect', () => {
    userId = socket.id;
});

usernameInput.addEventListener('change', () => {
    const newUsername = usernameInput.value.trim();
    if (newUsername && newUsername !== currentUsername) {
        if (currentUsername) {
            socket.emit('name change', { oldName: currentUsername, newName: newUsername, id: userId });
        }
        currentUsername = newUsername;
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value && currentUsername) {
        const message = {
            userId: userId,
            username: currentUsername,
            text: input.value,
            timestamp: new Date().toISOString()
        };
        socket.emit('chat message', message);
        input.value = '';
    }
});

socket.on('chat history', (chats) => {
    // Load previous messages from chat history
    chats.forEach(chat => {
        const item = document.createElement('div');
        item.textContent = `${chat.username}: ${chat.text}`;
        item.dataset.userId = chat.userId;
        messages.appendChild(item);
    });
    messages.scrollTop = messages.scrollHeight;
});

socket.on('chat message', (msg) => {
    const item = document.createElement('div');
    item.textContent = `${msg.username}: ${msg.text}`;
    item.dataset.userId = msg.userId;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('name change', (data) => {
    // Update all previous messages with the new username
    const userMessages = document.querySelectorAll(`div[data-user-id="${data.id}"]`);
    userMessages.forEach((msgElement) => {
        msgElement.textContent = msgElement.textContent.replace(data.oldName, data.newName);
    });

    // Show a notification for the name change
    const item = document.createElement('div');
    item.textContent = `${data.oldName} has changed their name to ${data.newName}.`;
    item.style.fontStyle = 'italic';
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
