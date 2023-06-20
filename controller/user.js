const userModel = require("../models/user");
const ContactForm = require("../models/contactForm");

class User {

    async getSingleUser(req, res) {
        let { userId } = req.body;
        if (!userId) {
            return res.json({ error: "All filled must be required" });
        } else {
            try {
                let User = await userModel
                    .find({ userId: userId });
                if (User) {
                    return res.json({ User });
                }
            } catch (err) {
                console.log(err);
            }
        }
    }
    
}

const usersController = new User();
module.exports = usersController;
