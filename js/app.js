let currentAmount = "0";
let currentCurrency = "TRX";

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.classList.contains("delete")) {
                currentAmount = currentAmount.slice(0, -1) || "0";
            } else if (currentAmount.length < 10) {
                currentAmount += btn.textContent;
            }
            updateAmountDisplay();
        });
    });

    document.getElementById("switchCurrency").addEventListener("click", () => {
        currentCurrency = currentCurrency === "TRX" ? "USDT" : "TRX";
        document.getElementById("currency").textContent = currentCurrency;
    });

    document.getElementById("submitBtn").addEventListener("click", onNextButtonClick);
});

function updateAmountDisplay() {
    document.getElementById("amount").textContent = currentAmount;
    document.getElementById("amount-display").textContent = (parseFloat(currentAmount) * 0.1562).toFixed(2);
}
