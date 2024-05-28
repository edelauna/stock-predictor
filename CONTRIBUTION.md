# Contributing

First off, thanks for taking the time to contribute! ❤️

## I Have a Question

> If you want to ask a question, bug report, feature enhancement, etc:

- Open an [Issue](/issues/new).
- Provide as much context as you can.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

## I Want To Contribute

> ### Legal Notice 
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

### Development Setup
Project is composed of python scripts and a react front-end.

#### Python
Install the required dependencies
* `pip install -r scripts/requirements.txt`

A `launch.json` file is included in this project to make debugging via vscode easier.

There are also some Jupyter Notebooks and test data provided in `docs`. These notebooks can be used to locally tweak or test out new models or parameters. 

#### React (NodeJS)
Navigate into the `view` folder and install the necessary dependancies:
```
cd view
npm i
```
You can start a local server by running `npm start`

There is (at the time of writing) one jest test, you can run `npm test` which will initiate a watcher to re-run tests on changes. (I didn't include any component tests, because I'm thinking I'd really like to implement some Storybook interaction tests if I have the time.)