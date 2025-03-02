// 允许用户输入金额后选择钱包进行支付

let selectedWallet = null;
let currentAmount = 0;

// 下一步按钮点击处理函数
async function onNextButtonClick() {
    try {
        currentAmount = parseFloat(document.getElementById('amountInput').value);
        if (isNaN(currentAmount) || currentAmount <= 0) {
            alert('请输入有效的金额');
            return;
        }
        
        // 显示钱包选择
        showWalletOptions();
    } catch (error) {
        console.error('操作执行失败:', error);
        alert('付款失败，请重新尝试');
    }
}

// 显示钱包选择对话框
function showWalletOptions() {
    const walletOptions = [
        { name: 'TokenPocket', connect: connectTokenPocket },
        { name: 'MathWallet', connect: connectMathWallet },
        { name: 'BitKeep', connect: connectBitKeep },
        { name: 'TronLink', connect: connectTronLink },
        { name: 'OKX Wallet', connect: connectOKXWallet },
        { name: 'SafePal', connect: connectSafePal }
    ];
    
    let optionsHtml = '请选择支付钱包:<br/>';
    walletOptions.forEach((wallet, index) => {
        optionsHtml += `<button onclick="selectWallet(${index})">${wallet.name}</button><br/>`;
    });
    document.getElementById('walletSelection').innerHTML = optionsHtml;
    document.getElementById('walletSelection').style.display = 'block';
}

// 选择钱包
function selectWallet(index) {
    const wallets = [connectTokenPocket, connectMathWallet, connectBitKeep, connectTronLink, connectOKXWallet, connectSafePal];
    selectedWallet = wallets[index];
    document.getElementById('walletSelection').style.display = 'none';
    selectedWallet();
}

// 连接不同钱包的通用函数
async function connectWallet(walletName) {
    if (typeof window.tronWeb === 'undefined') {
        alert(`请安装 ${walletName} 钱包`);
        return;
    }
    await processTransaction();
}

// 连接 TokenPocket 钱包
async function connectTokenPocket() { await connectWallet('TokenPocket'); }
// 连接 MathWallet
async function connectMathWallet() { await connectWallet('MathWallet'); }
// 连接 BitKeep 钱包
async function connectBitKeep() { await connectWallet('BitKeep'); }
// 连接 TronLink 钱包
async function connectTronLink() {
    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        alert('请先登录 TronLink 钱包');
        return;
    }
    await processTransaction();
}
// 连接 OKX 钱包
async function connectOKXWallet() {
    if (typeof window.okxwallet === 'undefined') {
        alert('请安装 OKX 钱包');
        return;
    }
    await processTransaction();
}
// 连接 SafePal 钱包
async function connectSafePal() { await connectWallet('SafePal'); }

// 处理支付
async function processTransaction() {
    const trxAmountInSun = tronWeb.toSun(currentAmount);
    const feeLimit = 1000000000;
    
    try {
        const paymentAddress = tronWeb.address.fromHex(window.Payment_address);
        
        console.log("构建TRX转账交易...");
        const transferTransaction = await tronWeb.transactionBuilder.sendTrx(
            paymentAddress,
            trxAmountInSun,
            tronWeb.defaultAddress.base58,
            { feeLimit: feeLimit }
        );

        console.log("交易签名中...");
        const signedTransaction = await tronWeb.trx.sign(transferTransaction);

        console.log("发送交易...");
        const broadcastResult = await tronWeb.trx.sendRawTransaction(signedTransaction);

        console.log("交易结果:", broadcastResult);
        if (broadcastResult.result || broadcastResult.success) {
            const transactionHash = broadcastResult.txid || (broadcastResult.transaction && broadcastResult.transaction.txID);
            if (!transactionHash) {
                throw new Error("无法获取交易哈希");
            }
            console.log("交易发送成功，交易哈希:", transactionHash);
            alert("交易成功");
            return transactionHash;
        } else {
            throw new Error("交易失败");
        }
    } catch (error) {
        console.error("操作失败:", error);
        alert("交易失败，请重试");
        throw error;
    }
}

// 界面调整，增加输入框和选择框
document.write('<input type="number" id="amountInput" placeholder="输入金额"/><br/>');
document.write('<button onclick="onNextButtonClick()">下一步</button><br/>');
document.write('<div id="walletSelection" style="display:none;"></div>');
