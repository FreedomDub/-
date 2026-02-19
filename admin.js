// Конфигурация
const ADMIN_PASSWORD = 'admin123'; // Измените на свой пароль

let isAuthenticated = false;

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли уже активный стрим
    updateStats();
});

// Элементы
const loginForm = document.getElementById('loginForm');
const dashboard = document.getElementById('dashboard');
const adminPassword = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

// Вход
loginBtn.addEventListener('click', function() {
    if (adminPassword.value === ADMIN_PASSWORD) {
        isAuthenticated = true;
        loginForm.style.display = 'none';
        dashboard.style.display = 'block';
        loadAdminPanel();
    } else {
        loginError.textContent = 'Неверный пароль';
    }
});

function loadAdminPanel() {
    updateStats();
    
    // Слушаем изменения
    window.addEventListener('storage', function(e) {
        if (e.key === 'viewerCount') {
            document.getElementById('adminViewerCount').textContent = e.newValue || '0';
        }
        if (e.key === 'comments') {
            const comments = JSON.parse(e.newValue || '[]');
            document.getElementById('messageCount').textContent = comments.length;
            displayModerationChat(comments);
        }
    });
    
    // Кнопки управления
    document.getElementById('startTestStream').addEventListener('click', startTestStream);
    document.getElementById('startVideoStream').addEventListener('click', startVideoStream);
    document.getElementById('stopStream').addEventListener('click', stopStream);
    document.getElementById('clearChat').addEventListener('click', clearChat);
}

function updateStats() {
    document.getElementById('adminViewerCount').textContent = 
        localStorage.getItem('viewerCount') || '0';
    
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    document.getElementById('messageCount').textContent = comments.length;
    
    const stream = JSON.parse(localStorage.getItem('currentStream') || '{}');
    document.getElementById('streamStatus').textContent = stream.isLive ? 'В эфире' : 'Офлайн';
    
    displayModerationChat(comments);
}

function startTestStream() {
    if (!isAuthenticated) return;
    
    // Тестовое видео (можно заменить на YouTube или Vimeo)
    const testVideoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    const streamData = {
        isLive: true,
        type: 'video',
        videoUrl: testVideoUrl,
        startTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentStream', JSON.stringify(streamData));
    document.getElementById('streamStatus').textContent = 'В эфире';
    
    alert('Тестовый эфир запущен!');
}

function startVideoStream() {
    if (!isAuthenticated) return;
    
    const videoSelect = document.getElementById('videoSelect');
    const videoUrl = videoSelect.value;
    
    if (!videoUrl) {
        alert('Выберите видео');
        return;
    }
    
    const streamData = {
        isLive: true,
        type: 'video',
        videoUrl: videoUrl,
        startTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentStream', JSON.stringify(streamData));
    document.getElementById('streamStatus').textContent = 'В эфире';
    
    alert('Видео запущено!');
}

function stopStream() {
    if (!isAuthenticated) return;
    
    localStorage.removeItem('currentStream');
    document.getElementById('streamStatus').textContent = 'Офлайн';
    
    alert('Эфир остановлен');
}

function clearChat() {
    if (!isAuthenticated) return;
    
    if (confirm('Очистить весь чат?')) {
        localStorage.setItem('comments', '[]');
        displayModerationChat([]);
        document.getElementById('messageCount').textContent = '0';
    }
}

function displayModerationChat(comments) {
    const chatDiv = document.getElementById('moderationChat');
    chatDiv.innerHTML = '';
    
    comments.slice(-10).forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'chat-message';
        commentElement.innerHTML = `
            <span class="message-time">${comment.time}</span>
            <span class="message-user">${escapeHtml(comment.user)}</span>
            <span class="message-text">${escapeHtml(comment.text)}</span>
            <button onclick="deleteComment(${comment.id})" class="delete-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        chatDiv.appendChild(commentElement);
    });
}

function deleteComment(commentId) {
    if (!isAuthenticated) return;
    
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const filteredComments = comments.filter(c => c.id !== commentId);
    localStorage.setItem('comments', JSON.stringify(filteredComments));
    displayModerationChat(filteredComments);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
      }
