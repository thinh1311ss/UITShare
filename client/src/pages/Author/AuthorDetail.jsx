import {
  FiBook,
  FiShield,
  FiFacebook,
  FiStar,
  FiFileText,
  FiEye,
} from "react-icons/fi";
import DocumentCard from "../../components/DocumentCard/DocumentCard";

const AuthorDetail = () => {
  const authorInfo = {
    name: "Trần Thành Vinh",
    avatar: "https://m.yodycdn.com/blog/anh-dai-dien-hai-yodyvn2.jpg",
    cover:
      "https://cohotech.vn/wp-content/uploads/2024/10/Do-phan-giai-cao.webp",
    cohort: "K18 - Công nghệ thông tin",
    bio: "Chuyên share tài liệu điểm cao, đề thi giữa kỳ, cuối kỳ các môn đại cương và chuyên ngành. Chúc các đồng âm UIT qua môn A+!",
    socialLink: "https://facebook.com/vinh.uit",
    stats: {
      docs: 15,
      views: 1250,
      rating: 4.8,
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur-md">
        <div className="relative h-48 border-b border-white/10 bg-white/5 sm:h-56">
          <img
            src={authorInfo.cover}
            alt="Cover"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
            <img
              src={authorInfo.avatar}
              alt="Profile avatar"
              className="h-28 w-28 rounded-full border-4 border-[#050816] bg-[#050816] object-cover shadow-md"
            />
          </div>
        </div>

        <div className="mt-16 px-6 pb-8 text-center">
          <h1 className="text-2xl font-bold text-white">{authorInfo.name}</h1>

          <div className="mt-4 inline-flex items-center gap-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-sm text-cyan-300">
            <span className="flex items-center gap-1.5">
              <FiBook className="h-4 w-4 opacity-70" />
              Sinh viên UIT
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            <span className="flex items-center gap-1.5">
              <FiShield className="h-4 w-4 opacity-70" />
              {authorInfo.cohort}
            </span>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-gray-400">
            {authorInfo.bio}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="cursor-pointer rounded-xl bg-linear-to-r from-purple-400 via-blue-400 to-cyan-400 px-8 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
              Theo dõi tác giả
            </button>
            <a
              href={authorInfo.socialLink}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2.5 text-gray-400 transition-all hover:bg-white/10 hover:text-cyan-400"
              title="Liên hệ Facebook"
            >
              <FiFacebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-white/5">
          <div className="py-5 text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-purple-400">
              <FiFileText className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-400">
                Tài liệu
              </span>
            </div>
            <span className="text-xl font-bold text-white">
              {authorInfo.stats.docs}
            </span>
          </div>
          <div className="py-5 text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-purple-400">
              <FiEye className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-400">
                Lượt xem
              </span>
            </div>
            <span className="text-xl font-bold text-white">
              {authorInfo.stats.views}
            </span>
          </div>
          <div className="flex flex-col items-center py-5 text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-purple-400">
              <FiStar className="h-4 w-4" />
              <span className="text-sm font-medium text-gray-400">
                Đánh giá
              </span>
            </div>
            <span className="text-xl font-bold text-white">
              {authorInfo.stats.rating}
              <span className="text-sm font-normal text-gray-500">/5</span>
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
          <span className="h-6 w-1.5 rounded-sm bg-cyan-400"></span>
          Tài liệu đã chia sẻ
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((curr) => (
            <DocumentCard key={curr} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorDetail;
