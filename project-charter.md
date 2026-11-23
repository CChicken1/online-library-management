TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN
VÀ TRUYỀN THÔNG VIỆT – HÀN
BÁO CÁO 1
PROJECT CHARTER
XÂY DỰNG HỆ THỐNG QUẢN LÝ THƯ VIỆN TRỰC TUYẾN

Môn học	Quản trị dự án phần mềm
Nhóm thực hiện	[FourChickens] – Phạm Thị Thu Diễm
                           Huỳnh Ngọc An Thuyên
                           Phạm Phú Minh Tín
                           Trần Viết Huy 
Giảng viên phụ trách	Nguyễn Thanh Tuấn
Thời gian dự kiến	15 tuần
Chuẩn tham chiếu	PMBOK Guide (Project Charter) và quy trình quản lý trên GitHub


 Kiểm soát tài liệu
Phiên bản	Ngày	Người lập	Nội dung thay đổi	Người duyệt
0.1	12/09/2026	Phạm Thị Thu Diễm	Bản dự thảo ban đầu	Nguyễn Thanh Tuấn
1.0	14/09/2026	Phạm Thị Thu Diễm	Bản chính thức sau khi các bên ký xác nhận	Nguyễn Thanh Tuấn
1. Thông tin chung về dự án
Nội dung	Thông tin
Tên dự án	Xây dựng hệ thống quản lý thư viện trực tuyến
Tên tiếng Anh	Online Library Management System
Môn học	Quản trị dự án phần mềm
Đơn vị	Trường Đại học Công nghệ Thông tin và Truyền thông Việt – Hàn (VKU)
Nhóm thực hiện	[FourChickens] – Phạm Thị Thu Diễm
                           Huỳnh Ngọc An Thuyên
                           Phạm Phú Minh Tín
                           Trần Viết Huy
Project Manager / Scrum Master	Phạm Thị Thu Diễm
Giảng viên phụ trách	Nguyễn Thanh Tuấn
Thời gian dự kiến	15 tuần
GitHub Repository	https://github.com/CChicken1/online-library-management.git
Ngày lập	14/09/2026
2. Bối cảnh và lý do thực hiện
Các nghiệp vụ quản lý thư viện như quản lý thông tin sách, tra cứu tài liệu, theo dõi mượn và trả sách, quản lý độc giả cần được tổ chức rõ ràng và chính xác. Dự án đề xuất xây dựng một ứng dụng web hỗ trợ số hóa các nghiệp vụ cơ bản, giúp người đọc tra cứu sách và hỗ trợ người quản lý thực hiện các công việc trên một nền tảng tập trung.
3. Mục tiêu dự án
•	Xây dựng ứng dụng web hỗ trợ các nghiệp vụ quản lý thư viện cơ bản.
•	Cho phép người đọc đăng ký, đăng nhập, tìm kiếm và xem thông tin sách.
•	Hỗ trợ gửi yêu cầu mượn sách và theo dõi lịch sử mượn trả.
•	Hỗ trợ quản trị viên quản lý sách, danh mục, tài khoản và hoạt động mượn trả.
•	Xây dựng cơ sở dữ liệu có cấu trúc và kiểm soát quyền truy cập.
•	Kiểm thử các chức năng chính và triển khai sản phẩm để trình diễn.
•	Quản lý tiến độ và mã nguồn bằng GitHub Issues, Pull Requests và GitHub Projects.

Tiêu chí đo lường dự kiến: hoàn thành các chức năng MVP đã thống nhất; có test cases và kết quả kiểm thử; có lịch sử commit của các thành viên; có sản phẩm triển khai; có phản hồi hoặc xác nhận đánh giá từ stakeholder phù hợp.
4. Phạm vi dự án
Trong phạm vi (In Scope):
•	Đăng ký, đăng nhập, đăng xuất và quản lý tài khoản.
•	Hiển thị danh sách sách, chi tiết sách, tìm kiếm và lọc sách.
•	Gửi yêu cầu mượn sách và theo dõi lịch sử/trạng thái mượn trả.
•	Quản trị sách, danh mục, tài khoản và yêu cầu mượn trả.
•	Phân quyền theo vai trò, kiểm thử chức năng và bảo mật cơ bản.
•	Triển khai ứng dụng phục vụ trình diễn.

Ngoài phạm vi (Out of Scope):
•	Tích hợp RFID/máy quét mã vạch hoặc hệ thống thư viện bên thứ ba.
•	Đề xuất sách bằng AI và quản lý nhiều chi nhánh phức tạp.
•	Các nghiệp vụ nâng cao chưa được xác nhận là cần thiết.
5. Sản phẩm bàn giao
STT	Sản phẩm	Mô tả
1	Project Charter	Tài liệu khởi tạo và xác định định hướng dự án
2	WBS và WBS Dictionary	Phân rã công việc và mô tả gói công việc
3	Risk Register	Danh sách và theo dõi rủi ro
4	Tài liệu yêu cầu	Yêu cầu chức năng, phi chức năng, User Stories
5	Thiết kế UI/UX	Wireframe, prototype và thiết kế giao diện
6	Thiết kế hệ thống	Kiến trúc, API và cơ sở dữ liệu
7	Mã nguồn ứng dụng	Frontend, backend và database
8	Bộ kiểm thử	Test cases và kết quả kiểm thử
9	Sản phẩm triển khai	Website có thể truy cập để trình diễn
10	Báo cáo tổng kết	Tài liệu tổng kết quá trình thực hiện
6. Các bên liên quan (Stakeholders)
Stakeholder	Vai trò / Mối quan tâm	Trạng thái
Giảng viên môn Quản trị dự án phần mềm	Hướng dẫn, theo dõi và đánh giá việc quản lý dự án	Đã xác định theo môn học
Sinh viên/người đọc	Thử nghiệm tra cứu và yêu cầu mượn sách	Đã xác định nhóm người dùng mục tiêu; chưa mời thử nghiệm, dự kiến thực hiện ở tuần 14
Nhóm phát triển 04 thành viên	Phân tích, thiết kế, xây dựng và kiểm thử	Đã xác định nhóm:
 Phạm Thị Thu Diễm
 Huỳnh Ngọc An Thuyên
 Phạm Phú Minh Tín
 Trần Viết Huy
7. Tổ chức nhóm và phân công vai trò dự kiến
Thành viên	Vai trò dự kiến	Trách nhiệm chính
Phạm Thị Thu Diễm	Project Manager / Scrum Master	Lập kế hoạch, theo dõi tiến độ, quản lý GitHub, rủi ro, báo cáo và phối hợp tích hợp
                           Trần Viết Huy	Business Analyst / QA	Phân tích yêu cầu, User Stories, Acceptance Criteria, test cases và kiểm thử
Huỳnh Ngọc An Thuyên
	UI/UX / Frontend	Thiết kế giao diện, prototype và phát triển frontend
Phạm Phú Minh Tín
                           	Technical Lead / Backend	Kiến trúc, cơ sở dữ liệu, backend, API và triển khai
8. Phương pháp quản lý dự án
Nhóm dự kiến áp dụng Agile/Scrum kết hợp GitHub. Công việc được quản lý qua Product Backlog và GitHub Projects; mỗi nhiệm vụ được ghi nhận bằng Issue; thành viên phát triển trên nhánh riêng và tạo Pull Request để kiểm tra trước khi hợp nhất vào nhánh chính. Nhóm trao đổi định kỳ, đánh giá tiến độ và cập nhật rủi ro theo từng Sprint.
9. Nguồn lực và công nghệ dự kiến
* Nhân lực:   Phạm Thị Thu Diễm,  Huỳnh Ngọc An Thuyên, Phạm Phú Minh Tín,Trần Viết Huy 
* Công cụ dự kiến: Git/GitHub, Visual Studio Code, công cụ quản lý cơ sở dữ liệu, công cụ kiểm thử API/giao diện và dịch vụ hosting. Prototype giao diện được xây dựng trực tiếp bằng code frontend (HTML/CSS/JavaScript hoặc framework mà nhóm lựa chọn), không dùng công cụ thiết kế riêng. Framework frontend, backend và hệ quản trị cơ sở dữ liệu sẽ được nhóm lựa chọn sau khi phân tích yêu cầu và đánh giá khả năng triển khai. Nhóm ưu tiên công cụ/dịch vụ miễn phí dành cho sinh viên; chi phí phát sinh (nếu có) sẽ được ghi nhận.
10. Các mốc tiến độ chính
Mốc	Tuần dự kiến	Kết quả mong đợi
Khởi động dự án	1	Thống nhất đề tài, nhóm và định hướng
Lập kế hoạch	2–3	Project Charter, WBS, Risk Register
Phân tích yêu cầu	3–4	Yêu cầu và User Stories
Thiết kế hệ thống	4–5	UI/UX, kiến trúc và cơ sở dữ liệu
Phát triển chức năng chính	6–9	Các chức năng MVP
Tích hợp hệ thống	10–11	Frontend, backend và database tích hợp
Kiểm thử và sửa lỗi	12–13	Kết quả kiểm thử và sửa lỗi
Triển khai và đánh giá	14	Sản phẩm triển khai và phản hồi
Tổng kết	15	Báo cáo và trình diễn
11. Rủi ro và giả định ban đầu
Rủi ro ban đầu gồm: yêu cầu chưa rõ; khó tiếp cận stakeholder; phạm vi mở rộng; chậm tiến độ; chênh lệch kỹ năng; khó tích hợp frontend/backend/database; lỗi bảo mật; thiếu thời gian kiểm thử; khó triển khai trực tuyến.
Giả định:
•	Các thành viên có thể tham gia trong 15 tuần.
•	Nhóm có thể sử dụng các công cụ phát triển cần thiết.
•	Nhóm có thể mời người dùng thử nghiệm.
•	Phạm vi MVP có thể hoàn thành trong thời gian môn học.
12. Tiêu chí thành công và nghiệm thu
•	Các chức năng MVP hoạt động theo yêu cầu đã thống nhất.
•	Phân quyền người dùng phù hợp với vai trò.
•	Các luồng tra cứu, yêu cầu mượn và cập nhật trả sách hoạt động.
•	Lỗi nghiêm trọng được xử lý trước khi trình diễn.
•	Có test cases, kết quả kiểm thử và bằng chứng.
•	Có sản phẩm triển khai và bằng chứng quản lý dự án trên GitHub.
•	Có phản hồi/xác nhận đánh giá từ stakeholder hoặc người dùng được xác định.

Người xác nhận nghiệm thu: Nguyễn Thanh Tuấn - Giảng viên phụ trách môn Quản trị dự án phần mềm
13. Phê duyệt dự án
Việc ký xác nhận thể hiện các bên đã xem xét và thống nhất nội dung Project Charter theo phạm vi trách nhiệm của mình.
•	Xác nhận của các thành viên nhóm
Vai trò	Họ và tên	Chữ ký	Ngày ký
Project Manager / Scrum Master	Phạm Thị Thu Diễm	Diễm	14/9/2026
Business Analyst /QA	 Trần Viết Huy	Huy	14/9/2026
UI/UX / Frontend	Huỳnh Ngọc An Thuyên
	Thuyên	14/9/2026
Technical Lead / Backend	Phạm Phú Minh Tín
                           	Tín	14/9/2026


