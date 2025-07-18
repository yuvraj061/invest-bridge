// logging.js
let logs = [];

function log(message, type = 'info', currentUser) {
    const timestamp = new Date().toLocaleString();
    const logEntry = {
        timestamp,
        message,
        type,
        user: currentUser ? currentUser.email : 'system'
    };

    logs.push(logEntry);
    saveLogsToLocalStorage();

    const logContainer = document.getElementById('logEntries');
    if (logContainer) {
        const logElement = document.createElement('div');
        logElement.className = 'log-entry';
        logElement.innerHTML = `
            <div class="log-timestamp">[${timestamp}]</div>
            <div>${message}</div>
        `;
        logContainer.prepend(logElement);
        while (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
            logs.shift();
        }
        logContainer.scrollTop = 0;
    } else {
        console.warn('Log container not found. Log entry:', logEntry);
    }

    if (type === 'error') {
        console.error(`[${timestamp}] ${message}`);
    } else if (type === 'warn') {
        console.warn(`[${timestamp}] ${message}`);
    } else {
        console.log(`[${timestamp}] ${message}`);
    }
}

function saveLogsToLocalStorage() {
    localStorage.setItem('investBridgeLogs', JSON.stringify(logs));
}

function loadLogsFromLocalStorage() {
    const storedLogs = localStorage.getItem('investBridgeLogs');
    if (storedLogs) {
        logs = JSON.parse(storedLogs);
        const logContainer = document.getElementById('logEntries');
        if (logContainer) {
            logContainer.innerHTML = '';
            logs.slice().reverse().forEach(logEntry => {
                const logElement = document.createElement('div');
                logElement.className = 'log-entry';
                logElement.innerHTML = `
                    <div class="log-timestamp">[${logEntry.timestamp}]</div>
                    <div>${logEntry.message}</div>
                `;
                logContainer.appendChild(logElement);
            });
            logContainer.scrollTop = 0;
        }
    }
}

function getLogs() {
    return logs;
}

export { log, saveLogsToLocalStorage, loadLogsFromLocalStorage, getLogs }; 