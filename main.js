document.addEventListener('DOMContentLoaded', function() {
    updateStreamPreview();
    
    // Слушаем изменения стрима
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentStream') {
            updateStreamPreview();
        }
    });
    
    // Анимации
    animateFeatures();
});

function updateStreamPreview() {
    const stream = JSON.parse(localStorage.getItem('currentStream') || '{}');
    const preview = document.getElementById('streamPreview');
    const liveBadge = document.getElementById('liveBadge');
    
    if (stream.isLive) {
        preview.innerHTML = `
            <div class="live-preview">
                <i class="fas fa-video" style="font-size: 3rem; color: #e74c3c;"></i>
                <p style="margin: 1rem 0;">Идет прямая трансляция!</p>
                <p><small>Начало: ${new Date(stream.startTime).toLocaleTimeString()}</small></p>
                <a href="/online-stream-site/stream.html" class="cta-button small" style="margin-top: 1rem;">
                    <i class="fas fa-play"></i> Смотреть
                </a>
            </div>
        `;
        liveBadge.style.display = 'inline-block';
    } else {
        preview.innerHTML = '<p>Эфир еще не начался</p>';
        liveBadge.style.display = 'none';
    }
}

function animateFeatures() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    document.querySelectorAll('.feature-card').forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s';
        observer.observe(el);
    });
}
