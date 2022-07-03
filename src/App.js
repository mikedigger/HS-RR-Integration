import { useState } from 'react';

// import sendToHubspot from './services/hubspot';
import HubspotService from './services/hubspotService';

const App = () => {

    const { createContact, updateContact, contactEmailAlreadyExists, getContactDealsAssociatios, createAdditionalNote, getDeal, createDeal, createNote, associateObjectWithNote, associateObjectWithContact } = new HubspotService();

    // hs entities


    // forms
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [company, setCompany] = useState('');
    const [website, setWebsite] = useState('');

    const controlName = (e) => setName(e.target.value);
    const controlEmail = (e) => setEmail(e.target.value);
    const controlPhone = (e) => setPhone(e.target.value);
    const controlMessage = (e) => setMessage(e.target.value);
    const controlWebsite = (e) => setWebsite(e.target.value);
    const controlCompany = (e) => setCompany(e.target.value);


    const onFormSubmit = (e) => {
        e.preventDefault();
        const newUser = {
            firstname: name,
            email,
            mobilephone: phone,
            message,
            company,
            website
        }

        contactEmailAlreadyExists(email)
            .then(res => {
                const contactId = res.results[0]?.id;
                const email = res.results[0]?.properties.email;
                const name = res.results[0]?.properties.firstname;

                if (!email) {
                    createContact(newUser)
                        .then(contact => {
                            createDeal(newUser)
                                .then(deal => {
                                    associateObjectWithContact(contact.id, deal.id, 'deal');
                                    createNote(newUser)
                                        .then(note => {
                                            associateObjectWithNote(note.id, contact.id, 'contact');
                                            associateObjectWithNote(note.id, deal.id, 'deal');
                                        })
                                })
                        })

                } else if (email === newUser.email && name !== newUser.firstname) {
                    updateContact(contactId, newUser)
                    createDeal(newUser)
                        .then(deal => {
                            associateObjectWithContact(contactId, deal.id, 'deal');
                            createNote(newUser)
                                .then(note => {
                                    associateObjectWithNote(note.id, contactId, 'contact');
                                    associateObjectWithNote(note.id, deal.id, 'deal');
                                })
                        })
                    // ----------------------
                } else if (email === newUser.email && name === newUser.firstname){

                    createAdditionalNote(newUser.message)
                        .then(note => {
                            updateContact(contactId, {...newUser, message: newUser.message})
                            getContactDealsAssociatios(contactId)
                                .then((associatedDeals) => {
                                    associatedDeals.results.forEach((assoc) => {
                                        getDeal(assoc.id)
                                            .then(deal => {
                                                const dealName = deal.properties.dealname;
                                                const extractedDealName = dealName.slice(dealName.indexOf(":") + 1);
                                                if (extractedDealName === newUser.firstname) {
                                                    associateObjectWithNote(note.id, deal.id, 'deal');
                                                }
                                            })

                                    });
                                })

                        })
                }
            })
    }

    return (
        <form
            onSubmit={(e) => onFormSubmit(e)}>
            <input
                onChange={controlName}
                value={name}
                placeholder="name"
                type="text"
                name="name" />
            <input
                onChange={controlEmail}
                value={email}
                placeholder="email"
                type="email"
                name="email" />
            <input
                onChange={controlPhone}
                value={phone}
                placeholder="phone"
                type="tel"
                name="mobilephone"
                id="" />
            <input
                onChange={controlMessage}
                value={message}
                placeholder="message"
                type="text"
                name="message" />
            <input
                onChange={controlCompany}
                value={company}
                placeholder="company name"
                type="text"
                name="company_name" />
            <input
                onChange={controlWebsite}
                value={website}
                placeholder="company link"
                type="url"
                name="website" />
            <button type="submit">submit</button>
        </form>
    )
}

export default App;