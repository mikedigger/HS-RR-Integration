export default class HubspotService {

    _proxyURL = 'https://http-cors-proxy.p.rapidapi.com/';
    _hapiKey = 'eu1-ea79-cb21-4d49-9f86-da6cde4075e2';

    _getRequestHeaders = () => {
        return {
            'content-type': 'application/json',
            // stuff for http-cors-proxy
            origin: 'http://localhost:3000',
            'x-requested-with': 'http://localhost:3000',
            'X-RapidAPI-Key': '248e0c5260msh354a5b43e6f14f9p13b870jsn926da4ac7752',
            'X-RapidAPI-Host': 'http-cors-proxy.p.rapidapi.com'
        }
    }

    _getHubspotObjectURL = (object) => {
        return `https://api.hubapi.com/crm/v3/objects/${object}?hapikey=${this._hapiKey}`
    }

    getHubspotAssocURL = (params) => {
        const { object, objectId, toObjectType, toObjectId, associationType } = params;
        return `https://api.hubapi.com/crm/v3/objects/${object}/${objectId}/associations/${toObjectType}/${toObjectId}/${associationType}?hapikey=${this._hapiKey}`
    }

    newDeal = (newContact) => {
        return {
            "dealname": `RR Site Enquiry: ${newContact.company}`,
            "dealstage": "appointmentscheduled",
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
        console.log(res)

        if (!res.ok) return false;

        else {
            return await res.json()
        }
    }

    // ----------------------------------------------

    createDeal = async () => {
        return await this._createHubspotObject('deals', this._newDeal(this._newContact))
    }

    createCompany = async () => {
        return await this._createHubspotObject('companies', this._newCompany(this._newContact))
    }

    createNote = async () => {
        const { firstname, company, email, website, mobilephone, message } = this._newContact
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

    getContacts = async () => {
        const res = await fetch(`${this._proxyURL}https://api.hubapi.com/crm/v3/objects/contacts?properties=email&archived=false&hapikey=${this._hapiKey}`, {
            method: 'GET',
            headers: this._getRequestHeaders(),
        });
        return await res.json()
    }

}