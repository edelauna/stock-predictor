# Stock Predictor

Hosted at [spy.lokeel.com](http://spy.lokeel.com).

Hobby project implementing machine learning techniques to process text data in order to predict stock price movements. 

The project reads The Daily Trends Newsletter Published by [Google Trends](https://trends.google.com/trends/) via Gmail API. The text contents of the newsletter is processed in the following ways:
* Embeddings are generated using OpenAI's Text Embedding's API. 
* Text is converted to a Word Vector and then a [TfidfTransformer](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfTransformer.html) is applied to perform feature extraction.

Each of the above methods is then used to train a model on predicting the next business day's (T+1) possible high's and low's based on the stock price at the time the newletter was received. The stock being evaluated is [SPY](https://www.wealthsimple.com/en-ca/quote/nyse/spy) ETF.

## Infrastructure
Github Actions are used to provide compute for this project with a cron workflow being used to check for new newsletters and then generate predictions, as well as evaluate the results of the prediction after market extended hours.

Cloudflare pages are being used to host static files. Predictions and historical results are bundled into the static webapp and then loaded into IndexedDB in the browser. 

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on dev setup and submitting pull requests.