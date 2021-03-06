export default class HubspotService {

    _proxyURL = 'https://http-cors-proxy.p.rapidapi.com/';
    _hapiKey = 'eu1-ea79-cb21-4d49-9f86-da6cde4075e2';

    _getRequestHeaders = () => {
        return {
            'content-type': 'application/json',
            // stuff for http-cors-proxy
            origin: 'http://localhost:3000',
            'x-requested-with': 'http://localhost:3000',
            'X-RapidAPI-Key': '928882e4bamshf67efcfaa4a6ca7p1870f9jsn2a1753f865f5',
            'X-RapidAPI-Host': 'http-cors-proxy.p.rapidapi.com'
        }
    }

    _getHubspotObjectURL = (object) => {
        return `https://api.hubapi.com/crm/v3/objects/${object}?hapikey=${this._hapiKey}`
    }

    _getHubspotAssocURL = (params) => {
        const { object, objectId, toObjectType, toObjectId, associationType } = params;
        return `https://api.hubapi.com/crm/v3/objects/${object}/${objectId}/associations/${toObjectType}/${toObjectId}/${associationType}?hapikey=${this._hapiKey}`
    }

    _newDeal = (newContact) => {
        return {
            "dealname": `RR Site Enquiry:${newContact.firstname}`,
        }
    }

    newCompany = (newContact) => {
        return {
            "name": newContact.company,
            "website": newContact.website
        }
    }

    _createHubspotObject = async (object, props) => {
        const res = await fetch(`${this._proxyURL}${this._getHubspotObjectURL(object)}`, {
            method: 'POST',
            headers: this._getRequestHeaders(),
            body: JSON.stringify({ properties: props })
        });
        return await res.json()
    }

    createAssociation = (params) => {
        fetch(`${this._proxyURL}${this._getHubspotAssocURL(params)}`, {
            method: 'PUT',
            headers: this._getRequestHeaders()
        })
    }

    createContact = async (newContact) => {
        return await this._createHubspotObject('contacts', newContact)
    }

    getContactDealsAssociatios = async (contactId) => {
        const res = await fetch(`${this._proxyURL}https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/deals?hapikey=${this._hapiKey}`, {
            method: 'GET',
            headers: this._getRequestHeaders()
        });
        return await res.json()
    }
    // ---------------------------------------------

    updateContact = async (contactId, data) => {
        const res = await fetch(`${this._proxyURL}https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?hapikey=${this._hapiKey}`, {
            method: 'PATCH',
            headers: this._getRequestHeaders(),
            body: JSON.stringify({
                properties: data
            })
        });
        return await res.json()
    }

    // https://api.hubapi.com/contacts/v1/contact/email/testingapis@hubspot.com/profile?hapikey=demo
    // /crm/v3/objects/contacts/search
    contactEmailAlreadyExists = async (email) => {
        const res = await fetch(`${this._proxyURL}https://api.hubapi.com/crm/v3/objects/contacts/search?hapikey=${this._hapiKey}`, {
            method: 'POST',
            headers: this._getRequestHeaders(),
            body: JSON.stringify({
                "filterGroups": [
                    {
                        "filters": [
                            {
                                "propertyName": "email",
                                "operator": "EQ",
                                "value": email
                            }
                        ]
                    }
                ]
            })
        });
        return await res.json()
    }

    // ----------------------------------------------

    createDeal = async (newContact) => {
        return await this._createHubspotObject('deals', this._newDeal(newContact))
    }

    getDeal = async (dealId) => {
        const res = await fetch(`${this._proxyURL}https://api.hubapi.com/crm/v3/objects/deals/${dealId}?archived=false&hapikey=${this._hapiKey}`, {
            method: 'GET',
            headers: this._getRequestHeaders()
        });

        return await res.json();
    }

    getDeals = async (dealId) => {
        const res = await fetch(`${this._proxyURL}https://api.hubapi.com/crm/v3/objects/deals/search?hapikey=${this._hapiKey}`, {
            method: 'POST',
            headers: this._getRequestHeaders(),
            body: JSON.stringify({
                "filterGroups": [
                    {
                        "filters": [
                            {
                                "propertyName": "hs_object_id",
                                "operator": "EQ",
                                "value": dealId
                            }
                        ]
                    }
                ]
            })
        });
        return await res.json()
    }

    createCompany = async () => {
        return await this._createHubspotObject('companies', this._newCompany(this._newContact))
    }

    createNote = async (newContact) => {
        const { firstname, company, email, website, mobilephone, message } = newContact
        const res = await fetch(`${this._proxyURL}${this._getHubspotObjectURL('notes')}`, {
            method: 'POST',
            headers: this._getRequestHeaders(),
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

    createAdditionalNote = async (message) => {
        const res = await fetch(`${this._proxyURL}${this._getHubspotObjectURL('notes')}`, {
            method: 'POST',
            headers: this._getRequestHeaders(),
            body: JSON.stringify({
                properties: {
                    "hs_timestamp": new Date(),
                    "hs_note_body": `Message: ${message}`,
                }
            })
        });

        return await res.json();
    }

    getContacts = async () => {
        const res = await fetch(`${this._proxyURL}https://api.hubapi.com/crm/v3/objects/contacts?properties=email&archived=false&hapikey=${this._hapiKey}`, {
            method: 'GET',
            headers: this._getRequestHeaders(),
        });
        return await res.json()
    }

    associateObjectWithNote = (noteId, objectId, objectType) => {
        this.createAssociation({
            object: 'note',
            objectId: noteId,
            toObjectType: `${objectType}s`,
            toObjectId: objectId,
            associationType: `note_to_${objectType}`
        })
    }

    associateObjectWithContact = (contactId, objectId, objectType) => {
        this.createAssociation({
            object: 'contact',
            objectId: contactId,
            toObjectType: `${objectType}s`,
            toObjectId: objectId,
            associationType: `contact_to_${objectType}`
        })
    }
}