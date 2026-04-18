import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router";
import { HiOutlineShoppingCart, HiX, HiArrowLeft } from "react-icons/hi";
import {
  FileText,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { ethers } from "ethers";
import axios from "../common";
import { jwtDecode } from "jwt-decode";

const ITEM_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
};

const CHECKOUT_STEP = {
  IDLE: "idle",
  CHECKING: "checking",
  PROCESSING: "processing",
  DONE: "done",
};

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, removeMultipleFromCart } =
    useCart();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("access_token");
  const payloadDecoded = jwtDecode(accessToken);
  const userId = payloadDecoded._id;

  // Modal trạng thái
  const [walletModal, setWalletModal] = useState(false);
  const [balanceModal, setBalanceModal] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState({
    balance: "0",
    required: "0",
  });

  // Trạng thái checkout
  const [checkoutStep, setCheckoutStep] = useState(CHECKOUT_STEP.IDLE);
  const [itemStatuses, setItemStatuses] = useState({});
  const [checkoutDone, setCheckoutDone] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const isProcessing =
    checkoutStep === CHECKOUT_STEP.PROCESSING ||
    checkoutStep === CHECKOUT_STEP.CHECKING;

  useEffect(() => {
    const statuses = {};
    cartItems.forEach((item) => {
      statuses[item._id] = { status: ITEM_STATUS.PENDING };
    });
    setItemStatuses(statuses);
  }, [cartItems.length]);

  const setItemStatus = (docId, update) => {
    setItemStatuses((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], ...update },
    }));
  };

  const fetchOrderId = async (documentId) => {
    const res = await axios.get(`/api/listing/active/${documentId}`);
    if (!res.data?.orderId) throw new Error("Không tìm thấy listing active");
    return res.data.orderId;
  };

  // Main checkout handler
  const handleCheckout = async () => {
    setCheckoutStep(CHECKOUT_STEP.CHECKING);

    // 1. Kiểm tra đã liên kết ví chưa
    const token = localStorage.getItem("access_token");
    let walletAddress = null;
    try {
      const decoded = jwtDecode(token);
      walletAddress = decoded?.walletAddress;
    } catch {
      walletAddress = null;
    }
    if (!walletAddress || walletAddress === "null" || walletAddress === "") {
      setCheckoutStep(CHECKOUT_STEP.IDLE);
      setWalletModal(true);
      return;
    }

    // 2. Kiểm tra MetaMask có sẵn không
    if (!window.ethereum) {
      setCheckoutStep(CHECKOUT_STEP.IDLE);
      setWalletModal(true);
      return;
    }

    try {
      // 3. Kết nối MetaMask + lấy số dư
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Kiểm tra địa chỉ ví khớp với ví đã liên kết
      if (address.toLowerCase() !== walletAddress.toLowerCase()) {
        setCheckoutStep(CHECKOUT_STEP.IDLE);
        setBalanceInfo({
          balance: "—",
          required: total.toFixed(4),
          error: `Vui lòng chuyển sang ví đã liên kết:\n${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        });
        setBalanceModal(true);
        return;
      }

      const balanceWei = await provider.getBalance(address);
      const balanceEth = parseFloat(ethers.formatEther(balanceWei));
      const requiredEth = total;

      // 4. Kiểm tra số dư
      if (balanceEth < requiredEth) {
        setCheckoutStep(CHECKOUT_STEP.IDLE);
        setBalanceInfo({
          balance: balanceEth.toFixed(4),
          required: requiredEth.toFixed(4),
          shortfall: (requiredEth - balanceEth).toFixed(4),
        });
        setBalanceModal(true);
        return;
      }

      // 5. Bắt đầu mua từng item
      setCheckoutStep(CHECKOUT_STEP.PROCESSING);
      const succeededIds = [];

      for (const item of cartItems) {
        setItemStatus(item._id, { status: ITEM_STATUS.PROCESSING });

        try {
          // Lấy orderId từ listing
          const orderId = await fetchOrderId(item._id);

          // Gọi API mua
          const res = await axios.post("/api/marketplace/buy", { orderId });

          setItemStatus(item._id, {
            status: ITEM_STATUS.SUCCESS,
            txHash: res.data.txHash,
          });
          succeededIds.push(item._id);
        } catch (err) {
          setItemStatus(item._id, {
            status: ITEM_STATUS.FAILED,
            error:
              err.response?.data?.message ||
              err.message ||
              "Giao dịch thất bại",
          });
        }
      }

      // 6. Xóa những item mua thành công khỏi giỏ
      if (succeededIds.length > 0) {
        removeMultipleFromCart(succeededIds);
      }

      setCheckoutStep(CHECKOUT_STEP.DONE);
      setCheckoutDone(true);
    } catch (err) {
      console.error("[checkout]", err);
      setCheckoutStep(CHECKOUT_STEP.IDLE);
    }
  };

  const StatusBadge = ({ docId }) => {
    const s = itemStatuses[docId];
    if (!s) return null;

    if (checkoutStep === CHECKOUT_STEP.IDLE) return null;

    if (s.status === ITEM_STATUS.PROCESSING) {
      return (
        <span className="flex items-center gap-1 text-xs text-blue-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Đang xử lý
        </span>
      );
    }
    if (s.status === ITEM_STATUS.SUCCESS) {
      return (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          Thành công
        </span>
      );
    }
    if (s.status === ITEM_STATUS.FAILED) {
      return (
        <span
          className="flex items-center gap-1 text-xs text-red-400"
          title={s.error}
        >
          <XCircle className="h-3 w-3" />
          Thất bại
        </span>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex cursor-pointer items-center gap-2 text-gray-400 transition-colors hover:text-white"
      >
        <HiArrowLeft className="h-4 w-4" />
        <span className="text-sm">Quay lại</span>
      </button>

      {/* Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold text-cyan-400">✦ Giỏ hàng</p>
          <h1 className="text-3xl font-bold text-white">Giỏ hàng của bạn</h1>
        </div>
        {cartItems.length > 0 && !isProcessing && !checkoutDone && (
          <button
            onClick={clearCart}
            className="cursor-pointer rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Empty state */}
      {cartItems.length === 0 && !checkoutDone ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-24 backdrop-blur-md">
          <HiOutlineShoppingCart className="mb-4 h-16 w-16 text-gray-600" />
          <p className="mb-2 text-lg font-semibold text-gray-400">
            Giỏ hàng trống
          </p>
          <p className="mb-6 text-sm text-gray-600">
            Hãy thêm tài liệu vào giỏ hàng
          </p>
          <button
            onClick={() => navigate("/document")}
            className="cursor-pointer rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Khám phá tài liệu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Danh sách */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className={`flex items-start gap-4 rounded-xl border p-4 backdrop-blur-md transition-all ${
                  itemStatuses[item._id]?.status === ITEM_STATUS.SUCCESS
                    ? "border-green-500/30 bg-green-500/5"
                    : itemStatuses[item._id]?.status === ITEM_STATUS.FAILED
                      ? "border-red-500/30 bg-red-500/5"
                      : itemStatuses[item._id]?.status ===
                          ITEM_STATUS.PROCESSING
                        ? "border-blue-500/30 bg-blue-500/5"
                        : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/20">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="line-clamp-2 cursor-pointer text-sm font-semibold text-white hover:text-purple-300"
                    onClick={() =>
                      item._id && navigate(`/documentDetail/${item._id}`)
                    }
                  >
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.subject} · {item.category}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Tác giả: {item.author?.userName || "—"}
                  </p>
                  {/* Hiển thị txHash nếu thành công */}
                  {itemStatuses[item._id]?.txHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${itemStatuses[item._id].txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-xs text-cyan-400 hover:underline"
                    >
                      Tx: {itemStatuses[item._id].txHash.slice(0, 20)}...
                    </a>
                  )}
                  {/* Hiển thị lỗi nếu thất bại */}
                  {itemStatuses[item._id]?.error && (
                    <p className="mt-1 text-xs text-red-400">
                      {itemStatuses[item._id].error}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-sm font-bold text-purple-400">
                    {item.price > 0 ? `${item.price} ETH` : "Free"}
                  </span>
                  <StatusBadge docId={item._id} />
                  {!isProcessing &&
                    itemStatuses[item._id]?.status !== ITEM_STATUS.SUCCESS && (
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="cursor-pointer text-gray-600 transition hover:text-red-400"
                      >
                        <HiX size={16} />
                      </button>
                    )}
                </div>
              </div>
            ))}

            {/* Kết quả sau checkout */}
            {checkoutDone && (
              <CheckoutResult
                statuses={itemStatuses}
                onContinue={() => navigate("/document")}
              />
            )}
          </div>

          {/* Summary */}
          <div className="self-start rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-lg font-bold text-white">Tổng đơn hàng</h2>

            <div className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between"
                >
                  <span className="line-clamp-1 max-w-[160px] text-xs text-gray-400">
                    {item.title}
                  </span>
                  <span className="text-xs font-medium text-white">
                    {item.price > 0 ? `${item.price} ETH` : "Free"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300">
                Tổng cộng
              </span>
              <span className="text-xl font-black text-purple-400">
                {total.toFixed(4)} ETH
              </span>
            </div>

            {!checkoutDone ? (
              <>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutStep === CHECKOUT_STEP.CHECKING ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : checkoutStep === CHECKOUT_STEP.PROCESSING ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang thanh toán...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Thanh toán ngay
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate("/document")}
                  disabled={isProcessing}
                  className="mt-3 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tiếp tục mua sắm
                </button>

                <p className="mt-4 text-center text-xs text-gray-600">
                  Giao dịch được xử lý qua Sepolia Testnet
                </p>
              </>
            ) : (
              <button
                onClick={() => navigate("/document")}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Khám phá thêm
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal: Chưa liên kết ví */}
      {walletModal && (
        <Modal onClose={() => setWalletModal(false)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/15 ring-1 ring-yellow-500/30">
              <Wallet className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Chưa liên kết ví</h3>
              <p className="mt-1 text-sm text-gray-400">
                Bạn cần liên kết ví MetaMask trước khi thanh toán. Vào trang cá
                nhân để kết nối ví.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <button
                onClick={() => {
                  setWalletModal(false);
                  navigate(`/profile/${userId}`);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Đến trang cá nhân
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setWalletModal(false)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-gray-400 transition hover:bg-white/10"
              >
                Để sau
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Không đủ số dư / Sai ví ── */}
      {balanceModal && (
        <Modal onClose={() => setBalanceModal(false)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/30">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {balanceInfo.error ? "Sai địa chỉ ví" : "Số dư không đủ"}
              </h3>

              {balanceInfo.error ? (
                <p className="mt-1 text-sm whitespace-pre-line text-gray-400">
                  {balanceInfo.error}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-400">
                  Ví của bạn không đủ ETH để hoàn tất thanh toán.
                </p>
              )}
            </div>

            {!balanceInfo.error && (
              <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Số dư hiện tại</span>
                  <span className="font-bold text-white">
                    {balanceInfo.balance} ETH
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-400">Cần thanh toán</span>
                  <span className="font-bold text-purple-400">
                    {balanceInfo.required} ETH
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm">
                  <span className="text-gray-400">Còn thiếu</span>
                  <span className="font-bold text-red-400">
                    {balanceInfo.shortfall} ETH
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setBalanceModal(false)}
              className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Đã hiểu
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CheckoutResult({ statuses, onContinue }) {
  const entries = Object.entries(statuses);
  const successCount = entries.filter(
    ([, s]) => s.status === ITEM_STATUS.SUCCESS,
  ).length;
  const failCount = entries.filter(
    ([, s]) => s.status === ITEM_STATUS.FAILED,
  ).length;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {failCount === 0 ? (
          <CheckCircle2 className="h-6 w-6 shrink-0 text-green-400" />
        ) : (
          <AlertTriangle className="h-6 w-6 shrink-0 text-yellow-400" />
        )}
        <div>
          <p className="text-sm font-bold text-white">
            {failCount === 0
              ? "Thanh toán hoàn tất!"
              : `${successCount} thành công · ${failCount} thất bại`}
          </p>
          <p className="text-xs text-gray-500">
            {failCount > 0
              ? "Một số tài liệu chưa thanh toán được. Các item thất bại vẫn còn trong giỏ hàng."
              : "Tài liệu đã được thêm vào thư viện của bạn."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Box */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 transition hover:text-white"
        >
          <HiX size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
