# Stock Predictor

Hosted at [spy.lokeel.com](http://spy.lokeel.com).

Hobby project implementing machine learning techniques to process text data in order to predict stock price movements. 

The project reads The Daily Trends Newsletter Published by [Google Trends](https://trends.google.com/trends/) via Gmail API. The text contents of the newsletter is processed in the following ways:
* Embeedings are generated using OpenAI's Text Embedding's API. 
* Converted to a Word Vector and then a [TfidfTransformer](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfTransformer.html) is applied to perform feature extraction.

Each of the above methods is then used to train a model using stock data from [SPY](https://www.wealthsimple.com/en-ca/quote/nyse/spy) ETF.

## Infrastructure
Github Actions are used to provide compute for this project with a cron workflow being used check for new newsletters and then generate predictions.

Cloudflare pages are being used to host a static webapp with the updated prediction data. Historical predictions are bundled in the static webapp and loaded into IndexedDB.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on dev setup and submitting pull requests.