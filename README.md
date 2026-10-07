# 🚀 DevNotes — Notion x Coding Workspace

> Ứng dụng ghi chép bài học lập trình tương tác kết hợp mô hình Notion và Coding Sandbox đa ngôn ngữ, đóng gói thành file **`DevNotes.app`** nguyên bản cho macOS.

---

## ⚡ Các tính năng nổi bật

1. **Notion-Style Blocks với Executable Code Runner**:
   - Ghi chú phân cấp, Callouts (Mẹo, Khái niệm, Cảnh báo), Checklist bài học.
   - Code Blocks chạy trực tiếp với nút **▶ Run**: hỗ trợ **JavaScript**, **Python (Pyodide WASM)**, **SQL (SQLite WASM)** với Data Table viewer, **HTML/CSS**, **C++**.
2. **Split Studio (Màn hình kép)**:
   - Bên trái xem bài học / ghi chú, bên phải thực hành sandbox trực tiếp.
   - Hỗ trợ **Web Live Preview** render trực tiếp HTML/CSS.
   - Nút **"Ghim sang Studio"** để kéo code ví dụ từ bài học sang playground chỉ với 1 click.
3. **Kho Snippet Vault**:
   - Quản lý, tìm kiếm và phân loại snippets theo tags và ngôn ngữ.
   - **Xuất trực tiếp thành file `.code-snippets`** để dùng ngay trong VS Code hàng ngày.
4. **Flashcard Quiz (Spaced Repetition)**:
   - Thẻ lật 3D ôn tập cú pháp và tư duy logic output code.
   - Đánh giá mức độ ghi nhớ và hiệu ứng ăn mừng confetti.
5. **Local-first Persistence**:
   - Tự động lưu mọi thay đổi vào LocalStorage, hỗ trợ Xuất Markdown (`.md`) và Sao lưu toàn bộ JSON.

---

## 🛠️ Hướng dẫn Khởi chạy & Build

### 1. Khởi chạy ứng dụng macOS (.app)
Ứng dụng đã được biên dịch sẵn thành `DevNotes.app`:
```bash
open DevNotes.app
```
Hoặc đưa vào thư mục Applications để dùng như app Mac thông thường:
```bash
cp -R DevNotes.app /Applications/
```

### 2. Tự Build lại file `.app` bằng script:
```bash
./build_app.sh
```

### 3. Chạy qua Web Dev Server (nếu muốn mở trên Chrome / trình duyệt):
```bash
npm run dev
```
Truy cập: `http://localhost:5173/`
