const PuppeteerSimple = require('puppeteer-simple').default;//For intellisense


/**
 * This is a wrapper on top of puppeteer-simple Page object. It functions similarly to a composite Operation.
 */
class SPA_Page {
    /**
     * 
     * @param {PuppeteerSimple} puppeteerSimple 
     * @param {string} url 
     * @param {object} config 
     */
    constructor(PuppeteerSimple, url, config = {}) {
        this.puppeteerSimple = PuppeteerSimple;//PuppeteerSimple instance.
        this.url = url;
        this.puppeteerSimplePage = null;//The PuppeteerSimple PAGE instance
        this.operations = [];
        // this.html = null;
        this.respone = null;//
    }

    // setHtml(html){
    //     this.html = html;
    // }

    addOperation(operation) {
        // debugger;
        this.operations.push(operation)
    }

    /**
     * Create a puppeteerSimplePage instance(using the PuppeteerSimple instance) and navigate to the page.
     */
    async init() {
        // debugger;
        var puppeteerSimplePage = await this.puppeteerSimple.createPage(this.url);
        this.puppeteerSimplePage = puppeteerSimplePage;
        const response = await puppeteerSimplePage.navigate();
        if (response._status >= 400) {
            const error = new CustomError({ code: response._status, message: 'Error opening page', errno: null, response })
            throw error;
        }
        this.response = response;
        // this.html = await this.getHtml();
    }

    async scrapeChild(operation) {
        const html = await this.getHtml();
        // const html = this.html;
        // console.log('fresh html')
        const data = await operation.scrape({ html, url: this.url }, this.puppeteerSimplePage);
        return data;
    }

    async scrapeChildren() {
        // const html = await this.getHtml()
        const dataFromChildren = [];
        for (let operation of this.operations) {            
            const dataFromChild =  await this.scrapeChild(operation);
            dataFromChildren.push(dataFromChild)
        }

        return dataFromChildren;
    }


    /**
     * Returns a mocked response, to conform with the normal API
     */
    async getResponse() {
        const { _status, _statusText, _headers, _url } = this.response;
        // debugger;
        const html = await this.getHtml();
        
        return {
            config: {},
            originalResponse: this.respone,
            data: html,
            status: _status,
            statusText: _statusText,
            url: _url,
            headers: _headers
        }
    }

    /**
     * Returns the HTML of the page, in a given moment.
     */
    async getHtml() {
        const html = await this.puppeteerSimplePage.getHtml();
        // this.html = html;
        // if(!this.html){
        //     debugger;
        // }
        // return this.html;
        return html;
    }

    /**
     * Shuts down the page(tab) instance.
     */
    async close() {
        try {
            await this.puppeteerSimplePage.close()
        } catch (error) {
            console.log('error closing puppeteerSimplePage caught in SPA_Page')
            // process.kill()
            // debugger;
            // throw error;
        }

    }


}

class CustomError extends Error {
    // debugger;
    constructor({ code, response, message, errno }) {
        super(message)
        // this.config = config;//The config object of the failing request
        this.errno = errno//Error constant. Will be set Only in the case of network errors.
        this.code = code;//http code.Null if network error
        this.response = response//Reference to the customResponse. Will not be set in network errors.
    }
}

module.exports = SPA_Page;