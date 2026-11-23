# CGV Demo — React + TypeScript (TS/TSX)

**Dự án frontend học tập**, mô phỏng giao diện CGV từ bản React JS trước đó; không phải website chính thức CGV. Dữ liệu phim, rạp, ưu đãi, vé và tài khoản đều **giả lập**; không thu tiền thật, không giữ ghế thật.

## 1. Công nghệ được sử dụng

- React + Vite + TypeScript, React Router, CSS thuần.
- `interface`, `type`, `string`, `number`, `boolean`, mảng `string[]` — kiến thức TypeScript cơ bản.
- Props và state có kiểu; Hooks `useState`, `useEffect`, `useContext`.
- `useFetch<T>` là ví dụ generic đơn giản, lấy dữ liệu từ JSON thông qua `fetch` + `async/await`.
- `localStorage` chỉ dùng cho tài khoản/vé demo. Không có backend, không có thanh toán thật.

## 2. Chạy bằng VS Code trên Windows

Mở **đúng thư mục có `package.json`** trong VS Code → Terminal (PowerShell) rồi chạy:

```powershell
npm.cmd install
npm.cmd run dev
```

Mở địa chỉ Vite in trong Terminal (thường `http://localhost:5173/`). Không nhấn đúp mở `index.html`.

Kiểm tra trước khi nộp:

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
```

Nếu `npm` bị chặn script PowerShell, hãy dùng **`npm.cmd`** như trên. Nếu `ENOENT package.json`, bạn đang mở sai thư mục. Không commit `node_modules/`, `dist/`.

## 3. Các chức năng

- `/` — trang chủ, banner, danh sách phim/ưu đãi.
- `/phim` — tìm kiếm và lọc phim.
- `/phim/:id` — chi tiết phim.
- `/rap` — danh sách rạp minh họa.
- `/uu-dai`, `/uu-dai/:id` — tin mới/ưu đãi và bài chi tiết thẻ cứng comeback.
- `/dang-nhap` — đăng nhập demo, form có validate.
- `/dat-ve/:id` — chọn rạp, ngày, suất, ghế, nhập điện thoại và đặt vé demo.
- `/ve-cua-toi` — vé demo lưu trên trình duyệt.
- `*` — trang 404.

## 4. Bố cục mã nguồn

```text
cgv-react-typescript/
├── public/data/              JSON: movies, cinemas, offers
├── src/
│   ├── components/           Layout.tsx, MovieCard.tsx, OfferCard.tsx, Status.tsx
│   ├── context/              AppContext.tsx
│   ├── hooks/                useFetch.ts
│   ├── pages/                Home.tsx, Movies.tsx, Booking.tsx ...
│   ├── utils/                booking.ts
│   ├── types.ts              Movie, Offer, Cinema, User, Ticket
│   ├── App.tsx               React Router
│   ├── main.tsx              ReactDOM.createRoot
│   └── styles.css            CSS từ bản gốc, giữ nguyên giao diện
├── tests/booking.test.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### JavaScript vs TypeScript — ví dụ

```ts
// TypeScript: ghi rõ dữ liệu đầu vào và kiểu trả về
function calculateTotal(price: number, seats: string[]): number {
  return price * seats.length;
}

interface User {
  name: string;
  email: string;
}

const [seats, setSeats] = useState<string[]>([]);
// useFetch<Movie[]>: dữ liệu lấy về là một mảng Movie
const movies = useFetch<Movie[]>('/data/movies.json');
```

**Chú ý:** `interface` chỉ kiểm tra kiểu trong lúc viết/biên dịch; JSON đọc qua `fetch` vẫn là dữ liệu bên ngoài và chưa được validate runtime trong demo này.

## 5. GitHub nhóm (không ghi đè code thành viên khác)

Nếu repo nhóm đã tồn tại, **không chạy `git init` hay `git push --force` nữa**. Hãy sao lưu thay đổi, lấy cập nhật mới nhất từ `origin/main`, làm việc trên một nhánh riêng rồi tạo Pull Request. Nếu Git báo xung đột, cần giải quyết trước khi push. Một ví dụ sau khi đưa các file TS vào đúng thư mục repo và kiểm tra `git status`:

```powershell
git switch -c chuyen-sang-typescript
git add .
git commit -m "Convert CGV React frontend to TypeScript"
git push -u origin chuyen-sang-typescript
```

Sau đó mở Pull Request để nhóm xem xét và gộp vào `main`.

---

## Bản mở rộng: đăng ký, chọn ghế và trang Admin (React TypeScript)

Các file **mới**:

| File | Chức năng |
| --- | --- |
| `src/components/SeatMap.tsx` | Chọn ghế theo sức chứa phòng, hiển thị ghế đã được đặt thử |
| `src/components/CountdownTimer.tsx` | Bộ đếm 5 phút, hết giờ cần bắt đầu lại |
| `src/components/ProtectedRoute.tsx` | Điều hướng nếu chưa đăng nhập hoặc chưa bật chế độ Admin demo |
| `src/components/AdminNav.tsx` | Menu điều hướng khu vực quản trị |
| `src/pages/Register.tsx` | Form đăng ký demo, kiểm tra email và mật khẩu nhập lại |
| `src/pages/admin/Dashboard.tsx` | Thống kê vé và doanh thu mô phỏng |
| `src/pages/admin/ManageMovies.tsx` | Thêm / sửa / xóa phim |
| `src/pages/admin/ManageRooms.tsx` | Thêm / sửa / xóa phòng chiếu |
| `src/pages/admin/ManageShowtimes.tsx` | Thêm / sửa / xóa lịch chiếu |
| `src/context/CatalogContext.tsx` | Dữ liệu phim, rạp, phòng, suất chiếu dùng chung |

**Trang đã sửa:** `App.tsx`, `main.tsx`, `types.ts`, `AppContext.tsx`, `Booking.tsx`, `Home.tsx`, `Movies.tsx`, `MovieDetail.tsx`, `Cinemas.tsx`, `Login.tsx`, `Layout.tsx` và `styles.css`.

### Chạy nhanh trên Windows / VS Code

**ZIP này đã được đóng gói không có thư mục cha lồng thêm.** Giải nén vào thư mục riêng (ví dụ `C:\Users\LENOVO\Downloads\cgv-react-typescript-admin`). Mở chính thư mục **có `package.json`** trong VS Code.

```powershell
npm.cmd install
npm.cmd run dev
```

Lệnh kiểm tra nếu npm đã cài xong:

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd test
```

### Cách thử Admin demo

1. Vào **Đăng nhập** (`/dang-nhap`).
2. Nhập tên, email hợp lệ, mật khẩu demo từ 6 ký tự (không dùng mật khẩu thật).
3. Đánh dấu **Bật vai trò Admin demo**, rồi bấm đăng nhập.
4. Chọn **Quản trị** ở thanh menu hoặc mở `/admin`.
5. Thử thêm phim ở `/admin/phim`, phòng ở `/admin/phong`, lịch ở `/admin/suat-chieu`.
6. Quay về `/phim` để kiểm tra phim mới; vào đặt vé để kiểm tra giờ chiếu.

Muốn thử đăng ký thành viên thường, **Đăng xuất** rồi vào `/dang-ky`.

### Đặc điểm dữ liệu demo

- Phim và rạp mặc định được tải từ `public/data/*.json` qua `fetch`.
- Các thay đổi trong Admin, thông tin người dùng và vé được lưu bằng **localStorage** trên trình duyệt hiện tại.
- Nếu chưa xếp suất chiếu riêng cho phim + rạp + ngày đó, trang đặt vé tiếp tục hiển thị khung giờ mặc định của phim. Khi xếp suất chiếu riêng, khung giờ Admin sẽ được ưu tiên.
- Phòng mẫu ban đầu được tạo từ số lượng phòng có trong dữ liệu rạp. Sức chứa cho sơ đồ ghế tối đa 260 ghế.
- **Đăng ký/đăng nhập/role Admin chỉ là mô phỏng frontend**, không xác thực mật khẩu, không có hệ thống phân quyền phía server. Không sử dụng với dữ liệu người dùng thật.
- **Đếm ngược và giữ ghế không đồng bộ giữa các máy**, không có thanh toán, email hay vé thật. Thống kê doanh thu chỉ là tổng giá trị vé demo đã lưu trong trình duyệt.
- Để trở về dữ liệu mặc định, vào DevTools > Application > Local Storage và xóa các key bắt đầu bằng `cgv_` của trang demo (việc này cũng xóa vé và đăng nhập demo).

### Đẩy lên GitHub nhóm mà không ghi đè code người khác

Sao chép **nội dung bên trong** thư mục mã nguồn mới vào bản clone mới nhất của repository, nên tạo nhánh riêng:

```powershell
git switch -c cgv-typescript-admin
git add .
git commit -m "Add CGV TypeScript admin and booking features"
git push -u origin cgv-typescript-admin
```

Sau đó tạo Pull Request về nhánh `main`. Không dùng `git push --force` với repository chung.
