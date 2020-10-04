
const Operation = require('../operations/Operation');
// const Adapter = require('./Adapter')



class ScrollToBottom extends Operation {
    constructor(config = { numRepetitions: 1, delay: 0 }) {
        super(config)
        // this.scraper = null;
        // this.puppeteerSimplePage = null;
        this.operations = [];

    }



    injectScraper(ScraperInstance) {//Override the original init function of Operation
        this.scraper = ScraperInstance;
        // debugger;
        ScraperInstance.registerOperation(this);
        for (let operation of this.operations) {
            operation.injectScraper(ScraperInstance);
        }

        // this.validateOperationArguments();

    }



    addOperation(operation) {

        this.operations.push(operation);
    }

    async scrapeChildren(puppeteerSimplePage) {
        // debugger;
        const { url } = puppeteerSimplePage
        const html = await puppeteerSimplePage.getHtml()
        const scrapedData = []
        for (let operation of this.operations) {
            const dataFromChild = await operation.scrape({ html, url }, puppeteerSimplePage);

            scrapedData.push(dataFromChild);
        }

        return scrapedData;

    }

    async processOneIteration(puppeteerSimplePage) {

        try {
            var dataFromChildren = [];
            await puppeteerSimplePage.scrollToBottom({ numRepetitions: 1, delay: this.config.delay });
            dataFromChildren = await this.scrapeChildren(puppeteerSimplePage)
        } catch (error) {
            const errorString = `There was an error scrolling down:, ${puppeteerSimplePage.url}, ${error}`
            this.errors.push(errorString);
            this.handleFailedScrapingIteration(errorString);
        } finally {
            return dataFromChildren;
        }



    }

    /**
     * The first parameter is not actually used. It's here to conform with the Operation.scrape() interface.    
     * @param {*} puppeteerSimplePage 
     */
    async scrape({ html, url }, puppeteerSimplePage) {

        const iterations = []
        // this.puppeteerSimplePage = puppeteerSimplePage;
        const { numRepetitions } = this.config;
        for (let i = 0; i < numRepetitions; i++) {
            // debugger;
            // await puppeteerSimplePage.scrollToBottom({numRepetitions:1,delay});    
            const dataFromIteration = await this.processOneIteration(puppeteerSimplePage);
            // debugger;
            iterations.push(dataFromIteration);
        }

        this.data.push(...iterations)
        debugger;
        return { type: this.constructor.name, name: this.config.name, data: iterations };
        // await puppeteerSimplePage.scrollToBottom({numRepetitions,delay});
    }

    validateOperationArguments() {

    }


}



module.exports = ScrollToBottom;