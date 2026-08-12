-- =========================================
-- BẢNG TỈNH / THÀNH
-- =========================================

CREATE TABLE IF NOT EXISTS provinces (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);


-- =========================================
-- BẢNG QUẬN / HUYỆN
-- =========================================

CREATE TABLE IF NOT EXISTS districts (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_code VARCHAR(20) NOT NULL,

    CONSTRAINT fk_district_province
        FOREIGN KEY (parent_code)
        REFERENCES provinces(code)
);


-- =========================================
-- BẢNG PHÒNG TRỌ
-- =========================================

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,

    title TEXT NOT NULL,

    thumbnail TEXT,

    price NUMERIC(15, 2) NOT NULL,

    area NUMERIC(10, 2) NOT NULL,

    city VARCHAR(20) NOT NULL,

    district VARCHAR(20) NOT NULL,

    content TEXT,

    CONSTRAINT fk_room_province
        FOREIGN KEY (city)
        REFERENCES provinces(code),

    CONSTRAINT fk_room_district
        FOREIGN KEY (district)
        REFERENCES districts(code)
);