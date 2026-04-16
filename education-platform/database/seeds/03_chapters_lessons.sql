-- ============================================================
-- CHƯƠNG TRÌNH LỚP 1 - TOÁN (grade_subject_id = 1)
-- ============================================================

INSERT INTO chapters (grade_subject_id, title, slug, description, sort_order) VALUES
(1, 'Chương 1: Các số đến 10, phép cộng và phép trừ trong phạm vi 10', 'chuong-1-cac-so-den-10', 'Học đếm, nhận biết các số từ 0 đến 10 và phép tính cơ bản', 1),
(1, 'Chương 2: Phép cộng và phép trừ trong phạm vi 20', 'chuong-2-phep-tinh-pham-vi-20', 'Thực hiện phép cộng, trừ với kết quả trong phạm vi 20', 2),
(1, 'Chương 3: Các số đến 100', 'chuong-3-cac-so-den-100', 'Đọc, viết và so sánh các số từ 0 đến 100', 3),
(1, 'Chương 4: Phép cộng và phép trừ trong phạm vi 100 (không nhớ)', 'chuong-4-phep-tinh-pham-vi-100', 'Cộng trừ các số có 2 chữ số không nhớ', 4),
(1, 'Chương 5: Đo lường và hình học cơ bản', 'chuong-5-do-luong-hinh-hoc', 'Đo độ dài, nhận biết hình vuông, hình tròn, hình tam giác', 5);

-- CHƯƠNG 1 - BÀI HỌC (lesson: chapter_id = 1)
INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order) VALUES
(1, 'Bài 1: Các số 1, 2, 3', 'bai-1-cac-so-1-2-3', 'theory',
'<h2>Các số 1, 2, 3</h2>
<p>Chúng ta học đếm các số đầu tiên: <strong>1, 2, 3</strong>.</p>
<h3>Nhận biết số</h3>
<ul>
  <li>🍎 = <strong>1</strong> (một)</li>
  <li>🍎🍎 = <strong>2</strong> (hai)</li>
  <li>🍎🍎🍎 = <strong>3</strong> (ba)</li>
</ul>
<h3>Cách viết</h3>
<p>Tập viết các chữ số: <strong>1</strong>, <strong>2</strong>, <strong>3</strong></p>', 1),

(1, 'Bài 2: Các số 4, 5, 6', 'bai-2-cac-so-4-5-6', 'theory',
'<h2>Các số 4, 5, 6</h2>
<p>Tiếp tục học các số: <strong>4, 5, 6</strong>.</p>
<h3>Nhận biết số</h3>
<ul>
  <li>🌟🌟🌟🌟 = <strong>4</strong> (bốn)</li>
  <li>🌟🌟🌟🌟🌟 = <strong>5</strong> (năm)</li>
  <li>🌟🌟🌟🌟🌟🌟 = <strong>6</strong> (sáu)</li>
</ul>
<h3>So sánh</h3>
<p>4 &lt; 5 &lt; 6 (bốn nhỏ hơn năm, năm nhỏ hơn sáu)</p>', 2),

(1, 'Bài 3: Các số 7, 8, 9, 10', 'bai-3-cac-so-7-8-9-10', 'theory',
'<h2>Các số 7, 8, 9, 10</h2>
<p>Học các số từ <strong>7 đến 10</strong>.</p>
<h3>Đếm đến 10</h3>
<p>1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → <strong>10</strong></p>
<h3>Số 10</h3>
<p>Số 10 gồm <strong>1 chục</strong> và <strong>0 đơn vị</strong>.</p>', 3),

(1, 'Bài 4: Phép cộng trong phạm vi 10', 'bai-4-phep-cong-pham-vi-10', 'theory',
'<h2>Phép cộng trong phạm vi 10</h2>
<p>Phép cộng là gộp các số lại với nhau.</p>
<h3>Ví dụ</h3>
<ul>
  <li>3 + 2 = <strong>5</strong> (ba cộng hai bằng năm)</li>
  <li>4 + 4 = <strong>8</strong> (bốn cộng bốn bằng tám)</li>
  <li>6 + 4 = <strong>10</strong> (sáu cộng bốn bằng mười)</li>
</ul>
<h3>Ghi nhớ</h3>
<p>Kết quả phép cộng luôn <strong>lớn hơn hoặc bằng</strong> các số hạng.</p>', 4),

(1, 'Bài 5: Phép trừ trong phạm vi 10', 'bai-5-phep-tru-pham-vi-10', 'theory',
'<h2>Phép trừ trong phạm vi 10</h2>
<p>Phép trừ là lấy đi một phần từ một số.</p>
<h3>Ví dụ</h3>
<ul>
  <li>8 - 3 = <strong>5</strong> (tám trừ ba bằng năm)</li>
  <li>10 - 4 = <strong>6</strong> (mười trừ bốn bằng sáu)</li>
  <li>7 - 7 = <strong>0</strong> (bảy trừ bảy bằng không)</li>
</ul>
<h3>Mối quan hệ cộng - trừ</h3>
<p>Nếu 3 + 2 = 5, thì 5 - 2 = 3 và 5 - 3 = 2</p>', 5);

-- CHƯƠNG 2 - BÀI HỌC (chapter_id = 2)
INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order) VALUES
(2, 'Bài 1: Phép cộng có kết quả đến 20', 'bai-1-phep-cong-den-20', 'theory',
'<h2>Phép cộng có kết quả đến 20</h2>
<p>Học cộng các số với kết quả từ 11 đến 20.</p>
<h3>Ví dụ</h3>
<ul>
  <li>9 + 5 = <strong>14</strong></li>
  <li>8 + 7 = <strong>15</strong></li>
  <li>10 + 8 = <strong>18</strong></li>
</ul>', 1),

(2, 'Bài 2: Phép trừ trong phạm vi 20', 'bai-2-phep-tru-pham-vi-20', 'theory',
'<h2>Phép trừ trong phạm vi 20</h2>
<p>Học trừ các số trong phạm vi 20.</p>
<h3>Ví dụ</h3>
<ul>
  <li>15 - 6 = <strong>9</strong></li>
  <li>18 - 9 = <strong>9</strong></li>
  <li>20 - 5 = <strong>15</strong></li>
</ul>', 2);

-- CHƯƠNG 3 - BÀI HỌC (chapter_id = 3)
INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order) VALUES
(3, 'Bài 1: Các số từ 10 đến 50', 'bai-1-cac-so-tu-10-den-50', 'theory',
'<h2>Các số từ 10 đến 50</h2>
<p>Học đọc, viết và đếm các số từ 10 đến 50.</p>
<h3>Chục và đơn vị</h3>
<p>Số <strong>35</strong> gồm: 3 chục và 5 đơn vị → đọc là "ba mươi lăm"</p>', 1),

(3, 'Bài 2: Các số từ 50 đến 100', 'bai-2-cac-so-tu-50-den-100', 'theory',
'<h2>Các số từ 50 đến 100</h2>
<p>Học đọc, viết và so sánh các số từ 50 đến 100.</p>
<h3>Ví dụ</h3>
<p>Số <strong>78</strong> gồm: 7 chục và 8 đơn vị → đọc là "bảy mươi tám"</p>', 2);

-- CHƯƠNG 4 - BÀI HỌC (chapter_id = 4)
INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order) VALUES
(4, 'Bài 1: Cộng các số có 2 chữ số (không nhớ)', 'bai-1-cong-2-chu-so', 'theory',
'<h2>Cộng các số có 2 chữ số (không nhớ)</h2>
<p>Thực hiện cộng theo cột: cộng đơn vị với đơn vị, chục với chục.</p>
<h3>Ví dụ</h3>
<pre>  24
+ 35
----
  59</pre>
<p>4 + 5 = 9 (đơn vị), 2 + 3 = 5 (chục) → kết quả: 59</p>', 1),

(4, 'Bài 2: Trừ các số có 2 chữ số (không nhớ)', 'bai-2-tru-2-chu-so', 'theory',
'<h2>Trừ các số có 2 chữ số (không nhớ)</h2>
<p>Thực hiện trừ theo cột: trừ đơn vị với đơn vị, chục với chục.</p>
<h3>Ví dụ</h3>
<pre>  68
- 24
----
  44</pre>
<p>8 - 4 = 4 (đơn vị), 6 - 2 = 4 (chục) → kết quả: 44</p>', 2);

-- CHƯƠNG 5 - BÀI HỌC (chapter_id = 5)
INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order) VALUES
(5, 'Bài 1: Đo độ dài bằng thước', 'bai-1-do-do-dai', 'theory',
'<h2>Đo độ dài bằng thước</h2>
<p>Đơn vị đo độ dài cơ bản là <strong>xăng-ti-mét (cm)</strong>.</p>
<h3>Cách đo</h3>
<ol>
  <li>Đặt đầu thước trùng với đầu vật cần đo</li>
  <li>Đọc số ở đầu kia của vật</li>
</ol>', 1),

(5, 'Bài 2: Nhận biết hình học cơ bản', 'bai-2-nhan-biet-hinh-hoc', 'theory',
'<h2>Nhận biết hình học cơ bản</h2>
<p>Các hình cơ bản trong toán tiểu học:</p>
<ul>
  <li>⬜ <strong>Hình vuông</strong>: 4 cạnh bằng nhau, 4 góc vuông</li>
  <li>⬛ <strong>Hình chữ nhật</strong>: 2 cạnh dài bằng nhau, 2 cạnh ngắn bằng nhau</li>
  <li>🔺 <strong>Hình tam giác</strong>: 3 cạnh, 3 góc</li>
  <li>⭕ <strong>Hình tròn</strong>: không có cạnh, không có góc</li>
</ul>', 2);
