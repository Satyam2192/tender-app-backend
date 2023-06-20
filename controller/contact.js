const ContactForm = require("../models/contactForm");

class Contact {

    async postContactForm(req, res) {
        try {
            const { name, userId, email, message } = req.body;

            if (!name || !userId || !email || !message) {
                return res.status(400).json({ error: "All fields are required" });
            }

            const contactForm = new ContactForm({
                name,
                userId,
                email,
                message,
            });

            await contactForm.save();

            res.json({ message: "Contact form submitted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred" });
        }
    }


    async getContactForms(req, res) {
        try {
            const contactForms = await ContactForm.find();

            res.json(contactForms);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred" });
        }
    }

}

const contactController = new Contact();
module.exports = contactController;
