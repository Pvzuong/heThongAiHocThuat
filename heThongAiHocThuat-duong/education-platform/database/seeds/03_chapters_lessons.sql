-- ============================================================
-- TOÁN LỚP 6 (grade_subject_id = 1)
-- Theo chương trình SGK "Kết nối tri thức với cuộc sống"
-- ============================================================

INSERT INTO chapters (grade_subject_id, title, slug, description, sort_order) VALUES
(1, 'Chương I: Số Tự Nhiên',         'toan6-c1-so-tu-nhien',        'Hệ thống số tự nhiên, lũy thừa và tính chia hết',        1),
(1, 'Chương II: Số Nguyên',           'toan6-c2-so-nguyen',          'Số nguyên âm, dương và các phép tính với số nguyên',     2),
(1, 'Chương III: Phân Số và Số Thập Phân', 'toan6-c3-phan-so',       'Phân số, rút gọn, quy đồng và số thập phân',            3),
(1, 'Chương IV: Hình Học Phẳng',      'toan6-c4-hinh-hoc',           'Điểm, đường thẳng, góc, tam giác và hình tứ giác',       4);

-- ── CHƯƠNG I: SỐ TỰ NHIÊN ──────────────────────────────────

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 1: Tập hợp và phần tử', 'toan6-c1-b1-tap-hop', 'theory',
'<h2>Tập hợp và phần tử của tập hợp</h2>
<p>Trong toán học, <strong>tập hợp</strong> là khái niệm cơ bản dùng để chỉ một nhóm các đối tượng (gọi là <strong>phần tử</strong>) có chung một đặc điểm nào đó.</p>

<h3>Cách viết tập hợp</h3>
<p>Có hai cách viết tập hợp:</p>
<ul>
  <li><strong>Liệt kê phần tử:</strong> A = {1; 2; 3; 4; 5}</li>
  <li><strong>Chỉ ra tính chất đặc trưng:</strong> A = {x ∈ ℕ | x &lt; 6}</li>
</ul>

<h3>Ký hiệu</h3>
<ul>
  <li>∈ : "thuộc" — ví dụ: 3 ∈ A (3 thuộc tập A)</li>
  <li>∉ : "không thuộc" — ví dụ: 6 ∉ A (6 không thuộc tập A)</li>
</ul>

<h3>Ví dụ</h3>
<p>Tập hợp các học sinh lớp 6A: B = {An, Bình, Chi, Dũng, ...}</p>
<ul>
  <li>An ∈ B (An thuộc lớp 6A)</li>
  <li>Hoa ∉ B (Hoa không thuộc lớp 6A)</li>
</ul>

<h3>Số phần tử của tập hợp</h3>
<p>Tập hợp A = {1; 2; 3; 4; 5} có <strong>5 phần tử</strong>.</p>
<p>Tập hợp rỗng (∅) là tập không có phần tử nào.</p>

<h3>Ghi nhớ</h3>
<p>✦ Mỗi phần tử chỉ được liệt kê một lần trong tập hợp.<br>✦ Thứ tự liệt kê các phần tử không quan trọng.</p>', 1
FROM chapters c WHERE c.slug = 'toan6-c1-so-tu-nhien';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 2: Phép tính lũy thừa', 'toan6-c1-b2-luy-thua', 'theory',
'<h2>Lũy thừa với số mũ tự nhiên</h2>
<p><strong>Lũy thừa</strong> bậc n của số tự nhiên a là tích của n thừa số a:</p>
<p style="text-align:center; font-size:1.1em;"><strong>aⁿ = a × a × a × ... × a (n thừa số)</strong></p>

<h3>Ký hiệu và đọc</h3>
<ul>
  <li>aⁿ: đọc là "a mũ n" hoặc "a lũy thừa n"</li>
  <li>a: cơ số</li>
  <li>n: số mũ</li>
</ul>

<h3>Ví dụ tính lũy thừa</h3>
<ul>
  <li>2³ = 2 × 2 × 2 = <strong>8</strong></li>
  <li>3⁴ = 3 × 3 × 3 × 3 = <strong>81</strong></li>
  <li>5² = 5 × 5 = <strong>25</strong></li>
  <li>10³ = 10 × 10 × 10 = <strong>1000</strong></li>
</ul>

<h3>Quy ước đặc biệt</h3>
<ul>
  <li>a¹ = a (mọi số mũ 1 bằng chính số đó)</li>
  <li>a⁰ = 1 với a ≠ 0</li>
</ul>

<h3>Nhân và chia hai lũy thừa cùng cơ số</h3>
<ul>
  <li>aᵐ × aⁿ = aᵐ⁺ⁿ &nbsp;(ví dụ: 2³ × 2⁴ = 2⁷)</li>
  <li>aᵐ ÷ aⁿ = aᵐ⁻ⁿ (m ≥ n) &nbsp;(ví dụ: 2⁵ ÷ 2² = 2³)</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Khi nhân lũy thừa cùng cơ số: <strong>giữ nguyên cơ số, cộng số mũ</strong>.<br>✦ Khi chia lũy thừa cùng cơ số: <strong>giữ nguyên cơ số, trừ số mũ</strong>.</p>', 2
FROM chapters c WHERE c.slug = 'toan6-c1-so-tu-nhien';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 3: Chia hết và dấu hiệu chia hết', 'toan6-c1-b3-chia-het', 'theory',
'<h2>Quan hệ chia hết và dấu hiệu chia hết</h2>

<h3>Quan hệ chia hết</h3>
<p>Số tự nhiên a <strong>chia hết</strong> cho số tự nhiên b (b ≠ 0) khi phép chia a : b có số dư bằng 0.</p>
<p>Ký hiệu: a ⋮ b (đọc là "a chia hết cho b")</p>

<h3>Dấu hiệu chia hết cho 2</h3>
<p>Một số chia hết cho 2 khi <strong>chữ số tận cùng là 0, 2, 4, 6, 8</strong> (số chẵn).</p>
<ul>
  <li>124 ⋮ 2 ✓ (tận cùng là 4)</li>
  <li>137 không ⋮ 2 ✗ (tận cùng là 7)</li>
</ul>

<h3>Dấu hiệu chia hết cho 3</h3>
<p>Một số chia hết cho 3 khi <strong>tổng các chữ số chia hết cho 3</strong>.</p>
<ul>
  <li>123: tổng = 1+2+3 = 6 ⋮ 3 → 123 ⋮ 3 ✓</li>
  <li>145: tổng = 1+4+5 = 10, 10 không ⋮ 3 → 145 không ⋮ 3 ✗</li>
</ul>

<h3>Dấu hiệu chia hết cho 5</h3>
<p>Một số chia hết cho 5 khi <strong>chữ số tận cùng là 0 hoặc 5</strong>.</p>
<ul>
  <li>135 ⋮ 5 ✓ (tận cùng là 5)</li>
  <li>240 ⋮ 5 ✓ (tận cùng là 0)</li>
</ul>

<h3>Dấu hiệu chia hết cho 9</h3>
<p>Một số chia hết cho 9 khi <strong>tổng các chữ số chia hết cho 9</strong>.</p>
<ul>
  <li>729: tổng = 7+2+9 = 18 ⋮ 9 → 729 ⋮ 9 ✓</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ ⋮2: chữ số cuối chẵn &nbsp;|&nbsp; ✦ ⋮5: cuối là 0 hoặc 5<br>✦ ⋮3: tổng chữ số ⋮3 &nbsp;|&nbsp; ✦ ⋮9: tổng chữ số ⋮9</p>', 3
FROM chapters c WHERE c.slug = 'toan6-c1-so-tu-nhien';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 4: Số nguyên tố và hợp số', 'toan6-c1-b4-so-nguyen-to', 'theory',
'<h2>Số nguyên tố và hợp số</h2>

<h3>Định nghĩa</h3>
<ul>
  <li><strong>Số nguyên tố</strong>: là số tự nhiên lớn hơn 1, chỉ chia hết cho 1 và chính nó.<br>Ví dụ: 2, 3, 5, 7, 11, 13, 17, 19, 23, ...</li>
  <li><strong>Hợp số</strong>: là số tự nhiên lớn hơn 1, có ít nhất 3 ước số.<br>Ví dụ: 4, 6, 8, 9, 10, 12, ...</li>
</ul>

<h3>Lưu ý</h3>
<ul>
  <li>Số 1 không phải số nguyên tố, không phải hợp số.</li>
  <li>Số 2 là số nguyên tố <strong>chẵn duy nhất</strong>.</li>
</ul>

<h3>Phân tích số ra thừa số nguyên tố</h3>
<p>Mọi hợp số đều có thể viết thành tích các số nguyên tố:</p>
<ul>
  <li>12 = 2² × 3</li>
  <li>60 = 2² × 3 × 5</li>
  <li>72 = 2³ × 3²</li>
</ul>

<h3>Ước chung lớn nhất (ƯCLN) và Bội chung nhỏ nhất (BCNN)</h3>
<p><strong>ƯCLN(12, 18):</strong></p>
<ul>
  <li>12 = 2² × 3</li>
  <li>18 = 2 × 3²</li>
  <li>ƯCLN = 2¹ × 3¹ = 6</li>
</ul>
<p><strong>BCNN(12, 18):</strong></p>
<ul>
  <li>BCNN = 2² × 3² = 36</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ ƯCLN: lấy thừa số chung với số mũ <strong>nhỏ nhất</strong>.<br>✦ BCNN: lấy tất cả thừa số với số mũ <strong>lớn nhất</strong>.</p>', 4
FROM chapters c WHERE c.slug = 'toan6-c1-so-tu-nhien';

-- ── CHƯƠNG II: SỐ NGUYÊN ──────────────────────────────────

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 1: Số nguyên âm và trục số', 'toan6-c2-b1-so-nguyen-am', 'theory',
'<h2>Số nguyên âm và trục số</h2>

<h3>Số nguyên âm trong thực tế</h3>
<p>Số nguyên âm xuất hiện trong nhiều tình huống thực tế:</p>
<ul>
  <li>Nhiệt độ dưới 0°C: −5°C (âm 5 độ C)</li>
  <li>Độ sâu dưới mặt nước: −10m (dưới 10m)</li>
  <li>Nợ tiền: −50.000đ (nợ 50 nghìn)</li>
</ul>

<h3>Tập hợp số nguyên ℤ</h3>
<p><strong>ℤ = {...; −3; −2; −1; 0; 1; 2; 3; ...}</strong></p>
<ul>
  <li>Số nguyên dương: 1, 2, 3, ... (cũng là số tự nhiên &gt; 0)</li>
  <li>Số nguyên âm: −1, −2, −3, ...</li>
  <li>Số 0: không dương, không âm</li>
</ul>

<h3>Trục số</h3>
<pre>  ← ─────┼───┼───┼───┼───┼───┼───┼───── →
        -3  -2  -1   0   1   2   3</pre>
<ul>
  <li>Trục số có gốc là 0, chiều dương là chiều phải.</li>
  <li>Số nguyên nào ở bên phải thì <strong>lớn hơn</strong>.</li>
</ul>

<h3>Giá trị tuyệt đối</h3>
<p>Giá trị tuyệt đối của số nguyên a, ký hiệu |a|, là khoảng cách từ điểm a đến gốc 0 trên trục số.</p>
<ul>
  <li>|5| = 5</li>
  <li>|−5| = 5</li>
  <li>|0| = 0</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ ℕ ⊂ ℤ: mọi số tự nhiên đều là số nguyên.<br>✦ Số đối của a là −a; số đối của −5 là 5.</p>', 1
FROM chapters c WHERE c.slug = 'toan6-c2-so-nguyen';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 2: Cộng và trừ số nguyên', 'toan6-c2-b2-cong-tru', 'theory',
'<h2>Phép cộng và phép trừ số nguyên</h2>

<h3>Cộng hai số nguyên cùng dấu</h3>
<p>Cộng hai số nguyên <strong>cùng dấu</strong>: cộng hai giá trị tuyệt đối rồi đặt dấu chung.</p>
<ul>
  <li>(+3) + (+5) = +(3+5) = <strong>+8</strong></li>
  <li>(−3) + (−5) = −(3+5) = <strong>−8</strong></li>
</ul>

<h3>Cộng hai số nguyên khác dấu</h3>
<p>Cộng hai số nguyên <strong>khác dấu</strong>: lấy giá trị tuyệt đối lớn trừ nhỏ, đặt dấu của số có |  | lớn hơn.</p>
<ul>
  <li>(+7) + (−4) = +(7−4) = <strong>+3</strong> &nbsp;(vì |+7| &gt; |−4|)</li>
  <li>(+4) + (−7) = −(7−4) = <strong>−3</strong> &nbsp;(vì |−7| &gt; |+4|)</li>
  <li>5 + (−5) = <strong>0</strong> &nbsp;(hai số đối nhau)</li>
</ul>

<h3>Phép trừ số nguyên</h3>
<p><strong>Trừ số nguyên = cộng với số đối của nó</strong></p>
<p style="text-align:center;"><strong>a − b = a + (−b)</strong></p>
<ul>
  <li>5 − 8 = 5 + (−8) = <strong>−3</strong></li>
  <li>−3 − (−7) = −3 + 7 = <strong>4</strong></li>
  <li>−4 − 5 = −4 + (−5) = <strong>−9</strong></li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ a + (−a) = 0 &nbsp;(cộng số đối = 0)<br>✦ a − b = a + (−b) &nbsp;(trừ = cộng số đối)</p>', 2
FROM chapters c WHERE c.slug = 'toan6-c2-so-nguyen';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 3: Nhân số nguyên', 'toan6-c2-b3-nhan-chia', 'theory',
'<h2>Phép nhân số nguyên</h2>

<h3>Quy tắc dấu khi nhân</h3>
<ul>
  <li>(+) × (+) = <strong>(+)</strong> &nbsp;→ dương × dương = dương</li>
  <li>(−) × (−) = <strong>(+)</strong> &nbsp;→ âm × âm = dương</li>
  <li>(+) × (−) = <strong>(−)</strong> &nbsp;→ dương × âm = âm</li>
  <li>(−) × (+) = <strong>(−)</strong> &nbsp;→ âm × dương = âm</li>
</ul>

<h3>Ví dụ tính</h3>
<ul>
  <li>3 × 4 = <strong>12</strong></li>
  <li>(−3) × 4 = <strong>−12</strong></li>
  <li>3 × (−4) = <strong>−12</strong></li>
  <li>(−3) × (−4) = <strong>12</strong></li>
</ul>

<h3>Tích nhiều số nguyên âm</h3>
<ul>
  <li>Tích chứa <strong>số chẵn</strong> thừa số âm → kết quả <strong>dương</strong></li>
  <li>Tích chứa <strong>số lẻ</strong> thừa số âm → kết quả <strong>âm</strong></li>
</ul>
<p>Ví dụ: (−2) × (−3) × (−1) = −6 (có 3 thừa số âm, lẻ → âm)</p>

<h3>Phép chia số nguyên</h3>
<p>Quy tắc dấu giống nhân:</p>
<ul>
  <li>(−12) ÷ (−3) = <strong>4</strong> (âm ÷ âm = dương)</li>
  <li>(−12) ÷ 3 = <strong>−4</strong> (âm ÷ dương = âm)</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Hai số nguyên <strong>cùng dấu</strong> → tích/thương <strong>dương</strong>.<br>✦ Hai số nguyên <strong>khác dấu</strong> → tích/thương <strong>âm</strong>.</p>', 3
FROM chapters c WHERE c.slug = 'toan6-c2-so-nguyen';

-- ── CHƯƠNG III: PHÂN SỐ ──────────────────────────────────

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 1: Phân số và phân số bằng nhau', 'toan6-c3-b1-phan-so', 'theory',
'<h2>Phân số và phân số bằng nhau</h2>

<h3>Phân số</h3>
<p>Phân số có dạng <strong>a/b</strong> trong đó:</p>
<ul>
  <li>a: tử số (số nguyên)</li>
  <li>b: mẫu số (số nguyên, b ≠ 0)</li>
</ul>
<p>Ví dụ: 2/3, −5/7, 3/4, −1/2</p>

<h3>Phân số bằng nhau</h3>
<p><strong>a/b = c/d</strong> khi và chỉ khi <strong>a × d = b × c</strong></p>
<ul>
  <li>1/2 = 2/4 vì 1 × 4 = 2 × 2 = 4 ✓</li>
  <li>2/3 = 6/9 vì 2 × 9 = 3 × 6 = 18 ✓</li>
</ul>

<h3>Rút gọn phân số</h3>
<p>Chia cả tử và mẫu cho ƯCLN của chúng:</p>
<ul>
  <li>12/18: ƯCLN(12,18) = 6 → 12/18 = (12÷6)/(18÷6) = <strong>2/3</strong></li>
  <li>−15/25: ƯCLN(15,25) = 5 → −15/25 = <strong>−3/5</strong></li>
</ul>

<h3>Quy đồng mẫu số</h3>
<p>Đưa các phân số về cùng mẫu số (dùng BCNN):</p>
<ul>
  <li>Quy đồng 1/3 và 1/4: BCNN(3,4) = 12</li>
  <li>1/3 = 4/12 &nbsp;|&nbsp; 1/4 = 3/12</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Phân số tối giản khi ƯCLN(tử, mẫu) = 1.<br>✦ Mẫu số luôn phải <strong>dương</strong> (nếu mẫu âm, nhân cả tử mẫu với −1).</p>', 1
FROM chapters c WHERE c.slug = 'toan6-c3-phan-so';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 2: Phép cộng và trừ phân số', 'toan6-c3-b2-cong-phan-so', 'theory',
'<h2>Phép cộng và trừ phân số</h2>

<h3>Cộng, trừ phân số cùng mẫu</h3>
<p>Giữ nguyên mẫu, cộng (hoặc trừ) tử số:</p>
<p style="text-align:center;"><strong>a/c + b/c = (a+b)/c</strong></p>
<ul>
  <li>2/7 + 3/7 = (2+3)/7 = <strong>5/7</strong></li>
  <li>5/9 − 2/9 = (5−2)/9 = <strong>3/9 = 1/3</strong></li>
</ul>

<h3>Cộng, trừ phân số khác mẫu</h3>
<p><strong>Bước 1:</strong> Quy đồng mẫu (tìm BCNN của các mẫu)<br>
<strong>Bước 2:</strong> Cộng hoặc trừ tử, giữ mẫu chung</p>

<p>Ví dụ: 1/3 + 1/4</p>
<ul>
  <li>BCNN(3,4) = 12</li>
  <li>1/3 = 4/12; &nbsp; 1/4 = 3/12</li>
  <li>4/12 + 3/12 = <strong>7/12</strong></li>
</ul>

<p>Ví dụ: 3/4 − 2/3</p>
<ul>
  <li>BCNN(4,3) = 12</li>
  <li>3/4 = 9/12; &nbsp; 2/3 = 8/12</li>
  <li>9/12 − 8/12 = <strong>1/12</strong></li>
</ul>

<h3>Tính chất</h3>
<ul>
  <li>Giao hoán: a/b + c/d = c/d + a/b</li>
  <li>Kết hợp: (a/b + c/d) + e/f = a/b + (c/d + e/f)</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Luôn rút gọn kết quả về phân số tối giản.<br>✦ Với hỗn số: đổi sang phân số trước khi tính.</p>', 2
FROM chapters c WHERE c.slug = 'toan6-c3-phan-so';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 3: Nhân và chia phân số', 'toan6-c3-b3-nhan-phan-so', 'theory',
'<h2>Nhân và chia phân số</h2>

<h3>Nhân phân số</h3>
<p style="text-align:center;"><strong>(a/b) × (c/d) = (a×c)/(b×d)</strong></p>
<ul>
  <li>(2/3) × (3/4) = (2×3)/(3×4) = 6/12 = <strong>1/2</strong></li>
  <li>(−3/5) × (5/6) = (−3×5)/(5×6) = −15/30 = <strong>−1/2</strong></li>
</ul>

<h3>Phân số nghịch đảo</h3>
<p>Nghịch đảo của a/b là <strong>b/a</strong> (với a ≠ 0).</p>
<ul>
  <li>Nghịch đảo của 3/4 là 4/3</li>
  <li>Nghịch đảo của −2/5 là −5/2</li>
  <li>Nghịch đảo của 3 là 1/3</li>
</ul>

<h3>Chia phân số</h3>
<p><strong>Chia phân số = nhân với nghịch đảo:</strong></p>
<p style="text-align:center;"><strong>(a/b) ÷ (c/d) = (a/b) × (d/c)</strong></p>
<ul>
  <li>(2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = <strong>5/6</strong></li>
  <li>(3/4) ÷ 3 = (3/4) × (1/3) = 3/12 = <strong>1/4</strong></li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Nhân phân số: nhân tử với tử, mẫu với mẫu.<br>✦ Chia phân số: lật phân số sau, rồi nhân.<br>✦ Rút gọn chéo trước khi nhân để đơn giản hơn.</p>', 3
FROM chapters c WHERE c.slug = 'toan6-c3-phan-so';

-- ── CHƯƠNG IV: HÌNH HỌC PHẲNG ──────────────────────────────

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 1: Điểm, đường thẳng và đoạn thẳng', 'toan6-c4-b1-diem-duong', 'theory',
'<h2>Điểm, đường thẳng và đoạn thẳng</h2>

<h3>Điểm</h3>
<p>Điểm là khái niệm cơ bản, không định nghĩa. Ký hiệu: A, B, C, ... (chữ in hoa)</p>

<h3>Đường thẳng</h3>
<p>Đường thẳng không có điểm đầu, điểm cuối, kéo dài vô hạn về hai phía.</p>
<ul>
  <li>Ký hiệu: a, b, c, ... (chữ thường) hoặc qua 2 điểm: AB</li>
  <li>Qua một điểm có <strong>vô số</strong> đường thẳng.</li>
  <li>Qua hai điểm phân biệt có <strong>đúng một</strong> đường thẳng.</li>
</ul>

<h3>Ba vị trí của hai đường thẳng</h3>
<ul>
  <li>Cắt nhau: có đúng 1 điểm chung</li>
  <li>Song song: không có điểm chung (a // b)</li>
  <li>Trùng nhau: có vô số điểm chung</li>
</ul>

<h3>Đoạn thẳng</h3>
<p>Đoạn thẳng AB là phần đường thẳng giới hạn bởi hai điểm A và B (hai điểm đầu mút).</p>
<ul>
  <li>Độ dài đoạn thẳng: khoảng cách giữa hai điểm đầu mút</li>
  <li>Trung điểm M của AB: MA = MB = AB/2</li>
</ul>

<h3>Tia</h3>
<p>Tia Ox là một phần đường thẳng, có điểm đầu là O, kéo dài vô hạn về một phía.</p>

<h3>Ghi nhớ</h3>
<p>✦ Hai đường thẳng phân biệt: hoặc cắt nhau, hoặc song song.<br>✦ Điểm nằm giữa A và B: AB = AC + CB.</p>', 1
FROM chapters c WHERE c.slug = 'toan6-c4-hinh-hoc';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 2: Góc và đo góc', 'toan6-c4-b2-goc', 'theory',
'<h2>Góc và đo góc</h2>

<h3>Khái niệm góc</h3>
<p><strong>Góc</strong> là hình gồm hai tia chung gốc. Gốc chung gọi là <strong>đỉnh</strong>, hai tia là <strong>hai cạnh</strong> của góc.</p>
<p>Ký hiệu góc: ∠ABC, ∠B, hoặc góc B</p>

<h3>Đơn vị đo góc</h3>
<ul>
  <li>Đơn vị: <strong>độ (°)</strong>, phút ('), giây (</li>
  <li>1° = 60' &nbsp;|&nbsp; 1' = 60</li>
  <li>Góc bẹt: 180° &nbsp;|&nbsp; Góc tròn: 360°</li>
</ul>

<h3>Phân loại góc</h3>
<ul>
  <li><strong>Góc nhọn:</strong> 0° &lt; α &lt; 90°</li>
  <li><strong>Góc vuông:</strong> α = 90°</li>
  <li><strong>Góc tù:</strong> 90° &lt; α &lt; 180°</li>
  <li><strong>Góc bẹt:</strong> α = 180°</li>
</ul>

<h3>Hai góc bù nhau và phụ nhau</h3>
<ul>
  <li>Hai góc <strong>bù nhau</strong>: tổng bằng 180°</li>
  <li>Hai góc <strong>phụ nhau</strong>: tổng bằng 90°</li>
</ul>

<h3>Góc kề bù</h3>
<p>Hai góc kề bù là hai góc vừa kề nhau, vừa bù nhau (hai tia ngoài tạo thành đường thẳng).</p>

<h3>Ghi nhớ</h3>
<p>✦ Dùng thước đo góc (thước bán nguyệt) để đo góc.<br>✦ Tia phân giác chia góc thành 2 phần bằng nhau.</p>', 2
FROM chapters c WHERE c.slug = 'toan6-c4-hinh-hoc';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 3: Tam giác', 'toan6-c4-b3-tam-giac', 'theory',
'<h2>Tam giác</h2>

<h3>Định nghĩa</h3>
<p><strong>Tam giác ABC</strong> là hình gồm ba đoạn thẳng AB, BC, CA khi ba điểm A, B, C không thẳng hàng.</p>
<ul>
  <li>A, B, C: ba đỉnh</li>
  <li>AB, BC, CA: ba cạnh</li>
  <li>∠A, ∠B, ∠C: ba góc</li>
</ul>

<h3>Tổng ba góc của tam giác</h3>
<p style="text-align:center; font-size:1.1em;"><strong>∠A + ∠B + ∠C = 180°</strong></p>

<h3>Phân loại tam giác theo góc</h3>
<ul>
  <li><strong>Tam giác nhọn:</strong> ba góc đều nhọn (&lt;90°)</li>
  <li><strong>Tam giác vuông:</strong> có một góc bằng 90°</li>
  <li><strong>Tam giác tù:</strong> có một góc tù (&gt;90°)</li>
</ul>

<h3>Phân loại tam giác theo cạnh</h3>
<ul>
  <li><strong>Tam giác đều:</strong> ba cạnh bằng nhau, ba góc bằng 60°</li>
  <li><strong>Tam giác cân:</strong> hai cạnh bằng nhau</li>
  <li><strong>Tam giác vuông cân:</strong> vuông và cân</li>
</ul>

<h3>Bất đẳng thức tam giác</h3>
<p>Trong tam giác, mỗi cạnh nhỏ hơn tổng hai cạnh kia:</p>
<ul>
  <li>AB &lt; BC + CA</li>
  <li>BC &lt; AB + CA</li>
  <li>CA &lt; AB + BC</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Tổng ba góc trong tam giác luôn bằng 180°.<br>✦ Trong tam giác vuông, góc vuông đối diện cạnh huyền (cạnh dài nhất).</p>', 3
FROM chapters c WHERE c.slug = 'toan6-c4-hinh-hoc';


-- ============================================================
-- TOÁN LỚP 10 (grade_subject_id = 5)
-- Theo chương trình SGK "Kết nối tri thức với cuộc sống"
-- ============================================================

INSERT INTO chapters (grade_subject_id, title, slug, description, sort_order) VALUES
(5, 'Chương I: Mệnh Đề và Tập Hợp',           'toan10-c1-menh-de-tap-hop',  'Mệnh đề, tập hợp, các phép toán trên tập hợp',             1),
(5, 'Chương II: Bất Phương Trình và Hệ BPT',   'toan10-c2-bat-phuong-trinh', 'Bất đẳng thức, bất phương trình bậc nhất và bậc hai',       2),
(5, 'Chương III: Hàm Số và Đồ Thị',            'toan10-c3-ham-so',           'Hàm số bậc nhất, bậc hai và đồ thị trong hệ tọa độ Oxy',   3),
(5, 'Chương IV: Hệ Thức Lượng và Vectơ',       'toan10-c4-vector',           'Giá trị lượng giác, định lý sin, cosin và vectơ',           4);

-- ── CHƯƠNG I: MỆNH ĐỀ VÀ TẬP HỢP ──────────────────────────

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 1: Mệnh đề', 'toan10-c1-b1-menh-de', 'theory',
'<h2>Mệnh đề</h2>

<h3>Định nghĩa</h3>
<p><strong>Mệnh đề</strong> là một câu khẳng định đúng hoặc sai (không thể vừa đúng vừa sai).</p>
<ul>
  <li>"2 + 2 = 4" → Mệnh đề <strong>đúng</strong> ✓</li>
  <li>"7 là số chẵn" → Mệnh đề <strong>sai</strong> ✗</li>
  <li>"Bạn có khỏe không?" → <strong>Không phải</strong> mệnh đề (câu hỏi)</li>
  <li>"x + 1 = 5" → <strong>Không phải</strong> mệnh đề (không xác định được đúng sai khi chưa biết x)</li>
</ul>

<h3>Phủ định của mệnh đề</h3>
<p>Phủ định của mệnh đề P, ký hiệu P̄ (hoặc ¬P), đúng khi P sai và ngược lại.</p>
<ul>
  <li>P: "5 là số lẻ" (đúng) → P̄: "5 không phải số lẻ" (sai)</li>
  <li>P: "9 là số nguyên tố" (sai) → P̄: "9 không phải số nguyên tố" (đúng)</li>
</ul>

<h3>Mệnh đề kéo theo (⇒)</h3>
<p><strong>P ⇒ Q</strong>: "Nếu P thì Q" — sai chỉ khi P đúng mà Q sai.</p>

<h3>Mệnh đề tương đương (⇔)</h3>
<p><strong>P ⇔ Q</strong>: "P khi và chỉ khi Q" — đúng khi P, Q cùng đúng hoặc cùng sai.</p>
<p>P ⇔ Q đúng ⟺ (P ⇒ Q) và (Q ⇒ P) đều đúng.</p>

<h3>Mệnh đề phổ quát và mệnh đề tồn tại</h3>
<ul>
  <li><strong>∀x ∈ S, P(x):</strong> "Với mọi x trong S, P(x) đúng"</li>
  <li><strong>∃x ∈ S, P(x):</strong> "Tồn tại x trong S, P(x) đúng"</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Phủ định của "∀x, P(x)" là "∃x, không P(x)".<br>✦ Phủ định của "∃x, P(x)" là "∀x, không P(x)".</p>', 1
FROM chapters c WHERE c.slug = 'toan10-c1-menh-de-tap-hop';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 2: Tập hợp và các phép toán tập hợp', 'toan10-c1-b2-tap-hop', 'theory',
'<h2>Tập hợp và các phép toán tập hợp</h2>

<h3>Các tập hợp số quan trọng</h3>
<ul>
  <li>ℕ = {0; 1; 2; 3; ...}: số tự nhiên</li>
  <li>ℤ = {...; −2; −1; 0; 1; 2; ...}: số nguyên</li>
  <li>ℚ: số hữu tỉ (viết được dưới dạng p/q, q≠0)</li>
  <li>ℝ: số thực (bao gồm cả số vô tỉ như √2, π)</li>
  <li>Quan hệ: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ</li>
</ul>

<h3>Tập con và tập bằng nhau</h3>
<ul>
  <li>A ⊂ B: mọi phần tử của A đều thuộc B</li>
  <li>A = B: A ⊂ B và B ⊂ A</li>
</ul>

<h3>Giao của hai tập hợp (∩)</h3>
<p>A ∩ B = {x | x ∈ A và x ∈ B}</p>
<ul>
  <li>A = {1;2;3;4}, B = {2;4;6} → A ∩ B = {2;4}</li>
</ul>

<h3>Hợp của hai tập hợp (∪)</h3>
<p>A ∪ B = {x | x ∈ A hoặc x ∈ B}</p>
<ul>
  <li>A = {1;2;3}, B = {3;4;5} → A ∪ B = {1;2;3;4;5}</li>
</ul>

<h3>Hiệu của hai tập hợp (A\B)</h3>
<p>A\B = {x | x ∈ A và x ∉ B}</p>
<ul>
  <li>A = {1;2;3;4}, B = {2;4;6} → A\B = {1;3}</li>
</ul>

<h3>Phần bù (Cₑ(A))</h3>
<p>Cₑ(A) = E\A: tập các phần tử thuộc E nhưng không thuộc A.</p>

<h3>Ghi nhớ</h3>
<p>✦ A ∩ B ⊂ A ⊂ A ∪ B.<br>✦ A ∩ ∅ = ∅ &nbsp;|&nbsp; A ∪ ∅ = A.</p>', 2
FROM chapters c WHERE c.slug = 'toan10-c1-menh-de-tap-hop';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 3: Các tập hợp số', 'toan10-c1-b3-tap-hop-so', 'theory',
'<h2>Các tập hợp con của ℝ — Khoảng, đoạn, nửa khoảng</h2>

<h3>Khoảng mở (a; b)</h3>
<p>(a; b) = {x ∈ ℝ | a &lt; x &lt; b}</p>
<p>Ví dụ: (1; 3) gồm các số thực x với 1 &lt; x &lt; 3 (không gồm 1 và 3)</p>

<h3>Đoạn [a; b]</h3>
<p>[a; b] = {x ∈ ℝ | a ≤ x ≤ b}</p>
<p>Ví dụ: [1; 3] gồm các số thực x với 1 ≤ x ≤ 3 (gồm cả 1 và 3)</p>

<h3>Nửa khoảng</h3>
<ul>
  <li>[a; b) = {x | a ≤ x &lt; b}: gồm a, không gồm b</li>
  <li>(a; b] = {x | a &lt; x ≤ b}: không gồm a, gồm b</li>
  <li>[a; +∞) = {x | x ≥ a}</li>
  <li>(−∞; b] = {x | x ≤ b}</li>
</ul>

<h3>Biểu diễn trên trục số</h3>
<pre>  ──────●════════●──────
         a        b
  [a;b]: gồm a và b (dấu ●)

  ──────○════════○──────
         a        b
  (a;b): không gồm a và b (dấu ○)</pre>

<h3>Giao và hợp của các khoảng</h3>
<ul>
  <li>[1;5) ∩ (3;7] = (3;5)</li>
  <li>[1;3] ∪ [2;5] = [1;5]</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Dấu ngoặc vuông [ ] → bao gồm đầu mút.<br>✦ Dấu ngoặc tròn ( ) → không bao gồm đầu mút.</p>', 3
FROM chapters c WHERE c.slug = 'toan10-c1-menh-de-tap-hop';

-- ── CHƯƠNG II: BẤT PHƯƠNG TRÌNH ────────────────────────────

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 1: Bất đẳng thức', 'toan10-c2-b1-bat-dang-thuc', 'theory',
'<h2>Bất đẳng thức</h2>

<h3>Định nghĩa</h3>
<p><strong>Bất đẳng thức</strong> là hệ thức dạng a &lt; b, a &gt; b, a ≤ b, hoặc a ≥ b.</p>

<h3>Tính chất của bất đẳng thức</h3>
<ul>
  <li><strong>Bắc cầu:</strong> Nếu a &lt; b và b &lt; c thì a &lt; c</li>
  <li><strong>Cộng:</strong> Nếu a &lt; b thì a + c &lt; b + c (với mọi c)</li>
  <li><strong>Nhân với số dương:</strong> Nếu a &lt; b và c &gt; 0 thì ac &lt; bc</li>
  <li><strong>Nhân với số âm:</strong> Nếu a &lt; b và c &lt; 0 thì ac &gt; bc <em>(đổi chiều!)</em></li>
</ul>

<h3>Bất đẳng thức quan trọng</h3>
<p><strong>Bất đẳng thức Cauchy (AM-GM):</strong></p>
<p style="text-align:center;"><strong>a + b ≥ 2√(ab)</strong> với a, b ≥ 0</p>
<p>Dấu "=" xảy ra khi a = b.</p>

<p>Ví dụ: a + b = 4 → ab ≤ (a+b)²/4 = 4. Dấu "=" khi a = b = 2.</p>

<h3>Bình phương không âm</h3>
<p>Với mọi số thực a: <strong>a² ≥ 0</strong>, dấu "=" khi a = 0.</p>
<p>Suy ra: |a| ≥ 0 và |a| ≥ a với mọi a.</p>

<h3>Ghi nhớ</h3>
<p>✦ Nhân hoặc chia hai vế cho số <strong>âm</strong> → <strong>đổi chiều</strong> bất đẳng thức.<br>✦ a² + b² ≥ 2ab (suy từ (a−b)² ≥ 0).</p>', 1
FROM chapters c WHERE c.slug = 'toan10-c2-bat-phuong-trinh';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 2: Bất phương trình bậc nhất một ẩn', 'toan10-c2-b2-bpt-bac-nhat', 'theory',
'<h2>Bất phương trình bậc nhất một ẩn</h2>

<h3>Dạng tổng quát</h3>
<p><strong>ax + b &gt; 0</strong> (hoặc &lt; 0, ≥ 0, ≤ 0) với a ≠ 0</p>

<h3>Cách giải</h3>
<p><strong>Bước 1:</strong> Chuyển vế và rút gọn như phương trình.<br>
<strong>Bước 2:</strong> Chia (hoặc nhân) hai vế — chú ý <strong>đổi chiều nếu chia/nhân với số âm</strong>.<br>
<strong>Bước 3:</strong> Biểu diễn nghiệm trên trục số.</p>

<h3>Ví dụ 1: Giải 2x − 3 &gt; 5</h3>
<ul>
  <li>2x &gt; 5 + 3</li>
  <li>2x &gt; 8</li>
  <li>x &gt; 4</li>
  <li>Nghiệm: <strong>x ∈ (4; +∞)</strong></li>
</ul>

<h3>Ví dụ 2: Giải −3x + 6 ≥ 0</h3>
<ul>
  <li>−3x ≥ −6</li>
  <li>x ≤ 2 &nbsp;(chia cho −3, đổi chiều!)</li>
  <li>Nghiệm: <strong>x ∈ (−∞; 2]</strong></li>
</ul>

<h3>Ví dụ 3: Bài toán thực tế</h3>
<p>Tuổi An nhiều hơn tuổi Bình 5 tuổi. Cả hai cộng lại chưa đến 30. Hỏi tuổi Bình?</p>
<ul>
  <li>Gọi tuổi Bình là x → tuổi An là x + 5</li>
  <li>x + (x+5) &lt; 30 → 2x &lt; 25 → x &lt; 12,5</li>
  <li>Tuổi Bình &lt; 12,5, tức là tuổi Bình ≤ 12</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Quy tắc chuyển vế: đổi dấu hạng tử (giống phương trình).<br>✦ Quy tắc nhân/chia: <strong>đổi chiều bất đẳng thức khi nhân/chia với số âm</strong>.</p>', 2
FROM chapters c WHERE c.slug = 'toan10-c2-bat-phuong-trinh';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 3: Bất phương trình bậc hai một ẩn', 'toan10-c2-b3-bpt-bac-hai', 'theory',
'<h2>Bất phương trình bậc hai một ẩn</h2>

<h3>Dạng tổng quát</h3>
<p><strong>ax² + bx + c &gt; 0</strong> (hoặc &lt; 0, ≥, ≤) với a ≠ 0</p>

<h3>Phương pháp giải: Dùng đồ thị parabol</h3>
<p>Xét f(x) = ax² + bx + c và Δ = b² − 4ac</p>

<h3>Bảng xét dấu tam thức bậc hai</h3>
<p><strong>Trường hợp Δ &gt; 0</strong> (có 2 nghiệm x₁ &lt; x₂):</p>
<ul>
  <li>f(x) cùng dấu a khi x &lt; x₁ hoặc x &gt; x₂</li>
  <li>f(x) trái dấu a khi x₁ &lt; x &lt; x₂</li>
</ul>

<p><strong>Trường hợp Δ = 0</strong> (nghiệm kép x₀ = −b/2a):</p>
<ul>
  <li>f(x) cùng dấu a với x ≠ x₀; f(x₀) = 0</li>
</ul>

<p><strong>Trường hợp Δ &lt; 0</strong>:</p>
<ul>
  <li>f(x) luôn cùng dấu a với mọi x ∈ ℝ</li>
</ul>

<h3>Ví dụ: Giải x² − 5x + 6 &gt; 0</h3>
<ul>
  <li>Δ = 25 − 24 = 1 &gt; 0</li>
  <li>x₁ = 2, x₂ = 3 (a = 1 &gt; 0)</li>
  <li>x² − 5x + 6 &gt; 0 khi <strong>x &lt; 2 hoặc x &gt; 3</strong></li>
  <li>Nghiệm: <strong>x ∈ (−∞; 2) ∪ (3; +∞)</strong></li>
</ul>

<h3>Ví dụ: Giải −x² + 4x − 3 ≥ 0</h3>
<ul>
  <li>Δ = 16 − 12 = 4; x₁ = 1, x₂ = 3 (a = −1 &lt; 0)</li>
  <li>Nghiệm: <strong>x ∈ [1; 3]</strong></li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Vẽ parabol: a &gt; 0 → cong lên ∪; a &lt; 0 → cong xuống ∩.<br>✦ f(x) &gt; 0: lấy phần đồ thị nằm phía trên trục Ox.</p>', 3
FROM chapters c WHERE c.slug = 'toan10-c2-bat-phuong-trinh';

-- ── CHƯƠNG III: HÀM SỐ VÀ ĐỒ THỊ ──────────────────────────

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 1: Hàm số và đồ thị', 'toan10-c3-b1-ham-so', 'theory',
'<h2>Hàm số — Đồ thị hàm số</h2>

<h3>Khái niệm hàm số</h3>
<p>Hàm số y = f(x) là quy tắc cho mỗi giá trị x ∈ D (tập xác định) một giá trị y duy nhất.</p>
<ul>
  <li>x: biến số (biến độc lập)</li>
  <li>y = f(x): giá trị hàm số (biến phụ thuộc)</li>
  <li>D: tập xác định</li>
</ul>

<h3>Tập xác định</h3>
<p>Tập xác định D gồm tất cả các x làm cho biểu thức f(x) có nghĩa:</p>
<ul>
  <li>Không chia cho 0: mẫu số ≠ 0</li>
  <li>Không lấy căn số âm: biểu thức dưới dấu căn ≥ 0</li>
</ul>
<p>Ví dụ: f(x) = 1/(x−2) → D = ℝ \ {2}</p>

<h3>Đồ thị hàm số</h3>
<p>Đồ thị của y = f(x) là tập các điểm (x; f(x)) trong mặt phẳng tọa độ Oxy.</p>

<h3>Tính chẵn lẻ của hàm số</h3>
<ul>
  <li><strong>Hàm chẵn:</strong> f(−x) = f(x) — đồ thị đối xứng qua trục Oy<br>Ví dụ: f(x) = x² (vì (−x)² = x²)</li>
  <li><strong>Hàm lẻ:</strong> f(−x) = −f(x) — đồ thị đối xứng qua gốc O<br>Ví dụ: f(x) = x³</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Đồ thị hàm số chẵn đối xứng trục Oy.<br>✦ Đồ thị hàm số lẻ đối xứng qua gốc tọa độ O.</p>', 1
FROM chapters c WHERE c.slug = 'toan10-c3-ham-so';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 2: Hàm số bậc nhất', 'toan10-c3-b2-ham-bac-nhat', 'theory',
'<h2>Hàm số bậc nhất y = ax + b</h2>

<h3>Định nghĩa</h3>
<p>Hàm số bậc nhất có dạng <strong>y = ax + b</strong> với a ≠ 0.</p>
<ul>
  <li>a: hệ số góc (độ dốc của đường thẳng)</li>
  <li>b: tung độ gốc (y khi x = 0)</li>
</ul>

<h3>Đồ thị</h3>
<p>Đồ thị hàm số bậc nhất là một <strong>đường thẳng</strong>:</p>
<ul>
  <li>Đi qua điểm (0; b) trên trục Oy</li>
  <li>Đi qua điểm (−b/a; 0) trên trục Ox</li>
</ul>

<h3>Tính đơn điệu</h3>
<ul>
  <li>a &gt; 0: hàm số <strong>đồng biến</strong> (tăng từ trái sang phải)</li>
  <li>a &lt; 0: hàm số <strong>nghịch biến</strong> (giảm từ trái sang phải)</li>
</ul>

<h3>Vị trí tương đối hai đường thẳng</h3>
<p>y = a₁x + b₁ và y = a₂x + b₂:</p>
<ul>
  <li>a₁ ≠ a₂: <strong>cắt nhau</strong> tại một điểm</li>
  <li>a₁ = a₂, b₁ ≠ b₂: <strong>song song</strong></li>
  <li>a₁ = a₂, b₁ = b₂: <strong>trùng nhau</strong></li>
</ul>

<h3>Ví dụ vẽ đồ thị y = 2x − 3</h3>
<ul>
  <li>Điểm cắt Oy: x=0 → y=−3 → (0; −3)</li>
  <li>Điểm cắt Ox: y=0 → 2x=3 → x=1,5 → (1,5; 0)</li>
  <li>Nối hai điểm → đường thẳng</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ Hệ số góc a = tan(α) với α là góc tạo bởi đường thẳng và trục Ox dương.<br>✦ Hai đường thẳng vuông góc ⟺ a₁ × a₂ = −1.</p>', 2
FROM chapters c WHERE c.slug = 'toan10-c3-ham-so';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 3: Hàm số bậc hai', 'toan10-c3-b3-ham-bac-hai', 'theory',
'<h2>Hàm số bậc hai y = ax² + bx + c (a ≠ 0)</h2>

<h3>Đồ thị — Parabol</h3>
<ul>
  <li>a &gt; 0: parabol <strong>cong lên</strong> (∪), có <strong>điểm cực tiểu</strong></li>
  <li>a &lt; 0: parabol <strong>cong xuống</strong> (∩), có <strong>điểm cực đại</strong></li>
</ul>

<h3>Đỉnh của parabol</h3>
<p style="text-align:center;"><strong>I = (−b/2a ; −Δ/4a)</strong> với Δ = b² − 4ac</p>
<p>Trục đối xứng: <strong>x = −b/2a</strong></p>

<h3>Ví dụ: Khảo sát y = x² − 4x + 3</h3>
<ul>
  <li>a = 1 &gt; 0: parabol cong lên ∪</li>
  <li>Đỉnh: x = −(−4)/(2×1) = 2; y = 4−8+3 = −1 → I(2; −1)</li>
  <li>Trục đối xứng: x = 2</li>
  <li>Cắt Ox: x²−4x+3=0 → x=1 hoặc x=3 → (1;0) và (3;0)</li>
  <li>Cắt Oy: x=0 → y=3 → (0;3)</li>
</ul>

<h3>Bảng biến thiên</h3>
<pre>  x  | −∞          2       +∞
  y  |    ↘        -1      ↗     (a>0)
     |    (giảm dần đến đỉnh, rồi tăng)</pre>

<h3>Ghi nhớ</h3>
<p>✦ Giá trị nhỏ nhất của y (khi a&gt;0) = −Δ/4a tại x = −b/2a.<br>✦ Parabol đối xứng qua trục x = −b/2a.</p>', 3
FROM chapters c WHERE c.slug = 'toan10-c3-ham-so';

-- ── CHƯƠNG IV: VECTƠ ──────────────────────────────────────

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 1: Khái niệm vectơ', 'toan10-c4-b1-vector', 'theory',
'<h2>Khái niệm vectơ</h2>

<h3>Định nghĩa</h3>
<p><strong>Vectơ</strong> là một đoạn thẳng có hướng. Vectơ AB ký hiệu là <strong>AB⃗</strong>:</p>
<ul>
  <li>A: điểm đầu (gốc)</li>
  <li>B: điểm cuối (ngọn)</li>
  <li>Độ dài |AB⃗| = độ dài đoạn thẳng AB</li>
</ul>

<h3>Vectơ-không</h3>
<p>Vectơ-không (0⃗) có điểm đầu trùng điểm cuối, độ dài bằng 0, hướng tùy ý.</p>

<h3>Hai vectơ bằng nhau</h3>
<p>AB⃗ = CD⃗ khi hai vectơ cùng hướng và cùng độ dài.</p>
<p>(Không cần cùng điểm đặt)</p>

<h3>Vectơ đối</h3>
<p>Vectơ đối của AB⃗ là BA⃗ (cùng độ dài, ngược hướng).</p>
<p>AB⃗ + BA⃗ = 0⃗</p>

<h3>Tọa độ vectơ</h3>
<p>Trong hệ tọa độ Oxy, vectơ AB⃗ với A(x₁; y₁), B(x₂; y₂):</p>
<p style="text-align:center;"><strong>AB⃗ = (x₂−x₁; y₂−y₁)</strong></p>
<p>Độ dài: <strong>|AB⃗| = √[(x₂−x₁)² + (y₂−y₁)²]</strong></p>

<h3>Ghi nhớ</h3>
<p>✦ Vectơ có hướng và độ lớn, không có vị trí cố định.<br>✦ Tọa độ vectơ = tọa độ điểm cuối trừ tọa độ điểm đầu.</p>', 1
FROM chapters c WHERE c.slug = 'toan10-c4-vector';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 2: Các phép toán vectơ', 'toan10-c4-b2-phep-toan-vector', 'theory',
'<h2>Các phép toán trên vectơ</h2>

<h3>Phép cộng vectơ</h3>
<p><strong>Quy tắc ba điểm:</strong> AB⃗ + BC⃗ = AC⃗</p>
<p><strong>Quy tắc hình bình hành:</strong></p>
<p>Nếu ABCD là hình bình hành thì AB⃗ + AD⃗ = AC⃗</p>

<h3>Phép trừ vectơ</h3>
<p>AB⃗ − AC⃗ = CB⃗ &nbsp;(quy tắc ba điểm ngược)</p>

<h3>Nhân vectơ với một số</h3>
<p>k × AB⃗ (k ∈ ℝ, k ≠ 0):</p>
<ul>
  <li>Cùng hướng AB⃗ nếu k &gt; 0</li>
  <li>Ngược hướng AB⃗ nếu k &lt; 0</li>
  <li>Độ dài: |k| × |AB⃗|</li>
</ul>

<h3>Tọa độ</h3>
<p>Với a⃗ = (a₁; a₂), b⃗ = (b₁; b₂), k ∈ ℝ:</p>
<ul>
  <li>a⃗ + b⃗ = (a₁+b₁; a₂+b₂)</li>
  <li>a⃗ − b⃗ = (a₁−b₁; a₂−b₂)</li>
  <li>k × a⃗ = (ka₁; ka₂)</li>
</ul>

<h3>Tích vô hướng</h3>
<p><strong>a⃗ · b⃗ = |a⃗| × |b⃗| × cos(α)</strong></p>
<p>với α là góc giữa hai vectơ.</p>
<p>Theo tọa độ: a⃗ · b⃗ = a₁b₁ + a₂b₂</p>
<ul>
  <li>a⃗ ⊥ b⃗ ⟺ a⃗ · b⃗ = 0</li>
  <li>a⃗ · a⃗ = |a⃗|²</li>
</ul>

<h3>Ghi nhớ</h3>
<p>✦ a⃗ + 0⃗ = a⃗ &nbsp;|&nbsp; a⃗ + (−a⃗) = 0⃗<br>✦ a⃗ // b⃗ ⟺ a₁b₂ − a₂b₁ = 0 (hay a⃗ = k·b⃗ với k nào đó)</p>', 2
FROM chapters c WHERE c.slug = 'toan10-c4-vector';

INSERT INTO lessons (chapter_id, title, slug, content_type, content_html, sort_order)
SELECT c.id, 'Bài 3: Giá trị lượng giác và định lý sin, cosin', 'toan10-c4-b3-luong-giac', 'theory',
'<h2>Giá trị lượng giác và các định lý</h2>

<h3>Giá trị lượng giác của góc nhọn (trong tam giác vuông)</h3>
<pre>        |đối cạnh
  sin α = ─────────   (sin = đối/huyền)
          huyền

  cos α = kề cạnh     (cos = kề/huyền)
          ─────────
          huyền

  tan α = đối cạnh    (tan = đối/kề)
          ─────────
          kề cạnh

  cot α = kề cạnh     (cot = kề/đối)
          ─────────
          đối cạnh</pre>

<h3>Bảng giá trị thường gặp</h3>
<pre>  α    |  0°  |  30°  |  45°   |  60°   |  90°
  sin  |   0  |  1/2  | √2/2  | √3/2  |   1
  cos  |   1  | √3/2  | √2/2  |  1/2  |   0
  tan  |   0  | 1/√3  |   1   |  √3   | không xác định</pre>

<h3>Hệ thức cơ bản</h3>
<ul>
  <li>sin²α + cos²α = 1</li>
  <li>tan α = sin α / cos α</li>
  <li>1 + tan²α = 1/cos²α</li>
</ul>

<h3>Định lý sin</h3>
<p style="text-align:center;"><strong>a/sinA = b/sinB = c/sinC = 2R</strong></p>
<p>(R: bán kính đường tròn ngoại tiếp tam giác)</p>

<h3>Định lý cosin</h3>
<p style="text-align:center;"><strong>a² = b² + c² − 2bc·cosA</strong></p>
<p>Suy ra: cosA = (b² + c² − a²) / (2bc)</p>
<p>Trường hợp đặc biệt: A = 90° → a² = b² + c² (Pythagore)</p>

<h3>Ghi nhớ</h3>
<p>✦ Định lý sin: dùng khi biết một cạnh và góc đối diện.<br>✦ Định lý cosin: dùng khi biết ba cạnh hoặc hai cạnh và góc kẹp giữa.</p>', 3
FROM chapters c WHERE c.slug = 'toan10-c4-vector';
