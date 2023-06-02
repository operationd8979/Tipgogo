export const formatNumber = (number) => {
    // Chuyển số thành chuỗi và loại bỏ các ký tự không phải số
    const numericString = String(number).replace(/[^0-9]/g, '');

    // Kiểm tra nếu chuỗi rỗng hoặc chỉ chứa số 0
    if (numericString === '0') {
        return '0';
    }
    
    // Chia chuỗi thành các phần nhỏ hơn 3 ký tự và ngăn cách bằng dấu "."
    const parts = [];
    for (let i = numericString.length - 3; i > -3; i -= 3) {
        parts.unshift(numericString.slice(Math.max(0, i), i + 3));
    }
    
    // Trả về chuỗi đã định dạng với dấu "."
    return parts.join('.');
};