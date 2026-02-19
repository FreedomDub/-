// Загрузка сохраненного имени
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('chatName')) {
        document.getElementById('userName').value = localStorage.getItem('chatName');
    }
    
    // Загрузка данных
    loadStreamData();
    loadComments();
    
    // Обновление просмотров
    updateViewerCount();
});

// Элементы DOM
const videoPlaceholder = document.getElementById('videoPlaceholder');
const videoPlayer = document.getElementById('videoPlayer');
const viewerCount = document.getElementById('viewerCount');
const chatMessages = document.getElementById('chatMessages');
const liveIndicator = document.getElementById('liveIndicator');
const userName = document.getElementById('userName');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendMessage');

// Загрузка данных стрима
function loadStreamData() {
    const streamData = JSON.parse(localStorage.getItem('currentStream') || '{}');
    
    if (streamData.isLive) {
        startStream(streamData);
    }
}

function startStream(streamData) {
    videoPlaceholder.style.display = 'none';
    videoPlayer.style.display = 'block';
    liveIndicator.style.display = 'inline-block';
    
    if (streamData.videoUrl) {
        videoPlayer.src = streamData.videoUrl;
        videoPlayer.play();
    }
}

// Обновление счетчика зрителей
function updateViewerCount() {
    let viewers = parseInt(localStorage.getItem('viewerCount') || '0');
    
    // Увеличиваем счетчик при заходе на страницу
    if (!sessionStorage.getItem('viewerCounted')) {
        viewers++;
        localStorage.setItem('viewerCount', viewers);
        sessionStorage.setItem('viewerCounted', 'true');
    }
    
    viewerCount.textContent = viewers;
    
    // Обновляем для всех окон
    window.addEventListener('storage', function(e) {
        if (e.key === 'viewerCount') {
            viewerCount.textContent = e.newValue;
        }
        if (e.key === 'currentStream') {
            const stream = JSON.parse(e.newValue);
            if (stream?.isLive) {
                startStream(stream);
            } else {
                videoPlaceholder.style.display = 'flex';
                videoPlayer.style.display = 'none';
                liveIndicator.style.display = 'none';
                videoPlayer.pause();
            }
        }
    });
}

// Комментарии
function loadComments() {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    chatMessages.innerHTML = '';
    comments.forEach(addComment);
}

function addComment(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'chat-message';
    commentElement.id = `comment-${comment.id}`;
    commentElement.innerHTML = `
        <span class="message-time">${comment.time}</span>
        <span class="message-user">${escapeHtml(comment.user)}</span>
        <span class="message-text">${escapeHtml(comment.text)}</span>
    `;
    chatMessages.appendChild(commentElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Отправка сообщения
function sendMessage() {
    const name = userName.value.trim() || 'Аноним';
    const text = messageInput.value.trim();
    
    if (text) {
        localStorage.setItem('chatName', name);
        
        const comment = {
            id: Date.now(),
            user: name,
            text: text,
            time: new Date().toLocaleTimeString()
        };
        
        // Сохраняем комментарий
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        comments.push(comment);
        localStorage.setItem('comments', JSON.stringify(comments));
        
        // Добавляем на страницу
        addComment(comment);
        
        // Оповещаем другие окна
        localStorage.setItem('lastComment', JSON.stringify(comment));
        
        messageInput.value = '';
    }
}

// Слушаем новые комментарии из других окон
window.addEventListener('storage', function(e) {
    if (e.key === 'lastComment' && e.newValue) {
        const comment = JSON.parse(e.newValue);
        addComment(comment);
    }
    if (e.key === 'comments' && e.newValue) {
        loadComments();
    }
});

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// При закрытии страницы
window.addEventListener('beforeunload', function() {
    let viewers = parseInt(localStorage.getItem('viewerCount') || '0');
    if (sessionStorage.getItem('viewerCounted')) {
        viewers = Math.max(0, viewers - 1);
        localStorage.setItem('viewerCount', viewers);
    }
});
