// greedy route so req go through it eg /admin/abc
const adminAuth = (req, res, next) => {
    const token = "Bearer xyz";
    const isAdminAuthorized = token === "Bearer xyz";
    if(!isAdminAuthorized) {
        res.status(401).send("unauthorized")
    }
    else {
        console.log("authorized ...")
        next();
    }
}

const userAuth = (req, res, next) => {}

module.exports = {
    adminAuth, userAuth
}