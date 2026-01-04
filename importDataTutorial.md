Bước 1: Tạo database
Bước 2:  chuột phải vào dtb --> chọn task --> import data
Bước 3: Chọn nguồn dữ liệu ( csv vì file của mình là demo(1).csv đấy)
Bước 4: Chọn đích dữ liệu ( dtb của mình)
Bước 5: Chọn bảng --> chọn import

Sau khi đã import được, thì chạy các lệnh insert để hệ thống tự động lấy dữ liệu từ bảng demo sang các bảng dim.fact
*lưu ý lúc import có thể xảy ra một số lỗi liên quan tới độ lớn của kiểu dữ liệu NVARCHAR, và not null hãy dùng ai sửa lại, nó không ảnh hưởng nhiều tới dữ liệu