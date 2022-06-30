const sendToHubspot = (newContact) => {

    const proxyURL = 'https://http-cors-proxy.p.rapidapi.com/';
    const hapiKey = 'eu1-ea79-cb21-4d49-9f86-da6cde4075e2';

    const getRequestHeaders = () => {
        return {
            'content-type': 'application/json',
            // stuff for http-cors-proxy
            origin: 'http://localhost:3000',
            'x-requested-with': 'http://localhost:3000',
            'X-RapidAPI-Key': '248e0c5260msh354a5b43e6f14f9p13b870jsn926da4ac7752',
            'X-RapidAPI-Host': 'http-cors-proxy.p.rapidapi.com'
        }
    }

    const getHubspotObjectURL = (object) => {
        return `https://api.hubapi.com/crm/v3/objects/${object}?hapikey=${hapiKey}`
    }

    const getHubspotAssocURL = (params) => {
        const { object, objectId, toObjectType, toObjectId, associationType } = params;
        return `https://api.hubapi.com/crm/v3/objects/${object}/${objectId}/associations/${toObjectType}/${toObjectId}/${associationType}?hapikey=${hapiKey}`
    }

    const newDeal = (newContact) => {
        return {
            "dealname": `RR Site Enquiry: ${newContact.company}`,
            "dealstage": "appointmentscheduled",
        }
    }

    const newCompany = (newContact) => {
        return {
            "name": newContact.company,
            "website": newContact.website
        }
    }

    // -------------------------------------------------------------------------------------
    const getContacts = async () => {
        const res = await fetch(`${proxyURL}https://api.hubapi.com/crm/v3/objects/contacts?properties=hs_object_id&archived=false&hapikey=${hapiKey}`, {
            method: 'GET',
            headers: getRequestHeaders(),
        });
        return await res.json()
    }



    // -------------------------------------------------------------------------------------

    const createHubspotObject = async (object, props) => {
        const res = await fetch(`${proxyURL}${getHubspotObjectURL(object)}`, {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ properties: props })
        });
        return await res.json()
    }

    const createAssociation = (params) => {
        fetch(`${proxyURL}${getHubspotAssocURL(params)}`, {
            method: 'PUT',
            headers: getRequestHeaders()
        })
    }

    const createContact = async () => {
        return await createHubspotObject('contacts', newContact)
    }

    const createDeal = async () => {
        return await createHubspotObject('deals', newDeal(newContact))
    }

    const createCompany = async () => {
        return await createHubspotObject('companies', newCompany(newContact))
    }

    const createNote = async () => {
        const { firstname, company, email, website, mobilephone, message } = newContact
        const res = await fetch(`${proxyURL}${getHubspotObjectURL('notes')}`, {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                properties: {
                    "hs_timestamp": new Date(),
                    "hs_note_body":
                        `Name: ${firstname}, <br />
                        Company: ${company}, <br />
                        Email: ${email}, <br />
                        Website: ${website}, <br />
                        Telephone: ${mobilephone}, <br />
                        Message: ${message}, <br />`,

                }
            })
        });

        return await res.json();
    }


    createContact()
        .then(contact => {
            getContacts()
                .then(res => {
                    const contactsIds = res.results.map(contact => contact.id);
                    const contactAlreadyExists = contactsIds.some(({ id }) => id === contact.id);
                    if (!contactAlreadyExists) {
                        createDeal()
                            .then(deal => {
                                createAssociation({
                                    object: 'deals',
                                    objectId: deal.id,
                                    toObjectType: 'contacts',
                                    toObjectId: contact.id,
                                    associationType: 'deal_to_contact'
                                });
                                createCompany()
                                    .then(company => {
                                        createAssociation({
                                            object: 'companies',
                                            objectId: company.id,
                                            toObjectType: 'contacts',
                                            toObjectId: contact.id,
                                            associationType: 'company_to_contact'
                                        });
                                        createAssociation({
                                            object: 'companies',
                                            objectId: company.id,
                                            toObjectType: 'deals',
                                            toObjectId: deal.id,
                                            associationType: 'company_to_deal'
                                        });
                                        createNote()
                                            .then(note => {
                                                createAssociation({
                                                    object: 'notes',
                                                    objectId: note.id,
                                                    toObjectType: 'contacts',
                                                    toObjectId: contact.id,
                                                    associationType: 'note_to_contact'
                                                })
                                                createAssociation({
                                                    object: 'notes',
                                                    objectId: note.id,
                                                    toObjectType: 'deals',
                                                    toObjectId: deal.id,
                                                    associationType: 'note_to_deal'
                                                })
                                                createAssociation({
                                                    object: 'notes',
                                                    objectId: note.id,
                                                    toObjectType: 'companies',
                                                    toObjectId: company.id,
                                                    associationType: 'note_to_company'
                                                })
                                            })
                                    })
                            })
                    }
                })

        })

}

export default sendToHubspot;