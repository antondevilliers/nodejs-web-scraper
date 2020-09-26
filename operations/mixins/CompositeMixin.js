const { CustomResponse } = require('../../request/request')//For jsdoc

/**
 * Used by composite operations(operations that contain other operations)
 * @mixin
 */
const CompositeMixin = {

  injectScraper: function (ScraperInstance) {//Override the original init function of Operation
    this.scraper = ScraperInstance;
    ScraperInstance.registerOperation(this);
    for (let operation of this.operations) {
      operation.injectScraper(ScraperInstance);
    }

    this.validateOperationArguments();

  },



  _addOperation: function (operationObject) {//Adds a reference to an operation object     

    let next = Object.getPrototypeOf(operationObject);

    while (next.constructor.name !== "Object") {
      if (next.constructor.name === 'Operation') {
        this.operations.push(operationObject)
        return;
      }

      next = Object.getPrototypeOf(next);
    }
    throw 'Child operation must be of type Operation! Check your "addOperation" calls.'

  },

  /**
   * 
   * @param {Operation[]} childOperations 
   * @param {*} passedData 
   * @param {CustomResponse} responseObjectFromParent 
   * @return {Promise<[]>} scrapedData
   */
  scrapeChildren: async function (childOperations, passedData, responseObjectFromParent) {//Scrapes the child operations of this OpenLinks object.


    const scrapedData = []
    for (let operation of this.operations) {
      const dataFromChild = await operation.scrape(responseObjectFromParent);

      scrapedData.push(dataFromChild);
    }
    // responseObjectFromParent = null;
    return scrapedData;
  }

};


module.exports = CompositeMixin;