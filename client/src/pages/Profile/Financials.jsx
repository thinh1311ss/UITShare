import {
  useConnect,
  useConnection,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
  useConnectionEffect,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import BalanceCard from "../../components/Profile/BalanceCard";
import FinanceStatCard from "../../components/Profile/FinanceStatCard";
import TransactionTable from "../../components/Profile/TransactionTable";
import WalletCard from "../../components/Profile/WalletCard";
import { useParams } from "react-router";
import axios from "../../common";

const Financials = () => {
  const { userId } = useParams();
  const { mutate: connect } = useConnect();
  const { address, isConnected } = useConnection();
  const { mutate: disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const chainId = useChainId();
  const { mutate: switchChain } = useSwitchChain();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Chưa kết nối";
  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  useConnectionEffect({
    async onConnect(data) {
      try {
        await axios.put(`/api/personal/updateWallet/${userId}`, {
          walletAddress: data.address,
        });
      } catch (error) {
        console.log(error);
      }
    },
  });

  const mockTransactions = [
    {
      title: 'Bán tài liệu "Giải tích 1"',
      date: "01/03/2026",
      amount: "+ 0.05 ETH",
      status: "Thành công",
    },
    {
      title: 'Mua tài liệu "Ôn tập OOP"',
      date: "25/02/2026",
      amount: "- 0.01 ETH",
      status: "Thành công",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl p-2">
      <div className="mb-8 flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tài chính & Ví NFT</h1>
          <p className="mt-1 text-sm text-gray-400">
            Quản lý số dư ETH và tài sản NFT của bạn trên UITShare.
          </p>
        </div>
        {!isConnected ? (
          <button onClick={() => connect({ connector: injected() })}>
            Kết nối ví MetaMask
          </button>
        ) : isWrongNetwork ? (
          <button onClick={() => switchChain({ chainId: sepolia.id })}>
            Sai mạng! Đổi sang Sepolia
          </button>
        ) : (
          <button onClick={() => disconnect()}>Ngắt kết nối</button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <BalanceCard
          balance={balanceData?.formatted || "0"}
          change="+0.05 ETH (tháng này)"
          onViewExplorer={() =>
            window.open(
              `https://sepolia.etherscan.io/address/${address}`,
              "_blank",
            )
          }
        />

        <FinanceStatCard
          title="Giá trị ước tính"
          value="15,000,000đ"
          tagText="VNĐ"
          tagStyle="text-gray-300 bg-white/10 border border-white/10"
          subElement={
            <p className="text-xs text-gray-400">
              Tỉ giá: 1 ETH = ~100,000,000đ
            </p>
          }
        />

        <FinanceStatCard
          title="NFT sở hữu"
          value={
            <>
              12{" "}
              <span className="text-sm font-medium text-gray-400">Items</span>
            </>
          }
          tagText="Sepolia"
          tagStyle="text-purple-400 bg-purple-500/10 border border-purple-500/20"
          subElement={
            <button className="rounded text-sm font-medium text-purple-400 transition-colors hover:text-purple-300 hover:underline focus:ring-1 focus:ring-purple-400 focus:outline-none">
              Xem bộ sưu tập &rarr;
            </button>
          }
        />
      </div>

      <TransactionTable transactions={mockTransactions} />

      <h3 className="mb-4 text-lg font-bold text-white">Ví liên kết</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <WalletCard isConnected={isConnected} address={shortAddress} />
      </div>
    </div>
  );
};

export default Financials;
