// Dữ liệu giả lập. Thay bằng fetch từ Supabase/API khi có backend.
// Kiểu dữ liệu ở đây là hợp đồng: khi nối DB, chỉ cần đổi hàm lấy dữ liệu,
// phần giao diện không phải sửa.

export type LoanStatus = "borrowed" | "returned" | "overdue";

export type Book = {
  id: string;
  code: string; // mã kho, ví dụ 8432-B
  title: string;
  author: string;
  subject: string;
  copies: number; // tổng số bản
  available: number; // số bản còn rảnh
  publisher: string;
  year: number;
  pages: number;
  shelf: string;
  keywords: string;
  summary: string;
  coverTitle: string;
};

export type Member = {
  id: string;
  code: string; // số thẻ
  name: string;
  tier: "Thường" | "Vàng" | "Đọc tại chỗ";
  email: string;
  phone: string;
  joinedAt: string;
  expiryDate: string; // ISO
  status: "active" | "expired" | "suspended";
  borrowCount: number;
  maxBooks: number;
};

export type Loan = {
  id: string; // mã phiếu
  bookId: string;
  memberId: string;
  borrowedAt: string; // ISO
  dueAt: string; // ISO
  returnedAt: string | null;
  status: LoanStatus;
  copyLabel: string; // nhãn bản vật lý, ví dụ A2
};

export type Fine = {
  id: string;
  memberId: string;
  amount: number;
  daysLate: number;
  paid: boolean;
  paidAt: string | null;
};

export type Reservation = {
  id: string;
  bookId: string;
  memberId: string;
  reservedAt: string;
  status: "waiting" | "ready" | "picked_up" | "cancelled";
};

/* ========================================================================== */

export const books: Book[] = [
  {
    id: "b1",
    code: "8432-B",
    title: "Bên kia sông",
    author: "Nguyễn Quang Thiều",
    subject: "Văn học",
    copies: 3,
    available: 0,
    publisher: "NXB Văn học",
    year: 1987,
    pages: 312,
    shelf: "Khoang 3, tầng 2",
    keywords: "chiến tranh, nông thôn, đời thường",
    summary:
      "Câu chuyện bắt đầu từ một ngôi làng ven sông, nơi người dân sống bằng nghề làm ruộng và đánh cá. Tác giả đưa người đọc đi qua mùa lũ, mùa đói, và những đổi thay của một gia đình bình thường trong ba thế hệ.\n\nVăn phong giản dị, giàu chất thơ, với những đoạn tả cảnh sông và đồng lúa được viết bằng ngôn ngữ miền trung. Đây là tác phẩm tiêu biểu của dòng văn học miền Nam thập niên 1980.",
    coverTitle: "Bên kia sông",
  },
  {
    id: "b2",
    code: "1913-D",
    title: "Nhà giả kim",
    author: "Paulo Coelho",
    subject: "Văn học",
    copies: 5,
    available: 1,
    publisher: "NXB Lao động",
    year: 1994,
    pages: 208,
    shelf: "Khoang 3, tầng 2",
    keywords: "hành trình, giấc mơ, số phận",
    summary:
      "Cậu bé Santiago nghề nghiệp trẻ tìm được một cuốn sách cổ, trong đó có bí mật về vận mệnh. Cuốn sách dẫn cậu đi qua Tây Ban Nha, chợ tang, sa mạc Sahara, nơi cậu gặp những người thay đổi cách nhìn về cuộc đời.\n\nTác phẩm được dịch ra hơn 80 ngôn ngữ, nằm trong nhóm bán chạy nhất mọi thời đại.",
    coverTitle: "Nhà giả kim",
  },
  {
    id: "b3",
    code: "2001-A",
    title: "Vườn thu",
    author: "Nguyễn Ngọc Tư",
    subject: "Văn học",
    copies: 8,
    available: 7,
    publisher: "NXB Văn học",
    year: 1965,
    pages: 186,
    shelf: "Khoang 1, tầng 1",
    keywords: "nông thôn, tình yêu, xã hội",
    summary:
      "Truyện ngắn về cuộc đời của cô Hà, một nữ công nhân ở nông trường. Cả tác phẩm được viết bằng giọng văn trong trẻo, tràn đầy sự tử tế, với những mối quan hệ giản dị mà sâu lắng giữa người lao động nông nghiệp và cán bộ công nhân.",
    coverTitle: "Vườn thu",
  },
  {
    id: "b4",
    code: "4471-E",
    title: "Chuyện của thiên tài",
    author: "Hector Malot",
    subject: "Thiếu nhi",
    copies: 4,
    available: 3,
    publisher: "NXB Kim Đồng",
    year: 1984,
    pages: 340,
    shelf: "Khoang 7, tầng 3",
    keywords: "trẻ em, nghèo khó, hy vọng",
    summary:
      "Cậu bé Rémi bị bỏ rơi ở ngoại ô Paris, phải tự kiếm ăn và học cách sống giữa những người xa lạ. Câu chuyện xoay quanh tình yêu thương gia đình, tình bạn và sự kiên trì trong những hoàn cảnh khắc nghiệt.",
    coverTitle: "Chuyện của thiên tài",
  },
  {
    id: "b5",
    code: "1556-C",
    title: "Sơn Tặng",
    author: "Vũ Hoàng Chương",
    subject: "Văn học",
    copies: 3,
    available: 2,
    publisher: "NXB Văn học",
    year: 1989,
    pages: 224,
    shelf: "Khoang 3, tầng 2",
    keywords: "đô thị, văn minh, xung đột",
    summary:
      "Một tác phẩm về không gian đô thị Hà Nội những năm 1980, nơi những giá trị truyền thống va chạm với nhịp sống mới. Văn phong sắc bén, giàu chất thơ và đầy tính thời sự.",
    coverTitle: "Sơn Tặng",
  },
  {
    id: "b6",
    code: "7412-F",
    title: "Tôi thấy hoa vàng trên cỏ xanh",
    author: "Nguyễn Ngọc Tư",
    subject: "Văn học",
    copies: 6,
    available: 4,
    publisher: "NXB Văn học",
    year: 1976,
    pages: 272,
    shelf: "Khoang 1, tầng 1",
    keywords: "học sinh, tình bạn, thành phố",
    summary:
      "Chuyện của những đứa học sinh làng quê vào thành phố học, xa nhà lần đầu tiên. Những nỗi nhớ, nỗi buồn tách lìa và những tình bạn mới nối lên từ năm tháng thành phố.",
    coverTitle: "Tôi thấy hoa vàng trên cỏ xanh",
  },
  {
    id: "b7",
    code: "5120-B",
    title: "Lề thơ",
    author: "Trần Dần",
    subject: "Văn học",
    copies: 7,
    available: 6,
    publisher: "NXB Văn học",
    year: 1991,
    pages: 198,
    shelf: "Khoang 3, tầng 2",
    keywords: "hiện đại, trải nghiệm, đời sống",
    summary:
      "Tập truyện ngắn về những nhân vật đang tìm chỗ đứng trong đời sống đô thị mới. Văn phong gọn, nhiều chi tiết bất ngờ, đôi khi gay gắt.",
    coverTitle: "Lề thơ",
  },
  {
    id: "b8",
    code: "6308-A",
    title: "Đại vệ chí dịch",
    author: "Hà Giang",
    subject: "Lịch sử",
    copies: 6,
    available: 5,
    publisher: "NXB Đại học Quốc gia",
    year: 1998,
    pages: 420,
    shelf: "Khoang 7, tầng 3",
    keywords: "lịch sử, ngoại giao, thế kỷ 19",
    summary:
      "Ghi chép về hoạt động ngoại giao Việt Nam trong bối cảnh thế giới thế kỷ 19, khi mọi thứ đang định hình lại. Cuốn sách dựa trên nhiều tư liệu lưu trữ chưa được công bố.",
    coverTitle: "Đại vệ chí dịch",
  },
  {
    id: "b9",
    code: "3087-C",
    title: "Cho tôi mượn một lần",
    author: "Hà Giang",
    subject: "Văn học",
    copies: 4,
    available: 1,
    publisher: "NXB Văn học",
    year: 2001,
    pages: 176,
    shelf: "Khoang 3, tầng 2",
    keywords: "đô thị, cô đơn, ký ức",
    summary:
      "Những mảnh trải rời về cuộc sống của những người trẻ ở một thành phố đang thay đổi nhanh. Mỗi chuyện là một khoảnh khắc nhỏ soi ra một đời sống lớn.",
    coverTitle: "Cho tôi mượn một lần",
  },
  {
    id: "b10",
    code: "9215-D",
    title: "Tắt đèn",
    author: "Nguyễn Quang Thiều",
    subject: "Văn học",
    copies: 5,
    available: 9 > 0 ? 4 : 0,
    publisher: "NXB Văn học",
    year: 1992,
    pages: 158,
    shelf: "Khoang 1, tầng 1",
    keywords: "làng quê, đời sống, thay đổi",
    summary:
      "Trong một đêm mất điện ở ngôi làng, mười mấy người kể lại những chuyện của cuộc đời mình. Cuốn sách nhỏ nhưng nặng trĩu tình.",
    coverTitle: "Tắt đèn",
  },
];

export const members: Member[] = [
  {
    id: "m1",
    code: "0382",
    name: "Trần Minh Quân",
    tier: "Thường",
    email: "quan.tm@example.com",
    phone: "090 214 5566",
    joinedAt: "2024-04-30",
    expiryDate: "2027-04-30",
    status: "active",
    borrowCount: 2,
    maxBooks: 5,
  },
  {
    id: "m2",
    code: "1904",
    name: "Nguyễn Thị Lan",
    tier: "Thường",
    email: "lan.nt@example.com",
    phone: "091 883 2210",
    joinedAt: "2023-11-30",
    expiryDate: "2026-11-30",
    status: "active",
    borrowCount: 1,
    maxBooks: 5,
  },
  {
    id: "m3",
    code: "0557",
    name: "Lê Thu Hà",
    tier: "Vàng",
    email: "ha.lt@example.com",
    phone: "098 445 1102",
    joinedAt: "2024-08-12",
    expiryDate: "2027-08-12",
    status: "active",
    borrowCount: 4,
    maxBooks: 8,
  },
  {
    id: "m4",
    code: "2011",
    name: "Phạm Anh Khoa",
    tier: "Thường",
    email: "khoa.pa@example.com",
    phone: "093 776 8890",
    joinedAt: "2024-12-08",
    expiryDate: "2026-12-08",
    status: "active",
    borrowCount: 3,
    maxBooks: 5,
  },
  {
    id: "m5",
    code: "1663",
    name: "Vũ Mai Chi",
    tier: "Đọc tại chỗ",
    email: "chi.vm@example.com",
    phone: "035 220 7714",
    joinedAt: "2025-01-22",
    expiryDate: "2027-01-22",
    status: "active",
    borrowCount: 0,
    maxBooks: 0,
  },
  {
    id: "m6",
    code: "2448",
    name: "Hoàng Gia Bảo",
    tier: "Thường",
    email: "bao.hg@example.com",
    phone: "089 112 3345",
    joinedAt: "2025-03-05",
    expiryDate: "2027-03-05",
    status: "active",
    borrowCount: 1,
    maxBooks: 5,
  },
  {
    id: "m7",
    code: "0876",
    name: "Nguyễn Văn Hùng",
    tier: "Thường",
    email: "hung.nv@example.com",
    phone: "096 634 5521",
    joinedAt: "2024-09-17",
    expiryDate: "2026-09-17",
    status: "active",
    borrowCount: 2,
    maxBooks: 5,
  },
  {
    id: "m8",
    code: "1229",
    name: "Đỗ Thu Trang",
    tier: "Vàng",
    email: "trang.dt@example.com",
    phone: "090 998 4471",
    joinedAt: "2024-12-14",
    expiryDate: "2026-12-14",
    status: "active",
    borrowCount: 5,
    maxBooks: 8,
  },
];

export const loans: Loan[] = [
  {
    id: "PM-2026-1026-084",
    bookId: "b2",
    memberId: "m1",
    borrowedAt: "2026-10-26",
    dueAt: "2026-11-09",
    returnedAt: null,
    status: "overdue",
    copyLabel: "A1",
  },
  {
    id: "PM-2026-0102-117",
    bookId: "b1",
    memberId: "m7",
    borrowedAt: "2026-10-21",
    dueAt: "2026-11-04",
    returnedAt: null,
    status: "overdue",
    copyLabel: "A2",
  },
  {
    id: "PM-2026-0108-203",
    bookId: "b3",
    memberId: "m4",
    borrowedAt: "2026-11-04",
    dueAt: "2026-11-18",
    returnedAt: null,
    status: "borrowed",
    copyLabel: "B1",
  },
  {
    id: "PM-2026-0110-244",
    bookId: "b4",
    memberId: "m8",
    borrowedAt: "2026-11-06",
    dueAt: "2026-11-24",
    returnedAt: null,
    status: "borrowed",
    copyLabel: "A3",
  },
  {
    id: "PM-2026-0112-271",
    bookId: "b5",
    memberId: "m5",
    borrowedAt: "2026-11-08",
    dueAt: "2026-11-26",
    returnedAt: null,
    status: "borrowed",
    copyLabel: "A1",
  },
  {
    id: "PM-2026-0113-289",
    bookId: "b6",
    memberId: "m6",
    borrowedAt: "2026-11-09",
    dueAt: "2026-11-27",
    returnedAt: null,
    status: "borrowed",
    copyLabel: "B2",
  },
  {
    id: "PM-2026-0114-302",
    bookId: "b7",
    memberId: "m3",
    borrowedAt: "2026-11-05",
    dueAt: "2026-11-19",
    returnedAt: null,
    status: "borrowed",
    copyLabel: "C1",
  },
];

export const fines: Fine[] = [
  {
    id: "f1",
    memberId: "m7",
    amount: 187000,
    daysLate: 11,
    paid: false,
    paidAt: null,
  },
  {
    id: "f2",
    memberId: "m1",
    amount: 102000,
    daysLate: 6,
    paid: false,
    paidAt: null,
  },
  {
    id: "f3",
    memberId: "m8",
    amount: 68000,
    daysLate: 4,
    paid: false,
    paidAt: null,
  },
];

export const reservations: Reservation[] = [
  {
    id: "r1",
    bookId: "b1",
    memberId: "m4",
    reservedAt: "2026-11-10",
    status: "waiting",
  },
  {
    id: "r2",
    bookId: "b2",
    memberId: "m8",
    reservedAt: "2026-11-11",
    status: "waiting",
  },
  {
    id: "r3",
    bookId: "b1",
    memberId: "m2",
    reservedAt: "2026-11-12",
    status: "waiting",
  },
];

/* ========================================================================== */
/*  Hằng số nghiệp vụ                                                          */
/* ========================================================================== */

/** Phí trễ hạn mỗi ngày, đơn vị đồng. */
export const FINE_PER_DAY = 17000;

/** Ngày hiện tại dùng làm "hôm nay" trong toàn bộ giao diện. */
export const TODAY = "2026-11-15";

export const SUBJECTS = [
  "Văn học",
  "Lịch sử",
  "Khoa học",
  "Thiếu nhi",
  "Ngoại ngữ",
  "Nghệ thuật",
] as const;

export const SHELVES = [
  "Khoang 1, tầng 1",
  "Khoang 3, tầng 2",
  "Khoang 7, tầng 3",
] as const;

/* ========================================================================== */
/*  Hàm tra cứu                                                               */
/* ========================================================================== */

export function getBook(id: string): Book | undefined {
  return books.find((b) => b.id === id);
}

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

/** Số ngày trễ tính từ hạn trả. Trả về 0 nếu chưa quá hạn. */
export function daysLate(dueAt: string, today = TODAY): number {
  const due = new Date(dueAt + "T00:00:00");
  const now = new Date(today + "T00:00:00");
  const diff = Math.floor((now.getTime() - due.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

/** Số ngày còn lại trước hạn. Âm nếu đã quá hạn. */
export function daysLeft(dueAt: string, today = TODAY): number {
  const due = new Date(dueAt + "T00:00:00");
  const now = new Date(today + "T00:00:00");
  return Math.floor((due.getTime() - now.getTime()) / 86_400_000);
}

/** Định dạng ngày kiểu Việt Nam: 15/11/2026 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Định dạng ngày ngắn: 15/11 */
export function formatDateShort(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}`;
}

/** Định dạng số tiền kiểu Việt Nam: 12,4tr */
export function formatVND(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + "tr";
  }
  if (n >= 1000) {
    return Math.round(n / 1000) + "ng";
  }
  return n.toLocaleString("vi-VN");
}

/** Số tiền đầy đủ có dấu chấm phân tách: 85.000 đ */
export function formatVNDFull(n: number): string {
  return n.toLocaleString("vi-VN") + " đ";
}

/** Thẻ còn hiệu lực chưa (hạn thẻ >= hôm nay). */
export function isMembershipValid(expiryDate: string, today = TODAY): boolean {
  return new Date(expiryDate + "T00:00:00").getTime() >= new Date(today + "T00:00:00").getTime();
}

/** Hội viên còn được mượn bao nhiêu cuốn. */
export function remainingQuota(member: Member): number {
  return Math.max(0, member.maxBooks - member.borrowCount);
}
