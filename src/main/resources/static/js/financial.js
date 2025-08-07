// Financial Management System - Complete Demo Version - Based on Device System
const API_BASE_URL = 'http://localhost:8080/api/admin-accountant/financial';

// Global variables
let transactions = [];
let filteredTransactions = [];
let currentTransaction = null;
let currentMode = 'view';
let summaryData = {
    totalIncome: 0,
    totalExpense: 0,
    totalBalance: 0
};

// Current user and date info - Updated
const CURRENT_USER = 'trang204';
const CURRENT_DATE = '2025-08-07';
const CURRENT_TIME = '16:14';

// Transaction type mapping for display
const transactionTypeMapping = {
    'MANAGEMENT_FEE': 'Thu phí quản lý',
    'PARKING_FEE': 'Thu phí gửi xe',
    'SERVICE_FEE': 'Thu phí dịch vụ', 
    'OTHER_INCOME': 'Thu nhập khác',
    'ELECTRICITY_BILL': 'Chi điện',
    'WATER_BILL': 'Chi nước',
    'MAINTENANCE_FEE': 'Chi bảo trì',
    'SALARY': 'Chi lương',
    'OTHER_EXPENSE': 'Chi phí khác'
};

// Status mapping for display
const statusMapping = {
    'COMPLETED': 'Hoàn thành',
    'PROCESSING': 'Đang xử lý',
    'PENDING': 'Chờ duyệt',
    'CANCELLED': 'Đã hủy'
};

// Alert function with better styling
function showAlert(message, type) {
    console.log(`[ALERT] ${type.toUpperCase()}: ${message}`);
    
    // Remove existing alerts
    document.querySelectorAll('.custom-alert').forEach(alert => {
        alert.remove();
    });

    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible custom-alert`;
    
    const iconMap = {
        'success': 'bi bi-check-circle-fill',
        'danger': 'bi bi-exclamation-triangle-fill',
        'warning': 'bi bi-exclamation-triangle-fill',
        'info': 'bi bi-info-circle-fill'
    };
    
    const icon = iconMap[type] || 'bi bi-info-circle-fill';
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${icon} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" aria-label="Close"></button>
        </div>
    `;
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(alertDiv);

    // Show animation
    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translateY(0)';
    }, 100);

    // Auto hide after 4 seconds
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);

    // Close button handler
    alertDiv.querySelector('.btn-close').addEventListener('click', () => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => alertDiv.remove(), 300);
    });
}

// Create modal dynamically - Same as device system
function createModal() {
    if (document.getElementById('transactionModal')) {
        console.log('Modal already exists');
        return;
    }

    const modalHTML = `
        <div class="modal fade" id="transactionModal" tabindex="-1" aria-labelledby="modalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalTitle">Chi tiết giao dịch</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="transaction-details">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Tiêu đề giao dịch</label>
                                    <input type="text" class="form-control" id="transactionTitle" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Mã giao dịch</label>
                                    <input type="text" class="form-control" id="transactionCode" readonly>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Loại giao dịch</label>
                                    <select class="form-select" id="transactionType" disabled>
                                        <option value="MANAGEMENT_FEE">Thu phí quản lý</option>
                                        <option value="PARKING_FEE">Thu phí gửi xe</option>
                                        <option value="SERVICE_FEE">Thu phí dịch vụ</option>
                                        <option value="OTHER_INCOME">Thu nhập khác</option>
                                        <option value="ELECTRICITY_BILL">Chi điện</option>
                                        <option value="WATER_BILL">Chi nước</option>
                                        <option value="MAINTENANCE_FEE">Chi bảo trì</option>
                                        <option value="SALARY">Chi lương</option>
                                        <option value="OTHER_EXPENSE">Chi phí khác</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Số tiền (VNĐ)</label>
                                    <input type="number" class="form-control" id="transactionAmount" readonly>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Ngày giao dịch</label>
                                    <input type="date" class="form-control" id="transactionDate">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Giờ giao dịch</label>
                                    <input type="time" class="form-control" id="transactionTime">
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Trạng thái</label>
                                    <select class="form-select" id="transactionStatus">
                                        <option value="COMPLETED">Hoàn thành</option>
                                        <option value="PROCESSING">Đang xử lý</option>
                                        <option value="PENDING">Chờ duyệt</option>
                                        <option value="CANCELLED">Đã hủy</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Vị trí</label>
                                    <input type="text" class="form-control" id="transactionLocation" readonly>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Mô tả</label>
                                <textarea class="form-control" id="transactionDescription" rows="3" readonly></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Ghi chú</label>
                                <textarea class="form-control" id="transactionNotes" rows="3" placeholder="Nhập ghi chú về giao dịch..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-primary" id="saveTransactionBtn">Cập nhật</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="loadingOverlay" class="loading-overlay" style="display: none;">
            <div class="text-center">
                <div class="spinner-border text-primary mb-2" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="text-white">Đang xử lý...</div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Modal created successfully');
}

// Wait for DOM elements - Same as device system
function waitForElements() {
    return new Promise((resolve) => {
        const checkElements = () => {
            const tableBody = document.getElementById('financialTableBody');
            const bootstrap = typeof window.bootstrap !== 'undefined';
            
            if (tableBody && bootstrap) {
                console.log('✅ All required elements found');
                resolve();
            } else {
                console.log('⏳ Waiting for elements...');
                setTimeout(checkElements, 100);
            }
        };
        checkElements();
    });
}

// Initialize application - Same structure as device system
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Financial Management System Loading...');
    
    try {
        await waitForElements();
        createModal();
        setupEventListeners();
        setInitialDateRange();
        loadSampleData();
        console.log('✅ System initialized successfully');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showAlert('Lỗi khởi tạo hệ thống!', 'danger');
    }
});

// Set initial date range
function setInitialDateRange() {
    const fromDateEl = document.getElementById('fromDate');
    const toDateEl = document.getElementById('toDate');
    
    if (fromDateEl && toDateEl) {
        fromDateEl.value = '2025-08-01';
        toDateEl.value = '2025-08-07';
    }
}

// Setup event listeners - Same structure as device system
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Filter buttons
    const clearBtn = document.getElementById('clearFiltersBtn');
    const searchBtn = document.getElementById('searchBtn');
    const addBtn = document.getElementById('addTransactionBtn');
    const printBtn = document.getElementById('printReportBtn');
    
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
    if (addBtn) addBtn.addEventListener('click', () => openModal('add', null));
    if (printBtn) printBtn.addEventListener('click', printReport);
    
    // Filter inputs
    const filterElements = [
        'reportTypeFilter', 'periodFilter', 'fromDate', 'toDate', 'scopeFilter', 'searchInput'
    ];
    
    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', applyFilters);
            element.addEventListener('change', applyFilters);
        }
    });
    
    console.log('✅ Event listeners setup completed');
}

// Load sample data - Using data from Figma
function loadSampleData() {
    console.log('📡 Loading sample financial data from Figma...');
    showLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        transactions = [
            {
                id: 1,
                title: 'Thu phí quản lý tháng 8/2025',
                code: 'TXN-2025-001',
                type: 'MANAGEMENT_FEE',
                amount: 16500000,
                date: '2025-08-06',
                time: '10:25',
                location: 'A-1205 - Nguyễn Văn A',
                description: 'Chuyển khoản',
                status: 'COMPLETED',
                notes: 'Thu phí quản lý tháng 8/2025 từ cư dân A-1205'
            },
            {
                id: 2,
                title: 'Chi điện nước chung tòa A',
                code: 'TXN-2025-002',
                type: 'ELECTRICITY_BILL',
                amount: -9200000,
                date: '2025-08-06',
                time: '09:15',
                location: 'Tòa A - Điện lực EVN',
                description: 'Chuyển khoản ngân hàng',
                status: 'COMPLETED',
                notes: 'Thanh toán hóa đơn điện tháng 7/2025'
            },
            {
                id: 3,
                title: 'Thu phí dịch vụ tháng 8/2025',
                code: 'TXN-2025-003',
                type: 'SERVICE_FEE',
                amount: 5800000,
                date: '2025-08-05',
                time: '16:30',
                location: 'B-0823 - Trần Thị B',
                description: 'Thẻ tín dụng',
                status: 'PROCESSING',
                notes: 'Đang xử lý thanh toán qua thẻ tín dụng'
            },
            {
                id: 4,
                title: 'Chi bảo trì thang máy định kỳ',
                code: 'TXN-2025-004',
                type: 'MAINTENANCE_FEE',
                amount: -13500000,
                date: '2025-08-05',
                time: '14:20',
                location: 'Tất cả tòa - Công ty OTIS',
                description: 'Hóa đơn VAT',
                status: 'COMPLETED',
                notes: 'Bảo trì định kỳ 6 tháng cho tất cả thang máy'
            },
            {
                id: 5,
                title: 'Thu phí đậu xe tháng 8/2025',
                code: 'TXN-2025-005',
                type: 'PARKING_FEE',
                amount: 3200000,
                date: '2025-08-04',
                time: '18:45',
                location: 'C-1402 - Lê Văn C',
                description: 'Tiền mặt',
                status: 'COMPLETED',
                notes: 'Thu phí đậu xe ô tô tháng 8/2025'
            },
            {
                id: 6,
                title: 'Chi lương nhân viên tháng 8',
                code: 'TXN-2025-006',
                type: 'SALARY',
                amount: -19500000,
                date: '2025-08-01',
                time: '08:30',
                location: 'Phòng nhân sự - 15 nhân viên',
                description: 'Chuyển khoản lương',
                status: 'COMPLETED',
                notes: 'Trả lương tháng 8/2025 cho 15 nhân viên'
            }
        ];
        
        filteredTransactions = [...transactions];
        calculateSummary();
        displayTransactions();
        displaySummaryCards();
        showLoading(false);
        
        console.log(`✅ Loaded ${transactions.length} financial transactions`);
        showAlert('Tải dữ liệu thành công!', 'success');
    }, 1500);
}

// Calculate summary data - Updated with correct amounts from Figma
function calculateSummary() {
    summaryData.totalIncome = filteredTransactions
        .filter(item => item.amount > 0)
        .reduce((sum, item) => sum + item.amount, 0);
    
    summaryData.totalExpense = filteredTransactions
        .filter(item => item.amount < 0)
        .reduce((sum, item) => sum + Math.abs(item.amount), 0);
    
    summaryData.totalBalance = summaryData.totalIncome - summaryData.totalExpense;
}

// Display transactions in table - Same structure as device system
function displayTransactions() {
    console.log(`🎨 Displaying ${filteredTransactions.length} transactions...`);
    const tbody = document.getElementById('financialTableBody');
    
    if (!tbody) {
        console.error('❌ Financial table body not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (filteredTransactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="bi bi-receipt fa-3x mb-3"></i>
                    <h5>Không tìm thấy giao dịch nào</h5>
                    <p>Thử thay đổi điều kiện tìm kiếm</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredTransactions.forEach((transaction, index) => {
        const row = createTransactionRow(transaction, index);
        tbody.appendChild(row);
    });
    
    console.log(`✅ Displayed ${filteredTransactions.length} transaction items`);
}

// Create transaction table row - UPDATED: Removed Copy button, only 4 actions now
function createTransactionRow(transaction, index) {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${index * 0.05}s`;
    
    const statusClass = transaction.status ? transaction.status.toLowerCase().replace('_', '-') : 'completed';
    const isIncome = transaction.amount > 0;
    const typeClass = getTypeClass(transaction.type);
    
    tr.innerHTML = `
        <td class="transaction-info">
            <div class="transaction-title">${transaction.title || 'Không có tiêu đề'}</div>
            <div class="transaction-code">${transaction.code || 'N/A'}</div>
        </td>
        <td class="details-info">
            <div class="details-date">${formatDateTime(transaction.date, transaction.time)}</div>
            <div class="details-location">${transaction.location || 'Không xác định'}</div>
            <div class="details-description">${transaction.description || ''}</div>
        </td>
        <td>
            <span class="amount-text ${isIncome ? 'amount-positive' : 'amount-negative'}">
                ${isIncome ? '+' : ''}${formatCurrency(transaction.amount)}
            </span>
        </td>
        <td>
            <span class="type-badge ${typeClass}">${getTypeDisplayName(transaction.type)}</span>
        </td>
        <td>
            <span class="status-badge ${statusClass}">${statusMapping[transaction.status] || 'Không xác định'}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="action-btn btn-view" type="button" title="Xem chi tiết">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn btn-edit" type="button" title="Chỉnh sửa">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn btn-print" type="button" title="In phiếu">
                    <i class="bi bi-printer"></i>
                </button>
                <button class="action-btn btn-delete" type="button" title="Xóa">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    // Event listeners for buttons - UPDATED: Removed Copy button event
    const viewBtn = tr.querySelector('.btn-view');
    const editBtn = tr.querySelector('.btn-edit');
    const printBtn = tr.querySelector('.btn-print');
    const deleteBtn = tr.querySelector('.btn-delete');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            console.log(`👁️ View clicked: ${transaction.id}`);
            openModal('view', transaction.id);
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log(`✏️ Edit clicked: ${transaction.id}`);
            openModal('edit', transaction.id);
        });
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            console.log(`🖨️ Print clicked: ${transaction.id}`);
            printTransaction(transaction.id);
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            console.log(`🗑️ Delete clicked: ${transaction.id}`);
            deleteTransaction(transaction.id);
        });
    }
    
    return tr;
}

// Open modal - Same structure as device system
function openModal(mode, transactionId) {
    console.log(`🎭 Opening modal: ${mode} for ID: ${transactionId}`);
    
    // Ensure modal exists
    if (!document.getElementById('transactionModal')) {
        createModal();
    }
    
    // Find transaction (if editing existing)
    if (transactionId) {
        currentTransaction = transactions.find(transaction => transaction.id == transactionId);
        if (!currentTransaction) {
            showAlert('Không tìm thấy giao dịch này!', 'danger');
            return;
        }
    } else {
        currentTransaction = null;
    }
    
    currentMode = mode;
    
    setTimeout(() => {
        try {
            const modalTitle = document.getElementById('modalTitle');
            const saveBtn = document.getElementById('saveTransactionBtn');
            
            // Configure modal based on mode
            switch(mode) {
                case 'view':
                    modalTitle.textContent = 'Chi tiết giao dịch';
                    saveBtn.style.display = 'none';
                    enableFormInputs(false);
                    break;
                case 'edit':
                    modalTitle.textContent = 'Chỉnh sửa giao dịch';
                    saveBtn.textContent = 'Cập nhật';
                    saveBtn.style.display = 'block';
                    enableFormInputs(true);
                    break;
                case 'add':
                    modalTitle.textContent = 'Thêm giao dịch mới';
                    saveBtn.textContent = 'Thêm giao dịch';
                    saveBtn.style.display = 'block';
                    enableFormInputs(true);
                    clearForm();
                    setDefaultValues();
                    break;
            }
            
            // Setup save button
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            newSaveBtn.addEventListener('click', saveTransaction);
            
            // Populate form if editing
            if (currentTransaction && mode !== 'add') {
                populateForm(currentTransaction);
            }
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
            modal.show();
            
            console.log('✅ Modal opened successfully');
            
        } catch (error) {
            console.error('❌ Modal error:', error);
            showAlert('Lỗi khi mở modal: ' + error.message, 'danger');
        }
    }, 100);
}

// Enable/disable form inputs - Same as device system
function enableFormInputs(enabled) {
    const fieldConfigs = [
        { id: 'transactionTitle', alwaysDisabled: false },
        { id: 'transactionCode', alwaysDisabled: false },
        { id: 'transactionType', alwaysDisabled: false },
        { id: 'transactionAmount', alwaysDisabled: false },
        { id: 'transactionDate', alwaysDisabled: false },
        { id: 'transactionTime', alwaysDisabled: false },
        { id: 'transactionLocation', alwaysDisabled: false },
        { id: 'transactionDescription', alwaysDisabled: false },
        { id: 'transactionStatus', alwaysDisabled: false },
        { id: 'transactionNotes', alwaysDisabled: false }
    ];
    
    fieldConfigs.forEach(({ id, alwaysDisabled }) => {
        const field = document.getElementById(id);
        if (field) {
            field.disabled = alwaysDisabled || !enabled;
            if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                field.readOnly = alwaysDisabled || !enabled;
            }
        }
    });
}

// Populate form - Updated for financial transactions
function populateForm(transaction) {
    if (!transaction) return;
    
    const fields = [
        { id: 'transactionTitle', value: transaction.title },
        { id: 'transactionCode', value: transaction.code },
        { id: 'transactionType', value: transaction.type },
        { id: 'transactionAmount', value: Math.abs(transaction.amount) },
        { id: 'transactionDate', value: transaction.date },
        { id: 'transactionTime', value: transaction.time },
        { id: 'transactionLocation', value: transaction.location },
        { id: 'transactionDescription', value: transaction.description },
        { id: 'transactionStatus', value: transaction.status },
        { id: 'transactionNotes', value: transaction.notes }
    ];
    
    fields.forEach(({ id, value }) => {
        const field = document.getElementById(id);
        if (field) field.value = value || '';
    });
}

// Clear form - Same structure as device system
function clearForm() {
    const fields = [
        'transactionTitle', 'transactionCode', 'transactionType', 'transactionAmount',
        'transactionDate', 'transactionTime', 'transactionLocation', 'transactionDescription',
        'transactionStatus', 'transactionNotes'
    ];
    
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

// Set default values for new transaction
function setDefaultValues() {
    if (currentMode === 'add') {
        document.getElementById('transactionDate').value = CURRENT_DATE;
        document.getElementById('transactionTime').value = CURRENT_TIME;
        document.getElementById('transactionCode').value = generateTransactionCode();
        document.getElementById('transactionStatus').value = 'PENDING';
        document.getElementById('transactionType').value = 'MANAGEMENT_FEE';
    }
}

// Save transaction - Same structure as device system
async function saveTransaction() {
    console.log('💾 Saving transaction...');
    
    if (!validateForm()) {
        return;
    }
    
    // Get form data
    const formData = {
        title: document.getElementById('transactionTitle')?.value,
        code: document.getElementById('transactionCode')?.value,
        type: document.getElementById('transactionType')?.value,
        amount: parseFloat(document.getElementById('transactionAmount')?.value) || 0,
        date: document.getElementById('transactionDate')?.value,
        time: document.getElementById('transactionTime')?.value,
        location: document.getElementById('transactionLocation')?.value,
        description: document.getElementById('transactionDescription')?.value,
        status: document.getElementById('transactionStatus')?.value,
        notes: document.getElementById('transactionNotes')?.value
    };
    
    // Adjust amount based on transaction type
    const expenseTypes = ['ELECTRICITY_BILL', 'WATER_BILL', 'MAINTENANCE_FEE', 'SALARY', 'OTHER_EXPENSE'];
    if (expenseTypes.includes(formData.type)) {
        formData.amount = -Math.abs(formData.amount);
    } else {
        formData.amount = Math.abs(formData.amount);
    }
    
    console.log('📋 Form data:', formData);
    showLoading(true);
    
    // Simulate save
    setTimeout(() => {
        try {
            if (currentMode === 'add') {
                // Add new transaction
                const newTransaction = {
                    id: Math.max(...transactions.map(t => t.id), 0) + 1,
                    ...formData
                };
                transactions.push(newTransaction);
                showAlert('Thêm giao dịch thành công!', 'success');
            } else {
                // Update existing transaction
                const index = transactions.findIndex(t => t.id === currentTransaction.id);
                if (index !== -1) {
                    transactions[index] = { ...transactions[index], ...formData };
                }
                
                const messages = {
                    'edit': 'Cập nhật giao dịch thành công!'
                };
                showAlert(messages[currentMode] || 'Cập nhật thành công!', 'success');
            }
            
            filteredTransactions = [...transactions];
            calculateSummary();
            displayTransactions();
            displaySummaryCards();
            
            // Close modal
            const modalElement = document.getElementById('transactionModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            
            console.log('✅ Save completed successfully');
            
        } catch (error) {
            console.error('❌ Save error:', error);
            showAlert('Lỗi khi lưu: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }, 1200);
}

// Delete transaction - Same as device system
function deleteTransaction(transactionId) {
    if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
        return;
    }
    
    console.log('🗑️ Deleting transaction:', transactionId);
    showLoading(true);
    
    setTimeout(() => {
        try {
            transactions = transactions.filter(t => t.id !== transactionId);
            filteredTransactions = [...transactions];
            calculateSummary();
            displayTransactions();
            displaySummaryCards();
            showAlert('Xóa giao dịch thành công!', 'success');
            console.log('✅ Delete completed successfully');
        } catch (error) {
            console.error('❌ Delete error:', error);
            showAlert('Lỗi khi xóa: ' + error.message, 'danger');
        } finally {
            showLoading(false);
        }
    }, 800);
}

// Print transaction
function printTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showAlert('Không tìm thấy giao dịch để in!', 'danger');
        return;
    }
    
    console.log('🖨️ Printing transaction:', transactionId);
    showAlert(`Đang chuẩn bị in phiếu: ${transaction.title}`, 'info');
    
    // Create print content
    const printContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="text-align: center; margin-bottom: 30px;">PHIẾU GIAO DỊCH</h2>
            <div style="margin-bottom: 20px;">
                <strong>Mã giao dịch:</strong> ${transaction.code}<br>
                <strong>Tiêu đề:</strong> ${transaction.title}<br>
                <strong>Ngày giờ:</strong> ${formatDateTime(transaction.date, transaction.time)}<br>
                <strong>Loại:</strong> ${transactionTypeMapping[transaction.type] || 'Khác'}<br>
                <strong>Số tiền:</strong> ${formatCurrency(transaction.amount)}<br>
                <strong>Trạng thái:</strong> ${statusMapping[transaction.status] || 'Không xác định'}<br>
                <strong>Vị trí:</strong> ${transaction.location || 'Không xác định'}<br>
                <strong>Mô tả:</strong> ${transaction.description || 'Không có'}<br>
                <strong>Ghi chú:</strong> ${transaction.notes || 'Không có'}
            </div>
            <div style="margin-top: 50px; text-align: right;">
                <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                <p>Người in: ${CURRENT_USER}</p>
            </div>
        </div>
    `;
    
    // Print in new window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>In phiếu giao dịch - ${transaction.code}</title>
                <style>
                    body { margin: 0; padding: 0; }
                    @media print {
                        body { margin: 20px; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Print full report
function printReport() {
    console.log('🖨️ Printing financial report...');
    showAlert('Đang chuẩn bị in báo cáo...', 'info');
    
    const reportDate = new Date().toLocaleDateString('vi-VN');
    
    // Create report content
    let reportContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="text-align: center; margin-bottom: 20px;">BÁO CÁO TÀI CHÍNH</h1>
            <h2 style="text-align: center; margin-bottom: 40px;">THEO ĐỐI THU CHI</h2>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>
                    <strong>Tổng thu:</strong> ${formatCurrency(summaryData.totalIncome)}<br>
                    <strong>Tổng chi:</strong> ${formatCurrency(summaryData.totalExpense)}<br>
                    <strong>Số dư:</strong> ${formatCurrency(summaryData.totalBalance)}
                </div>
                <div>
                    <strong>Ngày tạo:</strong> ${reportDate}<br>
                    <strong>Người tạo:</strong> ${CURRENT_USER}<br>
                    <strong>Số giao dịch:</strong> ${filteredTransactions.length}
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Giao dịch</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ngày giờ</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Số tiền</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Loại</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredTransactions.forEach(transaction => {
        reportContent += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">
                    <strong>${transaction.title}</strong><br>
                    <small>${transaction.code}</small>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px;">${formatDateTime(transaction.date, transaction.time)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: ${transaction.amount > 0 ? 'green' : 'red'};">
                    ${transaction.amount > 0 ? '+' : ''}${formatCurrency(transaction.amount)}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${transactionTypeMapping[transaction.type] || 'Khác'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${statusMapping[transaction.status] || 'Không xác định'}</td>
            </tr>
        `;
    });
    
    reportContent += `
                </tbody>
            </table>
            
            <div style="margin-top: 50px; text-align: right;">
                <p><strong>Chữ ký người lập báo cáo</strong></p>
                <br><br>
                <p>_______________________</p>
                <p>${CURRENT_USER}</p>
            </div>
        </div>
    `;
    
    // Print in new window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Báo cáo tài chính - ${reportDate}</title>
                <style>
                    body { margin: 0; padding: 0; }
                    @media print {
                        body { margin: 20px; }
                    }
                </style>
            </head>
            <body>
                ${reportContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Display summary cards - Updated with correct data from Figma
function displaySummaryCards() {
    console.log('📊 Updating summary cards...');
    
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const totalBalanceEl = document.getElementById('totalBalance');
    
    if (totalIncomeEl) {
        totalIncomeEl.textContent = formatCurrencySimple(summaryData.totalIncome);
    }
    
    if (totalExpenseEl) {
        totalExpenseEl.textContent = formatCurrencySimple(summaryData.totalExpense);
    }
    
    if (totalBalanceEl) {
        const balanceText = formatCurrencySimple(summaryData.totalBalance);
        totalBalanceEl.textContent = summaryData.totalBalance < 0 ? `-${balanceText}` : balanceText;
        
        // Update color based on balance
        if (summaryData.totalBalance < 0) {
            totalBalanceEl.style.color = '#ef4444';
        } else {
            totalBalanceEl.style.color = '#3b82f6';
        }
    }
    
    console.log('✅ Summary cards updated');
}

// Helper functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.abs(amount));
}

function formatCurrencySimple(amount) {
    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.abs(amount)) + ' ₫';
}

function formatDateTime(date, time) {
    if (!date) return 'Không có ngày';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('vi-VN');
    return time ? `${formattedDate} - ${time}` : formattedDate;
}

function getTypeClass(type) {
    const typeClassMap = {
        'MANAGEMENT_FEE': 'thu-phi',
        'PARKING_FEE': 'thu-phi',
        'SERVICE_FEE': 'thu-phi',
        'OTHER_INCOME': 'thu-khac',
        'ELECTRICITY_BILL': 'chi-phi',
        'WATER_BILL': 'chi-phi',
        'MAINTENANCE_FEE': 'bao-tri',
        'SALARY': 'chi-phi',
        'OTHER_EXPENSE': 'chi-phi'
    };
    return typeClassMap[type] || 'thu-khac';
}

function getTypeDisplayName(type) {
    return transactionTypeMapping[type] || 'Khác';
}

function applyFilters() {
    console.log('🔍 Applying financial filters...');
    
    const filters = {
        reportType: document.getElementById('reportTypeFilter')?.value || '',
        period: document.getElementById('periodFilter')?.value || '',
        fromDate: document.getElementById('fromDate')?.value || '',
        toDate: document.getElementById('toDate')?.value || '',
        scope: document.getElementById('scopeFilter')?.value || '',
        search: document.getElementById('searchInput')?.value.toLowerCase() || ''
    };
    
    filteredTransactions = transactions.filter(transaction => {
        let match = true;
        
        // Report type filter
        if (filters.reportType && filters.reportType !== 'INCOME_EXPENSE') {
            if (filters.reportType === 'INCOME' && transaction.amount <= 0) match = false;
            if (filters.reportType === 'EXPENSE' && transaction.amount >= 0) match = false;
        }
        
        // Date range filter
        if (filters.fromDate && transaction.date < filters.fromDate) match = false;
        if (filters.toDate && transaction.date > filters.toDate) match = false;
        
        // Scope filter
        if (filters.scope && filters.scope !== 'ALL') {
            const building = filters.scope.replace('BUILDING_', '');
            if (!transaction.location?.includes(`Tòa ${building}`)) match = false;
        }
        
        // Search filter
        if (filters.search) {
            const searchMatch = 
                transaction.title?.toLowerCase().includes(filters.search) ||
                transaction.code?.toLowerCase().includes(filters.search) ||
                transaction.location?.toLowerCase().includes(filters.search) ||
                transaction.description?.toLowerCase().includes(filters.search);
            if (!searchMatch) match = false;
        }
        
        return match;
    });
    
    calculateSummary();
    displayTransactions();
    displaySummaryCards();
    console.log(`✅ Filters applied: ${filteredTransactions.length}/${transactions.length} items`);
}

function clearFilters() {
    console.log('🧹 Clearing financial filters...');
    
    const filterIds = [
        'reportTypeFilter', 'periodFilter', 'fromDate', 'toDate', 'scopeFilter', 'searchInput'
    ];
    
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'date') {
                element.value = '';
            } else if (element.type === 'text') {
                element.value = '';
            } else {
                element.selectedIndex = 0;
            }
        }
    });
    
    // Reset to initial date range
    document.getElementById('fromDate').value = '2025-08-01';
    document.getElementById('toDate').value = '2025-08-07';
    
    filteredTransactions = [...transactions];
    calculateSummary();
    displayTransactions();
    displaySummaryCards();
    showAlert('Đã xóa tất cả bộ lọc!', 'info');
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

// Auto-generate transaction code
function generateTransactionCode() {
    const year = 2025;
    const existingCodes = transactions.map(t => t.code);
    
    let counter = Math.max(...transactions.map(t => {
        const match = t.code.match(/TXN-2025-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }), 0) + 1;
    
    const counterStr = String(counter).padStart(3, '0');
    return `TXN-${year}-${counterStr}`;
}

// Enhanced form validation
function validateForm() {
    const title = document.getElementById('transactionTitle')?.value?.trim();
    const code = document.getElementById('transactionCode')?.value?.trim();
    const amount = parseFloat(document.getElementById('transactionAmount')?.value) || 0;
    const date = document.getElementById('transactionDate')?.value;
    
    const errors = [];
    
    if (!title) errors.push('Tiêu đề giao dịch không được để trống');
    if (!code) errors.push('Mã giao dịch không được để trống');
    if (amount === 0) errors.push('Số tiền phải lớn hơn 0');
    if (!date) errors.push('Ngày giao dịch không được để trống');
    
    // Check duplicate code (for add mode)
    if (currentMode === 'add' && transactions.some(t => t.code === code)) {
        errors.push('Mã giao dịch đã tồn tại');
    }
    
    if (errors.length > 0) {
        showAlert('Lỗi nhập liệu:\n' + errors.join('\n'), 'warning');
        return false;
    }
    
    return true;
}

// Global functions for debugging
window.FinancialSystem = {
    transactions,
    filteredTransactions,
    summaryData,
    currentTransaction,
    currentMode,
    currentUser: CURRENT_USER,
    currentDate: CURRENT_DATE,
    openModal,
    showAlert,
    applyFilters,
    clearFilters,
    generateTransactionCode
};

console.log('💰 Financial Management System loaded successfully!');
console.log(`👤 Current User: ${CURRENT_USER}`);
console.log(`📅 Current Date: ${CURRENT_DATE} ${CURRENT_TIME}`);