const districtsData = require("../data/quan_huyen.json");

// Chuyển dữ liệu thành array
const getDistrictList = () => {

    return Array.isArray(districtsData)
        ? districtsData
        : Object.values(districtsData);
};

// ========================================
// GET ALL DISTRICTS
// ========================================

const getDistricts = (req, res) => {

    const districts = getDistrictList();

    res.json(districts);

};

// ========================================
// GET DISTRICTS BY PROVINCE
// ========================================

const getDistrictsByProvince = (req, res) => {

    const { parentCode } = req.query;

    if (!parentCode) {

        return res.status(400).json({
            message: "parentCode là bắt buộc"
        });
    }

    const districts = getDistrictList().filter(
        (district) =>
            String(district.parent_code) ===
            String(parentCode)
    );

    res.json(districts);
};

module.exports = {
    getDistricts,
    getDistrictsByProvince
};