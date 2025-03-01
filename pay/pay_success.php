<?php
// 确保接收参数
if (!isset($_GET['order_id']) || !isset($_GET['txid'])) {
    die("缺少支付信息");
}

$order_id = $_GET['order_id'];
$txid = $_GET['txid']; // TRON 交易哈希

// 回传给 du1 订单系统
$du1_url = "https://du1.example.com/api/payment_callback.php";
$response = file_get_contents("$du1_url?order_id=$order_id&txid=$txid");

echo "付款成功！您的订单已确认";
?>
