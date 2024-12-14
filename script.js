// 获取页面相关DOM元素
const watchAdsBtn = document.getElementById('watch-ads-btn');
const balanceElement = document.getElementById('balance');
const withdrawBtn = document.getElementById('withdraw-btn');
const historyBtn = document.getElementById('history-btn');
const settingsBtn = document.getElementById('settings-btn');
const adminBtn = document.getElementById('admin-btn');
const withdrawModal = document.getElementById('withdraw-modal');
const historyModal = document.getElementById('history-modal');
const settingsModal = document.getElementById('settings-modal');
const adminModal = document.getElementById('admin-modal');
const closeWithdrawModalBtn = document.getElementById('close-withdraw-modal-btn');
const closeHistoryModalBtn = document.getElementById('close-history-modal-btn');
const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
const closeAdminModalBtn = document.getElementById('close-admin-modal-btn');
const confirmWithdrawBtn = document.getElementById('confirm-withdraw-btn');
const withdrawAmountInput = document.getElementById('withdraw-amount');
const transactionIdElement = document.getElementById('transaction-id');
const historyList = document.getElementById('history-list');
const transactionRecords = document.getElementById('transaction-records');
const searchTransactionBtn = document.getElementById('search-transaction-btn');
const transactionIdInput = document.getElementById('transaction-id-input');
const payeerAccountInput = document.getElementById('payeer-account');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// 用于存储余额数据的键名
const BALANCE_KEY = 'balance';
// 用于存储提现历史记录数据的键名
const WITHDRAW_HISTORY_KEY = 'withdrawHistory';
// 用于存储Payeer账户数据的键名
const PAYEER_ACCOUNT_KEY = 'payeerAccount';

// 初始化数据
let balance = 0;
let withdrawHistory = [];
let payeerAccount = '';
let adminTransactions = [];

// 添加一个标志位，用于记录广告是否正在展示，初始化为false，表示未展示
let isAdShowing = false;

// 页面加载时读取本地存储数据并初始化相关变量和界面显示
window.addEventListener('load', () => {
    // 读取余额数据
    const savedBalance = localStorage.getItem(BALANCE_KEY);
    balance = savedBalance? parseFloat(savedBalance) : 0;
    updateBalanceDisplay();

    // 读取提现历史记录数据
    const savedWithdrawHistory = localStorage.getItem(WITHDRAW_HISTORY_KEY);
    if (savedWithdrawHistory) {
        try {
            withdrawHistory = JSON.parse(savedWithdrawHistory);
            adminTransactions = JSON.parse(savedWithdrawHistory);
            displayHistory();
            displayAdminTransactions();
        } catch (error) {
            console.error('解析提现历史记录数据出错:', error);
            withdrawHistory = [];
            adminTransactions = [];
        }
    }

    // 读取Payeer账户数据
    const savedPayeerAccount = localStorage.getItem(PAYEER_ACCOUNT_KEY);
    payeerAccount = savedPayeerAccount || '';
});

// 更新余额显示在页面上的函数
function updateBalanceDisplay() {
    balanceElement.textContent = `$${balance.toFixed(2)}`;
}

// 显示后台系统弹窗并加载交易记录
adminBtn.addEventListener('click', () => {
    adminModal.style.display = 'flex';
    displayAdminTransactions();
});

// 关闭后台系统弹窗
closeAdminModalBtn.addEventListener('click', () => {
    adminModal.style.display = 'none';
});

// 处理提现按钮点击事件，先验证Payeer账户和余额是否足够
withdrawBtn.addEventListener('click', () => {
    if (payeerAccount === '') {
        alert('请先设置您的Payeer账户。');
        return;
    }
    if (balance <= 0) {
        alert('余额不足，无法提现。');
        return;
    }
    withdrawModal.style.display = 'flex';
});

// 关闭提现弹窗
closeWithdrawModalBtn.addEventListener('click', () => {
    withdrawModal.style.display = 'none';
});

// 显示历史记录弹窗并加载提现记录
historyBtn.addEventListener('click', () => {
    historyModal.style.display = 'flex';
    displayHistory();
});

// 关闭历史记录弹窗
closeHistoryModalBtn.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

// 打开设置弹窗
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

// 关闭设置弹窗
closeSettingsModalBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// 保存Payeer账户设置到本地存储
saveSettingsBtn.addEventListener('click', () => {
    payeerAccount = payeerAccountInput.value.trim();
    localStorage.setItem(PAYEER_ACCOUNT_KEY, payeerAccount);
    alert('Payeer账户保存成功！');
    settingsModal.style.display = 'none';
});

// 点击“确认提现”按钮执行提现操作并更新相关数据和显示
confirmWithdrawBtn.addEventListener('click', () => {
    const withdrawAmount = parseFloat(withdrawAmountInput.value);
    if (withdrawAmount <= balance && withdrawAmount > 0) {
        balance -= withdrawAmount;
        updateBalanceDisplay();
        saveBalanceToLocalStorage();

        const transactionId = generateTransactionId();
        transactionIdElement.textContent = `交易ID: ${transactionId}`;

        const transaction = {
            id: transactionId,
            amount: withdrawAmount,
            date: new Date().toLocaleString(),
            account: payeerAccount,
            status: 'unpaid'
        };

        withdrawHistory.push(transaction);
        adminTransactions.push(transaction);
        withdrawAmountInput.value = '';
        saveWithdrawHistoryToLocalStorage();

        alert('提现成功！');
    } else {
        alert('提现金额无效，请重新输入。');
    }
});

// 生成随机交易ID的函数
function generateTransactionId() {
    return Math.random().toString(36).substring(2, 15);
}

// 将提现历史记录数据保存到本地存储的函数
function saveWithdrawHistoryToLocalStorage() {
    localStorage.setItem(WITHDRAW_HISTORY_KEY, JSON.stringify(adminTransactions));
}

// 显示提现记录列表的函数
function displayHistory() {
    historyList.innerHTML = '';
    if (withdrawHistory.length === 0) {
        historyList.innerHTML = '<p>暂无提现记录。</p>';
    } else {
        withdrawHistory.forEach(transaction => {
            const recordDiv = createHistoryRecordDiv(transaction);
            historyList.appendChild(recordDiv);
        });
    }
}

// 创建单个提现记录DOM元素的函数
function createHistoryRecordDiv(transaction) {
    const recordDiv = document.createElement('div');
    recordDiv.classList.add('history-record-card');
    recordDiv.innerHTML = `
        <div class="history-record">
            <p><strong>金额:</strong> $${transaction.amount.toFixed(2)}</p>
            <p><strong>日期:</strong> ${transaction.date}</p>
            <p><strong>交易ID:</strong> ${transaction.id}</p>
            <p><strong>Payeer账户:</strong> ${transaction.account}</p>
            <span class="payment-status" style="background-color: ${transaction.status === 'paid'? 'green' : 'red'};"></span>
        </div>
    `;
    return recordDiv;
}

// 后台查询提现记录并显示结果
searchTransactionBtn.addEventListener('click', () => {
    const transactionId = transactionIdInput.value.trim();
    const transaction = adminTransactions.find(t => t.id === transactionId);
    if (transaction) {
        alert(`找到交易记录: ${JSON.stringify(transaction)}`);
    } else {
        alert('未找到对应的交易记录。');
    }
});

// 后台管理：展示所有交易记录并绑定“标记为已支付”按钮的点击事件
function displayAdminTransactions() {
    transactionRecords.innerHTML = '';
    adminTransactions.forEach(transaction => {
        const recordDiv = createHistoryRecordDiv(transaction);
        const markPaidBtn = document.createElement('button');
        markPaidBtn.classList.add('mark-paid-btn');
        markPaidBtn.setAttribute('data-id', transaction.id);
        markPaidBtn.textContent = '标记为已支付';
        markPaidBtn.addEventListener('click', () => {
            toggleTransactionStatus(transaction);
            saveWithdrawHistoryToLocalStorage();
            displayAdminTransactions();
        });
        recordDiv.appendChild(markPaidBtn);
        transactionRecords.appendChild(recordDiv);
    });
}

// 切换交易状态（已支付/未支付）的函数
function toggleTransactionStatus(transaction) {
    if (transaction.status === 'unpaid') {
        transaction.status = 'paid';
    } else {
        transaction.status = 'unpaid';
    }
}

// 模拟广告展示函数，返回一个Promise
function showAd() {
    return new Promise((resolve, reject) => {
        // 模拟广告成功率：70%成功，30%失败
        const success = Math.random() < 0.7;
        setTimeout(() => {
            if (success) {
                resolve();
            } else {
                reject(new Error('广告加载失败'));
            }
        }, 500); // 假设广告展示需要0.5秒完成
    });
}

// 点击看广告按钮增加余额（优化后的逻辑，只有成功观看广告才增加余额，且倒计时结束自动关闭广告）
watchAdsBtn.addEventListener('click', async () => {
    if (isAdShowing) {
        alert('广告正在展示，请稍候...');
        return;
    }
    isAdShowing = true;
    watchAdsBtn.disabled = true;

    let countdown = 15; // 广告倒计时时间，单位：秒
    const countdownInterval = setInterval(() => {
        console.log(`广告倒计时：${countdown}秒`);
        countdown--;
        if (countdown === 0) {
            clearInterval(countdownInterval);
            isAdShowing = false;
            watchAdsBtn.disabled = false;
            console.log('广告已关闭');
        }
    }, 1000);

    try {
        for (let i = 0; i < 10; i++) {
            await show_8650323();
            balance += 1;
            updateBalanceDisplay();
            saveBalanceToLocalStorage();
            console.log('观看广告成功，当前余额:', balance);
        }
    } catch (error) {
        console.error('观看广告失败:', error);
        alert('广告展示失败，请稍后重试。');
    } finally {
        clearInterval(countdownInterval); // 确保在广告获取完成（成功或失败）后清除倒计时定时器
        isAdShowing = false;
        watchAdsBtn.disabled = false;
    }
});

// 将余额数据保存到本地存储的函数
function saveBalanceToLocalStorage() {
    localStorage.setItem(BALANCE_KEY, balance.toFixed(2));
}
