import { useState } from 'react';

// import sendToHubspot from './services/hubspot';
import HubspotService from './services/hubspotService';

const App = () => {

    const { createContact, getContacts, updateContact, contactEmailAlreadyExists, getContactDealsAssociatios, createAdditionalNote, createAssociation, getDeal } = new HubspotService();

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
                if (!contactId) {
                    createContact(newUser)
                }
                else {
                    updateContact(contactId, newUser);
                    createAdditionalNote(newUser.message)
                        .then(note => {
                            getContactDealsAssociatios(contactId)
                                .then((associatedDeals) => {
                                    const deals = associatedDeals.results.map(assoc => getDeal(assoc.id));
                                    console.log(deals)
                                    createAssociation({
                                        object: 'notes',
                                        objectId: note.id,
                                        toObjectType: 'deals',
                                        toObjectId: associatedDeals.results[0]?.id,
                                        associationType: 'note_to_deal'
                                    })
                                })

                        })
                    
                } 
            })
    }

    // прибрати атрибут name з input
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