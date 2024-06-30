const user = (req, res) => {
    res.status(200).json({
        success: true,
        userrole: req.user.userrole
    });
};

module.exports = { user };