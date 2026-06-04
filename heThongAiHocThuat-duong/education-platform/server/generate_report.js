const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require("docx");
const fs = require("fs");
const path = require("path");

// Khởi tạo Document
const doc = new Document({
    sections: [{
        properties: {},
        children: [
            // Tiêu đề lớn
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                children: [
                    new TextRun({
                        text: "BÁO CÁO CẤU TRÚC VÀ LUỒNG HOẠT ĐỘNG LEARNHUB",
                        bold: true,
                        size: 32, // 16pt
                        color: "1A365D", // Dark Blue
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 500 },
                children: [
                    new TextRun({
                        text: "Tài liệu hướng dẫn báo cáo & bảo vệ đồ án trước Hội đồng Giảng viên",
                        italic: true,
                        size: 24, // 12pt
                        color: "4A5568", // Gray
                        font: "Arial"
                    })
                ]
            }),

            // PHẦN 1
            new Paragraph({
                spacing: { before: 400, after: 200 },
                children: [
                    new TextRun({
                        text: "PHẦN 1: LUỒNG KHỞI CHẠY HỆ THỐNG (STARTUP FLOW)",
                        bold: true,
                        size: 28, // 14pt
                        color: "2B6CB0",
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "Luồng khởi chạy hệ thống tương tự như quá trình mở cửa một cửa hàng và chuẩn bị mọi thứ sẵn sàng để đón khách vào học tập. Toàn bộ chu trình được thực hiện tuần tự như sau:",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),

            // Mục con 1.1
            new Paragraph({
                spacing: { before: 200, after: 100 },
                children: [
                    new TextRun({
                        text: "1.1 Phía Client (Giao diện người dùng React SPA)",
                        bold: true,
                        size: 24,
                        color: "2D3748",
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 150 },
                bullet: { level: 0 },
                children: [
                    new TextRun({
                        text: "Bước 1 - index.html (Khung xương): ",
                        bold: true,
                        size: 24,
                        font: "Arial"
                    }),
                    new TextRun({
                        text: "Trình duyệt tải trang web lên, thực chất ban đầu chỉ có duy nhất một thẻ rỗng <div id=\"root\"></div> làm nơi nhúng toàn bộ mã nguồn React và một thẻ script gọi file main.jsx.",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 150 },
                bullet: { level: 0 },
                children: [
                    new TextRun({
                        text: "Bước 2 - main.jsx (Bấm nút khởi động): ",
                        bold: true,
                        size: 24,
                        font: "Arial"
                    }),
                    new TextRun({
                        text: "Nạp toàn bộ các file định dạng CSS toàn cục (index.css, App.css), tìm thẻ div có id root ở trên và nhúng toàn bộ React DOM vào đó, đồng thời triệu gọi file App.jsx khởi động.",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 150 },
                bullet: { level: 0 },
                children: [
                    new TextRun({
                        text: "Bước 3 - App.jsx (Tổng đài phân luồng): ",
                        bold: true,
                        size: 24,
                        font: "Arial"
                    }),
                    new TextRun({
                        text: "Lồng các trạng thái toàn cục gồm AuthProvider (đăng nhập) và ToastProvider (thông báo nhanh). Sau đó cấu hình danh sách đường dẫn trang (Route) để chỉ định chính xác file giao diện hiển thị cho từng URL (ví dụ: /login, /pho-thong, /practice...).",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                bullet: { level: 0 },
                children: [
                    new TextRun({
                        text: "Bước 4 - AuthContext.jsx (Khôi phục phiên làm việc): ",
                        bold: true,
                        size: 24,
                        font: "Arial"
                    }),
                    new TextRun({
                        text: "Hàm useEffect tự động chạy ngầm gửi một request POST lên /api/auth/refresh để kiểm tra xem cookie trình duyệt có lưu Refresh Token cũ không. Nếu có, hệ thống tự động thiết lập trạng thái đã đăng nhập và khôi phục thông tin tài khoản cho học sinh một cách mượt mà.",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),

            // Mục con 1.2
            new Paragraph({
                spacing: { before: 200, after: 100 },
                children: [
                    new TextRun({
                        text: "1.2 Phía Server (Bộ não hoạt động Express & Node.js)",
                        bold: true,
                        size: 24,
                        color: "2D3748",
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 150 },
                bullet: { level: 0 },
                children: [
                    new TextRun({
                        text: "Khởi động từ file app.js: ",
                        bold: true,
                        size: 24,
                        font: "Arial"
                    }),
                    new TextRun({
                        text: "Kích hoạt ứng dụng Express, nạp các middleware bảo mật cơ bản như CORS, Cookie Parser để đọc cookie, và JSON Parser để tiếp nhận các gói tin.",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 150 },
                bullet: { level: 0 },
                children: [
                    new TextRun({
                        text: "Định tuyến Router & Database (db.js): ",
                        bold: true,
                        size: 24,
                        font: "Arial"
                    }),
                    new TextRun({
                        text: "Đăng ký toàn bộ các API Route có tiền tố /api và kết nối thành công tới Database PostgreSQL thông qua Pool kết nối. Lắng nghe yêu cầu tại Port 5000.",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),

            // PHẦN 2
            new Paragraph({
                spacing: { before: 400, after: 200 },
                children: [
                    new TextRun({
                        text: "PHẦN 2: LUỒNG HOẠT ĐỘNG KHI CÓ TƯƠNG TÁC (RUNTIME FLOW)",
                        bold: true,
                        size: 28,
                        color: "2B6CB0",
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "Ví dụ trực quan: Học sinh bấm chọn học môn \"Toán Lớp 5\" trên màn hình giao diện. Tiến trình đi và về của dữ liệu được mô tả chi tiết qua 10 bước sau:",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),

            // 10 bước tương tác
            ...[
                { num: "1", label: "Học sinh bấm chọn nút \"Lớp 5\" trên màn hình để học bài học phổ thông." },
                { num: "2", label: "Trang giao diện SubjectList.jsx được kích hoạt render. Hàm tự khởi chạy useEffect bên trong nó lập tức được gọi để chuẩn bị tải dữ liệu." },
                { num: "3", label: "Hàm này gọi tệp cấu hình Axios (axiosInstance.js) gửi yêu cầu HTTP lấy dữ liệu." },
                { num: "4", label: "Shipper Axios đóng gói và chuyển phát nhanh yêu cầu GET /api/subjects?grade=lop-5 qua môi trường mạng tới Port 5000 của Server." },
                { num: "5", label: "Express Backend nhận yêu cầu, phân luồng qua route định tuyến subjectRoutes.js và chuyển giao cho subjectController.js xử lý." },
                { num: "6", label: "subjectController.js thực hiện gọi hàm kết nối Postgres (db.js) và thực thi câu lệnh SQL: SELECT * FROM subjects WHERE grade_id = ..." },
                { num: "7", label: "PostgreSQL Database tìm kiếm bản ghi trong bảng dữ liệu, trả về danh sách môn học của Lớp 5 cho Server." },
                { num: "8", label: "Server nhận mảng dữ liệu, đóng gói định dạng JSON và gửi phản hồi trạng thái HTTP 200 OK quay lại cho Client." },
                { num: "9", label: "Axios ở Client nhận gói tin JSON, tự động bóc tách thành Array Javascript sạch sẽ rồi giao cho hàm setSubjects(data) cập nhật lại trạng thái (React State)." },
                { num: "10", label: "React phát hiện biến trạng thái thay đổi -> Tự động kích hoạt cơ chế Vẽ lại màn hình (Re-render), hiển thị biểu tượng môn Toán Lớp 5 mượt mà lên giao diện cho học sinh học." }
            ].map(step => new Paragraph({
                spacing: { after: 150 },
                indent: { left: 360 },
                children: [
                    new TextRun({
                        text: `Bước ${step.num}: `,
                        bold: true,
                        size: 24,
                        color: "2D3748",
                        font: "Arial"
                    }),
                    new TextRun({
                        text: step.label,
                        size: 24,
                        font: "Arial"
                    })
                ]
            })),

            // PHẦN 3
            new Paragraph({
                spacing: { before: 400, after: 200 },
                children: [
                    new TextRun({
                        text: "PHẦN 3: BÀI PHÁT BIỂU MẪU ĐỂ GIẢI TRÌNH TRƯỚC GIẢNG VIÊN",
                        bold: true,
                        size: 28,
                        color: "2B6CB0",
                        font: "Arial"
                    })
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: "Đây là bài nói mẫu được biên soạn ngắn gọn, chuyên nghiệp giúp bạn tự tin trình bày trôi chảy trước Hội đồng Giảng viên phản biện:",
                        size: 24,
                        font: "Arial"
                    })
                ]
            }),

            // Khung trích dẫn bài nói
            new Paragraph({
                spacing: { before: 150, after: 150, left: 300, right: 300 },
                alignment: AlignmentType.JUSTIFY,
                children: [
                    new TextRun({
                        text: "\"Kính thưa Thầy/Cô và Hội đồng chấm đồ án, hệ thống LearnHub được em xây dựng và tối ưu theo kiến trúc hướng sự kiện (Event-Driven) và bất đồng bộ (Asynchronous) nhằm mang lại trải nghiệm tối ưu nhất cho học viên.\n\n" +
                              "Mọi hoạt động bắt đầu từ Client, nơi trình duyệt tải file index.html rỗng làm khung xương rồi kích hoạt file main.jsx để render toàn bộ mã nguồn React DOM. Tiếp đó, App.jsx đóng vai trò trung tâm để cấu hình định tuyến Router. Khi học sinh tương tác trên giao diện, các component của React sẽ phát sinh yêu cầu dữ liệu gửi đi thông qua thư viện Axios Client.\n\n" +
                              "Axios đóng vai trò như shipper chuyển yêu cầu dưới dạng gói tin REST API tới các Express Routes trên Server. Tại đây, lớp Controllers sẽ chịu trách nhiệm phân tích nghiệp vụ, thực hiện truy vấn cơ sở dữ liệu PostgreSQL qua bộ Pool kết nối tập trung, định dạng kết quả về dạng chuỗi JSON thô và gửi trả về Client. Nhờ cơ chế quản lý trạng thái tự động của React State, giao diện người dùng sẽ lập tức tự cập nhật và vẽ lại phần nội dung thay đổi mà không hề phải tải lại hay làm mới toàn bộ trang web. Cơ chế này giúp LearnHub hoạt động nhanh, bảo mật và tiết kiệm băng thông tối đa.\"\n\n" +
                              "Em xin chân thành cảm ơn Thầy/Cô đã lắng nghe!\"",
                        italic: true,
                        size: 24,
                        color: "2D3748",
                        font: "Arial"
                    })
                ]
            }),

            // Lời chúc cuối
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [
                    new TextRun({
                        text: "--- Chúc bạn có một buổi bảo vệ đồ án thành công rực rỡ! ---",
                        bold: true,
                        size: 24,
                        color: "2B6CB0",
                        font: "Arial"
                    })
                ]
            })
        ]
    }]
});

// Biên dịch và xuất file docx
const outputFilePath = path.join(__dirname, "..", "Luong_Hoat_Dong_LearnHub.docx");
Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outputFilePath, buffer);
    console.log(`[Thành công] Đã tạo file Word tại: ${outputFilePath}`);
}).catch((err) => {
    console.error("Lỗi khi tạo file docx:", err);
});
