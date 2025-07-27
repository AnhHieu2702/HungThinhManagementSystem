// Improved alert function with animation
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => {
        alert.classList.add('hide');
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    });

    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible custom-alert`;
    
    // Icon mapping
    const iconMap = {
        'success': 'bi-check-circle-fill',
        'danger': 'bi-exclamation-triangle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    
    const icon = iconMap[type] || 'bi-info-circle-fill';
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${icon} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);

    // Show animation
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 100);

    // Auto hide after 5 seconds
    const autoHideTimer = setTimeout(() => {
        hideAlert(alertDiv);
    }, 5000);

    // Close button handler
    const closeBtn = alertDiv.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoHideTimer);
        hideAlert(alertDiv);
    });
}

function hideAlert(alertDiv) {
    alertDiv.classList.remove('show');
    alertDiv.classList.add('hide');
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 300);
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (response.ok) {
            const apiResult = await response.json();
            console.log('API Response (response.ok is true):', apiResult);
            // Kiểm tra kết quả từ API
            if (apiResult.status && apiResult.data) {
                // Lưu access token và refresh token
                if (apiResult.data.accessToken) {
                    localStorage.setItem('accessToken', apiResult.data.accessToken);
                }
                if (apiResult.data.refreshToken) {
                    localStorage.setItem('refreshToken', apiResult.data.refreshToken);
                }
                // Lưu username
                localStorage.setItem('username', username);
                
                // Hiển thị thông báo thành công
                showAlert('Đăng nhập thành công!', 'success');
                
                // Chuyển hướng đến trang home sau 1 giây
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                // Sử dụng userMessage từ API nếu có
                const errorMessage = apiResult.userMessage || apiResult.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
                showAlert(errorMessage, 'danger');
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.log('API Response (response.ok is false):', response.status, errorData);
            
            // Sử dụng userMessage từ API nếu có
            const errorMessage = errorData.userMessage || errorData.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
            showAlert(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Có lỗi xảy ra. Vui lòng thử lại sau!', 'danger');
    }

    return false;
}