# LingoUp

Ứng dụng MVP luyện nói và học từ vựng tiếng Anh với giao diện React và API Python/FastAPI. Người học chọn một trong ba cấp độ, luyện theo chủ đề, nghe câu hỏi mẫu, xem từ vựng gợi ý, nói bằng micro hoặc nhập câu trả lời, rồi nhận điểm và góp ý.

## Chủ đề luyện nói

Hiện có 18 chủ đề, chia đều cho ba cấp độ cơ bản, trung bình và nâng cao. Chủ đề trải rộng từ sinh hoạt hằng ngày, mua sắm, đồ ăn và du lịch đến giải trí, học tập, công nghệ, môi trường, văn hóa và công việc. Mỗi chủ đề có câu hỏi gợi mở, câu hỏi tiếp nối, mục tiêu số từ và bộ từ vựng riêng.

## Từ điển và luyện phát âm

Từ điển nằm ở trang riêng `/dictionary`, gồm hơn 10.000 từ phổ biến, chia theo thứ tự tần suất thành ba nhóm và hiển thị 50 từ mỗi trang. Có thể lọc/tìm trong danh sách, tra nghĩa và ví dụ theo yêu cầu, nghe từng từ, rồi bấm **Luyện đọc** ngay trên mục từ. Từ mới tra cứu dùng [Free Dictionary API](https://dictionaryapi.dev/); từ được tra sẽ được gửi tới dịch vụ này. Phát âm mẫu và nhận diện giọng nói dùng Web Speech API của trình duyệt. Phản hồi phát âm chỉ mang tính tham khảo, không phải chấm điểm ngữ âm chuyên sâu.

Danh sách 10.000 từ được điều chỉnh từ [FrequencyWords](https://github.com/hermitdave/FrequencyWords) (Hermit Dave), dựa trên OpenSubtitles 2018; đã lọc còn các từ đơn gồm chữ cái và bỏ một số mảnh từ do tách từ. Dữ liệu này được phát hành theo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); nhóm từ theo thứ hạng tần suất không phải cấp độ CEFR chính thức.

## Hội thoại nhập vai

Chọn một trong 60 tình huống, chia đều theo ba cấp độ từ cơ bản đến nâng cao. Bối cảnh đời sống gồm đi lại, khách sạn, mua sắm, dịch vụ, y tế, sinh hoạt cộng đồng và lên kế hoạch. Bối cảnh công sở bao gồm làm quen đồng nghiệp, phối hợp bàn giao, làm rõ yêu cầu, xin góp ý, điều phối cuộc họp, ưu tiên công việc, xử lý thay đổi dự án, trao đổi với khách hàng và nhà cung cấp. Nhập câu trả lời hoặc dùng micro để đối thoại theo lượt; ứng dụng đưa ra câu hỏi nối tiếp, cụm từ gợi ý và góp ý ngắn. Các tình huống và nhánh phản hồi hiện được định nghĩa sẵn trong backend, chưa kết nối mô hình AI tạo hội thoại.

## Luyện ghép từ thành câu

Mục **Ghép câu** có 1.201.038 câu luyện: 400.346 câu cho mỗi cấp độ. Các câu tổ hợp được sinh theo yêu cầu để tránh tải cả danh mục lớn vào bộ nhớ cùng lúc. Có thể chọn câu ngẫu nhiên hoặc nhập số câu, sắp xếp các thẻ từ, xem gợi ý, kiểm tra đáp án và nghe câu mẫu bằng Web Speech API của trình duyệt.

## Chạy backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API mặc định tại `http://localhost:8000`; tài liệu tương tác tại `/docs`.

## Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (thường là `http://localhost:5173`). Có thể đặt `VITE_API_URL` nếu backend chạy ở địa chỉ khác.

## Deploy lên Vercel

Frontend Vite và backend FastAPI được cấu hình thành hai Vercel Services dùng chung một domain. Các request `/api/*` được chuyển tới FastAPI; các đường dẫn còn lại được chuyển tới frontend. Vercel Services hiện ở giai đoạn beta.

Từ thư mục gốc của dự án, đăng nhập và triển khai:

```bash
npx vercel@latest login
npx vercel@latest --prod
```

Ở lần đầu, CLI sẽ hỏi để tạo hoặc liên kết project Vercel. Không cần đặt `VITE_API_URL` khi frontend và backend cùng deploy trong một project.

## Chấm điểm và quyền riêng tư

Trình duyệt dùng Web Speech API để nhận dạng lời nói khi tính năng được hỗ trợ; trình duyệt sẽ yêu cầu quyền micro và cách xử lý âm thanh phụ thuộc vào trình duyệt/nhà cung cấp. Nếu không hỗ trợ, người học có thể nhập câu trả lời trực tiếp. API chấm độ dài câu trả lời, mức độ dùng từ vựng mục tiêu và số từ đệm trong bản chép lời. Điểm hiện tại **không** đo phát âm, ngữ pháp hoặc độ chính xác của nhận dạng giọng nói. Bản MVP không gửi âm thanh tới backend và không lưu bản ghi âm hay lịch sử luyện tập.

## Kiểm thử API

```bash
cd backend
pip install httpx pytest
pytest
```
